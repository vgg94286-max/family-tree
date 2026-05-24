'use client'

import useSWR from 'swr'
import { FamilyMember } from '@/app/page'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function CompleteTreeNode({ member }: { member: FamilyMember }) {
  const { data: children } = useSWR<FamilyMember[]>(
    member.children_count && member.children_count > 0 
      ? `/api/family?father_id=${member.id}` 
      : null,
    fetcher
  )

  return (
    <div className="flex flex-col items-center relative shrink-0">
      {/* إضافة shrink-0 و whitespace-nowrap */}
      <div className="relative flex flex-col items-center px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl border bg-white dark:bg-slate-900 shadow-sm min-w-[100px] md:min-w-[130px] z-10 shrink-0">
        <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">{member.name}</span>
      </div>
      
      {children && children.length > 0 && (
        <div className="relative mt-6 md:mt-8 flex justify-center w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />
          
          {children.length > 1 && (
            <div 
               className="absolute top-0 left-0 right-0 h-px bg-slate-300 dark:bg-slate-700 mx-auto" 
               style={{ width: `calc(100% - 100px)` }}
            />
          )}
          
          {/* إجبار الأبناء على البقاء في صف واحد باستخدام flex-nowrap و w-max */}
          <div className="flex gap-2 md:gap-8 justify-center pt-6 md:pt-8 flex-nowrap w-max mx-auto">
            {children.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />
                <CompleteTreeNode member={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CompleteTree() {
  const { data: rootMembers, error, isLoading } = useSWR<FamilyMember[]>(
    '/api/family?father_id=null',
    fetcher
  )
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
        <div className="text-center text-slate-500 font-medium">جاري بناء الشجرة الكاملة...</div>
      </div>
    )
  }
  
  if (error || !rootMembers) {
    return <div className="py-32 text-center text-red-500 font-medium">حدث خطأ في تحميل البيانات</div>
  }
  
  return (
    // استخدام overflow-auto لدعم التمرير في كل الاتجاهات
    <div className="overflow-auto w-full touch-pan-x touch-pan-y py-10 no-scrollbar">
      {/* w-max تضمن تمدد الحاوية خارج الشاشة عند الحاجة */}
      <div className="w-max min-w-full flex justify-center px-4 md:px-10 mx-auto">
        <div className="flex gap-4 md:gap-16 flex-nowrap">
          {rootMembers.map((member) => (
            <CompleteTreeNode key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  )
}