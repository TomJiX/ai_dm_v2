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
import { Save, Upload, RotateCcw, Download, UploadCloud } from 'lucide-react';
import { saveService } from './services/saveService';

function App() {
  const [showCharCreation, setShowCharCreation] = useState(true);
  const [messages, setMessages] = useState([]);
  const [playerState, setPlayerState] = useState(null);
  const [currentScene, setCurrentScene] = useState('start');
  const [isThinking, setIsThinking] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const hasInitialized = useRef(false);
  const restoredOnLoad = useRef(false);
  
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

  // Try to auto-load a quicksave on first mount
  useEffect(() => {
    if (restoredOnLoad.current) return;
    restoredOnLoad.current = true;
    try {
      const res = saveService.load();
      if (res.success && res.data) {
        const { playerState: ps, messages: msgs, currentScene: scene } = res.data;
        // Restore local React state
        setPlayerState(ps);
        setMessages(msgs || []);
        setCurrentScene(scene || 'start');
        setShowCharCreation(false);
        // Also prime MCP state
        mcpClient.callTool('save_state', { key: 'player', value: ps });
        hasInitialized.current = true; // skip opening scene
        addMessage({ type: 'system', content: '📂 Quicksave auto-loaded.' });
        return;
      }
    } catch {}
    // Fallback: try loading a project save from /saves/autoload.json if present
    (async () => {
      try {
        const resp = await fetch('/saves/autoload.json', { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.playerState) {
            await mcpClient.callTool('save_state', { key: 'player', value: data.playerState });
            setPlayerState(data.playerState);
            setMessages(data.messages || []);
            setCurrentScene(data.currentScene || 'start');
            setShowCharCreation(false);
            hasInitialized.current = true;
            addMessage({ type: 'system', content: '📂 Project save loaded (saves/autoload.json).' });
          }
        }
      } catch {}
    })();
  }, []);
  
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
  
  // === Skill trigger rules and helpers ===
  const SKILL_RULES = [
    { skill: 'Athletics', ability: 'str', keywords: ['climb', 'jump', 'swim', 'grapple', 'shove'] },
    { skill: 'Acrobatics', ability: 'dex', keywords: ['balance', 'tumble', 'flip', 'dodge', 'roll'] },
    { skill: 'Stealth', ability: 'dex', keywords: ['sneak', 'creep', 'tiptoe', 'hide', 'skulk'] },
    { skill: 'Sleight of Hand', ability: 'dex', keywords: ['pickpocket', 'palm', 'plant', 'steal', 'filch'] },
    { skill: 'Perception', ability: 'wis', keywords: ['notice', 'spot', 'listen', 'scan', 'observe'] },
    { skill: 'Insight', ability: 'wis', keywords: ['insight', 'read', 'motive', 'discern', 'sense motive'] },
    { skill: 'Survival', ability: 'wis', keywords: ['track', 'forage', 'navigate', 'hunt', 'camp'] },
    { skill: 'Investigation', ability: 'int', keywords: ['investigate', 'examine', 'inspect', 'analyze', 'search'] },
    { skill: 'Arcana', ability: 'int', keywords: ['arcana', 'magic', 'spellcraft', 'occult', 'magical lore'] },
    { skill: 'History', ability: 'int', keywords: ['history', 'recall lore', 'chronicle', 'historical', 'ancestry'] },
    { skill: 'Nature', ability: 'int', keywords: ['nature', 'wilds', 'flora', 'fauna', 'geography'] },
    { skill: 'Religion', ability: 'int', keywords: ['religion', 'deity', 'ritual', 'prayer', 'divinity'] },
    { skill: 'Medicine', ability: 'wis', keywords: ['treat', 'heal', 'diagnose', 'first aid', 'bandage'] },
    { skill: 'Deception', ability: 'cha', keywords: ['deceive', 'lie', 'bluff', 'trick', 'con'] },
    { skill: 'Persuasion', ability: 'cha', keywords: ['persuade', 'convince', 'negotiate', 'appeal', 'entreat'] },
    { skill: 'Intimidation', ability: 'cha', keywords: ['intimidate', 'threaten', 'coerce', 'menace', 'bully'] },
    { skill: 'Performance', ability: 'cha', keywords: ['perform', 'sing', 'play', 'act', 'dance'] }
  ];

  function getAbilityScore(ability) {
    if (!playerState?.stats) return 10;
    const s = playerState.stats;
    // Support both short and long keys
    switch (ability) {
      case 'str': return s.str ?? s.strength ?? 10;
      case 'dex': return s.dex ?? s.dexterity ?? 10;
      case 'con': return s.con ?? s.constitution ?? 10;
      case 'int': return s.int ?? s.intelligence ?? 10;
      case 'wis': return s.wis ?? s.wisdom ?? 10;
      case 'cha': return s.cha ?? s.charisma ?? 10;
      default: return 10;
    }
  }

  function getAbilityModifier(ability) {
    const score = getAbilityScore(ability);
    return Math.floor((score - 10) / 2);
  }

  function parseSkillIntent(text) {
    const t = text.toLowerCase();
    // prefer multi-word phrases by checking each keyword via regex word boundaries
    for (const rule of SKILL_RULES) {
      for (const kw of rule.keywords) {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\b${escaped}\\b`);
        if (pattern.test(t)) {
          const mod = getAbilityModifier(rule.ability);
          return { skill: rule.skill, ability: rule.ability, mod };
        }
      }
    }
    return null;
  }

  // Parser to detect item usage anywhere in the sentence (e.g., "I grab my rope...")
  function parseUseIntent(text) {
    const useVerbs = [
      'use', 'pull out', 'draw',
      'drink', 'quaff', 'equip', 'don', 'wield',
      'eat', 'chew', 'read', 'light', 'ignite', 'strike',
      'apply', 'smear', 'throw', 'toss', 'hurl'
    ];
    const obtainVerbs = ['take', 'grab', 'pick up', 'collect', 'snatch'];

    const lower = text.toLowerCase();
    const normalized = lower
      .replace(/\b(the|a|an|my|some)\b/g, ' ')
      .replace(/[^a-z0-9\s\-']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Stage A: direct verb + item phrase anywhere in the sentence
    for (const v of useVerbs) {
      const re = new RegExp(`\\b${escape(v)}\\b\\s+(?:the|a|an|my|some)?\\s*([^,.!?;]*)`, 'i');
      const m = normalized.match(re);
      if (m && m[1]) {
        const candidate = m[1].replace(/\b(and|then|across|into|onto|with|at|to|from)\b.*$/i, '').trim();
        if (candidate) return { verb: v, item: candidate, action: 'use' };
      }
    }
    for (const v of obtainVerbs) {
      const re = new RegExp(`\\b${escape(v)}\\b\\s+(?:the|a|an|my|some)?\\s*([^,.!?;]*)`, 'i');
      const m = normalized.match(re);
      if (m && m[1]) {
        const candidate = m[1].replace(/\b(and|then|across|into|onto|with|at|to|from)\b.*$/i, '').trim();
        if (candidate) return { verb: v, item: candidate, action: 'obtain' };
      }
    }

    // Stage B: if any relevant verb exists and an inventory item name appears, infer usage of an owned item
    const anyVerb = [...useVerbs, ...obtainVerbs].some(v => new RegExp(`\\b${escape(v)}\\b`, 'i').test(normalized));
    if (anyVerb && playerState?.inventory?.length) {
      const textTokens = normalized;
      let bestMatch = null;
      for (const it of playerState.inventory) {
        const display = typeof it === 'string' ? it : (it.name || '');
        const normName = sanitizeItemName(display);
        if (normName && textTokens.includes(normName)) {
          bestMatch = { verb: 'use', item: display, action: 'use' };
          break;
        }
        const firstWord = normName.split(' ')[0];
        if (firstWord && textTokens.includes(firstWord) && firstWord.length >= 3) {
          bestMatch = { verb: 'use', item: display, action: 'use' };
          break;
        }
      }
      if (bestMatch) return bestMatch;
    }

    return null;
  }

  function sanitizeItemName(name) {
    // Normalize, drop parentheticals and counts, punctuation, and numbers
    return name
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ') // remove anything in parentheses
      .replace(/x\d+$/,' ')
      .replace(/\d+/g,' ') // drop digits like (50 ft) -> ' ft'
      .replace(/[^a-z\s\-']/g,' ')
      .replace(/\b(the|a|an|my|some)\b/g, ' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function findInventoryItem(itemName) {
    if (!playerState || !playerState.inventory) return null;
    const target = sanitizeItemName(itemName);
    for (const it of playerState.inventory) {
      const name = typeof it === 'string' ? it : (it.name || '');
      const norm = sanitizeItemName(name);
      if (norm === target) return it;
      // allow partial includes if target is substring
      if (norm.includes(target) || target.includes(norm)) return it;
    }
    return null;
  }

  async function handleUserAction(input) {
    try {
      // Pre-check for item usage intent and validate inventory
      const intent = parseUseIntent(input);
      let inputForAI = input;
      if (intent) {
        if (intent.action === 'use') {
          const found = findInventoryItem(intent.item);
          if (!found) {
            addMessage({
              type: 'system',
              content: `You don't have "${intent.item}" in your inventory.`
            });
            return; // do not send to AI
          }
          const displayName = typeof found === 'string' ? found : (found.name || intent.item);
          inputForAI = `${inputForAI}\n[action: use_item: ${displayName}]`;
        } else if (intent.action === 'obtain') {
          // Do not block; this refers to taking something from the world
          inputForAI = `${inputForAI}\n[action: obtain_item: ${intent.item}]`;
        }
      }

      // Skill intent detection (works alongside item usage if both are present)
      const skill = parseSkillIntent(input);
      if (skill) {
        const signed = skill.mod >= 0 ? `+${skill.mod}` : `${skill.mod}`;
        inputForAI = `${inputForAI}\n[action: skill_check: ${skill.skill} | ability: ${skill.ability.toUpperCase()} | mod: ${signed}]`;
      }

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
        inputForAI
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

  function quickSave() {
    const saveData = {
      playerState,
      messages: messages.slice(-20),
      currentScene,
      timestamp: Date.now()
    };
    const res = saveService.save(saveData);
    addMessage({ type: res.success ? 'system' : 'error', content: res.success ? '💾 Quicksaved.' : `Save failed: ${res.error}` });
  }

  async function quickLoad() {
    const res = saveService.load();
    if (!res.success) {
      addMessage({ type: 'system', content: 'No quicksave found.' });
      return;
    }
    const saveData = res.data;
    await mcpClient.callTool('save_state', { key: 'player', value: saveData.playerState });
    setPlayerState(saveData.playerState);
    setMessages(saveData.messages || []);
    setCurrentScene(saveData.currentScene || 'start');
    setShowCharCreation(false);
    hasInitialized.current = true;
    addMessage({ type: 'system', content: '📂 Quicksave loaded.' });
  }

  function newGame() {
    saveService.clear();
    setMessages([]);
    setPlayerState(null);
    setCurrentScene('start');
    setShowCharCreation(true);
    hasInitialized.current = false;
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
              onClick={quickSave}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-3 py-2 rounded-lg transition shadow-lg hover:shadow-emerald-500/50"
              title="Quick Save"
            >
              <Save size={18} />
              <span className="hidden sm:inline font-semibold">Quick Save</span>
            </button>
            <button
              onClick={quickLoad}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3 py-2 rounded-lg transition shadow-lg hover:shadow-cyan-500/50"
              title="Quick Load"
            >
              <Download size={18} />
              <span className="hidden sm:inline font-semibold">Quick Load</span>
            </button>
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
            <button
              onClick={newGame}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white px-3 py-2 rounded-lg transition shadow-lg"
              title="New Game"
            >
              <RotateCcw size={18} />
              <span className="hidden sm:inline font-semibold">New</span>
            </button>
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
