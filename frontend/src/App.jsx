import { useState, useEffect, useRef } from 'react';
import CharacterCreation from './components/CharacterCreation';
import DialogueWindow from './components/DialogueWindow';
import CharacterTab from './components/CharacterTab';
import InventoryTab from './components/InventoryTab';
import scenario from './data/goblin-cave.json';
import { mcpClient } from './services/mcpClient';
import { generateDMResponse } from './services/copilotService';
import { buildDMPrompt, buildOpeningPrompt, buildToolResultsPrompt } from './services/promptBuilder';
import { parseToolCalls, extractNarrative } from './services/toolParser';
import { Save, Upload } from 'lucide-react';

function App() {
  const [showCharCreation, setShowCharCreation] = useState(true);
  const [messages, setMessages] = useState([]);
  const [playerState, setPlayerState] = useState(null);
  const [currentScene, setCurrentScene] = useState('start');
  const [isThinking, setIsThinking] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const hasInitialized = useRef(false);
  
  async function handleCharacterCreated(character) {
    setShowCharCreation(false);
    setPlayerState(character);
    await initializeGame(character);
  }
  
  async function initializeGame(character) {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    try {
      // Initialize player state with created character
      await mcpClient.callTool('initialize_player', {
        name: character.name,
        class: character.class,
        level: character.level,
        maxHp: character.hp.max,
        ac: character.ac,
        stats: character.stats,
        inventory: character.inventory
      });
      
      // Generate opening scene
      setIsThinking(true);
      const startScene = scenario.scenes.start;
      const customizedPrompt = buildOpeningPrompt(scenario, startScene);
      const opening = await generateDMResponse(
        customizedPrompt.systemPrompt + `\n\nThe player's name is ${character.name}, a ${character.gender} ${character.race} ${character.class}.`,
        customizedPrompt.userPrompt
      );
      
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
  
  if (showCharCreation) {
    return <CharacterCreation onComplete={handleCharacterCreated} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-slate-800 to-blue-900 border-b border-purple-500/50 px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-lg animate-pulse">
              ⚔️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                AI Dungeon Master
              </h1>
              <p className="text-sm text-purple-400">{scenario.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveGame}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition shadow-lg hover:shadow-purple-500/50"
              title="Save Game"
            >
              <Save size={18} />
              <span className="hidden sm:inline font-semibold">Save</span>
            </button>
            <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg cursor-pointer transition shadow-lg hover:shadow-blue-500/50">
              <Upload size={18} />
              <span className="hidden sm:inline font-semibold">Load</span>
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
      
      {/* 3-Column Layout: Inventory | Chat | Character */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left: Inventory - Always visible on desktop */}
        <div className="w-80 xl:w-96 border-r-2 border-purple-600/30 bg-gradient-to-b from-purple-900/40 to-slate-900 flex-col shadow-2xl flex">
          <div className="px-4 py-4 bg-purple-800/60 border-b-2 border-purple-600/40">
            <h2 className="text-xl font-bold text-purple-200 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Inventory
            </h2>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <InventoryTab player={playerState} onUseItem={handleUseItem} />
          </div>
        </div>

        {/* Center: Chat */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900">
          <DialogueWindow
            messages={messages}
            onSendMessage={handleUserAction}
            isThinking={isThinking}
            quickActions={quickActions}
          />
        </div>

        {/* Right: Character Info - Always visible on desktop */}
        <div className="w-80 xl:w-96 border-l-2 border-blue-600/30 bg-gradient-to-b from-blue-900/40 to-slate-900 flex-col shadow-2xl flex">
          <div className="px-4 py-4 bg-blue-800/60 border-b-2 border-blue-600/40">
            <h2 className="text-xl font-bold text-blue-200 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              Character
            </h2>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <CharacterTab player={playerState} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
