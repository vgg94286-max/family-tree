import { sql, FamilyMember } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fatherId = searchParams.get('father_id')
  
  try {
    let membersWithChildCount;
    
    if (fatherId === null || fatherId === 'null') {
      // 1 Query: Get root members AND count their children
      membersWithChildCount = await sql`
        SELECT * from public.get_root_family_members()
      `
    } else {
      // 1 Query: Get specific children AND count their children
      membersWithChildCount = await sql`
        SELECT * from public.get_family_children (${parseInt(fatherId)})
      `
    }
    
    // Parse the count to a number before returning
    const normalized = membersWithChildCount.map(m => ({
      ...m,
      children_count: parseInt(m.children_count || '0')
    }))
    
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 })
  }
}