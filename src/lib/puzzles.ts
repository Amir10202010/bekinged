export interface Puzzle {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  board: string[][]
  solution: { from: { row: number; col: number }; to: { row: number; col: number } }
}

export const DAILY_PUZZLES: Puzzle[] = [
  {
    id: 'p1', title: 'Fork Attack', difficulty: 'easy',
    description: 'Find the move that captures two pieces',
    board: [], solution: { from: { row: 4, col: 2 }, to: { row: 2, col: 4 } }
  },
  {
    id: 'p2', title: 'King Promotion', difficulty: 'medium',
    description: 'Promote your piece to king',
    board: [], solution: { from: { row: 1, col: 3 }, to: { row: 0, col: 4 } }
  },
  {
    id: 'p3', title: 'Chain Capture', difficulty: 'hard',
    description: 'Execute a 3-piece chain capture',
    board: [], solution: { from: { row: 5, col: 1 }, to: { row: 1, col: 5 } }
  },
  {
    id: 'p4', title: 'Defensive Move', difficulty: 'easy',
    description: 'Protect your piece from capture',
    board: [], solution: { from: { row: 3, col: 3 }, to: { row: 4, col: 2 } }
  },
  {
    id: 'p5', title: 'Corner Trap', difficulty: 'medium',
    description: 'Trap the opponent in the corner',
    board: [], solution: { from: { row: 2, col: 6 }, to: { row: 3, col: 7 } }
  },
  {
    id: 'p6', title: 'Double Jump', difficulty: 'medium',
    description: 'Execute a double capture sequence',
    board: [], solution: { from: { row: 4, col: 4 }, to: { row: 2, col: 2 } }
  },
  {
    id: 'p7', title: 'Endgame King', difficulty: 'hard',
    description: 'Win the endgame with your king',
    board: [], solution: { from: { row: 0, col: 2 }, to: { row: 2, col: 4 } }
  },
]

export function getTodaysPuzzle(): Puzzle {
  const dayOfWeek = new Date().getDay()
  return DAILY_PUZZLES[dayOfWeek % DAILY_PUZZLES.length]
}
