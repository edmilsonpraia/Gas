import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { TrendingUp, Activity } from 'lucide-react';
import { EmissionCalculator, EconomicCalculator } from '../utils/calculations';
import { NumberFormatter } from '../utils/unitConverter';

/**
 * Componente de Análise de Sensibilidade
 * Analisa como variações em parâmetros-chave afetam o VPL do projeto
 */
export default function SensitivityAnalysis({ data }) {
  const [selectedParameter, setSelectedParameter] = useState('precoGas');

  // Cenários base
  const cenarioAtual = useMemo(() =>
    EmissionCalculator.calcularCenarioAtual(data),
    [data]
  );

  const cenarioProposto = useMemo(() =>
    EmissionCalculator.calcularCenarioProposto(data, 0.85),
    [data]
  );

  /**
   * Calcula análise de sensibilidade para um parâmetro
   */
  const calculateSensitivity = (parameter) => {
    const results = [];

    // Definir variações para cada parâmetro
    const variations = {
      precoGas: {
        label: 'Preço do Gás (USD/MMBTU)',
        base: 5.5,
        values: [2.0, 3.0, 4.0, 5.0, 5.5, 6.0, 7.0, 8.0, 9.0, 10.0]
      },
      taxaRecuperacao: {
        label: 'Taxa de Recuperação (%)',
        base: 85,
        values: [70, 75, 80, 85, 90, 95, 98]
      },
      investimento: {
        label: 'Investimento (M USD)',
        base: 12,
        values: [8, 9, 10, 11, 12, 13, 14, 15, 16, 18]
      },
      taxaDesconto: {
        label: 'Taxa de Desconto (%)',
        base: 10,
        values: [5, 7, 8, 9, 10, 11, 12, 13, 15, 20]
      },
      opex: {
        label: 'OPEX (% do CAPEX)',
        base: 5,
        values: [2, 3, 4, 5, 6, 7, 8, 10, 12]
      }
    };

    const config = variations[parameter];
    if (!config) return [];

    config.values.forEach(value => {
      let analise;

      // Calcular VPL com parâmetro modificado
      if (parameter === 'precoGas') {
        // Temporariamente modificar preço do gás
        const fatorConversao = 0.0373; // MMBTU/Sm³
        const vazaoRecuperada = (data.monitoring?.totals?.totalFlaring || 44000) * 0.85;
        const receitaGas = vazaoRecuperada * 365 * value * fatorConversao;

        const cenarioTemp = {
          ...cenarioProposto,
          receita_gas: receitaGas
        };

        analise = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioTemp);
      }
      else if (parameter === 'taxaRecuperacao') {
        const cenarioTemp = EmissionCalculator.calcularCenarioProposto(data, value / 100);
        analise = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioTemp);
      }
      else if (parameter === 'investimento') {
        analise = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioProposto, value * 1000000);
      }
      else if (parameter === 'taxaDesconto') {
        // Salvar taxa original
        const taxaOriginal = EmissionCalculator.DISCOUNT_RATE;
        EmissionCalculator.DISCOUNT_RATE = value / 100;
        analise = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioProposto);
        EmissionCalculator.DISCOUNT_RATE = taxaOriginal;
      }
      else if (parameter === 'opex') {
        const opexOriginal = EmissionCalculator.OPEX_PERCENTUAL;
        EmissionCalculator.OPEX_PERCENTUAL = value / 100;
        analise = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioProposto);
        EmissionCalculator.OPEX_PERCENTUAL = opexOriginal;
      }

      results.push({
        value: value,
        vpn: analise.vpl / 1000000, // Converter para M USD
        tir: analise.tir,
        payback: analise.payback,
        roi: analise.roi,
        isBase: value === config.base
      });
    });

    return { results, config };
  };

  // Calcular análise de sensibilidade
  const sensitivity = useMemo(() =>
    calculateSensitivity(selectedParameter),
    [selectedParameter, data]
  );

  // Preparar dados para gráfico
  const chartData = useMemo(() => {
    if (!sensitivity.results) return [];

    return [
      {
        x: sensitivity.results.map(r => r.value),
        y: sensitivity.results.map(r => r.vpn),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'VPL (M USD)',
        line: {
          color: '#3b82f6',
          width: 3
        },
        marker: {
          size: 10,
          color: sensitivity.results.map(r => r.isBase ? '#dc2626' : '#3b82f6'),
          line: {
            color: '#1e40af',
            width: 2
          }
        },
        hovertemplate: '<b>%{x}</b><br>VPL: $%{y:.2f}M<extra></extra>'
      },
      // Linha de VPL = 0 (break-even)
      {
        x: sensitivity.results.map(r => r.value),
        y: new Array(sensitivity.results.length).fill(0),
        type: 'scatter',
        mode: 'lines',
        name: 'Break-even',
        line: {
          color: '#ef4444',
          width: 2,
          dash: 'dash'
        },
        hoverinfo: 'skip'
      }
    ];
  }, [sensitivity]);

  // Preparar dados para Tornado Chart
  const tornadoData = useMemo(() => {
    const parameters = ['precoGas', 'taxaRecuperacao', 'investimento', 'taxaDesconto', 'opex'];
    const impacts = [];

    parameters.forEach(param => {
      const sens = calculateSensitivity(param);
      if (!sens.results || sens.results.length === 0) return;

      const vpnValues = sens.results.map(r => r.vpn);
      const minVPN = Math.min(...vpnValues);
      const maxVPN = Math.max(...vpnValues);
      const range = maxVPN - minVPN;

      // Valor base
      const baseResult = sens.results.find(r => r.isBase);
      const baseVPN = baseResult ? baseResult.vpn : (minVPN + maxVPN) / 2;

      impacts.push({
        parameter: sens.config.label,
        lowImpact: minVPN - baseVPN,
        highImpact: maxVPN - baseVPN,
        range: range
      });
    });

    // Ordenar por impacto (range)
    impacts.sort((a, b) => b.range - a.range);

    return [
      {
        x: impacts.map(i => i.lowImpact),
        y: impacts.map(i => i.parameter),
        type: 'bar',
        orientation: 'h',
        name: 'Impacto Negativo',
        marker: {
          color: '#ef4444'
        },
        hovertemplate: '<b>%{y}</b><br>Impacto: $%{x:.2f}M<extra></extra>'
      },
      {
        x: impacts.map(i => i.highImpact),
        y: impacts.map(i => i.parameter),
        type: 'bar',
        orientation: 'h',
        name: 'Impacto Positivo',
        marker: {
          color: '#10b981'
        },
        hovertemplate: '<b>%{y}</b><br>Impacto: $%{x:.2f}M<extra></extra>'
      }
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3 mb-2">
          <Activity size={32} className="text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Análise de Sensibilidade</h2>
        </div>
        <p className="text-gray-600">
          Avalie como variações em parâmetros-chave afetam a viabilidade econômica do projeto
        </p>
      </div>

      {/* Seletor de Parâmetro */}
      <div className="card">
        <h3 className="card-header">Selecionar Parâmetro para Análise</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: 'precoGas', label: 'Preço do Gás', icon: '💰' },
            { id: 'taxaRecuperacao', label: 'Taxa de Recuperação', icon: '📈' },
            { id: 'investimento', label: 'Investimento', icon: '💵' },
            { id: 'taxaDesconto', label: 'Taxa de Desconto', icon: '📊' },
            { id: 'opex', label: 'OPEX', icon: '⚙️' }
          ].map(param => (
            <button
              key={param.id}
              onClick={() => setSelectedParameter(param.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedParameter === param.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-2xl mb-2">{param.icon}</div>
              <div className={`text-sm font-semibold ${
                selectedParameter === param.id ? 'text-primary-700' : 'text-gray-700'
              }`}>
                {param.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Sensibilidade */}
      <div className="card">
        <h3 className="card-header">
          Sensibilidade do VPL - {sensitivity.config?.label}
        </h3>

        <Plot
          data={chartData}
          layout={{
            title: {
              text: `Impacto no VPL`,
              font: { size: 18, weight: 700, family: 'Segoe UI' }
            },
            xaxis: {
              title: { text: sensitivity.config?.label, font: { size: 14, weight: 600 } },
              gridcolor: '#e5e7eb'
            },
            yaxis: {
              title: { text: 'VPL (M USD)', font: { size: 14, weight: 600 } },
              gridcolor: '#e5e7eb',
              zeroline: true,
              zerolinecolor: '#ef4444',
              zerolinewidth: 2
            },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: 'white',
            margin: { t: 80, r: 40, b: 80, l: 100 },
            height: 450,
            legend: {
              x: 0.02,
              y: 0.98,
              bgcolor: 'rgba(255,255,255,0.9)',
              bordercolor: '#d1d5db',
              borderwidth: 1
            },
            font: { family: 'Segoe UI' }
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Gráfico Tornado */}
      <div className="card">
        <h3 className="card-header flex items-center gap-2">
          <TrendingUp size={24} className="text-primary-600" />
          Análise Tornado - Impacto de Todos os Parâmetros
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Comparação do impacto relativo de cada parâmetro no VPL do projeto
        </p>

        <Plot
          data={tornadoData}
          layout={{
            title: {
              text: 'Impacto dos Parâmetros no VPL',
              font: { size: 18, weight: 700, family: 'Segoe UI' }
            },
            xaxis: {
              title: { text: 'Variação do VPL (M USD)', font: { size: 14, weight: 600 } },
              gridcolor: '#e5e7eb',
              zeroline: true,
              zerolinecolor: '#64748b',
              zerolinewidth: 2
            },
            yaxis: {
              title: { text: '', font: { size: 14, weight: 600 } },
              gridcolor: '#e5e7eb'
            },
            barmode: 'overlay',
            plot_bgcolor: '#fafafa',
            paper_bgcolor: 'white',
            margin: { t: 80, r: 40, b: 80, l: 200 },
            height: 450,
            legend: {
              x: 0.98,
              xanchor: 'right',
              y: 0.98,
              bgcolor: 'rgba(255,255,255,0.9)',
              bordercolor: '#d1d5db',
              borderwidth: 1
            },
            font: { family: 'Segoe UI' }
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Tabela de Resultados */}
      {sensitivity.results && (
        <div className="card">
          <h3 className="card-header">Resultados Detalhados</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    {sensitivity.config?.label}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    VPL (M USD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    TIR (%)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Payback (anos)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    ROI (%)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Viabilidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sensitivity.results.map((result, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-purple-50 ${result.isBase ? 'bg-blue-50 font-bold' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {NumberFormatter.format(result.value, 2)}
                      {result.isBase && <span className="ml-2 text-blue-600">(Base)</span>}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      result.vpn > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {NumberFormatter.format(result.vpn, 2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {NumberFormatter.format(result.tir, 1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {result.payback < 999 ? NumberFormatter.format(result.payback, 1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {NumberFormatter.format(result.roi, 1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.vpn > 0 && result.tir > 10
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.vpn > 0 && result.tir > 10 ? 'Viável' : 'Inviável'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50">
        <h3 className="font-bold text-gray-900 mb-3">💡 Insights da Análise</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ <strong>Parâmetros mais Críticos:</strong> Use o gráfico Tornado para identificar quais variáveis têm maior impacto no VPL</li>
          <li>✅ <strong>Break-even:</strong> Identifique o valor mínimo de cada parâmetro para VPL positivo</li>
          <li>✅ <strong>Margem de Segurança:</strong> Quanto mais distante do break-even, maior a robustez do projeto</li>
          <li>✅ <strong>Sensibilidade ao Preço:</strong> Projetos muito sensíveis ao preço do gás têm maior risco de mercado</li>
        </ul>
      </div>
    </div>
  );
}
