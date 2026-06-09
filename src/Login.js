import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState('login')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    setCargando(true)
    setError('')
    setMensaje('')
    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contrasena incorrectos')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMensaje('Registro exitoso. Tu cuenta sera revisada y aprobada en breve.')
    }
    setCargando(false)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    fontSize: 14,
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  }

  const btnTab = (activo) => ({
    padding: 9,
    borderRadius: 8,
    border: activo ? '2px solid #C00000' : '2px solid rgba(0,0,0,0.1)',
    background: activo ? '#FCEBEB' : '#fff',
    color: activo ? '#C00000' : '#666',
    fontWeight: activo ? 600 : 400,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'sans-serif'
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F4F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        border: '0.5px solid rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60,
            background: '#C00000',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff'
          }}>C</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>COPEF Salta</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Sistema de gestion de matriculados
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setModo('login')} style={btnTab(modo === 'login')}>
            Ingresar
          </button>
          <button onClick={() => setModo('registro')} style={btnTab(modo === 'registro')}>
            Registrarse
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>
            Email
          </label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="tu@email.com"
            type="email"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 5 }}>
            Contrasena
          </label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="password"
            type="password"
          />
        </div>

        {error && (
          <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {mensaje && (
          <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            {mensaje}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={cargando}
          style={{ width: '100%', padding: 12, background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'sans-serif' }}
        >
          {cargando ? 'Cargando...' : modo === 'login' ? 'Ingresar' : 'Registrarse'}
        </button>

        <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 12 }}>o</div>

        <button
          onClick={loginGoogle}
          style={{ width: '100%', padding: 11, background: '#fff', color: '#333', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'sans-serif' }}
        >
          <span style={{ fontSize: 16 }}>G</span> Continuar con Google
        </button>
      </div>
    </div>
  )
}