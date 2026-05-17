import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'No email provided' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
