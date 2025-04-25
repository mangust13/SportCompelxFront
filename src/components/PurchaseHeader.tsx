type Props = {
  total: number
  isFilterOpen: boolean
  setIsFilterOpen: (open: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

export default function PurchaseHeader({ total, isFilterOpen, setIsFilterOpen, searchTerm, setSearchTerm }: Props) {
  return (
    <div className="relative bg-white shadow-sm p-4 rounded-xl flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center">
        <h2 className="text-lg font-bold text-primary">Всього покупок: {total}</h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Пошук..."
            value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border rounded px-3 py-1 text-sm"
          />

          <select className="border rounded px-2 py-1 text-sm">
            <option value="date_desc">Сортувати: Новіші</option>
            <option value="date_asc">Сортувати: Старіші</option>
            <option value="cost_desc">Дорожчі</option>
            <option value="cost_asc">Дешевші</option>
          </select>

          <button
            onClick={() => setIsFilterOpen(true)}
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
              <p className="font-semibold mb-1">Метод оплати:</p>
              <div className="space-y-1">
                <label><input type="checkbox" /> Готівка</label><br />
                <label><input type="checkbox" /> Картка</label><br />
                <label><input type="checkbox" /> Онлайн</label>
              </div>
            </div>

            <div>
              <p className="font-semibold mb-1">Вартість підписки (грн):</p>
              <div className="flex gap-2">
                <input type="number" placeholder="від" className="border rounded px-2 py-1 w-full" />
                <input type="number" placeholder="до" className="border rounded px-2 py-1 w-full" />
              </div>
            </div>

            <div>
              <p className="font-semibold mb-1">Дата покупки:</p>
              <input type="date" className="border rounded px-2 py-1 w-full" />
            </div>

            <div>
              <p className="font-semibold mb-1">Стать клієнта:</p>
              <select className="border rounded px-2 py-1 w-full">
                <option value="">Всі</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <p className="font-semibold mb-1">Термін підписки:</p>
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
                <option value="Morning">Ранок</option>
                <option value="Day">День</option>
                <option value="Evening">Вечір</option>
                <option value="Unlimited">Без обмежень</option>
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
