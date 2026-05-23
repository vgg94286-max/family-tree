import { sql, FamilyMember } from '@/lib/db'
import { getAdminFromCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  
  const { id } = await params
  
  try {
    const body = await request.json()
    const { name, father_id } = body
    
    if (!name) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 })
    }
    
    const result = await sql`
      UPDATE family_members 
      SET 
        name = ${name},
        father_id = ${father_id || null},
       
      WHERE id = ${parseInt(id)}
      RETURNING *
    ` as FamilyMember[]
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
    }
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في تحديث العضو' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  
  const { id } = await params
  
  try {
    // Check if member has children
    const children = await sql`
      SELECT COUNT(*) as count FROM family_members WHERE father_id = ${parseInt(id)}
    ` as { count: string }[]
    
    if (parseInt(children[0]?.count || '0') > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف عضو لديه أبناء في الشجرة' },
        { status: 400 }
      )
    }
    
    await sql`DELETE FROM family_members WHERE id = ${parseInt(id)}`
    
    return NextResponse.json({ message: 'تم حذف العضو بنجاح' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في حذف العضو' }, { status: 500 })
  }
}
