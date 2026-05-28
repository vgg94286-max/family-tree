'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CompleteTree } from '@/components/complete-tree-adding'
import { 
  Users, FileText, LogOut, Plus, Pencil, Trash2, Check, X, 
  Loader2, ChevronLeft, Search, User,Network
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MemberSearch } from '@/components/member-search'

export interface FamilyMember {
  id: number
  name: string
  father_id: number | null
  father_name: string | null
  state?: string | null // <-- Add this
  children_count?: number
}

export const MEMBER_STATES = [
  "على قيد الحياة",
  "توفي صغيرا",
  "متوفى وليس له عقب",
  "متوفى"
];

interface GuestRequest {
  id: number
  requester_name: string
  father_id: number
  father_name: string
  sons: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
})

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'requests' | 'members' | 'add_tree'>('requests')
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Check auth
  const { data: authData, error: authError } = useSWR('/api/admin/me', fetcher)
  
  useEffect(() => {
    if (authError) {
      router.push('/admin')
    }
  }, [authError, router])
  
  // Fetch data
  const { data: requests, isLoading: requestsLoading } = useSWR<GuestRequest[]>(
    authData ? '/api/admin/requests' : null,
    fetcher
  )
  console.log('REQUESTS:', requests)
  const { data: members, isLoading: membersLoading } = useSWR<FamilyMember[]>(
    authData ? '/api/admin/members' : null,
    fetcher
  )
  
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }
  
  const handleRequestAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        mutate('/api/admin/requests')
        mutate('/api/admin/members')
      }
    } catch (error) {
      console.error('Request action error:', error)
    }
  }
  
  const handleDeleteMember = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return
    
    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        mutate('/api/admin/members')
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }
  
  const filteredMembers = members?.filter(m => 
    m.name.includes(searchQuery) || 
    m.father_name?.includes(searchQuery)
  )
  
  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0
  
  if (!authData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/low.png"
                alt="شعار قبيلة الجودي"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="font-bold">لوحة الإدارة</h1>
                <p className="text-xs text-primary-foreground/70">مرحباً</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                العودة للموقع
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 md:gap-4 mb-8 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:pb-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 text-sm md:text-base",
              activeTab === 'requests'
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground shadow-sm border"
            )}
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            طلبات الإضافة
            {pendingCount > 0 && (
              <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 text-sm md:text-base",
              activeTab === 'members'
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground shadow-sm border"
            )}
          >
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            أعضاء العائلة
            <span className="text-xs opacity-70">({members?.length || 0})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('add_tree')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 text-sm md:text-base",
              activeTab === 'add_tree' 
                ? "bg-primary text-primary-foreground" 
                : "bg-card text-muted-foreground hover:text-foreground shadow-sm border"
            )}
          >
            <Network className="w-4 h-4 md:w-5 md:h-5" />
            إضافة عضو (عبر الشجرة)
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'requests' && (
          <RequestsTab 
            requests={requests || []} 
            isLoading={requestsLoading}
            onAction={handleRequestAction}
          />
        )}
        
        {activeTab === 'members' && (
          <MembersTab
            members={filteredMembers || []}
            isLoading={membersLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEdit={setEditingMember}
            onDelete={handleDeleteMember}
            
          />
        )}
        {activeTab === 'add_tree' && (
          <AddMemberTreeTab />
        )}
      </main>
      
      {/* Edit/Add Modal */}
      {editingMember && (
        <MemberFormModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={() => {
            mutate('/api/admin/members')
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}

function RequestsTab({ 
  requests, 
  isLoading,
  onAction 
}: { 
  requests: GuestRequest[]
  isLoading: boolean
  onAction: (id: number, action: 'approve' | 'reject') => void
}) {
  const [processingId, setProcessingId] = useState<number | null>(null)
  
  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessingId(id)
    await onAction(id, action)
    setProcessingId(null)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        لا توجد طلبات حالياً
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className={cn(
            "bg-card border rounded-xl p-6",
            request.status === 'pending' && "border-accent"
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  request.status === 'pending' && "bg-yellow-100 text-yellow-800",
                  request.status === 'approved' && "bg-green-100 text-green-800",
                  request.status === 'rejected' && "bg-red-100 text-red-800"
                )}>
                  {request.status === 'pending' && 'قيد الانتظار'}
                  {request.status === 'approved' && 'تمت الموافقة'}
                  {request.status === 'rejected' && 'مرفوض'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                مقدم من: <span className="font-medium text-foreground">{request.requester_name}</span>
              </p>
             
              <p className="text-xs text-muted-foreground mt-1">
                تاريخ الطلب <span className="font-medium text-foreground">{new Date(request.created_at).toLocaleDateString('ar-SA')}</span>
              </p>
            </div>
            
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction(request.id, 'approve')}
                  disabled={processingId === request.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 ml-1" />
                      موافقة
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction(request.id, 'reject')}
                  disabled={processingId === request.id}
                  className="bg-red-600 hover:bg-red-700"


                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 ml-1" />
                  )}
                  رفض
                </Button>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">الأبناء المطلوب إضافتهم:</p>
            <div className="grid gap-2">
              {Array.isArray(request.sons) && request.sons.length > 0 ? (
  request.sons.map((son, idx) => (
    <div key={idx} className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{son}</p>
        
      </div>
    </div>
  ))
) : (
  <p className="text-sm text-muted-foreground">لا يوجد أبناء داخل هذا الطلب</p>
)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MembersTab({
  members,
  isLoading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  
}: {
  members: FamilyMember[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onEdit: (member: FamilyMember) => void
  onDelete: (id: number) => void
  
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div>
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن اسم..."
            className="pr-10"
          />
        </div>
        
      </div>
      
      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الأب</th>
                
                <th className="px-4 py-3 text-right text-sm font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {member.father_name || '-'}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      
                      <button
                        onClick={() => onDelete(member.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MemberFormModal({
  member,
  onClose,
  onSave
}: {
  member: FamilyMember | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    father_id: member?.father_id || null,
    
  })
  const [selectedFather, setSelectedFather] = useState<{ id: number; name: string; } | null>(
    member?.father_id && member?.father_name 
      ? { id: member.father_id, name: member.father_name } 
      : null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      const url = member 
        ? `/api/admin/members/${member.id}`
        : '/api/admin/members'
      
      const response = await fetch(url, {
        method: member ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          father_id: selectedFather?.id || null
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
   
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    {/* أضفنا pb-32 هنا لتوفير مساحة للقائمة المنسدلة داخل منطقة التمرير */}
    <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto pb-32">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold">
          {member ? 'تعديل عضو' : 'إضافة عضو جديد'}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
           <Label>الأب</Label>
           {/* القائمة الآن ستجد مساحة pb-32 لتظهر فيها دون أن تُقص */}
           {selectedFather ? (
             <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
               <span className="flex-1">{selectedFather.name}</span>
               <button
                 type="button"
                 onClick={() => setSelectedFather(null)}
                 className="p-1 hover:bg-background rounded"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
           ) : (
             <MemberSearch
               onSelect={(m) => setSelectedFather({ id: m.id, name: m.name })}
               placeholder="ابحث عن الأب..."
             />
           )}
        </div>
          
          
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                member ? 'حفظ التغييرات' : 'إضافة'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
// تبويب إضافة الأعضاء عبر الشجرة التفاعلية
function AddMemberTreeTab() {
  const [selectedFather, setSelectedFather] = useState<FamilyMember | null>(null)
  const [isRootModalOpen, setIsRootModalOpen] = useState(false)

  return (
    <div className="bg-card border rounded-xl p-4 md:p-8 min-h-[600px] relative">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">إضافة أعضاء للشجرة</h2>
          <p className="text-muted-foreground text-sm">انقر على أي عضو في الشجرة لإضافة أبناء له.</p>
        </div>
        <Button onClick={() => setIsRootModalOpen(true)} variant="outline">
          <Plus className="w-4 h-4 ml-2" /> إضافة جد (بدون أب)
        </Button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border overflow-hidden">
        <CompleteTree 
          onSelectNode={(member) => setSelectedFather(member)} 
          selectedNodeId={selectedFather?.id || null} 
        />
      </div>

      {selectedFather && (
        <TreeActionModal
          member={selectedFather}
          onClose={() => setSelectedFather(null)}
          onSave={() => {
            // تحديث بيانات الشجرة للعضو المحدد لتظهر الفروع الجديدة فوراً
            // 1. Update the regular members table
      mutate('/api/admin/members')
      
      // 2. Force re-fetch of the entire tree to update children_counts
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/family'),
        undefined,
        { revalidate: true }
      )
            setSelectedFather(null)
          }}
        />
      )}

      {isRootModalOpen && (
        <TreeActionModal
          member={null}
          onClose={() => setIsRootModalOpen(false)}
          onSave={() => {
           // 1. Update the regular members table
      mutate('/api/admin/members')
      
      // 2. Force re-fetch of the entire tree
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/family'),
        undefined,
        { revalidate: true }
      )
            setIsRootModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function TreeActionModal({ member, onClose, onSave }: { member: FamilyMember | null, onClose: () => void, onSave: () => void }) {
  const [activeTab, setActiveTab] = useState<'add' | 'edit'>('add')
  const [sons, setSons] = useState<{name: string, state: string}[]>([{name: '', state: 'على قيد الحياة'}])
  
  // تحديث حالة التعديل لتشمل الأب
  const [editData, setEditData] = useState({ 
    name: member?.name || '', 
    state: member?.state || 'على قيد الحياة',
    father_id: member?.father_id || null,
    father_name: member?.father_name || ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setIsSubmitting(true);
    const validSons = sons.filter(s => s.name.trim() !== '')
    if (validSons.length === 0) { setError('أدخل اسم واحد على الأقل'); setIsSubmitting(false); return; }
    
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: validSons, father_id: member?.id || null })
      })
      if (!response.ok) throw new Error((await response.json()).error)
      onSave()
    } catch (err: any) { setError(err.message) } finally { setIsSubmitting(false) }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/members/${member!.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        // إرسال father_id الجديد
        body: JSON.stringify({ 
          name: editData.name, 
          state: editData.state, 
          father_id: editData.father_id 
        })
      })
      if (!response.ok) throw new Error((await response.json()).error)
      onSave()
    } catch (err: any) { setError(err.message) } finally { setIsSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* تم إضافة pb-32 لضمان عدم قص قائمة البحث المنسدلة للأب */}
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col pb-32">
        <div className="flex items-center justify-between p-4 border-b">
          {member ? (
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('add')} className={cn("font-bold pb-2 border-b-2", activeTab === 'add' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>إضافة أبناء</button>
              <button onClick={() => setActiveTab('edit')} className={cn("font-bold pb-2 border-b-2", activeTab === 'edit' ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>تعديل البيانات</button>
            </div>
          ) : <h2 className="text-xl font-bold">إضافة جد رئيسي</h2>}
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg mb-2"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
          
          {activeTab === 'add' ? (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <Label>{member ? `أسماء أبناء (${member.name}):` : 'الفروع الرئيسية:'}</Label>
              {sons.map((son, index) => (
                <div key={index} className="flex gap-2 items-center bg-secondary/20 p-2 rounded-lg">
                  <Input value={son.name} onChange={(e) => { const n = [...sons]; n[index].name = e.target.value; setSons(n); }} placeholder={`الاسم ${index + 1}`} className="flex-1" />
                  <select value={son.state} onChange={(e) => { const n = [...sons]; n[index].state = e.target.value; setSons(n); }} className="w-[140px] h-10 px-2 rounded-md border text-sm bg-background">
                    {MEMBER_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {sons.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setSons(sons.filter((_, i) => i !== index))} className="text-destructive shrink-0"><Trash2 className="w-4 h-4" /></Button>}
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => setSons([...sons, {name: '', state: 'على قيد الحياة'}])}><Plus className="w-4 h-4 ml-2" /> إضافة حقل آخر</Button>
              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ وإضافة'}</Button>
            </form>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div><Label>الاسم</Label><Input value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} required /></div>
              <div>
                <Label>الحالة</Label>
                <select value={editData.state} onChange={(e) => setEditData({...editData, state: e.target.value})} className="w-full h-10 px-3 rounded-md border bg-background">
                  {MEMBER_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              {/* حقل تعديل الأب */}
              <div className="space-y-2">
                <Label>الأب (يمكن تغييره)</Label>
                {editData.father_id ? (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border">
                    <span className="flex-1 text-sm font-medium">الأب: {editData.father_name}</span>
                    <button
                      type="button"
                      onClick={() => setEditData({...editData, father_id: null, father_name: ''})}
                      className="p-1 hover:bg-background rounded text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <MemberSearch
                    onSelect={(m) => setEditData({...editData, father_id: m.id, father_name: m.name})}
                    placeholder="ابحث عن الأب الجديد..."
                  />
                )}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التعديلات'}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}