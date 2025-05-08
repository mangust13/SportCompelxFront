import * as XLSX from 'xlsx'

export function exportData<T>(format: string, data: T[]) {
  if (format === 'JSON') {
    const json = JSON.stringify(data, null, 2)
    downloadBlob(json, 'application/json', 'export.json')
  } else if (format === 'CSV') {
    const csv = convertToCsv(data)
    downloadBlob('\uFEFF' + csv, 'text/csv;charset=utf-8;', 'export.csv')
  } else if (format === 'Excel') {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')
    XLSX.writeFile(workbook, 'export.xlsx')
  }
}

function downloadBlob(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function convertToCsv(data: any[]): string {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}
