'use client'



import { useState, useEffect, useRef } from 'react' // إضافة useRef
import useSWR from 'swr'
import { Search, User, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FamilyMember {
  id: number
  name: string
  father_id: number | null

}

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface MemberSearchProps {
  onSelect: (member: FamilyMember) => void
  placeholder?: string
  className?: string
}

export function MemberSearch({ onSelect, placeholder = 'ابحث عن اسم...', className }: MemberSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  // Reference للحاوية الرئيسية لاكتشاف النقرات خارجها
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // إضافة Effect لإغلاق القائمة عند النقر في أي مكان خارج المكون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const { data: results, isLoading } = useSWR<FamilyMember[]>(
    debouncedQuery.length >= 1 ? `/api/family/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  )
  
  const handleSelect = (member: FamilyMember) => {
    onSelect(member)
    setQuery('')
    setIsOpen(false)
  }
  
  return (
    // إضافة ref هنا
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10 bg-card"
        />
      </div>
      
      {/* القائمة المنسدلة (بدون Backdrop ثابت) */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-[60] max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">جاري البحث...</div>
          ) : results && results.length > 0 ? (
            <ul>
              {results.map((member) => (
                <li key={member.id}>
                  <button
                    type="button" // مهم جداً داخل الفورم لمنع إرسال النموذج
                    onClick={() => handleSelect(member)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-right"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-muted-foreground">لم يتم العثور على نتائج</div>
          )}
        </div>
      )}
    </div>
  )
}