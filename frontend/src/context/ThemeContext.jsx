import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const cached = localStorage.getItem('finora_theme')
    if (cached === 'light' || cached === 'dark') return cached
    try {
      const sysConfig = JSON.parse(localStorage.getItem('finora_system_config') || '{}')
      if (sysConfig.theme_mode === 'LIGHT_CLASSIC') return 'light'
      if (sysConfig.theme_mode === 'DARK_GOLD') return 'dark'
    } catch {}
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    localStorage.setItem('finora_theme', theme)
  }, [theme])

  // Synchronize theme across platform broadcasts and cross-tab storage events
  useEffect(() => {
    const handleThemeSync = (e) => {
      if (!e?.detail) return
      if (typeof e.detail === 'string') {
        const nextTheme = e.detail === 'light' ? 'light' : 'dark'
        setTheme(nextTheme)
      } else if (e.detail.theme_mode) {
        const nextTheme = e.detail.theme_mode === 'LIGHT_CLASSIC' ? 'light' : 'dark'
        setTheme(nextTheme)
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'finora_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue)
      } else if (e.key === 'finora_system_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed.theme_mode === 'LIGHT_CLASSIC') {
            setTheme('light')
          } else if (parsed.theme_mode === 'DARK_GOLD') {
            setTheme('dark')
          }
        } catch {}
      }
    }

    window.addEventListener('finora_theme_updated', handleThemeSync)
    window.addEventListener('finora_system_config_updated', handleThemeSync)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('finora_theme_updated', handleThemeSync)
      window.removeEventListener('finora_system_config_updated', handleThemeSync)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export default ThemeContext
