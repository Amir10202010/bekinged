import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, city } = await req.json()
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })
    const updated = await prisma.user.update({ where: { email }, data: { city } })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Update user error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
