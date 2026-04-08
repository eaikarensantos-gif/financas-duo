import { useState, useRef } from 'react'
import { X, Upload, Loader } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import { parseUploadedFile } from '../utils/uploadParser'
import type { Transaction } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function UploadModal({ isOpen, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<Partial<Transaction>[]>([])
  const [error, setError] = useState<string>('')
  const { addTransaction, activeProfile } = useFinanceStore()

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError('')
    setPreview([])

    try {
      const transactions = await parseUploadedFile(file, activeProfile)
      setPreview(transactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    setIsLoading(true)
    try {
      for (const t of preview) {
        await addTransaction(t as Omit<Transaction, 'id'>)
      }
      setPreview([])
      onClose()
    } catch (err) {
      setError('Erro ao importar transações')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Importar Extrato</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {preview.length === 0 ? (
            <>
              {/* File upload area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-3 mx-auto w-full"
                >
                  {isLoading ? (
                    <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-indigo-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isLoading ? 'Processando...' : 'Clique para selecionar ou arraste um arquivo'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      CSV, XLSX, XLS ou PDF
                    </p>
                  </div>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-semibold mb-2">Formato esperado:</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Data (DD/MM/YYYY ou YYYY-MM-DD)</li>
                  <li>• Descrição/Título</li>
                  <li>• Categoria (opcional)</li>
                  <li>• Valor (use - para despesas)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {preview.length} transação(ões) encontrada(s)
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-3">
                  {preview.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500">{t.date} • {t.category}</p>
                      </div>
                      <p className={`font-semibold ${t.amount! > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount! > 0 ? '+' : ''}R$ {Math.abs(t.amount!).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreview([])
                    setError('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
