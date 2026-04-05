import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QRnet.io — Identidad Digital para Objetos Físicos',
  description: 'Conecta cualquier objeto físico al mundo digital mediante un código QR.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}