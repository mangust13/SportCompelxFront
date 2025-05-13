import { useState, useEffect } from 'react'
import Select from 'react-select'
import { PurchaseDto, ClientDto } from '../InternalDtos'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAuthHeaders } from '../../../utils/authHeaders'

type Props = {
  purchase: PurchaseDto
  onClose: () => void
  onSave: (updated: PurchaseDto) => void
}

type SubscriptionOption = {
  id: number
  name: string
  totalCost: number
}

export default function EditPurchase({ purchase, onClose, onSave }: Props) {
  const [edited, setEdited] = useState<PurchaseDto>(purchase)
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionOption[]>([])
  const [clients, setClients] = useState<ClientDto[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [allPayments, setAllPayments] = useState<string[]>(['Карта', 'Готівка'])

  useEffect(() => {
  setEdited(purchase)

  axios.get('https://localhost:7270/api/Purchases/subscriptions-names')
    .then(res => setAllSubscriptions(res.data))
    .catch(err => console.error('Помилка завантаження абонементів:', err))

  axios.get('https://localhost:7270/api/Clients')
    .then(res => {
      setClients(res.data)
      const existingClient = res.data.find(
        (c: ClientDto) =>
          c.clientFullName === purchase.clientFullName &&
          c.clientPhoneNumber === purchase.clientPhoneNumber
      )
      if (existingClient) {
        setSelectedClientId(existingClient.clientId)
      }
    })
    .catch(err => console.error('Помилка завантаження клієнтів:', err))
}, [purchase])

  const clientOptions = clients.map(c => ({
    value: c.clientId,
    label: `${c.clientFullName} (${c.clientPhoneNumber} • ${c.clientGender})`
  }))

  const subscriptionOptions = allSubscriptions.map(s => ({
    value: s.id,
    label: `${s.name} — ${s.totalCost} грн`
  }))

  const handleClientChange = (selected: any) => {
    if (selected) {
      const client = clients.find(c => c.clientId === selected.value)
      if (client)
        setSelectedClientId(client.clientId)
      else
        setSelectedClientId(null)
    }
  }

  const handleSubscriptionChange = (selected: any) => {
    if (selected) {
      const subscription = allSubscriptions.find(s => s.id === selected.value)
      if (subscription) {
        handleChange('subscriptionId', subscription.id)
        handleChange('subscriptionName', subscription.name)
        handleChange('subscriptionTotalCost', subscription.totalCost)
      }
    } else {
      handleChange('subscriptionId', 0)
      handleChange('subscriptionName', '')
      handleChange('subscriptionTotalCost', 0)
    }
  }

  const handleChange = (field: keyof PurchaseDto, value: any) => {
    setEdited(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!selectedClientId) {
      toast.error('Оберіть клієнта')
      return
    }

    try {
      const res = await axios.put<PurchaseDto>(
        `https://localhost:7270/api/Purchases/${purchase.purchaseId}`, 
        {
        clientId: selectedClientId,
        paymentMethod: edited.paymentMethod,
        subscriptionId: edited.subscriptionId,
        purchaseDate: edited.purchaseDate,
        subscriptionTotalCost: edited.subscriptionTotalCost
        },
          {headers: getAuthHeaders()})
      toast.success('Покупку оновлено!')
      onSave(res.data)
      onClose()
    } catch (error) {
      toast.error('Помилка оновлення покупки!')
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[120vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Редагування покупки</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-red-500">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Клієнт */}
          <div className="md:col-span-2">
            <p className="font-semibold mb-1">Клієнт:</p>
            <Select
              options={clientOptions}
              value={clientOptions.find(opt => opt.value === selectedClientId) || null}
              onChange={handleClientChange}
              placeholder="Оберіть клієнта..."
              isClearable
            />
          </div>

          {/* Метод оплати */}
          <div>
            <p className="font-semibold mb-1">Метод оплати:</p>
            <select
              value={edited.paymentMethod}
              onChange={e => handleChange('paymentMethod', e.target.value)}
              className="border p-2 rounded w-full"
            >
              {allPayments.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Абонемент */}
          <div>
            <p className="font-semibold mb-1">Абонемент:</p>
            <Select
              options={subscriptionOptions}
              value={subscriptionOptions.find(opt => opt.value === edited.subscriptionId) || null}
              onChange={handleSubscriptionChange}
              placeholder="Оберіть абонемент..."
              isClearable
            />
          </div>

          {/* Дата покупки */}
            <div>
              <p className="font-semibold mb-1">Дата покупки:</p>
              <input
                type="date"
                value={edited.purchaseDate.slice(0, 10)}
                onChange={e => handleChange('purchaseDate', e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>

            {/* Вартість (ручне редагування) */}
            <div>
              <p className="font-semibold mb-1">Ціна абонемента:</p>
              <input
                type="number"
                value={edited.subscriptionTotalCost}
                onChange={e => handleChange('subscriptionTotalCost', parseFloat(e.target.value))}
                className="border p-2 rounded w-full"
                min={0}
                step={0.01}
              />
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}
