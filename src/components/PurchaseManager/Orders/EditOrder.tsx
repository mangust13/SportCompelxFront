import { useState, useEffect } from 'react'
import axios from 'axios'
import Select from 'react-select'
import { ProductDto } from '../PurchaseDtos'
import { getAuthHeaders } from '../../../utils/authHeaders'

type EditProduct = {
  purchasedProductId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

type Props = {
  orderId: number
  initialProducts: EditProduct[]
  onClose: () => void
  onSave: (updatedProducts: EditProduct[]) => void
}

export default function EditOrderProducts({ orderId, initialProducts, onClose, onSave }: Props) {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [price, setPrice] = useState<number>(2000)
  const [quantity, setQuantity] = useState<number>(1)
  const [orderItems, setOrderItems] = useState(initialProducts)

  useEffect(() => {
    axios.get<ProductDto[]>('https://localhost:7270/api/Products/products-view')
      .then(res => setProducts(res.data))
  }, [])

  const handleAdd = () => {
    if (!selectedProductId || quantity < 1 || quantity > 10) return

    const prod = products.find(p => p.productId === selectedProductId)
    if (!prod) return

    setOrderItems(prev => [
      ...prev,
      {
        purchasedProductId: 0,
        productId: selectedProductId,
        productName: prod.productModel,
        quantity,
        unitPrice: price || 2000
      }
    ])
    setSelectedProductId(null)
    setPrice(2000)
    setQuantity(1)
  }

  const handleDelete = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      const payload = orderItems.map(item => ({
        purchasedProductId: item.purchasedProductId,
        productId: item.productId,
        quantity: item.quantity
      }))

      await axios.put(`https://localhost:7270/api/Orders/update-products/${orderId}`, payload, {
        headers: getAuthHeaders()
      })

      onSave(orderItems)
      onClose()
    } catch (error) {
      console.error('Помилка оновлення:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Редагувати товари замовлення</h2>

        <ul className="mb-4 space-y-2">
          {orderItems.map((item, i) => (
            <li key={i} className="border p-2 rounded flex justify-between items-center">
              <div>
                {item.productName} – {item.quantity} шт × {item.unitPrice} грн
              </div>
              <button className="text-red-500" onClick={() => handleDelete(i)}>🗑</button>
            </li>
          ))}
        </ul>

        <div className="mb-4 space-y-2">
          <Select
            options={products.map(p => ({ value: p.productId, label: p.productModel }))}
            onChange={opt => setSelectedProductId(opt?.value || null)}
            placeholder="Оберіть товар"
            value={products.find(p => p.productId === selectedProductId) ? {
              value: selectedProductId!,
              label: products.find(p => p.productId === selectedProductId)!.productModel
            } : null}
          />
          <div>
            <label className="text-sm font-medium">Ціна за одиницю (грн):</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={price}
              onChange={e => setPrice(+e.target.value)}
              min={1}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Кількість товару (1–10):</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(10, +e.target.value)))}
            />
          </div>

          <button onClick={handleAdd} className="bg-primary text-white px-4 py-1 rounded w-full">➕ Додати</button>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500">Скасувати</button>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
