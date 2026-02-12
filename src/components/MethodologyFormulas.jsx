import React, { useState } from 'react';
import { BookOpen, Calculator, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';
import MonteCarloSimulation from './MonteCarloSimulation';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Componente de Metodologia - Fórmulas e Cálculos
 * Documenta todas as fórmulas utilizadas no simulador
 */
export default function MethodologyFormulas({ data }) {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    emissions: false,
    recovery: false,
    balance: false,
    conversion: false,
    montecarlo: false,
    montecarlo_interactive: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dados para exemplos de cálculo
  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 27900;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 40000;
  const vazaoHull = 0;
  const taxaRecuperacaoHull = 95;
  const taxaReducaoLP = 91;
  const taxaReducaoHP = 91;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {t.methodologyTitle}
          </h2>
        </div>
        <p className="text-gray-700">
          {t.methodologySubtitle}
        </p>
      </div>

      {/* 1. EMISSÕES DE GEE */}
      <FormulaSection
        title={t.ghgEmissionsTitle}
        expanded={expandedSections.emissions}
        onToggle={() => toggleSection('emissions')}
      >
        <div className="space-y-6">
          {/* 1.1 Fator de Emissão */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.emissionFactorTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.emissionFactorDesc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div className="mb-2">{t.emissionFactorValue}</div>
                <div className="text-gray-400">{t.derivation}</div>
                <div className="ml-4">
                  <div>- {t.methaneDensity}</div>
                  <div>- {t.molarFraction}</div>
                  <div>- {t.gwpMethane}</div>
                </div>
                <div className="mt-2 text-gray-400">{t.calculation}</div>
                <div className="ml-4">
                  <div>FE = 0.0019 × 0.85 × 28 / 1000</div>
                  <div className="text-yellow-300">FE = 0.001615 tCO₂eq/Sm³</div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h5 className="font-semibold text-blue-900 mb-2">{t.units}</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t.sm3Unit}</li>
                  <li>• {t.tco2eqUnit}</li>
                  <li>• {t.kgSm3Unit}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 1.2 Emissões Anuais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.annualEmissionsTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.annualEmissionsDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-2xl font-serif text-gray-800">
                E<sub>anual</sub> = V × 365 × FE
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">{t.where}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>E<sub>anual</sub></strong> = {t.eAnnual}</li>
                <li>• <strong>V</strong> = {t.flowV}</li>
                <li>• <strong>365</strong> = {t.daysPerYear}</li>
                <li>• <strong>FE</strong> = {t.emissionFactor}</li>
              </ul>
            </div>

            {/* Exemplo Expandível */}
            <ExampleCalculation
              title={`${t.exampleCalculation} - ${t.lpFlareExample}`}
              calculation={`${t.inputData}
- ${t.lpFlareFlow}: ${NumberFormatter.format(vazaoLPFlare, 0)} Sm³/d
- ${t.emissionFactor}

${t.calculation}
E_LP_Flare = ${NumberFormatter.format(vazaoLPFlare, 0)} × 365 × 0.001615
E_LP_Flare = ${NumberFormatter.format(vazaoLPFlare * 365 * 0.001615, 2)} tCO₂eq/ano`}
            />
          </div>

          {/* 1.3 Emissões Totais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.totalEmissionsTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.totalEmissionsDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                E<sub>total</sub> = E<sub>LP_Flare</sub> + E<sub>HP_Flare</sub> + E<sub>Hull_Vent</sub>
              </div>
            </div>
          </div>
        </div>
      </FormulaSection>

      {/* 2. RECUPERAÇÃO DE GÁS */}
      <FormulaSection
        title={t.gasRecoveryTitle}
        expanded={expandedSections.recovery}
        onToggle={() => toggleSection('recovery')}
      >
        <div className="space-y-6">
          {/* 2.1 Gás Capturado do Hull Vent */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.hullVentCaptureTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.hullVentCaptureDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>Hull_capturado</sub> = Q<sub>Hull</sub> × (η<sub>Hull</sub> / 100)
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">{t.where}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>Q<sub>Hull_capturado</sub></strong> = {t.qHullCaptured}</li>
                <li>• <strong>Q<sub>Hull</sub></strong> = {t.qHull}</li>
                <li>• <strong>η<sub>Hull</sub></strong> = {t.etaHull}</li>
              </ul>
            </div>

            <ExampleCalculation
              title={`${t.exampleCalculation} - Hull Vent`}
              calculation={`${t.inputData}
- ${t.hullFlow}: ${NumberFormatter.format(vazaoHull, 0)} Sm³/d
- ${t.recoveryRate}: ${taxaRecuperacaoHull}%

${t.calculation}
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull, 0)} × (${taxaRecuperacaoHull}/100)
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull, 0)} × ${taxaRecuperacaoHull / 100}
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d`}
            />
          </div>

          {/* 2.2 Gás Recuperado do LP Flare */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.lpFlareRecoveryTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.lpFlareRecoveryDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>LP_recuperado</sub> = Q<sub>LP_Flare</sub> × (η<sub>LP</sub> / 100)
              </div>
            </div>
          </div>

          {/* 2.3 Total de Gás Recuperado */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.totalGasRecoveredTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.totalGasRecoveredDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-xl font-serif text-gray-800">
                Q<sub>total_recuperado</sub> = Q<sub>Hull_capturado</sub> + Q<sub>LP_recuperado</sub> + Q<sub>HP_recuperado</sub>
              </div>
            </div>

            <ExampleCalculation
              title={`${t.exampleCalculation} - ${t.totalRecoveredExample}`}
              calculation={`${t.calculatedData}
- ${t.hullVentCaptured}: ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d
- ${t.lpFlareRecovered}: ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} Sm³/d
- ${t.hpFlareRecovered}: ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d

${t.calculation}
Q_total_recuperado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} + ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} + ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)}
Q_total_recuperado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100 + vazaoLPFlare * taxaReducaoLP / 100 + vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d`}
            />
          </div>

          {/* 2.4 Emissões Residuais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.residualEmissionsTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.residualEmissionsDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>residual</sub> = Q<sub>atual</sub> × (1 - η / 100)
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded mt-3">
              <p className="font-semibold mb-2">{t.appliedToEachSource}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• {t.lpFlareResidual} = Q<sub>LP_Flare</sub> × (1 - η<sub>LP</sub>/100)</li>
                <li>• {t.hpFlareResidual} = Q<sub>HP_Flare</sub> × (1 - η<sub>HP</sub>/100)</li>
                <li>• {t.hullVentResidual} = Q<sub>Hull</sub> × (1 - η<sub>Hull</sub>/100)</li>
              </ul>
            </div>
          </div>
        </div>
      </FormulaSection>

      {/* 3. BALANÇO DE MASSA */}
      <FormulaSection
        title={t.massBalanceTitle}
        expanded={expandedSections.balance}
        onToggle={() => toggleSection('balance')}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.conservationPrincipleTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.conservationPrincipleDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>entrada_total</sub> = Q<sub>saída_total</sub>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
              <h5 className="font-semibold text-red-900 mb-3">{t.currentScenarioBalance}</h5>
              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded">
                  <div className="font-mono text-red-800">
                    Q<sub>entrada</sub> = Q<sub>LP_Flare</sub> + Q<sub>HP_Flare</sub> + Q<sub>Hull</sub>
                  </div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="font-mono text-red-800">
                    Q<sub>saída</sub> = Q<sub>LP_Flare</sub> + Q<sub>HP_Flare</sub> + Q<sub>Hull</sub>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-3">{t.proposedScenarioBalance}</h5>
              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded">
                  <div className="font-mono text-green-800">
                    Q<sub>entrada</sub> = Q<sub>LP_Flare</sub> + Q<sub>HP_Flare</sub> + Q<sub>Hull</sub>
                  </div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="font-mono text-green-800 text-xs">
                    Q<sub>saída</sub> = Q<sub>recuperado</sub> + Q<sub>LP_residual</sub> + Q<sub>HP_residual</sub> + Q<sub>Hull_residual</sub>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              {t.balanceValidationTitle}
            </h4>
            <p className="text-gray-700 mb-3">
              {t.balanceValidationDesc}
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                |Q<sub>entrada</sub> - Q<sub>saída</sub>| &lt; 1 Sm³/d
              </div>
            </div>
          </div>
        </div>
      </FormulaSection>

      {/* 4. FATORES DE CONVERSÃO */}
      <FormulaSection
        title={t.conversionFactorsTitle}
        expanded={expandedSections.conversion}
        onToggle={() => toggleSection('conversion')}
      >
        <ConversionFactors t={t} />
      </FormulaSection>

      {/* 5. ANÁLISE MONTE CARLO */}
      <FormulaSection
        title={t.sensitivityAnalysisTitle}
        expanded={expandedSections.montecarlo}
        onToggle={() => toggleSection('montecarlo')}
      >
        <MonteCarloMethodology t={t} />
      </FormulaSection>

      {/* 6. SIMULAÇÃO MONTE CARLO INTERATIVA */}
      <FormulaSection
        title={t.monteCarloInteractiveTitle}
        expanded={expandedSections.montecarlo}
        onToggle={() => toggleSection('montecarlo')}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.monteCarloInteractiveDesc}
          </p>
          <MonteCarloSimulation data={data} />
        </div>
      </FormulaSection>
    </div>
  );
}

/**
 * Componente de seção de fórmula expansível
 */
function FormulaSection({ title, expanded, onToggle, children }) {
  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg"
      >
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de exemplo de cálculo expandível
 */
function ExampleCalculation({ title, calculation }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 border border-gray-300 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors rounded-t-lg"
      >
        <span className="font-semibold text-purple-900 flex items-center gap-2">
          <Calculator size={18} />
          {title}
        </span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {isOpen && (
        <div className="p-3 bg-gray-900 text-green-400 font-mono text-sm rounded-b-lg whitespace-pre-wrap">
          {calculation}
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Fatores de Conversão
 */
function ConversionFactors({ t }) {
  const conversionsVolume = [
    { from: 'Sm³', to: 'MMBTU', factor: 0.0353, description: 'Standard m³ → Million BTU' },
    { from: 'Sm³', to: 'Nm³', factor: 1.055, description: 'Standard m³ → Normal m³' },
    { from: 'Sm³', to: 'SCF', factor: 35.315, description: 'Standard m³ → Standard Cubic Feet' },
    { from: 'KSm³', to: 'Sm³', factor: 1000, description: 'Thousand Sm³ → Sm³' }
  ];

  const conversionsEnergy = [
    { from: 'CH₄', to: 'CO₂eq', factor: 28, description: 'GWP do Metano (100 anos)' },
    { from: 'tCO₂eq', to: 'USD', factor: 84, description: 'Custo de multa ambiental' },
    { from: 'Sm³/d', to: 'Sm³/ano', factor: 365, description: 'Vazão diária → anual' },
    { from: 'MMBTU', to: 'GJ', factor: 1.055, description: 'Million BTU → Gigajoule' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume */}
        <div>
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            {t.gasVolumeTitle}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">{t.from}</th>
                  <th className="px-4 py-2 text-left text-sm">{t.to}</th>
                  <th className="px-4 py-2 text-right text-sm">{t.factor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conversionsVolume.map((conv, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    <td className="px-4 py-2 text-sm font-medium">{conv.from}</td>
                    <td className="px-4 py-2 text-sm">{conv.to}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">{conv.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Energia */}
        <div>
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            {t.energyEmissionsTitle}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">{t.from}</th>
                  <th className="px-4 py-2 text-left text-sm">{t.to}</th>
                  <th className="px-4 py-2 text-right text-sm">{t.factor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conversionsEnergy.map((conv, idx) => (
                  <tr key={idx} className="hover:bg-green-50">
                    <td className="px-4 py-2 text-sm font-medium">{conv.from}</td>
                    <td className="px-4 py-2 text-sm">{conv.to}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">{conv.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fórmulas de Conversão */}
      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          {t.sm3ToMmBtuTitle}
        </h4>
        <p className="text-gray-700 mb-3">
          {t.sm3ToMmBtuDesc}
        </p>

        <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
          <div className="text-center text-2xl font-serif text-gray-800">
            E<sub>MMBTU</sub> = V<sub>Sm³</sub> × 0.0353
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          {t.ksm3ToSm3Title}
        </h4>
        <p className="text-gray-700 mb-3">
          {t.ksm3ToSm3Desc}
        </p>

        <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
          <div className="text-center text-2xl font-serif text-gray-800">
            Q<sub>Sm³/d</sub> = Q<sub>KSm³/D</sub> × 1000
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de Metodologia Monte Carlo
 */
function MonteCarloMethodology({ t }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          {t.monteCarloMethodTitle}
        </h4>
        <p className="text-gray-700 mb-3">
          {t.monteCarloMethodDesc}
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <h5 className="font-semibold text-purple-900 mb-3">{t.processLabel}</h5>
          <ol className="list-decimal list-inside space-y-2 text-gray-800">
            <li>{t.processStep1}</li>
            <li>{t.processStep2}</li>
            <li>{t.processStep3}</li>
            <li>{t.processStep4}</li>
          </ol>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          {t.distributionsUsedTitle}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">{t.triangularDistribution}</h5>
            <p className="text-sm text-blue-800 mb-2">{t.triangularDistributionDesc}</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t.triangularParam1}</li>
              <li>• {t.triangularParam2}</li>
              <li>• {t.triangularParam3}</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">{t.normalDistribution}</h5>
            <p className="text-sm text-green-800 mb-2">{t.normalDistributionDesc}</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• {t.normalParam1}</li>
              <li>• {t.normalParam2}</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          {t.calculatedStatisticsTitle}
        </h4>

        <div className="bg-gray-50 p-4 rounded">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Média (μ)</strong>: {t.meanMu}</li>
            <li>• <strong>Desvio Padrão (σ)</strong>: {t.stdDevSigma}</li>
            <li>• <strong>P5</strong>: {t.p5}</li>
            <li>• <strong>P50</strong>: {t.p50}</li>
            <li>• <strong>P95</strong>: {t.p95}</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          {t.resultsInterpretation}
        </h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• {t.interpretation1}</li>
          <li>• {t.interpretation2}</li>
          <li>• {t.interpretation3}</li>
        </ul>
      </div>
    </div>
  );
}
