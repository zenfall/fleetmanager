'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Calendar,
  Download,
  Edit2,
  Trash2
} from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchKeys?: (keyof T)[]
  title: string
  emptyMessage?: string
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  filterOptions?: {
    key: keyof T
    label: string
    options: { value: string; label: string }[]
  }[]
  dateFilterKey?: keyof T
  exportable?: boolean
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 10,
  searchKeys = [],
  title,
  emptyMessage = 'Aucune donnee',
  onEdit,
  onDelete,
  filterOptions = [],
  dateFilterKey,
  exportable = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (searchTerm && searchKeys.length > 0) {
      const term = searchTerm.toLowerCase()
      result = result.filter(item => 
        searchKeys.some(key => {
          const value = item[key]
          return value && String(value).toLowerCase().includes(term)
        })
      )
    }

    // Category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => String(item[key as keyof T]) === value)
      }
    })

    // Date range filter
    if (dateFilterKey && (dateRange.start || dateRange.end)) {
      result = result.filter(item => {
        const itemDate = new Date(String(item[dateFilterKey]))
        if (dateRange.start && itemDate < new Date(dateRange.start)) return false
        if (dateRange.end && itemDate > new Date(dateRange.end)) return false
        return true
      })
    }

    // Sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T]
        const bVal = b[sortConfig.key as keyof T]
        
        if (aVal === bVal) return 0
        
        const comparison = aVal < bVal ? -1 : 1
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, searchKeys, filters, dateRange, dateFilterKey, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // Reset to page 1 when filters change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map(c => c.label).join(',')
    const rows = filteredData.map(item => 
      columns.map(col => {
        const value = item[col.key as keyof T]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value ?? '')
      }).join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    setDateRange({ start: '', end: '' })
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v) || dateRange.start || dateRange.end

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredData.length} {filteredData.length === 1 ? 'element' : 'elements'}
              {hasActiveFilters && ` (filtre actif)`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchKeys.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background w-48 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
            
            {/* Filter toggle */}
            {(filterOptions.length > 0 || dateFilterKey) && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-muted'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
            
            {/* Export */}
            {exportable && filteredData.length > 0 && (
              <button
                onClick={handleExport}
                className="p-2 rounded-lg border border-input hover:bg-muted transition-colors"
                title="Exporter en CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-end gap-3">
              {/* Category filters */}
              {filterOptions.map(filter => (
                <div key={String(filter.key)} className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">{filter.label}</label>
                  <select
                    value={filters[String(filter.key)] || ''}
                    onChange={(e) => handleFilterChange(String(filter.key), e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="">Tous</option>
                    {filter.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              {/* Date range */}
              {dateFilterKey && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Du
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, start: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Au</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, end: e.target.value }))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
                    />
                  </div>
                </>
              )}
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  Effacer filtres
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {paginatedData.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      col.sortable ? 'cursor-pointer hover:text-foreground select-none' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortConfig?.key === col.key && (
                        <span className="text-primary">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                >
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm">
                      {col.render 
                        ? col.render(item) 
                        : String(item[col.key as keyof T] ?? '-')
                      }
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cet element ?')) {
                                onDelete(item)
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} sur {filteredData.length}
          </p>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
