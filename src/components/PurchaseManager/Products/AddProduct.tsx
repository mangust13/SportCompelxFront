import { useEffect, useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import { BrandDto, ProductTypeDto, ProductDto } from '../PurchaseDtos'
import { getAuthHeaders } from '../../../utils/authHeaders'
import { toast } from 'react-toastify'

type Props = {
  onClose: () => void
  onSave: (created: ProductDto) => void
}

type OptionType = { value: number; label: string }

export default function AddProduct({ onClose, onSave }: Props) {
  const [brands, setBrands] = useState<BrandDto[]>([])
  const [types, setTypes] = useState<ProductTypeDto[]>([])

  const [brandId, setBrandId] = useState<number | null>(null)
  const [typeId, setTypeId] = useState<number | null>(null)
  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')

  const brandOptions: OptionType[] = brands.map(b => ({ value: b.brandId, label: b.brandName }))
  const typeOptions: OptionType[] = types.map(t => ({ value: t.productTypeId, label: t.productTypeName }))

  useEffect(() => {
    axios.get<BrandDto[]>('https://localhost:7270/api/Products/all-brands').then(res => setBrands(res.data))
    axios.get<ProductTypeDto[]>('https://localhost:7270/api/Products/all-types').then(res => setTypes(res.data))
  }, [])

  const handleSave = async () => {
    if (!brandId || !typeId || !model.trim() || !description.trim()) {
      toast.error('Заповніть усі поля')
      return
    }

    try {
      const res = await axios.post<ProductDto>(
        'https://localhost:7270/api/Products',
        {
          brandId,
          productTypeId: typeId,
          productModel: model,
          productDescription: description
        },
        { headers: getAuthHeaders() }
      )

      toast.success('Продукт успішно створено!')
      onSave(res.data)
      onClose()
    } catch {
      toast.error('Помилка при створенні продукту')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[500px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-primary">Новий продукт</h2>

        <div>
          <label className="text-sm font-medium">Бренд:</label>
          <Select
            options={brandOptions}
            value={brandOptions.find(b => b.value === brandId) || null}
            onChange={opt => setBrandId(opt?.value ?? null)}
            placeholder="Оберіть бренд"
            isClearable
          />
        </div>

        <div>
          <label className="text-sm font-medium">Тип продукту:</label>
          <Select
            options={typeOptions}
            value={typeOptions.find(t => t.value === typeId) || null}
            onChange={opt => setTypeId(opt?.value ?? null)}
            placeholder="Оберіть тип"
            isClearable
          />
        </div>

        <input
          type="text"
          placeholder="Назва моделі"
          value={model}
          onChange={e => setModel(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <textarea
          placeholder="Опис"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-3 py-2 text-sm resize-none"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">Скасувати</button>
          <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Зберегти</button>
        </div>
      </div>
    </div>
  )
}
