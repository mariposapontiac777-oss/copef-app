import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const fmt = (n) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0
}).format(n);

const COPEF_CBU = "0720144920000012345678";
const COPEF_ALIAS = "COPEF.SALTA.PAGO";

// ── BOLETA ──────────────────────────────────────────────────
function Boleta({ mat, onClose }) {
  const deuda = mat.cuota_mensual * mat.meses_deuda;
  const recargo = Math.round(deuda * 0.05);
  const total = deuda + recargo;
  const [medio, setMedio] = useState("transferencia");
  const [copiado, setCopiado] = useState("");
  const [enviado, setEnviado] = useState(false);

  const copiar = (texto, tipo) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(tipo);
      setTimeout(() => setCopiado(""), 2000);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ background: '#C00000', padding: '18px 22px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginBottom: 2 }}>BOLETA DIGITAL · COPEF SALTA</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{mat.apellido}, {mat.nombre}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{mat.matricula} · {mat.localidad}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13 }}>✕</button>
        </div>

        <div style={{ padding: 18 }}>
          {/* Detalle deuda */}
          <div style={{ background: '#F5F4F2', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#333' }}>Detalle de deuda</div>
            {[
              ['Cuota mensual vigente', fmt(mat.cuota_mensual)],
              ['Meses adeudados', `${mat.meses_deuda} meses`],
              ['Subtotal', fmt(deuda)],
              ['Recargo por mora (5%)', fmt(recargo)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
                <span style={{ color: '#666' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>TOTAL A PAGAR</span>
              <span style={{ fontWeight: 700, fontSize: 20, color: '#C00000' }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Planes de pago */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#333' }}>Plan de pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[1, 3, 6, 12].map(c => (
                <div key={c} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#666' }}>{c === 1 ? 'Pago total' : `${c} cuotas`}</div>
                  <div style={{ fontWeight: 700, color: '#C00000', fontSize: 15 }}>{fmt(Math.round(total / c))}</div>
                  {c > 1 && <div style={{ fontSize: 10, color: '#888' }}>por mes</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Medio de pago */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#333' }}>Medio de pago</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {['transferencia', 'mercadopago'].map(m => (
                <button key={m} onClick={() => setMedio(m)} style={{
                  padding: '9px', borderRadius: 8, border: `2px solid ${medio === m ? '#C00000' : 'rgba(0,0,0,0.1)'}`,
                  background: medio === m ? '#FCEBEB' : '#fff', color: medio === m ? '#C00000' : '#666',
                  fontWeight: medio === m ? 600 : 400, fontSize: 13, cursor: 'pointer'
                }}>
                  {m === 'transferencia' ? '🏦 Transferencia' : '💳 MercadoPago'}
                </button>
              ))}
            </div>

            {medio === 'transferencia' && (
              <div style={{ background: '#F5F4F2', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#666', fontWeight: 600, marginBottom: 8 }}>DATOS PARA TRANSFERENCIA</div>
                {[['CBU', COPEF_CBU, 'cbu'], ['Alias', COPEF_ALIAS, 'alias']].map(([label, val, tipo]) => (
                  <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <code style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>{val}</code>
                      <button onClick={() => copiar(val, tipo)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>
                        {copiado === tipo ? '✓' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ background: '#FAEEDA', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#854F0B', marginTop: 8 }}>
                  ⚠️ Después de transferir, subí el comprobante en el sistema.
                </div>
              </div>
            )}

            {medio === 'mercadopago' && (
              <div style={{ background: '#E6F4FF', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ background: '#009EE3', color: '#fff', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 6 }}>
                  💳 Pagar {fmt(total)} con MercadoPago
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>El pago se acredita automáticamente</div>
              </div>
            )}
          </div>

          {/* Botones envío */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => { setEnviado(true); setTimeout(() => { setEnviado(false); onClose(); }, 1500); }}
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {enviado ? '✓ Enviado' : '📱 WhatsApp'}
            </button>
            <button onClick={() => { setEnviado(true); setTimeout(() => { setEnviado(false); onClose(); }, 1500); }}
              style={{ background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {enviado ? '✓ Enviado' : '✉️ Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ────────────────────────────────────────────
export default function App() {
  const [matriculados, setMatriculados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [boletaActiva, setBoletaActiva] = useState(null);
  const [campana, setCampana] = useState(false);

  useEffect(() => { cargarMatriculados(); }, []);

  async function cargarMatriculados() {
    const { data, error } = await supabase
      .from('matriculados').select('*').order('apellido');
    if (error) console.log(error);
    else setMatriculados(data);
    setCargando(false);
  }

  const filtrados = matriculados.filter(m => {
    const q = busqueda.toLowerCase();
    const matchQ = m.nombre.toLowerCase().includes(q) ||
      m.apellido.toLowerCase().includes(q) || m.matricula.includes(q);
    const matchF = filtro === 'todos' ? true : filtro === 'morosos' ? m.meses_deuda > 0 : m.meses_deuda === 0;
    return matchQ && matchF;
  });

  const totalDeuda = matriculados.reduce((a, m) => a + m.cuota_mensual * m.meses_deuda, 0);
  const morosos = matriculados.filter(m => m.meses_deuda > 0).length;
  const alDia = matriculados.filter(m => m.meses_deuda === 0).length;

  if (cargando) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Cargando...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#F5F4F2', minHeight: '100vh' }}>
      {boletaActiva && <Boleta mat={boletaActiva} onClose={() => setBoletaActiva(null)} />}

      {/* Topbar */}
      <div style={{ background: '#C00000', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Sistema COPEF Salta</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Módulo de Pagos</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            ['MATRICULADOS', matriculados.length, '#333'],
            ['MOROSOS', morosos, '#C00000'],
            ['AL DÍA', alDia, '#3B6D11'],
            ['DEUDA TOTAL', fmt(totalDeuda), '#C00000'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: '#fff', borderRadius: 10, padding: 14, border: '0.5px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: label === 'DEUDA TOTAL' ? 13 : 22, fontWeight: 600, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Campaña */}
        <div style={{ background: campana ? '#EAF3DE' : '#FFF8F0', border: `1px solid ${campana ? '#3B6D11' : '#F0C080'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{campana ? '✓ Boletas enviadas a todos los morosos' : '📣 Campaña masiva de recupero'}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{campana ? 'Boletas digitales enviadas por WhatsApp y email' : `Enviar boleta a los ${morosos} morosos de la lista`}</div>
          </div>
          <button onClick={() => { setCampana(true); setTimeout(() => setCampana(false), 3000); }}
            style={{ background: campana ? '#3B6D11' : '#C00000', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}>
            {campana ? '✓ Enviado' : 'Enviar a todos'}
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontSize: 13 }}
            placeholder="Buscar por nombre o matrícula..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <select style={{ padding: '9px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, fontSize: 13, background: '#fff' }}
            value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="morosos">Morosos</option>
            <option value="al_dia">Al día</option>
          </select>
        </div>

        {/* Lista */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {filtrados.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>No se encontraron resultados</div>
          )}
          {filtrados.map((m, i) => (
            <div key={m.id} style={{ padding: '12px 16px', borderBottom: i < filtrados.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: m.meses_deuda > 0 ? '#FCEBEB' : '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: m.meses_deuda > 0 ? '#A32D2D' : '#3B6D11' }}>
                {m.nombre[0]}{m.apellido[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{m.apellido}, {m.nombre}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{m.matricula} · {m.localidad}</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                {m.meses_deuda > 0 ? (
                  <>
                    <div style={{ fontWeight: 600, color: '#C00000', fontSize: 14 }}>{fmt(m.cuota_mensual * m.meses_deuda)}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{m.meses_deuda} meses</div>
                  </>
                ) : (
                  <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}>Al día</span>
                )}
              </div>
              <button onClick={() => setBoletaActiva(m)}
                style={{ background: '#C00000', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                Boleta
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}