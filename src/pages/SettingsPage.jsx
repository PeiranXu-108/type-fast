import React, { useState } from "react";
import { useStore } from "../store.js";
import { useTheme } from "../hooks/useTheme.js";
import {
  Settings,
  Palette,
  Volume2,
  Monitor,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Keyboard,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { settings, updateSettings, exportData, importData, clearAllData } =
    useStore();
  const { theme, setTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState("");
  const { t } = useTranslation();
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value,
      },
    });
  };

  const handleExport = () => {
    exportData();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importData(text);

      if (success) {
        setImportStatus("success");
        setTimeout(() => setImportStatus(""), 3000);
      } else {
        setImportStatus("error");
        setTimeout(() => setImportStatus(""), 3000);
      }
    } catch (error) {
      setImportStatus("error");
      setTimeout(() => setImportStatus(""), 3000);
    }

    // Reset file input
    event.target.value = "";
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  // Calculate storage size in KB
  const getStorageSize = () => {
    try {
      let totalSize = 0;

      // Calculate localStorage size
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += key.length + item.length;
          }
        }
      }

      // Convert to KB with 2 decimal places
      return (totalSize / 1024).toFixed(2);
    } catch (error) {
      console.error("Error calculating storage size:", error);
      return "0.00";
    }
  };

  const getThemeLabel = (themeValue) => {
    switch (themeValue) {
      case "light":
        return t("settings.light");
      case "dark":
        return t("settings.dark");
      case "system":
        return t("settings.follow-system");
      default:
        return t("settings.follow-system");
    }
  };

  const getModeLabel = (mode) => {
    return mode === "strict" ? t("settings.strict") : t("settings.lenient");
  };

  const getWPMCalculationLabel = (method) => {
    return method === "word-based"
      ? t("settings.word-based")
      : t("settings.char-based");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            {t("settings.appearance-settings")}
          </h2>

          <div className="space-y-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.theme")}
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="system">{t("settings.follow-system")}</option>
                <option value="light">{t("settings.light")}</option>
                <option value="dark">{t("settings.dark")}</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.current")}: {getThemeLabel(theme)}
              </p>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.font-size")}
              </label>
              <select
                value={settings.visual.fontSize}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "visual",
                    "fontSize",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="small">{t("settings.small")}</option>
                <option value="medium">{t("settings.medium")}</option>
                <option value="large">{t("settings.large")}</option>
              </select>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.line-height")}
              </label>
              <select
                value={settings.visual.lineHeight}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "visual",
                    "lineHeight",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="tight">{t("settings.tight")}</option>
                <option value="normal">{t("settings.normal")}</option>
                <option value="loose">{t("settings.loose")}</option>
              </select>
            </div>

            {/* Cursor Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.cursor-style")}
              </label>
              <select
                value={settings.visual.cursorStyle}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "visual",
                    "cursorStyle",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="block">{t("settings.block")}</option>
                <option value="line">{t("settings.line")}</option>
                <option value="underline">{t("settings.underline")}</option>
              </select>
            </div>

            {/* Contrast Enhancement */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("settings.contrast-enhancement")}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("settings.contrast-description")}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.visual.contrastEnhance}
                onChange={(e) =>
                  handleNestedSettingChange(
                    "visual",
                    "contrastEnhance",
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Practice Settings */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            {t("settings.practice-settings")}
          </h2>

          <div className="space-y-4">
            {/* Default Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.default-practice-mode")}
              </label>
              <select
                value={settings.defaultMode}
                onChange={(e) =>
                  handleSettingChange("defaultMode", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="lenient">{t("settings.lenient")}</option>
                <option value="strict">{t("settings.strict")}</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.current")}: {getModeLabel(settings.defaultMode)}
              </p>
            </div>

            {/* WPM Calculation Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.wpm-calculation")}
              </label>
              <select
                value={settings.wpmCalculation}
                onChange={(e) =>
                  handleSettingChange("wpmCalculation", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="word-based">{t("settings.word-based")}</option>
                <option value="char-based">{t("settings.char-based")}</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.current")}:{" "}
                {getWPMCalculationLabel(settings.wpmCalculation)}
              </p>
            </div>

            {/* Sound Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                {t("settings.sound-settings")}
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.key-press-sound")}
                </span>
                <input
                  type="checkbox"
                  checked={settings.sounds.keyPress}
                  onChange={(e) =>
                    handleNestedSettingChange(
                      "sounds",
                      "keyPress",
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings.completion-sound")}
                </span>
                <input
                  type="checkbox"
                  checked={settings.sounds.completion}
                  onChange={(e) =>
                    handleNestedSettingChange(
                      "sounds",
                      "completion",
                      e.target.checked
                    )
                  }
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
            {t("settings.data-management")}
          </h2>

          <div className="space-y-4">
            {/* Export Data */}
            <div>
              <button
                onClick={handleExport}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("settings.export-data")}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.export-description")}
              </p>
            </div>

            {/* Storage Usage */}
            <div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("settings.local-storage-usage")}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getStorageSize()} KB
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.storage-description")}
              </p>
            </div>

            {/* Import Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("settings.import-data")}
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {importStatus && (
                <p
                  className={`text-xs mt-1 ${
                    importStatus === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {importStatus === "success"
                    ? t("settings.import-success")
                    : t("settings.import-failed")}
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
                {t("settings.clear-all-data")}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("settings.clear-description")}
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Keyboard className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
            {t("settings.keyboard-shortcuts")}
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {t("settings.start-practice")}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                Space
              </kbd>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {t("settings.exit-practice")}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                Esc
              </kbd>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {t("settings.restart")}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                Ctrl + Enter
              </kbd>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                {t("settings.toggle-mode")}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                Tab
              </kbd>
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
                {t("settings.confirm-clear-data")}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("settings.clear-data-warning")}
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 btn-secondary"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {t("settings.confirm-clear")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
