import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../store.js";
import {
  generateSampleArticles,
  countWords,
  countCharacters,
} from "../utils.js"
import TextInputCard from "../components/TextInputCard.jsx";
import PracticeControl from "../components/PracticeControl.jsx";
import TypingArea from "../components/TypingArea.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { Trash2, X, Check, Plus, Sparkles, Loader2 } from "lucide-react"
import Confirm from "../modals/confirm.jsx";
import { TextCardsGrid } from "../cards/textCards.jsx";
import { useTranslation } from "react-i18next";
import { generateTextWithDoubao, isApiKeyConfigured } from "../utils/aiService.js"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PracticePage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    articles,
    customArticles,
    currentArticle,
    practiceState,
    ui,
    records,
    addArticle,
    addCustomArticle,
    updateCustomArticle,
    deleteCustomArticle,
    setCurrentArticle,
  } = useStore();

  const [activeTab, setActiveTab] = useState("custom");
  const [customText, setCustomText] = useState("");
  const [sampleArticles, setSampleArticles] = useState(
    generateSampleArticles()
  );

  // Edit and delete states
  const [editingArticle, setEditingArticle] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deletingArticle, setDeletingArticle] = useState(null);

  // Practice confirmation state
  const [confirmingArticle, setConfirmingArticle] = useState(null);

  // Add new article state
  const [addingArticle, setAddingArticle] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState("");
  const [newArticleContent, setNewArticleContent] = useState("");
  const [newArticleCategory, setNewArticleCategory] = useState("custom");
  const [samplesInitialized, setSamplesInitialized] = useState(false);
  
  // AI generation state
  const [addMode, setAddMode] = useState("manual"); // "manual" or "ai"
  const [aiTopic, setAiTopic] = useState("");
  const [aiWordCount, setAiWordCount] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [streamingContent, setStreamingContent] = useState(""); // For streaming content display
  const [isStreaming, setIsStreaming] = useState(false); // Track streaming state
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const detectMobileDevice = () => {
      const mobileUserAgentRegex =
        /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i;
      const isMobileUserAgent = mobileUserAgentRegex.test(navigator.userAgent);
      const isSmallTouchScreen =
        window.matchMedia("(max-width: 768px)").matches &&
        navigator.maxTouchPoints > 0;

      setIsMobileDevice(isMobileUserAgent || isSmallTouchScreen);
    };

    detectMobileDevice();
    window.addEventListener("resize", detectMobileDevice);

    return () => {
      window.removeEventListener("resize", detectMobileDevice);
    };
  }, []);

  // Initialize with sample articles if no articles exist
  useEffect(() => {
    if (articles.length === 0 && !samplesInitialized) {
      sampleArticles.forEach((article) => {
        addArticle(article.title, article.content);
      });
      setSamplesInitialized(true);
    }
  }, [addArticle, articles.length, sampleArticles, samplesInitialized]);

  // Reset samplesInitialized when articles become empty (e.g., after clearAllData)
  useEffect(() => {
    if (articles.length === 0) {
      setSamplesInitialized(false);
    }
  }, [articles.length]);

  useEffect(() => {
    if (!location.state?.autoStartRandomSample || practiceState.isActive) return
    if (sampleArticles.length === 0) return

    const randomArticle =
      sampleArticles[Math.floor(Math.random() * sampleArticles.length)]

    setCurrentArticle(randomArticle)
    useStore.getState().startPractice(randomArticle)
    navigate("/practice", { replace: true })
  }, [
    location.state,
    navigate,
    practiceState.isActive,
    sampleArticles,
    setCurrentArticle,
  ])

  // Keyboard shortcuts for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (editingArticle) {
          handleEditCancel();
        } else if (deletingArticle) {
          handleDeleteCancel();
        } else if (confirmingArticle) {
          handlePracticeCancel();
        } else if (addingArticle) {
          handleAddArticleCancel();
        }
      }
    };

    if (editingArticle || deletingArticle || confirmingArticle || addingArticle) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [editingArticle, deletingArticle, confirmingArticle, addingArticle]);

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      const article = addArticle("", customText.trim());
      setCurrentArticle(article);
      useStore.getState().startPractice(article);
      setCustomText("");
    }
  };

  const handleSampleArticleSelect = (article) => {
    setConfirmingArticle(article);
  };

  const handleRecentArticleSelect = (article) => {
    setConfirmingArticle(article);
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "technology":
        return t("categories.technology");
      case "literature":
        return t("categories.literature");
      case "news":
        return t("categories.news");
      case "business":
        return t("categories.business");
      case "science":
        return t("categories.science");
      case "custom":
      default:
        return t("categories.custom");
    }
  };

  // Edit and delete handlers
  const handleEditClick = (e, article) => {
    e.stopPropagation();
    setEditingArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
  };

  const handleDeleteClick = (e, article) => {
    e.stopPropagation();
    setDeletingArticle(article);
  };

  const handleEditCancel = () => {
    setEditingArticle(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleDeleteCancel = () => {
    setDeletingArticle(null);
  };

  // 处理自定义素材的编辑和删除
  const handleCustomArticleEdit = (e, article) => {
    e.stopPropagation();
    setEditingArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
    setNewArticleCategory(article.category);
  };

  const handleCustomArticleDelete = (e, article) => {
    e.stopPropagation();
    setDeletingArticle(article);
  };

  const handleCustomArticleEditSave = () => {
    if (editTitle.trim() && editContent.trim() && editingArticle) {
      // 检查是否是自定义素材
      const isCustomArticle = customArticles.some(article => article.id === editingArticle.id);
      
      if (isCustomArticle) {
        // 更新自定义素材
        updateCustomArticle(editingArticle.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
          category: newArticleCategory,
          wordCount: editContent.trim().split(/\s+/).filter(word => word.length > 0).length,
          charCount: editContent.trim().length
        });
      } else {
        // 更新示例素材（原有逻辑）
        const updatedArticles = sampleArticles.map((article) =>
          article.id === editingArticle.id
            ? { ...article, title: editTitle.trim(), content: editContent.trim() }
            : article
        );
        setSampleArticles(updatedArticles);

        // 如果当前文章被编辑，也更新store
        if (currentArticle && currentArticle.id === editingArticle.id) {
          const updatedArticle = {
            ...currentArticle,
            title: editTitle.trim(),
            content: editContent.trim(),
          };
          setCurrentArticle(updatedArticle);
        }
      }

      setEditingArticle(null);
      setEditTitle("");
      setEditContent("");
      setNewArticleCategory("custom");
    }
  };

  const handleCustomArticleDeleteConfirm = () => {
    if (deletingArticle) {
      // 检查是否是自定义素材
      const isCustomArticle = customArticles.some(article => article.id === deletingArticle.id);
      
      if (isCustomArticle) {
        // 删除自定义素材
        deleteCustomArticle(deletingArticle.id);
      } else {
        // 删除示例素材（原有逻辑）
        const updatedArticles = sampleArticles.filter(
          (article) => article.id !== deletingArticle.id
        );
        setSampleArticles(updatedArticles);
      }

      // 如果当前文章被删除，清空当前文章
      if (currentArticle && currentArticle.id === deletingArticle.id) {
        setCurrentArticle(null);
      }

      setDeletingArticle(null);
    }
  };

  const handlePracticeConfirm = () => {
    if (confirmingArticle) {
      setCurrentArticle(confirmingArticle);
      useStore.getState().startPractice(confirmingArticle);
      setConfirmingArticle(null);
    }
  };

  const handlePracticeCancel = () => {
    setConfirmingArticle(null);
  };

  // Add new article handlers
  const handleAddArticleClick = () => {
    setAddingArticle(true);
    setNewArticleTitle("");
    setNewArticleContent("");
    setNewArticleCategory("custom");
    setAddMode("manual");
    setAiTopic("");
    setAiWordCount(100);
    setAiError("");
  };
  
  // AI generation handler with streaming support
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      setAiError(t('practice.ai-topic') + ' 是必填项');
      return;
    }
    
    setIsGenerating(true);
    setIsStreaming(true);
    setAiError("");
    setStreamingContent(""); // Clear previous streaming content
    
    // Create AbortController for cancellation support
    const abortController = new AbortController();
    
    try {
      const generatedText = await generateTextWithDoubao(
        aiTopic.trim(), 
        aiWordCount,
        {
          // Stream callback - called for each chunk
          onChunk: (chunk, fullText) => {
            setStreamingContent(fullText);
          },
          // Complete callback - called when streaming finishes
          onComplete: (finalText) => {
            setNewArticleContent(finalText);
            setStreamingContent(""); // Clear streaming display
            setIsStreaming(false);
            
            // Auto-set title if not set
            if (!newArticleTitle.trim()) {
              setNewArticleTitle(`${aiTopic} - ${t('practice.ai-generate-title')}`);
            }
          },
          // Pass abort signal for cancellation support
          signal: abortController.signal
        }
      );
      
      // Fallback in case onComplete is not called (non-streaming mode)
      if (!isStreaming) {
        setNewArticleContent(generatedText);
        if (!newArticleTitle.trim()) {
          setNewArticleTitle(`${aiTopic} - ${t('practice.ai-generate-title')}`);
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError(error.message || t('practice.ai-error-invalid'));
      setStreamingContent(""); // Clear on error
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
    }
  };

  const handleAddArticleSave = () => {
    if (newArticleTitle.trim() && newArticleContent.trim()) {
      // Add to store using addCustomArticle function
      addCustomArticle(newArticleTitle.trim(), newArticleContent.trim(), newArticleCategory);

      // Reset form and close modal
      setAddingArticle(false);
      setNewArticleTitle("");
      setNewArticleContent("");
      setNewArticleCategory("custom");
    }
  };

  const handleAddArticleCancel = () => {
    setAddingArticle(false);
    setNewArticleTitle("");
    setNewArticleContent("");
    setNewArticleCategory("custom");
    setAddMode("manual");
    setAiTopic("");
    setAiWordCount(100);
    setAiError("");
    setStreamingContent(""); // Clear streaming content
    setIsStreaming(false); // Reset streaming state
  };

  const recentArticles = useMemo(() => {
    // Get articles with recent practice records
    const withRecords = articles.filter((article) => {
      const recs = records[`typer.records:${article.id}`] || []
      return recs.length > 0
    })

    // Sort by most recent practice
    const sorted = withRecords.sort((a, b) => {
      const aRecords = records[`typer.records:${a.id}`] || []
      const bRecords = records[`typer.records:${b.id}`] || []

      if (aRecords.length === 0 && bRecords.length === 0) return 0
      if (aRecords.length === 0) return 1
      if (bRecords.length === 0) return -1

      const aLatest = Math.max(...aRecords.map((r) => r.endedAt))
      const bLatest = Math.max(...bRecords.map((r) => r.endedAt))

      return bLatest - aLatest
    })

    return sorted.slice(0, 5)
  }, [articles, records])

  if (isMobileDevice) {
    return (
      <div className="py-20 text-center text-lg font-medium text-muted-foreground">
        {t("practice.mobile-not-supported")}
      </div>
    );
  }

  if (practiceState.isActive && currentArticle) {
    return (
      <div className="space-y-6">
        <PracticeControl />
        <TypingArea />
        {ui.showResults && <ResultsPanel />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          {t("practice.title")}
        </h1>
        <p className="text-muted-foreground">{t("practice.subtitle")}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2">
            {["custom", "samples", "recent"].map((tab) => (
              <Button
                key={tab}
                type="button"
                variant={activeTab === tab ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab === "custom" && t("practice.custom-text")}
                {tab === "samples" && t("practice.material-library")}
                {tab === "recent" && t("practice.recent-usage")}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>

        {/* Custom Text Tab */}
        {activeTab === "custom" && (
          <TextInputCard
            value={customText}
            onChange={setCustomText}
            onSubmit={handleCustomTextSubmit}
          />
        )}

        {/* Sample Articles Tab */}
        {activeTab === "samples" && (
          <TextCardsGrid
            articles={sampleArticles}
            customArticles={customArticles}
            onSelect={handleSampleArticleSelect}
            onEdit={(e, article) => {
              if (customArticles.some(custom => custom.id === article.id)) {
                handleCustomArticleEdit(e, article);
              } else {
                handleEditClick(e, article);
              }
            }}
            onDelete={(e, article) => {
              if (customArticles.some(custom => custom.id === article.id)) {
                handleCustomArticleDelete(e, article);
              } else {
                handleDeleteClick(e, article);
              }
            }}
            showActions={true}
            showAddCard={true}
            onAddClick={handleAddArticleClick}
          />
        )}

        {/* Recent Articles Tab */}
        {activeTab === "recent" && (
          <div className="space-y-4">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => {
                const records =
                  useStore.getState().records[`typer.records:${article.id}`] ||
                  [];
                const bestRecord = records.reduce(
                  (best, current) => (current.wpm > best.wpm ? current : best),
                  records[0] || { wpm: 0 }
                );
                const lastRecord = records[records.length - 1];

                return (
                  <Card
                    key={article.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => handleRecentArticleSelect(article)}
                  >
                    <CardContent className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {bestRecord && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                            {t("best")}: {bestRecord.wpm} WPM
                          </span>
                        )}
                        {lastRecord && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                            {t("recent")}: {lastRecord.wpm} WPM
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {article.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {article.wordCount} {t("word")}
                      </span>
                      <span>
                        {t("practice.practice")} {records.length}{" "}
                        {t("practice.times")}
                      </span>
                      <span>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>{t("practice.no-practice-records")}</p>
                <p className="text-sm">{t("practice.start-practicing")}</p>
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editingArticle}
        onOpenChange={(open) => {
          if (!open) handleEditCancel()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">{t("practice.edit-article")}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleEditCancel}
              aria-label={t("cancel")}
            >
              <X className="size-5" />
            </Button>
          </div>
          <div className="space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t("practice.title-label")}</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder={t("practice.title-placeholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select
                value={newArticleCategory}
                onValueChange={setNewArticleCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{getCategoryLabel(newArticleCategory)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t("categories.custom")}</SelectItem>
                  <SelectItem value="technology">
                    {t("categories.technology")}
                  </SelectItem>
                  <SelectItem value="literature">
                    {t("categories.literature")}
                  </SelectItem>
                  <SelectItem value="news">{t("categories.news")}</SelectItem>
                  <SelectItem value="business">
                    {t("categories.business")}
                  </SelectItem>
                  <SelectItem value="science">{t("categories.science")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">{t("content")}</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="resize-none"
                placeholder={t("practice.enter-article-content")}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border px-6 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={handleEditCancel}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!editTitle.trim() || !editContent.trim()}
              onClick={handleCustomArticleEditSave}
              className="gap-2"
            >
              <Check className="size-4" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingArticle}
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
              {t("practice.confirm-delete")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("practice.delete-irreversible")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingArticle && (
            <p className="text-sm text-foreground">
              {t("practice.delete-confirmation")}
              <span className="font-semibold">
                {" "}
                &quot;{deletingArticle.title}&quot;{" "}
              </span>
              {t("practice.delete-article")}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCustomArticleDeleteConfirm}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("text-cards.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Practice Confirmation Modal */}
      {confirmingArticle && (
        <Confirm
          title={confirmingArticle.title}
          onConfirm={handlePracticeConfirm}
          onCancel={handlePracticeCancel}
        />
      )}

      <Dialog
        open={addingArticle}
        onOpenChange={(open) => {
          if (!open) handleAddArticleCancel()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(90vh,700px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle className="text-lg">
              {t("practice.add-new-material")}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleAddArticleCancel}
              aria-label={t("cancel")}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-border px-6 py-3">
              <div
                className="inline-flex h-10 w-full max-w-md items-center rounded-full bg-muted p-1 text-muted-foreground sm:w-auto"
                role="tablist"
                aria-label={t("practice.add-new-material")}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={addMode === "manual"}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all sm:flex-initial",
                    addMode === "manual"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "hover:text-foreground"
                  )}
                  onClick={() => setAddMode("manual")}
                >
                  {t("practice.manual-input")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={addMode === "ai"}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all sm:flex-initial",
                    addMode === "ai"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                      : "hover:text-foreground"
                  )}
                  onClick={() => setAddMode("ai")}
                >
                  <Sparkles className="size-3.5 shrink-0" />
                  {t("practice.ai-generate")}
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
                {/* AI Generation Mode */}
                {addMode === "ai" && (
                  <div className="space-y-4">
                    {!isApiKeyConfigured() && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          {t('practice.ai-error-no-key')}
                        </p>
                      </div>
                    )}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t('practice.ai-generate-title')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-topic">
                        {t("practice.ai-topic")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="ai-topic"
                        value={aiTopic}
                        onChange={(e) => {
                          setAiTopic(e.target.value)
                          setAiError("")
                        }}
                        placeholder={t("practice.ai-topic-placeholder")}
                        disabled={isGenerating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("practice.ai-word-count")}</Label>
                      <Select
                        value={String(aiWordCount)}
                        onValueChange={(v) => setAiWordCount(parseInt(v, 10))}
                        disabled={isGenerating}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{`${aiWordCount} ${t("word")}`}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 {t("word")}</SelectItem>
                          <SelectItem value="50">50 {t("word")}</SelectItem>
                          <SelectItem value="100">100 {t("word")}</SelectItem>
                          <SelectItem value="120">120 {t("word")}</SelectItem>
                          <SelectItem value="250">250 {t("word")}</SelectItem>
                          <SelectItem value="500">500 {t("word")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {aiError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">{aiError}</p>
                      </div>
                    )}

                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                      onClick={handleAiGenerate}
                      disabled={
                        isGenerating ||
                        !aiTopic.trim() ||
                        !isApiKeyConfigured()
                      }
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          {t("practice.ai-generating")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 size-4" />
                          {t("practice.ai-generate-button")}
                        </>
                      )}
                    </Button>

                    {/* Streaming content display with typewriter effect */}
                    {isStreaming && streamingContent && (
                      <div className="mt-4 animate-fadeIn">
                        <div className="flex items-center mb-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('practice.ai-generating')}...
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 max-h-60 overflow-y-auto relative">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {streamingContent}
                            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse"></span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Final generated content preview */}
                    {!isStreaming && newArticleContent && (
                      <div className="mt-4 animate-fadeIn">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('practice.use-ai-generated')}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => setAddMode("manual")}
                          >
                            {t("practice.manual-input")}
                          </Button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                            {newArticleContent.length > 300 
                              ? newArticleContent.substring(0, 300) + '...' 
                              : newArticleContent}
                          </p>
                          {newArticleContent.length > 300 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              ({newArticleContent.split(/\s+/).length} {t('word')})
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Input Mode */}
                {addMode === "manual" && (
                  <div className="flex min-h-0 flex-1 flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-title">{t("practice.title-label")}</Label>
                      <Input
                        id="new-title"
                        value={newArticleTitle}
                        onChange={(e) => setNewArticleTitle(e.target.value)}
                        placeholder={t("practice.title-placeholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("practice.category")}</Label>
                      <Select
                        value={newArticleCategory}
                        onValueChange={setNewArticleCategory}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>{getCategoryLabel(newArticleCategory)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">
                            {t("categories.custom")}
                          </SelectItem>
                          <SelectItem value="technology">
                            {t("categories.technology")}
                          </SelectItem>
                          <SelectItem value="literature">
                            {t("categories.literature")}
                          </SelectItem>
                          <SelectItem value="news">{t("categories.news")}</SelectItem>
                          <SelectItem value="business">
                            {t("categories.business")}
                          </SelectItem>
                          <SelectItem value="science">
                            {t("categories.science")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                      <Label htmlFor="new-content">{t("practice.content")}</Label>
                      <Textarea
                        id="new-content"
                        value={newArticleContent}
                        onChange={(e) => setNewArticleContent(e.target.value)}
                        className="min-h-[220px] flex-1 resize-none"
                        placeholder={t("practice.content-placeholder")}
                      />
                      <p className="text-right text-xs text-muted-foreground">
                        {countWords(newArticleContent)} {t("word")} ·{" "}
                        {countCharacters(newArticleContent)} {t("char")}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <DialogFooter className="!mx-0 !mb-0 shrink-0 gap-3 border-t border-border bg-muted/50 px-6 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleAddArticleCancel}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!newArticleTitle.trim() || !newArticleContent.trim()}
              onClick={handleAddArticleSave}
              className="gap-2"
            >
              <Plus className="size-4" />
              {t("practice.create-material")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticePage;
