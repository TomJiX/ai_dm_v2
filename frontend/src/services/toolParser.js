/**
 * Tool Parser
 * Extracts tool calls from AI responses and cleans narrative text
 */

/**
 * Parse AI response for tool calls
 * Format expected:
 * TOOL_CALL: tool_name
 * ARGUMENTS: {json_args}
 * 
 * @param {string} aiResponse - Raw AI response text
 * @returns {array} - Array of {tool, args} objects
 */
export function parseToolCalls(aiResponse) {
  const toolCalls = [];
  const lines = aiResponse.split('\n');

  const stripCodeFences = (s) => {
    const trimmed = s.trim();
    if (trimmed.startsWith('```')) {
      return trimmed.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
    }
    return trimmed;
  };

  const sanitizeToJSON = (s) => {
    let x = stripCodeFences(s)
      // Quote unquoted keys
      .replace(/([\{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
      // Replace single quotes with double quotes
      .replace(/'(.*?)'/g, '"$1"')
      // Remove trailing commas
      .replace(/,(?=\s*[}\]])/g, '')
      // Remove + from numbers like +3
      .replace(/:\s*\+(\d+(?:\.\d+)?)/g, ': $1')
      // undefined/NaN -> null
      .replace(/\bundefined\b/g, 'null')
      .replace(/\bNaN\b/g, 'null');
    return x;
  };

  const tryParseArgs = (raw) => {
    const direct = stripCodeFences(raw).trim();
    try {
      return JSON.parse(direct);
    } catch {}
    try {
      const fixed = sanitizeToJSON(raw);
      return JSON.parse(fixed);
    } catch (e) {
      console.error(`Failed to parse tool arguments: ${e.message}`);
      return null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('TOOL_CALL:')) {
      const toolName = line.substring('TOOL_CALL:'.length).trim();
      let argsRaw = '';
      // Collect following lines that belong to ARGUMENTS block (can be multi-line)
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('ARGUMENTS:')) {
        let argLine = lines[i + 1].trim();
        argsRaw = argLine.substring('ARGUMENTS:'.length).trim();
        let j = i + 2;
        // If the args likely span multiple lines (no closing brace/bracket yet), accumulate
        const opens = (s) => (s.match(/[\[\{]/g) || []).length;
        const closes = (s) => (s.match(/[\]\}]/g) || []).length;
        let balance = opens(argsRaw) - closes(argsRaw);
        while (j < lines.length && balance > 0) {
          const nxt = lines[j];
          if (nxt.trim().startsWith('TOOL_CALL:')) break;
          argsRaw += '\n' + nxt;
          balance += opens(nxt) - closes(nxt);
          j++;
        }
        // Attempt to parse
        const args = tryParseArgs(argsRaw);
        if (args !== null) {
          toolCalls.push({ tool: toolName, args });
        }
      }
    }
  }

  return toolCalls;
}

/**
 * Extract clean narrative text (remove tool call syntax)
 * @param {string} aiResponse - Raw AI response
 * @returns {string} - Clean narrative text
 */
export function extractNarrative(aiResponse) {
  // Remove TOOL_CALL and ARGUMENTS lines
  let narrative = aiResponse
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('TOOL_CALL:') && 
             !trimmed.startsWith('ARGUMENTS:');
    })
    .join('\n')
    .trim();
  
  // Remove multiple consecutive blank lines
  narrative = narrative.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return narrative;
}

/**
 * Check if response contains tool calls
 * @param {string} aiResponse - AI response text
 * @returns {boolean} - True if tool calls found
 */
export function hasToolCalls(aiResponse) {
  return aiResponse.includes('TOOL_CALL:');
}

/**
 * Split response into narrative chunks and tool calls
 * Useful for streaming/progressive display
 * @param {string} aiResponse - AI response
 * @returns {array} - Array of {type: 'narrative'|'tool', content: ...}
 */
export function splitResponse(aiResponse) {
  const parts = [];
  const lines = aiResponse.split('\n');
  let currentNarrative = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('TOOL_CALL:')) {
      // Save accumulated narrative
      if (currentNarrative.trim()) {
        parts.push({
          type: 'narrative',
          content: currentNarrative.trim()
        });
        currentNarrative = '';
      }
      
      // Parse tool call
      const toolName = line.substring(line.indexOf(':') + 1).trim();
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('ARGUMENTS:')) {
        try {
          const argsString = lines[i + 1].substring(lines[i + 1].indexOf(':') + 1).trim();
          const args = JSON.parse(argsString);
          
          parts.push({
            type: 'tool',
            tool: toolName,
            args: args
          });
          
          i++; // Skip arguments line
        } catch (error) {
          console.error('Failed to parse tool:', error);
        }
      }
    } else {
      currentNarrative += line + '\n';
    }
  }
  
  // Add remaining narrative
  if (currentNarrative.trim()) {
    parts.push({
      type: 'narrative',
      content: currentNarrative.trim()
    });
  }
  
  return parts;
}
