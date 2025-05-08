type FilterHeaderProps = {
  title: string
  total: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  onAddNew?: () => void
  isFilterOpen?: boolean
  setIsFilterOpen?: (open: boolean) => void
  sortBy?: string
  setSortBy?: (value: string) => void
  sortOrder?: 'asc' | 'desc'
  setSortOrder?: (value: 'asc' | 'desc') => void
  sortOptions?: { value: string, label: string }[]
  triggerSearch?: () => void
  children?: React.ReactNode
  onExportClick?: () => void
}

  
  export default function FilterHeader({
    title, total, isFilterOpen, setIsFilterOpen, searchTerm, setSearchTerm,
    sortBy, setSortBy, sortOrder, setSortOrder, sortOptions, triggerSearch, onAddNew, children, onExportClick
  }: FilterHeaderProps) {
    return (
      <div className="relative bg-white shadow-sm p-4 rounded-xl flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-lg font-bold text-primary">
            {title}: {total}
          </h2>
  
          <div className="flex items-center gap-2">
            {onExportClick && (
            <button
              onClick={onExportClick}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:opacity-90">
              📤 Експорт
            </button>)}
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="bg-primary text-white text-sm px-3 py-1 rounded hover:opacity-90">
                + Додати
              </button>
            )}

            <input
              type="text"
              placeholder="Пошук..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            />
  
            {sortOptions && sortBy && setSortBy && triggerSearch && (
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                triggerSearch()
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
  
          {sortOrder && setSortOrder && triggerSearch && (
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              triggerSearch()
            }}
            className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            title={`Сортування: ${sortOrder === 'asc' ? 'зростання' : 'спадання'}`}
          >
            {sortOrder === 'asc' ? '⬆️' : '⬇️'}
          </button>
        )}
  
        {isFilterOpen !== undefined && setIsFilterOpen && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-3 py-1 rounded hover:opacity-90 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
            </button>
        )}
          </div>
        </div>
  
        {isFilterOpen && (
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-6 z-50">
            {children}
          </div>
        )}
      </div>
    )
  }
  