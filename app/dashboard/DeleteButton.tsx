'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ qrId }: { qrId: number }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/qr/${qrId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Error al eliminar el QR')
      }
    } catch {
      alert('Error de conexión')
    }
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ color: '#ff6b35', fontSize: '12px' }}>¿Seguro?</span>
        <button onClick={handleDelete} disabled={deleting} style={{ background: '#ff6b35', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
          {deleting ? '...' : 'Sí'}
        </button>
        <button onClick={() => setConfirming(false)} style={{ background: 'transparent', color: '#6a8a95', border: '1px solid #6a8a95', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
          No
        </button>
      </span>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} style={{ background: 'transparent', border: 'none', color: '#ff6b35', fontSize: '13px', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
      🗑️ Eliminar
    </button>
  )
}