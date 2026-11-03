import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiInspectDocumentAgreement, DocumentInspectionResult } from '@/lib/ai/service'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''
    let fileName = 'Uploaded_Document'
    let fileType = 'application/pdf'
    let fileBase64 = ''
    let extractedText = ''
    let userRole = (session.user.role === 'CLIENT' ? 'CLIENT' : 'LAWYER') as 'CLIENT' | 'LAWYER' | 'BOTH'

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const roleParam = formData.get('role') as string | null
      const textParam = formData.get('extractedText') as string | null

      if (roleParam) userRole = roleParam as any
      if (textParam) extractedText = textParam

      if (file) {
        fileName = file.name
        fileType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png')
        const arrayBuffer = await file.arrayBuffer()
        fileBase64 = Buffer.from(arrayBuffer).toString('base64')
      }
    } else {
      const body = await req.json().catch(() => ({}))
      fileName = body.fileName || fileName
      fileType = body.fileType || fileType
      fileBase64 = body.fileBase64 || ''
      extractedText = body.extractedText || ''
      if (body.role) userRole = body.role
    }

    if (!fileBase64 && !extractedText) {
      return NextResponse.json(
        { error: 'Please upload an agreement document (PDF/Image) or provide document text' },
        { status: 400 }
      )
    }

    const result: DocumentInspectionResult = await aiInspectDocumentAgreement({
      fileBase64,
      fileName,
      fileType,
      extractedText,
      userRole,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error inspecting agreement document:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to inspect agreement document' },
      { status: 500 }
    )
  }
}

