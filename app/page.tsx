'use client'

import { useState } from 'react'
import { CompleteTree } from '@/components/complete-tree'
import { InteractiveTree } from '@/components/interactive-tree'
import { MemberSearch } from '@/components/member-search'
import { AddSonsForm } from '@/components/add-sons-form'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Plus, Network, GitMerge } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FamilyMember {
  id: number
  name: string
  father_id: number | null
  
  children_count?: number
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'interactive' | 'complete'>('complete')
  const [showAddForm, setShowAddForm] = useState(false)
  
  
  const handleAddSons = () => {
    
    setShowAddForm(true)
  }
  
 
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-20" dir="rtl">
      <Header onAddSons={() => handleAddSons()} />
      
      <main className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">
           شجرة آل شايق
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            تصفح شجرة العائلة الكاملة أو استخدم العرض التفاعلي للتنقل بين الأجيال بسهولة.
          </p>
        </div>
        
       

        {/* Tabs Control */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full max-w-md mx-auto mb-8 shadow-inner">
          <button 
            onClick={() => setActiveTab('complete')} 
            className={cn(
              "flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all",
              activeTab === 'complete' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <Network className="w-4 h-4" />
            الشجرة الكاملة
          </button>
          <button 
            onClick={() => setActiveTab('interactive')} 
            className={cn(
              "flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all",
              activeTab === 'interactive' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <GitMerge className="w-4 h-4" />
            الشجرة التفاعلية
          </button>
        </div>
        
        {/* Main Tree Content */}
        <div className="bg-white dark:bg-card rounded-3xl border shadow-sm p-4 md:p-8 min-h-[500px]">
          {activeTab === 'complete' ? <CompleteTree /> : <InteractiveTree />}
        </div>
      </main>
      
      {/* Add Sons Modal */}
      {showAddForm && (
        <AddSonsForm
          
          onClose={() => {
            setShowAddForm(false)
            
          }}
        />
      )}
    </div>
  )
}