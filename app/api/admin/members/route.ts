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
      SELECT * from public.get_family_members()
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
   // Replace the old body extraction with this:
const { members, father_id } = await request.json()
const validItems = (members || []).filter((m: any) => m.name && m.name.trim() !== '')

if (validItems.length === 0) {
  return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
}

const names = validItems.map((m: any) => m.name.trim())
const states = validItems.map((m: any) => m.state || 'على قيد الحياة')

// Replace the old INSERT query with this:
const results = await sql`
  INSERT INTO family_members (name, father_id, state)
  SELECT name_val, ${father_id}, state_val
  FROM UNNEST(${names}::text[], ${states}::text[]) AS t(name_val, state_val)
  RETURNING *
` as FamilyMember[]
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في إضافة الأعضاء' }, { status: 500 })
  }
}