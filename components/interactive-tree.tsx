'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronUp } from 'lucide-react'
import { FamilyMember } from '@/app/page'
import { cn } from '@/lib/utils'

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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function InteractiveTree() {
  const [activePath, setActivePath] = useState<FamilyMember[]>([])
  
  const currentFocus = activePath.length > 0 ? activePath[activePath.length - 1] : null
  const fetchUrl = currentFocus 
    ? `/api/family?father_id=${currentFocus.id}` 
    : '/api/family?father_id=null'

  const { data: children, error, isLoading } = useSWR<FamilyMember[]>(fetchUrl, fetcher)

  const handleChildClick = (child: FamilyMember) => {
    setActivePath(prev => [...prev, child])
  }

  const handleAncestorClick = (index: number) => {
    setActivePath(prev => prev.slice(0, index + 1))
  }

  const handleResetToStart = () => {
    setActivePath([])
  }

  if (isLoading && activePath.length === 0) return <LoadingSpinner />
  if (error) return <div className="text-center py-20 text-red-500">حدث خطأ في تحميل البيانات</div>

  return (
    // استخدام overflow-auto للسماح بالتمرير في كل الاتجاهات، وإزالة القيود العرضية
    <div className="w-full py-8 overflow-auto touch-pan-x touch-pan-y no-scrollbar">
      {/* استخدام w-max لضمان تمدد الحاوية لتشمل كل الأبناء دون ضغطهم */}
      <div className="w-max min-w-full flex flex-col items-center px-4 md:px-8 mx-auto">
        
        {activePath.length > 0 && (
          <div className="flex flex-col items-center group cursor-pointer mb-2" onClick={handleResetToStart}>
            <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-primary/10 px-2 py-0.5 rounded-full">
              العودة للبداية
            </div>
            <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full group-hover:bg-primary/50 transition-colors" />
            <div className="w-px h-4 md:h-6 bg-slate-300 dark:bg-slate-700" />
          </div>
        )}

        {activePath.map((ancestor, index) => {
          const isCurrentFocus = index === activePath.length - 1
          
          return (
            <div key={ancestor.id} className="flex flex-col items-center relative group">
              <div 
  onClick={() => !isCurrentFocus && handleAncestorClick(index)}
  className={cn(
    "relative flex flex-col items-center justify-center px-3 py-3 md:px-6 md:py-4 rounded-xl border-2 transition-all min-w-[120px] md:min-w-[160px] shrink-0",
    getStateStyles(ancestor.state), // <-- Apply styles
    isCurrentFocus 
      ? "border-primary ring-4 ring-primary/30 shadow-lg scale-105" // Removed 'bg-primary' so it doesn't overwrite state color
      : "cursor-pointer hover:border-primary hover:shadow-md"
  )}
>
                {!isCurrentFocus && (
                  <div className="absolute -top-3 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:-translate-y-1 flex items-center gap-1 shadow-sm">
                    <ChevronUp className="w-3 h-3" />
                    عودة
                  </div>
                )}
                <span className="font-bold text-sm md:text-lg whitespace-nowrap">{ancestor.name}</span>
                {ancestor.state && ancestor.state !== 'على قيد الحياة' && (
    <span className={cn("text-[9px] md:text-xs mt-1 opacity-90 font-medium", ancestor.state === 'متوفى وليس له عقب' ? "text-gray-300" : "text-muted-foreground")}>
      {getStateText(ancestor.state)}
    </span>
  )}
              </div>
              
              <div className="w-px h-6 md:h-10 bg-slate-300 dark:bg-slate-700" />
            </div>
          )
        })}

        {isLoading ? (
           <div className="w-6 h-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin mt-4" />
        ) : children && children.length > 0 ? (
          <div className="relative flex justify-center w-full">
            {children.length > 1 && (
              <div 
                className="absolute top-0 left-0 right-0 h-px bg-slate-300 dark:bg-slate-700 mx-auto" 
                style={{ width: `calc(100% - 120px)` }} 
              />
            )}
            
            {/* استخدام flex-nowrap بشكل صارم لمنع تكسر السطور */}
            <div className="flex gap-4 md:gap-10 flex-nowrap justify-center pt-6 md:pt-10 w-max mx-auto">
              {children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center group shrink-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 md:h-10 -mt-6 md:-mt-10 bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors" />
                  
                 <div 
  onClick={() => handleChildClick(child)}
  className={cn(
    "flex flex-col items-center justify-center px-3 py-3 md:px-6 md:py-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary hover:shadow-md hover:-translate-y-1 min-w-[120px] md:min-w-[160px]",
    getStateStyles(child.state) // <-- Apply styles
  )}
>
                    <span className="font-bold text-xs md:text-base dark:text-slate-100 whitespace-nowrap">{child.name}</span>
                    {child.state && child.state !== 'على قيد الحياة' && (
    <span className={cn("text-[9px] md:text-[11px] mt-1 opacity-90 font-medium", child.state === 'متوفى وليس له عقب' ? "text-gray-300" : "text-muted-foreground")}>
      {getStateText(child.state)}
    </span>
  )}
                    {child.children_count !== undefined && child.children_count > 0 && (
                       <span className="text-[10px] md:text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 md:mt-2">
                         {child.children_count} أبناء
                       </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs md:text-sm border border-dashed border-slate-300">
            لا يوجد أبناء
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">جاري التحميل...</p>
    </div>
  )
}