export const formatCurrency = (amount, currency = 'INR') => {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numeric)) return '₹0.00'

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numeric)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numeric)
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
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
