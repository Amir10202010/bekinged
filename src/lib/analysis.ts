import type { Move } from './game/types'

interface Insight {
  type: 'good' | 'warning' | 'info'
  text: string
}

export function analyzeGame(
  moves: Move[],
  winner: 'red' | 'black' | null,
  playerColor: 'red' | 'black' = 'red'
): Insight[] {
  const insights: Insight[] = []
  const totalMoves = moves.length
  const playerMoves = moves.filter((_, i) => i % 2 === (playerColor === 'red' ? 0 : 1))
  const captures = playerMoves.filter(m => (m.captures?.length || 0) > 0)
  const chainCaptures = captures.filter(m => (m.captures?.length || 0) > 1)

  if (totalMoves < 20) {
    insights.push({ type: 'warning', text: 'Short game — the position was decided quickly. Try to develop more pieces before attacking.' })
  }

  if (captures.length === 0) {
    insights.push({ type: 'warning', text: 'You made no captures this game. Look for forcing sequences.' })
  } else if (captures.length > 5) {
    insights.push({ type: 'good', text: `Strong capture game — you made ${captures.length} captures.` })
  }

  if (chainCaptures.length > 0) {
    insights.push({ type: 'good', text: `You executed ${chainCaptures.length} chain capture(s). Excellent tactical play!` })
  }

  const earlyMoves = playerMoves.slice(0, 4).map(m => m.from.col)
  const centerCols = earlyMoves.filter(c => c >= 2 && c <= 5)
  if (centerCols.length >= 2) {
    insights.push({ type: 'good', text: 'Good center control in the opening.' })
  } else {
    insights.push({ type: 'info', text: 'Try to control the center (columns 3-6) in the opening.' })
  }

  if (winner === playerColor) {
    insights.push({ type: 'good', text: `Victory in ${totalMoves} moves. Well played!` })
  } else {
    insights.push({ type: 'warning', text: 'Defeat can be a great teacher. Review where you lost material.' })
  }

  return insights.slice(0, 4)
}
