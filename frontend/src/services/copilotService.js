/**
 * GitHub Models API Service (Azure)
 * Handles communication with GitHub Models via Azure endpoint for narrative generation
 */

import OpenAI from 'openai';

const githubModels = new OpenAI({
  apiKey: import.meta.env.VITE_GITHUB_TOKEN,
  baseURL: 'https://models.inference.ai.azure.com',
  dangerouslyAllowBrowser: true
});

/**
 * Generate DM response using GPT-4
 * @param {string} systemPrompt - System context
 * @param {string} userPrompt - User action/request
 * @param {number} temperature - Creativity (0-1)
 * @returns {Promise<string>} - AI generated response
 */
export async function generateDMResponse(systemPrompt, userPrompt, temperature = 0.7) {
  try {
    const response = await githubModels.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('GitHub Models API Error:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid GitHub token. Please check your .env.local file.');
    }
    
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Stream DM response for real-time feedback
 * @param {string} systemPrompt - System context
 * @param {string} userPrompt - User action
 * @param {function} onChunk - Callback for each text chunk
 * @returns {Promise<string>} - Complete response
 */
export async function streamDMResponse(systemPrompt, userPrompt, onChunk) {
  try {
    const stream = await githubModels.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true
    });
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error('GitHub Models Streaming Error:', error);
    throw new Error(`AI streaming error: ${error.message}`);
  }
}
