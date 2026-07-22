import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Web3Provider from './providers/Web3Provider';
import Landing from './pages/Landing';
import Console from './pages/Console';
import ApiDocs from './pages/ApiDocs';
import { useEffect, useRef } from 'react';

function Layout() {
  const location = useLocation();
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Cursor glow follower
    let mouseX = -500, mouseY = -500;
    let glowX = -500, glowY = -500;

    const onMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    document.addEventListener('mousemove', onMove);

    let rafId: number;
    function animate() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      if (glowRef.current) {
        glowRef.current.style.left = glowX + 'px';
        glowRef.current.style.top = glowY + 'px';
      }
      rafId = requestAnimationFrame(animate);
    }
    animate();

    // Grid canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const SPACING = 50;
    const RADIUS = 220;

    let gridRaf: number;
    function drawGrid() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let x = 0; x < canvas.width + SPACING; x += SPACING) {
        for (let y = 0; y < canvas.height + SPACING; y += SPACING) {
          const segments = [
            [x, y, x + 20, y],
            [x, y, x, y + 20],
            [x - 3, y, x + 3, y],
            [x, y - 3, x, y + 3],
          ];
          for (const [x1, y1, x2, y2] of segments) {
            const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
            const dist = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
            if (dist < RADIUS) {
              const alpha = (1 - dist / RADIUS) * 0.35;
              ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
              ctx.lineWidth = (Math.abs(x2 - x1) <= 6 && Math.abs(y2 - y1) <= 6) ? 1.5 : 0.6;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }
      }
      gridRaf = requestAnimationFrame(drawGrid);
    }
    drawGrid();

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(gridRaf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" />
      <canvas ref={canvasRef} className="grid-canvas" />
      <div className="dome-glow-wrapper"><div className="dome-arc" /><div className="dome-flare" /></div>

      <div className="page-wrapper">
        <header className="navbar">
          <div className="nav-inner">
            <Link to="/" className="nav-brand">
              <svg className="brand-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 1L3 6.5V14C3 20.35 7.56 26.25 14 28C20.44 26.25 25 20.35 25 14V6.5L14 1Z" fill="url(#ns)" stroke="#a78bfa" strokeWidth="1.2"/>
                <path d="M14 5.5L7.5 9V14C7.5 18 10.2 21.6 14 22.5C17.8 21.6 20.5 18 20.5 14V9L14 5.5Z" fill="#0c0f1a"/>
                <path d="M10.5 14L13 16.5L18 11.5" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs><linearGradient id="ns" x1="3" y1="1" x2="25" y2="28"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#4f46e5" stopOpacity="0.4"/></linearGradient></defs>
              </svg>
              <span>Custos</span>
            </Link>

            <nav className="nav-pills">
              <Link to="/" className={`nav-pill ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
              <Link to="/console" className={`nav-pill ${location.pathname === '/console' ? 'active' : ''}`}>Console</Link>
              <Link to="/api" className={`nav-pill ${location.pathname === '/api' ? 'active' : ''}`}>API</Link>
            </nav>

            <div className="nav-right">
              <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/console" element={<Console />} />
          <Route path="/api" element={<ApiDocs />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </Web3Provider>
  );
}
