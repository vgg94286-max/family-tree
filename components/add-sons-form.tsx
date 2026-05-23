'use client'

import { useState } from 'react'
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'


interface AddSonsFormProps {

  onClose: () => void
}

export function AddSonsForm({ onClose }: AddSonsFormProps) {
  const [requesterName, setRequesterName] = useState('')

  const [sons, setSons] = useState<string[]>([''])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAddSonField = () => setSons([...sons, ''])

  const handleRemoveSonField = (index: number) => {
    if (sons.length > 1) {
      const newSons = [...sons]
      newSons.splice(index, 1)
      setSons(newSons)
    }
  }

  const handleSonNameChange = (index: number, value: string) => {
    const newSons = [...sons]
    newSons[index] = value
    setSons(newSons)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // تصفية الأسماء الفارغة
    const validSons = sons.filter(name => name.trim() !== '')

    // التحقق من الحقول المطلوبة
    if (!requesterName.trim()) {
      setError('الرجاء إدخال اسم مقدم الطلب')
      return
    }

    if (validSons.length === 0) {
      setError('الرجاء إدخال اسم ابن واحد على الأقل')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: requesterName,

          sons: validSons
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب')
      }

      // إظهار رسالة النجاح ثم إغلاق النافذة
      setIsSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2500)

    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  // واجهة النجاح
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-green-100 dark:border-green-900">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">تم إرسال الطلب بنجاح</h2>
          <p className="text-slate-500">سيتم مراجعة الطلب من قبل الإدارة قريباً.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">طلب إضافة أبناء</h2>
            <p className="text-sm text-slate-500 mt-1">سيتم مراجعة الطلب من قبل الإدارة قبل إضافته للشجرة</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* اسم مقدم الطلب */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              اسم مقدم الطلب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="الاسم الثلاثي لمقدم الطلب"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>



          {/* أسماء الأبناء */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              أسماء الأبناء المراد إضافتهم <span className="text-red-500">*</span>
            </label>

            {sons.map((sonName, index) => (
              // Added w-full here to ensure the row fills space
              <div key={index} className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  required
                  value={sonName}
                  onChange={(e) => handleSonNameChange(index, e.target.value)}
                  placeholder={`اسم الابن ${index + 1}`}
                  // ADDED: min-w-0 is the key fix for responsive flex inputs
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {sons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSonField(index)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddSonField}
              className="w-full border-dashed border-2 py-6 mt-2 text-slate-500"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة ابن آخر
            </Button>
          </div>

          {/* أزرار التحكم */}
          <div className="pt-4 border-t flex gap-3">
            <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}