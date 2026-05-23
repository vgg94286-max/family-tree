import Image from 'next/image'
import Link from 'next/link'
import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onAddSons: () => void
}

export function Header({ onAddSons }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/lo.png"
              alt="شعار قبيلة الجودي"
              width={50}
              height={50}
              className="object-contain"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Add Sons Button */}
            <Button
              onClick={onAddSons}
              size="sm"
              className="
                rounded-xl
                bg-primary
                hover:bg-primary/90
                shadow-sm
                text-white
                font-medium
                px-4
                hover:cursor-pointer
              "
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة أبناء
            </Button>

            {/* Admin Button */}
            <Link href="/admin">
              <Button
                size="sm"
                variant="outline"
                className="
                  rounded-xl
                  font-medium
                  px-4
                  border
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                  hover:cursor-pointer
                  transition
                "
              >
                <Settings className="w-4 h-4 ml-2" />
                لوحة الإدارة
              </Button>
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}