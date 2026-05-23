import { neon } from '@neondatabase/serverless'

// Create a function that returns the SQL client, initializing lazily
function createSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set. Please check your Neon integration.')
  }
  return neon(process.env.DATABASE_URL)
}

// Export a getter that creates the client on first use
export const sql = createSql()

export interface FamilyMember {
  id: number
  name: string
  father_id: number | null
 
  created_at: string
  
}

export interface GuestRequest {
  id: number
  requester_name: string
  
  sons: { name: string; birth_date?: string; bio?: string }[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  father_name?: string
}

export interface Admin {
  id: number
  username: string
  password_hash: string
  created_at: string
}
