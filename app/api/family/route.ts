import { sql, FamilyMember } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fatherId = searchParams.get('father_id')
  
  try {
    let members: FamilyMember[]
    
    if (fatherId === null || fatherId === 'null') {
      // Get root members (those with no father)
      members = await sql`
        SELECT * FROM family_members 
        WHERE father_id IS NULL 
        
      ` as FamilyMember[]
    } else {
      // Get children of a specific member
      members = await sql`
        SELECT * FROM family_members 
        WHERE father_id = ${parseInt(fatherId)} 
        
      ` as FamilyMember[]
    }
    
    // Get children count for each member
    const membersWithChildCount = await Promise.all(
      members.map(async (member) => {
        const childCount = await sql`
          SELECT COUNT(*) as count FROM family_members WHERE father_id = ${member.id}
        ` as { count: string }[]
        return {
          ...member,
          children_count: parseInt(childCount[0]?.count || '0')
        }
      })
    )
    
    return NextResponse.json(membersWithChildCount)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 })
  }
}
