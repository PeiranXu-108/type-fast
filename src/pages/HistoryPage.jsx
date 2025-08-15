import React, { useState } from "react";
import { useStore } from "../store.js";
import { formatDuration, formatWPM } from "../utils.js";
import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const { articles, records, startPractice } = useStore();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedRecordRange, setSelectedRecordRange] = useState("recent20");
  const navigate = useNavigate();

  const getArticleRecords = (articleId) => {
    return records[`typer.records:${articleId}`] || [];
  };

  const getArticleStats = (articleId) => {
    const articleRecords = getArticleRecords(articleId);
    if (articleRecords.length === 0) return null;

    const bestRecord = articleRecords.reduce(
      (best, current) => (current.wpm > best.wpm ? current : best),
      articleRecords[0]
    );

    const averageWPM = Math.round(
      articleRecords.reduce((sum, record) => sum + record.wpm, 0) /
        articleRecords.length
    );

    const averageAccuracy = Math.round(
      (articleRecords.reduce((sum, record) => sum + record.accuracy, 0) /
        articleRecords.length) *
        100
    );

    const totalPracticeTime = articleRecords.reduce(
      (sum, record) => sum + record.durationMs,
      0
    );

    return {
      bestRecord,
      averageWPM,
      averageAccuracy,
      totalPracticeTime,
      practiceCount: articleRecords.length,
      lastPractice: articleRecords[articleRecords.length - 1],
    };
  };

  const getFilteredRecords = (articleId) => {
    const articleRecords = getArticleRecords(articleId);
    if (!articleId || articleRecords.length === 0) return [];

    switch (selectedRecordRange) {
      case "recent10":
        return articleRecords.slice(-10).reverse();
      case "recent20":
        return articleRecords.slice(-20).reverse();
      case "recent50":
        return articleRecords.slice(-50).reverse();
      case "all":
        return articleRecords.reverse();
      default:
        return articleRecords.slice(-20).reverse();
    }
  };

  const handleArticleSelect = (article) => {
    console.log(article);
    setSelectedArticle(article);
  };

  const handlePracticeAgain = (article) => {
    navigate("/"); // 跳转到练习页面
    startPractice(article);
  };

  const getWPMColor = (wpm) => {
    if (wpm >= 60) return "text-green-600 dark:text-green-400";
    if (wpm >= 40) return "text-yellow-600 dark:text-yellow-400";
    if (wpm >= 20) return "text-blue-600 dark:text-blue-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 95) return "text-green-600 dark:text-green-400";
    if (accuracy >= 85) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Sort articles by most recent practice, with practiced articles first
  const getSortedArticles = () => {
    return [...articles].sort((a, b) => {
      const aRecords =
        useStore.getState().records[`typer.records:${a.id}`] || [];
      const bRecords =
        useStore.getState().records[`typer.records:${b.id}`] || [];

      // If both have no records, keep original order
      if (aRecords.length === 0 && bRecords.length === 0) return 0;

      // Articles with practice records come first
      if (aRecords.length === 0 && bRecords.length > 0) return 1;
      if (bRecords.length === 0 && aRecords.length > 0) return -1;

      // Sort by most recent practice time (newest first)
      const aLatest = Math.max(...aRecords.map((r) => r.endedAt));
      const bLatest = Math.max(...bRecords.map((r) => r.endedAt));

      return bLatest - aLatest;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          练习历史
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          查看你的练习记录，追踪进步趋势
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-1">
          <div
            className="card p-4"
            style={{ minHeight: "800px", maxHeight: "1000px", height: "100%" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                文章列表
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {articles.length} 篇文章
              </span>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {articles.length > 0 ? (
                getSortedArticles().map((article) => {
                  const stats = getArticleStats(article.id);
                  const isSelected = selectedArticle?.id === article.id;

                  return (
                    <div
                      key={article.id}
                      onClick={() => handleArticleSelect(article)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-primary-100 dark:bg-primary-900 border-2 border-primary-300 dark:border-primary-700"
                          : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {article.wordCount} 词 • {article.charCount} 字符
                      </p>

                      {stats && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              最佳 WPM:
                            </span>
                            <span
                              className={`font-semibold ${getWPMColor(
                                stats.bestRecord.wpm
                              )}`}
                            >
                              {formatWPM(stats.bestRecord.wpm)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              练习次数:
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {stats.practiceCount}
                            </span>
                          </div>
                          {stats.lastPractice && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              最近:{" "}
                              {new Date(
                                stats.lastPractice.endedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePracticeAgain(article);
                        }}
                        className="mt-2 w-full btn-primary py-1 text-sm flex items-center justify-center"
                      >
                        再次练习
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>还没有练习记录</p>
                  <p className="text-sm">开始练习一些文章吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Records and Stats */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="space-y-6">
              {/* Article Stats Summary */}
              <div className="card p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  统计概览  {selectedArticle.title}
                </h2>
                
                {/* Article Content Display */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </div>
                </div>

                {(() => {
                  const stats = getArticleStats(selectedArticle.id);
                  if (!stats)
                    return (
                      <p className="text-gray-500 dark:text-gray-400">
                        暂无练习记录
                      </p>
                    );

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatWPM(stats.bestRecord.wpm)}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          最佳 WPM
                        </div>
                      </div>

                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatWPM(stats.averageWPM)}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          平均 WPM
                        </div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.averageAccuracy}%
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          平均准确率
                        </div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.practiceCount}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          练习次数
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Records Table */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      练习记录
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({getFilteredRecords(selectedArticle.id).length} 条记录)
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/20 rounded"></div>
                      <span>最近记录</span>
                    </div>
                    <select
                      value={selectedRecordRange}
                      onChange={(e) => setSelectedRecordRange(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="recent10">最近10次</option>
                      <option value="recent20">最近20次</option>
                      <option value="recent50">最近50次</option>
                      <option value="all">全部记录</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          日期
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          WPM
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          CPM
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          准确率
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          用时
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          模式
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRecords(selectedArticle.id).map(
                        (record, index) => (
                          <tr
                            key={`${selectedArticle.id}-${record.endedAt}-${index}`}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              index === 0
                                ? "bg-yellow-50 dark:bg-yellow-900/20"
                                : ""
                            }`}
                          >
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {new Date(record.endedAt).toLocaleDateString()}
                            </td>
                            <td
                              className={`py-2 font-semibold ${getWPMColor(
                                record.wpm
                              )}`}
                            >
                              {formatWPM(record.wpm)}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {record.cpm}
                            </td>
                            <td
                              className={`py-2 font-semibold ${getAccuracyColor(
                                record.accuracy * 100
                              )}`}
                            >
                              {Number(record.accuracy * 100).toFixed(2)}%
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {formatDuration(record.durationMs)}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  record.mode === "strict"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                }`}
                              >
                                {record.mode === "strict" ? "严格" : "宽容"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {getFilteredRecords(selectedArticle.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>暂无练习记录</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                选择文章查看历史
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                从左侧列表中选择一篇文章来查看其练习历史和统计数据
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
