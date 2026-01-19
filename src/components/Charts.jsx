import React from 'react';
import Plot from 'react-plotly.js';
import { EmissionCalculator } from '../utils/calculations';

/**
 * Gráfico de comparação de vazões
 */
export function FlowComparisonChart({ data }) {
  const plotData = [
    {
      x: ['HP Comp 1', 'HP Comp 2', 'LP Comp 3', 'LP Comp 4'],
      y: [
        data.monitoring?.hpFlare?.comp1 || 0,
        data.monitoring?.hpFlare?.comp2 || 0,
        data.monitoring?.lpFlare?.comp3 || 0,
        data.monitoring?.lpFlare?.comp4 || 0
      ],
      type: 'bar',
      marker: {
        color: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
        line: {
          color: '#991b1b',
          width: 1.5
        }
      },
      text: [
        data.monitoring?.hpFlare?.comp1?.toLocaleString('pt-BR') || '0',
        data.monitoring?.hpFlare?.comp2?.toLocaleString('pt-BR') || '0',
        data.monitoring?.lpFlare?.comp3?.toLocaleString('pt-BR') || '0',
        data.monitoring?.lpFlare?.comp4?.toLocaleString('pt-BR') || '0'
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>%{y:,.0f} Sm³/d<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Comparação de Vazões - HP/LP Flare',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Componentes', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Vazão (Sm³/d)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif', size: 10 }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de pizza - Distribuição HP vs LP
 */
export function HPLPDistributionChart({ data }) {
  const totalHP = data.monitoring?.totals?.totalHP || 0;
  const totalLP = data.monitoring?.totals?.totalLP || 0;

  const plotData = [
    {
      values: [totalHP, totalLP],
      labels: ['HP Flare', 'LP Flare'],
      type: 'pie',
      marker: {
        colors: ['#dc2626', '#f87171']
      },
      textinfo: 'label+percent+value',
      texttemplate: '<b>%{label}</b><br>%{value:,.0f} Sm³/d<br>(%{percent})',
      hovertemplate: '<b>%{label}</b><br>%{value:,.0f} Sm³/d<br>%{percent}<extra></extra>',
      hole: 0.4
    }
  ];

  const layout = {
    title: {
      text: 'Distribuição HP vs LP Flare',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    annotations: [
      {
        text: `<b>${(totalHP + totalLP).toLocaleString('pt-BR')}</b><br>Sm³/d`,
        font: { size: 16, weight: 700 },
        showarrow: false,
        x: 0.5,
        y: 0.5
      }
    ],
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 80, r: 40, b: 40, l: 40 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de linha - Pressão vs Temperatura dos Compressores
 */
export function PressureTempChart({ data }) {
  const plotData = [
    {
      x: ['HP Compressor', 'LP Compressor', 'Blower'],
      y: [
        data.compressors?.hp?.pressao || 0,
        data.compressors?.lp?.pressao || 0,
        data.compressors?.blower?.pressao || 0
      ],
      name: 'Pressão',
      type: 'bar',
      yaxis: 'y',
      marker: {
        color: '#3b82f6',
        line: { color: '#1e40af', width: 1.5 }
      },
      hovertemplate: '<b>%{x}</b><br>Pressão: %{y:.2f} bar<extra></extra>'
    },
    {
      x: ['HP Compressor', 'LP Compressor', 'Blower'],
      y: [
        data.compressors?.hp?.temperatura || 0,
        data.compressors?.lp?.temperatura || 0,
        data.compressors?.blower?.temperatura || 0
      ],
      name: 'Temperatura',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y2',
      marker: { color: '#ef4444', size: 12, line: { color: '#991b1b', width: 2 } },
      line: { color: '#ef4444', width: 3 },
      hovertemplate: '<b>%{x}</b><br>Temperatura: %{y:.1f} °C<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Pressão e Temperatura dos Compressores',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Equipamentos', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Pressão (bar)', font: { size: 11, weight: 500 } },
      side: 'left',
      gridcolor: '#e5e7eb'
    },
    yaxis2: {
      title: { text: 'Temperatura (°C)', font: { size: 11, weight: 500 } },
      overlaying: 'y',
      side: 'right',
      gridcolor: '#f3f4f6'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 80, b: 60, l: 80 },
    height: 280,
    legend: {
      x: 0.5,
      xanchor: 'center', 
      y: 1.15,
      orientation: 'h',
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#d1d5db',
      borderwidth: 1
    },
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de vazões dos compressores
 */
export function CompressorFlowChart({ data }) {
  const plotData = [
    {
      x: ['HP Compressor', 'LP Compressor', 'Blower'],
      y: [
        data.compressors?.hp?.vazao || 0,
        data.compressors?.lp?.vazao || 0,
        data.compressors?.blower?.vazao || 0
      ],
      type: 'bar',
      marker: {
        color: ['#dc2626', '#f87171', '#fca5a5'],
        line: {
          color: '#991b1b',
          width: 1.5
        }
      },
      text: [
        (data.compressors?.hp?.vazao || 0).toLocaleString('pt-BR'),
        (data.compressors?.lp?.vazao || 0).toLocaleString('pt-BR'),
        (data.compressors?.blower?.vazao || 0).toLocaleString('pt-BR')
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>%{y:,.0f} Sm³/d<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Vazões dos Compressores',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Equipamentos', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Vazão (Sm³/d)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Série Temporal - Projeção de Vazões
 */
export function TimeSeriesChart({ data }) {
  const totalFlaring = (data.monitoring?.totals?.totalFlaring || 44000);

  // Simular dados históricos e projeção
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anos = [2024, 2025, 2026];
  const xData = [];
  const historico = [];
  const projecao = [];
  const limite = [];

  // Gerar dados
  anos.forEach((ano, anoIdx) => {
    meses.forEach((mes, mesIdx) => {
      const dataLabel = `${mes}/${ano}`;
      xData.push(dataLabel);
      limite.push(61000);

      if (anoIdx === 0) {
        // Dados históricos 2024
        const variacao = (Math.sin(mesIdx / 2) * 3000) + (Math.random() * 2000 - 1000);
        historico.push(totalFlaring + variacao);
        projecao.push(null);
      } else if (anoIdx === 1) {
        // Dados históricos 2025
        const tendencia = -500 * mesIdx;
        const variacao = (Math.sin(mesIdx / 2) * 2500) + (Math.random() * 1500 - 750);
        historico.push(totalFlaring + tendencia + variacao);
        projecao.push(null);
      } else {
        // Projeção 2026
        historico.push(null);
        const tendencia = -1200 * mesIdx;
        const variacao = (Math.sin(mesIdx / 2) * 2000) + (Math.random() * 1000 - 500);
        projecao.push(Math.max(20000, totalFlaring + tendencia + variacao));
      }
    });
  });

  const plotData = [
    {
      x: xData,
      y: historico,
      name: 'Histórico',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#3b82f6', width: 3 },
      marker: { size: 6, color: '#3b82f6' },
      hovertemplate: '<b>%{x}</b><br>%{y:,.0f} Sm³/d<extra></extra>'
    },
    {
      x: xData,
      y: projecao,
      name: 'Projeção',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#10b981', width: 3, dash: 'dash' },
      marker: { size: 6, color: '#10b981' },
      hovertemplate: '<b>%{x}</b><br>%{y:,.0f} Sm³/d<extra></extra>'
    },
    {
      x: xData,
      y: limite,
      name: 'Limite 61k',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dot' },
      hovertemplate: '<b>Limite</b><br>61,000 Sm³/d<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Série Temporal - Vazão de Flaring (2024-2026)',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Período', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb',
      tickangle: -45
    },
    yaxis: {
      title: { text: 'Vazão Total (Sm³/d)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 100, l: 80 },
    height: 280,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: '#d1d5db',
      borderwidth: 1
    },
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Waterfall - Análise de Contribuições
 */
export function WaterfallChart({ data }) {
  const hp1 = data.monitoring?.hpFlare?.comp1 || 0;
  const hp2 = data.monitoring?.hpFlare?.comp2 || 0;
  const lp1 = data.monitoring?.lpFlare?.comp3 || 0;
  const lp2 = data.monitoring?.lpFlare?.comp4 || 0;
  const total = hp1 + hp2 + lp1 + lp2;

  const plotData = [
    {
      x: ['HP Comp 1', 'HP Comp 2', 'LP Comp 3', 'LP Comp 4', 'Total'],
      y: [hp1, hp2, lp1, lp2, total],
      type: 'waterfall',
      orientation: 'v',
      measure: ['relative', 'relative', 'relative', 'relative', 'total'],
      text: [
        `${hp1.toLocaleString('pt-BR')}`,
        `${hp2.toLocaleString('pt-BR')}`,
        `${lp1.toLocaleString('pt-BR')}`,
        `${lp2.toLocaleString('pt-BR')}`,
        `${total.toLocaleString('pt-BR')}`
      ],
      textposition: 'outside',
      connector: {
        line: {
          color: '#64748b',
          width: 2,
          dash: 'dot'
        }
      },
      decreasing: { marker: { color: '#10b981' } },
      increasing: { marker: { color: '#dc2626' } },
      totals: { marker: { color: '#3b82f6' } },
      hovertemplate: '<b>%{x}</b><br>%{y:,.0f} Sm³/d<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Análise de Contribuições - Waterfall',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Componentes', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Vazão (Sm³/d)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Heatmap - Performance dos Equipamentos
 */
export function PerformanceHeatmap({ data }) {
  const equipamentos = ['HP Compressor', 'LP Compressor', 'Blower'];
  const parametros = ['Vazão', 'Pressão', 'Temperatura', 'Eficiência'];

  // Normalizar valores para 0-100
  const vazaoMax = 500000;
  const pressaoMax = 200;
  const tempMax = 100;

  const zData = [
    [
      ((data.compressors?.hp?.vazao || 0) / vazaoMax) * 100,
      ((data.compressors?.lp?.vazao || 0) / vazaoMax) * 100,
      ((data.compressors?.blower?.vazao || 0) / vazaoMax) * 100
    ],
    [
      ((data.compressors?.hp?.pressao || 0) / pressaoMax) * 100,
      ((data.compressors?.lp?.pressao || 0) / pressaoMax) * 100,
      ((data.compressors?.blower?.pressao || 0) / pressaoMax) * 100
    ],
    [
      ((data.compressors?.hp?.temperatura || 0) / tempMax) * 100,
      ((data.compressors?.lp?.temperatura || 0) / tempMax) * 100,
      ((data.compressors?.blower?.temperatura || 0) / tempMax) * 100
    ],
    [85, 78, 92] // Eficiência simulada
  ];

  const plotData = [
    {
      z: zData,
      x: equipamentos,
      y: parametros,
      type: 'heatmap',
      colorscale: [
        [0, '#10b981'],
        [0.5, '#fbbf24'],
        [1, '#ef4444']
      ],
      hovertemplate: '<b>%{y}</b><br>%{x}<br>%{z:.1f}%<extra></extra>',
      colorbar: {
        title: 'Performance (%)',
        titleside: 'right'
      }
    }
  ];

  const layout = {
    title: {
      text: 'Heatmap - Performance dos Equipamentos',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Equipamentos', font: { size: 11, weight: 500 } },
      side: 'bottom'
    },
    yaxis: {
      title: { text: 'Parâmetros', font: { size: 11, weight: 500 } }
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 100, b: 60, l: 100 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GRÁFICOS DE COMPARAÇÃO - SISTEMA ATUAL VS SISTEMA PROPOSTO
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Gráfico de Comparação de Emissões - Atual vs Proposto
 */
export function EmissionsComparisonChart({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const plotData = [
    {
      x: ['LP Flare', 'HP Flare', 'Hull Vent', 'Total'],
      y: [
        cenarioAtual.emissoes_lp_flare,
        cenarioAtual.emissoes_hp_flare,
        cenarioAtual.emissoes_hull,
        cenarioAtual.emissoes_total
      ],
      name: 'Sistema Atual',
      type: 'bar',
      marker: {
        color: '#dc2626',
        line: { color: '#991b1b', width: 2 }
      },
      text: [
        `${cenarioAtual.emissoes_lp_flare.toFixed(0)}`,
        `${cenarioAtual.emissoes_hp_flare.toFixed(0)}`,
        `${cenarioAtual.emissoes_hull.toFixed(0)}`,
        `${cenarioAtual.emissoes_total.toFixed(0)}`
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Sistema Atual: %{y:,.0f} tCO₂eq/ano<extra></extra>'
    },
    {
      x: ['LP Flare', 'HP Flare', 'Hull Vent', 'Total'],
      y: [
        cenarioProposto.emissoes_lp_flare,
        cenarioProposto.emissoes_hp_flare,
        cenarioProposto.emissoes_hull,
        cenarioProposto.emissoes_total
      ],
      name: 'Sistema Proposto',
      type: 'bar',
      marker: {
        color: '#10b981',
        line: { color: '#047857', width: 2 }
      },
      text: [
        `${cenarioProposto.emissoes_lp_flare.toFixed(0)}`,
        `${cenarioProposto.emissoes_hp_flare.toFixed(0)}`,
        `${cenarioProposto.emissoes_hull.toFixed(0)}`,
        `${cenarioProposto.emissoes_total.toFixed(0)}`
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Sistema Proposto: %{y:,.0f} tCO₂eq/ano<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Comparação de Emissões: Sistema Atual vs Sistema Proposto',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Fonte de Emissão', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Emissões (tCO₂eq/ano)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    barmode: 'group',
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 300,
    legend: {
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      orientation: 'h',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: '#d1d5db',
      borderwidth: 1
    },
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Redução de Emissões por Fonte
 */
export function EmissionsReductionChart({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const reducaoLP = cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare;
  const reducaoHP = cenarioAtual.emissoes_hp_flare - cenarioProposto.emissoes_hp_flare;
  const reducaoHull = cenarioAtual.emissoes_hull - cenarioProposto.emissoes_hull;
  const reducaoTotal = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;

  const percReducao = ((reducaoTotal / cenarioAtual.emissoes_total) * 100).toFixed(1);

  const plotData = [
    {
      x: ['LP Flare', 'HP Flare', 'Hull Vent'],
      y: [reducaoLP, reducaoHP, reducaoHull],
      type: 'bar',
      marker: {
        color: ['#10b981', '#059669', '#047857'],
        line: { color: '#065f46', width: 2 }
      },
      text: [
        `${reducaoLP.toFixed(0)} tCO₂eq<br>(${((reducaoLP/cenarioAtual.emissoes_lp_flare)*100).toFixed(1)}%)`,
        `${reducaoHP.toFixed(0)} tCO₂eq<br>(${((reducaoHP/cenarioAtual.emissoes_hp_flare)*100).toFixed(1)}%)`,
        `${reducaoHull.toFixed(0)} tCO₂eq<br>(${((reducaoHull/cenarioAtual.emissoes_hull)*100).toFixed(1)}%)`
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Redução: %{y:,.0f} tCO₂eq/ano<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: `Redução de Emissões por Fonte (Total: ${percReducao}%)`,
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Fonte', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Redução (tCO₂eq/ano)', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 280,
    font: { family: 'Segoe UI, sans-serif' },
    annotations: [
      {
        text: `<b>Redução Total: ${reducaoTotal.toFixed(0)} tCO₂eq/ano</b>`,
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        y: 1.1,
        xanchor: 'center',
        showarrow: false,
        font: { size: 14, color: '#047857' }
      }
    ]
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Fluxo de Gás (Sankey Diagram)
 */
export function GasFlowSankeyChart({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const vazaoTotal = cenarioAtual.vazao_lp_flare + cenarioAtual.vazao_hp_flare + cenarioAtual.vazao_hull;
  const vazaoRecuperada = cenarioProposto.vazao_recuperada || (vazaoTotal * 0.91);

  const plotData = [
    {
      type: 'sankey',
      orientation: 'h',
      node: {
        pad: 15,
        thickness: 20,
        line: { color: '#000', width: 0.5 },
        label: [
          'Gás Produzido',
          'LP Flare',
          'HP Flare',
          'Hull Vent',
          'Sistema Atual',
          'Sistema de Recuperação',
          'Flaring Residual',
          'Gás Recuperado'
        ],
        color: [
          '#3b82f6', // Gás Produzido
          '#f87171', // LP Flare
          '#dc2626', // HP Flare
          '#fca5a5', // Hull Vent
          '#ef4444', // Sistema Atual
          '#10b981', // Sistema de Recuperação
          '#fbbf24', // Flaring Residual
          '#059669'  // Gás Recuperado
        ]
      },
      link: {
        source: [0, 0, 0, 1, 2, 3, 5, 5],
        target: [1, 2, 3, 4, 4, 4, 6, 7],
        value: [
          cenarioAtual.vazao_lp_flare,
          cenarioAtual.vazao_hp_flare,
          cenarioAtual.vazao_hull,
          cenarioAtual.vazao_lp_flare,
          cenarioAtual.vazao_hp_flare,
          cenarioAtual.vazao_hull,
          vazaoTotal - vazaoRecuperada,
          vazaoRecuperada
        ],
        color: [
          'rgba(248, 113, 113, 0.4)',
          'rgba(220, 38, 38, 0.4)',
          'rgba(252, 165, 165, 0.4)',
          'rgba(239, 68, 68, 0.4)',
          'rgba(239, 68, 68, 0.4)',
          'rgba(239, 68, 68, 0.4)',
          'rgba(251, 191, 36, 0.4)',
          'rgba(5, 150, 105, 0.4)'
        ]
      }
    }
  ];

  const layout = {
    title: {
      text: 'Fluxo de Gás: Sistema Atual → Sistema Proposto',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 80, r: 40, b: 40, l: 40 },
    height: 300,
    font: { family: 'Segoe UI, sans-serif', size: 12 }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Impacto Ambiental (Equivalências)
 */
export function EnvironmentalImpactChart({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  // Equivalências ambientais
  const fatorCarro = 4.6; // tCO₂eq/ano por carro
  const fatorArvore = 0.022; // tCO₂eq/ano por árvore
  const fatorResidencia = 7.5; // tCO₂eq/ano por residência

  const carrosAtual = cenarioAtual.emissoes_total / fatorCarro;
  const carrosProposto = cenarioProposto.emissoes_total / fatorCarro;

  const arvoresAtual = cenarioAtual.emissoes_total / fatorArvore;
  const arvoresProposto = cenarioProposto.emissoes_total / fatorArvore;

  const residenciasAtual = cenarioAtual.emissoes_total / fatorResidencia;
  const residenciasProposto = cenarioProposto.emissoes_total / fatorResidencia;

  const plotData = [
    {
      x: ['Carros Equivalentes', 'Árvores Necessárias', 'Residências Equivalentes'],
      y: [carrosAtual, arvoresAtual, residenciasAtual],
      name: 'Sistema Atual',
      type: 'bar',
      marker: { color: '#dc2626', line: { color: '#991b1b', width: 2 } },
      text: [
        `${carrosAtual.toFixed(0)}`,
        `${arvoresAtual.toFixed(0)}`,
        `${residenciasAtual.toFixed(0)}`
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Sistema Atual: %{y:,.0f}<extra></extra>'
    },
    {
      x: ['Carros Equivalentes', 'Árvores Necessárias', 'Residências Equivalentes'],
      y: [carrosProposto, arvoresProposto, residenciasProposto],
      name: 'Sistema Proposto',
      type: 'bar',
      marker: { color: '#10b981', line: { color: '#047857', width: 2 } },
      text: [
        `${carrosProposto.toFixed(0)}`,
        `${arvoresProposto.toFixed(0)}`,
        `${residenciasProposto.toFixed(0)}`
      ],
      textposition: 'outside',
      hovertemplate: '<b>%{x}</b><br>Sistema Proposto: %{y:,.0f}<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Impacto Ambiental: Equivalências',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    xaxis: {
      title: { text: 'Equivalência', font: { size: 11, weight: 500 } },
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: { text: 'Quantidade', font: { size: 11, weight: 500 } },
      tickformat: ',.0f',
      gridcolor: '#e5e7eb'
    },
    barmode: 'group',
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 30, b: 60, l: 80 },
    height: 280,
    legend: {
      x: 0.5,
      xanchor: 'center',
      y: 1.15,
      orientation: 'h',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: '#d1d5db',
      borderwidth: 1
    },
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Eficiência do Sistema (Gauge)
 */
export function SystemEfficiencyGauge({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const eficiencia = ((cenarioAtual.emissoes_total - cenarioProposto.emissoes_total) / cenarioAtual.emissoes_total) * 100;

  const plotData = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: eficiencia,
      title: {
        text: '<b>Eficiência de Redução</b>',
        font: { size: 20, family: 'Segoe UI, sans-serif' }
      },
      delta: {
        reference: 0,
        suffix: '%',
        increasing: { color: '#10b981' }
      },
      gauge: {
        axis: { range: [0, 100], tickwidth: 2, tickcolor: '#334155' },
        bar: { color: '#10b981', thickness: 0.8 },
        bgcolor: 'white',
        borderwidth: 2,
        bordercolor: '#cbd5e1',
        steps: [
          { range: [0, 30], color: '#fecaca' },
          { range: [30, 60], color: '#fde68a' },
          { range: [60, 80], color: '#bfdbfe' },
          { range: [80, 100], color: '#bbf7d0' }
        ],
        threshold: {
          line: { color: '#dc2626', width: 4 },
          thickness: 0.75,
          value: 85
        }
      },
      number: {
        suffix: '%',
        font: { size: 48, weight: 700 }
      }
    }
  ];

  const layout = {
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 80, r: 40, b: 40, l: 40 },
    height: 400,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}

/**
 * Gráfico de Breakdown de Emissões (Sunburst)
 */
export function EmissionsBreakdownSunburst({ data }) {


  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);

  const plotData = [
    {
      type: 'sunburst',
      labels: [
        'Total',
        'LP Flare',
        'HP Flare',
        'Hull Vent',
        'CO₂ (LP)',
        'CH₄ (LP)',
        'CO₂ (HP)',
        'CH₄ (HP)',
        'CO₂ (Hull)',
        'CH₄ (Hull)'
      ],
      parents: [
        '',
        'Total',
        'Total',
        'Total',
        'LP Flare',
        'LP Flare',
        'HP Flare',
        'HP Flare',
        'Hull Vent',
        'Hull Vent'
      ],
      values: [
        cenarioAtual.emissoes_total,
        cenarioAtual.emissoes_lp_flare,
        cenarioAtual.emissoes_hp_flare,
        cenarioAtual.emissoes_hull,
        cenarioAtual.emissoes_lp_flare * 0.75,
        cenarioAtual.emissoes_lp_flare * 0.25,
        cenarioAtual.emissoes_hp_flare * 0.75,
        cenarioAtual.emissoes_hp_flare * 0.25,
        cenarioAtual.emissoes_hull * 0.75,
        cenarioAtual.emissoes_hull * 0.25
      ],
      marker: {
        colors: [
          '#3b82f6',
          '#f87171',
          '#dc2626',
          '#fca5a5',
          '#fecaca',
          '#fee2e2',
          '#fca5a5',
          '#fecdd3',
          '#fed7aa',
          '#fef3c7'
        ]
      },
      branchvalues: 'total',
      hovertemplate: '<b>%{label}</b><br>%{value:.0f} tCO₂eq/ano<br>%{percentParent}<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Breakdown Detalhado de Emissões - Sistema Atual',
      font: { size: 14, weight: 600, family: 'Segoe UI, sans-serif' }
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 80, r: 40, b: 40, l: 40 },
    height: 300,
    font: { family: 'Segoe UI, sans-serif' }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  return <Plot data={plotData} layout={layout} config={config} style={{ width: '100%' }} />;
}
