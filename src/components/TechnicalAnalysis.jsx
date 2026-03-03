import React, { useState, useEffect } from 'react';
import {
  Beaker24Regular,
  ChartMultiple16Regular,
  ArrowTrendingDown16Regular,
  CheckmarkCircle16Regular
} from '@fluentui/react-icons';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';
import { useLanguage } from '../contexts/LanguageContext';

/* ===== Mini SVG Sub-Components (matching SystemDiagram style) ===== */

const MiniVessel = ({ x, y, w, h, label, color = '#858585' }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={h * 0.3} cy={h / 2} rx={h * 0.3} ry={h / 2} fill="none" stroke={color} strokeWidth="1.2" />
    <rect x={h * 0.3} y={0} width={w - h * 0.6} height={h} fill="none" stroke={color} strokeWidth="1.2" />
    <ellipse cx={w - h * 0.3} cy={h / 2} rx={h * 0.3} ry={h / 2} fill="none" stroke={color} strokeWidth="1.2" />
    {label && <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize="7" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

const MiniCompressor = ({ x, y, label, color = '#858585' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r="14" fill="none" stroke={color} strokeWidth="1.2" />
    <polygon points="-6,-8 8,0 -6,8" fill="none" stroke={color} strokeWidth="1" />
    {label && <text x="0" y="24" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

const MiniFlare = ({ x, y, label, color = '#f44747' }) => (
  <g transform={`translate(${x},${y})`}>
    <line x1="0" y1="0" x2="0" y2="-28" stroke={color} strokeWidth="1.5" />
    <path d="M-5,-28 Q0,-40 5,-28" fill={color} opacity="0.7" />
    <path d="M-3,-30 Q0,-38 3,-30" fill="#ff6b35" opacity="0.8" />
    {label && <text x="0" y="12" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

const MiniBlower = ({ x, y, label, color = '#858585' }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-14" y="-10" width="28" height="20" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
    <text x="0" y="4" textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>B</text>
    {label && <text x="0" y="22" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

/* ===== Main Component ===== */

export default function TechnicalAnalysis({ data }) {
  const { t } = useLanguage();
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // --- Data extraction (same as SystemDiagram) ---
  const hpFlare = data?.monitoring?.totals?.totalHP || 7975;
  const lpFlare = data?.monitoring?.totals?.totalLP || 19925;
  const hullVent = data?.monitoring?.totals?.totalHull || 40000;
  const totalFlaring = data?.monitoring?.totals?.totalFlaring || 67900;
  const hpComp = data?.compressors?.hp || { vazao: 250000, pressao: 151, temperatura: 80 };
  const lpComp = data?.compressors?.lp || { vazao: 200000, pressao: 10, temperatura: 60 };
  const blower = data?.compressors?.blower || { vazao: 250000, pressao: 1.913, temperatura: 50 };

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  // Recovery rates
  const taxaLP = 91, taxaHP = 91, taxaHull = 95;
  const gasLPRec = lpFlare * (taxaLP / 100);
  const gasHPRec = hpFlare * (taxaHP / 100);
  const gasHullRec = hullVent * (taxaHull / 100);
  const totalRecovered = gasLPRec + gasHPRec + gasHullRec;
  const totalResidual = (lpFlare - gasLPRec) + (hpFlare - gasHPRec) + (hullVent - gasHullRec);
  const recoveryRate = totalFlaring > 0 ? ((totalRecovered / totalFlaring) * 100) : 0;

  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = cenarioAtual.emissoes_total > 0 ? (reducaoEmissoes / cenarioAtual.emissoes_total) * 100 : 0;

  // Monte Carlo
  const calcMC = (tH, tL, tHP) => {
    const gH = hullVent * (tH / 100), gL = lpFlare * (tL / 100), gHP = hpFlare * (tHP / 100);
    const total = gH + gL + gHP;
    const rH = hullVent - gH, rL = lpFlare - gL, rHP = hpFlare - gHP;
    const eL = rL * 365 * 2.75 / 1000, eHP = rHP * 365 * 2.75 / 1000, eH = rH * 365 * 0.679 / 1000;
    const eTotal = eL + eHP + eH;
    return { total, eTotal, reducao: cenarioAtual.emissoes_total - eTotal, rate: (total / totalFlaring * 100) };
  };

  const mc = {
    pessimista: { ...calcMC(90, 85, 85), prob: 15, tH: 90, tL: 85, tHP: 85 },
    realista:   { ...calcMC(95, 91, 91), prob: 70, tH: 95, tL: 91, tHP: 91 },
    otimista:   { ...calcMC(98, 95, 95), prob: 15, tH: 98, tL: 95, tHP: 95 },
  };

  // Theme
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const bgCard = isDark ? '#252526' : '#f8f8f8';
  const border = isDark ? '#3e3e3e' : '#e5e7eb';
  const txt = isDark ? '#d4d4d4' : '#1f2937';
  const txtS = isDark ? '#858585' : '#6b7280';
  const accent = '#007acc';
  const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

  const C = { flare: '#f44747', gas: '#4ec9b0', recovery: '#e88a3a', accent: '#007acc', warn: '#dcdcaa', purple: '#c586c0' };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="card border-l-2 border-l-vs-accent">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Beaker24Regular className="text-vs-accent" />
              <h2 className="text-xl font-bold" style={{ color: txt }}>{t.analysis}</h2>
            </div>
            <p className="text-xs mt-0.5" style={{ color: txtS }}>
              MAGNOLIA FPSO — Gas Recovery System — Performance & Emissions Analysis
            </p>
          </div>
        </div>
      </div>

      {/* Mini Process Flow Diagram */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2 border-b" style={{ borderColor: border }}>
          <span className="text-xs font-semibold" style={{ color: txtS }}>PROCESS FLOW — RECOVERY OVERVIEW</span>
        </div>
        <div className="flex justify-center p-4" style={{ backgroundColor: bg }}>
          <svg viewBox="0 0 700 160" className="w-full max-w-3xl" style={{ maxHeight: 160 }}>
            {/* Sources */}
            <MiniFlare x={80} y={60} label="HP Flare" color={C.flare} />
            <MiniFlare x={180} y={60} label="LP Flare" color={C.flare} />
            <MiniVessel x={250} y={45} w={60} h={30} label="COT" color={txtS} />

            {/* Arrows to recovery */}
            <line x1="95" y1="60" x2="130" y2="90" stroke={C.recovery} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arA)" />
            <line x1="195" y1="60" x2="230" y2="90" stroke={C.recovery} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arA)" />
            <line x1="310" y1="60" x2="340" y2="90" stroke={C.recovery} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arA)" />

            {/* Recovery equipment */}
            <MiniBlower x={180} y={110} label="6KA 2140" color={C.purple} />
            <MiniCompressor x={320} y={110} label="LP Comp" color={C.gas} />
            <MiniCompressor x={440} y={110} label="HP Comp" color={C.gas} />

            {/* Flow arrows */}
            <line x1="200" y1="110" x2="296" y2="110" stroke={C.gas} strokeWidth="1.5" markerEnd="url(#arG)" />
            <line x1="340" y1="110" x2="416" y2="110" stroke={C.gas} strokeWidth="1.5" markerEnd="url(#arG)" />
            <line x1="460" y1="110" x2="520" y2="110" stroke={C.gas} strokeWidth="1.5" markerEnd="url(#arG)" />

            {/* Export */}
            <rect x="530" y="96" width="80" height="28" rx="4" fill="none" stroke={C.gas} strokeWidth="1.2" />
            <text x="570" y="113" textAnchor="middle" fontSize="8" fontWeight="600" fill={C.gas}>Export Gas</text>

            {/* Data labels */}
            <text x="80" y={20} textAnchor="middle" fontSize="7" fontWeight="600" fill={C.flare}>{fmt(hpFlare)} Sm³/d</text>
            <text x="180" y={20} textAnchor="middle" fontSize="7" fontWeight="600" fill={C.flare}>{fmt(lpFlare)} Sm³/d</text>
            <text x="280" y={35} textAnchor="middle" fontSize="7" fontWeight="600" fill={txtS}>{fmt(hullVent)} Sm³/d</text>
            <text x="570" y={90} textAnchor="middle" fontSize="7" fontWeight="600" fill={C.gas}>{fmt(totalRecovered)} Sm³/d</text>

            {/* Markers */}
            <defs>
              <marker id="arA" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto">
                <path d="M0,0L8,3L0,6Z" fill={C.recovery} />
              </marker>
              <marker id="arG" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto">
                <path d="M0,0L8,3L0,6Z" fill={C.gas} />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'Total Flaring', value: fmt(totalFlaring), unit: 'Sm³/d', color: C.flare, border: '#f44747' },
          { label: t.totalRecovered || 'Recovered', value: fmt(totalRecovered), unit: 'Sm³/d', color: C.gas, border: '#4ec9b0' },
          { label: t.recoveryEfficiency || 'Recovery', value: recoveryRate.toFixed(1), unit: '%', color: C.accent, border: '#007acc' },
          { label: t.emissionReduction || 'CO₂ Reduction', value: fmt(reducaoEmissoes), unit: 'tCO₂eq/yr', color: C.warn, border: '#dcdcaa' },
          { label: 'Residual', value: fmt(totalResidual), unit: 'Sm³/d', color: C.purple, border: '#c586c0' },
        ].map((k, i) => (
          <div key={i} className="card p-3" style={{ borderLeft: `3px solid ${k.border}` }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: txtS }}>{k.label}</div>
            <div className="text-lg font-bold mt-0.5" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px]" style={{ color: txtS }}>{k.unit}</div>
          </div>
        ))}
      </div>

      {/* Mass Balance + Emissions — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Mass Balance */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: border }}>
            <CheckmarkCircle16Regular style={{ color: C.gas }} />
            <span className="text-xs font-semibold" style={{ color: txt }}>{t.massBalance || 'MASS BALANCE'}</span>
          </div>
          <div className="p-4 space-y-2">
            {/* Recovered */}
            <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: C.gas }}>
              {t.gasRecoveredLabel || 'Gas Recovered'}
            </div>
            {[
              { label: 'HP Flare', value: gasHPRec, rate: taxaHP },
              { label: 'LP Flare', value: gasLPRec, rate: taxaLP },
              { label: 'Hull Vent', value: gasHullRec, rate: taxaHull },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b" style={{ borderColor: border }}>
                <span className="text-xs" style={{ color: txt }}>{r.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold" style={{ color: C.gas }}>{fmt(r.value)} Sm³/d</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: isDark ? '#1a3a2a' : '#ecfdf5', color: C.gas }}>-{r.rate}%</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold" style={{ color: txt }}>TOTAL</span>
              <span className="text-sm font-bold font-mono" style={{ color: C.gas }}>{fmt(totalRecovered)} Sm³/d</span>
            </div>

            {/* Separator */}
            <div className="border-t my-2" style={{ borderColor: border }} />

            {/* Residual */}
            <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: C.flare }}>
              {t.residualEmissions || 'Residual (still flared)'}
            </div>
            {[
              { label: 'HP Flare', value: hpFlare - gasHPRec },
              { label: 'LP Flare', value: lpFlare - gasLPRec },
              { label: 'Hull Vent', value: hullVent - gasHullRec },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b" style={{ borderColor: border }}>
                <span className="text-xs" style={{ color: txt }}>{r.label}</span>
                <span className="text-xs font-mono" style={{ color: C.flare }}>{fmt(r.value)} Sm³/d</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold" style={{ color: txt }}>TOTAL</span>
              <span className="text-sm font-bold font-mono" style={{ color: C.flare }}>{fmt(totalResidual)} Sm³/d</span>
            </div>
          </div>
        </div>

        {/* Emissions Comparison */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: border }}>
            <ArrowTrendingDown16Regular style={{ color: C.gas }} />
            <span className="text-xs font-semibold" style={{ color: txt }}>{t.emissionsComparison || 'EMISSIONS COMPARISON'}</span>
          </div>
          <div className="p-4">
            {/* Table */}
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  <th className="text-left py-1.5 font-semibold" style={{ color: txtS }}>{t.source || 'Source'}</th>
                  <th className="text-right py-1.5 font-semibold" style={{ color: C.flare }}>{t.before || 'Before'}</th>
                  <th className="text-right py-1.5 font-semibold" style={{ color: C.gas }}>{t.after || 'After'}</th>
                  <th className="text-right py-1.5 font-semibold" style={{ color: txtS }}>{t.reduction || 'Reduction'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'LP Flare + Hull',
                    before: cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull,
                    after: cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull,
                  },
                  {
                    label: 'HP Flare',
                    before: cenarioAtual.emissoes_lp_flare,
                    after: cenarioProposto.emissoes_lp_flare,
                  },
                ].map((row, i) => {
                  const red = row.before > 0 ? ((row.before - row.after) / row.before * 100) : 0;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                      <td className="py-1.5" style={{ color: txt }}>{row.label}</td>
                      <td className="text-right py-1.5 font-mono" style={{ color: C.flare }}>{NumberFormatter.format(row.before, 0)}</td>
                      <td className="text-right py-1.5 font-mono" style={{ color: C.gas }}>{NumberFormatter.format(row.after, 0)}</td>
                      <td className="text-right py-1.5 font-mono font-semibold" style={{ color: C.gas }}>-{red.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2 font-bold" style={{ color: txt }}>TOTAL</td>
                  <td className="text-right py-2 font-mono font-bold" style={{ color: C.flare }}>{NumberFormatter.format(cenarioAtual.emissoes_total, 0)}</td>
                  <td className="text-right py-2 font-mono font-bold" style={{ color: C.gas }}>{NumberFormatter.format(cenarioProposto.emissoes_total, 0)}</td>
                  <td className="text-right py-2 font-mono font-bold" style={{ color: C.gas }}>-{reducaoPercentual.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>

            {/* Reduction banner */}
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: isDark ? '#1a2a1a' : '#f0fdf4', border: `1px solid ${isDark ? '#2a4a2a' : '#bbf7d0'}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: txtS }}>{t.reductionLabel || 'Annual Reduction'}</div>
                  <div className="text-lg font-bold" style={{ color: C.gas }}>{NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/yr</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: C.gas }}>-{reducaoPercentual.toFixed(1)}%</div>
              </div>
            </div>

            {/* Unit: tCO₂eq/yr */}
            <div className="mt-2 text-right">
              <span className="text-[10px]" style={{ color: txtS }}>Unit: tCO₂eq/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Sizing */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2 border-b" style={{ borderColor: border }}>
          <span className="text-xs font-semibold" style={{ color: txt }}>EQUIPMENT — RECOVERY SYSTEM</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { tag: '6KB 5230A', name: 'HP Compressor', data: hpComp, color: C.gas },
              { tag: '6KB 5110', name: 'LP Compressor', data: lpComp, color: C.gas },
              { tag: '6KA 2140', name: 'Hull Vent Blower', data: blower, color: C.purple },
            ].map((eq, i) => (
              <div key={i} className="p-3 rounded" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: eq.color }}>{eq.tag}</span>
                  <span className="text-[10px]" style={{ color: txtS }}>{eq.name}</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Flow', value: `${fmt(eq.data.vazao)} Sm³/d` },
                    { label: 'Pressure', value: `${eq.data.pressao} bar` },
                    { label: 'Temp', value: `${eq.data.temperatura} °C` },
                  ].map((p, j) => (
                    <div key={j} className="flex justify-between text-xs">
                      <span style={{ color: txtS }}>{p.label}</span>
                      <span className="font-mono font-semibold" style={{ color: txt }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monte Carlo */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <ChartMultiple16Regular style={{ color: accent }} />
            <span className="text-xs font-semibold" style={{ color: txt }}>{t.monteCarloAnalysis || 'PROBABILISTIC ANALYSIS'}</span>
          </div>
          <button
            onClick={() => setShowMonteCarlo(!showMonteCarlo)}
            className="px-3 py-1 text-[10px] font-semibold rounded transition-colors"
            style={{
              backgroundColor: isDark ? '#264f78' : '#007acc',
              color: '#ffffff',
            }}
          >
            {showMonteCarlo ? (t.hideSimulation || 'Hide') : (t.showSimulation || 'Show')}
          </button>
        </div>

        {showMonteCarlo && (
          <div className="p-4 space-y-3 animate-fade-in">
            {/* 3 scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'pessimista', label: t.pessimistic || 'Conservative', color: '#e88a3a', bg: isDark ? '#2a2210' : '#fff7ed' },
                { key: 'realista', label: t.realistic || 'Expected', color: '#007acc', bg: isDark ? '#102030' : '#eff6ff' },
                { key: 'otimista', label: t.optimistic || 'Optimistic', color: '#4ec9b0', bg: isDark ? '#102a20' : '#ecfdf5' },
              ].map((s) => {
                const d = mc[s.key];
                return (
                  <div key={s.key} className="p-3 rounded" style={{ backgroundColor: s.bg, border: `1px solid ${border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: isDark ? '#333' : '#f3f4f6', color: txtS }}>
                        P{d.prob}%
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between" style={{ color: txtS }}>
                        <span>Hull / LP / HP</span>
                        <span className="font-mono font-semibold" style={{ color: s.color }}>{d.tH}% / {d.tL}% / {d.tHP}%</span>
                      </div>
                      <div className="border-t my-1" style={{ borderColor: border }} />
                      <div className="flex justify-between">
                        <span style={{ color: txtS }}>Recovered</span>
                        <span className="font-mono font-semibold" style={{ color: s.color }}>{(d.total / 1000).toFixed(1)} kSm³/d</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: txtS }}>Rate</span>
                        <span className="font-mono font-semibold" style={{ color: s.color }}>{d.rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: txtS }}>CO₂ Reduction</span>
                        <span className="font-mono font-semibold" style={{ color: C.gas }}>{fmt(d.reducao)} t/yr</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Range summary bar */}
            <div className="p-3 rounded" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
              <div className="text-[10px] uppercase tracking-wide mb-2" style={{ color: txtS }}>RECOVERY RANGE</div>
              <div className="relative h-6 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#333' : '#e5e7eb' }}>
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${mc.pessimista.rate * 0.9}%`,
                    width: `${(mc.otimista.rate - mc.pessimista.rate) * 0.9 + 5}%`,
                    background: `linear-gradient(90deg, #e88a3a, #007acc, #4ec9b0)`,
                    opacity: 0.8,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold" style={{ color: isDark ? '#fff' : '#1f2937' }}>
                    {mc.pessimista.rate.toFixed(1)}% — {mc.realista.rate.toFixed(1)}% — {mc.otimista.rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
