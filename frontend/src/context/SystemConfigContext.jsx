import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { systemService } from '../services/api'
import { setSystemCurrency, setSystemDateFormat } from '../utils/formatters'

const SystemConfigContext = createContext()

export const SystemConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('finora_system_config')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const applyConfig = useCallback((data) => {
    if (!data) return
    setConfig(data)
    try {
      localStorage.setItem('finora_system_config', JSON.stringify(data))
      if (data.default_currency) {
        setSystemCurrency(data.default_currency)
      }
      if (data.date_format) {
        setSystemDateFormat(data.date_format)
      }
    } catch (e) {
      console.warn('Failed to store system config cache:', e)
    }
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await systemService.getConfig()
      if (res.data?.success && res.data.data) {
        applyConfig(res.data.data)
      }
    } catch (err) {
      console.warn('Could not load dynamic system config, using local cache:', err)
    } finally {
      setLoading(false)
    }
  }, [applyConfig])

  useEffect(() => {
    fetchConfig()

    const handleConfigUpdated = (e) => {
      if (e?.detail) {
        applyConfig(e.detail)
      } else {
        fetchConfig()
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'finora_system_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          applyConfig(parsed)
        } catch {}
      }
    }

    window.addEventListener('finora_system_config_updated', handleConfigUpdated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('finora_system_config_updated', handleConfigUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchConfig, applyConfig])

  return (
    <SystemConfigContext.Provider
      value={{
        config,
        loading,
        refreshConfig: fetchConfig,
        defaultCurrency: config?.default_currency || 'INR',
        dateFormat: config?.date_format || 'DD/MM/YYYY',
        appName: config?.app_name || 'FINORA Pro',
        themeMode: config?.theme_mode || 'DARK_GOLD',
        maintenanceMode: Boolean(config?.maintenance_mode),
        allowCustomerRegistration: config?.allow_customer_registration !== false,
        advisorAssignmentMode: config?.advisor_assignment_mode || 'CLIENT_REQUEST',
        emailAlertsEnabled: config?.email_alerts_enabled !== false,
      }}
    >
      {children}
    </SystemConfigContext.Provider>
  )
}

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext)
  if (!context) {
    return {
      config: null,
      loading: false,
      refreshConfig: () => {},
      defaultCurrency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      appName: 'FINORA Pro',
      themeMode: 'DARK_GOLD',
      maintenanceMode: false,
      allowCustomerRegistration: true,
      advisorAssignmentMode: 'CLIENT_REQUEST',
      emailAlertsEnabled: true,
    }
  }
  return context
}

export default SystemConfigContext
