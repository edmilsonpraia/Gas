import React from 'react';
import { CheckCircle, TrendingDown, Leaf } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';

/**
 * Análise Técnica - Sistema de Recuperação de Gás
 */
export default function TechnicalAnalysis({ data }) {
  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 27900;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 40000;
  const vazaoHull = 1728000;

  // Taxas de recuperação
  const taxaRecuperacaoHull = 95;
  const taxaReducaoLP = 91;
  const taxaReducaoHP = 91;

  // Cálculos de gás recuperado
  const gasHullCapturado = vazaoHull * (taxaRecuperacaoHull / 100);
  const gasLPRecuperado = vazaoLPFlare * (taxaReducaoLP / 100);
  const gasHPRecuperado = vazaoHPFlare * (taxaReducaoHP / 100);
  const gasTotalRecuperado = gasHullCapturado + gasLPRecuperado + gasHPRecuperado;

  // Vazões residuais
  const vazaoHullResidual = vazaoHull * (1 - taxaRecuperacaoHull / 100);
  const vazaoLPResidual = vazaoLPFlare * (1 - taxaReducaoLP / 100);
  const vazaoHPResidual = vazaoHPFlare * (1 - taxaReducaoHP / 100);
  const totalEmitido = vazaoLPResidual + vazaoHPResidual + vazaoHullResidual;

  // Redução de emissões
  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = (reducaoEmissoes / cenarioAtual.emissoes_total) * 100;

  // Taxa global de recuperação
  const totalFlareBase = vazaoLPFlare + vazaoHPFlare;
  const percentualRecuperado = (cenarioProposto.vazao_recuperada / totalFlareBase * 100);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={24} className="text-green-600" />
          <h2 className="text-lg font-bold text-green-900">✅ Método Proposto - Sistema de Recuperação</h2>
        </div>
        <p className="text-green-800">
          Sistema integrado de captura, compressão e recuperação de gás
        </p>
      </div>

      {/* Descrição do Sistema */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Descrição do Sistema Proposto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">💡 Inovações Técnicas:</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Sistema de captura Hull Vent ({taxaRecuperacaoHull}% eficiência)</li>
              <li>• Compressão de gás recuperado</li>
              <li>• Integração com rede de gás existente</li>
              <li>• Redução LP Flare em {taxaReducaoLP}%</li>
              <li>• Redução HP Flare em {taxaReducaoHP}%</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-3">🔧 Novos Equipamentos:</h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Sistema de captura Hull Vent</li>
              <li>• Compressor de recuperação</li>
              <li>• Tubulação de interligação</li>
              <li>• Instrumentação e controle</li>
              <li>• Sistema de tratamento de gás</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Performance do Sistema */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Performance do Sistema</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
            <p className="text-sm text-gray-700 mb-1">Gás Recuperado</p>
            <h3 className="text-2xl font-bold text-green-700">
              {NumberFormatter.format(gasTotalRecuperado / 1000, 1)}
            </h3>
            <p className="text-sm text-green-600 font-semibold">KSm³/d</p>
            <p className="text-xs text-gray-600 mt-2">
              {NumberFormatter.format(percentualRecuperado, 1)}% do flare
            </p>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
            <p className="text-sm text-gray-700 mb-1">Redução LP Flare</p>
            <h3 className="text-2xl font-bold text-blue-700">
              {NumberFormatter.format(gasLPRecuperado, 0)}
            </h3>
            <p className="text-sm text-blue-600 font-semibold">Sm³/d</p>
            <p className="text-xs text-red-600 mt-2 font-semibold">
              -{taxaReducaoLP}%
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
            <p className="text-sm text-gray-700 mb-1">Redução HP Flare</p>
            <h3 className="text-2xl font-bold text-purple-700">
              {NumberFormatter.format(gasHPRecuperado, 0)}
            </h3>
            <p className="text-sm text-purple-600 font-semibold">Sm³/d</p>
            <p className="text-xs text-red-600 mt-2 font-semibold">
              -{taxaReducaoHP}%
            </p>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <p className="text-sm text-gray-700 mb-1">Taxa Global</p>
            <h3 className="text-2xl font-bold text-orange-700">
              {NumberFormatter.format(percentualRecuperado, 1)}
            </h3>
            <p className="text-sm text-orange-600 font-semibold">%</p>
            <p className="text-xs text-gray-600 mt-2">
              % de gás recuperado
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Balanço de Massa */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Balanço de Massa</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} />
              Gás Recuperado
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Captura Hull Vent ({taxaRecuperacaoHull}%):</span>
                <span className="font-semibold">{NumberFormatter.format(gasHullCapturado, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span>Recuperação LP Flare ({taxaReducaoLP}%):</span>
                <span className="font-semibold">{NumberFormatter.format(gasLPRecuperado, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span>Recuperação HP Flare ({taxaReducaoHP}%):</span>
                <span className="font-semibold">{NumberFormatter.format(gasHPRecuperado, 0)} Sm³/d</span>
              </div>
              <div className="border-t-2 border-green-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-green-800">
                  <span>Total Recuperado:</span>
                  <span className="text-lg">{NumberFormatter.format(gasTotalRecuperado, 0)} Sm³/d</span>
                </div>
              </div>
              <div className="text-xs text-green-700 mt-3">
                Destinação: Rede de gás / Exportação / Injeção
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400">
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <TrendingDown size={20} />
              Emissões Residuais
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>LP Flare (reduzido):</span>
                <span className="font-semibold">{NumberFormatter.format(vazaoLPResidual, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-red-600">(-{taxaReducaoLP}%)</span>
              </div>
              <div className="flex justify-between">
                <span>HP Flare (reduzido):</span>
                <span className="font-semibold">{NumberFormatter.format(vazaoHPResidual, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-red-600">(-{taxaReducaoHP}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Hull Vent residual:</span>
                <span className="font-semibold">{NumberFormatter.format(vazaoHullResidual, 0)} Sm³/d</span>
              </div>
              <div className="border-t-2 border-orange-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-orange-800">
                  <span>Total Emitido:</span>
                  <span className="text-lg">{NumberFormatter.format(totalEmitido, 0)} Sm³/d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Emissões Reduzidas */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Emissões de GEE (Reduzidas)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tabela Comparativa */}
          <div className="card">
            <h4 className="font-semibold text-gray-800 mb-4">Comparação de Emissões</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Fonte</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Antes (tCO₂eq/ano)</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Depois (tCO₂eq/ano)</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Redução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-gray-700">LP Flare</td>
                    <td className="px-4 py-2 text-right font-medium">{NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-700">
                      {NumberFormatter.format(((cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare) / cenarioAtual.emissoes_lp_flare * 100), 1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-700">Hull Vent</td>
                    <td className="px-4 py-2 text-right font-medium">{NumberFormatter.format(cenarioAtual.emissoes_hull, 0)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_hull, 0)}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-500">N/A</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-gray-700">HP Flare</td>
                    <td className="px-4 py-2 text-right font-medium">{NumberFormatter.format(cenarioAtual.emissoes_hp_flare, 0)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_hp_flare, 0)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-700">
                      {NumberFormatter.format(((cenarioAtual.emissoes_hp_flare - cenarioProposto.emissoes_hp_flare) / cenarioAtual.emissoes_hp_flare * 100), 1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-2 text-gray-900">TOTAL</td>
                    <td className="px-4 py-2 text-right">{NumberFormatter.format(cenarioAtual.emissoes_total, 0)}</td>
                    <td className="px-4 py-2 text-right text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_total, 0)}</td>
                    <td className="px-4 py-2 text-right text-green-700">{NumberFormatter.format(reducaoPercentual, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card de Emissões Reduzidas */}
          <div className="card bg-gradient-to-br from-green-900 to-emerald-700 text-white">
            <h4 className="font-semibold text-white text-center mb-4 text-xl">✅ Emissões Reduzidas</h4>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-100">LP Flare:</span>
                  <span className="font-semibold">{NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)} tCO₂eq/ano</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-100">Hull Vent:</span>
                  <span className="font-semibold">{NumberFormatter.format(cenarioProposto.emissoes_hull, 0)} tCO₂eq/ano</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-100">HP Flare:</span>
                  <span className="font-semibold">{NumberFormatter.format(cenarioProposto.emissoes_hp_flare, 0)} tCO₂eq/ano</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-xs text-green-800 font-semibold mb-2">TOTAL ANUAL (NOVO)</p>
              <h2 className="text-3xl font-bold text-green-700 mb-2">
                {NumberFormatter.format(cenarioProposto.emissoes_total, 0)}
              </h2>
              <p className="text-lg text-green-800 font-semibold">toneladas CO₂eq</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-4 text-center">
              <p className="text-sm font-semibold mb-1">REDUÇÃO: {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano</p>
              <p className="text-2xl font-bold">↓ {NumberFormatter.format(reducaoPercentual, 1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Benefícios e Vantagens */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Benefícios e Vantagens</h3>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
          <div className="flex items-start gap-3 mb-4">
            <Leaf size={32} className="text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 text-lg mb-3">Principais Benefícios do Sistema</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Aproveitamento Energético:</strong> {NumberFormatter.format(cenarioProposto.vazao_anual_recuperada / 1e6, 2)} MSm³/ano de gás recuperado
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Redução de Emissões:</strong> {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano ({NumberFormatter.format(reducaoPercentual, 1)}%)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Geração de Receita:</strong> Gás recuperado pode ser comercializado ou usado
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Conformidade Ambiental:</strong> Alinhado com regulações de zero flare
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Sustentabilidade:</strong> Contribui para metas ESG da empresa
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <div>
                    <strong>Eficiência Operacional:</strong> Otimização do aproveitamento de recursos
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
