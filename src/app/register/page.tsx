'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COUNTRIES = [
  { code: 'AF', name: 'Afganistán', prefix: '+93' },
  { code: 'AL', name: 'Albania', prefix: '+355' },
  { code: 'DE', name: 'Alemania', prefix: '+49' },
  { code: 'AD', name: 'Andorra', prefix: '+376' },
  { code: 'AO', name: 'Angola', prefix: '+244' },
  { code: 'AG', name: 'Antigua y Barbuda', prefix: '+1' },
  { code: 'SA', name: 'Arabia Saudita', prefix: '+966' },
  { code: 'DZ', name: 'Argelia', prefix: '+213' },
  { code: 'AR', name: 'Argentina', prefix: '+54' },
  { code: 'AM', name: 'Armenia', prefix: '+374' },
  { code: 'AU', name: 'Australia', prefix: '+61' },
  { code: 'AT', name: 'Austria', prefix: '+43' },
  { code: 'AZ', name: 'Azerbaiyán', prefix: '+994' },
  { code: 'BS', name: 'Bahamas', prefix: '+1' },
  { code: 'BH', name: 'Baréin', prefix: '+973' },
  { code: 'BD', name: 'Bangladés', prefix: '+880' },
  { code: 'BB', name: 'Barbados', prefix: '+1' },
  { code: 'BE', name: 'Bélgica', prefix: '+32' },
  { code: 'BZ', name: 'Belice', prefix: '+501' },
  { code: 'BJ', name: 'Benín', prefix: '+229' },
  { code: 'BY', name: 'Bielorrusia', prefix: '+375' },
  { code: 'BO', name: 'Bolivia', prefix: '+591' },
  { code: 'BA', name: 'Bosnia y Herzegovina', prefix: '+387' },
  { code: 'BW', name: 'Botsuana', prefix: '+267' },
  { code: 'BR', name: 'Brasil', prefix: '+55' },
  { code: 'BN', name: 'Brunéi', prefix: '+673' },
  { code: 'BG', name: 'Bulgaria', prefix: '+359' },
  { code: 'BF', name: 'Burkina Faso', prefix: '+226' },
  { code: 'BI', name: 'Burundi', prefix: '+257' },
  { code: 'BT', name: 'Bután', prefix: '+975' },
  { code: 'CV', name: 'Cabo Verde', prefix: '+238' },
  { code: 'KH', name: 'Camboya', prefix: '+855' },
  { code: 'CM', name: 'Camerún', prefix: '+237' },
  { code: 'CA', name: 'Canadá', prefix: '+1' },
  { code: 'QA', name: 'Catar', prefix: '+974' },
  { code: 'TD', name: 'Chad', prefix: '+235' },
  { code: 'CL', name: 'Chile', prefix: '+56' },
  { code: 'CN', name: 'China', prefix: '+86' },
  { code: 'CY', name: 'Chipre', prefix: '+357' },
  { code: 'CO', name: 'Colombia', prefix: '+57' },
  { code: 'KM', name: 'Comoras', prefix: '+269' },
  { code: 'CG', name: 'Congo', prefix: '+242' },
  { code: 'CD', name: 'Congo (RDC)', prefix: '+243' },
  { code: 'KP', name: 'Corea del Norte', prefix: '+850' },
  { code: 'KR', name: 'Corea del Sur', prefix: '+82' },
  { code: 'CI', name: 'Costa de Marfil', prefix: '+225' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506' },
  { code: 'HR', name: 'Croacia', prefix: '+385' },
  { code: 'CU', name: 'Cuba', prefix: '+53' },
  { code: 'DK', name: 'Dinamarca', prefix: '+45' },
  { code: 'DJ', name: 'Yibuti', prefix: '+253' },
  { code: 'DM', name: 'Dominica', prefix: '+1' },
  { code: 'DO', name: 'Rep. Dominicana', prefix: '+1' },
  { code: 'EC', name: 'Ecuador', prefix: '+593' },
  { code: 'EG', name: 'Egipto', prefix: '+20' },
  { code: 'SV', name: 'El Salvador', prefix: '+503' },
  { code: 'AE', name: 'Emiratos Árabes', prefix: '+971' },
  { code: 'ER', name: 'Eritrea', prefix: '+291' },
  { code: 'SK', name: 'Eslovaquia', prefix: '+421' },
  { code: 'SI', name: 'Eslovenia', prefix: '+386' },
  { code: 'ES', name: 'España', prefix: '+34' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1' },
  { code: 'EE', name: 'Estonia', prefix: '+372' },
  { code: 'ET', name: 'Etiopía', prefix: '+251' },
  { code: 'PH', name: 'Filipinas', prefix: '+63' },
  { code: 'FI', name: 'Finlandia', prefix: '+358' },
  { code: 'FJ', name: 'Fiyi', prefix: '+679' },
  { code: 'FR', name: 'Francia', prefix: '+33' },
  { code: 'GA', name: 'Gabón', prefix: '+241' },
  { code: 'GM', name: 'Gambia', prefix: '+220' },
  { code: 'GE', name: 'Georgia', prefix: '+995' },
  { code: 'GH', name: 'Ghana', prefix: '+233' },
  { code: 'GD', name: 'Granada', prefix: '+1' },
  { code: 'GR', name: 'Grecia', prefix: '+30' },
  { code: 'GT', name: 'Guatemala', prefix: '+502' },
  { code: 'GN', name: 'Guinea', prefix: '+224' },
  { code: 'GW', name: 'Guinea-Bisáu', prefix: '+245' },
  { code: 'GQ', name: 'Guinea Ecuatorial', prefix: '+240' },
  { code: 'GY', name: 'Guyana', prefix: '+592' },
  { code: 'HT', name: 'Haití', prefix: '+509' },
  { code: 'HN', name: 'Honduras', prefix: '+504' },
  { code: 'HU', name: 'Hungría', prefix: '+36' },
  { code: 'IN', name: 'India', prefix: '+91' },
  { code: 'ID', name: 'Indonesia', prefix: '+62' },
  { code: 'IQ', name: 'Irak', prefix: '+964' },
  { code: 'IR', name: 'Irán', prefix: '+98' },
  { code: 'IE', name: 'Irlanda', prefix: '+353' },
  { code: 'IS', name: 'Islandia', prefix: '+354' },
  { code: 'IL', name: 'Israel', prefix: '+972' },
  { code: 'IT', name: 'Italia', prefix: '+39' },
  { code: 'JM', name: 'Jamaica', prefix: '+1' },
  { code: 'JP', name: 'Japón', prefix: '+81' },
  { code: 'JO', name: 'Jordania', prefix: '+962' },
  { code: 'KZ', name: 'Kazajistán', prefix: '+7' },
  { code: 'KE', name: 'Kenia', prefix: '+254' },
  { code: 'KG', name: 'Kirguistán', prefix: '+996' },
  { code: 'KI', name: 'Kiribati', prefix: '+686' },
  { code: 'KW', name: 'Kuwait', prefix: '+965' },
  { code: 'LA', name: 'Laos', prefix: '+856' },
  { code: 'LS', name: 'Lesoto', prefix: '+266' },
  { code: 'LV', name: 'Letonia', prefix: '+371' },
  { code: 'LB', name: 'Líbano', prefix: '+961' },
  { code: 'LR', name: 'Liberia', prefix: '+231' },
  { code: 'LY', name: 'Libia', prefix: '+218' },
  { code: 'LI', name: 'Liechtenstein', prefix: '+423' },
  { code: 'LT', name: 'Lituania', prefix: '+370' },
  { code: 'LU', name: 'Luxemburgo', prefix: '+352' },
  { code: 'MK', name: 'Macedonia del Norte', prefix: '+389' },
  { code: 'MG', name: 'Madagascar', prefix: '+261' },
  { code: 'MY', name: 'Malasia', prefix: '+60' },
  { code: 'MW', name: 'Malaui', prefix: '+265' },
  { code: 'MV', name: 'Maldivas', prefix: '+960' },
  { code: 'ML', name: 'Malí', prefix: '+223' },
  { code: 'MT', name: 'Malta', prefix: '+356' },
  { code: 'MA', name: 'Marruecos', prefix: '+212' },
  { code: 'MU', name: 'Mauricio', prefix: '+230' },
  { code: 'MR', name: 'Mauritania', prefix: '+222' },
  { code: 'MX', name: 'México', prefix: '+52' },
  { code: 'FM', name: 'Micronesia', prefix: '+691' },
  { code: 'MD', name: 'Moldavia', prefix: '+373' },
  { code: 'MC', name: 'Mónaco', prefix: '+377' },
  { code: 'MN', name: 'Mongolia', prefix: '+976' },
  { code: 'ME', name: 'Montenegro', prefix: '+382' },
  { code: 'MZ', name: 'Mozambique', prefix: '+258' },
  { code: 'MM', name: 'Myanmar', prefix: '+95' },
  { code: 'NA', name: 'Namibia', prefix: '+264' },
  { code: 'NR', name: 'Nauru', prefix: '+674' },
  { code: 'NP', name: 'Nepal', prefix: '+977' },
  { code: 'NI', name: 'Nicaragua', prefix: '+505' },
  { code: 'NE', name: 'Níger', prefix: '+227' },
  { code: 'NG', name: 'Nigeria', prefix: '+234' },
  { code: 'NO', name: 'Noruega', prefix: '+47' },
  { code: 'NZ', name: 'Nueva Zelanda', prefix: '+64' },
  { code: 'OM', name: 'Omán', prefix: '+968' },
  { code: 'NL', name: 'Países Bajos', prefix: '+31' },
  { code: 'PK', name: 'Pakistán', prefix: '+92' },
  { code: 'PW', name: 'Palaos', prefix: '+680' },
  { code: 'PA', name: 'Panamá', prefix: '+507' },
  { code: 'PG', name: 'Papúa Nueva Guinea', prefix: '+675' },
  { code: 'PY', name: 'Paraguay', prefix: '+595' },
  { code: 'PE', name: 'Perú', prefix: '+51' },
  { code: 'PL', name: 'Polonia', prefix: '+48' },
  { code: 'PT', name: 'Portugal', prefix: '+351' },
  { code: 'PR', name: 'Puerto Rico', prefix: '+1' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44' },
  { code: 'CF', name: 'Rep. Centroafricana', prefix: '+236' },
  { code: 'CZ', name: 'Rep. Checa', prefix: '+420' },
  { code: 'RO', name: 'Rumanía', prefix: '+40' },
  { code: 'RW', name: 'Ruanda', prefix: '+250' },
  { code: 'RU', name: 'Rusia', prefix: '+7' },
  { code: 'WS', name: 'Samoa', prefix: '+685' },
  { code: 'KN', name: 'San Cristóbal y Nieves', prefix: '+1' },
  { code: 'SM', name: 'San Marino', prefix: '+378' },
  { code: 'VC', name: 'San Vicente y Granadinas', prefix: '+1' },
  { code: 'LC', name: 'Santa Lucía', prefix: '+1' },
  { code: 'ST', name: 'Santo Tomé y Príncipe', prefix: '+239' },
  { code: 'SN', name: 'Senegal', prefix: '+221' },
  { code: 'RS', name: 'Serbia', prefix: '+381' },
  { code: 'SC', name: 'Seychelles', prefix: '+248' },
  { code: 'SL', name: 'Sierra Leona', prefix: '+232' },
  { code: 'SG', name: 'Singapur', prefix: '+65' },
  { code: 'SY', name: 'Siria', prefix: '+963' },
  { code: 'SO', name: 'Somalia', prefix: '+252' },
  { code: 'LK', name: 'Sri Lanka', prefix: '+94' },
  { code: 'SZ', name: 'Suazilandia', prefix: '+268' },
  { code: 'ZA', name: 'Sudáfrica', prefix: '+27' },
  { code: 'SD', name: 'Sudán', prefix: '+249' },
  { code: 'SS', name: 'Sudán del Sur', prefix: '+211' },
  { code: 'SE', name: 'Suecia', prefix: '+46' },
  { code: 'CH', name: 'Suiza', prefix: '+41' },
  { code: 'SR', name: 'Surinam', prefix: '+597' },
  { code: 'TH', name: 'Tailandia', prefix: '+66' },
  { code: 'TZ', name: 'Tanzania', prefix: '+255' },
  { code: 'TJ', name: 'Tayikistán', prefix: '+992' },
  { code: 'TL', name: 'Timor Oriental', prefix: '+670' },
  { code: 'TG', name: 'Togo', prefix: '+228' },
  { code: 'TO', name: 'Tonga', prefix: '+676' },
  { code: 'TT', name: 'Trinidad y Tobago', prefix: '+1' },
  { code: 'TN', name: 'Túnez', prefix: '+216' },
  { code: 'TM', name: 'Turkmenistán', prefix: '+993' },
  { code: 'TR', name: 'Turquía', prefix: '+90' },
  { code: 'TV', name: 'Tuvalu', prefix: '+688' },
  { code: 'UA', name: 'Ucrania', prefix: '+380' },
  { code: 'UG', name: 'Uganda', prefix: '+256' },
  { code: 'UY', name: 'Uruguay', prefix: '+598' },
  { code: 'UZ', name: 'Uzbekistán', prefix: '+998' },
  { code: 'VU', name: 'Vanuatu', prefix: '+678' },
  { code: 'VA', name: 'Vaticano', prefix: '+39' },
  { code: 'VE', name: 'Venezuela', prefix: '+58' },
  { code: 'VN', name: 'Vietnam', prefix: '+84' },
  { code: 'YE', name: 'Yemen', prefix: '+967' },
  { code: 'ZM', name: 'Zambia', prefix: '+260' },
  { code: 'ZW', name: 'Zimbabue', prefix: '+263' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const country = COUNTRIES.find(c => c.code === e.target.value)
    if (country) setSelectedCountry(country)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        company: form.get('company'),
        country: selectedCountry.code,
        phone_prefix: selectedCountry.prefix,
        phone: form.get('phone'),
      })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }
    router.push('/verify-email')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020608' }}>
      <form onSubmit={handleSubmit} style={{ background: '#0d1a20', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ color: '#f0f8ff', fontFamily: 'sans-serif', fontSize: '24px', marginBottom: '8px' }}>Crear cuenta</h1>
        {error && <p style={{ color: '#ff6b35', fontSize: '14px' }}>{error}</p>}
        <input name="name" type="text" placeholder="Nombre completo *" required style={inputStyle} />
        <input name="email" type="email" placeholder="Email *" required style={inputStyle} />
        <input name="password" type="password" placeholder="Contraseña *" required minLength={8} style={inputStyle} />
        <input name="company" type="text" placeholder="Empresa (opcional)" style={inputStyle} />
        <select onChange={handleCountryChange} style={inputStyle}>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ ...inputStyle, width: '90px', textAlign: 'center', cursor: 'default', color: '#00c8ff' }}>
            {selectedCountry.prefix}
          </div>
          <input name="phone" type="tel" placeholder="Teléfono (opcional)" style={{ ...inputStyle, flex: 1 }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#00c8ff', color: '#000', border: 'none', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
        </button>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#111e25',
  border: '1px solid rgba(0,200,255,.1)',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#f0f8ff',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}