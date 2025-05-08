import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubscriptionDto } from '../../../constants/types'
import SubscriptionCard from './SubscriptionCard'
import AddSubscriptionModal from './AddSubscriptionActivity'
import Header from '../../../layout/Header'
import { ExportModal } from '../../ExportModal'
import {exportData} from '../../../constants/exportData'

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [trigger, setTrigger] = useState(0)
  const [minCost, setMinCost] = useState<number | null>(null)
  const [maxCost, setMaxCost] = useState<number | null>(null)

  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [availableActivities, setAvailableActivities] = useState<string[]>([])

  const [selectedVisitTime, setSelectedVisitTime] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const handleExportFormat = (format: string) => {
    exportData(format, filteredSubscriptions)
    setIsExportModalOpen(false)
  }

  const handleDeleteSubscription = (subscriptionId: number) => {
    setSubscriptions(prev => prev.filter(p => p.subscriptionId !== subscriptionId))
  }

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.subscriptionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscriptionTotalCost.toString().includes(searchTerm) ||
    sub.subscriptionTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscriptionVisitTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.activities.some(a =>
      a.activityName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  
  useEffect(() => {
    axios.get('https://localhost:7270/api/Activities')
      .then(res => {
        const names = res.data.map((a: any) => a.activityName)
        setAvailableActivities(names)
      })
      .catch(err => console.error('Помилка завантаження активностей:', err))
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get<SubscriptionDto[]>('https://localhost:7270/api/Subscriptions/subscriptions-view',
        {
          params: {
            sortBy,
            order: sortOrder,
            minCost,
            maxCost,
            activities: activityFilters.join(','),
            visitTime: selectedVisitTime,
            term: selectedTerm
          }
        })
      setSubscriptions(res.data)
    } catch (err) {
      console.error('Помилка завантаження абонементів:', err)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [trigger, sortBy, sortOrder])

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього абонементів"
        total={subscriptions.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        triggerSearch={() => setTrigger(prev => prev + 1)}
        sortOptions={[
          { value: 'name', label: 'Назва' },
          { value: 'cost', label: 'Вартість' },
          { value: 'term', label: 'Термін' }
        ]}
        onAddNew={() => setIsAddingNew(true)}
        onExportClick={() => setIsExportModalOpen(true)}
      >
        {/* Filters */}
        <div className="flex flex-col gap-4 text-sm text-gray-700">
        {/* Вартість */}
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

        {/* Види активностей */}
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

        {/* Час відвідування */}
        <div>
          <p className="font-semibold mb-1">Час відвідування:</p>
          <select
            value={selectedVisitTime}
            onChange={(e) => setSelectedVisitTime(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Всі</option>
            <option value="Ранковий">Ранковий</option>
            <option value="Вечірний">Вечірний</option>
            <option value="Безлімітний">Безлімітний</option>
          </select>
        </div>

        {/* Тривалість */}
        <div>
          <p className="font-semibold mb-1">Тривалість абонемента:</p>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Всі</option>
            <option value="1 місяць">1 місяць</option>
            <option value="3 місяці">3 місяці</option>
            <option value="6 місяців">6 місяців</option>
            <option value="1 рік">1 рік</option>
          </select>
        </div>

        <button
          onClick={() => setTrigger(prev => prev + 1)}
          className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
        >
          Застосувати фільтри
        </button>
      </div>

      </Header>

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {filteredSubscriptions.map(sub => (
          <SubscriptionCard 
            key={sub.subscriptionId}
            subscription={sub}
            searchTerm={searchTerm}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
            onDelete={handleDeleteSubscription}
          />
        ))}
      </div>
      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          onSelectFormat={handleExportFormat}
        />
      )}
      {isAddingNew && (
        <AddSubscriptionModal
          onClose={() => setIsAddingNew(false)}
          onSuccess={() => {
            fetchSubscriptions()
            setIsAddingNew(false)
          }}/>
      )}
    </div>        
  )
}
