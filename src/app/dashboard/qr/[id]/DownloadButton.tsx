'use client'

export default function DownloadButton({ url, filename }: { url: string; filename: string }) {
  const handleDownload = () => {
    const downloadUrl = `/api/qr/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.click()
  }

  return (
    <button onClick={handleDownload} style={{ background: 'linear-gradient(135deg,#00c8ff,#00e5c0)', color: '#000', padding: '12px 28px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
      ⬇ Descargar PNG
    </button>
  )
}