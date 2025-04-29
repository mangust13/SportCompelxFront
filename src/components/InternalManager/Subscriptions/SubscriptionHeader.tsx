type Props = {
    total: number
    isFilterOpen: boolean
    setIsFilterOpen: (open: boolean) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    setIsAddingNew: (open: boolean) => void
  }
  
  export default function SubscriptionHeader({ total, isFilterOpen, setIsFilterOpen, searchTerm, setSearchTerm, setIsAddingNew }: Props) {
    return (
      <div className="relative bg-white shadow-sm p-4 rounded-xl flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Всього абонементів: {total}</h2>
  
          <div className="flex items-center gap-2">
          <button onClick={() => setIsAddingNew(true)}
                className="bg-primary text-white text-sm px-3 py-1 rounded hover:opacity-90">
            + Додати</button>

            <input
              type="text"
              placeholder="Пошук..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            />
  
            <select className="border rounded px-2 py-1 text-sm">
              <option value="name_asc">Назва: A-Z</option>
              <option value="name_desc">Назва: Z-A</option>
              <option value="cost_desc">Дорожчі</option>
              <option value="cost_asc">Дешевші</option>
            </select>
  
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-primary text-white text-sm px-3 py-1 rounded hover:opacity-90"
            >
              Фільтри
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
              <div>
                <p className="font-semibold mb-1">Вартість абонемента (грн):</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="від" className="border rounded px-2 py-1 w-full" />
                  <input type="number" placeholder="до" className="border rounded px-2 py-1 w-full" />
                </div>
              </div>
  
              <div>
                <p className="font-semibold mb-1">Термін абонемента:</p>
                <select className="border rounded px-2 py-1 w-full">
                  <option value="">Всі</option>
                  <option value="1 month">1 місяць</option>
                  <option value="3 months">3 місяці</option>
                  <option value="6 months">6 місяців</option>
                  <option value="12 months">12 місяців</option>
                </select>
              </div>
  
              <div>
                <p className="font-semibold mb-1">Час відвідування:</p>
                <select className="border rounded px-2 py-1 w-full">
                  <option value="">Всі</option>
                  <option value="Morning">Ранковий</option>
                  <option value="Day">Денний</option>
                  <option value="Evening">Вечірній</option>
                  <option value="Unlimited">Безлімітний</option>
                </select>
              </div>
  
              <button className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90">
                Застосувати фільтри
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  