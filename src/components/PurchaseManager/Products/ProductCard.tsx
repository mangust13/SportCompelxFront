import { useState, useRef, useEffect } from 'react'
import { ProductDto } from '../PurchaseDtos'
import { highlightMatch } from '../../../utils/highlightMatch'
import AddOrder from './AddOrder'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type Props = {
  product: ProductDto
  searchTerm: string
  expandedCardId: number | null
  setExpandedCardId: (id: number | null) => void
  onDelete: (productId: number) => void
}

export default function ProductCard({ product, searchTerm, expandedCardId, setExpandedCardId, onDelete }: Props) {
  const [isAddingOrder, setIsAddingOrder] = useState(false)
  const isExpanded = expandedCardId === product.productId
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExpandToggle = () => {
    setExpandedCardId(isExpanded ? null : product.productId)
  }

  const handleDelete = async () => {
    const toastId = toast.info(
      <div>
        Ви точно хочете видалити продукт {product.productModel}?
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await axios.delete(`https://localhost:7270/api/Products/${product.productId}`)
                toast.success('Продукт успішно видалено!')
                onDelete(product.productId)
                toast.dismiss(toastId)
              } catch (error) {
                toast.error('Помилка при видаленні продукту.')
                toast.dismiss(toastId)
              }
            }}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Так, видалити
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bg-gray-300 px-2 py-1 rounded text-xs"
          >
            Скасувати
          </button>
        </div>
      </div>,
      { autoClose: false }
    )
  }

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    if (isExpanded) {
      content.style.maxHeight = content.scrollHeight + 'px'
      content.style.opacity = '1'
    } else {
      content.style.maxHeight = '0px'
      content.style.opacity = '0'
    }
  }, [isExpanded])

  const typeToImageMap: Record<string, string> = {
  'Кардіотренажери': './assets/cardio.jpg',
  'Силові тренажери': './assets/strength.jpg',
  'Боксерське спорядження': './assets/boxing.jpg',
  'Йога та пілатес': './assets/yoga.jpg',
  'Обладнання для кросфіту': '/assets/crossfit.jpg'
}
  const imageUrl = typeToImageMap[product.productType] || '/images/default.jpg'

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-2">
      <div className="flex justify-center">
        <img
          src={imageUrl}
          alt={product.productModel}
          className="w-[30%] h-auto object-cover rounded-lg mx-auto"
        />
      </div>
      <div className="flex justify-between items-start text-sm text-gray-500">
        <h3 className="text-lg font-bold text-primary">
          {highlightMatch(product.productModel, searchTerm)}
        </h3>
        <button
          className="text-gray-400 hover:text-red-500 ml-10"
          title="Видалити"
          onClick={handleDelete}>
          🗑️
        </button>
      </div>

      <p className="text-sm text-gray-700">
        Бренд: {highlightMatch(product.brandName, searchTerm)}
      </p>
      <p className="text-sm text-gray-700">
        Тип продукту: {highlightMatch(product.productType, searchTerm)}
      </p>

      {!isExpanded ? (
        <>
          <button
            className="text-blue-500 hover:underline text-sm mt-1"
            onClick={handleExpandToggle}
          >
            Показати опис
          </button>
        </>
      ) : (
        <>
          <div ref={contentRef} className="expandable-content mt-2">
            <p className="text-gray-700">{highlightMatch(product.productDescription, searchTerm)}</p>
          </div>
          <button
            className="text-blue-500 hover:underline text-sm mt-2"
            onClick={handleExpandToggle}
          >
            Згорнути
          </button>
        </>
      )}

      <button
        className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        onClick={() => setIsAddingOrder(true)}
      >
        Додати в замовлення
      </button>

      {isAddingOrder && (
        <AddOrder
          product={product}
          onClose={() => setIsAddingOrder(false)}
        />
      )}
    </div>
  )
}