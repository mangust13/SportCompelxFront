import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from '../../../layout/Header'
import { SupplierDto } from '../PurchaseDtos'


export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get<SupplierDto[]>('https://localhost:7270/api/Suppliers/all')
      setSuppliers(res.data)
    } catch (err) {
      console.error('Помилка завантаження постачальників:', err)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`https://localhost:7270/api/Suppliers/${id}`)
      setSuppliers(prev => prev.filter(s => s.supplierId !== id))
    } catch (err) {
      console.error('Помилка видалення постачальника:', err)
    }
  }

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Постачальники"
        total={suppliers.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddNew={() => setIsAddingSupplier(true)}>

        {/* Фільтрів нема, простий інтерфейс */}
        <p className="text-sm text-gray-500">Тут можна керувати постачальниками.</p>
      </Header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {suppliers
          .filter(s =>
            s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.supplierPhoneNumber.includes(searchTerm) ||
            s.supplierLicense.toLowerCase().includes(searchTerm)
          )
          .map(supplier => (
            <div key={supplier.supplierId} className="bg-white shadow rounded p-4 flex flex-col gap-2 relative">
              <h3 className="font-bold text-lg text-primary">{supplier.supplierName}</h3>
              <p className="text-sm text-gray-700">📞 {supplier.supplierPhoneNumber}</p>
              <p className="text-sm text-gray-700">🎫 Ліцензія: {supplier.supplierLicense}</p>
              <div className="flex gap-2 mt-2">
                <button
                  title="Редагувати"
                  className="text-yellow-500 hover:text-yellow-600">✏️</button>
                <button
                  title="Видалити"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(supplier.supplierId)}>🗑️</button>
              </div>
            </div>
          ))}
      </div>

      {isAddingSupplier && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 shadow-md w-[400px]">
            <h2 className="text-lg font-bold mb-4">Додати постачальника</h2>
            <AddSupplier onClose={() => setIsAddingSupplier(false)} onAdd={fetchSuppliers} />
          </div>
        </div>
      )}
    </div>
  )
}

type AddSupplierProps = {
  onClose: () => void
  onAdd: () => void
}

function AddSupplier({ onClose, onAdd }: AddSupplierProps) {
  const [supplierName, setSupplierName] = useState('')
  const [supplierPhoneNumber, setSupplierPhoneNumber] = useState('')
  const [supplierLicense, setSupplierLicense] = useState('')

  const handleSave = async () => {
    if (!supplierName || !supplierPhoneNumber || !supplierLicense) {
      alert('Будь ласка, заповніть всі поля.')
      return
    }

    try {
      await axios.post('https://localhost:7270/api/Suppliers', {
        supplierName,
        supplierPhoneNumber,
        supplierLicense
      })
      onAdd()
      onClose()
    } catch (err) {
      console.error('Помилка при додаванні постачальника:', err)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={supplierName}
        onChange={e => setSupplierName(e.target.value)}
        placeholder="Назва"
        className="border rounded px-2 py-1"
      />
      <input
        type="text"
        value={supplierPhoneNumber}
        onChange={e => setSupplierPhoneNumber(e.target.value)}
        placeholder="Телефон"
        className="border rounded px-2 py-1"
      />
      <input
        type="text"
        value={supplierLicense}
        onChange={e => setSupplierLicense(e.target.value)}
        placeholder="Ліцензія"
        className="border rounded px-2 py-1"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 border rounded">Скасувати</button>
        <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded">Зберегти</button>
      </div>
    </div>
  )
}
