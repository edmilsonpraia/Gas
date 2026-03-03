import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { EmissionCalculator } from '../utils/calculations';
import { NumberFormatter } from '../utils/unitConverter';
import { useLanguage } from '../contexts/LanguageContext';

/* VS Code Plotly theme */
function usePlotlyTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return {
    isDark,
    plotBg:    isDark ? '#1e1e1e' : '#ffffff',
    paperBg:   isDark ? '#252526' : '#ffffff',
    gridColor: isDark ? '#333333' : '#e5e7eb',
    textColor: isDark ? '#d4d4d4' : '#1f2937',
    subText:   isDark ? '#858585' : '#6b7280',
    font:      { family: 'Consolas, Monaco, monospace', color: isDark ? '#d4d4d4' : '#1f2937' },
    border:    isDark ? '#3e3e3e' : '#e5e7eb',
    accent:    '#007acc',
    // VS Code palette
    red:       '#f44747',
    green:     '#4ec9b0',
    blue:      '#569cd6',
    yellow:    '#dcdcaa',
    orange:    '#ce9178',
    purple:    '#c586c0',
  };
}

const plotConfig = {
  responsive: true,
  displayModeBar: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
  displaylogo: false,
  modeBarStyle: { backgroundColor: 'transparent' },
};

export default function ComparativeCharts({ data }) {
  const { t } = useLanguage();
  const T = usePlotlyTheme();

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = (reducaoEmissoes / cenarioAtual.emissoes_total) * 100;

  const reducaoLPHull = (cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull) - (cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull);
  const reducaoHP = cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare;

  const vazaoLP = data.monitoring?.totals?.totalLP || 19925;
  const vazaoHP = data.monitoring?.totals?.totalHP || 7975;
  const vazaoHull = data.monitoring?.totals?.totalHull || 40000;
  const totalFlare = vazaoLP + vazaoHP + vazaoHull;

  const vazaoLPProp = vazaoLP * 0.09;
  const vazaoHPProp = vazaoHP * 0.09;
  const vazaoHullProp = vazaoHull * 0.05;
  const totalProp = vazaoLPProp + vazaoHPProp + vazaoHullProp;

  // Monthly projection (12 months)
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
  });
  const monthlyAtual = months.map((_, i) => totalFlare * (1 + Math.sin(i / 3) * 0.04 + (Math.random() - 0.5) * 0.02));
  const monthlyProp = months.map((_, i) => {
    const ramp = Math.min(1, (i + 1) / 3);
    return totalFlare * (1 - 0.91 * ramp) + Math.sin(i / 4) * totalFlare * 0.005;
  });

  const baseLayout = {
    plot_bgcolor: T.plotBg,
    paper_bgcolor: T.paperBg,
    font: T.font,
    margin: { t: 30, b: 40, l: 60, r: 20 },
    xaxis: { gridcolor: T.gridColor, tickfont: { size: 10, color: T.subText } },
    yaxis: { gridcolor: T.gridColor, tickfont: { size: 10, color: T.subText }, tickformat: ',.0f' },
    showlegend: true,
    legend: {
      x: 0.5, xanchor: 'center', y: 1.12, orientation: 'h',
      bgcolor: 'rgba(0,0,0,0)', font: { size: 10, color: T.textColor },
    },
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Emission Reduction Bar + Emissions by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 1: Absolute Reduction — Waterfall style */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              CO2_REDUCTION.chart
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: T.isDark ? '#1a3a2a' : '#ecfdf5', color: T.green }}>
              -{reducaoPercentual.toFixed(1)}%
            </span>
          </div>
          <Plot
            data={[{
              x: [t.lpFlareHullVent || 'LP+Hull', t.hpFlare || 'HP Flare', 'TOTAL'],
              y: [reducaoLPHull, reducaoHP, reducaoEmissoes],
              type: 'bar',
              marker: {
                color: [T.green, T.blue, T.accent],
                line: { color: [T.green, T.blue, T.accent].map(c => c + 'cc'), width: 1 },
              },
              text: [reducaoLPHull, reducaoHP, reducaoEmissoes].map(v => NumberFormatter.format(v, 0)),
              textposition: 'inside',
              textfont: { color: '#ffffff', size: 12, family: 'Consolas, monospace' },
              hovertemplate: '<b>%{x}</b><br>Reduction: %{y:,.0f} tCO₂eq/yr<extra></extra>',
            }]}
            layout={{
              ...baseLayout,
              height: 300,
              showlegend: false,
              yaxis: { ...baseLayout.yaxis, title: { text: 'tCO₂eq/yr', font: { size: 10, color: T.subText } } },
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>

        {/* Chart 2: Emissions by Source — Grouped Bar */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              EMISSIONS_BY_SOURCE.chart
            </span>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: T.red }} /><span style={{ color: T.subText }}>Before</span></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: T.green }} /><span style={{ color: T.subText }}>After</span></span>
            </div>
          </div>
          <Plot
            data={[
              {
                x: [t.lpFlareHullVent || 'LP+Hull', t.hpFlare || 'HP', 'TOTAL'],
                y: [cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull, cenarioAtual.emissoes_lp_flare, cenarioAtual.emissoes_total],
                name: t.currentLabel || 'Current',
                type: 'bar',
                marker: { color: T.red, line: { color: T.red + 'aa', width: 1 } },
                text: [cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull, cenarioAtual.emissoes_lp_flare, cenarioAtual.emissoes_total].map(v => NumberFormatter.format(v, 0)),
                textposition: 'inside', textfont: { color: '#fff', size: 10, family: 'Consolas' },
              },
              {
                x: [t.lpFlareHullVent || 'LP+Hull', t.hpFlare || 'HP', 'TOTAL'],
                y: [cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, cenarioProposto.emissoes_lp_flare, cenarioProposto.emissoes_total],
                name: t.proposedLabel || 'Proposed',
                type: 'bar',
                marker: { color: T.green, line: { color: T.green + 'aa', width: 1 } },
                text: [cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, cenarioProposto.emissoes_lp_flare, cenarioProposto.emissoes_total].map(v => NumberFormatter.format(v, 0)),
                textposition: 'inside', textfont: { color: '#fff', size: 10, family: 'Consolas' },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 300,
              barmode: 'group',
              yaxis: { ...baseLayout.yaxis, title: { text: 'tCO₂eq/yr', font: { size: 10, color: T.subText } } },
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Row 2: Flow Comparison Donut + Monthly Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 3: Flow Distribution — Dual Donut */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              FLOW_DISTRIBUTION.chart
            </span>
          </div>
          <Plot
            data={[
              {
                values: [vazaoHP, vazaoLP, vazaoHull],
                labels: ['HP Flare', 'LP Flare', 'Hull Vent'],
                type: 'pie', hole: 0.55,
                domain: { x: [0, 0.45] },
                marker: { colors: [T.red, T.orange, T.purple], line: { color: T.paperBg, width: 2 } },
                textinfo: 'percent', textfont: { size: 11, color: '#fff', family: 'Consolas' },
                hovertemplate: '<b>%{label}</b><br>%{value:,.0f} Sm³/d<br>%{percent}<extra>Current</extra>',
                title: { text: `Current<br><b>${NumberFormatter.format(totalFlare / 1000, 1)}k</b>`, font: { size: 11, color: T.subText, family: 'Consolas' } },
              },
              {
                values: [vazaoHPProp, vazaoLPProp, vazaoHullProp],
                labels: ['HP Flare', 'LP Flare', 'Hull Vent'],
                type: 'pie', hole: 0.55,
                domain: { x: [0.55, 1] },
                marker: { colors: [T.blue, T.green, T.yellow], line: { color: T.paperBg, width: 2 } },
                textinfo: 'percent', textfont: { size: 11, color: '#fff', family: 'Consolas' },
                hovertemplate: '<b>%{label}</b><br>%{value:,.0f} Sm³/d<br>%{percent}<extra>Proposed</extra>',
                title: { text: `Proposed<br><b>${NumberFormatter.format(totalProp / 1000, 1)}k</b>`, font: { size: 11, color: T.subText, family: 'Consolas' } },
              },
            ]}
            layout={{
              ...baseLayout,
              height: 300,
              showlegend: true,
              legend: { ...baseLayout.legend, y: -0.05 },
              annotations: [
                { x: 0.19, y: 0.5, text: '', showarrow: false },
                { x: 0.81, y: 0.5, text: '', showarrow: false },
              ],
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>

        {/* Chart 4: 12-Month Projection — Area */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              MONTHLY_PROJECTION.chart
            </span>
            <span className="text-[10px] font-mono" style={{ color: T.subText }}>12-month forecast</span>
          </div>
          <Plot
            data={[
              {
                x: months, y: monthlyAtual,
                name: t.currentLabel || 'Current',
                type: 'scatter', mode: 'lines+markers',
                line: { color: T.red, width: 2 },
                marker: { size: 5, color: T.red },
                fill: 'tozeroy', fillcolor: T.red + '15',
              },
              {
                x: months, y: monthlyProp,
                name: t.proposedLabel || 'Proposed',
                type: 'scatter', mode: 'lines+markers',
                line: { color: T.green, width: 2.5 },
                marker: { size: 5, color: T.green, symbol: 'diamond' },
                fill: 'tozeroy', fillcolor: T.green + '15',
              },
            ]}
            layout={{
              ...baseLayout,
              height: 300,
              yaxis: { ...baseLayout.yaxis, title: { text: 'Sm³/d', font: { size: 10, color: T.subText } } },
              shapes: [{
                type: 'line', x0: months[2], x1: months[2], y0: 0, y1: Math.max(...monthlyAtual) * 1.1,
                line: { color: T.accent, width: 1, dash: 'dot' },
              }],
              annotations: [{
                x: months[2], y: Math.max(...monthlyAtual) * 1.05,
                text: 'Recovery Online', showarrow: false,
                font: { size: 9, color: T.accent, family: 'Consolas' },
              }],
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Row 3: Stacked Bar — Before/After per source + Sankey-like horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Chart 5: Stacked — Current vs Proposed Breakdown */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              FLOW_BREAKDOWN.chart
            </span>
          </div>
          <Plot
            data={[
              { x: ['Current', 'Proposed'], y: [vazaoHP, vazaoHPProp], name: 'HP Flare', type: 'bar', marker: { color: T.red } },
              { x: ['Current', 'Proposed'], y: [vazaoLP, vazaoLPProp], name: 'LP Flare', type: 'bar', marker: { color: T.orange } },
              { x: ['Current', 'Proposed'], y: [vazaoHull, vazaoHullProp], name: 'Hull Vent', type: 'bar', marker: { color: T.purple } },
            ]}
            layout={{
              ...baseLayout, height: 280, barmode: 'stack',
              yaxis: { ...baseLayout.yaxis, title: { text: 'Sm³/d', font: { size: 10, color: T.subText } } },
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>

        {/* Chart 6: Horizontal bar — Recovery Rate per source */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-2 border-b" style={{ borderColor: T.border }}>
            <span className="text-xs font-semibold font-mono" style={{ color: T.textColor }}>
              RECOVERY_RATE.chart
            </span>
          </div>
          <Plot
            data={[
              {
                y: ['HP Flare', 'LP Flare', 'Hull Vent', 'TOTAL'],
                x: [91, 91, 95, ((totalFlare - totalProp) / totalFlare * 100)],
                type: 'bar', orientation: 'h',
                marker: {
                  color: [T.blue, T.green, T.yellow, T.accent],
                  line: { width: 0 },
                },
                text: [91, 91, 95, ((totalFlare - totalProp) / totalFlare * 100)].map(v => v.toFixed(1) + '%'),
                textposition: 'inside',
                textfont: { color: '#ffffff', size: 12, family: 'Consolas, monospace' },
              },
              {
                y: ['HP Flare', 'LP Flare', 'Hull Vent', 'TOTAL'],
                x: [9, 9, 5, (totalProp / totalFlare * 100)],
                type: 'bar', orientation: 'h',
                marker: { color: T.isDark ? '#333333' : '#e5e7eb', line: { width: 0 } },
                text: [9, 9, 5, (totalProp / totalFlare * 100)].map(v => v.toFixed(1) + '%'),
                textposition: 'inside',
                textfont: { color: T.subText, size: 10, family: 'Consolas' },
                showlegend: false,
              },
            ]}
            layout={{
              ...baseLayout, height: 280, barmode: 'stack',
              showlegend: false,
              xaxis: { ...baseLayout.xaxis, range: [0, 100], title: { text: 'Recovery %', font: { size: 10, color: T.subText } } },
              yaxis: { ...baseLayout.yaxis, tickfont: { size: 11, color: T.textColor, family: 'Consolas' } },
            }}
            config={plotConfig}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
