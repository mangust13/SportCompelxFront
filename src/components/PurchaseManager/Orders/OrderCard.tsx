import { useState } from 'react';
import { OrderDto } from '../../../constants/types';
import { highlightMatch } from '../../../constants/highlightMatch';

type Props = {
  order: OrderDto;
  search: string;
  expandedCardId: number | null;
  setExpandedCardId: (id: number | null) => void;
};

export default function OrderCard({ order, search, expandedCardId, setExpandedCardId }: Props) {
  const isExpanded = expandedCardId === order.orderId;

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : order.orderId);
  };

  const statusColor =
    order.orderStatus === 'Виконане'
      ? 'bg-green-500'
      : order.orderStatus === 'В процесі'
      ? 'bg-yellow-500'
      : 'bg-gray-500';

  return (
    <div className={`bg-white shadow-md rounded-xl p-4 border-2 w-full overflow-x-auto ${order.orderStatus === 'Виконане' ? 'border-green-500' : order.orderStatus === 'В процесі' ? 'border-yellow-500' : 'border-gray-500'}`}>
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
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

      {/* Інформація про постачальника */}
      <div className="mb-4 text-sm text-gray-700">
        <p>
          <strong>Постачальник:</strong> {highlightMatch(order.supplierName, search)}
          <span className="mx-2 text-gray-400">|</span>
          <strong>Сума:</strong> {highlightMatch(order.orderTotalPrice.toString(), search)} грн
          <span className="mx-2 text-gray-400">|</span>
          <strong>Оплата:</strong> {highlightMatch(order.paymentMethod, search)}
        </p>
      </div>

      {/* Таблиця */}
      <div className="overflow-x-auto">
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
            {order.purchasedProducts.map((product) => (
              <tr key={product.purchasedProductId} className="hover:bg-gray-50">
                <td className="border px-2 py-1 font-semibold">{highlightMatch(product.productName, search)}</td>
                <td className="border px-2 py-1">{highlightMatch(product.quantity.toString(), search)}</td>
                <td className="border px-2 py-1">{highlightMatch(product.unitPrice.toString(), search)} грн</td>
                <td className="border px-2 py-1">{highlightMatch(product.brandName, search)}</td>
                <td className="border px-2 py-1">{highlightMatch(product.productType, search)}</td>
                <td className="border px-2 py-1">
                  {product.deliveries.length > 0 ? (
                    <details>
                      <summary className="cursor-pointer text-blue-500">Показати</summary>
                      <ul className="mt-1 space-y-1 text-xs">
                        {product.deliveries.map(delivery => (
                          <li key={delivery.deliveryId} className="border p-1 rounded bg-gray-50">
                            <p>📦 #{delivery.deliveryId}</p>
                            <p>Дата: {new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                            <p>К-сть: {delivery.deliveredQuantity}</p>
                            <p>Зал №: {delivery.gymNumber}</p>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <span>Немає</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
