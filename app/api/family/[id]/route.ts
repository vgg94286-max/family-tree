import { sql, FamilyMember } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const members = await sql`
      SELECT * FROM family_members WHERE id = ${parseInt(id)}
    ` as FamilyMember[]
    
    if (members.length === 0) {
      return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
    }
    
    const member = members[0]
    
    // Get ancestors path
    const ancestors: FamilyMember[] = []
    let currentId = member.father_id
    
    while (currentId !== null) {
      const parent = await sql`
        SELECT * FROM family_members WHERE id = ${currentId}
      ` as FamilyMember[]
      
      if (parent.length > 0) {
        ancestors.unshift(parent[0])
        currentId = parent[0].father_id
      } else {
        break
      }
    }
    
    // Get children
    const children = await sql`
      SELECT * FROM family_members WHERE father_id = ${member.id}
      ORDER BY birth_date ASC, name ASC
    ` as FamilyMember[]
    
    return NextResponse.json({
      member,
      ancestors,
      children
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 })
  }
}
