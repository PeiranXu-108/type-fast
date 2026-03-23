import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme.js'
import Navigation from './components/Navigation.jsx'
import PracticePage from './pages/PracticePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function App() {
  useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<PracticePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
