import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import zhCommon from './static/zh/common.json';
import enCommon from './static/en/common.json';

const resources = {
  zh: {
    common: zhCommon
  },
  en: {
    common: enCommon
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'zh', // 回退语言
    debug: false, // 开发时可以设为 true
    
    interpolation: {
      escapeValue: false, // React 已经安全地转义了
    },
    
    // 命名空间配置
    defaultNS: 'common',
    ns: ['common'],
    
    // 语言检测
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
