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
    const body = await request.json()
    // نقبل مصفوفة أسماء (names) أو اسماً واحداً (name) كدعم رجعي (Backward Compatibility)
    const { names, name, father_id } = body
    
    const membersToAdd: string[] = names && Array.isArray(names) ? names : (name ? [name] : [])
    const validNames = membersToAdd.filter(n => n && n.trim() !== '')

    if (validNames.length === 0) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    }
    
    // THE FIX: 1 Single Database Trip!
    // UNNEST transforms the JavaScript array into a temporary SQL table of rows,
    // allowing us to insert all of them at once with the same father_id.
    const results = await sql`
      INSERT INTO family_members (name, father_id)
      SELECT name_val, ${father_id}
      FROM UNNEST(${validNames}::text[]) AS name_val
      RETURNING *
    ` as FamilyMember[]
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في إضافة الأعضاء' }, { status: 500 })
  }
}