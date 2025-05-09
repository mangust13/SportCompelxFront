export function getAuthHeaders() {
  const rawUser = localStorage.getItem('user')
  let username = 'Anonymous'
  let role = 'Unknown'

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser)
      username = parsed.username ?? 'Anonymous'
      role = parsed.role ?? 'Unknown'
    } catch (e) {
      console.error('Помилка парсингу user:', e)
    }
  }

  return {
    'X-User-Name': username,
    'X-User-Role': role
  }
}
