import { useEffect, useState } from 'react'
import axios from 'axios'
import { SupplierDto } from '../PurchaseDtos'
import { toast } from 'react-toastify'
import Select from 'react-select'

type BasketItem = {
  productId: number
  productModel: string
  quantity: number
  unitPrice: number
}

type Props = {
  onClose: () => void
  onConfirm: () => void
}

export default function BasketModal({ onClose, onConfirm }: Props) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)

  useEffect(() => {
    const basket = JSON.parse(localStorage.getItem('basket') || '[]')
    setItems(basket)

    axios.get<SupplierDto[]>('https://localhost:7270/api/Suppliers/all')
      .then(res => setSuppliers(res.data))
      .catch(() => {})
  }, [])

  const clearBasket = () => {
    localStorage.removeItem('basket')
    setItems([])
  }

  const handleConfirm = async () => {
    if (!selectedSupplierId) {
      toast.error('Оберіть постачальника')
      return
    }
    try {
      await axios.post('https://localhost:7270/api/Orders/create-from-basket', {
        supplierId: selectedSupplierId,
        items
      })
      toast.success('Замовлення створено!')
      clearBasket()
      onConfirm()
    } catch {
      toast.error('Помилка при створенні замовлення')
    }
  }

  const supplierOptions = suppliers.map(s => ({
    value: s.supplierId,
    label: `${s.supplierName} (${s.supplierPhoneNumber})`
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl w-[600px] mt-10 shadow-lg transition-all duration-300 overflow-visible">
        <h2 className="text-xl font-bold text-primary mb-4">Ваше замовлення</h2>

        {items.length === 0 ? (
          <p className="text-gray-600">Кошик порожній</p>
        ) : (
          <ul className="mb-4 text-sm text-gray-800 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="border-b pb-2 flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <p><span className="font-semibold">Модель:</span> {item.productModel}</p>
                  <p><span className="font-semibold">Кількість:</span> {item.quantity}</p>
                  <label className="text-sm">
                    <span className="font-semibold">Ціна (грн):</span>{' '}
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24 ml-2"
                      value={item.unitPrice}
                      min={0}
                      onChange={e => {
                        const newItems = [...items]
                        newItems[index].unitPrice = +e.target.value
                        setItems(newItems)
                        localStorage.setItem('basket', JSON.stringify(newItems))
                      }}
                    />
                  </label>
                </div>
                <button
                  className="text-red-500 text-xl"
                  onClick={() => {
                    const newItems = [...items]
                    newItems.splice(index, 1)
                    setItems(newItems)
                    localStorage.setItem('basket', JSON.stringify(newItems))
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="block mb-1 font-semibold">Постачальник:</label>
        <Select
          options={supplierOptions}
          value={supplierOptions.find(o => o.value === selectedSupplierId) || null}
          onChange={opt => setSelectedSupplierId(opt?.value || null)}
          placeholder="Оберіть постачальника"
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          className="mb-4"
        />

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={clearBasket}
            className="text-sm text-red-600 hover:underline"
            disabled={!items.length}
          >
            Очистити кошик
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-gray-500">Скасувати</button>
            <button
              onClick={handleConfirm}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!items.length}
            >
              Підтвердити замовлення
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
