/* js/home.js — Dashboard page renderer */

function renderHome() {
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();

  const totalDue = customers.reduce((s, c) => s + Math.max(0, bal(c.id)), 0);
  const custWithDue = customers.filter(c => bal(c.id) > 0).length;

  const mTx    = transactions.filter(tx => { const d = new Date(tx.date); return d.getMonth() === m && d.getFullYear() === y; });
  const mSale  = mTx.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);
  const mPaid  = mTx.filter(x => x.type === 'payment').reduce((s, x) => s + x.amount, 0);
  const allSales = transactions.filter(x => x.type === 'sale').reduce((s, x) => s + x.amount, 0);

  // Bar chart — last 6 months
  const bars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1), bm = d.getMonth(), by = d.getFullYear();
    const v = transactions
      .filter(x => { const dd = new Date(x.date); return x.type === 'sale' && dd.getMonth() === bm && dd.getFullYear() === by; })
      .reduce((s, x) => s + x.amount, 0);
    bars.push({ label: t('months')[bm], v, isCurrent: i === 0 });
  }
  const maxB = Math.max(...bars.map(b => b.v), 1);

  // Pie
  const pC = mPaid, pO = Math.max(0, mSale - mPaid), pT = pC + pO || 1;
  const pct = Math.round(pC / pT * 100);

  // Top debtors (up to 5)
  const debtors = customers
    .map(c => ({ ...c, b: bal(c.id) }))
    .filter(c => c.b > 0)
    .sort((a, z) => z.b - a.b)
    .slice(0, 5);

  // Today's activity
  const todayStr = now.toDateString();
  const todayTx = [...transactions]
    .filter(x => new Date(x.date).toDateString() === todayStr)
    .sort((a, z) => new Date(z.date) - new Date(a.date));

  // Recent sales (3)
  const recent = [...transactions]
    .filter(x => x.type === 'sale')
    .sort((a, z) => new Date(z.date) - new Date(a.date))
    .slice(0, 3);

  document.getElementById('home-content').innerHTML = `

    <!-- OUTSTANDING HERO CARD -->
    <div class="stat-hero">
      <div class="sh-label">${t('totalDue')}</div>
      <div class="sh-amount">${fmt(totalDue)}</div>
      <div class="sh-sub">${t('subDue')}</div>
      <div class="hero-chips">
        <div class="hero-chip red">
          <span>${custWithDue}</span> ${t('custOwing')}
        </div>
        <div class="hero-chip green">
          <span>${fmt(mPaid)}</span> ${t('collectedLabel')}
        </div>
      </div>
    </div>

    <div class="page-body">

      <!-- MINI STATS -->
      <div class="stats-grid" style="margin-top:14px">
        <div class="stat-tile">
          <div class="st-label">${t('monthSale')}</div>
          <div class="st-val gold">${fmt(mSale)}</div>
        </div>
        <div class="stat-tile">
          <div class="st-label">${t('allTime')}</div>
          <div class="st-val green">${fmt(allSales)}</div>
        </div>
      </div>

      <!-- TODAY'S ACTIVITY -->
      <div class="sec-head">${t('todayActivity')}</div>
      <div class="card">
        ${todayTx.length === 0
          ? `<div style="font-size:12px;color:var(--text3);text-align:center;padding:6px 0">${t('noActivityToday')}</div>`
          : todayTx.map(tx => {
              const c = customers.find(x => x.id === tx.customerId);
              const name = c ? c.name : '—';
              const time = new Date(tx.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
              return `
              <div class="activity-item">
                <div class="activity-dot ${tx.type}"></div>
                <div class="activity-text">
                  <b>${name}</b> — ${fmt(tx.amount)} ${tx.type === 'sale' ? t('soldFor') : t('paidLbl2')}
                </div>
                <div class="activity-time">${time}</div>
              </div>`;
            }).join('')
        }
      </div>

      <!-- TOP DEBTORS -->
      ${debtors.length > 0 ? `
        <div class="sec-head">${t('topDebtors')}</div>
        ${debtors.map(c => {
          const ag = agingText(c.id);
          const agCls = agingClass(c.id);
          return `
          <div class="cust-card" onclick="openDetail('${esc(c.id)}')">
            ${avatarHTML(c)}
            <div class="ci">
              <div class="ci-name">${c.name}</div>
              <div class="ci-bal red">${fmt(c.b)}</div>
              ${ag ? `<div class="aging-pill ${agCls}">${ag}</div>` : ''}
            </div>
            <a class="call-fab icon-label-btn" href="tel:${c.phone}" onclick="event.stopPropagation()" aria-label="${t('call')}">📞 ${t('call')}</a>
          </div>`;
        }).join('')}
      ` : ''}

      <!-- BAR CHART -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">${t('chartTitle')}</span>
          <span class="chart-val">${fmt(mSale)}</span>
        </div>
        ${bars.every(b => b.v === 0)
          ? `<div class="empty-state" style="padding:20px 0"><div class="empty-icon">📊</div><div class="empty-sub">${t('noSales')}</div></div>`
          : `<div class="bar-chart">
              ${bars.map(b => `
                <div class="bar-col">
                  <div class="bar-inner">
                    <div class="bar-body ${b.isCurrent ? 'now' : ''}" style="height:${Math.max(3, b.v / maxB * 76)}px">
                      ${b.v > 0 ? `<span class="bar-tip">${b.v >= 1000 ? (b.v / 1000).toFixed(0) + 'k' : b.v}</span>` : ''}
                    </div>
                  </div>
                  <div class="bar-lbl">${b.label}</div>
                </div>`).join('')}
            </div>`
        }
      </div>

      <!-- PIE CHART -->
      ${mSale > 0 ? `
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">${t('pieTitle')}</span>
          </div>
          <div class="pie-wrap">
            <svg width="80" height="80" viewBox="0 0 80 80" style="flex-shrink:0">
              <circle cx="40" cy="40" r="36" fill="#F3F4F6"/>
              ${pieSliceSVG(40, 40, 36, 0, pct * 3.6, '#10B981')}
              ${pct < 100 ? pieSliceSVG(40, 40, 36, pct * 3.6, 360, '#EF4444') : ''}
              <circle cx="40" cy="40" r="22" fill="white"/>
              <text x="40" y="44" text-anchor="middle" font-size="11" font-weight="700"
                font-family="Roboto Mono,monospace" fill="#111827">${pct}%</text>
            </svg>
            <div class="pie-legend">
              <div class="pie-legend-row">
                <div class="pie-dot" style="background:#10B981"></div>
                <div class="pie-lbl">${t('collected')}</div>
                <div class="pie-v">${fmt(pC)}</div>
              </div>
              <div class="pie-legend-row">
                <div class="pie-dot" style="background:#EF4444"></div>
                <div class="pie-lbl">${t('owing')}</div>
                <div class="pie-v">${fmt(pO)}</div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- RECENT SALES -->
      ${recent.length > 0 ? `
        <div class="sec-head">${t('recentSales')}</div>
        ${recent.map(tx => {
          const c = customers.find(x => x.id === tx.customerId);
          return `
          <div class="txn-item" style="cursor:pointer" onclick="${c ? `openDetail('${esc(tx.customerId)}')` : ''}">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="txn-icon sale">🛍️</div>
              <div class="txn-info">
                <div class="txn-label">${c ? c.name : '—'}</div>
                ${tx.desc ? `<div class="txn-sub">${tx.desc}</div>` : ''}
                <div class="txn-sub">${fmtDate(tx.date)}</div>
              </div>
              <div class="txn-amount sale">${fmt(tx.amount)}</div>
            </div>
            ${tx.photo ? `<img class="txn-photo-thumb" src="${tx.photo}" onclick="event.stopPropagation();openPV('${tx.photo}')"/>` : ''}
          </div>`;
        }).join('')}
      ` : ''}

    </div><!-- end page-body -->
  `;
}
