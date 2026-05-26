// مكون CompleteTree المحدث
'use client'

import useSWR from 'swr'

import { cn } from '@/lib/utils'

interface FamilyMember {
  id: number
  name: string
  father_id: number | null
  father_name: string | null
  children_count?: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface TreeProps {
  onSelectNode?: (member: FamilyMember) => void
  selectedNodeId?: number | null
}

function CompleteTreeNode({ member, onSelectNode, selectedNodeId }: { member: FamilyMember } & TreeProps) {
  const { data: children } = useSWR<FamilyMember[]>(
    member.children_count && member.children_count > 0
      ? `/api/family?father_id=${member.id}`
      : null,
    fetcher
  )

  const isSelected = selectedNodeId === member.id

  return (
    <div className="flex flex-col items-center relative shrink-0">
      {/* أضفنا تفاعل النقر وتغيير التصميم بناءً على حالة التحديد */}
      <button
        onClick={() => onSelectNode && onSelectNode(member)}
        className={cn(
          "relative flex flex-col items-center px-3 py-2 md:px-5 md:py-3 rounded-lg md:rounded-xl border shadow-sm min-w-[100px] md:min-w-[130px] z-10 shrink-0 transition-all cursor-pointer hover:scale-105 active:scale-95",
          isSelected 
            ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20" 
            : "bg-white dark:bg-slate-900 border-border hover:border-primary/50"
        )}
      >
        <span className={cn(
          "font-bold text-xs md:text-sm whitespace-nowrap",
          isSelected ? "text-primary-foreground" : "text-slate-900 dark:text-slate-100"
        )}>
          {member.name}
        </span>
      </button>

      {children && children.length > 0 && (
        <div className="relative mt-6 md:mt-8 flex justify-center w-max mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />
          <div className="flex justify-center pt-6 md:pt-8 flex-nowrap w-max mx-auto">
            {children.map((child, index) => {
              const isOnly  = children.length === 1
              const isFirst = index === 0
              const isLast  = index === children.length - 1

              return (
                <div key={child.id} className="relative flex flex-col items-center shrink-0 px-1 md:px-4">
                  {!isOnly && (
                    <div
                      className={cn(
                        "absolute top-0 h-px -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700",
                        isFirst ? "start-1/2 end-0" : isLast ? "start-0 end-1/2" : "inset-x-0"
                      )}
                    />
                  )}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-8 -mt-6 md:-mt-8 bg-slate-300 dark:bg-slate-700" />
                  
                  {/* التمرير العكسي (Prop Drilling) للخصائص */}
                  <CompleteTreeNode 
                    member={child} 
                    onSelectNode={onSelectNode} 
                    selectedNodeId={selectedNodeId} 
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function CompleteTree({ onSelectNode, selectedNodeId }: TreeProps) {
  const { data: rootMembers, error, isLoading } = useSWR<FamilyMember[]>(
    '/api/family?father_id=null',
    fetcher
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
      </div>
    )
  }

  if (error || !rootMembers) return <div className="py-32 text-center text-red-500 font-medium">حدث خطأ في تحميل البيانات</div>

  return (
    <div className="overflow-auto w-full touch-pan-x touch-pan-y py-10 no-scrollbar">
      <div className="w-max min-w-full flex justify-center px-4 md:px-10 mx-auto">
        <div className="flex gap-4 md:gap-16 flex-nowrap">
          {rootMembers.map((member) => (
            <CompleteTreeNode 
              key={member.id} 
              member={member} 
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}