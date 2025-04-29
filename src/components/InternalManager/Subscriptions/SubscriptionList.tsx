import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubscriptionDto } from '../../../constants/types'
import SubscriptionCard from './SubscriptionCard'
import SubscriptionHeader from './SubscriptionHeader'
import AddSubscriptionModal from './AddSubscriptionModal'

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    axios.get('https://localhost:7270/api/Subscriptions/subscriptions-view')
      .then(res => setSubscriptions(res.data))
      .catch(err => console.error('Помилка завантаження абнемента:', err))
  }, [])

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <SubscriptionHeader
        total={subscriptions.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsAddingNew={setIsAddingNew}
      />

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {subscriptions.map(sub => (
          <SubscriptionCard 
            key={sub.subscriptionId}
            subscription={sub}
            searchTerm={searchTerm}
            expandedCardId={expandedCardId}
            setExpandedCardId={setExpandedCardId}
          />
        ))}
      </div>
      {isAddingNew && (
  <AddSubscriptionModal
    onClose={() => setIsAddingNew(false)}/>
)}
    </div>        
  )
}
