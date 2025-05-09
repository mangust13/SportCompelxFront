export const ITEMS_PER_PAGE = 15

export function renderPagination(
  currentPage: number,
  totalPages: number,
  setCurrentPage: (page: number) => void
) {
  const pages: (number | string)[] = []
  pages.push(1)

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('...')
  if (totalPages > 1) pages.push(totalPages)

  return pages.map((page, idx) =>
    typeof page === 'number' ? (
      <button
        key={idx}
        onClick={() => setCurrentPage(page)}
        className={`w-8 h-8 rounded text-sm ${
          currentPage === page
            ? 'bg-primary text-white'
            : 'bg-white border text-gray-600 hover:bg-gray-100'
        }`}
      >
        {page}
      </button>
    ) : (
      <span key={idx} className="px-2 text-gray-400 text-sm">...</span>
    )
  )
}
