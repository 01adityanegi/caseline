import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { FileText, Download, Search, Filter, Folder, Sparkles, Plus, HardDrive } from 'lucide-react'

import { getDocumentFilter, isClientUser } from '@/lib/rbac'

export default async function DocumentsPage() {
  const session = await auth()
  if (!session) return null

  const isClient = isClientUser(session.user)
  const documentFilter = await getDocumentFilter(session.user)

  const documents = await prisma.document.findMany({
    where: documentFilter,
    include: {
      case: { select: { caseNumber: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {isClient ? 'My Case Documents' : 'Document Vault'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isClient
              ? 'Pleadings, evidence bundles, notices, and court filings associated with your legal matters.'
              : 'Central repository for pleadings, evidence bundles, court orders, and contracts with OCR text extraction.'}
          </p>
        </div>
        <button className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5" />
          Upload Files
        </button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Indexed Documents</p>
            <p className="font-bold text-lg text-foreground">{documents.length}</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vector Embedded</p>
            <p className="font-bold text-lg text-foreground">100%</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Storage Used</p>
            <p className="font-bold text-lg text-foreground">412 MB</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search across all contracts, orders, and filings..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-input bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter folder:</span>
            <select className="text-xs border border-input rounded-lg px-2 py-1 bg-background">
              <option>All Folders</option>
              <option>Pleadings</option>
              <option>Evidence</option>
              <option>Orders</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Case Matter</th>
                <th className="py-3 px-4">Folder</th>
                <th className="py-3 px-4">Date Uploaded</th>
                <th className="py-3 px-4">AI Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs">{doc.title}</p>
                        <p className="text-[11px] text-muted-foreground">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <p className="font-medium text-foreground truncate max-w-xs">{doc.case?.title || 'General'}</p>
                    <p className="text-muted-foreground font-mono text-[10px]">{doc.case?.caseNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Folder className="w-3 h-3 text-amber-500" />
                      {doc.folder}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Analyzed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
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
