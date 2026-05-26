import { sql, GuestRequest } from '@/lib/db'
import { getAdminFromCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const requests = await sql`
      SELECT * FROM public.get_guest_requests();
    `

    const normalized = requests.map((r: any) => ({
      ...r,
      sons:
        typeof r.sons === 'string'
          ? JSON.parse(r.sons)
          : Array.isArray(r.sons)
            ? r.sons
            : [],
    }))
    

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في جلب الطلبات' }, { status: 500 })
  }
}
