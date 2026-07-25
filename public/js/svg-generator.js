(() => {
    const CURRENCIES = new Set([
        'AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'INR',
        'JPY', 'KRW', 'NZD', 'RUB', 'SGD', 'TWD', 'USD'
    ]);

    const finiteNumber = (value, fallback = 0) => {
        const number = Number.parseFloat(value);
        return Number.isFinite(number) ? number : fallback;
    };

    const validCurrency = (value, fallback) => (
        CURRENCIES.has(value) ? value : fallback
    );

    const validDate = (value, fallback = '') => (
        /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : fallback
    );

    function cycleDays(endDate, periodDays, mode, endOfMonthMode) {
        if (mode !== 'real') return periodDays;

        const endMs = new Date(`${endDate}T00:00:00Z`).getTime();
        const date = new Date(endMs);
        const day = date.getUTCDate();

        if (periodDays === 30) date.setUTCMonth(date.getUTCMonth() - 1);
        else if (periodDays === 90) date.setUTCMonth(date.getUTCMonth() - 3);
        else if (periodDays === 180) date.setUTCMonth(date.getUTCMonth() - 6);
        else if (periodDays === 365) date.setUTCFullYear(date.getUTCFullYear() - 1);
        else if (periodDays === 730) date.setUTCFullYear(date.getUTCFullYear() - 2);
        else if (periodDays === 1095) date.setUTCFullYear(date.getUTCFullYear() - 3);
        else if (periodDays === 1825) date.setUTCFullYear(date.getUTCFullYear() - 5);
        else date.setUTCDate(date.getUTCDate() - periodDays);

        if (
            (periodDays === 30 || periodDays === 90 || periodDays === 180)
            && date.getUTCDate() !== day
        ) {
            date.setUTCDate(0);
        }
        if (
            endOfMonthMode === 'eom'
            && (periodDays === 30 || periodDays === 90 || periodDays === 180)
        ) {
            date.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
        }

        return Math.max(1, Math.round((endMs - date.getTime()) / 86400000));
    }

    function generateSvg(rawParams, logoDataUri = '') {
        const ra = Math.max(0, finiteNumber(rawParams.ra));
        const rc = validCurrency(rawParams.rc, 'USD');
        const pd = Math.max(1, Number.parseInt(rawParams.pd, 10) || 365);
        const ed = validDate(rawParams.ed);
        const td = validDate(rawParams.td, new Date().toISOString().split('T')[0]);
        const tc = validCurrency(rawParams.tc, 'CNY');
        const er = Math.max(0, finiteNumber(rawParams.er, 1));
        const parsedTa = rawParams.ta === undefined || rawParams.ta === ''
            ? null
            : finiteNumber(rawParams.ta, null);
        const ta = Number.isFinite(parsedTa) ? Math.max(0, parsedTa) : null;
        const cm = rawParams.cm === 'fixed' ? 'fixed' : 'real';
        const eom = rawParams.eom === 'eom' ? 'eom' : 'exact';

        if (!ed) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="530" viewBox="50 50 1100 530"><rect x="50" y="50" width="1100" height="530" rx="20" fill="#0d0d12"/></svg>';
        }

        const endMs = new Date(`${ed}T00:00:00Z`).getTime();
        const transactionMs = new Date(`${td}T00:00:00Z`).getTime();
        const remainDays = Math.ceil(Math.max(0, endMs - transactionMs) / 86400000);
        const totalCycleDays = cycleDays(ed, pd, cm, eom);
        const remainingValueTarget = (ra / totalCycleDays) * remainDays * er;
        const showPremium = ta !== null;
        const premiumAmount = showPremium ? ta - remainingValueTarget : 0;
        const premiumRate = showPremium && remainingValueTarget > 0
            ? (premiumAmount / remainingValueTarget) * 100
            : 0;

        let cycleText = '';
        if (pd === 30) cycleText = '/月';
        else if (pd === 90) cycleText = '/季';
        else if (pd === 180) cycleText = '/半年';
        else if (pd === 365) cycleText = '/年';
        else if (pd === 730) cycleText = '/两年';
        else if (pd === 1095) cycleText = '/三年';
        else if (pd === 1825) cycleText = '/五年';
        else cycleText = `/${pd}天`;

        const pct = Math.max(0, (remainDays / totalCycleDays) * 100);
        const barPct = Math.min(100, pct);
        const rightX = showPremium ? 833 : 650;
        const logo = logoDataUri
            ? `<image x="90" y="72" width="48" height="48" href="${logoDataUri}"/>`
            : '';

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1150" height="580" viewBox="25 25 1150 580">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#16161a"/>
<stop offset="100%" stop-color="#0a0a0d"/>
</linearGradient>
<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#FFD700"/>
<stop offset="100%" stop-color="#D4AF37"/>
</linearGradient>
<linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="#8C6A12" stop-opacity="0"/>
<stop offset="50%" stop-color="#8C6A12" stop-opacity="0.75"/>
<stop offset="100%" stop-color="#8C6A12" stop-opacity="0"/>
</linearGradient>
<linearGradient id="textShine" x1="-20%" y1="0%" x2="0%" y2="0%">
<stop offset="0%" stop-color="#D4AF37"/>
<stop offset="50%" stop-color="#FFFFFF"/>
<stop offset="100%" stop-color="#D4AF37"/>
<animate attributeName="x1" values="-100%; 200%; 200%" dur="5s" repeatCount="indefinite"/>
<animate attributeName="x2" values="0%; 300%; 300%" dur="5s" repeatCount="indefinite"/>
</linearGradient>
<clipPath id="roundCorner">
<rect x="25" y="25" width="1150" height="580" rx="24" ry="24"/>
</clipPath>
<style>
.f { font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.anim { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.d1 { animation-delay: 0.1s; opacity: 0; }
.d2 { animation-delay: 0.2s; opacity: 0; }
.d3 { animation-delay: 0.3s; opacity: 0; }
</style>
</defs>
<g clip-path="url(#roundCorner)">
<rect x="25" y="25" width="1150" height="580" fill="url(#bg)"/>
<rect x="50" y="50" width="1100" height="530" rx="20" fill="none" stroke="url(#g)" stroke-width="1.5" opacity="0.15"/>
<g class="f" fill="#FFFFFF">
${logo}
<text x="152" y="110" font-size="28" font-weight="700" fill="url(#textShine)" letter-spacing="1">VPS Remaining Value</text>
<g opacity="0.4">
<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" transform="translate(854, 68)" fill="#FFFFFF"/>
<text x="1110" y="81" font-size="14" fill="#FFFFFF" text-anchor="end">YoungYannick/vps-remaining-value</text>
</g>
<text x="1110" y="110" font-size="15" opacity="0.4" text-anchor="end">汇率: 1 ${rc} = ${er.toFixed(4)} ${tc}   |   交易日期: ${td}</text>
<line x1="50" y1="145" x2="1150" y2="145" stroke="#FFFFFF" opacity="0.08"/>
<g class="anim d1">
<text x="90" y="280" font-size="16" fill="#FFFFFF" opacity="0.6">剩余价值 (${tc})</text>
<text x="90" y="350" font-size="60" font-weight="700" fill="url(#g)">${remainingValueTarget.toFixed(3)}</text>
</g>`;

        if (showPremium) {
            const color = premiumAmount > 0 ? '#ff5a5a' : '#4ade80';
            const sign = premiumAmount > 0 ? '⤴ ' : (premiumAmount < 0 ? '⤵ ' : '');
            const premiumLabel = premiumAmount >= 0 ? '溢价' : '折价';
            const y1From = premiumAmount > 0 ? '100%' : '-100%';
            const y1To = premiumAmount > 0 ? '-100%' : '100%';
            const y2From = premiumAmount > 0 ? '200%' : '0%';
            const y2To = premiumAmount > 0 ? '0%' : '200%';
            svg += `<defs>
<linearGradient id="symWave" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
<stop offset="50%" stop-color="${color}" stop-opacity="1"/>
<stop offset="100%" stop-color="${color}" stop-opacity="0.3"/>
<animate attributeName="y1" from="${y1From}" to="${y1To}" dur="2.5s" repeatCount="indefinite"/>
<animate attributeName="y2" from="${y2From}" to="${y2To}" dur="2.5s" repeatCount="indefinite"/>
</linearGradient>
</defs>
<line x1="416" y1="190" x2="416" y2="435" stroke="#FFFFFF" opacity="0.08"/>
<g class="anim d2">
<text x="456" y="210" font-size="16" opacity="0.6">交易金额 (${tc})</text>
<text x="456" y="280" font-size="60" font-weight="700" fill="url(#g)">${ta.toFixed(3)}</text>
<text x="456" y="310" font-size="14" opacity="0.4">${premiumLabel}金额 (${tc})</text>
<text x="456" y="340" font-size="22" font-weight="600" fill="${color}" dominant-baseline="central"><tspan fill="url(#symWave)">${sign}</tspan> ${Math.abs(premiumAmount).toFixed(3)}</text>
<text x="456" y="390" font-size="14" opacity="0.4">${premiumLabel}幅度</text>
<text x="456" y="420" font-size="22" font-weight="600" fill="${color}" dominant-baseline="central"><tspan fill="url(#symWave)">${sign}</tspan> ${Math.abs(premiumRate).toFixed(3)}%</text>
</g>`;
        }

        svg += `<line x1="${rightX - 40}" y1="190" x2="${rightX - 40}" y2="435" stroke="#FFFFFF" opacity="0.08"/>
<g class="anim d3">
<text x="${rightX}" y="205" font-size="14" opacity="0.4">续费金额</text>
<text x="${rightX}" y="240" font-size="22" font-weight="600" dominant-baseline="central">${ra.toFixed(3)} ${rc}${cycleText}</text>
${rc !== tc ? `<text x="${rightX}" y="270" font-size="14" opacity="0.6">≈ ${(ra * er).toFixed(3)} ${tc}${cycleText}</text>` : ''}
<text x="${rightX}" y="310" font-size="14" opacity="0.4">剩余天数</text>
<text x="${rightX}" y="340" font-size="22" font-weight="600" dominant-baseline="central">${remainDays} / ${totalCycleDays} 天</text>
<text x="${rightX}" y="390" font-size="14" opacity="0.4">到期时间</text>
<text x="${rightX}" y="420" font-size="22" font-weight="600" dominant-baseline="central">${ed}</text>
</g>
<line x1="50" y1="480" x2="1150" y2="480" stroke="#FFFFFF" opacity="0.08"/>
<text x="90" y="525" font-size="16" opacity="0.6">剩余比例</text>
<text x="1110" y="525" font-size="16" font-weight="700" fill="url(#g)" text-anchor="end" dominant-baseline="central">${pct.toFixed(3)}%</text>
<rect x="90" y="545" width="1020" height="8" rx="4" fill="#202026"/>
<rect x="90" y="545" width="${10.2 * barPct}" height="8" rx="4" fill="url(#g)">
<animate attributeName="width" from="0" to="${10.2 * barPct}" dur="1.2s" fill="freeze" calcMode="spline" keyTimes="0; 1" keySplines="0.16 1 0.3 1"/>
</rect>
<clipPath id="barClip">
<rect x="90" y="545" width="${10.2 * barPct}" height="8" rx="4"/>
</clipPath>
<g clip-path="url(#barClip)">
<rect x="-110" y="545" width="200" height="8" fill="url(#shimmer)">
<animate attributeName="x" from="-110" to="${90 + 10.2 * barPct}" dur="3.5s" begin="1.5s" repeatCount="indefinite"/>
</rect>
</g>
</g>
</g>
</svg>`;

        return svg;
    }

    window.VrvSvg = { generateSvg };
})();
