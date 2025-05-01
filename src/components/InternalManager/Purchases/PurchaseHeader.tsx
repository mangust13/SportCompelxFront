type Props = {
  total: number
  isFilterOpen: boolean
  setIsFilterOpen: (open: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (value: 'asc' | 'desc') => void

  activityFilters: string[]
  setActivityFilters: React.Dispatch<React.SetStateAction<string[]>>
  availableActivities: string[]

  selectedPaymentMethods: string[]
  setSelectedPaymentMethods: React.Dispatch<React.SetStateAction<string[]>>

  selectedGender: string
  setSelectedGender: React.Dispatch<React.SetStateAction<string>>

  minCost: number | null
  setMinCost: React.Dispatch<React.SetStateAction<number | null>>

  maxCost: number | null
  setMaxCost: React.Dispatch<React.SetStateAction<number | null>>

  purchaseDate: string
  setPurchaseDate: React.Dispatch<React.SetStateAction<string>>

  triggerSearch: () => void
}


export default function PurchaseHeader({
  total, isFilterOpen, setIsFilterOpen, searchTerm, setSearchTerm,
  sortBy, setSortBy, sortOrder, setSortOrder, activityFilters, setActivityFilters, availableActivities,
  selectedPaymentMethods, setSelectedPaymentMethods, selectedGender, setSelectedGender,
  minCost, setMinCost, maxCost, setMaxCost, purchaseDate, setPurchaseDate, triggerSearch
}: Props & { triggerSearch: () => void }) {
  return (
    <div className="relative bg-white shadow-sm p-4 rounded-xl flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-lg font-bold text-primary">Всього покупок: {total}</h2>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Пошук..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="purchaseNumber">Номер покупки</option>
            <option value="purchaseDate">Дата покупки</option>
            <option value="subscriptionTotalCost">Ціна абонемента</option>
            <option value="subscriptionName">Назва абонемента</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            title={`Сортування: ${sortOrder === 'asc' ? 'зростання' : 'спадання'}`}
          >
            {sortOrder === 'asc' ? '⬆️' : '⬇️'}
          </button>

          {/* Filtration */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-3 py-1 rounded hover:opacity-90 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
              strokeWidth={1.5} stroke="currentColor"
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-6 z-50 transition-transform transform translate-x-0 animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary">Фільтри</h3>
            <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 text-3xl">
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-4 text-sm text-gray-700">
            {/* Payment methods */}
            <div className="flex gap-4 flex-wrap">
              {['Готівка', 'Карта'].map(method => (
                <label key={method} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedPaymentMethods.includes(method)}
                    onChange={() =>
                      setSelectedPaymentMethods(prev =>
                        prev.includes(method)
                          ? prev.filter(m => m !== method)
                          : [...prev, method]
                      )
                    }
                  />
                  {method}
                </label>
              ))}
            </div>

            {/* Cost */}
            <div>
              <p className="font-semibold mb-1">Вартість абонемента (грн):</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="від"
                  value={minCost ?? ''}
                  onChange={(e) => setMinCost(e.target.value ? Number(e.target.value) : null)}
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  type="number"
                  placeholder="до"
                  value={maxCost ?? ''}
                  onChange={(e) => setMaxCost(e.target.value ? Number(e.target.value) : null)}
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <p className="font-semibold mb-1">Дата покупки:</p>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* Gender */}
            <div>
              <p className="font-semibold mb-1">Стать клієнта:</p>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="">Всі</option>
                <option value="Чоловік">Чоловік</option>
                <option value="Жінка">Жінка</option>
              </select>
            </div>

            {/* Activities */}
            <div>
              <p className="font-semibold mb-1">Види активностей:</p>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {availableActivities.map(name => (
                  <label key={name} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={activityFilters.includes(name)}
                      onChange={() =>
                        setActivityFilters(prev =>
                          prev.includes(name)
                            ? prev.filter(a => a !== name)
                            : [...prev, name]
                        )
                      }
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={triggerSearch}
              className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
            >
              Застосувати фільтри
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
