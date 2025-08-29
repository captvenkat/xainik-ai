export function tierForAmount(amount: number) {
  if (amount >= 25000) return 'Founding Supporter'
  if (amount >= 10000) return 'Champion'
  return 'Friend'
}

export function getBadgeEmoji(tier: string) {
  switch (tier) {
    case 'Founding Supporter':
      return '🏅'
    case 'Champion':
      return '💎'
    case 'Friend':
      return '🌱'
    default:
      return '🌱'
  }
}

export function getBadgeColor(tier: string) {
  switch (tier) {
    case 'Founding Supporter':
      return 'text-yellow-600 bg-yellow-100'
    case 'Champion':
      return 'text-purple-600 bg-purple-100'
    case 'Friend':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-green-600 bg-green-100'
  }
}
