export default function VerifyEmailPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020608' }}>
      <div style={{ background: '#0d1a20', padding: '40px', borderRadius: '16px', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
        <h1 style={{ color: '#f0f8ff', fontFamily: 'sans-serif', fontSize: '24px', marginBottom: '16px' }}>
          Revisa tu email
        </h1>
        <p style={{ color: '#6a8a95', fontSize: '15px', lineHeight: '1.6' }}>
          Te hemos enviado un email con un código de verificación. Revisa tu bandeja de entrada y también la carpeta de spam.
        </p>
      </div>
    </main>
  )
}