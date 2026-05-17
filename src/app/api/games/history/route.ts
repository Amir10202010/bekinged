import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json([])

    const games = await prisma.game.findMany({
      where: { OR: [{ redUserId: userId }, { blackUserId: userId }] },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(games)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
