import { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { getAuthHeaders } from '../../../utils/authHeaders'
import { ProductDto, BrandDto, ProductTypeDto } from '../PurchaseDtos'

export type Props = {
  product: ProductDto
  onClose: () => void
  onSave: (updated: ProductDto) => void
}

type Option = {
  value: number
  label: string
}

export default function EditProduct({ product, onClose, onSave }: Props) {
  const [model, setModel] = useState(product.productModel)
  const [description, setDescription] = useState(product.productDescription)
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [types, setTypes] = useState<ProductTypeDto[]>([])
  const [brandId, setBrandId] = useState(product.brandId)
  const [typeId, setTypeId] = useState(product.productTypeId)

  useEffect(() => {
    axios.get<BrandDto[]>('https://localhost:7270/api/Products/all-brands')
      .then(res => setBrands(res.data))
    axios.get<ProductTypeDto[]>('https://localhost:7270/api/Products/all-types')
      .then(res => setTypes(res.data))
  }, [])

  const brandOptions: Option[] = brands.map(b => ({ value: b.brandId, label: b.brandName }))
  const typeOptions: Option[] = types.map(t => ({ value: t.productTypeId, label: t.productTypeName }))

  const handleSave = async () => {
    if (!model.trim() || !description.trim() || !brandId || !typeId) {
      toast.error('Заповніть усі поля')
      return
    }

    try {
      await axios.put(`https://localhost:7270/api/Products/${product.productId}`, {
        productModel: model,
        productDescription: description,
        brandId,
        productTypeId: typeId
      }, 
      { headers: getAuthHeaders() })

      toast.success('Продукт оновлено!')
      onSave({ ...product, productModel: model, productDescription: description, brandId, productTypeId: typeId })
      onClose()
    } catch {
      toast.error('Помилка при оновленні продукту')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[500px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">Редагування продукту</h2>

        <div>
          <label className="text-sm font-medium">Бренд:</label>
          <Select
            options={brandOptions}
            value={brandOptions.find(o => o.value === brandId) || null}
            onChange={opt => setBrandId(opt?.value || 0)}
            placeholder="Оберіть бренд"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Тип продукту:</label>
          <Select
            options={typeOptions}
            value={typeOptions.find(o => o.value === typeId) || null}
            onChange={opt => setTypeId(opt?.value || 0)}
            placeholder="Оберіть тип"
          />
        </div>

        <input
          type="text"
          value={model}
          onChange={e => setModel(e.target.value)}
          placeholder="Назва моделі"
          className="border rounded px-3 py-2 text-sm"
        />

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Опис продукту"
          className="border rounded px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
