import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  const name = req.nextUrl.searchParams.get('name') || 'qrcode.png'

  if (!url) {
    return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
  }

  const res = await fetch(url)
  const blob = await res.blob()
  const buffer = Buffer.from(await blob.arrayBuffer())

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  })
}