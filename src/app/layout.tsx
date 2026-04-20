import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'QRnet.io — Identidad Digital para Objetos Físicos',
  description: 'Conecta cualquier objeto físico al mundo digital mediante un código QR. Vehículos, mascotas, bicicletas, empresas y más.',
  openGraph: {
    title: 'QRnet.io — Identidad Digital para Objetos Físicos',
    description: 'Crea un QR único para cualquier objeto. Contacto anónimo, privacidad total. Gratis.',
    url: 'https://qrnet.io',
    siteName: 'QRnet.io',
    images: [{ url: 'https://qrnet.io/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QRnet.io — Identidad Digital para Objetos Físicos',
    description: 'Crea un QR único para cualquier objeto. Contacto anónimo, privacidad total.',
    images: ['https://qrnet.io/og-image.png'],
  },
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
