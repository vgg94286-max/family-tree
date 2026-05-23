import { clearAdminCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  await clearAdminCookie()
  return NextResponse.json({ success: true })
}
