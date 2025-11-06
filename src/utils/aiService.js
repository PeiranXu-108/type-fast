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

/**
 * Generate text with Doubao API
 * @param {string} topic - The topic for text generation
 * @param {number} wordCount - Approximate word count
 * @param {Object} options - Optional parameters
 * @param {Function} options.onChunk - Callback for streaming chunks (optional)
 * @param {Function} options.onComplete - Callback when streaming completes (optional)
 * @param {AbortSignal} options.signal - AbortSignal for cancellation (optional)
 * @returns {Promise<string>} Generated text (full text when not streaming)
 */
export async function generateTextWithDoubao(topic, wordCount, options = {}) {
  const { onChunk, onComplete, signal } = options

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
    
    const requestBody = {
      model: 'doubao-seed-1-6-lite-251015',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(Math.max(wordCount * 6, 500), 32768)
    }

    // Enable streaming if onChunk callback is provided
    if (onChunk) {
      requestBody.stream = true
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `API request failed with status ${response.status}`
      )
    }

    // Handle streaming response
    if (onChunk && response.body) {
      return await handleStreamResponse(response, onChunk, onComplete)
    }

    // Handle non-streaming response
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

/**
 * Handle streaming response from Doubao API
 * @param {Response} response - Fetch response object
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onComplete - Callback when stream completes
 * @returns {Promise<string>} Complete generated text
 */
async function handleStreamResponse(response, onChunk, onComplete) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      // Split by lines (SSE format uses \n\n as delimiter)
      const lines = buffer.split('\n')
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith(':')) {
          continue
        }

        // Parse SSE data format: "data: {...}"
        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6)
          
          // Check for stream end signal
          if (dataStr === '[DONE]') {
            continue
          }

          try {
            const data = JSON.parse(dataStr)
            const content = data.choices?.[0]?.delta?.content || ''
            
            if (content) {
              fullText += content
              onChunk(content, fullText)
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', dataStr, e)
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const trimmedLine = buffer.trim()
      if (trimmedLine.startsWith('data: ')) {
        const dataStr = trimmedLine.slice(6)
        if (dataStr !== '[DONE]') {
          try {
            const data = JSON.parse(dataStr)
            const content = data.choices?.[0]?.delta?.content || ''
            if (content) {
              fullText += content
              onChunk(content, fullText)
            }
          } catch (e) {
            console.warn('Failed to parse final SSE data:', dataStr, e)
          }
        }
      }
    }

    const cleanedText = fullText
      .trim()
      .replace(/\n{3,}/g, '\n\n')

    if (onComplete) {
      onComplete(cleanedText)
    }

    return cleanedText
  } catch (error) {
    console.error('Error reading stream:', error)
    throw error
  } finally {
    reader.releaseLock()
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

