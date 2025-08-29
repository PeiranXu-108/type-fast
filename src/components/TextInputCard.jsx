import React from 'react'
import { countWords, countCharacters } from '../utils.js'
import { useTranslation } from 'react-i18next'
const TextInputCard = ({ value, onChange, onSubmit }) => {
  const { t } = useTranslation()
  const wordCount = countWords(value)
  const charCount = countCharacters(value)
  
  const handleClear = () => {
    onChange('')
  }
  
  const handleRemoveEmptyLines = () => {
    const cleaned = value
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n')
    onChange(cleaned)
  }
  
  const handleRemoveExtraSpaces = () => {
    const cleaned = value
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(line => line.length > 0)
      .join('\n')
    onChange(cleaned)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('practice.custom-text')}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{wordCount} {t('word')}</span>
          <span>•</span>
          <span>{charCount} {t('char')}</span>
        </div>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('custom-text-placeholder')}
        className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm"
        disabled={false}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {t('practice.clear')}
          </button>
          <button
            onClick={handleRemoveEmptyLines}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {t('practice.remove-empty-lines')}
          </button>
          <button
            onClick={handleRemoveExtraSpaces}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {t('practice.remove-extra-spaces')}
          </button>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={!value.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {t('practice.start-practice')}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>{t('practice.tips')}</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>{t('practice.tips-multiline')}</li>
          <li>{t('practice.tips-punctuation')}</li>
          <li>{t('practice.tips-length')}</li>
        </ul>
      </div>
    </div>
  )
}

export default TextInputCard
