type ExportModalProps = {
    onClose: () => void
    onSelectFormat: (format: string) => void
    formats?: string[]
  }
  
  export function ExportModal({ onClose, onSelectFormat, formats = ['CSV', 'JSON', 'Excel'] }: ExportModalProps) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-80">
          <h3 className="text-lg font-bold mb-4 text-primary">Оберіть формат експорту</h3>
          <div className="flex flex-col gap-3">
            {formats.map(format => (
              <button
                key={format}
                onClick={() => onSelectFormat(format)}
                className="bg-primary text-white py-2 rounded hover:opacity-90"
              >
                {format}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:underline block mx-auto"
          >
            Скасувати
          </button>
        </div>
      </div>
    );
  }
  