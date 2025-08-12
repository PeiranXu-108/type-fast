import React, { useState } from 'react'
import { useStore } from '../store.js'
import { useTheme } from '../hooks/useTheme.js'
import { Settings, Palette, Volume2, Monitor, Download, Upload, Trash2, AlertTriangle } from 'lucide-react'

const SettingsPage = () => {
  const { settings, updateSettings, exportData, importData, clearAllData } = useStore()
  const { theme, setTheme } = useTheme()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importStatus, setImportStatus] = useState('')
  
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value })
  }
  
  const handleNestedSettingChange = (parentKey, childKey, value) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value
      }
    })
  }
  
  const handleExport = () => {
    exportData()
  }
  
  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const success = importData(text)
      
      if (success) {
        setImportStatus('success')
        setTimeout(() => setImportStatus(''), 3000)
      } else {
        setImportStatus('error')
        setTimeout(() => setImportStatus(''), 3000)
      }
    } catch (error) {
      setImportStatus('error')
      setTimeout(() => setImportStatus(''), 3000)
    }
    
    // Reset file input
    event.target.value = ''
  }
  
  const handleClearData = () => {
    clearAllData()
    setShowClearConfirm(false)
  }
  
  const getThemeLabel = (themeValue) => {
    switch (themeValue) {
      case 'light': return '浅色'
      case 'dark': return '深色'
      case 'system': return '跟随系统'
      default: return '跟随系统'
    }
  }
  
  const getModeLabel = (mode) => {
    return mode === 'strict' ? '严格模式' : '宽容模式'
  }
  
  const getWPMCalculationLabel = (method) => {
    return method === 'word-based' ? '基于单词' : '基于字符(5字符=1词)'
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          设置
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          自定义你的打字练习体验
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            外观设置
          </h2>
          
          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                主题
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="system">跟随系统</option>
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                当前: {getThemeLabel(theme)}
              </p>
            </div>
            
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                字体大小
              </label>
              <select
                value={settings.visual.fontSize}
                onChange={(e) => handleNestedSettingChange('visual', 'fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>
            
            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                行高
              </label>
              <select
                value={settings.visual.lineHeight}
                onChange={(e) => handleNestedSettingChange('visual', 'lineHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="tight">紧凑</option>
                <option value="normal">正常</option>
                <option value="loose">宽松</option>
              </select>
            </div>
            
            {/* Cursor Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                光标样式
              </label>
              <select
                value={settings.visual.cursorStyle}
                onChange={(e) => handleNestedSettingChange('visual', 'cursorStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="block">方块</option>
                <option value="line">线条</option>
                <option value="underline">下划线</option>
              </select>
            </div>
            
            {/* Contrast Enhancement */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  增强对比度
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  提高文字与背景的对比度
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.visual.contrastEnhance}
                onChange={(e) => handleNestedSettingChange('visual', 'contrastEnhance', e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
        
        {/* Practice Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            练习设置
          </h2>
          
          <div className="space-y-4">
            {/* Default Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                默认练习模式
              </label>
              <select
                value={settings.defaultMode}
                onChange={(e) => handleSettingChange('defaultMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="lenient">宽容模式</option>
                <option value="strict">严格模式</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                当前: {getModeLabel(settings.defaultMode)}
              </p>
            </div>
            
            {/* WPM Calculation Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WPM 计算方式
              </label>
              <select
                value={settings.wpmCalculation}
                onChange={(e) => handleSettingChange('wpmCalculation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="word-based">基于单词</option>
                <option value="char-based">基于字符(5字符=1词)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                当前: {getWPMCalculationLabel(settings.wpmCalculation)}
              </p>
            </div>
            
            {/* Sound Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                声音设置
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">按键音</span>
                <input
                  type="checkbox"
                  checked={settings.sounds.keyPress}
                  onChange={(e) => handleNestedSettingChange('sounds', 'keyPress', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">完成提示音</span>
                <input
                  type="checkbox"
                  checked={settings.sounds.completion}
                  onChange={(e) => handleNestedSettingChange('sounds', 'completion', e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            数据管理
          </h2>
          
          <div className="space-y-4">
            {/* Export Data */}
            <div>
              <button
                onClick={handleExport}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                导出所有练习记录和设置到 JSON 文件
              </p>
            </div>
            
            {/* Import Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                导入数据
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {importStatus && (
                <p className={`text-xs mt-1 ${
                  importStatus === 'success' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {importStatus === 'success' ? '导入成功！' : '导入失败，请检查文件格式'}
                </p>
              )}
            </div>
            
            {/* Clear Data */}
            <div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除所有数据
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                此操作不可逆，请谨慎操作
              </p>
            </div>
          </div>
        </div>
        
        {/* Keyboard Shortcuts */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            键盘快捷键
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">开始练习</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">Space</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">退出练习</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">Esc</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">重新开始</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">Ctrl + Enter</kbd>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">切换模式</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">Tab</kbd>
            </div>
          </div>
        </div>
      </div>
      
      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                确认清除数据
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              此操作将永久删除所有练习记录、文章和设置。此操作不可逆，请确认你真的要这样做。
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
