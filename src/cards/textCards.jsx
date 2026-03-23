import React from "react"
import { Edit3, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TextCard = ({
  article,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { t } = useTranslation()
  const handleCardClick = (e) => {
    if (e.target.closest("button")) {
      return
    }
    onSelect?.(article)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit?.(e, article)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDelete?.(e, article)
  }

  return (
    <Card
      className="relative flex h-64 cursor-pointer flex-col transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      {showActions && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            type="button"
            size="icon-xs"
            variant="secondary"
            className="h-8 w-8 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
            onClick={handleEditClick}
            title={t("text-cards.edit")}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="secondary"
            className="h-8 w-8 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
            onClick={handleDeleteClick}
            title={t("text-cards.delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            "line-clamp-2 text-base leading-tight",
            showActions ? "pr-14" : "pr-2"
          )}
          title={article.title}
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pb-2">
        <p className="line-clamp-3 h-full text-sm text-muted-foreground">
          {article.content}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-0 bg-transparent p-4 pt-0 text-xs text-muted-foreground shadow-none">
        <span className="capitalize">{article.category}</span>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">
          {article.wordCount} {t("text-cards.words")}
        </span>
      </CardFooter>
    </Card>
  )
}

const TextCardsGrid = ({
  articles = [],
  customArticles = [],
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
  showAddCard = false,
  onAddClick,
}) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <TextCard
          key={article.id}
          article={article}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}

      {customArticles.map((article) => (
        <TextCard
          key={article.id}
          article={article}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}

      {showAddCard && (
        <Card
          className="group relative flex h-64 cursor-pointer flex-col border-2 border-dashed border-muted-foreground/30 bg-card shadow-none ring-0 transition-colors hover:border-muted-foreground/45 hover:bg-muted/30 hover:shadow-sm"
          onClick={onAddClick}
        >
          <div className="absolute top-2 right-2 z-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-1 text-xs font-bold text-white shadow-md">
            AI
          </div>
          <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {t("text-cards.add-new-material")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("text-cards.click-to-create")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { TextCard, TextCardsGrid }
export default TextCardsGrid
