import React from 'react';
import Plot from 'react-plotly.js';
import { EmissionCalculator } from '../utils/calculations';
import { NumberFormatter } from '../utils/unitConverter';

/**
 * Gráficos Comparativos - Sistema Atual vs Proposto
 */
export default function ComparativeCharts({ data }) {
  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = (reducaoEmissoes / cenarioAtual.emissoes_total) * 100;

  // Cálculos de redução por fonte - VALORES TROCADOS
  // LP Flare + Hull Vent usa os valores do HP (que é maior)
  // HP Flare usa os valores do LP (que é menor)
  const reducaoLPHull = (cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull) - (cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull);
  const reducaoHP = cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare;

  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 27900;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 40000;
  const vazaoHull = 0;

  // Vazões propostas (após redução) - VALORES TROCADOS
  // LP Flare + Hull Vent (usa valores do HP)
  const vazaoLPHullProposto = (vazaoHPFlare + vazaoHull) * 0.09; // 9% residual (91% redução)
  // HP Flare (usa valores do LP)
  const vazaoHPProposto = vazaoLPFlare * 0.09; // 9% residual (91% redução)

  return (
    <div className="space-y-3">
      {/* Gráfico 1: Ganho Absoluto - Compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Ganho: {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano ({NumberFormatter.format(reducaoPercentual, 1)}% redução)
        </h3>
        <Plot
          data={[
            {
              x: ['LP Flare + Hull Vent', 'HP Flare', 'TOTAL'],
              y: [reducaoLPHull, reducaoHP, reducaoEmissoes],
              type: 'bar',
              marker: {
                color: ['#60b8d4', '#20a8c4', '#10b981'],
                line: {
                  color: '#059669',
                  width: 1.5
                }
              },
              text: [
                `${NumberFormatter.format(reducaoLPHull, 0)}`,
                `${NumberFormatter.format(reducaoHP, 0)}`,
                `${NumberFormatter.format(reducaoEmissoes, 0)}`
              ],
              textposition: 'inside',
              textfont: {
                color: 'white',
                size: 11,
                family: 'Arial, sans-serif',
                weight: 'bold'
              },
              hovertemplate: '<b>%{x}</b><br>Redução: %{y:,.0f} tCO₂eq/ano<extra></extra>'
            }
          ]}
          layout={{
            title: {
              text: '',
              font: { size: 14, family: 'Arial, sans-serif' },
              x: 0.5,
              xanchor: 'center'
            },
            xaxis: {
              title: '',
              tickfont: { size: 10, family: 'Arial, sans-serif' },
              titlefont: { size: 10 },
              titlestandoff: 25
            },
            yaxis: {
              title: { text: 'Redução (tCO₂eq/ano)', font: { size: 10 } },
              tickformat: ',.0f',
              gridcolor: '#e5e7eb'
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'white',
            height: 280,
            margin: { t: 20, b: 40, l: 60, r: 20 },
            showlegend: false
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Gráfico 2: Emissões por Fonte - Compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Emissões por Fonte (tCO₂eq/ano)
        </h3>
        <Plot
          data={[
            {
              x: ['LP Flare + Hull Vent', 'HP Flare', 'TOTAL'],
              y: [
                cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull,
                cenarioAtual.emissoes_lp_flare,
                cenarioAtual.emissoes_total
              ],
              name: 'Atual',
              type: 'bar',
              marker: {
                color: '#ef4444',
                line: {
                  color: '#dc2626',
                  width: 1.5
                }
              },
              text: [
                NumberFormatter.format(cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull, 0),
                NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0),
                NumberFormatter.format(cenarioAtual.emissoes_total, 0)
              ],
              textposition: 'inside',
              textfont: {
                color: 'white',
                size: 10,
                weight: 'bold'
              },
              hovertemplate: '<b>%{x}</b><br>Atual: %{y:,.0f} tCO₂eq/ano<extra></extra>'
            },
            {
              x: ['LP Flare + Hull Vent', 'HP Flare', 'TOTAL'],
              y: [
                cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull,
                cenarioProposto.emissoes_lp_flare,
                cenarioProposto.emissoes_total
              ],
              name: 'Proposto',
              type: 'bar',
              marker: {
                color: '#10b981',
                line: {
                  color: '#059669',
                  width: 1.5
                }
              },
              text: [
                NumberFormatter.format(cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, 0),
                NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0),
                NumberFormatter.format(cenarioProposto.emissoes_total, 0)
              ],
              textposition: 'inside',
              textfont: {
                color: 'white',
                size: 10,
                weight: 'bold'
              },
              hovertemplate: '<b>%{x}</b><br>Proposto: %{y:,.0f} tCO₂eq/ano<extra></extra>'
            }
          ]}
          layout={{
            title: {
              text: '',
              font: { size: 14, family: 'Arial, sans-serif' },
              x: 0.5,
              xanchor: 'center'
            },
            xaxis: {
              title: { text: '', font: { size: 10 } },
              tickfont: { size: 10 },
              titlestandoff: 25
            },
            yaxis: {
              title: { text: 'Emissões (tCO₂eq/ano)', font: { size: 10 } },
              tickformat: ',.0f',
              gridcolor: '#e5e7eb'
            },
            plot_bgcolor: 'white',
            paper_bgcolor: 'white',
            height: 300,
            margin: { t: 20, b: 40, l: 60, r: 20 },
            showlegend: true,
            legend: {
              x: 0.5,
              xanchor: 'center',
              y: 1.1,
              orientation: 'h',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              bordercolor: '#e5e7eb',
              borderwidth: 1,
              font: { size: 10 }
            },
            barmode: 'group'
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Gráfico 3: Comparação de Vazões - Compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Comparação de Vazões Operacionais
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Cenário Atual */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 text-center">Atual</h4>
            <Plot
              data={[
                {
                  x: ['LP Flare + Hull Vent', 'HP Flare'],
                  y: [vazaoHPFlare + vazaoHull, vazaoLPFlare],
                  type: 'bar',
                  marker: {
                    color: ['#ef4444', '#f97316'],
                    line: {
                      color: ['#dc2626', '#ea580c'],
                      width: 1.5
                    }
                  },
                  text: [
                    `${NumberFormatter.format(vazaoHPFlare + vazaoHull, 0)}`,
                    `${NumberFormatter.format(vazaoLPFlare, 0)}`
                  ],
                  textposition: 'inside',
                  textfont: {
                    color: 'white',
                    size: 10,
                    weight: 'bold'
                  },
                  hovertemplate: '<b>%{x}</b><br>Vazão: %{y:,.0f} Sm³/d<extra></extra>'
                }
              ]}
              layout={{
                title: {
                  text: '',
                  font: { size: 11, family: 'Arial, sans-serif' },
                  x: 0.5,
                  xanchor: 'center'
                },
                xaxis: {
                  tickfont: { size: 9 },
                  titlestandoff: 25
                },
                yaxis: {
                  title: { text: 'Vazão (Sm³/d)', font: { size: 9 } },
                  tickformat: ',.0f',
                  gridcolor: '#e5e7eb'
                },
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                height: 250,
                margin: { t: 20, b: 40, l: 60, r: 10 },
                showlegend: false
              }}
              config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false
          }}
              style={{ width: '100%' }}
            />
            <div className="text-center mt-1 text-xs font-semibold text-gray-700">
              Total: {NumberFormatter.format((vazaoHull + vazaoLPFlare + vazaoHPFlare) / 1000, 1)} KSm³/d
            </div>
          </div>

          {/* Cenário Proposto */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2 text-center">Proposto</h4>
            <Plot
              data={[
                {
                  x: ['LP Flare + Hull Vent', 'HP Flare'],
                  y: [vazaoLPHullProposto, vazaoHPProposto],
                  type: 'bar',
                  marker: {
                    color: ['#10b981', '#06b6d4'],
                    line: {
                      color: ['#059669', '#0891b2'],
                      width: 1.5
                    }
                  },
                  text: [
                    `${NumberFormatter.format(vazaoLPHullProposto, 0)}`,
                    `${NumberFormatter.format(vazaoHPProposto, 0)}`
                  ],
                  textposition: 'inside',
                  textfont: {
                    color: 'white',
                    size: 10,
                    weight: 'bold'
                  },
                  hovertemplate: '<b>%{x}</b><br>Vazão: %{y:,.0f} Sm³/d<extra></extra>'
                }
              ]}
              layout={{
                title: {
                  text: '',
                  font: { size: 11, family: 'Arial, sans-serif' },
                  x: 0.5,
                  xanchor: 'center'
                },
                xaxis: {
                  tickfont: { size: 9 },
                  titlestandoff: 25
                },
                yaxis: {
                  title: { text: 'Vazão (Sm³/d)', font: { size: 9 } },
                  tickformat: ',.0f',
                  gridcolor: '#e5e7eb'
                },
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                height: 250,
                margin: { t: 20, b: 40, l: 60, r: 10 },
                showlegend: false
              }}
              config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            displaylogo: false
          }}
              style={{ width: '100%' }}
            />
            <div className="text-center mt-1 text-xs font-semibold text-green-700">
              Total: {NumberFormatter.format((vazaoLPHullProposto + vazaoHPProposto) / 1000, 1)} KSm³/d
              (↓{NumberFormatter.format((1 - (vazaoLPHullProposto + vazaoHPProposto) / (vazaoHull + vazaoLPFlare + vazaoHPFlare)) * 100, 1)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
