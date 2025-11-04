import { useState, useEffect } from 'react';
import DialogueWindow from './components/DialogueWindow';
import CharacterTab from './components/CharacterTab';
import InventoryTab from './components/InventoryTab';
import TabNavigation from './components/TabNavigation';
import { initialPlayerState } from './data/initialState';
import scenario from './data/goblin-cave.json';
import { mcpClient } from './services/mcpClient';
import { generateDMResponse } from './services/copilotService';
import { buildDMPrompt, buildOpeningPrompt, buildToolResultsPrompt } from './services/promptBuilder';
import { parseToolCalls, extractNarrative } from './services/toolParser';
import { Save, Upload } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([]);
  const [playerState, setPlayerState] = useState(null);
  const [currentScene, setCurrentScene] = useState('start');
  const [activeTab, setActiveTab] = useState('character');
  const [isThinking, setIsThinking] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  
  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);
  
  async function initializeGame() {
    try {
      // Initialize player state
      await mcpClient.callTool('initialize_player', {
        name: initialPlayerState.name,
        class: initialPlayerState.class,
        level: initialPlayerState.level,
        maxHp: initialPlayerState.hp.max,
        ac: initialPlayerState.ac,
        stats: initialPlayerState.stats,
        inventory: initialPlayerState.inventory
      });
      
      // Load player state
      const stateResult = await mcpClient.callTool('load_state', { key: 'player' });
      setPlayerState(stateResult.value);
      
      // Generate opening scene
      setIsThinking(true);
      const startScene = scenario.scenes.start;
      const { systemPrompt, userPrompt } = buildOpeningPrompt(scenario, startScene);
      const opening = await generateDMResponse(systemPrompt, userPrompt);
      
      addMessage({
        role: 'assistant',
        type: 'narrative',
        content: opening
      });
      
      updateQuickActions(startScene);
      setIsThinking(false);
    } catch (error) {
      console.error('Game initialization error:', error);
      addMessage({
        type: 'error',
        content: `Failed to start game: ${error.message}`
      });
      setIsThinking(false);
    }
  }
  
  function addMessage(message) {
    setMessages(prev => [...prev, {
      ...message,
      id: Date.now() + Math.random()
    }]);
  }
  
  function updateQuickActions(scene) {
    const actions = ['Look around'];
    
    if (scene.npcs && scene.npcs.length > 0) {
      actions.push(`Talk to ${scene.npcs[0].name}`);
    }
    
    if (scene.exits && scene.exits.length > 0) {
      const firstExit = scene.exits[0].replace(/_/g, ' ');
      actions.push(`Go to ${firstExit}`);
    }
    
    if (scene.skill_checks && scene.skill_checks.length > 0) {
      actions.push(`${scene.skill_checks[0].skill} check`);
    }
    
    setQuickActions(actions);
  }
  
  async function handleUserAction(input) {
    try {
      // Add user message
      addMessage({ role: 'user', content: input });
      setIsThinking(true);
      
      // Get current scene
      const scene = scenario.scenes[currentScene] || scenario.scenes.start;
      
      // Build prompt with full context
      const { systemPrompt, userPrompt } = buildDMPrompt(
        scenario,
        scene,
        playerState,
        messages.slice(-10),
        input
      );
      
      // Get AI response
      let aiResponse = await generateDMResponse(systemPrompt, userPrompt);
      
      // Parse for tool calls
      const toolCalls = parseToolCalls(aiResponse);
      
      // Execute tools if any
      if (toolCalls.length > 0) {
        const toolResults = await executeTools(toolCalls);
        
        // Send results back to AI for narrative
        const resultPrompt = buildToolResultsPrompt(toolResults);
        aiResponse = await generateDMResponse(systemPrompt, resultPrompt);
      }
      
      // Extract clean narrative
      const narrative = extractNarrative(aiResponse);
      
      // Display response
      if (narrative.trim()) {
        addMessage({
          role: 'assistant',
          type: 'narrative',
          content: narrative
        });
      }
      
      // Refresh player state
      await syncState();
      
      setIsThinking(false);
    } catch (error) {
      console.error('Action handling error:', error);
      addMessage({
        type: 'error',
        content: error.message || 'Something went wrong. Please try again.'
      });
      setIsThinking(false);
    }
  }
  
  async function executeTools(toolCalls) {
    const results = [];
    
    for (const call of toolCalls) {
      try {
        const result = await mcpClient.callTool(call.tool, call.args);
        
        results.push({
          tool: call.tool,
          args: call.args,
          result: result
        });
        
        // Display special messages for certain tools
        if (call.tool === 'roll_dice' || call.tool === 'roll_with_advantage' || call.tool === 'roll_with_disadvantage') {
          addMessage({
            type: 'dice',
            data: result
          });
        }
        
        if (call.tool === 'resolve_attack') {
          const combatText = formatCombatResult(result);
          addMessage({
            type: 'combat',
            content: combatText
          });
        }
        
        if (call.tool === 'apply_damage' || call.tool === 'apply_healing') {
          addMessage({
            type: 'system',
            content: result.message
          });
        }
        
      } catch (error) {
        console.error(`Tool ${call.tool} failed:`, error);
        results.push({
          tool: call.tool,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  function formatCombatResult(result) {
    if (result.critical) {
      return `🌟 CRITICAL HIT! Attack roll: ${result.attackRoll} (natural 20) + ${result.attackBonus} = ${result.totalAttack} vs AC ${result.targetAC}.\nDamage: ${result.damageBreakdown}`;
    }
    
    if (result.criticalMiss) {
      return `❌ CRITICAL MISS! Rolled a natural 1. The attack fails completely!`;
    }
    
    if (result.hit) {
      return `⚔️ HIT! Attack roll: ${result.attackRoll} + ${result.attackBonus} = ${result.totalAttack} vs AC ${result.targetAC}.\nDamage: ${result.damageBreakdown}`;
    }
    
    return `❌ MISS! Attack roll: ${result.totalAttack} vs AC ${result.targetAC}. The attack fails to connect.`;
  }
  
  async function syncState() {
    try {
      const stateResult = await mcpClient.callTool('load_state', { key: 'player' });
      if (stateResult.success && stateResult.value) {
        setPlayerState(stateResult.value);
        
        if (stateResult.value.hp.current <= 0) {
          addMessage({
            type: 'system',
            content: '💀 You have fallen unconscious! Make death saving throws or receive healing!'
          });
        }
      }
    } catch (error) {
      console.error('State sync error:', error);
    }
  }
  
  function handleUseItem(item) {
    handleUserAction(`I use ${item}`);
  }
  
  function saveGame() {
    const saveData = {
      playerState,
      messages: messages.slice(-20),
      currentScene,
      timestamp: Date.now()
    };
    
    const json = JSON.stringify(saveData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-dm-save-${Date.now()}.json`;
    a.click();
    
    addMessage({
      type: 'system',
      content: '💾 Game saved!'
    });
  }
  
  async function loadGame(file) {
    try {
      const text = await file.text();
      const saveData = JSON.parse(text);
      
      await mcpClient.callTool('save_state', {
        key: 'player',
        value: saveData.playerState
      });
      
      setPlayerState(saveData.playerState);
      setMessages(saveData.messages);
      setCurrentScene(saveData.currentScene);
      
      addMessage({
        type: 'system',
        content: '📂 Game loaded!'
      });
    } catch (error) {
      addMessage({
        type: 'error',
        content: `Failed to load save: ${error.message}`
      });
    }
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">⚔️ AI Dungeon Master</h1>
            <p className="text-sm text-gray-400">{scenario.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveGame}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
              title="Save Game"
            >
              <Save size={18} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <label className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer transition">
              <Upload size={18} />
              <span className="hidden sm:inline">Load</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => e.target.files[0] && loadGame(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="md:hidden flex flex-col h-full">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex-1 py-3 ${activeTab === 'dialogue' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
            >
              💬 Game
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 ${activeTab === 'info' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
            >
              📋 Info
            </button>
          </div>
          
          {activeTab === 'dialogue' && (
            <div className="flex-1 overflow-hidden">
              <DialogueWindow
                messages={messages}
                onSendMessage={handleUserAction}
                isThinking={isThinking}
                quickActions={quickActions}
              />
            </div>
          )}
          
          {activeTab === 'info' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <TabNavigation activeTab={activeTab === 'info' ? 'character' : activeTab} onChange={setActiveTab} />
              <div className="flex-1 overflow-hidden">
                {activeTab === 'character' && <CharacterTab player={playerState} />}
                {activeTab === 'inventory' && <InventoryTab player={playerState} onUseItem={handleUseItem} />}
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex md:flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <DialogueWindow
              messages={messages}
              onSendMessage={handleUserAction}
              isThinking={isThinking}
              quickActions={quickActions}
            />
          </div>
          
          <div className="w-96 border-l border-gray-700 flex flex-col overflow-hidden">
            <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
            <div className="flex-1 overflow-hidden">
              {activeTab === 'character' && <CharacterTab player={playerState} />}
              {activeTab === 'inventory' && <InventoryTab player={playerState} onUseItem={handleUseItem} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
