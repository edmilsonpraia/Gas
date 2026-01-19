import React from 'react';
import { Microscope, TrendingUp, AlertCircle } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';
import MonteCarloSimulation from './MonteCarloSimulation';

/**
 * Análise Técnica Detalhada
 */
export default function TechnicalAnalysis({ data }) {
  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);

  // Análises técnicas
  const totalHP = data.monitoring?.totals?.totalHP || 0;
  const totalLP = data.monitoring?.totals?.totalLP || 0;
  const totalFlaring = totalHP + totalLP;

  const razaoHPLP = totalHP / (totalLP || 1);
  const percentualHP = (totalHP / (totalFlaring || 1)) * 100;
  const percentualLP = (totalLP / (totalFlaring || 1)) * 100;

  const vazaoTotal = (data.compressors?.hp?.vazao || 0) +
                     (data.compressors?.lp?.vazao || 0) +
                     (data.compressors?.blower?.vazao || 0);

  const capacidadeHP = ((data.compressors?.hp?.vazao || 0) / 500000) * 100;
  const capacidadeLP = ((data.compressors?.lp?.vazao || 0) / 500000) * 100;

  const deltaTemp = (data.compressors?.hp?.temperatura || 0) -
                    (data.compressors?.lp?.temperatura || 0);

  const razaoPressao = (data.compressors?.hp?.pressao || 0) /
                       (data.compressors?.lp?.pressao || 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3 mb-2">
          <Microscope size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Análise Técnica</h2>
        </div>
        <p className="text-gray-600">
          Análise detalhada dos parâmetros operacionais e indicadores de performance
        </p>
      </div>

      {/* Análise de Flaring */}
      <div className="card">
        <h3 className="card-header">Análise de Flaring HP/LP</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="metric-card border-2 border-red-300">
            <div className="metric-label text-red-700">Total Flaring</div>
            <div className="metric-value text-red-600">
              {NumberFormatter.format(totalFlaring, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sm³/d</div>
          </div>

          <div className="metric-card border-2 border-orange-300">
            <div className="metric-label text-orange-700">Razão HP/LP</div>
            <div className="metric-value text-orange-600">
              {NumberFormatter.format(razaoHPLP, 2)}
            </div>
            <div className="text-sm text-gray-600 mt-1">adimensional</div>
          </div>

          <div className="metric-card border-2 border-yellow-300">
            <div className="metric-label text-yellow-700">Limite 61k</div>
            <div className="metric-value text-yellow-600">
              {NumberFormatter.format(((totalFlaring / 61000) * 100), 1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">utilização</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HP Flare */}
          <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
            <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              HP Flare (Alta Pressão)
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total HP:</span>
                <span className="font-bold text-red-700">
                  {NumberFormatter.format(totalHP, 0)} Sm³/d
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Percentual:</span>
                <span className="font-bold text-red-700">
                  {NumberFormatter.format(percentualHP, 1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Emissões:</span>
                <span className="font-bold text-red-700">
                  {NumberFormatter.format(cenarioAtual.emissoes_hp_flare, 0)} tCO₂eq/ano
                </span>
              </div>
            </div>
          </div>

          {/* LP Flare */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              LP Flare (Baixa Pressão)
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total LP:</span>
                <span className="font-bold text-orange-700">
                  {NumberFormatter.format(totalLP, 0)} Sm³/d
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Percentual:</span>
                <span className="font-bold text-orange-700">
                  {NumberFormatter.format(percentualLP, 1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Emissões:</span>
                <span className="font-bold text-orange-700">
                  {NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0)} tCO₂eq/ano
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Compressores */}
      <div className="card">
        <h3 className="card-header">Análise de Compressores</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="metric-card border-2 border-blue-300">
            <div className="metric-label text-blue-700">Vazão Total</div>
            <div className="metric-value text-blue-600">
              {NumberFormatter.format(vazaoTotal, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Sm³/d</div>
          </div>

          <div className="metric-card border-2 border-purple-300">
            <div className="metric-label text-purple-700">Delta Temperatura</div>
            <div className="metric-value text-purple-600">
              {NumberFormatter.format(deltaTemp, 1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">°C (HP - LP)</div>
          </div>

          <div className="metric-card border-2 border-green-300">
            <div className="metric-label text-green-700">Razão Pressão HP/LP</div>
            <div className="metric-value text-green-600">
              {NumberFormatter.format(razaoPressao, 1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">adimensional</div>
          </div>
        </div>

        {/* Tabela de Performance */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-blue-100 to-cyan-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Equipamento
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Vazão (Sm³/d)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Capacidade (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Pressão (bar)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Temperatura (°C)
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Compressor HP
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.hp?.vazao || 0, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(capacidadeHP, 1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.hp?.pressao || 0, 2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.hp?.temperatura || 0, 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    capacidadeHP > 80 ? 'bg-red-100 text-red-800' :
                    capacidadeHP > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {capacidadeHP > 80 ? 'Alta' : capacidadeHP > 60 ? 'Média' : 'Normal'}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Compressor LP
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.lp?.vazao || 0, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(capacidadeLP, 1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.lp?.pressao || 0, 2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.lp?.temperatura || 0, 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    capacidadeLP > 80 ? 'bg-red-100 text-red-800' :
                    capacidadeLP > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {capacidadeLP > 80 ? 'Alta' : capacidadeLP > 60 ? 'Média' : 'Normal'}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Blower
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.blower?.vazao || 0, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(((data.compressors?.blower?.vazao || 0) / 500000) * 100, 1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.blower?.pressao || 0, 3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {NumberFormatter.format(data.compressors?.blower?.temperatura || 0, 1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Recuperação
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="card">
        <h3 className="card-header flex items-center gap-2">
          <TrendingUp size={24} className="text-primary-600" />
          Indicadores de Performance (KPIs)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Eficiência Operacional</h4>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-700 mb-1">Taxa de Utilização</div>
              <div className="text-2xl font-bold text-green-700">
                {NumberFormatter.format((totalFlaring / 61000) * 100, 1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((totalFlaring / 61000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700 mb-1">Capacidade Média Compressores</div>
              <div className="text-2xl font-bold text-blue-700">
                {NumberFormatter.format((capacidadeHP + capacidadeLP) / 2, 1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((capacidadeHP + capacidadeLP) / 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Recomendações</h4>

            {totalFlaring > 61000 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="font-semibold text-red-900">Alerta Crítico</span>
                </div>
                <p className="text-sm text-red-700">
                  Flaring acima do limite de 61.000 Sm³/d. Considere ativar sistema de recuperação.
                </p>
              </div>
            )}

            {capacidadeHP > 80 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Atenção</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Compressor HP operando acima de 80% da capacidade. Monitorar desgaste.
                </p>
              </div>
            )}

            {totalFlaring < 61000 && capacidadeHP < 80 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-green-600" />
                  <span className="font-semibold text-green-900">Operação Normal</span>
                </div>
                <p className="text-sm text-green-700">
                  Sistema operando dentro dos parâmetros normais. Continuar monitoramento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulação de Monte Carlo */}
      <MonteCarloSimulation data={data} />
    </div>
  );
}
