import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { FileText, Download, Search, Filter, Folder, Sparkles, Plus, HardDrive } from 'lucide-react'
import { getDocumentFilter, isClientUser } from '@/lib/rbac'
import { PageTransition, StaggerList, StaggerItem, RevealOnScroll } from '@/components/ui/motion'

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
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              {isClient ? 'My Case Documents' : 'Document Vault'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {isClient
                ? 'Pleadings, evidence bundles, notices, and court filings associated with your legal matters.'
                : 'Central repository for pleadings, evidence bundles, court orders, and contracts with OCR text extraction.'}
            </p>
          </div>
          <button className="btn-primary text-xs self-start sm:self-auto cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Upload Files
          </button>
        </div>

        {/* Storage Overview */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <div className="card-premium p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Indexed Documents</p>
                <p className="font-bold text-xl text-foreground font-mono mt-0.5">{documents.length}</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Vector Embedded</p>
                <p className="font-bold text-xl text-foreground font-mono mt-0.5">100%</p>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card-premium p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Storage Used</p>
                <p className="font-bold text-xl text-foreground font-mono mt-0.5">412 MB</p>
              </div>
            </div>
          </StaggerItem>
        </StaggerList>

        {/* Document List */}
        <RevealOnScroll>
          <div className="card-premium overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search across all contracts, orders, and filings..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-muted-foreground font-medium">Filter folder:</span>
                <select className="text-xs border border-input rounded-xl px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>All Folders</option>
                  <option>Pleadings</option>
                  <option>Evidence</option>
                  <option>Orders</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm min-w-[650px]">
                <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border font-semibold">
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
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                        No documents stored in the vault
                      </td>
                    </tr>
                  ) : (
                    documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              PDF
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-xs truncate max-w-xs">{doc.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs font-mono">{doc.fileName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <p className="font-medium text-foreground truncate max-w-[180px]">{doc.case?.title || 'General'}</p>
                          <p className="text-muted-foreground font-mono text-[10px]">{doc.case?.caseNumber}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Folder className="w-3.5 h-3.5 text-amber-500" />
                            {doc.folder}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Analyzed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PageTransition>
  )
}
