import React from 'react'
import { Trophy, Clock, Target, TrendingUp, ArrowLeft, RotateCcw } from 'lucide-react'

export default function Grade({ 
  wpm, 
  cpm, 
  duration, 
  accuracy, 
  onReturn, 
  onPracticeAgain 
}) {
  // Helper function to get grade based on WPM
  const getGrade = (wpm) => {
    if (wpm >= 60) return { grade: 'A+', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' }
    if (wpm >= 50) return { grade: 'A', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' }
    if (wpm >= 40) return { grade: 'B+', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' }
    if (wpm >= 35) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' }
    if (wpm >= 30) return { grade: 'C+', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' }
    if (wpm >= 25) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' }
    if (wpm >= 20) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' }
    return { grade: 'F', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' }
  }

  const gradeInfo = getGrade(wpm)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header with Trophy and Grade */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 ${gradeInfo.bgColor} rounded-full flex items-center justify-center`}>
                <Trophy className={`w-10 h-10 ${gradeInfo.color}`} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              练习完成！
            </h2>
            <div className={`inline-block px-4 py-2 ${gradeInfo.bgColor} rounded-full`}>
              <span className={`text-2xl font-bold ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* WPM */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">WPM</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {wpm}
              </div>
            </div>

            {/* CPM */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">CPM</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {cpm}
              </div>
            </div>

            {/* Duration */}
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">用时</span>
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {duration}
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">准确率</span>
              </div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onReturn}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </button>
            <button
              onClick={onPracticeAgain}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              再次练习
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
