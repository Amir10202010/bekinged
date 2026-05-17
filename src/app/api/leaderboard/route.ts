import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { elo: 'desc' },
      take: 50,
      select: { id: true, username: true, email: true, elo: true, wins: true, losses: true, streak: true, city: true }
    })
    return NextResponse.json(users)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
