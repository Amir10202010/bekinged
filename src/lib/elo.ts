export function calculateExpected(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
}

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  won: boolean,
  K: number = 32
): number {
  const expected = calculateExpected(playerElo, opponentElo)
  const actual = won ? 1 : 0
  return Math.round(K * (actual - expected))
}

export const K_FACTORS = {
  easy: 8,
  medium: 16,
  hard: 24,
  multiplayer: 32,
} as const
