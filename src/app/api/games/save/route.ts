import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { calculateEloChange, K_FACTORS } from '@/lib/elo'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown as Record<string, unknown>
    const userWon = Boolean(body.userWon)
    const redUserId = (body.redUserId as string | undefined) ?? undefined
    const blackUserId = (body.blackUserId as string | undefined) ?? undefined
    const moves = (body.moves as unknown) ?? []
    const difficulty = (body.difficulty as string | undefined) ?? 'medium'
    const mode = (body.mode as string | undefined) ?? 'ai'
    const duration = Number(body.duration ?? 0)

    if (!redUserId) return NextResponse.json({ error: 'No user' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: redUserId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const K = mode === 'multiplayer' ? K_FACTORS.multiplayer
      : K_FACTORS[difficulty as keyof typeof K_FACTORS] ?? K_FACTORS.medium

    const aiElo = difficulty === 'easy' ? 800 : difficulty === 'hard' ? 1400 : 1100

    // Determine opponent ELO: for multiplayer try to read blackUserId, otherwise use AI ELO
    let opponentElo = aiElo
    if (mode === 'multiplayer' && blackUserId) {
      const opp = await prisma.user.findUnique({ where: { id: blackUserId } })
      opponentElo = opp?.elo ?? user.elo
    }

    const eloChange = calculateEloChange(user.elo, opponentElo, userWon, K)

    const today = new Date().toDateString()
    const updatedAt = (user as unknown as { updatedAt?: string | Date }).updatedAt
    const lastPlayed = updatedAt ? new Date(updatedAt).toDateString() : null
    const newStreak = lastPlayed === today ? user.streak : user.streak + 1

    await Promise.all([
      prisma.game.create({
        data: {
          winnerId: userWon ? redUserId : 'AI',
          redUserId,
          blackUserId: blackUserId ?? (mode === 'multiplayer' ? null : 'AI'),
          moves: moves ?? [],
          mode: mode ?? 'ai',
          difficulty: difficulty ?? 'medium',
          eloChange,
          duration: duration ?? 0,
        }
      }),
      prisma.user.update({
        where: { id: redUserId },
        data: {
          elo: { increment: eloChange },
          wins: userWon ? { increment: 1 } : undefined,
          losses: userWon ? undefined : { increment: 1 },
          streak: newStreak,
        }
      })
    ])

    return NextResponse.json({ ok: true, eloChange })
  } catch (e) {
    console.error('Save error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
