import { useState, useEffect } from 'react'
import Select from 'react-select'
import { PurchaseDto } from '../../../utils/types'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Props = { purchase: PurchaseDto; onClose: () => void; onSave: (updated: PurchaseDto) => void }
type SubscriptionOption = { name: string; totalCost: number }
type ClientDto = { clientId: number; clientFullName: string; clientPhoneNumber: string; clientGender: string }

export default function EditPurchase({ purchase, onClose, onSave }: Props) {
  const [edited, setEdited] = useState<PurchaseDto>(purchase)
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionOption[]>([])
  const [allPayments, setAllPayments] = useState<string[]>([])
  const [clients, setClients] = useState<ClientDto[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  useEffect(() => {
    setEdited(purchase)

    axios.get('https://localhost:7270/api/Purchases/subscriptions-names')
      .then(res => setAllSubscriptions(res.data))
      .catch(err => console.error('Помилка завантаження абонементів:', err))

    axios.get('https://localhost:7270/api/Clients')
      .then(res => setClients(res.data))
      .catch(err => console.error('Помилка завантаження клієнтів:', err))

    setAllPayments(['Карта', 'Готівка'])
  }, [purchase])

  useEffect(() => {
    const existingClient = clients.find(c => c.clientFullName === purchase.clientFullName)
    if (existingClient) {
      setSelectedClientId(existingClient.clientId)
    }
  }, [clients, purchase])
  

  const clientOptions = clients.map(c => ({
    value: c.clientId,
    label: `${c.clientFullName} (${c.clientPhoneNumber} • ${c.clientGender})`
  }))

  const handleClientChange = (selected: any) => {
    if (selected) {
      const client = clients.find(c => c.clientId === selected.value)
      if (client) {
        setSelectedClientId(client.clientId)
        handleChange('clientFullName', client.clientFullName)
        handleChange('clientPhoneNumber', client.clientPhoneNumber)
        handleChange('clientGender', client.clientGender)
      }
    } else {
      setSelectedClientId(null)
      handleChange('clientFullName', '')
      handleChange('clientPhoneNumber', '')
      handleChange('clientGender', '')
    }
  }

  const handleChange = (field: keyof PurchaseDto, value: any) => { setEdited({ ...edited, [field]: value }) }

  const handleSave = async () => {
    try {
      const res = await axios.put<PurchaseDto>(`https://localhost:7270/api/Purchases/${purchase.purchaseId}`, {
        clientId: selectedClientId,
        paymentMethod: edited.paymentMethod,
        subscriptionName: edited.subscriptionName
      })
  
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
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg overflow-y-auto max-h-[90vh]">
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
              value={clientOptions.find(option => option.value === selectedClientId) || null}
              onChange={handleClientChange}
              placeholder="Оберіть клієнта..."
              isClearable
            />
          </div>

          {/* Метод оплати */}
          <select
            value={edited.paymentMethod}
            onChange={e => handleChange('paymentMethod', e.target.value)}
            className="border p-2 rounded"
          >
            {allPayments.map(p => <option key={p}>{p}</option>)}
          </select>

          {/* Абонемент */}
          <select
            value={edited.subscriptionName}
            onChange={e => {
              const selectedName = e.target.value
              const selectedSub = allSubscriptions.find(s => s.name === selectedName)
              handleChange('subscriptionName', selectedName)
              if (selectedSub) handleChange('subscriptionTotalCost', selectedSub.totalCost)
            }}
            className="border p-2 rounded"
          >
            {allSubscriptions.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>

          {/* Вартість */}
          <div className="font-semibold text-gray-700 mt-1 col-span-full">
            Загальна вартість: {edited.subscriptionTotalCost} грн
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
