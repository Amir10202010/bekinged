import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, supabaseId } = await req.json()
  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json(existing)
    const user = await prisma.user.create({
      data: {
        id: supabaseId,
        email,
        username: email.split('@')[0],
        elo: 1000
      }
    })
    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
