import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requester_name, sons } = body
    
    if (!requester_name ||  !sons || sons.length === 0) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }
    
    
    // Insert request
    await sql`
      INSERT INTO guest_requests (requester_name, sons, status)
      VALUES (${requester_name}, ${JSON.stringify(sons)}, 'pending')
    `
    
    return NextResponse.json({ message: 'تم إرسال الطلب بنجاح' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في إرسال الطلب' }, { status: 500 })
  }
}
