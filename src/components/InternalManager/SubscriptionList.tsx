import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubscriptionDto } from '../../constants/types'

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([])

  useEffect(() => {
    axios.get('https://localhost:7270/api/Subscriptions/subscriptions-view')
      .then(res => setSubscriptions(res.data))
      .catch(err => console.error('Помилка завантаження підписок:', err))
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {subscriptions.map(sub => (
        <div key={sub.subscriptionId} className="bg-white p-4 shadow-md rounded-xl">
          <h3 className="text-lg font-bold text-primary">{sub.subscriptionName}</h3>
          <p className="text-sm text-gray-700">Ціна: {sub.subscriptionTotalCost} грн</p>
          <p className="text-sm text-gray-700">Термін: {sub.subscriptionTerm}</p>
          <p className="text-sm text-gray-700">Час відвідування: {sub.subscriptionVisitTime}</p>

          <p className="mt-3 text-sm font-semibold text-gray-800">Види активності:</p>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            {sub.activities.map((a, i) => (
              <li key={i} className="border rounded px-2 py-1 bg-gray-50">
                <p><strong>{a.activityName}</strong></p>
                <p>Ціна: {a.activityPrice} грн</p>
                <p>Кількість: {a.activityTypeAmount}</p>
                <p className="text-xs text-gray-500">{a.activityDescription}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
