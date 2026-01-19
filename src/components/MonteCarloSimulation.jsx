import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Play, RotateCcw, TrendingUp } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';

/**
 * Simulação de Monte Carlo para Análise de Risco
 *
 * Esta simulação gera múltiplas iterações de cenários possíveis
 * para prever distribuições probabilísticas de vazões e emissões.
 */
export default function MonteCarloSimulation({ data }) {
  const [simulating, setSimulating] = useState(false);
  const [numIterations, setNumIterations] = useState(10000);
  const [results, setResults] = useState(null);

  const runSimulation = () => {
    setSimulating(true);

    setTimeout(() => {
      const totalFlaringBase = data.monitoring?.totals?.totalFlaring || 44000;
      const hp1Base = data.monitoring?.hpFlare?.comp1 || 15000;
      const hp2Base = data.monitoring?.hpFlare?.comp2 || 11000;
      const lp1Base = data.monitoring?.lpFlare?.comp3 || 10000;
      const lp2Base = data.monitoring?.lpFlare?.comp4 || 8000;

      // Arrays para armazenar resultados
      const totalFlaringSamples = [];
      const emissoesSamples = [];
      const hp1Samples = [];
      const hp2Samples = [];
      const lp1Samples = [];
      const lp2Samples = [];

      // Função para gerar número aleatório com distribuição normal (Box-Muller)
      const randomNormal = (mean, stdDev) => {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * stdDev;
      };

      // Executar simulações
      for (let i = 0; i < numIterations; i++) {
        // Simular variabilidade nos componentes (±15% desvio padrão)
        const hp1 = Math.max(0, randomNormal(hp1Base, hp1Base * 0.15));
        const hp2 = Math.max(0, randomNormal(hp2Base, hp2Base * 0.15));
        const lp1 = Math.max(0, randomNormal(lp1Base, lp1Base * 0.15));
        const lp2 = Math.max(0, randomNormal(lp2Base, lp2Base * 0.15));

        hp1Samples.push(hp1);
        hp2Samples.push(hp2);
        lp1Samples.push(lp1);
        lp2Samples.push(lp2);

        const totalFlaring = hp1 + hp2 + lp1 + lp2;
        totalFlaringSamples.push(totalFlaring);

        // Calcular emissões (tCO2eq/ano)
        const emissoes = (totalFlaring * 365 * 2.75) / 1000;
        emissoesSamples.push(emissoes);
      }

      // Calcular estatísticas
      const calcStats = (samples) => {
        const sorted = [...samples].sort((a, b) => a - b);
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);

        return {
          mean,
          stdDev,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p5: sorted[Math.floor(samples.length * 0.05)],
          p25: sorted[Math.floor(samples.length * 0.25)],
          p50: sorted[Math.floor(samples.length * 0.50)],
          p75: sorted[Math.floor(samples.length * 0.75)],
          p95: sorted[Math.floor(samples.length * 0.95)]
        };
      };

      setResults({
        totalFlaring: {
          samples: totalFlaringSamples,
          stats: calcStats(totalFlaringSamples)
        },
        emissoes: {
          samples: emissoesSamples,
          stats: calcStats(emissoesSamples)
        },
        hp1: { samples: hp1Samples, stats: calcStats(hp1Samples) },
        hp2: { samples: hp2Samples, stats: calcStats(hp2Samples) },
        lp1: { samples: lp1Samples, stats: calcStats(lp1Samples) },
        lp2: { samples: lp2Samples, stats: calcStats(lp2Samples) }
      });

      setSimulating(false);
    }, 100);
  };

  // Executar simulação ao carregar componente
  useEffect(() => {
    runSimulation();
  }, [data]);

  if (!results) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Executando simulação de Monte Carlo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <div className="card bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-600" />
              Simulação de Monte Carlo
            </h3>
            <p className="text-sm text-gray-600">
              Análise de risco com {numIterations.toLocaleString('pt-BR')} iterações
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={numIterations}
              onChange={(e) => setNumIterations(parseInt(e.target.value))}
              className="input-field"
              disabled={simulating}
            >
              <option value={1000}>1.000 iterações</option>
              <option value={5000}>5.000 iterações</option>
              <option value={10000}>10.000 iterações</option>
              <option value={50000}>50.000 iterações</option>
            </select>
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="btn-primary flex items-center gap-2"
            >
              {simulating ? (
                <>
                  <RotateCcw size={18} className="animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Executar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Flaring */}
        <div className="card">
          <h4 className="font-bold text-gray-800 mb-4">Estatísticas - Total Flaring (Sm³/d)</h4>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Média:</span>
              <span className="font-bold text-primary-600">
                {NumberFormatter.format(results.totalFlaring.stats.mean, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Desvio Padrão:</span>
              <span className="font-semibold text-gray-800">
                ±{NumberFormatter.format(results.totalFlaring.stats.stdDev, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Mínimo:</span>
              <span className="font-semibold text-green-600">
                {NumberFormatter.format(results.totalFlaring.stats.min, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Máximo:</span>
              <span className="font-semibold text-red-600">
                {NumberFormatter.format(results.totalFlaring.stats.max, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 bg-blue-50 px-3 rounded mt-2">
              <span className="text-blue-900 font-semibold">Percentil 95%:</span>
              <span className="font-bold text-blue-700">
                {NumberFormatter.format(results.totalFlaring.stats.p95, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Emissões */}
        <div className="card">
          <h4 className="font-bold text-gray-800 mb-4">Estatísticas - Emissões (tCO₂eq/ano)</h4>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Média:</span>
              <span className="font-bold text-primary-600">
                {NumberFormatter.format(results.emissoes.stats.mean, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Desvio Padrão:</span>
              <span className="font-semibold text-gray-800">
                ±{NumberFormatter.format(results.emissoes.stats.stdDev, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Mínimo:</span>
              <span className="font-semibold text-green-600">
                {NumberFormatter.format(results.emissoes.stats.min, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Máximo:</span>
              <span className="font-semibold text-red-600">
                {NumberFormatter.format(results.emissoes.stats.max, 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 bg-blue-50 px-3 rounded mt-2">
              <span className="text-blue-900 font-semibold">Percentil 95%:</span>
              <span className="font-bold text-blue-700">
                {NumberFormatter.format(results.emissoes.stats.p95, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histograma - Total Flaring */}
        <div className="card">
          <Plot
            data={[
              {
                x: results.totalFlaring.samples,
                type: 'histogram',
                nbinsx: 50,
                marker: {
                  color: '#3b82f6',
                  line: { color: '#1e40af', width: 1 }
                },
                name: 'Frequência',
                hovertemplate: 'Vazão: %{x:,.0f} Sm³/d<br>Frequência: %{y}<extra></extra>'
              }
            ]}
            layout={{
              title: {
                text: 'Distribuição de Probabilidade - Total Flaring',
                font: { size: 16, weight: 700, family: 'Segoe UI' }
              },
              xaxis: {
                title: 'Vazão Total (Sm³/d)',
                tickformat: ',.0f',
                gridcolor: '#e5e7eb'
              },
              yaxis: {
                title: 'Frequência',
                gridcolor: '#e5e7eb'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: 'white',
              margin: { t: 60, r: 40, b: 60, l: 80 },
              height: 400,
              shapes: [
                {
                  type: 'line',
                  x0: 61000,
                  x1: 61000,
                  y0: 0,
                  y1: 1,
                  yref: 'paper',
                  line: {
                    color: '#ef4444',
                    width: 2,
                    dash: 'dash'
                  }
                }
              ],
              annotations: [
                {
                  x: 61000,
                  y: 1,
                  yref: 'paper',
                  text: 'Limite 61k',
                  showarrow: false,
                  font: { color: '#ef4444', size: 12 },
                  xshift: 40,
                  yshift: -10
                }
              ],
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

        {/* Histograma - Emissões */}
        <div className="card">
          <Plot
            data={[
              {
                x: results.emissoes.samples,
                type: 'histogram',
                nbinsx: 50,
                marker: {
                  color: '#10b981',
                  line: { color: '#059669', width: 1 }
                },
                name: 'Frequência',
                hovertemplate: 'Emissões: %{x:,.0f} tCO₂eq/ano<br>Frequência: %{y}<extra></extra>'
              }
            ]}
            layout={{
              title: {
                text: 'Distribuição de Probabilidade - Emissões',
                font: { size: 16, weight: 700, family: 'Segoe UI' }
              },
              xaxis: {
                title: 'Emissões (tCO₂eq/ano)',
                tickformat: ',.0f',
                gridcolor: '#e5e7eb'
              },
              yaxis: {
                title: 'Frequência',
                gridcolor: '#e5e7eb'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: 'white',
              margin: { t: 60, r: 40, b: 60, l: 80 },
              height: 400,
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

        {/* Box Plot - Componentes */}
        <div className="card lg:col-span-2">
          <Plot
            data={[
              {
                y: results.hp1.samples,
                name: 'HP Comp 1',
                type: 'box',
                marker: { color: '#dc2626' },
                boxmean: 'sd'
              },
              {
                y: results.hp2.samples,
                name: 'HP Comp 2',
                type: 'box',
                marker: { color: '#ef4444' },
                boxmean: 'sd'
              },
              {
                y: results.lp1.samples,
                name: 'LP Comp 3',
                type: 'box',
                marker: { color: '#f87171' },
                boxmean: 'sd'
              },
              {
                y: results.lp2.samples,
                name: 'LP Comp 4',
                type: 'box',
                marker: { color: '#fca5a5' },
                boxmean: 'sd'
              }
            ]}
            layout={{
              title: {
                text: 'Box Plot - Variabilidade dos Componentes',
                font: { size: 18, weight: 700, family: 'Segoe UI' }
              },
              yaxis: {
                title: 'Vazão (Sm³/d)',
                tickformat: ',.0f',
                gridcolor: '#e5e7eb'
              },
              plot_bgcolor: '#fafafa',
              paper_bgcolor: 'white',
              margin: { t: 80, r: 40, b: 60, l: 100 },
              height: 450,
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
      </div>

      {/* Análise de Risco */}
      <div className="card">
        <h4 className="font-bold text-gray-800 mb-4">Análise de Risco</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${
            (results.totalFlaring.stats.p95 > 61000)
              ? 'bg-red-50 border-red-300'
              : 'bg-green-50 border-green-300'
          }`}>
            <div className="text-sm font-semibold mb-1">
              Probabilidade de Exceder Limite (61k)
            </div>
            <div className="text-3xl font-bold">
              {((results.totalFlaring.samples.filter(x => x > 61000).length / numIterations) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-300">
            <div className="text-sm font-semibold text-blue-900 mb-1">
              Intervalo de Confiança (90%)
            </div>
            <div className="text-lg font-bold text-blue-700">
              {NumberFormatter.format(results.totalFlaring.stats.p5, 0)} - {NumberFormatter.format(results.totalFlaring.stats.p95, 0)} Sm³/d
            </div>
          </div>

          <div className="p-4 rounded-lg border-2 bg-purple-50 border-purple-300">
            <div className="text-sm font-semibold text-purple-900 mb-1">
              Coeficiente de Variação
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {((results.totalFlaring.stats.stdDev / results.totalFlaring.stats.mean) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
