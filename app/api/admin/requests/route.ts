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
      SELECT r.*, m.name as father_name
      FROM guest_requests r
      LEFT JOIN family_members m ON r.father_id = m.id
      ORDER BY 
        CASE r.status WHEN 'pending' THEN 0 ELSE 1 END,
        r.created_at DESC
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
