/**
 * @returns {string} API Key
 */
function getApiKey() {
  const apiKey = import.meta.env.VITE_DOUBAO_API_KEY
  if (!apiKey) {
    throw new Error('API Key is not configured. Please set VITE_DOUBAO_API_KEY in .env file.')
  }
  return apiKey
}

export async function generateTextWithDoubao(topic, wordCount) {

  const API_URL = import.meta.env.DEV 
    ? '/api/doubao'
    : 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  
  const prompt = `Please generate an English practice text about "${topic}" with approximately ${wordCount} words. The text should be:
- Clear and well-structured
- Suitable for typing practice
- Written in natural English
- Appropriate for all skill levels

Generate only the text content, without any title or explanation.`

  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (!import.meta.env.DEV) {
      const apiKey = getApiKey()
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'doubao-seed-1-6-lite-251015',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: Math.min(Math.max(wordCount * 6, 500), 32768)
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `API request failed with status ${response.status}`
      )
    }

    const data = await response.json()
    
    const generatedText = data.choices?.[0]?.message?.content || ''
    
    if (!generatedText) {
      throw new Error('No text generated from API')
    }

    const cleanedText = generatedText
      .trim()
      .replace(/\n{3,}/g, '\n\n')
    
    return cleanedText
  } catch (error) {
    console.error('Error calling Doubao API:', error)
    throw error
  }
}

export function isApiKeyConfigured() {
  try {
    getApiKey()
    return true
  } catch {
    return false
  }
}

