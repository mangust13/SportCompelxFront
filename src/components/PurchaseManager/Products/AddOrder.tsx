import { useState, useEffect } from 'react'
import axios from 'axios'
import { ProductDto, SupplierDto } from '../PurchaseDtos'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { getAuthHeaders } from '../../../utils/authHeaders'

type Props = {
  product: ProductDto
  onClose: () => void
}

export default function AddOrder({ product, onClose }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newLicense, setNewLicense] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLicense, setEditLicense] = useState('')

  useEffect(() => {
    axios.get('https://localhost:7270/api/Suppliers/all')
      .then(res => setSuppliers(res.data))
      .catch(err => console.error('Помилка завантаження постачальників:', err))
  }, [])

  const supplierOptions = suppliers.map(s => ({
    value: s.supplierId,
    label: `${s.supplierName} (${s.supplierPhoneNumber})`
  }))

  const handleSupplierChange = (option: any) => {
    setSelectedSupplierId(option ? option.value : null)
  }

  const handleAddToBasket = () => {
    if (!selectedSupplierId) {
      toast.error('Оберіть постачальника')
      return
    }

    const item = {
      productId: product.productId,
      productModel: product.productModel,
      supplierId: selectedSupplierId,
      quantity
    }

    const existing = JSON.parse(localStorage.getItem('basket') || '[]')
    localStorage.setItem('basket', JSON.stringify([...existing, item]))
    toast.success('Додано в замовлення')
    onClose()
  }

  const handleAddSupplier = async () => {
    try {
      const res = await axios.post<SupplierDto>('https://localhost:7270/api/Suppliers', {
        supplierName: newName,
        supplierPhoneNumber: newPhone,
        supplierLicense: newLicense
      })

      const newSupplier = res.data
      setSuppliers(prev => [...prev, newSupplier])
      setSelectedSupplierId(newSupplier.supplierId)
      setIsAddOpen(false)
      setNewName('')
      setNewPhone('')
      setNewLicense('')
      toast.success('Постачальника додано!')
    } catch {
      toast.error('Помилка при додаванні постачальника.')
    }
  }

  const handleUpdateSupplier = async () => {
    if (!selectedSupplierId) return

    try {
      await axios.put(`https://localhost:7270/api/Suppliers/${selectedSupplierId}`, {
        supplierName: editName,
        supplierPhoneNumber: editPhone,
        supplierLicense: editLicense
      })

      setSuppliers(prev =>
        prev.map(s =>
          s.supplierId === selectedSupplierId
            ? { ...s, supplierName: editName, supplierPhoneNumber: editPhone, supplierLicense: editLicense }
            : s
        )
      )
      setIsEditing(false)
      toast.success('Постачальника оновлено!')
    } catch {
      toast.error('Помилка при оновленні постачальника.')
    }
  }

  const handleDeleteSupplier = async () => {
    if (!selectedSupplierId) return
    if (!confirm('Ви точно хочете видалити цього постачальника?')) return

    try {
      await axios.delete(`https://localhost:7270/api/Suppliers/${selectedSupplierId}`, {headers: getAuthHeaders()})
      setSuppliers(prev => prev.filter(s => s.supplierId !== selectedSupplierId))
      setSelectedSupplierId(null)
      toast.success('Постачальника видалено!')
    } catch {
      toast.error('Помилка при видаленні постачальника.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96 max-h-[95vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Додати до замовлення</h2>
        <p className="mb-2">Модель: {product.productModel}</p>

        <label className="block mb-1 font-semibold">Постачальник:</label>
        <Select
          options={supplierOptions}
          value={supplierOptions.find(option => option.value === selectedSupplierId) || null}
          onChange={handleSupplierChange}
          placeholder="Оберіть постачальника..."
          isClearable
          className="mb-2"
        />

        {selectedSupplierId && (
          <div className="flex gap-2 mb-4">
            <button
              className="text-sm text-blue-600"
              onClick={() => {
                const s = suppliers.find(x => x.supplierId === selectedSupplierId)
                if (s) {
                  setEditName(s.supplierName)
                  setEditPhone(s.supplierPhoneNumber)
                  setEditLicense(s.supplierLicense)
                  setIsEditing(true)
                }
              }}
            >
              ✏️ Редагувати
            </button>
            <button className="text-sm text-red-600" onClick={handleDeleteSupplier}>🗑️ Видалити</button>
          </div>
        )}

        {isEditing && (
          <div className="border-t pt-3 mb-4">
            <p className="text-sm font-bold mb-2">Редагування постачальника</p>
            <input
              placeholder="Назва"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <input
              placeholder="Телефон"
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <input
              placeholder="Ліцензія"
              value={editLicense}
              onChange={e => setEditLicense(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <div className="flex gap-2">
              <button className="bg-primary text-white px-3 py-1 rounded text-sm" onClick={handleUpdateSupplier}>Зберегти</button>
              <button className="text-sm text-gray-500" onClick={() => setIsEditing(false)}>Скасувати</button>
            </div>
          </div>
        )}

        <label className="block mb-1 font-semibold">Кількість:</label>
        <input
          type="number"
          className="w-full mb-4 border px-2 py-1 rounded"
          value={quantity}
          min={1}
          onChange={e => setQuantity(Number(e.target.value))}
        />

        {!isAddOpen ? (
          <button onClick={() => setIsAddOpen(true)} className="text-sm text-primary">➕ Додати нового постачальника</button>
        ) : (
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-bold mb-2">Новий постачальник</p>
            <input
              placeholder="Назва"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <input
              placeholder="Телефон"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <input
              placeholder="Ліцензія"
              value={newLicense}
              onChange={e => setNewLicense(e.target.value)}
              className="border px-2 py-1 w-full rounded mb-2"
            />
            <button
              onClick={handleAddSupplier}
              disabled={!newName || !newPhone}
              className="bg-primary text-white px-4 py-2 rounded w-full disabled:opacity-50"
            >
              Додати
            </button>
            <button
              onClick={() => setIsAddOpen(false)}
              className="text-sm text-gray-500 mt-2"
            >
              Скасувати
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500">Скасувати</button>
          <button onClick={handleAddToBasket} className="bg-blue-600 text-white px-4 py-1 rounded">Додати</button>
        </div>
      </div>
    </div>
  )
}
