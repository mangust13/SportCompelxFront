import { useEffect, useState } from 'react'
import { highlightMatch } from '../../../utils/highlightMatch'
import { ProductDto,OrderDto, PurchasedProductDto } from '../PurchaseDtos'
import AddDelivery from './AddDelivery'
import EditOrder from './EditOrder'
import { toast } from 'react-toastify'
import axios from 'axios'

type Props = {
  order: OrderDto
  search: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
  onUpdate: (updatedOrder: OrderDto) => void
}

export default function OrderCard({ order, search, expandedCardId, setExpandedCardId, onUpdate }: Props) {
  const isExpanded = expandedCardId === order.orderId
  const [addingDeliveryProduct, setAddingDeliveryProduct] = useState<{
    product: PurchasedProductDto
    availableQuantity: number
  } | null>(null)
  const [isEditingProducts, setIsEditingProducts] = useState(false)
  const [products, setProducts] = useState<ProductDto[]>([])

  useEffect(() => {
    axios.get<ProductDto[]>('https://localhost:7270/api/Products/products-view')
      .then(res => setProducts(res.data))
      .catch(() => {})
  }, [])

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : order.orderId)
  }

  type EditProduct = {
    purchasedProductId: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
  }


  function handleOrderProductsSave(updatedProducts: EditProduct[]) {
    toast.success('Замовлення оновлено!')

    const enrichedProducts = updatedProducts.map(p => {
      const matched = products.find(prod => prod.productId === p.productId)

      return {
        ...p,
        brandName: matched?.brandName || '',
        productType: matched?.productTypeName || '',
        productDescription: matched?.productDescription || '',
        deliveries: []
      }
    })

    const updatedTotal = enrichedProducts.reduce(
      (acc, p) => acc + p.unitPrice * p.quantity,
      0
    )

    const updatedOrder = {
      ...order,
      purchasedProducts: enrichedProducts,
      orderTotalPrice: updatedTotal
    }

    onUpdate(updatedOrder)
  }

  const isCompleted = order.orderStatus === 'Виконане'

  const statusColor =
    isCompleted ? 'bg-green-500'
    : order.orderStatus === 'В процесі' ? 'bg-yellow-500'
    : 'bg-gray-500'

  return (
    <div
      className={`relative bg-white shadow-md rounded-xl p-4 border-2 w-full ${
        isCompleted
          ? 'border-green-500'
          : order.orderStatus === 'В процесі'
          ? 'border-yellow-500'
          : 'border-gray-500'
      }`}
    >
      <div className={`absolute top-0 left-0 w-full rounded-t-xl text-center text-white text-sm font-semibold py-1 ${statusColor}`}>
        {isCompleted ? 'Поставка завершена' : order.orderStatus === 'В процесі' ? 'Очікується доставка' : 'Статус невідомий'}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 mt-6">
        <div>
          <h2 className="text-xl font-bold">
            Замовлення №{highlightMatch(order.orderNumber.toString(), search)}
          </h2>
          <p className="text-sm text-gray-500">
            {highlightMatch(new Date(order.orderDate).toLocaleDateString(), search)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-white text-sm ${statusColor}`}>
          {highlightMatch(order.orderStatus, search)}
        </span>
      </div>

      <div className="mb-2 text-sm text-gray-700">
        <p>
          <strong>Постачальник:</strong> {highlightMatch(order.supplierName, search)}
          <span className="mx-2 text-gray-400">|</span>
          <strong>Сума:</strong> {highlightMatch(order.orderTotalPrice.toString(), search)} грн
          <span className="mx-2 text-gray-400">|</span>
          <strong>Оплата:</strong> {highlightMatch(order.paymentMethod, search)}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleExpandToggle}
          className="text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? 'Сховати деталі' : 'Показати деталі'}
        </button>
        <button
          onClick={() => setIsEditingProducts(true)}
          className="text-sm text-yellow-600 hover:underline"
        >
          ✏️ Редагувати товари
        </button>
      </div>


      {isExpanded && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full table-fixed text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 break-words">Назва товару</th>
                <th className="border px-2 py-1">Кількість</th>
                <th className="border px-2 py-1">Ціна за одиницю</th>
                <th className="border px-2 py-1">Бренд</th>
                <th className="border px-2 py-1">Тип</th>
                <th className="border px-2 py-1">Поставки</th>
              </tr>
            </thead>
            <tbody>
              {order.purchasedProducts.map((product) => {
                const delivered = product.deliveries.reduce((acc, d) => acc + d.deliveredQuantity, 0)
                const availableQuantity = product.quantity - delivered
                const canAddDelivery = !isCompleted && availableQuantity > 0

                return (
                  <tr key={product.purchasedProductId} className="hover:bg-gray-50 align-top">
                    <td className="border px-2 py-1 font-semibold">{highlightMatch(product.productName, search)}</td>
                    <td className="border px-2 py-1">{product.quantity}</td>
                    <td className="border px-2 py-1">{product.unitPrice} грн</td>
                    <td className="border px-2 py-1">{product.brandName}</td>
                    <td className="border px-2 py-1">{product.productType}</td>
                    <td className="border px-2 py-1 space-y-1 text-sm">
                      {product.deliveries.length > 0 ? (
                        <details>
                          <summary className="cursor-pointer text-blue-500">Показати</summary>
                          <ul className="mt-1 space-y-1 text-xs">
                            {product.deliveries.map((delivery) => (
                              <li key={delivery.deliveryId} className="border p-1 rounded bg-gray-50">
                                <p>📦 #{delivery.deliveryId}</p>
                                <p>Дата: {new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                                <p>К-сть: {delivery.deliveredQuantity}</p>
                                <p>Зал №{delivery.gymNumber}, {delivery.complexAddress}, {delivery.complexCity}</p>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <p className="text-gray-500 text-xs">Немає</p>
                      )}

                      {canAddDelivery && (
                        <button
                          onClick={() => setAddingDeliveryProduct({ product, availableQuantity })}
                          className="text-xs text-blue-600 mt-1 hover:underline"
                        >
                          ➕ Додати поставку
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {addingDeliveryProduct && (
        <AddDelivery
          product={addingDeliveryProduct.product}
          orderDate={order.orderDate}
          availableQuantity={addingDeliveryProduct.availableQuantity}
          onClose={() => setAddingDeliveryProduct(null)}
          onSuccess={(newDelivery) => {
            const updatedProducts = order.purchasedProducts.map(p =>
              p.purchasedProductId === addingDeliveryProduct.product.purchasedProductId
                ? { ...p, deliveries: [...p.deliveries, newDelivery] }
                : p
            )

            const updatedStatus = newDelivery.orderStatus ?? order.orderStatus

            const updatedOrder = {
              ...order,
              purchasedProducts: updatedProducts,
              orderStatus: updatedStatus
            }

            onUpdate(updatedOrder)
            setAddingDeliveryProduct(null)
          }}
        />
      )}

      {isEditingProducts && (
        <EditOrder
          orderId={order.orderId}
          initialProducts={order.purchasedProducts.map(p => ({
            purchasedProductId: p.purchasedProductId,
            productId: p.productId,
            productName: p.productName,
            quantity: p.quantity,
            unitPrice: p.unitPrice
          }))}
          onClose={() => setIsEditingProducts(false)}
          onSave={handleOrderProductsSave}
        />
      )}
    </div>
  )
}
