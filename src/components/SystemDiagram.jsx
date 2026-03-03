import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/* ===== P&ID Symbol Sub-Components ===== */

const GateValve = ({ x, y, rotation = 0, color = '#000', label }) => (
  <g transform={`translate(${x},${y}) rotate(${rotation})`}>
    <polygon points="-8,-6 0,0 -8,6" fill="none" stroke={color} strokeWidth="1.4" />
    <polygon points="8,-6 0,0 8,6" fill="none" stroke={color} strokeWidth="1.4" />
    {label && <text x="0" y={rotation === 90 ? 18 : 17} textAnchor="middle" fontSize="5.5" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

const SDVValve = ({ x, y, rotation = 0, tag, color = '#cc0000' }) => (
  <g transform={`translate(${x},${y}) rotate(${rotation})`}>
    <polygon points="-8,-6 0,0 -8,6" fill="none" stroke={color} strokeWidth="1.4" />
    <polygon points="8,-6 0,0 8,6" fill="none" stroke={color} strokeWidth="1.4" />
    <line x1="0" y1="0" x2="0" y2="-11" stroke={color} strokeWidth="1.3" />
    <rect x="-6" y="-22" width="12" height="11" fill={color} stroke={color} strokeWidth="0.6" rx="1" />
    {tag && <text x="0" y="14" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={color}>{tag}</text>}
  </g>
);

const FOVValve = ({ x, y, tag, color = '#cc0000' }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-10" y="-6" width="20" height="12" fill="none" stroke={color} strokeWidth="1.3" strokeDasharray="3,2" rx="1" />
    <text x="0" y="3" textAnchor="middle" fontSize="5.5" fontWeight="700" fill={color}>FOV</text>
    {tag && <text x="0" y="17" textAnchor="middle" fontSize="5" fontWeight="600" fill={color}>{tag}</text>}
  </g>
);

const CheckValve = ({ x, y, rotation = 0, color = '#000' }) => (
  <g transform={`translate(${x},${y}) rotate(${rotation})`}>
    <polygon points="-6,-5 6,0 -6,5" fill="none" stroke={color} strokeWidth="1.4" />
    <line x1="6" y1="-5" x2="6" y2="5" stroke={color} strokeWidth="1.4" />
  </g>
);

const ControlValve = ({ x, y, tag, sp, color = '#cc0000' }) => (
  <g transform={`translate(${x},${y})`}>
    <polygon points="-8,-6 0,0 -8,6" fill="none" stroke={color} strokeWidth="1.3" />
    <polygon points="8,-6 0,0 8,6" fill="none" stroke={color} strokeWidth="1.3" />
    <line x1="0" y1="0" x2="0" y2="-14" stroke={color} strokeWidth="1" />
    <circle r="9" cy="-23" fill="white" stroke={color} strokeWidth="1" />
    <text x="0" y="-21" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={color}>{tag}</text>
    {sp && <text x="0" y="-34" textAnchor="middle" fontSize="5" fill={color}>{sp}</text>}
  </g>
);

const InstrumentCircle = ({ x, y, tag, number, color = '#000', dashed = false, r = 12 }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="white" stroke={color} strokeWidth="1.1" strokeDasharray={dashed ? "3,2" : "none"} />
    <text x="0" y={number ? -1 : 4} textAnchor="middle" fontSize={r > 10 ? 6.5 : 5.5} fontWeight="600" fill={color}>{tag}</text>
    {number && <text x="0" y={r > 10 ? 7 : 6} textAnchor="middle" fontSize={r > 10 ? 5 : 4.5} fill={color}>{number}</text>}
  </g>
);

const Vessel = ({ x, y, w, h, label, tag, color = '#000', fill: fillColor = 'white' }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={h * 0.35} cy={h / 2} rx={h * 0.35} ry={h / 2} fill={fillColor} stroke={color} strokeWidth="1.4" />
    <rect x={h * 0.35} y="0" width={w - h * 0.7} height={h} fill={fillColor} stroke={color} strokeWidth="1.4" />
    <ellipse cx={w - h * 0.35} cy={h / 2} rx={h * 0.35} ry={h / 2} fill={fillColor} stroke={color} strokeWidth="1.4" />
    <rect x={h * 0.35 + 1} y="1" width={w - h * 0.7 - 2} height={h - 2} fill={fillColor} stroke="none" />
    {tag && <text x={w / 2} y={h / 2 - 2} textAnchor="middle" fontSize="6" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x={w / 2} y={h / 2 + 7} textAnchor="middle" fontSize="5.5" fill={color}>{label}</text>}
  </g>
);

const EquipBlock = ({ x, y, w, h, lines = [], color = '#000', bg = 'white', dashed = false, borderWidth = 1.4 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} fill={bg} stroke={color} strokeWidth={borderWidth}
      strokeDasharray={dashed ? "5,3" : "none"} rx="2" />
    {lines.map((line, i) => (
      <text key={i} x={w / 2} y={h / 2 + (i - (lines.length - 1) / 2) * 10 + 3}
        textAnchor="middle" fontSize={line.size || 7} fontWeight={line.bold ? '700' : '400'} fill={line.color || color}>
        {line.text}
      </text>
    ))}
  </g>
);

const Compressor = ({ x, y, r = 20, label, tag, color = '#000' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="white" stroke={color} strokeWidth="1.5" />
    <polygon points={`${-r * 0.5},-${r * 0.6} ${r * 0.5},0 ${-r * 0.5},${r * 0.6}`} fill="none" stroke={color} strokeWidth="1.2" />
    {tag && <text x="0" y={r + 11} textAnchor="middle" fontSize="6" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x="0" y={r + 20} textAnchor="middle" fontSize="5.5" fill={color}>{label}</text>}
  </g>
);

const Blower = ({ x, y, r = 22, tag, label, color = '#cc0000' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="white" stroke={color} strokeWidth="1.5" />
    <circle r="3" fill={color} />
    {tag && <text x="0" y={r + 11} textAnchor="middle" fontSize="6" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x="0" y={r + 20} textAnchor="middle" fontSize="5" fill={color}>{label}</text>}
  </g>
);

const FlareStack = ({ x, y, label, tipType }) => (
  <g transform={`translate(${x},${y})`}>
    <line x1="0" y1="50" x2="0" y2="12" stroke="#000" strokeWidth="2.5" />
    <polygon points="-9,14 0,-4 9,14" fill="#ff6600" stroke="#cc4400" strokeWidth="1" />
    <polygon points="-5,6 0,-10 5,6" fill="#ffcc00" stroke="none" />
    {/* Pilots */}
    <circle cx="-5" cy="20" r="2" fill="#ff9900" />
    <circle cx="0" cy="18" r="2" fill="#ff9900" />
    <circle cx="5" cy="20" r="2" fill="#ff9900" />
    {label && <text x="0" y="62" textAnchor="middle" fontSize="6" fontWeight="700" fill="#000">{label}</text>}
    {tipType && <text x="0" y="71" textAnchor="middle" fontSize="5" fill="#888">{tipType}</text>}
  </g>
);

const PSE = ({ x, y, pressure, tag, color = '#cc0000' }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width="32" height="18" fill="white" stroke={color} strokeWidth="1.2" rx="1" />
    <text x="16" y="12" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>PSE</text>
    <text x="16" y="-3" textAnchor="middle" fontSize="5" fontWeight="600" fill={color}>{pressure}</text>
    {tag && <text x="16" y="28" textAnchor="middle" fontSize="4.5" fill={color}>{tag}</text>}
  </g>
);

const Pump = ({ x, y, tag, color = '#000' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r="8" fill="white" stroke={color} strokeWidth="1.2" />
    <polygon points="-4,-4 4,0 -4,4" fill={color} />
    {tag && <text x="0" y="16" textAnchor="middle" fontSize="5" fontWeight="600" fill={color}>{tag}</text>}
  </g>
);

const Heater = ({ x, y, tag, color = '#cc6600' }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-12" y="-8" width="24" height="16" fill="white" stroke={color} strokeWidth="1.2" rx="2" />
    <path d="M-6,-3 L-3,3 L0,-3 L3,3 L6,-3" fill="none" stroke={color} strokeWidth="1" />
    {tag && <text x="0" y="18" textAnchor="middle" fontSize="5" fontWeight="600" fill={color}>{tag}</text>}
  </g>
);

const SectionTitle = ({ x, y, title, subtitle, color = '#007acc' }) => (
  <g transform={`translate(${x},${y})`}>
    <text x="0" y="0" fontSize="9" fontWeight="700" fill={color}>{title}</text>
    {subtitle && <text x="0" y="11" fontSize="6.5" fill="#858585">{subtitle}</text>}
  </g>
);

const DataTag = ({ x, y, value, unit, label, color = '#007acc', bgColor, isDark }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-48" y="-10" width="96" height={label ? 28 : 20} rx="3"
      fill={isDark ? '#252526' : (bgColor || '#f0f8ff')} stroke={color} strokeWidth="0.8" opacity="0.95" />
    <text x="0" y="3" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={color}>
      {value} {unit}
    </text>
    {label && <text x="0" y="14" textAnchor="middle" fontSize="5.5" fill="#858585">{label}</text>}
  </g>
);


/* ===== Main Component ===== */

export default function SystemDiagram({ data }) {
  const { t } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const hpFlare = data?.monitoring?.totals?.totalHP || 7975;
  const lpFlare = data?.monitoring?.totals?.totalLP || 19925;
  const hullVent = data?.monitoring?.totals?.totalHull || 40000;
  const totalFlaring = data?.monitoring?.totals?.totalFlaring || 67900;
  const hpComp = data?.compressors?.hp || { vazao: 250000, pressao: 151, temperatura: 80 };
  const lpComp = data?.compressors?.lp || { vazao: 200000, pressao: 10, temperatura: 60 };
  const blower = data?.compressors?.blower || { vazao: 250000, pressao: 1.913, temperatura: 50 };
  const totalRecovered = (hpComp.vazao || 250000) + (lpComp.vazao || 200000) + (blower.vazao || 250000);
  const recoveryRate = totalFlaring > 0 ? ((totalRecovered / totalFlaring) * 100).toFixed(1) : 0;

  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const border = isDark ? '#3e3e3e' : '#e5e7eb';
  const txt = isDark ? '#d4d4d4' : '#1f2937';
  const txtS = isDark ? '#858585' : '#6b7280';
  const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

  const C = {
    oil: '#c59a34', gas: '#4ec9b0', flare: '#cc0000', recovery: '#e88a3a',
    water: '#569cd6', accent: '#007acc', proposed: '#cc0000',
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="card border-l-2 border-l-vs-accent">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.diagramTitle}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              MAGNOLIA FPSO — Block 17, Offshore Angola — {t.diagramSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#000" strokeWidth="2" /></svg>
              <span style={{ color: txtS }}>Existing</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#cc0000" strokeWidth="2" /></svg>
              <span style={{ color: txtS }}>Proposed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#e88a3a" strokeWidth="2.5" strokeDasharray="4,2" /></svg>
              <span style={{ color: txtS }}>Recovery</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#c59a34" strokeWidth="2" /></svg>
              <span style={{ color: txtS }}>Oil</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#4ec9b0" strokeWidth="1.5" /></svg>
              <span style={{ color: txtS }}>Gas</span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== MAIN SVG ===== */}
      <div className="card p-2 overflow-hidden">
        <svg viewBox="0 0 1350 1100" className="w-full h-auto" style={{ minHeight: '620px', background: bg }}>
          <defs>
            <style>{`
              @keyframes flowDash { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
              .pipe-r { stroke-dasharray: 8,6; animation: flowDash 0.8s linear infinite; }
            `}</style>
            <marker id="aB" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto"><path d="M0,0L8,3L0,6Z" fill="#000"/></marker>
            <marker id="aR" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto"><path d="M0,0L8,3L0,6Z" fill="#cc0000"/></marker>
            <marker id="aO" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto"><path d="M0,0L8,3L0,6Z" fill="#e88a3a"/></marker>
            <marker id="aG" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto"><path d="M0,0L8,3L0,6Z" fill="#4ec9b0"/></marker>
            <marker id="aL" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto"><path d="M0,0L8,3L0,6Z" fill="#c59a34"/></marker>
          </defs>

          {/* ======== SECTION 1: PRODUCTION & SEPARATION ======== */}
          <rect x="15" y="15" width="900" height="195" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={25} y={32} title="SYSTEM 30/31/34 — CRUDE SEPARATION & TREATMENT" subtitle="2×50% Trains — 264 kbopd | 360 kbwpd | 405 kblpd — Water Depth 1200-1400m" />

          {/* Wells */}
          <EquipBlock x={30} y={55} w={80} h={50} color="#555"
            lines={[{ text:'4 LOOPS',bold:true,size:7},{text:'8 RISERS',size:6},{text:'82 Wells',size:5.5,color:'#888'}]} />
          <line x1="110" y1="80" x2="140" y2="80" stroke="#000" strokeWidth="1.5" markerEnd="url(#aB)" />

          {/* Inlet Manifold */}
          <EquipBlock x={142} y={60} w={70} h={40} color="#000"
            lines={[{text:'INLET',bold:true,size:6.5},{text:'MANIFOLD',size:6}]} />

          {/* TRAIN A */}
          <text x="240" y="57" fontSize="7" fontWeight="700" fill={txt}>TRAIN A</text>
          <line x1="212" y1="72" x2="240" y2="72" stroke={C.oil} strokeWidth="1.5" markerEnd="url(#aL)" />
          <Vessel x={242} y={58} w={105} h={30} tag="6DS 3100A" label="1st Stage Sep" />
          <line x1="347" y1="73" x2="368" y2="73" stroke={C.oil} strokeWidth="1.5" markerEnd="url(#aL)" />
          <EquipBlock x={370} y={60} w={78} h={26} lines={[{text:'6DA 3310A',bold:true,size:6},{text:'Dehydrator',size:5.5}]} />
          <line x1="448" y1="73" x2="468" y2="73" stroke={C.oil} strokeWidth="1.5" markerEnd="url(#aL)" />
          <Vessel x={470} y={58} w={90} h={30} tag="6DS 3400A" label="2nd Stage Sep" />
          <line x1="560" y1="73" x2="578" y2="73" stroke={C.oil} strokeWidth="1.5" markerEnd="url(#aL)" />
          <EquipBlock x={580} y={60} w={68} h={26} lines={[{text:'6DA 3320A',bold:true,size:6},{text:'Desalter',size:5.5}]} />
          <line x1="648" y1="73" x2="668" y2="73" stroke={C.oil} strokeWidth="1.3" markerEnd="url(#aL)" />
          <EquipBlock x={670} y={60} w={60} h={26} lines={[{text:'6EC 3400A',bold:true,size:5.5},{text:'Cooler 50°C',size:5}]} />
          <line x1="730" y1="73" x2="755" y2="73" stroke={C.oil} strokeWidth="1.3" />
          <line x1="755" y1="73" x2="755" y2="160" stroke={C.oil} strokeWidth="1.3" />
          <line x1="755" y1="160" x2="840" y2="160" stroke={C.oil} strokeWidth="1.3" markerEnd="url(#aL)" />

          {/* TRAIN B */}
          <text x="240" y="117" fontSize="7" fontWeight="700" fill={txt}>TRAIN B</text>
          <line x1="212" y1="87" x2="225" y2="87" stroke={C.oil} strokeWidth="1.2" />
          <line x1="225" y1="87" x2="225" y2="130" stroke={C.oil} strokeWidth="1.2" />
          <line x1="225" y1="130" x2="240" y2="130" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />
          <Vessel x={242} y={118} w={105} h={30} tag="6DS 3100B" label="1st Stage Sep" />
          <line x1="347" y1="133" x2="368" y2="133" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />
          <EquipBlock x={370} y={120} w={78} h={26} lines={[{text:'6DA 3310B',bold:true,size:6},{text:'Dehydrator',size:5.5}]} />
          <line x1="448" y1="133" x2="468" y2="133" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />
          <Vessel x={470} y={118} w={90} h={30} tag="6DS 3400B" label="2nd Stage Sep" />
          <line x1="560" y1="133" x2="578" y2="133" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />
          <EquipBlock x={580} y={120} w={68} h={26} lines={[{text:'6DA 3320B',bold:true,size:6},{text:'Desalter',size:5.5}]} />
          <line x1="648" y1="133" x2="668" y2="133" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />
          <EquipBlock x={670} y={120} w={60} h={26} lines={[{text:'6EC 3400B',bold:true,size:5.5},{text:'Cooler 50°C',size:5}]} />
          <line x1="730" y1="133" x2="745" y2="133" stroke={C.oil} strokeWidth="1.2" />
          <line x1="745" y1="133" x2="745" y2="170" stroke={C.oil} strokeWidth="1.2" />
          <line x1="745" y1="170" x2="840" y2="170" stroke={C.oil} strokeWidth="1.2" markerEnd="url(#aL)" />

          {/* COTs */}
          <EquipBlock x={842} y={140} w={50} h={55} color="#555" bg={isDark?'#2d2d2d':'#f5f0e0'}
            lines={[{text:'COTs',bold:true,size:8},{text:'HULL',size:6,color:'#888'},{text:'STORAGE',size:5.5,color:'#888'}]} />

          {/* Produced Water path */}
          <line x1="410" y1="86" x2="410" y2="180" stroke={C.water} strokeWidth="0.8" />
          <text x="415" y="185" fontSize="4.5" fill={C.water}>PW → Sys 41</text>

          {/* Gas 1st Stage → HP Comp */}
          <line x1="295" y1="58" x2="295" y2="243" stroke={C.gas} strokeWidth="1.3" />
          <line x1="295" y1="243" x2="120" y2="243" stroke={C.gas} strokeWidth="1.3" markerEnd="url(#aG)" />
          <text x="285" y="52" fontSize="5" fill={C.gas} fontWeight="600">Gas</text>

          {/* Gas 2nd Stage → LP Comp */}
          <line x1="515" y1="88" x2="515" y2="270" stroke={C.gas} strokeWidth="1.3" />
          <line x1="515" y1="270" x2="345" y2="270" stroke={C.gas} strokeWidth="1.3" markerEnd="url(#aG)" />
          <line x1="515" y1="148" x2="515" y2="270" stroke={C.gas} strokeWidth="1" />
          <text x="505" y="95" fontSize="5" fill={C.gas} fontWeight="600">Gas</text>
          {/* PV 34003 from 2nd stage */}
          <text x="465" y="95" fontSize="4.5" fill={txtS}>PV 34003</text>
          <text x="465" y="103" fontSize="4.5" fill={txtS}>SP 900 mbarg</text>


          {/* ======== SECTION 2: GAS COMPRESSION ======== */}
          <rect x="15" y="218" width="560" height="100" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={25} y={235} title="SYSTEM 51/52 — GAS COMPRESSION" subtitle="HP + LP Compression — Anti-surge adjusted for Closed Flare" />

          <Compressor x={90} y={272} r={22} tag="HP COMP" label="6KB 5230A" />
          <Compressor x={315} y={272} r={22} tag="LP COMP" label="6KB 5110/5120" />

          <line x1="112" y1="272" x2="145" y2="272" stroke={C.gas} strokeWidth="1.5" markerEnd="url(#aG)" />
          <EquipBlock x={147} y={260} w={70} h={24} color={C.gas}
            lines={[{text:'GAS EXPORT',bold:true,size:6},{text:'& INJECTION',size:5.5}]} />

          <line x1="293" y1="272" x2="220" y2="272" stroke={C.gas} strokeWidth="1.2" />
          <line x1="220" y1="272" x2="220" y2="260" stroke={C.gas} strokeWidth="1.2" />
          <line x1="220" y1="260" x2="113" y2="260" stroke={C.gas} strokeWidth="1.2" />

          <DataTag x={90} y={243} value={fmt(hpComp.vazao)} unit="Sm³/d" label={`${hpComp.pressao} bar | ${hpComp.temperatura}°C`} color={C.accent} isDark={isDark} />
          <DataTag x={315} y={243} value={fmt(lpComp.vazao)} unit="Sm³/d" label={`${lpComp.pressao} bar | ${lpComp.temperatura}°C`} color={C.accent} isDark={isDark} />

          {/* LP suction info */}
          <text x="375" y="292" fontSize="5.5" fill={C.accent} fontWeight="600">Suction: 700-900 mbarg</text>
          <text x="375" y="300" fontSize="4.5" fill={txtS}>PIC 51101 speed ctrl | PIC 34003 overpressure</text>
          <text x="375" y="308" fontSize="4.5" fill={txtS}>Total suction: ~4960 kg/h (4150 Am³/h)</text>


          {/* ======== SECTION 3: HP FLARE SYSTEM ======== */}
          <rect x="580" y="218" width="755" height="215" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={590} y={235} title="SYSTEM 21 — HP FLARE" subtitle={'HP Flare KO Drum 6DS 2110 — Design: 14.0 MMSm³/d emergency — 24" outlet'} />

          {/* HP Header */}
          <text x="600" y="262" fontSize="6" fontWeight="600" fill="#000">HP Flare Header</text>
          <text x="600" y="270" fontSize="5" fill={txtS}>P11/P12/P21/P22/P31/P32/P41/P42/P51/P52/P61/P62</text>
          <line x1="600" y1="278" x2="720" y2="278" stroke="#000" strokeWidth="2" />
          <text x="655" y="290" fontSize="4.5" fill={txtS}>PSVs, Purges, Leaks, Blowdown</text>

          <line x1="720" y1="278" x2="770" y2="278" stroke="#000" strokeWidth="2" />
          <rect x="732" y="272" width="12" height="12" fill="#cc0000" stroke="#990000" strokeWidth="0.8" />
          <text x="738" y="295" textAnchor="middle" fontSize="5" fontWeight="600">FOB</text>

          {/* HP KO Drum */}
          <Vessel x={775} y={258} w={155} h={45} tag="6DS 2110" label="HP Flare KO Drum" />

          {/* Electrical Heater 6EC 2110 */}
          <Heater x={810} y={318} tag="6EC 2110" color="#cc6600" />
          <text x="810" y="336" textAnchor="middle" fontSize="4" fill="#cc6600">5-35°C</text>

          {/* Level Controller LC 21105 */}
          <InstrumentCircle x={845} y={318} tag="LC" number="21105" color="#000" r={10} />

          {/* KO Drum pumps */}
          <Pump x={880} y={320} tag="6GX 2110" />
          <text x="880" y="338" textAnchor="middle" fontSize="4" fill={txtS}>A/B → 6DS 3100</text>
          <text x="880" y="346" textAnchor="middle" fontSize="4" fill={txtS}>ROV 21102</text>
          <line x1="880" y1="303" x2="880" y2="312" stroke="#000" strokeWidth="1" />

          {/* Temp controller TC 21107 */}
          <InstrumentCircle x={840} y={345} tag="TC" number="21107" color="#cc6600" r={9} dashed />

          {/* HP → SBDV 21104 → Stack */}
          <line x1="930" y1="278" x2="958" y2="278" stroke="#000" strokeWidth="2" />
          <FOVValve x={972} y={278} tag="SBDV 21104" />
          <line x1="987" y1="278" x2="1035" y2="278" stroke="#000" strokeWidth="2" />
          <PSE x={1008} y={253} pressure="3.9 bar" tag="PSE 21128" />

          {/* Interlock note */}
          <text x="1005" y="300" fontSize="4" fill="#cc0000">SBDV ↔ PSE Interlock</text>
          <text x="1005" y="307" fontSize="4" fill={txtS}>Isolation valves locked open</text>

          {/* HP Flare Stack */}
          <FlareStack x={1060} y={228} label="6FB 2110" tipType="Sonic Tip" />

          {/* Flow & Temp at tip */}
          <InstrumentCircle x={1100} y={295} tag="FQI" number="21101" color="#000" r={10} dashed />
          <InstrumentCircle x={1130} y={295} tag="TI" number="21106" color="#000" r={10} dashed />

          {/* PSHH 2oo3 */}
          <InstrumentCircle x={920} y={322} tag="PSHH" number="2oo3" color="#cc0000" />
          <text x="920" y="340" textAnchor="middle" fontSize="4.5" fill="#cc0000">21129/30/31</text>
          <text x="920" y="348" textAnchor="middle" fontSize="4.5" fill="#cc0000">2.0 barg trip</text>
          <line x1="920" y1="310" x2="920" y2="303" stroke="#cc0000" strokeWidth="0.8" strokeDasharray="3,2" />

          {/* ---- HP RECOVERY ---- */}
          <line x1="830" y1="303" x2="830" y2="345" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="830" y1="345" x2="760" y2="345" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <SDVValve x={790} y={345} tag="SDV 21105" />
          <ControlValve x={730} y={345} tag="PV" sp="SP 950 mbarg" />
          <text x="730" y="363" textAnchor="middle" fontSize="5" fill="#cc0000">PIC 21006</text>
          <line x1="700" y1="345" x2="660" y2="345" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <CheckValve x={680} y={345} color={C.recovery} />
          <InstrumentCircle x={648} y={365} tag="FI" number="21103" color="#cc0000" r={10} dashed />
          <text x="648" y="381" textAnchor="middle" fontSize="4.5" fill="#cc0000">~1900 kg/h</text>
          <text x="648" y="389" textAnchor="middle" fontSize="4" fill="#cc0000">1600 Am³/h</text>
          <line x1="648" y1="355" x2="648" y2="345" stroke="#cc0000" strokeWidth="0.6" />
          <line x1="660" y1="345" x2="600" y2="345" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="600" y1="345" x2="600" y2="395" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <InstrumentCircle x={618} y={410} tag="AT" number="21101" color="#007acc" r={10} dashed />
          <text x="618" y="425" textAnchor="middle" fontSize="4" fill="#007acc">O₂ High Alarm</text>

          <DataTag x={700} y={278} value={`HP: ${fmt(hpFlare)}`} unit="Sm³/d" color="#f44747" bgColor="#fff5f5" isDark={isDark} />


          {/* ======== SECTION 4: LP FLARE SYSTEM ======== */}
          <rect x="580" y="438" width="755" height="215" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={590} y={455} title="SYSTEM 21 — LP FLARE" subtitle={'LP Flare KO Drum 6DS 2120 — Design: 0.65 MMSm³/d continuous — 14" outlet'} />

          {/* LP Header */}
          <text x="600" y="480" fontSize="6" fontWeight="600" fill="#000">LP Flare Header</text>
          <text x="600" y="488" fontSize="5" fill={txtS}>P31/P32/P41/P42/P51/P52</text>
          <line x1="600" y1="495" x2="720" y2="495" stroke="#000" strokeWidth="2" />
          <text x="655" y="507" fontSize="4.5" fill={txtS}>2nd Stage Sep gas, TEG regen, PW Degassers</text>

          <line x1="720" y1="495" x2="770" y2="495" stroke="#000" strokeWidth="2" />
          <rect x="732" y="489" width="12" height="12" fill="#cc0000" stroke="#990000" strokeWidth="0.8" />
          <text x="738" y="512" textAnchor="middle" fontSize="5" fontWeight="600">FOB</text>

          {/* LP KO Drum */}
          <Vessel x={775} y={475} w={155} h={45} tag="6DS 2120" label="LP Flare KO Drum" />

          {/* Level Controller LC 21205 */}
          <InstrumentCircle x={845} y={535} tag="LC" number="21205" color="#000" r={10} />

          {/* KO Drum pumps */}
          <Pump x={880} y={537} tag="6GX 2120" />
          <text x="880" y="555" textAnchor="middle" fontSize="4" fill={txtS}>A/B → 6DS 3100</text>
          <text x="880" y="563" textAnchor="middle" fontSize="4" fill={txtS}>ROV 21202</text>
          <line x1="880" y1="520" x2="880" y2="529" stroke="#000" strokeWidth="1" />

          {/* LP → SBDV 21204 → Stack */}
          <line x1="930" y1="495" x2="958" y2="495" stroke="#000" strokeWidth="2" />
          <FOVValve x={972} y={495} tag="SBDV 21204" />
          <line x1="987" y1="495" x2="1035" y2="495" stroke="#000" strokeWidth="2" />
          <PSE x={1008} y={470} pressure="0.52 bar" tag="PSE 21228" />

          <text x="1005" y="517" fontSize="4" fill="#cc0000">SBDV ↔ PSE Interlock</text>

          {/* LP Flare Stack */}
          <FlareStack x={1060} y={445} label="6FB 2120" tipType="Pipe Tip" />

          {/* Flow & Temp at tip */}
          <InstrumentCircle x={1100} y={512} tag="FQI" number="21201" color="#000" r={10} dashed />
          <InstrumentCircle x={1130} y={512} tag="TI" number="21212" color="#000" r={10} dashed />

          {/* PSHH 2oo3 */}
          <InstrumentCircle x={920} y={540} tag="PSHH" number="2oo3" color="#cc0000" />
          <text x="920" y="558" textAnchor="middle" fontSize="4.5" fill="#cc0000">21229/30/31</text>
          <text x="920" y="566" textAnchor="middle" fontSize="4.5" fill="#cc0000">300 mbarg trip</text>
          <line x1="920" y1="528" x2="920" y2="520" stroke="#cc0000" strokeWidth="0.8" strokeDasharray="3,2" />

          {/* ---- LP RECOVERY ---- */}
          <line x1="830" y1="520" x2="830" y2="560" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="830" y1="560" x2="760" y2="560" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <SDVValve x={790} y={560} tag="SDV 21205" />
          <ControlValve x={730} y={560} tag="PV" sp="SP 70 mbarg" />
          <text x="730" y="578" textAnchor="middle" fontSize="5" fill="#cc0000">PIC 21016</text>
          <line x1="700" y1="560" x2="660" y2="560" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <CheckValve x={680} y={560} color={C.recovery} />
          <InstrumentCircle x={648} y={580} tag="FI" number="21203" color="#cc0000" r={10} dashed />
          <text x="648" y="596" textAnchor="middle" fontSize="4.5" fill="#cc0000">~970 kg/h</text>
          <text x="648" y="604" textAnchor="middle" fontSize="4" fill="#cc0000">1100 Am³/h</text>
          <line x1="648" y1="570" x2="648" y2="560" stroke="#cc0000" strokeWidth="0.6" />
          <line x1="660" y1="560" x2="560" y2="560" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="560" y1="560" x2="560" y2="710" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <InstrumentCircle x={616} y={610} tag="AT" number="21201" color="#007acc" r={10} dashed />
          <text x="616" y="625" textAnchor="middle" fontSize="4" fill="#007acc">O₂ High Alarm</text>

          <DataTag x={700} y={495} value={`LP: ${fmt(lpFlare)}`} unit="Sm³/d" color="#f44747" bgColor="#fff5f5" isDark={isDark} />


          {/* ======== FLARE IGNITION SYSTEM ======== */}
          <EquipBlock x={1090} y={385} w={100} h={50} color="#cc6600" bg={isDark?'#2a2520':'#fff8f0'}
            lines={[{text:'6UB 2130',bold:true,size:6,color:'#cc6600'},{text:'FLARE IGNITION',size:5.5,color:'#cc6600'},{text:'3 pilots/tip',size:5,color:'#999'},{text:'FG/Air Venturi',size:5,color:'#999'}]} />
          <line x1="1140" y1="385" x2="1140" y2="370" stroke="#cc6600" strokeWidth="0.8" strokeDasharray="3,2" />
          <line x1="1140" y1="435" x2="1140" y2="448" stroke="#cc6600" strokeWidth="0.8" strokeDasharray="3,2" />


          {/* ======== N2/FG PURGE SYSTEMS ======== */}
          <rect x="1195" y="240" width="140" height="135" rx="3" fill={isDark?'#252526':'#f8f8f8'} stroke={border} strokeWidth="0.8" />
          <text x="1265" y="256" textAnchor="middle" fontSize="6" fontWeight="700" fill={txt}>STACK PURGE</text>

          <text x="1200" y="270" fontSize="5" fontWeight="600" fill="#000">HP Stack:</text>
          <text x="1200" y="279" fontSize="4.5" fill={txtS}>N₂: 6FIC 21105 / 6FV 21105A</text>
          <text x="1200" y="288" fontSize="4.5" fill={txtS}>FG backup: 6FV 21105B</text>
          <text x="1200" y="297" fontSize="4.5" fill={txtS}>Auto N₂→FG on FAL 21105</text>
          <text x="1200" y="306" fontSize="4.5" fill="#cc0000">FSLL 21104 → FOV open (60s)</text>

          <text x="1200" y="320" fontSize="5" fontWeight="600" fill="#000">LP Stack:</text>
          <text x="1200" y="329" fontSize="4.5" fill={txtS}>N₂: 6FIC 21205 / 6FV 21205A</text>
          <text x="1200" y="338" fontSize="4.5" fill={txtS}>FG backup: 6FV 21205B</text>
          <text x="1200" y="347" fontSize="4.5" fill={txtS}>Auto N₂→FG on FAL 21205</text>
          <text x="1200" y="356" fontSize="4.5" fill="#cc0000">FSLL 21204 → FOV open (60s)</text>
          <text x="1200" y="370" fontSize="4.5" fill={txtS}>Stack drain pots → LP KO</text>


          {/* ======== WOBBE INDEX ======== */}
          <rect x="1195" y="382" width="140" height="55" rx="3" fill={isDark?'#252526':'#f8f8f8'} stroke={border} strokeWidth="0.8" />
          <text x="1265" y="397" textAnchor="middle" fontSize="6" fontWeight="700" fill={txt}>WOBBE INDEX</text>
          <text x="1200" y="410" fontSize="4.5" fill={txtS}>6FIC 21002 → 6FV 21002</text>
          <text x="1200" y="419" fontSize="4.5" fill={txtS}>Min HC rate: 14 kSm³/d</text>
          <text x="1200" y="428" fontSize="4.5" fill={txtS}>SP = 317.9 - x (blower corr.)</text>
          <text x="1200" y="437" fontSize="4.5" fill={txtS}>IG sweep optimization</text>


          {/* ======== SECTION 5: HULL VENT & GAS RECOVERY ======== */}
          <rect x="15" y="660" width="555" height="240" rx="4" fill="none" stroke={C.proposed} strokeWidth="1.2" strokeDasharray="6,4" />
          <SectionTitle x={25} y={678} title="SYSTEM 62 — HULL VENT & FLARE GAS RECOVERY" subtitle="New 6KA 2140 (main duty) + Existing 6KA 2120 (backup — Open Flare only)" color="#cc0000" />

          {/* Package boundary */}
          <rect x="175" y="700" width="375" height="180" rx="4" fill="none" stroke={C.proposed} strokeWidth="1" strokeDasharray="5,3" />
          <text x="185" y="713" fontSize="6" fontWeight="600" fill={C.proposed}>GAS RECOVERY PACKAGE — 6UB 2140 / 6UB 2120</text>

          {/* New Filter 6IF 2140 */}
          <EquipBlock x={190} y={725} w={60} h={30} color={C.proposed}
            lines={[{text:'6IF 2140',bold:true,size:6},{text:'Filter (New)',size:5}]} />
          <InstrumentCircle x={220} y={770} tag="LT" number="21901" color={C.proposed} r={8} />
          <InstrumentCircle x={240} y={770} tag="PDI" number="21905" color={C.proposed} r={8} dashed />

          {/* Existing Filter 6IF 2120 */}
          <EquipBlock x={190} y={800} w={60} h={28} color="#000"
            lines={[{text:'6IF 2120',bold:true,size:6},{text:'Filter (Exist)',size:5}]} />
          <InstrumentCircle x={220} y={840} tag="LS" number="21801" color="#000" r={8} />
          <InstrumentCircle x={240} y={840} tag="PDI" number="21805" color="#000" r={8} dashed />

          {/* SDVs and pipes */}
          <line x1="250" y1="740" x2="290" y2="740" stroke={C.proposed} strokeWidth="1.5" />
          <line x1="250" y1="814" x2="290" y2="814" stroke="#000" strokeWidth="1.2" />
          <SDVValve x={272} y={740} tag="SDV 21002" />
          <SDVValve x={272} y={814} tag="SDV 21801" color="#000" />

          {/* Blowers */}
          <Blower x={340} y={740} r={22} tag="6KA 2140" label="New — VSD 32kW" color={C.proposed} />
          <Blower x={340} y={814} r={18} tag="6KA 2120" label="Existing — Backup" color="#555" />

          {/* VSD */}
          <EquipBlock x={375} y={718} w={32} h={14} color={C.proposed} lines={[{text:'VSD',bold:true,size:5.5}]} />
          <EquipBlock x={373} y={796} w={32} h={14} color="#555" lines={[{text:'VSD',bold:true,size:5.5}]} />

          {/* Crossover pipe (10"-NG-6-21930) */}
          <line x1="362" y1="740" x2="418" y2="740" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="358" y1="814" x2="418" y2="814" stroke={C.recovery} strokeWidth="1.2" className="pipe-r" />
          <line x1="418" y1="740" x2="418" y2="814" stroke={C.recovery} strokeWidth="1.5" />
          <text x="425" y="778" fontSize="4" fill={txtS}>10"-NG-6-21930</text>
          <text x="425" y="786" fontSize="4" fill={txtS}>Crossover</text>
          <line x1="418" y1="777" x2="498" y2="777" stroke={C.recovery} strokeWidth="2" className="pipe-r" />

          {/* O2 analyzers */}
          <InstrumentCircle x={460} y={756} tag="AT" number="21004" color="#007acc" r={9} dashed />
          <InstrumentCircle x={482} y={756} tag="AT" number="21005" color="#007acc" r={9} dashed />
          <text x="471" y="744" textAnchor="middle" fontSize="4" fill="#007acc">O₂ Trip → Open Flare</text>
          <line x1="471" y1="765" x2="471" y2="777" stroke="#007acc" strokeWidth="0.5" />

          {/* SDV 21001 */}
          <SDVValve x={498} y={777} tag="SDV 21001" />

          {/* Main discharge → LP Comp */}
          <line x1="518" y1="777" x2="555" y2="777" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="555" y1="777" x2="555" y2="400" stroke={C.recovery} strokeWidth="2" className="pipe-r" />
          <line x1="555" y1="400" x2="555" y2="312" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="555" y1="312" x2="495" y2="312" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="495" y1="312" x2="495" y2="282" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="495" y1="282" x2="337" y2="282" stroke={C.recovery} strokeWidth="1.5" markerEnd="url(#aO)" />

          {/* HP recovery joins */}
          <line x1="600" y1="395" x2="600" y2="405" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="600" y1="405" x2="555" y2="405" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />

          {/* PV 21005 recycle */}
          <ControlValve x={478} y={840} tag="PV" sp="Recycle" />
          <text x="478" y="858" textAnchor="middle" fontSize="5" fill="#cc0000">PIC 21005</text>
          <line x1="438" y1="840" x2="418" y2="840" stroke={C.proposed} strokeWidth="1" />
          <line x1="418" y1="840" x2="418" y2="817" stroke={C.proposed} strokeWidth="1" />
          <line x1="498" y1="840" x2="565" y2="840" stroke={C.proposed} strokeWidth="1" />
          <line x1="565" y1="840" x2="565" y2="630" stroke={C.proposed} strokeWidth="1" />
          <text x="570" y="645" fontSize="4" fill={C.proposed}>→ LP KO Drum</text>

          {/* PSHH 21008 */}
          <InstrumentCircle x={520} y={810} tag="PSHH" number="21008" color="#cc0000" r={10} />
          <text x="520" y="826" textAnchor="middle" fontSize="4" fill="#cc0000">1100 mbarg → SDV 21001 close</text>

          {/* PSHH 21802/21902 blower trip */}
          <text x="540" y="858" fontSize="4" fill="#cc0000">PSHH 21802/21902 → Blower trip</text>

          {/* PIC 21009 */}
          <InstrumentCircle x={155} y={750} tag="PIC" number="21009" color="#cc0000" />
          <text x="155" y="768" textAnchor="middle" fontSize="5" fill="#cc0000">SP 50-60 mbarg</text>
          <text x="155" y="777" textAnchor="middle" fontSize="4" fill={txtS}>A/B → Blower speed</text>
          <text x="155" y="786" textAnchor="middle" fontSize="4" fill={txtS}>Start @ 60 mbarg</text>
          <text x="155" y="795" textAnchor="middle" fontSize="4" fill={txtS}>{'Stop < 50 mbarg'}</text>
          <line x1="155" y1="762" x2="155" y2="740" stroke="#cc0000" strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1="155" y1="740" x2="190" y2="740" stroke="#cc0000" strokeWidth="0.8" strokeDasharray="3,2" />

          {/* Blower data */}
          <DataTag x={340} y={865} value={fmt(blower.vazao)} unit="Sm³/d" label={`${blower.pressao} bar | ${blower.temperatura}°C`} color="#c586c0" bgColor="#f5f0ff" isDark={isDark} />
          <text x="340" y="885" textAnchor="middle" fontSize="4.5" fill={txtS}>Total suction: ~3040 kg/h (3500 Am³/h)</text>

          {/* LP recovery enters */}
          <line x1="560" y1="710" x2="185" y2="710" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="185" y1="710" x2="185" y2="725" stroke={C.recovery} strokeWidth="1.5" />
          <line x1="185" y1="710" x2="185" y2="800" stroke={C.recovery} strokeWidth="1" />

          {/* N2 flushing line for 6KA 2140 */}
          <text x="370" y="870" fontSize="4" fill={txtS}>N₂ flush: GN-6-97904</text>
          <text x="370" y="878" fontSize="4" fill={txtS}>6RO 97901, 6PG 97901/02</text>


          {/* ======== SECTION 6: HULL / COTs ======== */}
          <rect x="15" y="905" width="555" height="130" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={25} y={922} title="HULL — CARGO OIL TANKS (COTs)" subtitle="Dirty Vent Header + HC Blanketing — 17 min margin to HVV opening" />

          <EquipBlock x={30} y={940} w={175} h={60} color="#555" bg={isDark?'#2d2d2d':'#f5f0e0'}
            lines={[{text:'CARGO OIL TANKS',bold:true,size:7.5},{text:'Dirty Vent Header (ex-IG)',size:5.5},{text:'P/V Valves on each tank',size:5,color:'#888'},{text:'PSV 61015/61016 protection',size:5,color:'#888'}]} />

          <EquipBlock x={220} y={945} w={60} h={22} lines={[{text:'LC 6215',bold:true,size:5.5},{text:'PV Breaker',size:5}]} />

          {/* Vent gas → Blower */}
          <line x1="120" y1="940" x2="120" y2="892" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="120" y1="892" x2="155" y2="892" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <line x1="155" y1="892" x2="155" y2="800" stroke={C.recovery} strokeWidth="1.5" className="pipe-r" />
          <text x="130" y="888" fontSize="5" fill={C.recovery} fontWeight="600">COT Vent Gas</text>
          <text x="130" y="896" fontSize="4" fill={txtS}>63 kSm³/d design</text>

          {/* HC Blanketing */}
          <text x="345" y="937" fontSize="6" fontWeight="600" fill="#000">HC Blanketing (Offloading Mode)</text>
          <SDVValve x={355} y={960} tag="SDV 31022" color="#000" />
          <ControlValve x={405} y={960} tag="PV" sp="" color="#000" />
          <text x="405" y="978" textAnchor="middle" fontSize="5" fill="#000">PV 31043 / PIC 21009C</text>
          <line x1="335" y1="960" x2="310" y2="960" stroke="#000" strokeWidth="1" />
          <text x="305" y="955" fontSize="4.5" fill={txtS} textAnchor="end">HC from 6DS 3100</text>
          <line x1="425" y1="960" x2="465" y2="960" stroke="#000" strokeWidth="1" />
          <text x="470" y="965" fontSize="4.5" fill={txtS}>→ COTs Header</text>
          <text x="345" y="992" fontSize="4.5" fill={txtS}>PSHH/PSLL 31004 → SDV 31022 closure</text>

          <EquipBlock x={365} y={1000} w={75} h={20} color="#555"
            lines={[{text:'IGG (Backup)',bold:true,size:5.5},{text:'Open Flare only',size:4.5,color:'#cc0000'}]} />

          <DataTag x={80} y={1008} value={`Hull: ${fmt(hullVent)}`} unit="Sm³/d" color="#c586c0" bgColor="#f5f0ff" isDark={isDark} />

          <EquipBlock x={480} y={940} w={80} h={60} color="#007acc" bg={isDark?'#1e2a3a':'#e8f4ff'}
            lines={[{text:'MODE SELECT',bold:true,size:6},{text:'HS 21009',size:5.5,color:'#007acc'},{text:'HS 21010',size:5.5,color:'#007acc'},{text:'Loading/Offload',size:5,color:'#888'},{text:'Auto sequence',size:4.5,color:'#888'}]} />


          {/* ======== SECTION 7: PRODUCED WATER ======== */}
          <rect x="580" y="660" width="360" height="105" rx="4" fill="none" stroke={border} strokeWidth="1" strokeDasharray="6,4" />
          <SectionTitle x={590} y={677} title="SYSTEM 41 — PRODUCED WATER TREATMENT" subtitle="Degassers reconnected to LP Flare (DCF scope)" />

          <EquipBlock x={600} y={698} w={95} h={30} color={C.water}
            lines={[{text:'6DA 4110 A/B',bold:true,size:6},{text:'Degasser/IGF',size:5.5}]} />
          <EquipBlock x={760} y={698} w={85} h={30} color={C.water}
            lines={[{text:'6DA 4120 A/B',bold:true,size:6},{text:'Reject Surge',size:5.5}]} />

          <line x1="695" y1="713" x2="730" y2="713" stroke={C.water} strokeWidth="1" />
          <SDVValve x={718} y={713} tag="SDV 41623" color={C.water} />
          <text x="718" y="728" textAnchor="middle" fontSize="4" fill={C.water}>LSHH 41600 / PSHH 41602</text>
          <line x1="730" y1="713" x2="760" y2="713" stroke={C.water} strokeWidth="1" />
          <line x1="820" y1="713" x2="850" y2="713" stroke={C.water} strokeWidth="1" />
          <line x1="850" y1="713" x2="850" y2="645" stroke={C.water} strokeWidth="0.8" />
          <text x="855" y="655" fontSize="4" fill={C.water}>→ LP Flare Header</text>
          <text x="600" y="744" fontSize="4.5" fill={txtS}>Restriction orifice on gas outlet | PSVs → HP Flare</text>


          {/* ======== RECOVERY SUMMARY ======== */}
          <g transform="translate(1120,780)">
            <rect x="-160" y="-30" width="320" height="130" rx="6"
              fill={isDark?'#1a2a1a':'#f0fff8'} stroke={C.gas} strokeWidth="1.5" opacity="0.95" />
            <text x="0" y="-12" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.gas}>
              MAGNOLIA CLOSED FLARE — {t.recoveryEfficiency}
            </text>
            <line x1="-140" y1="-3" x2="140" y2="-3" stroke={C.gas} strokeWidth="0.5" opacity="0.5" />
            <text x="-130" y="14" fontSize="8" fontWeight="600" fill="#f44747">{t.totalFlaring}: {fmt(totalFlaring)} Sm³/d</text>
            <text x="-130" y="29" fontSize="8" fontWeight="600" fill={C.gas}>{t.totalRecovered}: {fmt(totalRecovered)} Sm³/d</text>
            <text x="-130" y="44" fontSize="8" fontWeight="600" fill={C.accent}>{t.recoveryEfficiency}: {recoveryRate}%</text>
            <line x1="-140" y1="52" x2="140" y2="52" stroke={C.gas} strokeWidth="0.5" opacity="0.5" />
            <text x="-130" y="66" fontSize="7" fill={txtS}>CO₂ Reduction: {fmt(totalRecovered * 2.68)} tCO₂eq/yr</text>
            <text x="-130" y="78" fontSize="6.5" fontWeight="600" fill={txt}>Design Recovery Rates:</text>
            <text x="-130" y="88" fontSize="6" fill={txtS}>HP: 60 kSm³/d (~1900 kg/h) | LP: 25 kSm³/d (~970 kg/h) | COT: 63 kSm³/d</text>
            <text x="-130" y="98" fontSize="6" fill={txtS}>Total design: 148 kSm³/d → LP Compression suction</text>
          </g>


          {/* ======== CONTROL PHILOSOPHY ======== */}
          <g transform="translate(1120,920)">
            <rect x="-160" y="-10" width="320" height="180" rx="5"
              fill={isDark?'#2a2520':'#fff8f0'} stroke="#e88a3a" strokeWidth="1" opacity="0.9" />
            <text x="0" y="6" textAnchor="middle" fontSize="8" fontWeight="700" fill="#e88a3a">CONTROL PHILOSOPHY & OPERATING MODES</text>

            <text x="-145" y="22" fontSize="6" fontWeight="600" fill={txt}>Closed Flare Mode (Normal Operation):</text>
            <text x="-145" y="32" fontSize="5" fill={txtS}>• SBDV 21104/21204 → Closed (recovery active)</text>
            <text x="-145" y="41" fontSize="5" fill={txtS}>• SDV 21105/21205 → Open (recovery lines open)</text>
            <text x="-145" y="50" fontSize="5" fill={txtS}>• SDV 21001 → Open (blower discharge → LP Comp)</text>
            <text x="-145" y="59" fontSize="5" fill={txtS}>• SDV 21002/21801 → Per duty blower selection</text>
            <text x="-145" y="68" fontSize="5" fill={txtS}>• PV 21006 fully open | PV 21016 fully open</text>

            <text x="-145" y="82" fontSize="6" fontWeight="600" fill={txt}>Open Flare Mode (Emergency / IG):</text>
            <text x="-145" y="92" fontSize="5" fill={txtS}>• SBDV 21104/21204 → Open (direct to stack)</text>
            <text x="-145" y="101" fontSize="5" fill={txtS}>• SDV 21105/21205 → Closed (recovery isolated)</text>
            <text x="-145" y="110" fontSize="5" fill={txtS}>• Trigger: PSHH 2oo3, O₂ HH (AT 21005), FSLL purge</text>

            <text x="-145" y="124" fontSize="6" fontWeight="600" fill={txt}>Loading Mode (HS 21010):</text>
            <text x="-145" y="134" fontSize="5" fill={txtS}>• Blower active (PIC 21009 speed control)</text>
            <text x="-145" y="143" fontSize="5" fill={txtS}>• SDV 31022 closed, PV 31043 closed</text>

            <text x="-145" y="155" fontSize="6" fontWeight="600" fill={txt}>Offloading Mode (HS 21010):</text>
            <text x="-145" y="165" fontSize="5" fill={txtS}>• Blower stopped, SDV 31022 open</text>
          </g>


          {/* ======== TITLE BLOCK ======== */}
          <g transform="translate(950,20)">
            <rect x="0" y="0" width="385" height="75" rx="3" fill={isDark?'#252526':'#f8f8f8'} stroke={border} strokeWidth="1" />
            <line x1="200" y1="0" x2="200" y2="75" stroke={border} strokeWidth="0.5" />
            <line x1="0" y1="24" x2="385" y2="24" stroke={border} strokeWidth="0.5" />
            <text x="100" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill={txt}>MAGNOLIA FPSO</text>
            <text x="100" y="38" textAnchor="middle" fontSize="6" fill={txtS}>Block 17 — Offshore Angola</text>
            <text x="100" y="50" textAnchor="middle" fontSize="6" fill={txtS}>Closed Flare Gas Recovery System</text>
            <text x="100" y="62" textAnchor="middle" fontSize="5.5" fill={txtS}>Process Description & Control Philosophy</text>
            <text x="100" y="72" textAnchor="middle" fontSize="5" fill={txtS}>Ref: SOFTWARE.docx — Rev. DCF</text>
            <text x="292" y="16" textAnchor="middle" fontSize="7" fontWeight="600" fill={txt}>DESIGN CAPACITY</text>
            <text x="292" y="35" textAnchor="middle" fontSize="6" fill={txtS}>Oil: 264 kbopd | Water: 360 kbwpd</text>
            <text x="292" y="47" textAnchor="middle" fontSize="6" fill={txtS}>Liquid: 405 kblpd | 2×50% Trains</text>
            <text x="292" y="59" textAnchor="middle" fontSize="6" fill={txtS}>Depth: 1200-1400m | 82 Wells (Dec 2017)</text>
            <text x="292" y="71" textAnchor="middle" fontSize="5.5" fill={txtS}>First Oil: Dec 2006 | 5 Reservoirs</text>
          </g>

        </svg>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="card border-l-4 border-l-[#f44747] p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t.totalFlaring}</div>
          <div className="text-lg font-bold" style={{color:'#f44747'}}>{fmt(totalFlaring)} Sm³/d</div>
          <div className="text-[10px] text-gray-400">HP + LP + Hull Vent</div>
        </div>
        <div className="card border-l-4 border-l-[#4ec9b0] p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t.totalRecovered}</div>
          <div className="text-lg font-bold" style={{color:'#4ec9b0'}}>{fmt(totalRecovered)} Sm³/d</div>
          <div className="text-[10px] text-gray-400">→ LP Compression suction</div>
        </div>
        <div className="card border-l-4 border-l-[#007acc] p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t.recoveryEfficiency}</div>
          <div className="text-lg font-bold" style={{color:'#007acc'}}>{recoveryRate}%</div>
          <div className="text-[10px] text-gray-400">Design: HP 60k + LP 25k + COT 63k</div>
        </div>
        <div className="card border-l-4 border-l-[#dcdcaa] p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t.emissionReduction}</div>
          <div className="text-lg font-bold" style={{color:'#dcdcaa'}}>{fmt(totalRecovered * 2.68)} tCO₂eq/yr</div>
          <div className="text-[10px] text-gray-400">COP21 / CPY Climate Strategy</div>
        </div>
        <div className="card border-l-4 border-l-[#c586c0] p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Hull Vent Recovery</div>
          <div className="text-lg font-bold" style={{color:'#c586c0'}}>{fmt(hullVent)} Sm³/d</div>
          <div className="text-[10px] text-gray-400">COT → 6KA 2140 → LP Comp</div>
        </div>
      </div>
    </div>
  );
}
