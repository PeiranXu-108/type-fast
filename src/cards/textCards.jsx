import React from "react"
import { Edit3, Trash2, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import HexBadge from "@/components/scifi/HexBadge.jsx"

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
      className="group relative flex h-64 cursor-pointer flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--primary),0_0_32px_-10px_var(--hud-glow)]"
      onClick={handleCardClick}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/80 via-primary/20 to-transparent"
      />
      {showActions && (
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            className="h-8 w-8 border-neon-info/50 text-neon-info hover:border-neon-info hover:bg-neon-info/15"
            onClick={handleEditClick}
            title={t("text-cards.edit")}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            className="h-8 w-8 border-neon-red/50 text-neon-red hover:border-neon-red hover:bg-neon-red/15"
            onClick={handleDeleteClick}
            title={t("text-cards.delete")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <CardHeader className="pb-1">
        <div aria-hidden="true" className="hud-label mb-1 flex items-center gap-1.5">
          <span className="hud-led text-primary" />
          DATA
        </div>
        <CardTitle
          className={cn(
            "line-clamp-2 text-base leading-tight transition-colors group-hover:text-primary",
            showActions ? "pr-20" : "pr-2"
          )}
          title={article.title}
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pb-2">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.content}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-0 bg-transparent px-5 pb-0 pt-0 font-mono text-xs text-muted-foreground shadow-none">
        <span className="capitalize">{article.category}</span>
        <span className="border border-hud-line bg-primary/10 px-2 py-1 font-medium text-primary">
          {article.wordCount} {t("text-cards.words")}
        </span>
      </CardFooter>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 -translate-y-full bg-gradient-to-b from-transparent via-primary/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-y-[400%] group-hover:opacity-100"
      />
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
          className="group relative flex h-64 cursor-pointer flex-col border border-dashed border-primary/40 bg-primary/[0.03] shadow-none transition-all duration-300 hover:border-primary/80 hover:bg-primary/[0.07] hover:shadow-[0_0_32px_-12px_var(--hud-glow)]"
          onClick={onAddClick}
        >
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-neon-violet to-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground shadow-[0_0_14px_-2px_var(--neon-violet)]">
            AI
          </div>
          <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
            <HexBadge className="mb-4 size-16 text-primary transition-transform duration-500 group-hover:rotate-90">
              <Plus className="h-7 w-7 transition-transform duration-500 group-hover:-rotate-90" />
            </HexBadge>
            <h3 className="mb-2 font-display text-lg font-semibold tracking-wide text-foreground">
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
