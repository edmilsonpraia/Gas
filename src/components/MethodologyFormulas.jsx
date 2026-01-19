import React, { useState } from 'react';
import { BookOpen, Calculator, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { NumberFormatter } from '../utils/unitConverter';

/**
 * Componente de Metodologia - Fórmulas e Cálculos
 * Documenta todas as fórmulas utilizadas no simulador
 */
export default function MethodologyFormulas({ data }) {
  const [expandedSections, setExpandedSections] = useState({
    emissions: false,
    recovery: false,
    balance: false,
    conversion: false,
    montecarlo: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Dados para exemplos de cálculo
  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 18000;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 26000;
  const vazaoHull = 1728000; // Valor padrão Hull Vent
  const taxaRecuperacaoHull = 95;
  const taxaReducaoLP = 85;
  const taxaReducaoHP = 85;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Metodologia - Fórmulas e Cálculos
          </h2>
        </div>
        <p className="text-gray-700">
          Documentação completa de todas as fórmulas utilizadas no simulador
        </p>
      </div>

      {/* 1. EMISSÕES DE GEE */}
      <FormulaSection
        title="🌍 1. Cálculo de Emissões de Gases de Efeito Estufa (GEE)"
        expanded={expandedSections.emissions}
        onToggle={() => toggleSection('emissions')}
      >
        <div className="space-y-6">
          {/* 1.1 Fator de Emissão */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              1.1 Fator de Emissão
            </h4>
            <p className="text-gray-700 mb-3">
              O fator de emissão utilizado considera a composição do gás e o potencial de aquecimento global (GWP) do metano:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div className="mb-2">Fator de Emissão = 0.001615 tCO₂eq/Sm³</div>
                <div className="text-gray-400">Derivação:</div>
                <div className="ml-4">
                  <div>- Densidade do Metano (CH₄): 0.0019 kg/Sm³</div>
                  <div>- Fração Molar de CH₄ no gás: 85% (0.85)</div>
                  <div>- GWP do CH₄ (100 anos): 28</div>
                </div>
                <div className="mt-2 text-gray-400">Cálculo:</div>
                <div className="ml-4">
                  <div>FE = 0.0019 × 0.85 × 28 / 1000</div>
                  <div className="text-yellow-300">FE = 0.001615 tCO₂eq/Sm³</div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h5 className="font-semibold text-blue-900 mb-2">Unidades:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sm³ = Standard metro cúbico</li>
                  <li>• tCO₂eq = toneladas de CO₂ equivalente</li>
                  <li>• kg/Sm³ = quilograma por metro cúbico padrão</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 1.2 Emissões Anuais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              1.2 Emissões Anuais por Fonte
            </h4>
            <p className="text-gray-700 mb-3">
              Para calcular as emissões anuais de cada fonte de emissão:
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-2xl font-serif text-gray-800">
                E<sub>anual</sub> = V × 365 × FE
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">Onde:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>E<sub>anual</sub></strong> = Emissões anuais (tCO₂eq/ano)</li>
                <li>• <strong>V</strong> = Vazão volumétrica (Sm³/d)</li>
                <li>• <strong>365</strong> = Dias por ano</li>
                <li>• <strong>FE</strong> = Fator de Emissão (0.001615 tCO₂eq/Sm³)</li>
              </ul>
            </div>

            {/* Exemplo Expandível */}
            <ExampleCalculation
              title="Exemplo de Cálculo - LP Flare"
              calculation={`Dados de entrada:
- Vazão LP Flare: ${NumberFormatter.format(vazaoLPFlare, 0)} Sm³/d
- Fator de Emissão: 0.001615 tCO₂eq/Sm³

Cálculo:
E_LP_Flare = ${NumberFormatter.format(vazaoLPFlare, 0)} × 365 × 0.001615
E_LP_Flare = ${NumberFormatter.format(vazaoLPFlare * 365 * 0.001615, 2)} tCO₂eq/ano`}
            />
          </div>

          {/* 1.3 Emissões Totais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              1.3 Emissões Totais do Campo
            </h4>
            <p className="text-gray-700 mb-3">
              As emissões totais são a soma de todas as fontes:
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
        title="♻️ 2. Cálculo de Recuperação de Gás"
        expanded={expandedSections.recovery}
        onToggle={() => toggleSection('recovery')}
      >
        <div className="space-y-6">
          {/* 2.1 Gás Capturado do Hull Vent */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              2.1 Gás Capturado do Hull Vent
            </h4>
            <p className="text-gray-700 mb-3">
              O sistema de captura recupera uma fração do gás ventilado:
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>Hull_capturado</sub> = Q<sub>Hull</sub> × (η<sub>Hull</sub> / 100)
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold mb-2">Onde:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>Q<sub>Hull_capturado</sub></strong> = Gás capturado do Hull Vent (Sm³/d)</li>
                <li>• <strong>Q<sub>Hull</sub></strong> = Vazão total do Hull Vent (Sm³/d)</li>
                <li>• <strong>η<sub>Hull</sub></strong> = Taxa de recuperação do Hull (%)</li>
              </ul>
            </div>

            <ExampleCalculation
              title="Exemplo de Cálculo - Hull Vent"
              calculation={`Dados de entrada:
- Vazão Hull Vent: ${NumberFormatter.format(vazaoHull, 0)} Sm³/d
- Taxa de Recuperação: ${taxaRecuperacaoHull}%

Cálculo:
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull, 0)} × (${taxaRecuperacaoHull}/100)
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull, 0)} × ${taxaRecuperacaoHull / 100}
Q_Hull_capturado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d`}
            />
          </div>

          {/* 2.2 Gás Recuperado do LP Flare */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              2.2 Gás Recuperado do LP Flare
            </h4>
            <p className="text-gray-700 mb-3">
              A redução do LP Flare representa o gás que é recuperado ao invés de queimado:
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
              2.3 Total de Gás Recuperado
            </h4>
            <p className="text-gray-700 mb-3">
              O gás total recuperado é a soma de todas as fontes:
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg mb-3">
              <div className="text-center text-xl font-serif text-gray-800">
                Q<sub>total_recuperado</sub> = Q<sub>Hull_capturado</sub> + Q<sub>LP_recuperado</sub> + Q<sub>HP_recuperado</sub>
              </div>
            </div>

            <ExampleCalculation
              title="Exemplo de Cálculo - Total Recuperado"
              calculation={`Dados calculados:
- Hull Vent capturado: ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d
- LP Flare recuperado: ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} Sm³/d
- HP Flare recuperado: ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d

Cálculo:
Q_total_recuperado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} + ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} + ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)}
Q_total_recuperado = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100 + vazaoLPFlare * taxaReducaoLP / 100 + vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d`}
            />
          </div>

          {/* 2.4 Emissões Residuais */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              2.4 Emissões Residuais
            </h4>
            <p className="text-gray-700 mb-3">
              As vazões residuais após a implementação do sistema proposto:
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>residual</sub> = Q<sub>atual</sub> × (1 - η / 100)
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded mt-3">
              <p className="font-semibold mb-2">Aplicado a cada fonte:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• LP Flare residual = Q<sub>LP_Flare</sub> × (1 - η<sub>LP</sub>/100)</li>
                <li>• HP Flare residual = Q<sub>HP_Flare</sub> × (1 - η<sub>HP</sub>/100)</li>
                <li>• Hull Vent residual = Q<sub>Hull</sub> × (1 - η<sub>Hull</sub>/100)</li>
              </ul>
            </div>
          </div>
        </div>
      </FormulaSection>

      {/* 3. BALANÇO DE MASSA */}
      <FormulaSection
        title="⚖️ 3. Balanço de Massa"
        expanded={expandedSections.balance}
        onToggle={() => toggleSection('balance')}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-3">
              3.1 Princípio de Conservação de Massa
            </h4>
            <p className="text-gray-700 mb-3">
              O balanço de massa garante que toda entrada de gás seja contabilizada na saída:
            </p>

            <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
              <div className="text-center text-2xl font-serif text-gray-800">
                Q<sub>entrada_total</sub> = Q<sub>saída_total</sub>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
              <h5 className="font-semibold text-red-900 mb-3">3.2 Cenário Atual</h5>
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
              <h5 className="font-semibold text-green-900 mb-3">3.3 Cenário Proposto</h5>
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
              3.4 Validação do Balanço
            </h4>
            <p className="text-gray-700 mb-3">
              O balanço é considerado fechado quando:
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
        title="🔄 4. Fatores de Conversão"
        expanded={expandedSections.conversion}
        onToggle={() => toggleSection('conversion')}
      >
        <ConversionFactors />
      </FormulaSection>

      {/* 5. ANÁLISE MONTE CARLO */}
      <FormulaSection
        title="🎲 5. Análise de Sensibilidade (Simulação Monte Carlo)"
        expanded={expandedSections.montecarlo}
        onToggle={() => toggleSection('montecarlo')}
      >
        <MonteCarloMethodology />
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
function ConversionFactors() {
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
            5.1 Volume de Gás
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">De</th>
                  <th className="px-4 py-2 text-left text-sm">Para</th>
                  <th className="px-4 py-2 text-right text-sm">Fator</th>
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
            5.2 Energia e Emissões
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">De</th>
                  <th className="px-4 py-2 text-left text-sm">Para</th>
                  <th className="px-4 py-2 text-right text-sm">Fator</th>
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
          5.3 Conversão Sm³ para MMBTU
        </h4>
        <p className="text-gray-700 mb-3">
          Utilizada para calcular o valor econômico do gás recuperado:
        </p>

        <div className="bg-white border-2 border-gray-300 p-4 rounded-lg">
          <div className="text-center text-2xl font-serif text-gray-800">
            E<sub>MMBTU</sub> = V<sub>Sm³</sub> × 0.0353
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          5.4 Conversão KSm³/D para Sm³/d
        </h4>
        <p className="text-gray-700 mb-3">
          Utilizada para dados de monitoramento em milhares de Sm³/d:
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
function MonteCarloMethodology() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          6.1 Método Monte Carlo
        </h4>
        <p className="text-gray-700 mb-3">
          A simulação Monte Carlo permite avaliar a incerteza dos resultados gerando múltiplos cenários aleatórios:
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <h5 className="font-semibold text-purple-900 mb-3">Processo:</h5>
          <ol className="list-decimal list-inside space-y-2 text-gray-800">
            <li>Definir distribuições de probabilidade para parâmetros incertos</li>
            <li>Gerar N amostras aleatórias de cada parâmetro</li>
            <li>Calcular indicadores para cada combinação de amostras</li>
            <li>Analisar distribuição estatística dos resultados</li>
          </ol>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          6.2 Distribuições Utilizadas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">Distribuição Triangular</h5>
            <p className="text-sm text-blue-800 mb-2">Usada para parâmetros com mínimo, moda e máximo conhecidos</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Taxa de recuperação (85% - 95% - 98%)</li>
              <li>• Fator de emissão (variação ±10%)</li>
              <li>• Composição do gás (variação ±5%)</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">Distribuição Normal</h5>
            <p className="text-sm text-green-800 mb-2">Usada para vazões com variação conhecida</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Vazão LP Flare (média ± 10%)</li>
              <li>• Vazão HP Flare (média ± 10%)</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-800 mb-3">
          6.3 Estatísticas Calculadas
        </h4>

        <div className="bg-gray-50 p-4 rounded">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Média (μ)</strong>: Valor esperado das emissões ou recuperação</li>
            <li>• <strong>Desvio Padrão (σ)</strong>: Variabilidade dos resultados</li>
            <li>• <strong>P5</strong>: 5% de chance do resultado ser menor que este valor</li>
            <li>• <strong>P50</strong>: Mediana - 50% de chance acima/abaixo</li>
            <li>• <strong>P95</strong>: 95% de chance do resultado ser menor que este valor</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          Interpretação dos Resultados:
        </h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• P5 e P95 definem o intervalo de confiança de 90% dos resultados</li>
          <li>• Desvio padrão alto indica maior incerteza nos parâmetros</li>
          <li>• Mediana (P50) é mais robusta que a média em distribuições assimétricas</li>
        </ul>
      </div>
    </div>
  );
}
