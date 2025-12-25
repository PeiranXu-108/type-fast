import React, { useState, useMemo } from "react";
import { useStore } from "../store.js";
import { formatDuration, formatWPM } from "../utils.js";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Trash2,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Confirm from "../modals/confirm.jsx";
import { useTranslation } from "react-i18next";
import PracticeChart from "../components/PracticeChart.jsx";

const HistoryPage = () => {
  const { t } = useTranslation();
  const {
    articles,
    customArticles,
    records,
    startPractice,
    deleteArticleRecords,
  } = useStore();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedRecordRange, setSelectedRecordRange] = useState("recent20");
  const [confirmingPractice, setConfirmingPractice] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
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
        return [...articleRecords].reverse();
      default:
        return articleRecords.slice(-20).reverse();
    }
  };

  const articlesUnique = useMemo(() => {
    const map = new Map();
    // Add regular articles
    for (const a of articles) {
      if (!map.has(a.id)) map.set(a.id, a);
    }
    // Add custom articles
    for (const a of customArticles) {
      if (!map.has(a.id)) map.set(a.id, a);
    }
    return Array.from(map.values());
  }, [articles, customArticles]);

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
  };

  const handlePracticeConfirm = (article) => {
    navigate("/");
    startPractice(article);
    setConfirmingPractice(null);
  };

  const handlePracticeCancel = () => {
    setConfirmingPractice(null);
  };

  const handlePracticeAgain = (article) => {
    setConfirmingPractice(article);
  };

  const handleDeleteRecords = (article) => {
    setConfirmingDelete(article);
  };

  const handleDeleteConfirm = () => {
    if (confirmingDelete) {
      // Delete records for the article (without deleting the article itself)
      deleteArticleRecords(confirmingDelete.id);

      setConfirmingDelete(null);
      if (selectedArticle && selectedArticle.id === confirmingDelete.id) {
        setSelectedArticle(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setConfirmingDelete(null);
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
  const getSortedArticles = (arr = []) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const aRecs = records[`typer.records:${a.id}`] || [];
      const bRecs = records[`typer.records:${b.id}`] || [];
      if (aRecs.length === 0 && bRecs.length === 0) return 0;
      if (aRecs.length === 0) return 1;
      if (bRecs.length === 0) return -1;
      const aLatest = Math.max(...aRecs.map((r) => r.endedAt));
      const bLatest = Math.max(...bRecs.map((r) => r.endedAt));
      return bLatest - aLatest;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("history.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("history.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Articles List */}
        <div className="lg:col-span-1">
          <div
            className="card p-4"
            style={{ minHeight: "500px", maxHeight: "1300px", height: "100%" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                {t("history.article-list")}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {articlesUnique.length} {t("history.articles-count")}
              </span>
            </div>

            <div className="space-y-3 max-h-[1000px] overflow-y-auto">
              {articlesUnique.length > 0 ? (
                getSortedArticles(articlesUnique).map((article) => {
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
                        {article.wordCount} {t("history.words-count")} •{" "}
                        {article.charCount} {t("history.chars-count")}
                      </p>

                      {stats && (
                        <div className="space-y-1">
                          <div className="items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {t("history.best-wpm")}:{" "}
                            </span>
                            <span
                              className={`font-semibold ${getWPMColor(
                                stats.bestRecord.wpm
                              )}`}
                            >
                              {formatWPM(stats.bestRecord.wpm)}
                            </span>
                          </div>
                          <div className="items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {t("history.practice-count")}:{" "}
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {stats.practiceCount}
                            </span>
                          </div>
                          {stats.lastPractice && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {t("history.recent")}{" "}
                              {new Date(
                                stats.lastPractice.endedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecords(article);
                          }}
                          className="flex-1 btn-secondary text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("history.delete-records")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePracticeAgain(article);
                          }}
                          className="flex-1 btn-primary"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {t("history.practice-again")}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>{t("history.no-practice-records")}</p>
                  <p className="text-sm">{t("history.start-practicing")}</p>
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
                  {t("history.stats-overview")} {selectedArticle.title}
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
                        {t("history.no-practice-records")}
                      </p>
                    );

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatWPM(stats.bestRecord.wpm)}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          {t("history.best-wpm")}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatWPM(stats.averageWPM)}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          {t("history.average-wpm")}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.averageAccuracy}%
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          {t("history.average-accuracy")}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {stats.practiceCount}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          {t("history.practice-count")}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Practice Chart - Only show if practice count >= 2 */}
              {(() => {
                const stats = getArticleStats(selectedArticle.id);
                if (!stats || stats.practiceCount < 2) return null;

                return (
                  <div className="card p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      {t("history.practice-trend")}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <PracticeChart records={getArticleRecords(selectedArticle.id)} />
                    </div>
                  </div>
                );
              })()}

              {/* Records Table */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                      {t("history.practice-records")}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({getFilteredRecords(selectedArticle.id).length}{" "}
                      {t("history.records-count")})
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/20 rounded"></div>
                      <span>{t("history.recent-records")}</span>
                    </div>
                    <select
                      value={selectedRecordRange}
                      onChange={(e) => setSelectedRecordRange(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="recent10">{t("history.recent-10")}</option>
                      <option value="recent20">{t("history.recent-20")}</option>
                      <option value="recent50">{t("history.recent-50")}</option>
                      <option value="all">{t("history.all-records")}</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          {t("history.date")}
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          WPM
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          CPM
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          {t("history.accuracy")}
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          {t("history.duration")}
                        </th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                          {t("history.mode")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredRecords(selectedArticle.id).map(
                        (record, index) => (
                          <tr
                            key={
                              record.id ??
                              `${selectedArticle.id}-${record.endedAt}-${index}`
                            }
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
                                {record.mode === "strict"
                                  ? t("history.strict")
                                  : t("history.lenient")}
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
                    <p>{t("history.no-practice-records")}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Target className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("history.select-article")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("history.select-article-desc")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Records Confirmation Modal */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t("history.confirm-delete-records")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("history.delete-records-irreversible")}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t("history.delete-records-confirmation")}{" "}
                <span className="font-semibold">
                  "{confirmingDelete.title}"
                </span>{" "}
                {t("history.delete-records-irreversible")}
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  {t("delete.cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("delete.delete")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Confirmation Modal */}
      {confirmingPractice && (
        <Confirm
          title={confirmingPractice.title}
          onConfirm={() => handlePracticeConfirm(confirmingPractice)}
          onCancel={handlePracticeCancel}
        />
      )}
    </div>
  );
};

export default HistoryPage;
