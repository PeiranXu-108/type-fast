import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TextCard = ({ 
  article, 
  onSelect, 
  onEdit, 
  onDelete, 
  showActions = true
}) => {
  const { t } = useTranslation();
  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    onSelect?.(article);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(e, article);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(e, article);
  };

  return (
    <div
      className="card p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative h-64 flex flex-col"
      onClick={handleCardClick}
    >
      {showActions && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={handleEditClick}
            className="p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded transition-colors duration-200 hover:scale-105"
            title={t('text-cards.edit')}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded transition-colors duration-200 hover:scale-105"
            title={t('text-cards.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <h3
        className={`font-semibold text-gray-900 dark:text-white mb-2 text-base leading-tight truncate ${
          showActions ? 'pr-16' : 'pr-4'
        }`}
        title={article.title}
      >
        {article.title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 flex-1 h-48 overflow-hidden">
        {article.content}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
        <span className="capitalize">{article.category}</span>
        <span className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs">
          {article.wordCount} {t('text-cards.words')}
        </span>
      </div>
    </div>
  );
};

const TextCardsGrid = ({ 
  articles = [], 
  customArticles = [],
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
  showAddCard = false,
  onAddClick
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div
          className="card p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative h-64 flex flex-col border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 group"
          onClick={onAddClick}
        >
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 transition-colors duration-200">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('text-cards.add-new-material')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('text-cards.click-to-create')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export { TextCard, TextCardsGrid };
export default TextCardsGrid;
