import React, { useState, useEffect } from 'react';
import {
  Document24Regular,
  ArrowDownload16Regular,
  Table16Regular,
  Code16Regular,
  DocumentPdf16Regular,
  CheckmarkCircle16Regular,
  Clock16Regular,
  Info16Regular,
} from '@fluentui/react-icons';
import { EmissionCalculator } from '../utils/calculations';
import { NumberFormatter } from '../utils/unitConverter';
import { useLanguage } from '../contexts/LanguageContext';

export default function ReportsPanel({ data, onExport }) {
  const { t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [activePreview, setActivePreview] = useState('summary');

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Data extraction
  const hpFlare = data?.monitoring?.totals?.totalHP || 7975;
  const lpFlare = data?.monitoring?.totals?.totalLP || 19925;
  const hullVent = data?.monitoring?.totals?.totalHull || 40000;
  const totalFlaring = data?.monitoring?.totals?.totalFlaring || 67900;
  const hpComp = data?.compressors?.hp || { vazao: 250000, pressao: 151, temperatura: 80 };
  const lpComp = data?.compressors?.lp || { vazao: 200000, pressao: 10, temperatura: 60 };
  const blower = data?.compressors?.blower || { vazao: 250000, pressao: 1.913, temperatura: 50 };

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const taxaLP = 91, taxaHP = 91, taxaHull = 95;
  const totalRecovered = lpFlare * taxaLP / 100 + hpFlare * taxaHP / 100 + hullVent * taxaHull / 100;
  const recoveryRate = totalFlaring > 0 ? (totalRecovered / totalFlaring * 100) : 0;
  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = cenarioAtual.emissoes_total > 0 ? (reducaoEmissoes / cenarioAtual.emissoes_total * 100) : 0;

  const fmt = (n) => NumberFormatter.format(n, 0);
  const fmtD = (n, d = 2) => NumberFormatter.format(n, d);

  // Theme
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const bgCard = isDark ? '#252526' : '#f8f8f8';
  const border = isDark ? '#3e3e3e' : '#e5e7eb';
  const txt = isDark ? '#d4d4d4' : '#1f2937';
  const txtS = isDark ? '#858585' : '#6b7280';
  const C = {
    accent: '#007acc',
    keyword: '#569cd6',
    string: '#ce9178',
    number: '#b5cea8',
    func: '#dcdcaa',
    type: '#4ec9b0',
    comment: '#6a9955',
    red: '#f44747',
    purple: '#c586c0',
    orange: '#e88a3a',
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Report preview data
  const summaryLines = [
    { type: 'comment', text: `// Gas Recovery Report — MAGNOLIA FPSO` },
    { type: 'comment', text: `// Generated: ${dateStr} ${timeStr}` },
    { type: 'blank' },
    { type: 'section', text: `[EXECUTIVE SUMMARY]` },
    { type: 'blank' },
    { type: 'var', kw: 'const', name: 'totalFlaring', eq: '=', val: `${fmt(totalFlaring)} Sm³/d` },
    { type: 'var', kw: 'const', name: 'totalRecovered', eq: '=', val: `${fmt(totalRecovered)} Sm³/d` },
    { type: 'var', kw: 'const', name: 'recoveryRate', eq: '=', val: `${recoveryRate.toFixed(1)}%` },
    { type: 'blank' },
    { type: 'section', text: `[EMISSIONS COMPARISON]` },
    { type: 'blank' },
    { type: 'var', kw: 'let', name: 'emissionsBefore', eq: '=', val: `${fmtD(cenarioAtual.emissoes_total)} tCO₂eq/yr` },
    { type: 'var', kw: 'let', name: 'emissionsAfter', eq: '=', val: `${fmtD(cenarioProposto.emissoes_total)} tCO₂eq/yr` },
    { type: 'var', kw: 'let', name: 'reduction', eq: '=', val: `${fmtD(reducaoEmissoes)} tCO₂eq/yr (-${reducaoPercentual.toFixed(1)}%)` },
    { type: 'blank' },
    { type: 'section', text: `[ECONOMIC IMPACT]` },
    { type: 'blank' },
    { type: 'var', kw: 'let', name: 'envCostBefore', eq: '=', val: `${fmtD(cenarioAtual.custo_ambiental / 1000)} k USD/yr` },
    { type: 'var', kw: 'let', name: 'envCostAfter', eq: '=', val: `${fmtD(cenarioProposto.custo_ambiental / 1000)} k USD/yr` },
    { type: 'var', kw: 'let', name: 'gasRevenue', eq: '=', val: `${fmtD(cenarioProposto.receita_gas / 1000)} k USD/yr` },
  ];

  const detailLines = [
    { type: 'comment', text: `// Emissions by Source (tCO₂eq/yr)` },
    { type: 'blank' },
    { type: 'table-header', cols: ['Source', 'Before', 'After', 'Reduction'] },
    { type: 'table-sep' },
    { type: 'table-row', cols: ['LP Flare', fmtD(cenarioAtual.emissoes_lp_flare), fmtD(cenarioProposto.emissoes_lp_flare), `-${((cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare) / cenarioAtual.emissoes_lp_flare * 100).toFixed(1)}%`] },
    { type: 'table-row', cols: ['HP Flare', fmtD(cenarioAtual.emissoes_hp_flare), fmtD(cenarioProposto.emissoes_hp_flare), `-${((cenarioAtual.emissoes_hp_flare - cenarioProposto.emissoes_hp_flare) / cenarioAtual.emissoes_hp_flare * 100).toFixed(1)}%`] },
    { type: 'table-row', cols: ['Hull Vent', fmtD(cenarioAtual.emissoes_hull), fmtD(cenarioProposto.emissoes_hull), `-${((cenarioAtual.emissoes_hull - cenarioProposto.emissoes_hull) / cenarioAtual.emissoes_hull * 100).toFixed(1)}%`] },
    { type: 'table-sep' },
    { type: 'table-row', cols: ['TOTAL', fmtD(cenarioAtual.emissoes_total), fmtD(cenarioProposto.emissoes_total), `-${reducaoPercentual.toFixed(1)}%`], bold: true },
    { type: 'blank' },
    { type: 'comment', text: `// Equipment Data` },
    { type: 'blank' },
    { type: 'table-header', cols: ['Equipment', 'Flow (Sm³/d)', 'P (bar)', 'T (°C)'] },
    { type: 'table-sep' },
    { type: 'table-row', cols: ['HP Compressor', fmt(hpComp.vazao), String(hpComp.pressao), String(hpComp.temperatura)] },
    { type: 'table-row', cols: ['LP Compressor', fmt(lpComp.vazao), String(lpComp.pressao), String(lpComp.temperatura)] },
    { type: 'table-row', cols: ['Blower', fmt(blower.vazao), String(blower.pressao), String(blower.temperatura)] },
  ];

  const previewLines = activePreview === 'summary' ? summaryLines : detailLines;

  return (
    <div className="animate-fade-in space-y-3">
      {/* Header */}
      <div className="card border-l-2 border-l-vs-accent">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Document24Regular style={{ color: C.accent }} />
            <div>
              <h2 className="text-xl font-bold" style={{ color: txt }}>{t.reportsTitle}</h2>
              <p className="text-xs mt-0.5" style={{ color: txtS }}>
                MAGNOLIA FPSO — Gas Recovery System — Report Generator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: txtS }}>
            <Clock16Regular style={{ color: txtS, width: 14, height: 14 }} />
            <span>{dateStr} {timeStr}</span>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total Flaring', value: fmt(totalFlaring), unit: 'Sm³/d', color: C.red, border: C.red },
          { label: t.gasRecovered || 'Recovered', value: fmt(totalRecovered), unit: 'Sm³/d', color: C.type, border: C.type },
          { label: t.emissionReduction || 'CO₂ Reduction', value: fmtD(reducaoEmissoes), unit: 'tCO₂eq/yr', color: C.func, border: C.func },
          { label: 'Recovery Rate', value: `${recoveryRate.toFixed(1)}%`, unit: '', color: C.accent, border: C.accent },
        ].map((k, i) => (
          <div key={i} className="card p-3" style={{ borderLeft: `3px solid ${k.border}` }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: txtS }}>{k.label}</div>
            <div className="text-lg font-bold font-mono mt-0.5" style={{ color: k.color }}>{k.value}</div>
            {k.unit && <div className="text-[10px]" style={{ color: txtS }}>{k.unit}</div>}
          </div>
        ))}
      </div>

      {/* Report Preview + Export Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Code Editor Preview — 2 cols */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {/* Editor Tabs */}
          <div className="flex" style={{ backgroundColor: isDark ? '#2d2d2d' : '#ececec', borderBottom: `1px solid ${border}` }}>
            {[
              { id: 'summary', label: 'report_summary.cfg', icon: <Table16Regular style={{ width: 14, height: 14 }} /> },
              { id: 'details', label: 'report_details.dat', icon: <Code16Regular style={{ width: 14, height: 14 }} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePreview(tab.id)}
                className="px-3 py-2 flex items-center gap-1.5 text-xs transition-colors"
                style={{
                  backgroundColor: activePreview === tab.id ? (isDark ? '#1e1e1e' : '#ffffff') : 'transparent',
                  color: activePreview === tab.id ? txt : txtS,
                  borderBottom: activePreview === tab.id ? `2px solid ${C.accent}` : '2px solid transparent',
                }}
              >
                {tab.icon}
                <span className="font-mono">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Editor Content */}
          <div className="p-0 font-mono text-xs overflow-x-auto" style={{ backgroundColor: isDark ? '#1e1e1e' : '#fafafa', minHeight: 300 }}>
            {previewLines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/5 leading-5">
                <span className="w-10 text-right pr-3 select-none shrink-0 border-r" style={{ color: isDark ? '#444' : '#ccc', borderColor: isDark ? '#333' : '#e5e7eb' }}>
                  {i + 1}
                </span>
                <span className="pl-3">
                  {line.type === 'blank' ? '\u00A0' :
                   line.type === 'comment' ? <span style={{ color: C.comment }}>{line.text}</span> :
                   line.type === 'section' ? <span style={{ color: C.purple }}>{line.text}</span> :
                   line.type === 'var' ? (
                     <>
                       <span style={{ color: C.keyword }}>{line.kw} </span>
                       <span style={{ color: C.type }}>{line.name}</span>
                       <span style={{ color: txtS }}> {line.eq} </span>
                       <span style={{ color: C.number }}>{line.val}</span>
                     </>
                   ) :
                   line.type === 'table-header' ? (
                     <span style={{ color: C.func }}>
                       {line.cols.map((c, j) => c.padEnd(j === 0 ? 16 : 14)).join('')}
                     </span>
                   ) :
                   line.type === 'table-sep' ? (
                     <span style={{ color: isDark ? '#444' : '#ccc' }}>{'─'.repeat(58)}</span>
                   ) :
                   line.type === 'table-row' ? (
                     <span style={{ color: line.bold ? C.func : txt, fontWeight: line.bold ? 700 : 400 }}>
                       {line.cols.map((c, j) => c.padEnd(j === 0 ? 16 : 14)).join('')}
                     </span>
                   ) : null}
                </span>
              </div>
            ))}
          </div>

          {/* Status Bar */}
          <div className="px-3 py-1 flex items-center justify-between text-[10px] font-mono" style={{ backgroundColor: isDark ? '#007acc' : '#007acc', color: '#ffffff' }}>
            <div className="flex items-center gap-3">
              <span>MAGNOLIA FPSO</span>
              <span>Gas Recovery Report</span>
            </div>
            <div className="flex items-center gap-3">
              <span>UTF-8</span>
              <span>{previewLines.length} lines</span>
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* Export Actions — 1 col */}
        <div className="space-y-3">
          {/* Export Cards */}
          {[
            {
              icon: <Table16Regular />,
              title: t.exportExcelBtn || 'Export Excel',
              desc: t.exportExcelDesc || 'Complete report with Summary and Technical Details sheets',
              format: 'excel',
              ext: '.xlsx',
              color: C.type,
              bg: isDark ? '#1e302e' : '#ecfdf5',
              status: 'ready',
            },
            {
              icon: <Code16Regular />,
              title: t.exportJSONBtn || 'Export JSON',
              desc: t.exportJSONDesc || 'Structured data export for integration with other systems',
              format: 'json',
              ext: '.json',
              color: C.func,
              bg: isDark ? '#2a2810' : '#fffbeb',
              status: 'ready',
            },
            {
              icon: <DocumentPdf16Regular />,
              title: t.exportPDFBtn || 'Export PDF',
              desc: t.exportPDFDesc || 'Formatted PDF report for stakeholder presentation',
              format: 'pdf',
              ext: '.pdf',
              color: C.red,
              bg: isDark ? '#2e1e1e' : '#fef2f2',
              status: 'dev',
            },
          ].map((exp) => (
            <button
              key={exp.format}
              onClick={() => onExport(exp.format)}
              className="w-full text-left rounded overflow-hidden transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ border: `1px solid ${border}` }}
            >
              {/* Header */}
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6', borderBottom: `1px solid ${border}` }}>
                <span style={{ color: exp.color }}>{exp.icon}</span>
                <span className="text-xs font-semibold flex-1" style={{ color: txt }}>{exp.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: exp.bg, color: exp.color }}>
                  {exp.ext}
                </span>
              </div>
              {/* Body */}
              <div className="px-3 py-3" style={{ backgroundColor: bg }}>
                <p className="text-[11px] leading-relaxed mb-2" style={{ color: txtS }}>{exp.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {exp.status === 'ready' ? (
                      <>
                        <CheckmarkCircle16Regular style={{ color: C.type, width: 14, height: 14 }} />
                        <span className="text-[10px] font-semibold" style={{ color: C.type }}>Ready</span>
                      </>
                    ) : (
                      <>
                        <Info16Regular style={{ color: C.orange, width: 14, height: 14 }} />
                        <span className="text-[10px] font-semibold" style={{ color: C.orange }}>In Development</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1" style={{ color: C.accent }}>
                    <ArrowDownload16Regular style={{ width: 14, height: 14 }} />
                    <span className="text-[10px] font-semibold">Download</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Report Info */}
          <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6', borderBottom: `1px solid ${border}` }}>
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtS }}>Report Contents</span>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { icon: '1', text: t.reportSheet1 || 'Executive Summary — Key metrics & comparison' },
                { icon: '2', text: t.reportSheet2 || 'Emissions by Source — LP/HP Flare & Hull Vent' },
                { icon: '3', text: t.reportSheet3 || 'Equipment Data — Compressors & Blower specs' },
                { icon: '4', text: t.reportSheet4 || 'Economic Impact — Costs & Revenue projections' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="font-mono font-bold shrink-0 w-4 text-center" style={{ color: C.number }}>{item.icon}</span>
                  <span style={{ color: txt }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
