import React, { useState, useEffect } from 'react';
import {
  BookOpen24Regular,
  ChevronDown12Regular,
  ChevronRight12Regular,
  Code16Regular,
  MathFormula16Regular,
  Beaker16Regular,
  Calculator16Regular,
  ArrowShuffle16Regular,
  Play16Regular,
} from '@fluentui/react-icons';
import { NumberFormatter } from '../utils/unitConverter';
import MonteCarloSimulation from './MonteCarloSimulation';
import { useLanguage } from '../contexts/LanguageContext';

export default function MethodologyFormulas({ data }) {
  const { t } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    emissions: true,
    recovery: false,
    balance: false,
    conversion: false,
    montecarlo: false,
    montecarlo_interactive: false,
  });

  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggle = (s) => setExpandedSections((p) => ({ ...p, [s]: !p[s] }));

  // Data
  const vazaoLPFlare = data.monitoring?.totals?.totalLP || 19925;
  const vazaoHPFlare = data.monitoring?.totals?.totalHP || 7975;
  const vazaoHull = data.monitoring?.totals?.totalHull || 40000;
  const taxaRecuperacaoHull = 95;
  const taxaReducaoLP = 91;
  const taxaReducaoHP = 91;

  // Theme tokens
  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const bgCard = isDark ? '#252526' : '#f8f8f8';
  const border = isDark ? '#3e3e3e' : '#e5e7eb';
  const txt = isDark ? '#d4d4d4' : '#1f2937';
  const txtS = isDark ? '#858585' : '#6b7280';
  const C = {
    accent: '#007acc',
    keyword: '#569cd6',
    string: '#ce9178',
    number: '#b5cea8',
    func: '#dcdcaa',
    type: '#4ec9b0',
    comment: '#6a9955',
    red: '#f44747',
    purple: '#c586c0',
    orange: '#e88a3a',
  };

  return (
    <div className="animate-fade-in space-y-3">
      {/* Header — Title Bar */}
      <div className="card border-l-2 border-l-vs-keyword">
        <div className="flex items-center gap-2">
          <BookOpen24Regular style={{ color: C.keyword }} />
          <div>
            <h2 className="text-xl font-bold" style={{ color: txt }}>
              {t.methodologyTitle}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: txtS }}>
              {t.methodologySubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 1. GHG EMISSIONS */}
      <Section
        icon={<Beaker16Regular />}
        title={t.ghgEmissionsTitle}
        filename="emissions.calc"
        expanded={expandedSections.emissions}
        onToggle={() => toggle('emissions')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <div className="space-y-4">
          {/* 1.1 Emission Factor */}
          <SubHeading color={C.keyword}>{t.emissionFactorTitle}</SubHeading>
          <Desc color={txtS}>{t.emissionFactorDesc}</Desc>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock isDark={isDark} C={C} border={border} lines={[
              { type: 'comment', text: `// ${t.emissionFactorValue}` },
              { type: 'comment', text: `// ${t.derivation}` },
              { type: 'var', text: `const density = 0.0019;     // ${t.methaneDensity}` },
              { type: 'var', text: `const molarFrac = 0.85;     // ${t.molarFraction}` },
              { type: 'var', text: `const GWP_CH4 = 28;         // ${t.gwpMethane}` },
              { type: 'blank' },
              { type: 'calc', text: `const FE = density * molarFrac * GWP_CH4 / 1000;` },
              { type: 'result', text: `// FE = 0.001615 tCO₂eq/Sm³` },
            ]} />

            <InfoBox isDark={isDark} C={C} border={border} title={t.units} items={[
              t.sm3Unit,
              t.tco2eqUnit,
              t.kgSm3Unit,
            ]} />
          </div>

          {/* 1.2 Annual Emissions */}
          <SubHeading color={C.keyword}>{t.annualEmissionsTitle}</SubHeading>
          <Desc color={txtS}>{t.annualEmissionsDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>E</span>
            <sub style={{ color: txtS }}>anual</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.func }}>V</span>
            <span style={{ color: txt }}> × </span>
            <span style={{ color: C.number }}>365</span>
            <span style={{ color: txt }}> × </span>
            <span style={{ color: C.func }}>FE</span>
          </FormulaBox>

          <WhereBlock isDark={isDark} C={C} border={border} txtS={txtS} items={[
            { sym: 'E_anual', desc: t.eAnnual },
            { sym: 'V', desc: t.flowV },
            { sym: '365', desc: t.daysPerYear },
            { sym: 'FE', desc: t.emissionFactor },
          ]} />

          <TerminalExample
            isDark={isDark}
            C={C}
            border={border}
            title={`${t.exampleCalculation} — ${t.lpFlareExample}`}
            lines={[
              `> ${t.inputData}`,
              `  ${t.lpFlareFlow}: ${NumberFormatter.format(vazaoLPFlare, 0)} Sm³/d`,
              `  FE = 0.001615 tCO₂eq/Sm³`,
              '',
              `> ${t.calculation}`,
              `  E_LP = ${NumberFormatter.format(vazaoLPFlare, 0)} × 365 × 0.001615`,
              `  E_LP = ${NumberFormatter.format(vazaoLPFlare * 365 * 0.001615, 2)} tCO₂eq/ano`,
            ]}
          />

          {/* 1.3 Total Emissions */}
          <SubHeading color={C.keyword}>{t.totalEmissionsTitle}</SubHeading>
          <Desc color={txtS}>{t.totalEmissionsDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>E</span>
            <sub style={{ color: txtS }}>total</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.type }}>E</span>
            <sub style={{ color: txtS }}>LP_Flare</sub>
            <span style={{ color: txt }}> + </span>
            <span style={{ color: C.type }}>E</span>
            <sub style={{ color: txtS }}>HP_Flare</sub>
            <span style={{ color: txt }}> + </span>
            <span style={{ color: C.type }}>E</span>
            <sub style={{ color: txtS }}>Hull_Vent</sub>
          </FormulaBox>
        </div>
      </Section>

      {/* 2. GAS RECOVERY */}
      <Section
        icon={<Code16Regular />}
        title={t.gasRecoveryTitle}
        filename="recovery.calc"
        expanded={expandedSections.recovery}
        onToggle={() => toggle('recovery')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <div className="space-y-4">
          {/* 2.1 Hull Vent Capture */}
          <SubHeading color={C.type}>{t.hullVentCaptureTitle}</SubHeading>
          <Desc color={txtS}>{t.hullVentCaptureDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>Hull_cap</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.func }}>Q</span>
            <sub style={{ color: txtS }}>Hull</sub>
            <span style={{ color: txt }}> × (</span>
            <span style={{ color: C.purple }}>η</span>
            <sub style={{ color: txtS }}>Hull</sub>
            <span style={{ color: txt }}> / </span>
            <span style={{ color: C.number }}>100</span>
            <span style={{ color: txt }}>)</span>
          </FormulaBox>

          <WhereBlock isDark={isDark} C={C} border={border} txtS={txtS} items={[
            { sym: 'Q_Hull_cap', desc: t.qHullCaptured },
            { sym: 'Q_Hull', desc: t.qHull },
            { sym: 'η_Hull', desc: t.etaHull },
          ]} />

          <TerminalExample
            isDark={isDark}
            C={C}
            border={border}
            title={`${t.exampleCalculation} — Hull Vent`}
            lines={[
              `> ${t.inputData}`,
              `  ${t.hullFlow}: ${NumberFormatter.format(vazaoHull, 0)} Sm³/d`,
              `  ${t.recoveryRate}: ${taxaRecuperacaoHull}%`,
              '',
              `> ${t.calculation}`,
              `  Q_Hull_cap = ${NumberFormatter.format(vazaoHull, 0)} × ${taxaRecuperacaoHull / 100}`,
              `  Q_Hull_cap = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d`,
            ]}
          />

          {/* 2.2 LP Flare Recovery */}
          <SubHeading color={C.type}>{t.lpFlareRecoveryTitle}</SubHeading>
          <Desc color={txtS}>{t.lpFlareRecoveryDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>LP_rec</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.func }}>Q</span>
            <sub style={{ color: txtS }}>LP_Flare</sub>
            <span style={{ color: txt }}> × (</span>
            <span style={{ color: C.purple }}>η</span>
            <sub style={{ color: txtS }}>LP</sub>
            <span style={{ color: txt }}> / </span>
            <span style={{ color: C.number }}>100</span>
            <span style={{ color: txt }}>)</span>
          </FormulaBox>

          {/* 2.3 Total Gas Recovered */}
          <SubHeading color={C.type}>{t.totalGasRecoveredTitle}</SubHeading>
          <Desc color={txtS}>{t.totalGasRecoveredDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>total_rec</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>Hull_cap</sub>
            <span style={{ color: txt }}> + </span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>LP_rec</sub>
            <span style={{ color: txt }}> + </span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>HP_rec</sub>
          </FormulaBox>

          <TerminalExample
            isDark={isDark}
            C={C}
            border={border}
            title={`${t.exampleCalculation} — ${t.totalRecoveredExample}`}
            lines={[
              `> ${t.calculatedData}`,
              `  Hull Vent: ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} Sm³/d`,
              `  LP Flare:  ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} Sm³/d`,
              `  HP Flare:  ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d`,
              '',
              `> ${t.calculation}`,
              `  Q_total = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100, 0)} + ${NumberFormatter.format(vazaoLPFlare * taxaReducaoLP / 100, 0)} + ${NumberFormatter.format(vazaoHPFlare * taxaReducaoHP / 100, 0)}`,
              `  Q_total = ${NumberFormatter.format(vazaoHull * taxaRecuperacaoHull / 100 + vazaoLPFlare * taxaReducaoLP / 100 + vazaoHPFlare * taxaReducaoHP / 100, 0)} Sm³/d`,
            ]}
          />

          {/* 2.4 Residual Emissions */}
          <SubHeading color={C.type}>{t.residualEmissionsTitle}</SubHeading>
          <Desc color={txtS}>{t.residualEmissionsDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>residual</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.func }}>Q</span>
            <sub style={{ color: txtS }}>atual</sub>
            <span style={{ color: txt }}> × (</span>
            <span style={{ color: C.number }}>1</span>
            <span style={{ color: txt }}> - </span>
            <span style={{ color: C.purple }}>η</span>
            <span style={{ color: txt }}> / </span>
            <span style={{ color: C.number }}>100</span>
            <span style={{ color: txt }}>)</span>
          </FormulaBox>

          <CodeBlock isDark={isDark} C={C} border={border} lines={[
            { type: 'comment', text: `// ${t.appliedToEachSource}` },
            { type: 'var', text: `LP_residual  = Q_LP  × (1 - η_LP  / 100)` },
            { type: 'var', text: `HP_residual  = Q_HP  × (1 - η_HP  / 100)` },
            { type: 'var', text: `Hull_residual = Q_Hull × (1 - η_Hull / 100)` },
          ]} />
        </div>
      </Section>

      {/* 3. MASS BALANCE */}
      <Section
        icon={<ArrowShuffle16Regular />}
        title={t.massBalanceTitle}
        filename="mass_balance.calc"
        expanded={expandedSections.balance}
        onToggle={() => toggle('balance')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <div className="space-y-4">
          <SubHeading color={C.orange}>{t.conservationPrincipleTitle}</SubHeading>
          <Desc color={txtS}>{t.conservationPrincipleDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>entrada</sub>
            <span style={{ color: txt }}> = </span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>saída</sub>
          </FormulaBox>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Current Scenario */}
            <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: isDark ? '#3e1e1e' : '#fef2f2', borderBottom: `1px solid ${border}` }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.red }} />
                <span className="text-xs font-semibold" style={{ color: C.red }}>{t.currentScenarioBalance}</span>
              </div>
              <div className="p-3 font-mono text-xs space-y-1" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <div style={{ color: C.comment }}>{'// Input'}</div>
                <div style={{ color: txt }}>Q_in  = Q_LP + Q_HP + Q_Hull</div>
                <div style={{ color: C.comment }}>{'// Output (100% flared/vented)'}</div>
                <div style={{ color: txt }}>Q_out = Q_LP + Q_HP + Q_Hull</div>
              </div>
            </div>

            {/* Proposed Scenario */}
            <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: isDark ? '#1e3e2e' : '#f0fdf4', borderBottom: `1px solid ${border}` }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.type }} />
                <span className="text-xs font-semibold" style={{ color: C.type }}>{t.proposedScenarioBalance}</span>
              </div>
              <div className="p-3 font-mono text-xs space-y-1" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
                <div style={{ color: C.comment }}>{'// Input'}</div>
                <div style={{ color: txt }}>Q_in  = Q_LP + Q_HP + Q_Hull</div>
                <div style={{ color: C.comment }}>{'// Output (recovered + residual)'}</div>
                <div style={{ color: txt }}>Q_out = Q_rec + Q_LP_res + Q_HP_res + Q_Hull_res</div>
              </div>
            </div>
          </div>

          <SubHeading color={C.orange}>{t.balanceValidationTitle}</SubHeading>
          <Desc color={txtS}>{t.balanceValidationDesc}</Desc>

          <FormulaBox isDark={isDark} C={C} border={border}>
            <span style={{ color: txt }}>|</span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>in</sub>
            <span style={{ color: txt }}> - </span>
            <span style={{ color: C.type }}>Q</span>
            <sub style={{ color: txtS }}>out</sub>
            <span style={{ color: txt }}>| {'<'} </span>
            <span style={{ color: C.number }}>1</span>
            <span style={{ color: txtS }}> Sm³/d</span>
          </FormulaBox>
        </div>
      </Section>

      {/* 4. CONVERSION FACTORS */}
      <Section
        icon={<Calculator16Regular />}
        title={t.conversionFactorsTitle}
        filename="conversions.ref"
        expanded={expandedSections.conversion}
        onToggle={() => toggle('conversion')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <ConversionFactors t={t} isDark={isDark} C={C} border={border} txt={txt} txtS={txtS} />
      </Section>

      {/* 5. MONTE CARLO METHODOLOGY */}
      <Section
        icon={<MathFormula16Regular />}
        title={t.sensitivityAnalysisTitle}
        filename="monte_carlo.theory"
        expanded={expandedSections.montecarlo}
        onToggle={() => toggle('montecarlo')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <MonteCarloMethodology t={t} isDark={isDark} C={C} border={border} txt={txt} txtS={txtS} />
      </Section>

      {/* 6. INTERACTIVE MONTE CARLO */}
      <Section
        icon={<Play16Regular />}
        title={t.monteCarloInteractiveTitle}
        filename="simulation.run"
        expanded={expandedSections.montecarlo_interactive}
        onToggle={() => toggle('montecarlo_interactive')}
        isDark={isDark}
        C={C}
        border={border}
        txt={txt}
        txtS={txtS}
      >
        <div className="space-y-3">
          <Desc color={txtS}>{t.monteCarloInteractiveDesc}</Desc>
          <MonteCarloSimulation data={data} />
        </div>
      </Section>
    </div>
  );
}

/* ================================================================
   Sub-Components — VS Code Themed
   ================================================================ */

function Section({ icon, title, filename, expanded, onToggle, isDark, C, border, txt, txtS, children }) {
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center gap-2 transition-colors hover:opacity-90"
        style={{
          backgroundColor: isDark ? '#252526' : '#f8f8f8',
          borderBottom: expanded ? `1px solid ${border}` : 'none',
        }}
      >
        {expanded
          ? <ChevronDown12Regular style={{ color: txtS }} />
          : <ChevronRight12Regular style={{ color: txtS }} />
        }
        <span style={{ color: C.accent }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color: txt }}>{title}</span>
        <span className="text-[10px] font-mono ml-auto" style={{ color: txtS }}>{filename}</span>
      </button>
      {expanded && (
        <div className="p-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function SubHeading({ children, color }) {
  return (
    <h4 className="text-sm font-bold flex items-center gap-2" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </h4>
  );
}

function Desc({ children, color }) {
  return <p className="text-xs leading-relaxed" style={{ color }}>{children}</p>;
}

function FormulaBox({ isDark, C, border, children }) {
  return (
    <div
      className="px-4 py-3 rounded font-mono text-lg text-center"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
        border: `1px solid ${border}`,
      }}
    >
      {children}
    </div>
  );
}

function WhereBlock({ isDark, C, border, txtS, items }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
      <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6' }}>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtS }}>Variables</span>
      </div>
      <div className="p-3 space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="font-mono font-semibold shrink-0" style={{ color: C.func, minWidth: 70 }}>{item.sym}</span>
            <span style={{ color: txtS }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeBlock({ isDark, C, border, lines }) {
  return (
    <div className="rounded overflow-hidden font-mono text-xs" style={{ border: `1px solid ${border}` }}>
      <div className="px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6' }}>
        <Code16Regular style={{ color: C.accent, width: 14, height: 14 }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: isDark ? '#858585' : '#6b7280' }}>Code</span>
      </div>
      <div className="p-3 space-y-0.5" style={{ backgroundColor: isDark ? '#1e1e1e' : '#fafafa' }}>
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-6 text-right mr-3 select-none shrink-0" style={{ color: isDark ? '#444' : '#ccc' }}>{i + 1}</span>
            {line.type === 'blank' ? (
              <span>&nbsp;</span>
            ) : line.type === 'comment' ? (
              <span style={{ color: C.comment }}>{line.text}</span>
            ) : line.type === 'result' ? (
              <span style={{ color: C.func }}>{line.text}</span>
            ) : (
              <span style={{ color: isDark ? '#d4d4d4' : '#1f2937' }}>{line.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ isDark, C, border, title, items }) {
  return (
    <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
      <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#1e3040' : '#eff6ff', borderBottom: `1px solid ${border}` }}>
        <span className="text-xs font-semibold" style={{ color: C.accent }}>{title}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-xs" style={{ color: isDark ? '#9cdcfe' : '#1e40af' }}>
            <span style={{ color: C.accent }}>{'>'}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalExample({ isDark, C, border, title, lines }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center gap-2 transition-colors hover:opacity-90"
        style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6' }}
      >
        {isOpen
          ? <ChevronDown12Regular style={{ color: isDark ? '#858585' : '#6b7280' }} />
          : <ChevronRight12Regular style={{ color: isDark ? '#858585' : '#6b7280' }} />
        }
        <Calculator16Regular style={{ color: C.purple }} />
        <span className="text-xs font-semibold" style={{ color: C.purple }}>{title}</span>
      </button>
      {isOpen && (
        <div className="p-3 font-mono text-xs space-y-0.5" style={{ backgroundColor: isDark ? '#1a1a2e' : '#1e1e2e' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.startsWith('>') ? C.type : line.startsWith('  ') && line.includes('=') && i === lines.length - 1 ? C.func : '#a0a0a0' }}>
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Conversion Factors
   ================================================================ */
function ConversionFactors({ t, isDark, C, border, txt, txtS }) {
  const volumeRows = [
    { from: 'Sm³', to: 'MMBTU', factor: '0.0353' },
    { from: 'Sm³', to: 'Nm³', factor: '1.055' },
    { from: 'Sm³', to: 'SCF', factor: '35.315' },
    { from: 'KSm³', to: 'Sm³', factor: '1000' },
  ];
  const energyRows = [
    { from: 'CH₄', to: 'CO₂eq', factor: '28' },
    { from: 'tCO₂eq', to: 'USD', factor: '84' },
    { from: 'Sm³/d', to: 'Sm³/ano', factor: '365' },
    { from: 'MMBTU', to: 'GJ', factor: '1.055' },
  ];

  const Table = ({ title, rows, headerColor }) => (
    <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
      <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6', borderBottom: `1px solid ${border}` }}>
        <span className="text-xs font-semibold" style={{ color: headerColor }}>{title}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: `1px solid ${border}` }}>
            <th className="px-3 py-2 text-left font-semibold" style={{ color: txtS }}>{t.from}</th>
            <th className="px-3 py-2 text-left font-semibold" style={{ color: txtS }}>{t.to}</th>
            <th className="px-3 py-2 text-right font-semibold" style={{ color: txtS }}>{t.factor}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
              <td className="px-3 py-1.5 font-semibold" style={{ color: C.type }}>{r.from}</td>
              <td className="px-3 py-1.5" style={{ color: txt }}>{r.to}</td>
              <td className="px-3 py-1.5 text-right font-mono font-semibold" style={{ color: C.number }}>{r.factor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Table title={t.gasVolumeTitle} rows={volumeRows} headerColor={C.accent} />
        <Table title={t.energyEmissionsTitle} rows={energyRows} headerColor={C.type} />
      </div>

      <SubHeading color={C.keyword}>{t.sm3ToMmBtuTitle}</SubHeading>
      <Desc color={txtS}>{t.sm3ToMmBtuDesc}</Desc>
      <FormulaBox isDark={isDark} C={C} border={border}>
        <span style={{ color: C.type }}>E</span>
        <sub style={{ color: txtS }}>MMBTU</sub>
        <span style={{ color: txt }}> = </span>
        <span style={{ color: C.func }}>V</span>
        <sub style={{ color: txtS }}>Sm³</sub>
        <span style={{ color: txt }}> × </span>
        <span style={{ color: C.number }}>0.0353</span>
      </FormulaBox>

      <SubHeading color={C.keyword}>{t.ksm3ToSm3Title}</SubHeading>
      <Desc color={txtS}>{t.ksm3ToSm3Desc}</Desc>
      <FormulaBox isDark={isDark} C={C} border={border}>
        <span style={{ color: C.type }}>Q</span>
        <sub style={{ color: txtS }}>Sm³/d</sub>
        <span style={{ color: txt }}> = </span>
        <span style={{ color: C.func }}>Q</span>
        <sub style={{ color: txtS }}>KSm³/D</sub>
        <span style={{ color: txt }}> × </span>
        <span style={{ color: C.number }}>1000</span>
      </FormulaBox>
    </div>
  );
}

/* ================================================================
   Monte Carlo Methodology
   ================================================================ */
function MonteCarloMethodology({ t, isDark, C, border, txt, txtS }) {
  return (
    <div className="space-y-4">
      <SubHeading color={C.purple}>{t.monteCarloMethodTitle}</SubHeading>
      <Desc color={txtS}>{t.monteCarloMethodDesc}</Desc>

      {/* Process Steps */}
      <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
        <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#2a1e3a' : '#faf5ff', borderBottom: `1px solid ${border}` }}>
          <span className="text-xs font-semibold" style={{ color: C.purple }}>{t.processLabel}</span>
        </div>
        <div className="p-3 space-y-2">
          {[t.processStep1, t.processStep2, t.processStep3, t.processStep4].map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="font-mono font-bold shrink-0" style={{ color: C.number, minWidth: 16 }}>{i + 1}.</span>
              <span style={{ color: txt }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <SubHeading color={C.purple}>{t.distributionsUsedTitle}</SubHeading>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Triangular */}
        <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#1e3040' : '#eff6ff', borderBottom: `1px solid ${border}` }}>
            <span className="text-xs font-semibold" style={{ color: C.accent }}>{t.triangularDistribution}</span>
          </div>
          <div className="p-3">
            <p className="text-xs mb-2" style={{ color: txtS }}>{t.triangularDistributionDesc}</p>
            <div className="space-y-1">
              {[t.triangularParam1, t.triangularParam2, t.triangularParam3].map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span style={{ color: C.accent }}>{'>'}</span>
                  <span style={{ color: txt }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Normal */}
        <div className="rounded overflow-hidden" style={{ border: `1px solid ${border}` }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: isDark ? '#1e302e' : '#ecfdf5', borderBottom: `1px solid ${border}` }}>
            <span className="text-xs font-semibold" style={{ color: C.type }}>{t.normalDistribution}</span>
          </div>
          <div className="p-3">
            <p className="text-xs mb-2" style={{ color: txtS }}>{t.normalDistributionDesc}</p>
            <div className="space-y-1">
              {[t.normalParam1, t.normalParam2].map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span style={{ color: C.type }}>{'>'}</span>
                  <span style={{ color: txt }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SubHeading color={C.purple}>{t.calculatedStatisticsTitle}</SubHeading>

      <CodeBlock isDark={isDark} C={C} border={border} lines={[
        { type: 'comment', text: '// Calculated Statistics' },
        { type: 'var', text: `μ  (Mean)      → ${t.meanMu}` },
        { type: 'var', text: `σ  (Std Dev)   → ${t.stdDevSigma}` },
        { type: 'var', text: `P5  (5th pct)  → ${t.p5}` },
        { type: 'var', text: `P50 (Median)   → ${t.p50}` },
        { type: 'var', text: `P95 (95th pct) → ${t.p95}` },
      ]} />

      {/* Warning box */}
      <div className="rounded overflow-hidden" style={{ border: `1px solid ${isDark ? '#4a4020' : '#fbbf24'}` }}>
        <div className="px-3 py-1.5 flex items-center gap-2" style={{ backgroundColor: isDark ? '#2a2810' : '#fffbeb', borderBottom: `1px solid ${isDark ? '#4a4020' : '#fbbf24'}` }}>
          <span className="text-xs font-semibold" style={{ color: C.func }}>{t.resultsInterpretation}</span>
        </div>
        <div className="p-3 space-y-1.5">
          {[t.interpretation1, t.interpretation2, t.interpretation3].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span style={{ color: C.func }}>{'!'}</span>
              <span style={{ color: txt }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
