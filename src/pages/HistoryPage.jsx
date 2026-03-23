import React, { useState, useMemo } from "react"
import { useStore } from "../store.js"
import { formatDuration, formatWPM } from "../utils.js"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Trash2,
  Play,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Confirm from "../modals/confirm.jsx"
import { useTranslation } from "react-i18next"
import PracticeChart from "../components/PracticeChart.jsx"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

  const getRecordRangeLabel = (range) => {
    switch (range) {
      case "recent10":
        return t("history.recent-10");
      case "recent20":
        return t("history.recent-20");
      case "recent50":
        return t("history.recent-50");
      case "all":
      default:
        return t("history.all-records");
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
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {t("history.title")}
        </h1>
        <p className="text-muted-foreground">{t("history.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card
            className="flex h-full flex-col"
            style={{ minHeight: "500px", maxHeight: "1300px" }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t("history.article-list")}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {articlesUnique.length} {t("history.articles-count")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">

            <div className="max-h-[1000px] space-y-3 overflow-y-auto">
              {articlesUnique.length > 0 ? (
                getSortedArticles(articlesUnique).map((article) => {
                  const stats = getArticleStats(article.id);
                  const isSelected = selectedArticle?.id === article.id;

                  return (
                    <div
                      key={article.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleArticleSelect(article)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleArticleSelect(article)
                        }
                      }}
                      className={cn(
                        "cursor-pointer rounded-lg p-3 transition-all duration-200",
                        isSelected
                          ? "border-2 border-primary/40 bg-primary/10"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <h3 className="mb-1 font-medium text-foreground">
                        {article.title}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {article.wordCount} {t("history.words-count")} •{" "}
                        {article.charCount} {t("history.chars-count")}
                      </p>

                      {stats && (
                        <div className="space-y-1">
                          <div className="items-center text-sm">
                            <span className="text-muted-foreground">
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
                            <span className="text-muted-foreground">
                              {t("history.practice-count")}:{" "}
                            </span>
                            <span className="font-semibold text-foreground">
                              {stats.practiceCount}
                            </span>
                          </div>
                          {stats.lastPractice && (
                            <div className="text-sm text-muted-foreground">
                              {t("history.recent")}{" "}
                              {new Date(
                                stats.lastPractice.endedAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRecords(article)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("history.delete-records")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePracticeAgain(article)
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {t("history.practice-again")}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>{t("history.no-practice-records")}</p>
                  <p className="text-sm">{t("history.start-practicing")}</p>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Records and Stats */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="space-y-6">
              {/* Article Stats Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    {t("history.stats-overview")} {selectedArticle.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {selectedArticle.content}
                  </div>
                </div>

                {(() => {
                  const stats = getArticleStats(selectedArticle.id);
                  if (!stats)
                    return (
                      <p className="text-muted-foreground">
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
                </CardContent>
              </Card>

              {(() => {
                const stats = getArticleStats(selectedArticle.id);
                if (!stats || stats.practiceCount < 2) return null;

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {t("history.practice-trend")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <PracticeChart records={getArticleRecords(selectedArticle.id)} />
                    </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <Card>
                <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {t("history.practice-records")}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      ({getFilteredRecords(selectedArticle.id).length}{" "}
                      {t("history.records-count")})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    </div>
                    <Select
                      value={selectedRecordRange}
                      onValueChange={setSelectedRecordRange}
                    >
                      <SelectTrigger className="w-[140px]" size="sm">
                        <SelectValue>
                          {getRecordRangeLabel(selectedRecordRange)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent10">{t("history.recent-10")}</SelectItem>
                        <SelectItem value="recent20">{t("history.recent-20")}</SelectItem>
                        <SelectItem value="recent50">{t("history.recent-50")}</SelectItem>
                        <SelectItem value="all">{t("history.all-records")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                      <tr className="border-b border-border">
                        <th className="bg-card py-2 text-left text-muted-foreground">
                          {t("history.date")}
                        </th>
                        <th className="bg-card py-2 text-left text-muted-foreground">
                          WPM
                        </th>
                        <th className="bg-card py-2 text-left text-muted-foreground">
                          CPM
                        </th>
                        <th className="bg-card py-2 text-left text-muted-foreground">
                          {t("history.accuracy")}
                        </th>
                        <th className="bg-card py-2 text-left text-muted-foreground">
                          {t("history.duration")}
                        </th>
                        <th className="bg-card py-2 text-left text-muted-foreground">
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
                            className={cn(
                              "border-b border-border/60 hover:bg-muted/40"
                            )}
                          >
                            <td className="py-2 text-foreground">
                              {new Date(record.endedAt).toLocaleDateString()}
                            </td>
                            <td
                              className={`py-2 font-semibold ${getWPMColor(
                                record.wpm
                              )}`}
                            >
                              {formatWPM(record.wpm)}
                            </td>
                            <td className="py-2 text-foreground">
                              {record.cpm}
                            </td>
                            <td
                              className={`py-2 font-semibold ${getAccuracyColor(
                                record.accuracy * 100
                              )}`}
                            >
                              {Number(record.accuracy * 100).toFixed(2)}%
                            </td>
                            <td className="py-2 text-foreground">
                              {formatDuration(record.durationMs)}
                            </td>
                            <td className="py-2 text-foreground">
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
                  <div className="py-8 text-center text-muted-foreground">
                    <p>{t("history.no-practice-records")}</p>
                  </div>
                )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent className="pt-8">
              <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {t("history.select-article")}
              </h3>
              <p className="text-muted-foreground">
                {t("history.select-article-desc")}
              </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!confirmingDelete}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </span>
              {t("history.confirm-delete-records")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("history.delete-records-irreversible")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmingDelete && (
            <p className="text-sm text-foreground">
              {t("history.delete-records-confirmation")}{" "}
              <span className="font-semibold">&quot;{confirmingDelete.title}&quot;</span>{" "}
              {t("history.delete-records-irreversible")}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
