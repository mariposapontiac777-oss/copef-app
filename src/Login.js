import { useState } from 'react'
import { supabase } from './supabase'
import { Turnstile } from '@marsidev/react-turnstile'
const PROVINCIAS = [
  'Salta', 'Buenos Aires', 'Cordoba', 'Santa Fe', 'Mendoza',
  'Tucuman', 'Entre Rios', 'Chaco', 'Corrientes', 'Misiones',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Rio Negro',
  'Neuquen', 'Formosa', 'Chubut', 'San Luis', 'Catamarca',
  'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego'
]

const LOCALIDADES_SALTA = [
  'Salta Capital', 'Oran', 'Tartagal', 'General Guemes',
  'Rosario de la Frontera', 'Metan', 'Joaquin V. Gonzalez',
  'Embarcacion', 'Cafayate', 'Cachi', 'Iruya', 'Rivadavia', 'Otro'
]

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid rgba(0,0,0,0.1)',
  borderRadius: 8,
  fontSize: 13,
  boxSizing: 'border-box',
  fontFamily: 'sans-serif',
  outline: 'none'
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: '#333',
  display: 'block',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
}

const dniToEmail = (dni) => dni + '@copef.com.ar'

export default function Login() {
  const [modo, setModo] = useState('login')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ dni: '', password: '' })
  const [captchaToken, setCaptchaToken] = useState('');
  const [regData, setRegData] = useState({
    nombre: '', apellido: '', dni: '', matricula: '',
    email: '', password: '', password2: '',
    domicilio: '', localidad: 'Salta Capital', provincia: 'Salta'
  })

  async function handleLogin() {
    setCargando(true)
    setError('')
    if (!captchaToken) {
  setError('Por favor completá la verificación de seguridad')
  setCargando(false)
  return
}
if (!captchaToken) {
  setError('Por favor completá la verificación de seguridad')
  setCargando(false)
  return
}
    if (!loginData.dni || !loginData.password) {
      setError('Ingresa tu DNI y contrasena')
      setCargando(false)
      return
    }
    const email = dniToEmail(loginData.dni.trim())
    const { error } = await supabase.auth.signInWithPassword({
      email, password: loginData.password
    })
    if (error) setError('DNI o contrasena incorrectos')
    setCargando(false)
  }

  async function handleRegistro() {
    setError('')
    if (!captchaToken) {
  setError('Por favor completá la verificación de seguridad')
  return
}
    if (!regData.nombre || !regData.apellido || !regData.dni || !regData.matricula || !regData.password) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }
    if (regData.password !== regData.password2) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (regData.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)

    const emailInterno = dniToEmail(regData.dni.trim())

    const { error: authError } = await supabase.auth.signUp({
      email: emailInterno,
      password: regData.password
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Ya existe una cuenta con ese DNI')
      } else {
        setError(authError.message)
      }
      setCargando(false)
      return
    }

    const { error: dbError } = await supabase
      .from('solicitudes_registro')
      .insert({
        nombre: regData.nombre,
        apellido: regData.apellido,
        dni: regData.dni,
        matricula: regData.matricula,
        email: regData.email || emailInterno,
        domicilio: regData.domicilio,
        localidad: regData.localidad,
        provincia: regData.provincia,
        estado: 'pendiente'
      })

    if (dbError) {
      setError('Error al guardar los datos. Intenta de nuevo.')
      setCargando(false)
      return
    }

    setMensaje('Solicitud enviada correctamente. Tu cuenta sera revisada y aprobada en breve.')
    setCargando(false)
  }

  const updateReg = (field, value) => setRegData(prev => ({ ...prev, [field]: value }))

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4F2', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, border: '0.5px solid rgba(0,0,0,0.08)', marginTop: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, background: '#C00000', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 22, fontWeight: 700, color: '#fff' }}>C</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>COPEF Salta</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>Sistema de gestion de matriculados</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button onClick={() => { setModo('login'); setError(''); setMensaje(''); }}
            style={{ padding: 9, borderRadius: 8, border: '2px solid ' + (modo === 'login' ? '#C00000' : 'rgba(0,0,0,0.1)'), background: modo === 'login' ? '#FCEBEB' : '#fff', color: modo === 'login' ? '#C00000' : '#666', fontWeight: modo === 'login' ? 600 : 400, cursor: 'pointer', fontSize: 13 }}>
            Ingresar
          </button>
          <button onClick={() => { setModo('registro'); setError(''); setMensaje(''); }}
            style={{ padding: 9, borderRadius: 8, border: '2px solid ' + (modo === 'registro' ? '#C00000' : 'rgba(0,0,0,0.1)'), background: modo === 'registro' ? '#FCEBEB' : '#fff', color: modo === 'registro' ? '#C00000' : '#666', fontWeight: modo === 'registro' ? 600 : 400, cursor: 'pointer', fontSize: 13 }}>
            Registrarse
          </button>
        </div>

        {modo === 'login' && (
          <>
            <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#185FA5', marginBottom: 14 }}>
              Ingresa con tu numero de DNI y tu contrasena
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Numero de DNI</label>
              <input value={loginData.dni} onChange={e => setLoginData(p => ({ ...p, dni: e.target.value }))}
                style={inputStyle} placeholder="12345678" type="number" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Contrasena</label>
              <input value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                style={inputStyle} placeholder="contrasena" type="password"
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <Turnstile
  siteKey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setCaptchaToken(token)}
  onExpire={() => setCaptchaToken('')}
  options={{ theme: 'light', language: 'es' }}
/>
            {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button onClick={handleLogin} disabled={cargando}
              style={{ width: '100%', padding: 12, background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {cargando ? 'Cargando...' : 'Ingresar'}
            </button>
          </>
        )}

        {modo === 'registro' && !mensaje && (
          <>
            <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#185FA5', marginBottom: 14 }}>
              Completa todos los datos. Tu DNI sera tu usuario para ingresar al sistema.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input value={regData.nombre} onChange={e => updateReg('nombre', e.target.value)} style={inputStyle} placeholder="Juan" />
              </div>
              <div>
                <label style={labelStyle}>Apellido *</label>
                <input value={regData.apellido} onChange={e => updateReg('apellido', e.target.value)} style={inputStyle} placeholder="Perez" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>DNI * (sera tu usuario)</label>
                <input value={regData.dni} onChange={e => updateReg('dni', e.target.value)} style={inputStyle} placeholder="12345678" type="number" />
              </div>
              <div>
                <label style={labelStyle}>N de Matricula *</label>
                <input value={regData.matricula} onChange={e => updateReg('matricula', e.target.value)} style={inputStyle} placeholder="MAT-0001" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Email de contacto (opcional)</label>
              <input value={regData.email} onChange={e => updateReg('email', e.target.value)} style={inputStyle} placeholder="tu@email.com" type="email" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>Contrasena *</label>
                <input value={regData.password} onChange={e => updateReg('password', e.target.value)} style={inputStyle} placeholder="Min 6 caracteres" type="password" />
              </div>
              <div>
                <label style={labelStyle}>Repetir *</label>
                <input value={regData.password2} onChange={e => updateReg('password2', e.target.value)} style={inputStyle} placeholder="Repetir" type="password" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Domicilio</label>
              <input value={regData.domicilio} onChange={e => updateReg('domicilio', e.target.value)} style={inputStyle} placeholder="Av. San Martin 123" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Localidad</label>
                <select value={regData.localidad} onChange={e => updateReg('localidad', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                  {LOCALIDADES_SALTA.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Provincia</label>
                <select value={regData.provincia} onChange={e => updateReg('provincia', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                  {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <Turnstile
  siteKey={process.env.REACT_APP_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setCaptchaToken(token)}
  onExpire={() => setCaptchaToken('')}
  options={{ theme: 'light', language: 'es' }}
/>
            {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <button onClick={handleRegistro} disabled={cargando}
              style={{ width: '100%', padding: 12, background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {cargando ? 'Enviando...' : 'Enviar solicitud de registro'}
            </button>
          </>
        )}

        {mensaje && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>ok</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, color: '#3B6D11' }}>Solicitud enviada</div>
            <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{mensaje}</div>
            <button onClick={() => { setModo('login'); setMensaje(''); }}
              style={{ background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Ir al login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
