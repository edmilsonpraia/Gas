import React, { useState } from 'react';
import { CheckCircle, TrendingDown, Leaf, BarChart3 } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';

/**
 * Análise Técnica - Sistema de Recuperação de Gás
 */
export default function TechnicalAnalysis({ data }) {
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);

  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 27900;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 40000;
  const vazaoHull = 0; // Hull vent (sem dados)

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

  // Simulação Monte Carlo - Três Cenários Técnicos
  const calcularCenarioMonteCarlo = (taxaHull, taxaLP, taxaHP) => {
    const gasHull = vazaoHull * (taxaHull / 100);
    const gasLP = vazaoLPFlare * (taxaLP / 100);
    const gasHP = vazaoHPFlare * (taxaHP / 100);
    const gasTotal = gasHull + gasLP + gasHP;

    const residualHull = vazaoHull * (1 - taxaHull / 100);
    const residualLP = vazaoLPFlare * (1 - taxaLP / 100);
    const residualHP = vazaoHPFlare * (1 - taxaHP / 100);

    // Cálculo simplificado de emissões (usando fatores do EmissionCalculator)
    const emissoesLP = residualLP * 365 * 2.75 / 1000;
    const emissoesHP = residualHP * 365 * 2.75 / 1000;
    const emissoesHull = residualHull * 365 * 0.679 / 1000;
    const emissoesTotal = emissoesLP + emissoesHP + emissoesHull;

    const reducaoEmissoes = cenarioAtual.emissoes_total - emissoesTotal;
    const taxaRecuperacao = (gasTotal / (vazaoLPFlare + vazaoHPFlare)) * 100;

    return { gasTotal, emissoesTotal, reducaoEmissoes, taxaRecuperacao };
  };

  const cenariosProbabilisticos = {
    otimista: {
      nome: 'Otimista',
      taxaHull: 98,
      taxaLP: 95,
      taxaHP: 95,
      probabilidade: 15,
      cor: 'green',
      ...calcularCenarioMonteCarlo(98, 95, 95)
    },
    realista: {
      nome: 'Realista (Base)',
      taxaHull: 95,
      taxaLP: 91,
      taxaHP: 91,
      probabilidade: 70,
      cor: 'blue',
      ...calcularCenarioMonteCarlo(95, 91, 91)
    },
    pessimista: {
      nome: 'Pessimista',
      taxaHull: 90,
      taxaLP: 85,
      taxaHP: 85,
      probabilidade: 15,
      cor: 'orange',
      ...calcularCenarioMonteCarlo(90, 85, 85)
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={16} className="text-green-600" />
          <h2 className="text-sm font-bold text-green-900">Método Proposto - Sistema de Recuperação</h2>
        </div>
        <p className="text-xs text-gray-700">
          Sistema integrado de captura, compressão e recuperação de gás
        </p>
      </div>

      {/* Descrição do Sistema */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Descrição do Sistema Proposto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-800 mb-2">Inovações Técnicas:</h4>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• Sistema de captura Hull Vent ({taxaRecuperacaoHull}%)</li>
              <li>• Compressão de gás recuperado</li>
              <li>• Integração com rede de gás existente</li>
              <li>• Redução LP Flare em {taxaReducaoLP}%</li>
              <li>• Redução HP Flare em {taxaReducaoHP}%</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-800 mb-2">Novos Equipamentos:</h4>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>• Sistema de captura Hull Vent</li>
              <li>• Compressor de recuperação</li>
              <li>• Tubulação de interligação</li>
              <li>• Instrumentação e controle</li>
              <li>• Sistema de tratamento de gás</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance do Sistema */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Performance do Sistema</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Gás Recuperado</p>
            <h3 className="text-lg font-bold text-green-700">
              {NumberFormatter.format(gasTotalRecuperado / 1000, 1)}
            </h3>
            <p className="text-xs text-green-600 font-semibold">KSm³/d</p>
            <p className="text-xs text-gray-500 mt-1">
              {NumberFormatter.format(percentualRecuperado, 1)}% do flare
            </p>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Redução LP Flare</p>
            <h3 className="text-lg font-bold text-blue-700">
              {NumberFormatter.format(gasLPRecuperado, 0)}
            </h3>
            <p className="text-xs text-blue-600 font-semibold">Sm³/d</p>
            <p className="text-xs text-red-600 mt-1 font-semibold">
              -{taxaReducaoLP}%
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Redução HP Flare</p>
            <h3 className="text-lg font-bold text-purple-700">
              {NumberFormatter.format(gasHPRecuperado, 0)}
            </h3>
            <p className="text-xs text-purple-600 font-semibold">Sm³/d</p>
            <p className="text-xs text-red-600 mt-1 font-semibold">
              -{taxaReducaoHP}%
            </p>
          </div>

          <div className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-600 mb-1">Taxa Global</p>
            <h3 className="text-lg font-bold text-orange-700">
              {NumberFormatter.format(percentualRecuperado, 1)}
            </h3>
            <p className="text-xs text-orange-600 font-semibold">%</p>
            <p className="text-xs text-gray-500 mt-1">
              % de gás recuperado
            </p>
          </div>
        </div>
      </div>

      {/* Balanço de Massa */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Balanço de Massa</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
              <CheckCircle size={14} />
              Gás Recuperado
            </h4>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>LP Flare + Hull Vent ({taxaReducaoLP}%):</span>
                <span className="font-semibold">{NumberFormatter.format(gasHPRecuperado + gasHullCapturado, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span>Recuperação HP Flare ({taxaReducaoHP}%):</span>
                <span className="font-semibold">{NumberFormatter.format(gasLPRecuperado, 0)} Sm³/d</span>
              </div>
              <div className="border-t border-green-300 pt-1 mt-1">
                <div className="flex justify-between font-bold text-green-800">
                  <span>Total Recuperado:</span>
                  <span className="text-sm">{NumberFormatter.format(gasTotalRecuperado, 0)} Sm³/d</span>
                </div>
              </div>
              <div className="text-xs text-green-700 mt-2">
                Destinação: Rede de gás / Exportação / Injeção
              </div>
            </div>
          </div>

          <div className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-orange-900 mb-2 flex items-center gap-1">
              <TrendingDown size={14} />
              Emissões Residuais
            </h4>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>LP Flare + Hull Vent (reduzido):</span>
                <span className="font-semibold">{NumberFormatter.format(vazaoHPResidual + vazaoHullResidual, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-red-600">(-{taxaReducaoLP}%)</span>
              </div>
              <div className="flex justify-between">
                <span>HP Flare (reduzido):</span>
                <span className="font-semibold">{NumberFormatter.format(vazaoLPResidual, 0)} Sm³/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-red-600">(-{taxaReducaoHP}%)</span>
              </div>
              <div className="border-t border-orange-300 pt-1 mt-1">
                <div className="flex justify-between font-bold text-orange-800">
                  <span>Total Emitido:</span>
                  <span className="text-sm">{NumberFormatter.format(totalEmitido, 0)} Sm³/d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emissões Reduzidas */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Emissões de GEE (Reduzidas)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tabela Comparativa */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-800 mb-2">Comparação de Emissões</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left font-semibold text-gray-700">Fonte</th>
                    <th className="px-2 py-1 text-right font-semibold text-gray-700">Antes</th>
                    <th className="px-2 py-1 text-right font-semibold text-gray-700">Depois</th>
                    <th className="px-2 py-1 text-right font-semibold text-gray-700">Redução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-2 py-1 text-gray-700">LP Flare + Hull Vent</td>
                    <td className="px-2 py-1 text-right font-medium">{NumberFormatter.format(cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull, 0)}</td>
                    <td className="px-2 py-1 text-right font-medium text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, 0)}</td>
                    <td className="px-2 py-1 text-right font-semibold text-green-700">
                      {NumberFormatter.format((((cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull) - (cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull)) / (cenarioAtual.emissoes_hp_flare + cenarioAtual.emissoes_hull) * 100), 1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 text-gray-700">HP Flare</td>
                    <td className="px-2 py-1 text-right font-medium">{NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0)}</td>
                    <td className="px-2 py-1 text-right font-medium text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)}</td>
                    <td className="px-2 py-1 text-right font-semibold text-green-700">
                      {NumberFormatter.format(((cenarioAtual.emissoes_lp_flare - cenarioProposto.emissoes_lp_flare) / cenarioAtual.emissoes_lp_flare * 100), 1)}%
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-2 py-1 text-gray-900">TOTAL</td>
                    <td className="px-2 py-1 text-right">{NumberFormatter.format(cenarioAtual.emissoes_total, 0)}</td>
                    <td className="px-2 py-1 text-right text-green-700">{NumberFormatter.format(cenarioProposto.emissoes_total, 0)}</td>
                    <td className="px-2 py-1 text-right text-green-700">{NumberFormatter.format(reducaoPercentual, 1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card de Emissões Reduzidas */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-white text-center mb-2">Emissões Reduzidas</h4>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-100">LP Flare + Hull Vent:</span>
                  <span className="font-semibold">{NumberFormatter.format(cenarioProposto.emissoes_hp_flare + cenarioProposto.emissoes_hull, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-100">HP Flare:</span>
                  <span className="font-semibold">{NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xs text-green-800 font-semibold mb-1">TOTAL ANUAL (NOVO)</p>
              <h2 className="text-xl font-bold text-green-700 mb-1">
                {NumberFormatter.format(cenarioProposto.emissoes_total, 0)}
              </h2>
              <p className="text-xs text-green-800 font-semibold">toneladas CO₂eq</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mt-2 text-center">
              <p className="text-xs font-semibold mb-1">REDUÇÃO: {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano</p>
              <p className="text-lg font-bold">↓ {NumberFormatter.format(reducaoPercentual, 1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios e Vantagens */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">Benefícios e Vantagens</h3>

        <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <Leaf size={16} className="text-green-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-green-900 mb-2">Principais Benefícios do Sistema</h4>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Aproveitamento Energético:</strong> {NumberFormatter.format(cenarioProposto.vazao_anual_recuperada / 1e6, 2)} MSm³/ano de gás recuperado
                  </div>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Redução de Emissões:</strong> {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano ({NumberFormatter.format(reducaoPercentual, 1)}%)
                  </div>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Geração de Receita:</strong> Gás recuperado pode ser comercializado ou usado
                  </div>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Conformidade Ambiental:</strong> Alinhado com regulações de zero flare
                  </div>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Sustentabilidade:</strong> Contribui para metas ESG da empresa
                  </div>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-green-600">•</span>
                  <div>
                    <strong>Eficiência Operacional:</strong> Otimização do aproveitamento de recursos
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Simulação Monte Carlo - Análise Probabilística */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Análise Monte Carlo - Cenários Técnicos</h3>
          <button
            onClick={() => setShowMonteCarlo(!showMonteCarlo)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <BarChart3 size={14} />
            {showMonteCarlo ? 'Ocultar' : 'Mostrar'} Simulação
          </button>
        </div>

        {showMonteCarlo && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-gray-700 mb-2">
                <strong>Simulação probabilística</strong> considerando variações nas taxas de recuperação do sistema.
                Os três cenários representam diferentes condições operacionais e eficiências do equipamento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cenário Pessimista */}
              <div className="bg-white border-2 border-orange-300 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-orange-800">{cenariosProbabilisticos.pessimista.nome}</h4>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-semibold">
                    {cenariosProbabilisticos.pessimista.probabilidade}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-gray-600 mb-1">Taxas de Recuperação:</p>
                    <div className="space-y-0.5 text-gray-700">
                      <div className="flex justify-between">
                        <span>Hull Vent:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.pessimista.taxaHull}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.pessimista.taxaLP}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.pessimista.taxaHP}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-orange-200 pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Gás Recuperado:</span>
                      <span className="font-bold text-orange-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.gasTotal / 1000, 1)} KSm³/d
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Taxa Global:</span>
                      <span className="font-bold text-orange-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Redução Emissões:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.reducaoEmissoes, 0)} t/ano
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cenário Realista */}
              <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-blue-800">{cenariosProbabilisticos.realista.nome}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    {cenariosProbabilisticos.realista.probabilidade}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600 mb-1">Taxas de Recuperação:</p>
                    <div className="space-y-0.5 text-gray-700">
                      <div className="flex justify-between">
                        <span>Hull Vent:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.realista.taxaHull}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.realista.taxaLP}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.realista.taxaHP}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Gás Recuperado:</span>
                      <span className="font-bold text-blue-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.gasTotal / 1000, 1)} KSm³/d
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Taxa Global:</span>
                      <span className="font-bold text-blue-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Redução Emissões:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.reducaoEmissoes, 0)} t/ano
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cenário Otimista */}
              <div className="bg-white border-2 border-green-400 rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-green-800">{cenariosProbabilisticos.otimista.nome}</h4>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">
                    {cenariosProbabilisticos.otimista.probabilidade}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600 mb-1">Taxas de Recuperação:</p>
                    <div className="space-y-0.5 text-gray-700">
                      <div className="flex justify-between">
                        <span>Hull Vent:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.otimista.taxaHull}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.otimista.taxaLP}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HP Flare:</span>
                        <span className="font-semibold">{cenariosProbabilisticos.otimista.taxaHP}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-green-200 pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Gás Recuperado:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.gasTotal / 1000, 1)} KSm³/d
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Taxa Global:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Redução Emissões:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.reducaoEmissoes, 0)} t/ano
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo Estatístico */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Resumo Estatístico</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 mb-1">Gás Recuperado (KSm³/d):</p>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Mínimo:</span>
                      <span className="font-bold text-orange-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.gasTotal / 1000, 1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esperado:</span>
                      <span className="font-bold text-blue-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.gasTotal / 1000, 1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máximo:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.gasTotal / 1000, 1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 mb-1">Taxa de Recuperação (%):</p>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Mínimo:</span>
                      <span className="font-bold text-orange-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esperado:</span>
                      <span className="font-bold text-blue-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máximo:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.taxaRecuperacao, 1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600 mb-1">Redução de Emissões (t/ano):</p>
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Mínimo:</span>
                      <span className="font-bold text-orange-700">
                        {NumberFormatter.format(cenariosProbabilisticos.pessimista.reducaoEmissoes, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Esperado:</span>
                      <span className="font-bold text-blue-700">
                        {NumberFormatter.format(cenariosProbabilisticos.realista.reducaoEmissoes, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máximo:</span>
                      <span className="font-bold text-green-700">
                        {NumberFormatter.format(cenariosProbabilisticos.otimista.reducaoEmissoes, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
