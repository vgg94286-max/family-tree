import { sql, FamilyMember } from '@/lib/db'
import { getAdminFromCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  
  try {
    const members = await sql`
      SELECT m.*, p.name as father_name
      FROM family_members m
      LEFT JOIN family_members p ON m.father_id = p.id
      ORDER BY m.created_at DESC
    ` as (FamilyMember & { father_name: string | null })[]
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في جلب الأعضاء' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { name, father_id} = body
    
    if (!name) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    }
    
    const result = await sql`
      INSERT INTO family_members (name, father_id)
      VALUES (${name}, ${father_id})
      RETURNING *
    ` as FamilyMember[]
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في إضافة العضو' }, { status: 500 })
  }
}
