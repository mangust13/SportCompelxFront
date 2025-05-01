import { useEffect, useState } from 'react'
import axios from 'axios'
import { SubscriptionDto } from '../../../constants/types'
import { toast } from 'react-toastify'
import Select from 'react-select'

type ClientDto = {
  clientId: number
  clientFullName: string
  clientPhoneNumber: string
  clientGender: string
}

type Props = {
  subscription: SubscriptionDto
  onClose: () => void
  onSuccess: () => void
}

export default function AddPurchaseModal({ subscription, onClose, onSuccess }: Props) {
  const [clients, setClients] = useState<ClientDto[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientGender, setNewClientGender] = useState('Чоловік')

  const [paymentMethodId, setPaymentMethodId] = useState(1)     

  useEffect(() => {
    axios.get('https://localhost:7270/api/Clients')
      .then(res => setClients(res.data))
      .catch(err => console.error('Помилка завантаження клієнтів:', err))
  }, [])

  const clientOptions = clients.map(c => ({
    value: c.clientId,
    label: `${c.clientFullName} (${c.clientPhoneNumber} • ${c.clientGender})`
  }))
  
  

  const handleAddNewClient = async () => {
    try {
      const response = await axios.post<ClientDto>('https://localhost:7270/api/Clients', {
        clientFullName: newClientName.trim(),
        clientPhoneNumber: newClientPhone.trim(),
        clientGender: newClientGender
      })

      setClients(prev => [...prev, response.data])
      setSelectedClientId(response.data.clientId)

      setNewClientName('')
      setNewClientPhone('')
      setNewClientGender('Чоловік')
      setIsAddOpen(false)

      toast.success('Клієнт успішно доданий!')
    } catch (error) {
      toast.error('Помилка при додаванні клієнта.')
    }
  }

  const handleSave = async () => {
    if (!selectedClientId) {
      toast.error('Оберіть клієнта для покупки.')
      return
    }

    if (!paymentMethodId) {
      toast.error('Оберіть метод оплати.')
      return
    }

    try {
      await axios.post('https://localhost:7270/api/Purchases', {
        clientId: selectedClientId,
        subscriptionId: subscription.subscriptionId,
        paymentMethodId: paymentMethodId
      }
    )

      toast.success('Покупка успішно оформлена!')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Помилка при оформленні покупки.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-primary">Нова покупка</h2>

        {/* Пошук клієнта */}
        <div>
            <p className="font-semibold mb-1">Клієнт:</p>
            <Select
                options={clientOptions}
                onChange={(selected) => setSelectedClientId(selected?.value || null)}
                placeholder="Оберіть клієнта..."
                isClearable
            />
        </div>



        {/* Метод оплати */}
        <div>
          <p className="font-semibold mb-1">Метод оплати:</p>
          <select
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          >
            <option value={1}>Карта</option>
            <option value={2}>Готівка</option>
          </select>
        </div>

        {/* Додати нового клієнта */}
        <div className="mt-4 border-t pt-4">
          {!isAddOpen ? (
            <button
              onClick={() => setIsAddOpen(true)}
              className="text-sm text-primary font-medium"
            >
              ➕ Додати нового клієнта
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-primary">Новий клієнт</p>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Скасувати
                </button>
              </div>

              <input
                type="text"
                placeholder="Повне ім'я"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />

              <input
                type="text"
                placeholder="Номер телефону"
                value={newClientPhone}
                onChange={(e) => setNewClientPhone(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />

              <select
                value={newClientGender}
                onChange={(e) => setNewClientGender(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="Чоловік">Чоловік</option>
                <option value="Жінка">Жінка</option>
              </select>

              <button
                onClick={handleAddNewClient}
                disabled={!newClientName.trim() || !newClientPhone.trim()}
                className="mt-2 bg-primary text-white py-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Додати клієнта
              </button>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90"
          >
            Підтвердити покупку
          </button>
        </div>
      </div>
    </div>
  )
}
