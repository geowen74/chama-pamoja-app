import { useState, useRef, useCallback } from 'react'
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  Eye,
  Download,
  Trash2,
  FolderOpen,
  FileCheck,
  Users,
  ClipboardList,
  DollarSign,
  ListTodo,
  File,
  Sparkles,
  ScanLine,
} from 'lucide-react'
import { MeetingDocument, DocumentAnalysis } from '../../types'

interface MeetingDocumentsProps {
  documents: MeetingDocument[]
  onDocumentsChange: (documents: MeetingDocument[]) => void
  meetingId?: string
  readOnly?: boolean
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const categoryConfig = {
  minutes: { 
    label: 'Meeting Minutes', 
    icon: FileText, 
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700'
  },
  attendance: { 
    label: 'Attendance Register', 
    icon: Users, 
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  resolution: { 
    label: 'Resolution', 
    icon: FileCheck, 
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700'
  },
  financial_report: { 
    label: 'Financial Report', 
    icon: DollarSign, 
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700'
  },
  agenda: { 
    label: 'Agenda', 
    icon: ListTodo, 
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700'
  },
  other: { 
    label: 'Other Document', 
    icon: File, 
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  },
}

// Simulated OCR and document analysis
const analyzeDocument = async (file: File): Promise<DocumentAnalysis> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))
  
  const fileName = file.name.toLowerCase()
  let suggestedCategory: MeetingDocument['category'] = 'other'
  let documentType = 'Unknown Document'
  let extractedData: DocumentAnalysis['extractedData'] = {}
  
  // Analyze based on filename patterns
  if (fileName.includes('minute') || fileName.includes('mom')) {
    suggestedCategory = 'minutes'
    documentType = 'Meeting Minutes'
    extractedData = {
      title: 'Monthly Meeting Minutes',
      date: new Date().toISOString().split('T')[0],
      attendees: ['John Kamau', 'Mary Wanjiku', 'Peter Omondi', 'Grace Muthoni', 'David Kiprono'],
      decisions: [
        'Approved increase of monthly contribution to KES 7,500',
        'Approved loan application for member #234',
        'Resolved to invest 20% of savings in treasury bonds'
      ],
      actionItems: [
        'Secretary to update contribution records by Friday',
        'Treasurer to prepare quarterly financial report',
        'Chairman to follow up on pending loan repayments'
      ],
      keyPoints: [
        'Quorum was achieved with 15 out of 20 members present',
        'Previous meeting minutes were approved unanimously',
        'New loan policy was discussed and tabled for next meeting'
      ]
    }
  } else if (fileName.includes('attend') || fileName.includes('register')) {
    suggestedCategory = 'attendance'
    documentType = 'Attendance Register'
    extractedData = {
      date: new Date().toISOString().split('T')[0],
      attendees: ['John Kamau', 'Mary Wanjiku', 'Peter Omondi', 'Grace Muthoni', 'David Kiprono', 
                  'Sarah Akinyi', 'James Otieno', 'Faith Njeri', 'Michael Wekesa', 'Ann Chebet'],
      signatures: ['10 signatures detected'],
      keyPoints: [
        'Total attendance: 10 members',
        'Apologies received: 3 members',
        'Absent without notice: 2 members'
      ]
    }
  } else if (fileName.includes('resolution') || fileName.includes('resolve')) {
    suggestedCategory = 'resolution'
    documentType = 'Board Resolution'
    extractedData = {
      title: 'Resolution on Investment Policy',
      date: new Date().toISOString().split('T')[0],
      decisions: [
        'RESOLVED that the group shall invest up to 30% of total savings in approved securities',
        'RESOLVED that all investments above KES 500,000 require board approval',
        'RESOLVED that investment returns shall be distributed annually'
      ],
      signatures: ['Chairman signature detected', 'Secretary signature detected'],
      keyPoints: [
        'Resolution passed with 12 votes in favor, 2 against',
        'Effective date: Immediate',
        'Review date: 12 months from approval'
      ]
    }
  } else if (fileName.includes('financial') || fileName.includes('report') || fileName.includes('statement')) {
    suggestedCategory = 'financial_report'
    documentType = 'Financial Report'
    extractedData = {
      title: 'Monthly Financial Report',
      date: new Date().toISOString().split('T')[0],
      amounts: [
        { description: 'Total Contributions', amount: 450000 },
        { description: 'Total Loans Disbursed', amount: 320000 },
        { description: 'Interest Earned', amount: 28500 },
        { description: 'Expenses', amount: 15000 },
        { description: 'Net Balance', amount: 163500 }
      ],
      keyPoints: [
        'Contributions increased by 15% from previous month',
        'Loan recovery rate at 95%',
        'All expenses within budget allocation'
      ]
    }
  } else if (fileName.includes('agenda')) {
    suggestedCategory = 'agenda'
    documentType = 'Meeting Agenda'
    extractedData = {
      title: 'Meeting Agenda - January 2026',
      date: new Date().toISOString().split('T')[0],
      keyPoints: [
        'Opening Prayer and Preliminaries',
        'Reading and Confirmation of Previous Minutes',
        'Matters Arising',
        'Financial Report by Treasurer',
        'Loan Applications Review',
        'New Business',
        'AOB',
        'Closing'
      ]
    }
  } else {
    // Generic analysis for other documents
    extractedData = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      date: new Date().toISOString().split('T')[0],
      keyPoints: [
        'Document scanned successfully',
        'Text extraction completed',
        'Manual categorization recommended'
      ]
    }
  }
  
  return {
    documentType,
    confidence: 75 + Math.random() * 20,
    extractedData,
    suggestedCategory
  }
}

export default function MeetingDocuments({ 
  documents, 
  onDocumentsChange, 
  readOnly = false 
}: MeetingDocumentsProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [analyzingFiles, setAnalyzingFiles] = useState<Set<string>>(new Set())
  const [selectedDocument, setSelectedDocument] = useState<MeetingDocument | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<MeetingDocument['category'] | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!readOnly) setIsDragging(true)
  }, [readOnly])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = async (file: File): Promise<MeetingDocument | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`File type ${file.type} is not supported`)
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 10MB limit')
      return null
    }

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const newDoc: MeetingDocument = {
          id: docId,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Current User',
          category: 'other',
          analyzed: false,
        }
        
        resolve(newDoc)
      }
      reader.readAsDataURL(file)
    })
  }

  const analyzeAndCategorize = async (doc: MeetingDocument, file: File) => {
    setAnalyzingFiles(prev => new Set([...prev, doc.id]))
    
    try {
      const analysis = await analyzeDocument(file)
      
      const updatedDoc: MeetingDocument = {
        ...doc,
        analyzed: true,
        category: analysis.suggestedCategory,
        analysisResult: analysis,
        extractedText: `Analyzed: ${analysis.documentType}`
      }
      
      onDocumentsChange(documents.map(d => d.id === doc.id ? updatedDoc : d))
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(doc.id)
        return newSet
      })
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (readOnly) return

    const files = Array.from(e.dataTransfer.files)
    const newDocs: MeetingDocument[] = []
    
    for (const file of files) {
      const doc = await processFile(file)
      if (doc) newDocs.push(doc)
    }
    
    const updatedDocs = [...documents, ...newDocs]
    onDocumentsChange(updatedDocs)
    
    // Analyze each new document
    for (let i = 0; i < newDocs.length; i++) {
      analyzeAndCategorize(newDocs[i], files[i])
    }
  }, [documents, onDocumentsChange, readOnly])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newDocs: MeetingDocument[] = []
    
    for (const file of files) {
      const doc = await processFile(file)
      if (doc) newDocs.push(doc)
    }
    
    const updatedDocs = [...documents, ...newDocs]
    onDocumentsChange(updatedDocs)
    
    // Analyze each new document
    for (let i = 0; i < newDocs.length; i++) {
      analyzeAndCategorize(newDocs[i], files[i])
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeDocument = (docId: string) => {
    onDocumentsChange(documents.filter(d => d.id !== docId))
  }

  const updateCategory = (docId: string, category: MeetingDocument['category']) => {
    onDocumentsChange(documents.map(d => 
      d.id === docId ? { ...d, category } : d
    ))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory)

  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: documents.length }
    documents.forEach(doc => {
      counts[doc.category] = (counts[doc.category] || 0) + 1
    })
    return counts
  }

  const categoryCounts = getCategoryCounts()

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!readOnly && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragging
              ? 'border-violet-500 bg-violet-50'
              : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 flex items-center justify-center">
                <ScanLine className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload & Scan Documents
              </h3>
              <p className="text-gray-500 mt-1">
                Drop scanned documents here to automatically analyze and categorize them
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Select Files
            </button>
            <p className="text-xs text-gray-400">
              PDF, Images, Word documents up to 10MB each
            </p>
          </div>

          {/* AI Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Analysis
            </span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({categoryCounts.all || 0})
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = categoryCounts[key] || 0
            if (count === 0 && selectedCategory !== key) return null
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as MeetingDocument['category'])}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : `${config.bgColor} ${config.textColor} hover:opacity-80`
                }`}
              >
                <config.icon className="w-4 h-4" />
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isAnalyzing = analyzingFiles.has(doc.id)
            const config = categoryConfig[doc.category]
            const CategoryIcon = config.icon
            
            return (
              <div
                key={doc.id}
                className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Document Preview */}
                <div className={`relative h-32 bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                  {isAnalyzing ? (
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm font-medium">Analyzing...</p>
                    </div>
                  ) : (
                    <>
                      <CategoryIcon className="w-12 h-12 text-white/80" />
                      {doc.analyzed && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Analyzed
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{doc.name}</h4>
                      <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  
                  {/* Category Selector */}
                  {!readOnly && (
                    <div className="mt-3">
                      <select
                        value={doc.category}
                        onChange={(e) => updateCategory(doc.id, e.target.value as MeetingDocument['category'])}
                        className={`w-full px-3 py-2 rounded-xl text-sm font-medium ${config.bgColor} ${config.textColor} border-0 focus:ring-2 focus:ring-violet-500`}
                      >
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Analysis Results Preview */}
                  {doc.analyzed && doc.analysisResult && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        {doc.analysisResult.documentType}
                      </div>
                      <div className="text-xs text-gray-500">
                        Confidence: {doc.analysisResult.confidence.toFixed(0)}%
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedDocument(doc)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {!readOnly && (
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Document Header */}
              <div className="flex items-start gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${categoryConfig[selectedDocument.category].color} flex items-center justify-center flex-shrink-0`}>
                  {(() => {
                    const Icon = categoryConfig[selectedDocument.category].icon
                    return <Icon className="w-8 h-8 text-white" />
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedDocument.size)}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium ${categoryConfig[selectedDocument.category].bgColor} ${categoryConfig[selectedDocument.category].textColor}`}>
                    {categoryConfig[selectedDocument.category].label}
                  </span>
                </div>
              </div>

              {/* Analysis Results */}
              {selectedDocument.analyzed && selectedDocument.analysisResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    <h4 className="text-lg font-semibold text-gray-900">AI Analysis Results</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-violet-50 rounded-xl">
                      <div className="text-sm text-violet-600 font-medium">Document Type</div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDocument.analysisResult.documentType}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <div className="text-sm text-emerald-600 font-medium">Confidence</div>
                      <div className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedDocument.analysisResult.confidence.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Extracted Data */}
                  {selectedDocument.analysisResult.extractedData.title && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500 font-medium mb-1">Title</div>
                      <div className="font-semibold text-gray-900">
                        {selectedDocument.analysisResult.extractedData.title}
                      </div>
                    </div>
                  )}

                  {selectedDocument.analysisResult.extractedData.attendees && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="text-sm text-blue-600 font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Detected Attendees ({selectedDocument.analysisResult.extractedData.attendees.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.analysisResult.extractedData.attendees.map((name, i) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-lg text-sm text-gray-700">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.analysisResult.extractedData.decisions && (
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <div className="text-sm text-emerald-600 font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Decisions Made
                      </div>
                      <ul className="space-y-2">
                        {selectedDocument.analysisResult.extractedData.decisions.map((decision, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-emerald-500 mt-1">•</span>
                            {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.analysisResult.extractedData.actionItems && (
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <div className="text-sm text-amber-600 font-medium mb-2 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Action Items
                      </div>
                      <ul className="space-y-2">
                        {selectedDocument.analysisResult.extractedData.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-amber-500 mt-1">□</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDocument.analysisResult.extractedData.amounts && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-sm text-green-600 font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Financial Data Extracted
                      </div>
                      <div className="space-y-2">
                        {selectedDocument.analysisResult.extractedData.amounts.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.description}</span>
                            <span className="font-semibold text-gray-900">
                              KES {item.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.analysisResult.extractedData.keyPoints && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="text-sm text-purple-600 font-medium mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Key Points
                      </div>
                      <ul className="space-y-2">
                        {selectedDocument.analysisResult.extractedData.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-500 mt-1">→</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Document Preview */}
              {selectedDocument.type.startsWith('image/') && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h4>
                  <img 
                    src={selectedDocument.dataUrl} 
                    alt={selectedDocument.name}
                    className="w-full rounded-xl border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = selectedDocument.dataUrl
                  link.download = selectedDocument.name
                  link.click()
                }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
