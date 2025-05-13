import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { AttendanceRecordDto, TrainerProfileDto } from './TrainerDtos'
import AttendanceCard from './AttendanceCard'
import Header from '../../layout/Header'
import { ITEMS_PER_PAGE, renderPagination } from '../../utils/pagination'
import { ExportModal } from '../ExportModal'
import { exportData } from '../../utils/exportData'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAuthHeaders } from '../../utils/authHeaders'
import EditAttendance from './EditAttendance'

export default function AttendanceList() {
  const [allAttendances, setAllAttendances] = useState<AttendanceRecordDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [search, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'purchaseNumber' | 'attendanceDateTime'>('attendanceDateTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activityFilters, setActivityFilters] = useState<string[]>([])
  const [availableActivities, setAvailableActivities] = useState<string[]>([])
  const [purchaseNumberSearch, setPurchaseNumberSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecordDto | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    axios
      .get<TrainerProfileDto>(`https://localhost:7270/api/ConcreteTrainers/${user.trainerId}/profile`)
      .then(res => setAvailableActivities(res.data.activities.map(a => a.activityName)))
      .catch(err => console.error('Помилка завантаження профілю тренера:', err))
  }, [])

  const fetchAttendances = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const res = await axios.get<AttendanceRecordDto[]>(
      'https://localhost:7270/api/attendanceRecord/attendances',
      {
        params: {
          trainerId: user.trainerId,
          sortBy,
          order: sortOrder,
          activities: activityFilters.join(','),
          date: selectedDate || undefined,
          purchaseNumber: purchaseNumberSearch || undefined
        }
      }
    )
    setAllAttendances(res.data)
    setCurrentPage(1)
  }, [sortBy, sortOrder, activityFilters, selectedDate, purchaseNumberSearch])

  // initial load
  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  const filteredAttendances = allAttendances.filter(a =>
    a.purchaseNumber.toString().includes(search) ||
    a.clientFullName.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionName.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionTerm.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionVisitTime.toLowerCase().includes(search.toLowerCase()) ||
    a.subscriptionActivities.some(act =>
      act.activityName.toLowerCase().includes(search.toLowerCase())
    ) ||
    a.trainingStartTime.toLowerCase().includes(search.toLowerCase()) ||
    a.trainingEndTime.toLowerCase().includes(search.toLowerCase()) ||
    a.trainingActivity.toLowerCase().includes(search.toLowerCase()) ||
    new Date(a.attendanceDateTime).toLocaleString().toLowerCase().includes(search.toLowerCase())
  )

  const handleExportFormat = (format: string) => {
    exportData(format, filteredAttendances)
    setIsExportModalOpen(false)
  }

  const handleDelete = (attendance: AttendanceRecordDto) => {
  const toastId = toast.info(
    <div>
      Ви точно хочете видалити запис відвідування {attendance.purchaseNumber}?
      <div className="flex gap-2 mt-2">
        <button
          onClick={async () => {
            try {
              await axios.delete(`https://localhost:7270/api/AttendanceRecord/${attendance.attendanceId}`, { headers: getAuthHeaders() })
              toast.success('Відвідування видалено!')
              fetchAttendances()
              toast.dismiss(toastId)
            } catch {
              toast.error('Помилка при видаленні.')
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

  const totalPages = Math.ceil(filteredAttendances.length / ITEMS_PER_PAGE)
  const visibleAttendances = filteredAttendances.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className={`flex flex-col gap-6 ${isFilterOpen ? 'w-[75%]' : 'w-[100%]'}`}>
      <Header
        title="Всього відвідувань"
        total={allAttendances.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        searchTerm={search}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={value => setSortBy(value as any)}
        sortOrder={sortOrder}
        setSortOrder={value => setSortOrder(value as any)}
        sortOptions={[
          { value: 'purchaseNumber', label: 'Номер покупки' },
          { value: 'attendanceDateTime', label: 'Дата відвідування' }
        ]}
        triggerSearch={fetchAttendances}
        onExportClick={() => setIsExportModalOpen(true)}
      >
        <div className="flex flex-col gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-1">Дата відвідування:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <p className="font-semibold mb-1">Види активностей:</p>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              {availableActivities.map(name => (
                <label key={name} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={activityFilters.includes(name)}
                    onChange={() =>
                      setActivityFilters(prev =>
                        prev.includes(name)
                          ? prev.filter(a => a !== name)
                          : [...prev, name]
                      )
                    }
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Номер покупки:</p>
            <input
              type="text"
              value={purchaseNumberSearch}
              onChange={e => setPurchaseNumberSearch(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              placeholder="Введіть номер покупки"
            />
          </div>
          <button
            onClick={fetchAttendances}
            className="mt-4 bg-primary text-white w-full py-2 rounded hover:opacity-90"
          >
            Застосувати фільтри
          </button>
        </div>
      </Header>

      <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'} items-start`}>
        {visibleAttendances.map(a => (
          <AttendanceCard
            key={`${a.purchaseNumber}-${a.attendanceDateTime}`}
            attendance={a}
            search={search}
            onEdit={() => setEditingAttendance(a)}
            onDelete={() => handleDelete(a)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-2 items-center flex-wrap">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &lt;
        </button>

        {renderPagination(currentPage, totalPages, setCurrentPage)}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded text-sm ${
            currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-100 text-gray-700'
          }`}
        >
          &gt;
        </button>
      </div>

      {isExportModalOpen && (
        <ExportModal onClose={() => setIsExportModalOpen(false)} onSelectFormat={handleExportFormat} />
      )}

      {editingAttendance && (
      <EditAttendance
        attendance={editingAttendance}
        onClose={() => setEditingAttendance(null)}
        onSave={() => {
          fetchAttendances()
          setEditingAttendance(null)}}/>
    )}
    </div>
  )
}