import { useState } from 'react'
import { Upload, User, Briefcase } from 'lucide-react'
import type { Profile } from '../types'
import UploadModal from './UploadModal'

interface Props {
  activeProfile: Profile
  onProfileChange: (p: Profile) => void
  onUpload: () => void
}

export default function Header({ activeProfile, onProfileChange }: Props) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Olá, Karen!</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie suas finanças PF e PJ.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Upload button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Subir Extrato
          </button>

        {/* Profile toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onProfileChange('PF')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all
              ${activeProfile === 'PF'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <User className="w-4 h-4" />
            Pessoal (PF)
          </button>
          <button
            onClick={() => onProfileChange('PJ')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all
              ${activeProfile === 'PJ'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <Briefcase className="w-4 h-4" />
            Business (PJ)
          </button>
        </div>
      </div>
      </header>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  )
}
