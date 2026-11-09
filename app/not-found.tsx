export default function NotFound() {
  return (
    <div style={{ background: '#0d0d10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 64, fontWeight: 800, margin: '0 0 8px', color: '#f59e0b' }}>404</h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>Page not found</p>
        <a href="/" style={{ display: 'inline-block', background: '#f59e0b', color: '#000', padding: '10px 24px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Go home</a>
      </div>
    </div>
  )
}
