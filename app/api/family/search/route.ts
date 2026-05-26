// /api/family/search/route.ts
import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query || query.length < 1) {
    return NextResponse.json([])
  }
  
  
  const normalizedQuery = '%' + query + '%'

  try {
    const members = await sql`
      SELECT id, name, father_id
      FROM family_members 
      WHERE TRANSLATE(name, 'أإآة', 'اااه') ILIKE TRANSLATE(${normalizedQuery}, 'أإآة', 'اااه')
      ORDER BY name ASC
      LIMIT 10
    `
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في البحث' }, { status: 500 })
  }
}