const fs = require('fs');
const files = [
  'src/app/dashboard/crear/vehiculo/page.tsx',
  'src/app/dashboard/crear/bicicleta/page.tsx',
  'src/app/dashboard/crear/mascota/page.tsx',
  'src/app/dashboard/crear/objeto/page.tsx',
  'src/app/dashboard/crear/empresa/page.tsx',
  'src/app/dashboard/crear/personal/page.tsx',
  'src/app/dashboard/crear/cola/page.tsx',
];

const selector = `
        <div className="form-section">
          <div className="form-section-title">Preferencia de notificación</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            ¿Cómo quieres recibir los avisos cuando alguien escanee tu QR?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { val: 'email', emoji: '✉️', label: 'Email' },
              { val: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
              { val: 'ambos', emoji: '📲', label: 'Ambos' },
            ].map(n => (
              <button key={n.val} type="button" onClick={() => set('notificacion', n.val)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  border: form.notificacion === n.val ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.notificacion === n.val ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.notificacion === n.val ? 'var(--cyan)' : 'var(--muted)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, textAlign: 'center',
                }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{n.emoji}</span>
                {n.label}
              </button>
            ))}
          </div>
        </div>

`;

files.forEach(f => {
  try {
    let c = fs.readFileSync(f, 'utf8');
    if (c.indexOf('Preferencia de notificación') === -1) {
      // Insert before Observaciones section
      const target = '        <div className="form-section">\n          <div className="form-section-title">Observaciones (opcional)';
      if (c.indexOf(target) !== -1) {
        c = c.replace(target, selector + '        <div className="form-section">\n          <div className="form-section-title">Observaciones (opcional)');
        fs.writeFileSync(f, c);
        console.log('OK', f);
      } else {
        // Try alternate format
        const target2 = '        <div className="form-section">\n          <div className="form-section-title">Observaciones (opcional)';
        console.log('NO_MATCH', f);
      }
    } else {
      console.log('SKIP', f);
    }
  } catch (e) {
    console.log('ERR', f, e.message);
  }
});
