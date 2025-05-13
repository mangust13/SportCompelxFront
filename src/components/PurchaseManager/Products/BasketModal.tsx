import { useEffect, useState } from 'react'
import axios from 'axios'
import { SupplierDto } from '../PurchaseDtos'

type BasketItem = {
  productId: number
  productModel: string
  supplierId: number
  quantity: number
}

type Props = {
  onClose: () => void
  onConfirm: () => void
}

export default function BasketModal({ onClose, onConfirm }: Props) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])

  useEffect(() => {
    const basket = JSON.parse(localStorage.getItem('basket') || '[]')
    setItems(basket)

    axios.get<SupplierDto[]>('https://localhost:7270/api/Suppliers/all')
      .then(res => setSuppliers(res.data))
      .catch(() => {})
  }, [])

  const getSupplierName = (id: number) =>
    suppliers.find(s => s.supplierId === id)?.supplierName || `ID ${id}`

  const clearBasket = () => {
    localStorage.removeItem('basket')
    setItems([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold text-primary mb-4">Ваше замовлення</h2>

        {items.length === 0 ? (
          <p className="text-gray-600">Кошик порожній</p>
        ) : (
          <ul className="mb-4 text-sm text-gray-800 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <p><span className="font-semibold">Модель:</span> {item.productModel}</p>
                <p><span className="font-semibold">Постачальник:</span> {getSupplierName(item.supplierId)}</p>
                <p><span className="font-semibold">Кількість:</span> {item.quantity}</p>
              </li>
            ))}
          </ul>
        )}

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
              onClick={onConfirm}
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
