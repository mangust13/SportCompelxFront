import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { PurchasedProductDto } from '../PurchaseDtos'
import { getAuthHeaders } from '../../../utils/authHeaders'

export type SportComplexOption = {
  gymId: number
  gymNumber: number
  complexAddress: string
  complexCity: string
}

type Props = {
  product: PurchasedProductDto
  orderDate: string
  onClose: () => void
  onSuccess: (newDelivery: any) => void
  availableQuantity: number
}

export default function AddDelivery({ product, orderDate, onClose, onSuccess, availableQuantity }: Props) {
  const [gyms, setGyms] = useState<SportComplexOption[]>([])
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [quantity, setQuantity] = useState<number>(1)

  const today = new Date().toISOString().split('T')[0]
  const orderMinDate = new Date(orderDate).toISOString().split('T')[0]

  useEffect(() => {
    axios.get<SportComplexOption[]>('https://localhost:7270/api/Orders/gyms', {
      headers: getAuthHeaders()
    })
      .then(res => setGyms(res.data))
      .catch(() => toast.error('Помилка завантаження залів'))
  }, [])

  const gymOptions = gyms.map(g => ({
    value: g.gymId,
    label: `Зал №${g.gymNumber}, ${g.complexAddress}, ${g.complexCity}`
  }))

  const handleSave = async () => {
    if (!selectedGymId || !date || quantity <= 0 || quantity > product.quantity) {
      toast.error('Перевірте правильність введених даних')
      return
    }

    try {
      const res = await axios.post('https://localhost:7270/api/Orders/add-delivery', {
        purchasedProductId: product.purchasedProductId,
        gymId: selectedGymId,
        deliveryDate: date,
        deliveredQuantity: quantity
      }, {
        headers: getAuthHeaders()
      })

      toast.success('Поставку додано!')
      onSuccess(res.data)
      onClose()
    } catch {
      toast.error('Помилка при додаванні поставки')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[500px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-primary">Нова поставка</h2>

        <div>
          <label className="text-sm font-medium">Дата поставки:</label>
          <input
            type="date"
            min={orderMinDate}
            max={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Спорткомплекс і зал:</label>
          <Select
            options={gymOptions}
            onChange={opt => setSelectedGymId(opt?.value ?? null)}
            placeholder="Оберіть локацію"
            isClearable
          />
        </div>

        <div>
          <label className="text-sm font-medium">Кількість:</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            min={1}
            max={availableQuantity}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Максимум: {availableQuantity}</p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
