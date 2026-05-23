import { sql } from '@/lib/db'
import { getAdminFromCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookie()
  if (!admin) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  
  const { id } = await params
  const { action } = await request.json()
  
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 })
  }
  
  try {
    // Get the request
    const requests = await sql`
      SELECT * FROM guest_requests WHERE id = ${parseInt(id)}
    ` as { id: number; father_id: number; sons: string[]; status: string }[]
    
    if (requests.length === 0) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }
    
    const guestRequest = requests[0]
    
    if (guestRequest.status !== 'pending') {
      return NextResponse.json({ error: 'تم معالجة هذا الطلب مسبقاً' }, { status: 400 })
    }
    
    if (action === 'approve') {
      
      
      
      await sql`
        UPDATE guest_requests SET status = 'approved' WHERE id = ${parseInt(id)}
      `
      
      return NextResponse.json({ message: 'تمت الموافقة على الطلب وإضافة الأبناء' })
    } else {
      // Reject request
      await sql`
        UPDATE guest_requests SET status = 'rejected' WHERE id = ${parseInt(id)}
      `
      
      return NextResponse.json({ message: 'تم رفض الطلب' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'فشل في معالجة الطلب' }, { status: 500 })
  }
}
