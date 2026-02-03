/**
 * 游戏引擎
 * 处理游戏逻辑、文章选择、结果计算
 */

class GameEngine {
  constructor() {
    this.articles = {
      easy: [],
      medium: [],
      hard: []
    }
    this.loadArticles()
  }

  /**
   * 加载文章库
   */
  loadArticles() {
    // 简单难度
    this.articles.easy.push(
      {
        id: 'battle-easy-1',
        title: 'Simple Start',
        content: 'The quick brown fox jumps over the lazy dog. This is a simple typing test.',
        category: 'education',
        difficulty: 'easy',
        wordCount: 15
      },
      {
        id: 'battle-easy-2',
        title: 'Daily Life',
        content: 'Every morning I wake up early. I like to read books and drink coffee.',
        category: 'daily',
        difficulty: 'easy',
        wordCount: 16
      }
    )
    
    // 中等难度
    this.articles.medium.push(
      {
        id: 'battle-medium-1',
        title: 'The Art of Learning',
        content: 'Learning is a journey that never ends. Every day brings new opportunities to grow and improve. The key to success is consistency and dedication. Practice makes perfect, and persistence leads to mastery.',
        category: 'education',
        difficulty: 'medium',
        wordCount: 35
      },
      {
        id: 'battle-medium-2',
        title: 'Technology Today',
        content: 'Modern technology has transformed our daily lives. From smartphones to artificial intelligence, innovation continues to reshape the world. Understanding these changes helps us adapt and thrive in the digital age.',
        category: 'technology',
        difficulty: 'medium',
        wordCount: 34
      },
      {
        id: 'battle-medium-3',
        title: 'The Power of Persistence',
        content: 'Success is not final, failure is not fatal: it is the courage to continue that counts. Every great achievement was once considered impossible. The difference between the impossible and the possible lies in determination.',
        category: 'motivation',
        difficulty: 'medium',
        wordCount: 35
      }
    )
    
    // 困难难度
    this.articles.hard.push(
      {
        id: 'battle-hard-1',
        title: 'Innovation in Technology',
        content: 'Technology continues to evolve at an unprecedented pace. Innovation drives progress and shapes our future. Understanding emerging technologies is crucial for staying relevant in today\'s world. The intersection of artificial intelligence, machine learning, and data science creates endless possibilities for solving complex problems and improving human life.',
        category: 'technology',
        difficulty: 'hard',
        wordCount: 51
      },
      {
        id: 'battle-hard-2',
        title: 'The Future of Work',
        content: 'The workplace is undergoing a dramatic transformation. Remote work, automation, and digital collaboration tools are reshaping how we think about productivity and work-life balance. Organizations must adapt to these changes by fostering flexibility, embracing technology, and prioritizing employee well-being to remain competitive in the modern economy.',
        category: 'business',
        difficulty: 'hard',
        wordCount: 52
      }
    )
  }

  /**
   * 随机选择文章
   */
  selectArticle(difficulty = 'medium') {
    const articles = this.articles[difficulty] || this.articles.medium
    if (articles.length === 0) {
      return this.articles.medium[0] || this.articles.easy[0]
    }
    
    const randomIndex = Math.floor(Math.random() * articles.length)
    return articles[randomIndex]
  }

  /**
   * 验证进度合理性（防作弊）
   */
  validateProgress(article, progress, previousProgress) {
    if (!previousProgress) return true
    
    const timeDiff = progress.timestamp - previousProgress.timestamp
    const indexDiff = progress.currentIndex - previousProgress.currentIndex
    
    // 检查时间是否合理（不能倒退）
    if (timeDiff < 0) return false
    
    // 检查进度是否合理（不能倒退太多，除非是修正错误）
    if (indexDiff < -10) return false
    
    // 检查是否超过文章长度
    if (progress.currentIndex > article.content.length) return false
    
    // 检查WPM是否异常高（超过200WPM视为异常）
    if (progress.wpm > 200) {
      console.warn('Suspicious WPM detected:', progress.wpm)
      // 可以记录但不阻止，或者设置上限
    }
    
    return true
  }

  /**
   * 计算最终结果
   */
  calculateResult(article, progress, startTime, endTime) {
    const durationMs = endTime - startTime
    const completedChars = progress.currentIndex
    
    // 计算WPM
    const completedText = article.content.slice(0, completedChars)
    const wordCount = completedText.trim().split(/\s+/).filter(w => w.length > 0).length
    const wpm = durationMs > 0 ? Math.round((wordCount / durationMs) * 60000) : 0
    
    // 计算CPM
    const cpm = durationMs > 0 ? Math.round((completedChars / durationMs) * 60000) : 0
    
    // 计算准确率
    const totalKeystrokes = progress.totalKeystrokes || completedChars
    const correctChars = completedChars - (progress.errors?.length || 0)
    const accuracy = totalKeystrokes > 0 ? correctChars / totalKeystrokes : 1
    
    return {
      wpm,
      cpm,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      durationMs,
      totalChars: article.content.length,
      completedChars,
      errors: progress.errors || [],
      totalKeystrokes,
      backspaces: progress.backspaces || 0
    }
  }
}

export default GameEngine

