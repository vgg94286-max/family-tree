import { sql } from '@/lib/db'
import { createToken, setAdminCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }
    
    // Find admin
    const admins = await sql`
      SELECT id, username, password_hash FROM admins WHERE username = ${username}
    ` as { id: number; username: string; password_hash: string }[]
    
    if (admins.length === 0) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }
    
    const admin = admins[0]
    
    // For the initial admin, we'll check both hashed and plain password
    // This allows the default admin to work
    let passwordValid = false
    
      passwordValid = await bcrypt.compare(password, admin.password_hash)
    
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }
    
    // Create JWT token
    const token = await createToken(admin.id, admin.username)
    
    // Set cookie
    await setAdminCookie(token)
    
    return NextResponse.json({ 
      success: true,
      admin: { id: admin.id, username: admin.username }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    )
  }
}
