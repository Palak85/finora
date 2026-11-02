export const getSystemCurrency = () => {
  return localStorage.getItem('finora_currency') || 'INR'
}

export const setSystemCurrency = (currency) => {
  if (currency) {
    localStorage.setItem('finora_currency', currency)
  }
}

export const getSystemDateFormat = () => {
  return localStorage.getItem('finora_date_format') || 'DD/MM/YYYY'
}

export const setSystemDateFormat = (format) => {
  if (format) {
    localStorage.setItem('finora_date_format', format)
  }
}

export const formatCurrency = (amount, currency = null) => {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount
  const activeCurrency = currency || getSystemCurrency()

  if (isNaN(numeric)) {
    if (activeCurrency === 'INR') return '₹0.00'
    if (activeCurrency === 'USD') return '$0.00'
    if (activeCurrency === 'EUR') return '€0.00'
    if (activeCurrency === 'GBP') return '£0.00'
    return `${activeCurrency} 0.00`
  }

  if (activeCurrency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  if (activeCurrency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  if (activeCurrency === 'GBP') {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: activeCurrency,
    maximumFractionDigits: 2,
  }).format(numeric)
}

export const formatDate = (dateString, customFormat = null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return String(dateString)

  const activeFormat = customFormat || getSystemDateFormat()

  if (activeFormat === 'DD/MM/YYYY') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  if (activeFormat === 'MM/DD/YYYY') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  if (activeFormat === 'YYYY-MM-DD') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const maskAccountNumber = (accNumber) => {
  if (!accNumber) return '•••• •••• ----'
  const clean = accNumber.toString().replace(/\s+/g, '')
  const last4 = clean.slice(-4)
  return `•••• •••• ${last4}`
}

export const getCategoryColor = (category) => {
  const colors = {
    'Food': '#F59E0B',
    'Transport': '#3B82F6',
    'Shopping': '#EC4899',
    'Utilities': '#10B981',
    'Entertainment': '#8B5CF6',
    'Healthcare': '#EF4444',
    'Education': '#6366F1',
    'Bills': '#F97316',
    'Salary': '#10B981',
    'Investment': '#D4AF37',
    'Other': '#6B7280',
  }
  return colors[category] || '#D4AF37'
}
