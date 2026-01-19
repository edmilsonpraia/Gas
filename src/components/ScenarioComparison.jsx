import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Leaf, ChevronDown, ChevronUp } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import { EmissionCalculator } from '../utils/calculations';

/**
 * Componente de Comparação de Cenários (Atual vs Proposto)
 */
export default function ScenarioComparison({ data }) {
  const [showSpecs, setShowSpecs] = useState(true);

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);
  const equivalencias = EmissionCalculator.calcularEquivalencias(cenarioAtual.emissoes_total);

  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;
  const reducaoPercentual = (reducaoEmissoes / cenarioAtual.emissoes_total) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner de Alerta Ambiental */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8 shadow-strong">
        <div className="flex items-center justify-center gap-3 mb-3">
          <AlertTriangle size={32} />
          <h2 className="text-3xl font-bold">EMISSÕES DE GASES DE EFEITO ESTUFA (GEE)</h2>
        </div>
        <p className="text-center text-red-100 text-lg">
          Impacto Ambiental Crítico - Sistema Atual
        </p>
      </div>

      {/* Emissões Totais - Destaque */}
      <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-xl p-10 shadow-strong border-4 border-red-500">
        <h1 className="text-6xl font-bold text-center mb-3">
          {NumberFormatter.format(cenarioAtual.emissoes_total, 0)}
        </h1>
        <p className="text-2xl text-center text-red-100 font-semibold mb-4">
          toneladas CO₂eq / ano
        </p>
        <p className="text-center text-red-200">
          Equivalente a {NumberFormatter.format(equivalencias.carros, 0)} carros rodando por 1 ano
        </p>
      </div>

      {/* Botão para Mostrar/Ocultar Especificações */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
        >
          {showSpecs ? (
            <>
              <ChevronUp size={20} />
              Ocultar Especificações Técnicas
            </>
          ) : (
            <>
              <ChevronDown size={20} />
              Mostrar Especificações Técnicas
            </>
          )}
        </button>
      </div>

      {/* Especificações Técnicas do Campo */}
      {showSpecs && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Especificações de Óleo, Água e Gás */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚗️ Óleo, Água e Gás</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Densidade:</span>
              <span className="font-semibold text-gray-900">920 kg/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Viscosidade:</span>
              <span className="font-semibold text-gray-900">5.5 cPo @ 40°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">GOR:</span>
              <span className="font-semibold text-gray-900">70 Nm³/m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Salinidade do Reservatório:</span>
              <span className="font-semibold text-gray-900">120 g/l</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Bário:</span>
              <span className="font-semibold text-gray-900">200 ppm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">BSW:</span>
              <span className="font-semibold text-gray-900">0 - 90%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">H₂S / CO₂:</span>
              <span className="font-semibold text-gray-900">0% / 5% (gás)</span>
            </div>
          </div>
        </div>

        {/* Especificações de Exportação e Água Produzida */}
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Especificações de Exportação</h3>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Óleo de Exportação:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Salinidade:</span>
                <span className="font-medium text-gray-900">&lt; 80 mg/l</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BSW:</span>
                <span className="font-medium text-gray-900">&lt; 0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RVP:</span>
                <span className="font-medium text-gray-900">&lt; 10 psi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperatura:</span>
                <span className="font-medium text-gray-900">45°C</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Água Produzida:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Disposição:</span>
                <span className="font-medium text-gray-900">Sem descarte</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HC:</span>
                <span className="font-medium text-gray-900">&lt; 40 ppm</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Água de Slops:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">HC:</span>
                <span className="font-medium text-gray-900">&lt; 15 ppm</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Grid de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cenário Atual */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            Cenário Atual
          </h3>

          {/* Imagem do Sistema Atual */}
          <div className="mb-4">
            <img
              src="/01.jpeg"
              alt="Sistema Atual - Método Convencional"
              className="w-full rounded-lg border-2 border-gray-300 shadow-md"
            />
            <p className="text-sm text-gray-600 text-center mt-2 italic">
              Sistema Atual - Método Convencional
            </p>
          </div>

          {/* Legenda Técnica */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Legenda do Processo:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Separador Trifásico LP (0.6 bar):</strong> Separa óleo, água e gás</li>
              <li>• <strong>Hull Vent Blower:</strong> Sistema de ventilação do casco</li>
              <li>• <strong>KO Drum:</strong> Vaso separador antes dos flares</li>
              <li>• <strong>Flares LP/HP:</strong> Sistemas de queima de gás</li>
            </ul>
          </div>

          {/* Emissões por Fonte */}
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
              <span className="text-sm font-medium text-gray-700">LP Flare</span>
              <span className="text-sm font-bold text-red-700">
                {NumberFormatter.format(cenarioAtual.emissoes_lp_flare, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
              <span className="text-sm font-medium text-gray-700">HP Flare</span>
              <span className="text-sm font-bold text-red-700">
                {NumberFormatter.format(cenarioAtual.emissoes_hp_flare, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
              <span className="text-sm font-medium text-gray-700">Hull Vent</span>
              <span className="text-sm font-bold text-red-700">
                {NumberFormatter.format(cenarioAtual.emissoes_hull, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-100 rounded border-2 border-red-400">
              <span className="text-base font-bold text-gray-900">TOTAL</span>
              <span className="text-lg font-bold text-red-800">
                {NumberFormatter.format(cenarioAtual.emissoes_total, 0)} tCO₂eq/ano
              </span>
            </div>
          </div>

        </div>

        {/* Cenário Proposto */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Leaf className="text-green-600" size={24} />
            Cenário Proposto (com Recuperação)
          </h3>

          {/* Imagem do Sistema Proposto */}
          <div className="mb-4">
            <img
              src="/02.jpeg"
              alt="Sistema Proposto - Método de Recuperação"
              className="w-full rounded-lg border-2 border-green-500 shadow-md"
            />
            <p className="text-sm text-gray-600 text-center mt-2 italic">
              Sistema Proposto - Método de Recuperação de Gás
            </p>
          </div>

          {/* Benefícios */}
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-800 mb-2">Benefícios do Sistema:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>✓ Redução de {reducaoPercentual.toFixed(1)}% nas emissões totais</li>
              <li>✓ Recuperação de {NumberFormatter.format(cenarioProposto.vazao_recuperada, 0)} Sm³/d de gás</li>
              <li>✓ Reaproveitamento do gás recuperado</li>
              <li>✓ Menor impacto ambiental</li>
            </ul>
          </div>

          {/* Emissões por Fonte */}
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">LP Flare</span>
              <span className="text-sm font-bold text-green-700">
                {NumberFormatter.format(cenarioProposto.emissoes_lp_flare, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">HP Flare</span>
              <span className="text-sm font-bold text-green-700">
                {NumberFormatter.format(cenarioProposto.emissoes_hp_flare, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-sm font-medium text-gray-700">Hull Vent</span>
              <span className="text-sm font-bold text-green-700">
                {NumberFormatter.format(cenarioProposto.emissoes_hull, 0)} tCO₂eq/ano
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-100 rounded border-2 border-green-400">
              <span className="text-base font-bold text-gray-900">TOTAL</span>
              <span className="text-lg font-bold text-green-800">
                {NumberFormatter.format(cenarioProposto.emissoes_total, 0)} tCO₂eq/ano
              </span>
            </div>
          </div>

          {/* Redução de Emissões */}
          <div className="mt-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={20} className="text-green-600" />
                <span className="font-semibold text-green-900">Redução de Emissões</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {NumberFormatter.format(reducaoEmissoes, 0)} tCO₂eq/ano
              </p>
              <p className="text-sm text-green-600 mt-1">
                ({reducaoPercentual.toFixed(1)}% de redução)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equivalências Ambientais */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Leaf className="text-green-600" size={24} />
          Impacto Ambiental em Números
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-2">🚗</div>
            <div className="text-3xl font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.carros, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">carros/ano</div>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-2">🌳</div>
            <div className="text-3xl font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.arvores, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">árvores necessárias</div>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-2">🏠</div>
            <div className="text-3xl font-bold text-gray-900">
              {NumberFormatter.format(equivalencias.casas, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">casas/ano</div>
          </div>
        </div>
      </div>
    </div>
  );
}
