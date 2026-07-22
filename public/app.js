document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════
     1. CURSOR GLOW FOLLOWER
     ═══════════════════════════════════════════════════ */
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = -500, mouseY = -500;
  let glowX = -500, glowY = -500;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  /* ═══════════════════════════════════════════════════
     2. INTERACTIVE GRID CANVAS (Reveal near cursor)
     ═══════════════════════════════════════════════════ */
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  let cW, cH;

  function resizeCanvas() {
    cW = canvas.width  = window.innerWidth;
    cH = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const GRID_SPACING = 50;
  const REVEAL_RADIUS = 220;
  const LINE_SEGMENTS = [];

  // Pre-compute grid line segments (horizontal + vertical short dashes)
  function buildGrid() {
    LINE_SEGMENTS.length = 0;
    for (let x = 0; x < cW + GRID_SPACING; x += GRID_SPACING) {
      for (let y = 0; y < cH + GRID_SPACING; y += GRID_SPACING) {
        // Horizontal dash
        LINE_SEGMENTS.push({ x1: x, y1: y, x2: x + 20, y2: y });
        // Vertical dash
        LINE_SEGMENTS.push({ x1: x, y1: y, x2: x, y2: y + 20 });
        // Small cross node
        LINE_SEGMENTS.push({ x1: x - 3, y1: y, x2: x + 3, y2: y });
        LINE_SEGMENTS.push({ x1: x, y1: y - 3, x2: x, y2: y + 3 });
      }
    }
  }
  buildGrid();
  window.addEventListener('resize', buildGrid);

  function drawGrid() {
    ctx.clearRect(0, 0, cW, cH);

    const scrollY = window.scrollY;
    const mxPage = mouseX;
    const myPage = mouseY;

    for (const seg of LINE_SEGMENTS) {
      const cx = (seg.x1 + seg.x2) / 2;
      const cy = (seg.y1 + seg.y2) / 2;
      const dx = mxPage - cx;
      const dy = myPage - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REVEAL_RADIUS) {
        const alpha = (1 - dist / REVEAL_RADIUS) * 0.35;
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.lineWidth = seg.x2 - seg.x1 <= 6 && seg.y2 - seg.y1 <= 6 ? 1.5 : 0.6;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(drawGrid);
  }
  drawGrid();

  /* ═══════════════════════════════════════════════════
     3. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════ */
  const observerOpts = { threshold: 0.15 };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOpts);

  document.querySelectorAll('.feat-card, .sdk-block, .trust-bar, .dashboard-browser').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // CSS class for revealed elements
  const style = document.createElement('style');
  style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════
     4. DASHBOARD LOGIC (Presets, API calls, rendering)
     ═══════════════════════════════════════════════════ */
  const presets = {
    established: {
      provider_wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 40.0,
      service_category: 'code_generation',
    },
    price_spike: {
      provider_wallet: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 150.0,
      service_category: 'code_generation',
    },
    wash_trading: {
      provider_wallet: '0x9999999999999999999999999999999999999999',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 25.0,
      service_category: 'trading_signal',
    },
    thin_history: {
      provider_wallet: '0x0000000000000000000000000000000000000001',
      buyer_wallet: '0x1234567890abcdef1234567890abcdef12345678',
      service_price: 30.0,
      service_category: 'general',
    },
  };

  const form         = document.getElementById('approveForm');
  const pWallet      = document.getElementById('provider_wallet');
  const bWallet      = document.getElementById('buyer_wallet');
  const sPrice       = document.getElementById('service_price');
  const sCat         = document.getElementById('service_category');
  const btnRun       = document.getElementById('btnRun');
  const btnX402      = document.getElementById('btnX402');
  const btnCopy      = document.getElementById('btnCopy');

  const scanInd      = document.getElementById('scanIndicator');
  const verdictBanner = document.getElementById('verdictBanner');
  const verdictIcon  = document.getElementById('verdictIcon');
  const verdictTitle = document.getElementById('verdictTitle');
  const recPayment   = document.getElementById('recPayment');
  const splitBadge   = document.getElementById('splitBadge');
  const reasoningList = document.getElementById('reasoningList');
  const mAge         = document.getElementById('mAge');
  const mTx          = document.getElementById('mTx');
  const mDev         = document.getElementById('mDev');
  const mWash        = document.getElementById('mWash');
  const jsonOut      = document.getElementById('jsonOut');

  const pills = document.querySelectorAll('.pill');

  function loadPreset(key) {
    const d = presets[key];
    if (!d) return;
    pWallet.value = d.provider_wallet;
    bWallet.value = d.buyer_wallet;
    sPrice.value  = d.service_price;
    sCat.value    = d.service_category;
  }

  // Default load
  loadPreset('established');
  runCheck();

  pills.forEach((p) => {
    p.addEventListener('click', () => {
      pills.forEach((b) => b.classList.remove('active'));
      p.classList.add('active');
      loadPreset(p.dataset.preset);
      runCheck();
    });
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); runCheck(); });

  async function runCheck() {
    scanInd.classList.remove('hidden');
    btnRun.disabled = true;

    try {
      await new Promise((r) => setTimeout(r, 300));
      const res = await fetch('/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_wallet: pWallet.value.trim(),
          buyer_wallet: bWallet.value.trim(),
          service_price: parseFloat(sPrice.value),
          service_category: sCat.value,
        }),
      });
      const data = await res.json();
      renderVerdict(data);
    } catch (err) {
      alert('API error: ' + err.message);
    } finally {
      scanInd.classList.add('hidden');
      btnRun.disabled = false;
    }
  }

  function renderVerdict(data) {
    jsonOut.textContent = JSON.stringify(data, null, 2);
    const ok = data.verdict === 'APPROVED';

    verdictBanner.className = 'verdict-banner ' + (ok ? 'approved' : 'caution');
    verdictTitle.textContent = data.verdict;

    verdictIcon.innerHTML = ok
      ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>'
      : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';

    recPayment.textContent = data.recommended_payment;
    if (data.split_ratio) {
      splitBadge.textContent = data.split_ratio;
      splitBadge.classList.remove('hidden');
    } else {
      splitBadge.classList.add('hidden');
    }

    reasoningList.innerHTML = '';
    (data.reasoning || []).forEach((r, i) => {
      const li = document.createElement('li');
      li.textContent = r;
      li.style.animationDelay = i * 0.06 + 's';
      if (r.includes('DEVIATION') || r.includes('WASH TRADING') || r.includes('MODERATE') || r.includes('Escrow')) li.classList.add('warn');
      reasoningList.appendChild(li);
    });

    if (data.metrics) {
      mAge.textContent  = data.metrics.wallet_age_days + 'd';
      mTx.textContent   = data.metrics.total_tx_count;
      mDev.textContent  = data.metrics.price_deviation_ratio + 'x';
      mWash.textContent = data.metrics.wash_trading_detected ? 'DETECTED' : 'CLEAR';
      mWash.style.color = data.metrics.wash_trading_detected ? '#f43f5e' : '#10b981';
    }
  }

  // x402 test
  btnX402.addEventListener('click', async () => {
    scanInd.classList.remove('hidden');
    try {
      const res = await fetch('/approve?x402=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_wallet: pWallet.value,
          buyer_wallet: bWallet.value,
          service_price: parseFloat(sPrice.value),
          service_category: sCat.value,
        }),
      });
      const data = await res.json();
      jsonOut.textContent = JSON.stringify(data, null, 2);

      verdictBanner.className = 'verdict-banner caution';
      verdictTitle.textContent = 'HTTP 402';
      verdictIcon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>';
      recPayment.textContent = 'x402 Challenge';
      splitBadge.classList.add('hidden');

      reasoningList.innerHTML = '';
      const items = [
        'HTTP 402 Payment Required — ASP endpoint requires pay-per-call header.',
        `Recipient: ${data.x402?.recipient || 'N/A'}`,
        `Fee: ${data.x402?.amount_usdt || '0.01'} USDT on X Layer (Chain 195)`,
        'Required Header: X-Payment-Auth',
      ];
      items.forEach((t, i) => {
        const li = document.createElement('li');
        li.textContent = t;
        li.style.animationDelay = i * 0.06 + 's';
        if (i === 0) li.classList.add('warn');
        reasoningList.appendChild(li);
      });

      mAge.textContent = '402';
      mTx.textContent  = 'x402';
      mDev.textContent = '0.01';
      mWash.textContent = 'N/A';
      mWash.style.color = '#c084fc';
    } catch (err) {
      alert('x402 test error: ' + err.message);
    } finally {
      scanInd.classList.add('hidden');
    }
  });

  // Copy SDK
  btnCopy.addEventListener('click', () => {
    const raw = document.getElementById('sdkSnippet').textContent;
    navigator.clipboard.writeText(raw).then(() => {
      document.getElementById('copyText').textContent = 'Copied ✓';
      setTimeout(() => { document.getElementById('copyText').textContent = 'Copy'; }, 2000);
    });
  });
});
