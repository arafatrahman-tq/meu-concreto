import { defineNuxtPlugin } from '#app'
import * as LucideIcons from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  // Registrar os ícones mais comuns globalmente para facilitar o uso como tags <users />, <search />, etc.
  const commonIcons = [
    'User',
    'Users',
    'Search',
    'Plus',
    'Edit3',
    'Trash2',
    'Mail',
    'Phone',
    'Lock',
    'Building2',
    'Truck',
    'Clock',
    'CheckCircle',
    'CheckCircle2',
    'AlertCircle',
    'AlertTriangle',
    'FileText',
    'FileStack',
    'CreditCard',
    'TrendingDown',
    'TrendingUp',
    'Activity',
    'Zap',
    'Smartphone',
    'MessageSquare',
    'Package',
    'MapPin',
    'Box',
    'Layers',
    'DollarSign',
    'LayoutDashboard',
    'ArrowUpRight',
    'Calendar',
    'X',
    'ChevronDown',
    'ChevronUp',
    'ChevronRight',
    'ChevronLeft',
    'ExternalLink',
  ]

  commonIcons.forEach((iconName) => {
    const icon = (LucideIcons as any)[iconName]
    if (icon) {
      nuxtApp.vueApp.component(iconName, icon)
      // Também registrar em kebab-case para suportar <users-icon /> ou <users />
      const kebabName = iconName
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
      nuxtApp.vueApp.component(kebabName, icon)
    }
  })
})
