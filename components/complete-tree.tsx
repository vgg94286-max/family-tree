'use client'

import useSWR from 'swr'
import { FamilyMember } from '@/app/page'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())
export const getStateStyles = (state?: string | null) => {
  switch (state) {
    case 'متوفى': return 'bg-gray-200 text-slate-800 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-500';
    case 'متوفى وليس له عقب': return 'bg-black text-white border-black dark:bg-black dark:border-gray-800';
    case 'توفي صغيرا': return 'bg-[#F5F5DC] text-slate-800 border-[#E5E5CC] dark:bg-[#7A7A5C] dark:text-white dark:border-[#6A6A4C]';
    case 'على قيد الحياة':
    default: return 'bg-white text-slate-900 border-border dark:bg-slate-900 dark:text-slate-100';
  }
}

export const getStateText = (state?: string | null) => {
  if (!state || state === 'على قيد الحياة') return 'على قيد الحياة';
  return `${state} (رحمه الله)`;
}
function CompleteTreeNode({ member }: { member: FamilyMember }) {
  const { data: children } = useSWR<FamilyMember[]>(
    member.children_count && member.children_count > 0
      ? `/api/family?father_id=${member.id}`
      : null,
    fetcher
  )

  return (
    <div className="flex flex-col items-center relative shrink-0">
      <div className={cn("relative flex flex-col items-center px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl border bg-white dark:bg-slate-900 shadow-sm min-w-[100px] md:min-w-[130px] z-10 shrink-0", getStateStyles(member.state))}>
        <span className="font-bold text-xs md:text-sm dark:text-slate-100 whitespace-nowrap">
          {member.name}
        </span>
        {member.state && member.state !== 'على قيد الحياة' && (
  <span className="text-[10px] md:text-xs mt-1 opacity-90 font-medium">
    {getStateText(member.state)}
  </span>
)}
      </div>

      {children && children.length > 0 && (
        <div className="relative mt-6 md:mt-8 flex justify-center w-max mx-auto">
          {/* Vertical stem from parent card down */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />

          <div className="flex justify-center pt-6 md:pt-8 flex-nowrap w-max mx-auto">
            {children.map((child, index) => {
              const isOnly  = children.length === 1
              const isFirst = index === 0
              const isLast  = index === children.length - 1

              return (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center shrink-0 px-1 md:px-4"
                >
                  {/*
                    Horizontal connector using LOGICAL properties (start/end).
                    These flip automatically in RTL, so the segment always
                    extends INWARD toward siblings — never outward.

                    LTR: start=left,  end=right
                    RTL: start=right, end=left

                    isFirst (DOM index 0):
                      LTR → leftmost  → line extends rightward  → start-1/2 end-0 ✓
                      RTL → rightmost → line extends leftward   → start-1/2 end-0 ✓

                    isLast (DOM index N-1):
                      LTR → rightmost → line extends leftward   → start-0 end-1/2 ✓
                      RTL → leftmost  → line extends rightward  → start-0 end-1/2 ✓
                  */}
                  {!isOnly && (
                    <div
                      className={cn(
                        "absolute top-0 h-px -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700",
                        isFirst ? "start-1/2 end-0"
                        : isLast  ? "start-0 end-1/2"
                        :           "inset-x-0"
                      )}
                    />
                  )}

                  {/* Vertical drop to child card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />

                  <CompleteTreeNode member={child} />
                </div>
              )
            })}
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
    <div className="overflow-auto w-full touch-pan-x touch-pan-y py-10 no-scrollbar">
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