import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkle24Regular,
  Dismiss24Regular,
  Search20Regular,
  DataTrending20Regular,
  Wrench20Regular,
  CheckmarkCircle20Regular,
  Pipeline20Regular,
  LeafTwo20Regular,
  Money20Regular,
  ArrowCounterclockwise20Regular,
  ArrowDownload20Regular,
  Database20Regular,
  Settings20Regular,
  Send20Regular,
  Chat20Regular,
  Beaker20Regular,
} from '@fluentui/react-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { GasRecoveryOptimizer, EmissionCalculator } from '../utils/calculations';


/* ===== P&ID Symbol Primitives (FPSO standard) ===== */

const SDVSymbol = ({ x, y, color = '#4ec9b0', label, tag }) => (
  <g transform={`translate(${x},${y})`}>
    <polygon points="-8,-6 0,0 -8,6" fill="none" stroke={color} strokeWidth="1.5" />
    <polygon points="8,-6 0,0 8,6" fill="none" stroke={color} strokeWidth="1.5" />
    <line x1="0" y1="0" x2="0" y2="-11" stroke={color} strokeWidth="1.5" />
    <rect x="-6" y="-23" width="12" height="12" fill={color} stroke={color} strokeWidth="0.8" />
    {tag && <text x="0" y="-27" textAnchor="middle" fontSize="6" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x="0" y="14" textAnchor="middle" fontSize="6.5" fontWeight="600" fill={color}>{label}</text>}
  </g>
);

const KODrum = ({ x, y, w, h, label, tag, textColor = '#000' }) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={h * 0.4} cy={h / 2} rx={h * 0.4} ry={h / 2} fill="white" stroke="#000" strokeWidth="1.5" />
    <rect x={h * 0.4} y="0" width={w - h * 0.8} height={h} fill="white" stroke="#000" strokeWidth="1.5" />
    <ellipse cx={w - h * 0.4} cy={h / 2} rx={h * 0.4} ry={h / 2} fill="white" stroke="#000" strokeWidth="1.5" />
    <rect x={h * 0.4 + 1} y="1" width={w - h * 0.8 - 2} height={h - 2} fill="white" stroke="none" />
    {tag && <text x={w / 2} y={h / 2 + 3} textAnchor="middle" fontSize="7" fontWeight="700" fill="#666">{tag}</text>}
    <text x={w / 2} y={h + 13} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={textColor}>{label}</text>
  </g>
);

const EquipBox = ({ x, y, w, h, label, tag, color = '#000', fontSize = 7.5 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect width={w} height={h} fill="white" stroke={color} strokeWidth="1.5" rx="2" />
    {tag && <text x={w / 2} y={h / 2 - 2} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#888">{tag}</text>}
    <text x={w / 2} y={tag ? h / 2 + 9 : h / 2 + 3} textAnchor="middle" fontSize={fontSize} fontWeight="600" fill={color}>{label}</text>
  </g>
);

const CompressorSymbol = ({ x, y, color = '#4ec9b0', tag, label }) => (
  <g transform={`translate(${x},${y})`}>
    {/* Centrifugal compressor: circle with arrow */}
    <circle r="22" fill="white" stroke={color} strokeWidth="2" />
    <path d="M-12,-8 L12,-8 L0,12Z" fill="none" stroke={color} strokeWidth="1.5" />
    {tag && <text x="0" y="-28" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x="0" y="34" textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>{label}</text>}
  </g>
);

const BlowerSymbol = ({ x, y, color = '#4ec9b0', tag, label }) => (
  <g transform={`translate(${x},${y})`}>
    {/* Roots blower: circle with lobes */}
    <circle r="22" fill="white" stroke={color} strokeWidth="2" />
    <circle r="3" fill={color} />
    <path d="M-10,-5 Q0,-15 10,-5" fill="none" stroke={color} strokeWidth="1.5" />
    <path d="M-10,5 Q0,15 10,5" fill="none" stroke={color} strokeWidth="1.5" />
    {tag && <text x="0" y="-28" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={color}>{tag}</text>}
    {label && <text x="0" y="34" textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>{label}</text>}
  </g>
);

const InstrCircle = ({ x, y, tag, color = '#000' }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r="12" fill="white" stroke={color} strokeWidth="1.2" />
    <text x="0" y="4" textAnchor="middle" fontSize="7" fontWeight="600" fill={color}>{tag}</text>
  </g>
);

const DataOverlay = ({ x, y, text, color, bgColor, w = 100 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-w / 2} y="-9" width={w} height="18" rx="3" fill={bgColor} stroke={color} strokeWidth="0.7" />
    <text x="0" y="4" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={color}>{text}</text>
  </g>
);

const UtilizationBar = ({ x, y, percent, color }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="0" y="0" width="50" height="5" rx="2" fill="#e0e0e0" />
    <rect x="0" y="0" width={Math.min(percent, 100) * 0.5} height="5" rx="2" fill={color} />
    <text x="54" y="5" fontSize="6" fontWeight="600" fill={color}>{percent}%</text>
  </g>
);


/* ===== Analysis Step Icons Map ===== */
const STEP_ICONS = {
  scan: Search20Regular,
  equipment: Database20Regular,
  hp: DataTrending20Regular,
  lp: DataTrending20Regular,
  constraints: Settings20Regular,
  optimize: Sparkle24Regular,
  sizing: Wrench20Regular,
  emissions: LeafTwo20Regular,
  economic: Money20Regular,
  diagram: Pipeline20Regular,
  complete: CheckmarkCircle20Regular
};


/* ===== Main Component ===== */

export default function AIAssistant({ data, isDarkMode }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'analysis'
  const [phase, setPhase] = useState('idle'); // idle | analyzing | complete
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [result, setResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const scrollRef = useRef(null);
  const chatScrollRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const isDark = isDarkMode;
  const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

  // --- Chat Knowledge Base ---
  const hpFlow = data?.monitoring?.totals?.totalHP || 7975;
  const lpFlow = data?.monitoring?.totals?.totalLP || 19925;
  const hullVent = data?.monitoring?.totals?.totalHull || 40000;
  const totalFlaring = data?.monitoring?.totals?.totalFlaring || 67900;

  const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
  const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, 0.91);
  const reducaoEmissoes = cenarioAtual.emissoes_total - cenarioProposto.emissoes_total;

  const buildDiagramKnowledge = useCallback(() => ({
    currentDiagram: {
      title: 'Diagrama do Sistema — FPSO Magnolia',
      description: t.language === 'pt'
        ? `O diagrama atual representa o FPSO Magnolia (Block 17, Offshore Angola) com o sistema completo de separação crude (System 30/31/34), compressão de gás (System 51/52) e sistema de flare (System 21). O gás é processado em 2 trains (A/B) com 4 loops de risers, passando por separadores de 1º e 2º estágio, desidratadores e coolers. O sistema proposto de recuperação inclui compressores HP (6KB 5230A) e LP (6KB 5110/5120), e blowers (6KA 2120/2140) para capturar gás dos flares e hull vent.`
        : `The current diagram represents the FPSO Magnolia (Block 17, Offshore Angola) with the complete crude separation system (System 30/31/34), gas compression (System 51/52) and flare system (System 21). Gas is processed in 2 trains (A/B) with 4 riser loops, through 1st and 2nd stage separators, dehydrators and coolers. The proposed recovery system includes HP (6KB 5230A) and LP (6KB 5110/5120) compressors, and blowers (6KA 2120/2140) to capture gas from flares and hull vent.`,
      stats: {
        hpFlare: fmt(hpFlow),
        lpFlare: fmt(lpFlow),
        hullVent: fmt(hullVent),
        totalFlaring: fmt(totalFlaring),
        emissionsBefore: fmt(cenarioAtual.emissoes_total),
        emissionsAfter: fmt(cenarioProposto.emissoes_total),
        reduction: fmt(reducaoEmissoes),
      },
    },
    alternatives: [
      {
        id: 'partial_recovery',
        name: t.language === 'pt' ? 'Recuperação Parcial (LP apenas)' : 'Partial Recovery (LP only)',
        desc: t.language === 'pt'
          ? 'Captura apenas o gás do LP Flare e Hull Vent via blowers, sem compressor HP. Menor CAPEX mas recuperação reduzida (~60%).'
          : 'Captures only LP Flare and Hull Vent gas via blowers, no HP compressor. Lower CAPEX but reduced recovery (~60%).',
        color: '#e88a3a',
      },
      {
        id: 'full_recovery_vru',
        name: t.language === 'pt' ? 'VRU Completa (Vapor Recovery Unit)' : 'Full VRU (Vapor Recovery Unit)',
        desc: t.language === 'pt'
          ? 'Sistema VRU dedicado com compressores de parafuso + ejector para máxima recuperação (>95%). Maior CAPEX mas melhor ROI a longo prazo.'
          : 'Dedicated VRU system with screw compressors + ejector for maximum recovery (>95%). Higher CAPEX but better long-term ROI.',
        color: '#4ec9b0',
      },
      {
        id: 'flare_gas_to_power',
        name: t.language === 'pt' ? 'Flare Gas to Power (FGTP)' : 'Flare Gas to Power (FGTP)',
        desc: t.language === 'pt'
          ? 'Converte gás de flare em energia elétrica via turbinas a gás ou motores reciprocantes. Elimina queima e gera energia para o FPSO.'
          : 'Converts flare gas to electrical power via gas turbines or reciprocating engines. Eliminates flaring and generates power for the FPSO.',
        color: '#569cd6',
      },
      {
        id: 'reinjection',
        name: t.language === 'pt' ? 'Reinjeção de Gás' : 'Gas Reinjection',
        desc: t.language === 'pt'
          ? 'Reinjecta gás recuperado no reservatório para manutenção de pressão e EOR (Enhanced Oil Recovery). Aumenta produção de óleo.'
          : 'Reinjects recovered gas into the reservoir for pressure maintenance and EOR (Enhanced Oil Recovery). Increases oil production.',
        color: '#c586c0',
      },
    ],
  }), [t, hpFlow, lpFlow, hullVent, totalFlaring, cenarioAtual, cenarioProposto, reducaoEmissoes, fmt]);

  // Process chat message
  const processMessage = useCallback((userMsg) => {
    const knowledge = buildDiagramKnowledge();
    const msg = userMsg.toLowerCase();
    const isPT = t.language === 'pt';

    // Pattern matching for responses
    if (msg.includes('diagrama') || msg.includes('diagram') || msg.includes('como funciona') || msg.includes('how') || msg.includes('explain')) {
      return {
        text: knowledge.currentDiagram.description,
        stats: knowledge.currentDiagram.stats,
        type: 'explanation',
      };
    }

    if (msg.includes('alternativ') || msg.includes('outr') || msg.includes('possibilidade') || msg.includes('opç') || msg.includes('option') || msg.includes('other')) {
      return {
        text: isPT
          ? `Existem 4 alternativas principais ao sistema atual de recuperação de gás do FPSO Magnolia. Cada uma tem diferentes trade-offs entre CAPEX, eficiência e complexidade. Selecione uma para ver o diagrama:`
          : `There are 4 main alternatives to the current FPSO Magnolia gas recovery system. Each has different trade-offs between CAPEX, efficiency and complexity. Select one to see the diagram:`,
        alternatives: knowledge.alternatives,
        type: 'alternatives',
      };
    }

    if (msg.includes('parcial') || msg.includes('partial') || msg.includes('lp only') || msg.includes('lp apenas')) {
      const alt = knowledge.alternatives.find(a => a.id === 'partial_recovery');
      return { text: alt.desc, diagram: 'partial_recovery', type: 'diagram', color: alt.color, title: alt.name };
    }

    if (msg.includes('vru') || msg.includes('vapor recovery') || msg.includes('completa')) {
      const alt = knowledge.alternatives.find(a => a.id === 'full_recovery_vru');
      return { text: alt.desc, diagram: 'full_recovery_vru', type: 'diagram', color: alt.color, title: alt.name };
    }

    if (msg.includes('power') || msg.includes('fgtp') || msg.includes('turbina') || msg.includes('energia') || msg.includes('eletric')) {
      const alt = knowledge.alternatives.find(a => a.id === 'flare_gas_to_power');
      return { text: alt.desc, diagram: 'flare_gas_to_power', type: 'diagram', color: alt.color, title: alt.name };
    }

    if (msg.includes('reinj') || msg.includes('eor') || msg.includes('reservat')) {
      const alt = knowledge.alternatives.find(a => a.id === 'reinjection');
      return { text: alt.desc, diagram: 'reinjection', type: 'diagram', color: alt.color, title: alt.name };
    }

    if (msg.includes('emiss') || msg.includes('co2') || msg.includes('carbono') || msg.includes('carbon')) {
      return {
        text: isPT
          ? `📊 Emissões do FPSO Magnolia:\n\n• Antes da recuperação: ${knowledge.currentDiagram.stats.emissionsBefore} tCO₂eq/ano\n• Após recuperação (91%): ${knowledge.currentDiagram.stats.emissionsAfter} tCO₂eq/ano\n• Redução: ${knowledge.currentDiagram.stats.reduction} tCO₂eq/ano\n\nAs emissões são calculadas usando FE = 0.001615 tCO₂eq/Sm³ (GWP CH₄ = 28).`
          : `📊 FPSO Magnolia Emissions:\n\n• Before recovery: ${knowledge.currentDiagram.stats.emissionsBefore} tCO₂eq/yr\n• After recovery (91%): ${knowledge.currentDiagram.stats.emissionsAfter} tCO₂eq/yr\n• Reduction: ${knowledge.currentDiagram.stats.reduction} tCO₂eq/yr\n\nEmissions calculated using EF = 0.001615 tCO₂eq/Sm³ (GWP CH₄ = 28).`,
        type: 'info',
      };
    }

    if (msg.includes('equip') || msg.includes('compressor') || msg.includes('blower') || msg.includes('bomba')) {
      return {
        text: isPT
          ? `⚙️ Equipamentos do Sistema de Recuperação:\n\n• HP Compressor (6KB 5230A): 3rd stage, ${fmt(data?.compressors?.hp?.vazao || 250000)} Sm³/d, ${data?.compressors?.hp?.pressao || 151} bar\n• LP Compressor (6KB 5110/5120): 1st/2nd stage, ${fmt(data?.compressors?.lp?.vazao || 200000)} Sm³/d, ${data?.compressors?.lp?.pressao || 10} bar\n• Hull Vent Blower (6KA 2120/2140): Roots type, VSD, ${fmt(data?.compressors?.blower?.vazao || 250000)} Sm³/d, ${data?.compressors?.blower?.pressao || 1.913} bar\n\nKO Drums: 6DS 2110 (HP), 6DS 2120 (LP), 6DS 2130 (Hull)`
          : `⚙️ Recovery System Equipment:\n\n• HP Compressor (6KB 5230A): 3rd stage, ${fmt(data?.compressors?.hp?.vazao || 250000)} Sm³/d, ${data?.compressors?.hp?.pressao || 151} bar\n• LP Compressor (6KB 5110/5120): 1st/2nd stage, ${fmt(data?.compressors?.lp?.vazao || 200000)} Sm³/d, ${data?.compressors?.lp?.pressao || 10} bar\n• Hull Vent Blower (6KA 2120/2140): Roots type, VSD, ${fmt(data?.compressors?.blower?.vazao || 250000)} Sm³/d, ${data?.compressors?.blower?.pressao || 1.913} bar\n\nKO Drums: 6DS 2110 (HP), 6DS 2120 (LP), 6DS 2130 (Hull)`,
        type: 'info',
      };
    }

    if (msg.includes('flare') || msg.includes('tocha') || msg.includes('queima') || msg.includes('vazão') || msg.includes('flow')) {
      return {
        text: isPT
          ? `🔥 Dados de Flaring Atuais:\n\n• HP Flare: ${knowledge.currentDiagram.stats.hpFlare} Sm³/d (6DS 2110)\n• LP Flare: ${knowledge.currentDiagram.stats.lpFlare} Sm³/d (6DS 2120)\n• Hull Vent: ${knowledge.currentDiagram.stats.hullVent} Sm³/d\n• Total: ${knowledge.currentDiagram.stats.totalFlaring} Sm³/d\n\nO HP Flare opera a 14.0 MMSm³/d design, e o LP Flare a 0.65 MMSm³/d contínuo.`
          : `🔥 Current Flaring Data:\n\n• HP Flare: ${knowledge.currentDiagram.stats.hpFlare} Sm³/d (6DS 2110)\n• LP Flare: ${knowledge.currentDiagram.stats.lpFlare} Sm³/d (6DS 2120)\n• Hull Vent: ${knowledge.currentDiagram.stats.hullVent} Sm³/d\n• Total: ${knowledge.currentDiagram.stats.totalFlaring} Sm³/d\n\nHP Flare operates at 14.0 MMSm³/d design, LP Flare at 0.65 MMSm³/d continuous.`,
        type: 'info',
      };
    }

    // Default response
    return {
      text: isPT
        ? `Posso ajudá-lo com informações sobre:\n\n• Como funciona o diagrama atual do FPSO Magnolia\n• Alternativas de recuperação de gás\n• Dados de emissões e flaring\n• Equipamentos do sistema\n• Diagramas alternativos\n\nTente perguntar: "Quais são as alternativas?" ou "Como funciona o diagrama?"`
        : `I can help you with:\n\n• How the current FPSO Magnolia diagram works\n• Gas recovery alternatives\n• Emissions and flaring data\n• System equipment\n• Alternative diagrams\n\nTry asking: "What are the alternatives?" or "How does the diagram work?"`,
      type: 'help',
    };
  }, [buildDiagramKnowledge, t, data, fmt]);

  // Send chat message
  const sendMessage = useCallback((text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;

    const userMessage = { role: 'user', text: msg.trim(), time: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTypingResponse(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = processMessage(msg.trim());
      const aiMessage = { role: 'ai', ...response, time: new Date() };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTypingResponse(false);
    }, 600 + Math.random() * 800);
  }, [inputText, processMessage]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTypingResponse]);

  // Welcome message
  useEffect(() => {
    if (isOpen && mode === 'chat' && chatMessages.length === 0) {
      const isPT = t.language === 'pt';
      setChatMessages([{
        role: 'ai',
        text: isPT
          ? `Olá! Sou o assistente do Simulador Gas Recovery. Posso explicar o diagrama atual do FPSO Magnolia, mostrar alternativas de recuperação de gás e criar diagramas comparativos. O que deseja saber?`
          : `Hello! I'm the Gas Recovery Simulator assistant. I can explain the current FPSO Magnolia diagram, show gas recovery alternatives and create comparative diagrams. What would you like to know?`,
        type: 'welcome',
        time: new Date(),
      }]);
    }
  }, [isOpen, mode, t]);

  // Analysis steps definition — now references real FPSO equipment
  const getSteps = useCallback(() => [
    { id: 'scan', msg: t.aiStepScanning, delay: 1500 },
    { id: 'equipment', msg: t.aiStepEquipmentDB, delay: 2000 },
    { id: 'hp', msg: `${t.aiStepAnalyzingHP}: ${fmt(hpFlow)} Sm\u00B3/d (6DS 2110 → 6KB 5230A)...`, delay: 1800 },
    { id: 'lp', msg: `${t.aiStepAnalyzingLP}: ${fmt(lpFlow)} Sm\u00B3/d (6DS 2120 → 6KB 5120)...`, delay: 1800 },
    { id: 'constraints', msg: t.aiStepConstraints, delay: 2200 },
    { id: 'optimize', msg: t.aiStepOptimizing, delay: 2500 },
    { id: 'sizing', msg: t.aiStepSizing, delay: 2000 },
    { id: 'emissions', msg: t.aiStepEmissions, delay: 1500 },
    { id: 'economic', msg: t.aiStepEconomic, delay: 1800 },
    { id: 'diagram', msg: t.aiStepDiagram, delay: 2500 },
    { id: 'complete', msg: t.aiStepComplete, delay: 500 }
  ], [t, hpFlow, lpFlow]);

  // Start analysis
  const startAnalysis = useCallback(() => {
    setCompletedSteps([]);
    setCurrentStepIdx(0);
    setTypedText('');
    setResult(null);
    setPhase('analyzing');
  }, []);

  // Open panel and start
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    startAnalysis();
  }, [startAnalysis]);

  // Typing effect
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const steps = getSteps();
    if (currentStepIdx >= steps.length) return;

    const step = steps[currentStepIdx];
    const fullText = step.msg;
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx++;
      setTypedText(fullText.substring(0, charIdx));
      if (charIdx >= fullText.length) {
        clearInterval(interval);

        // Run optimizer on the "optimize" step
        if (step.id === 'optimize') {
          const optimResult = GasRecoveryOptimizer.optimize(data);
          setResult(optimResult);
        }

        // After delay, move to next step
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, { id: step.id, text: fullText }]);
          setTypedText('');

          if (currentStepIdx + 1 >= steps.length) {
            setPhase('complete');
          } else {
            setCurrentStepIdx(prev => prev + 1);
          }
        }, step.delay);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phase, currentStepIdx, data, getSteps]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [completedSteps, typedText]);

  const bg = isDark ? '#1e1e1e' : '#ffffff';
  const panelBg = isDark ? '#252526' : '#ffffff';
  const borderColor = isDark ? '#3c3c3c' : '#e5e5e5';
  const textPrimary = isDark ? '#d4d4d4' : '#1e1e1e';
  const textSec = isDark ? '#858585' : '#6b7280';
  const green = '#4ec9b0';
  const red = '#f44747';
  const accent = '#007acc';
  const purple = '#c586c0';

  // Quick suggestion buttons for chat
  const quickSuggestions = t.language === 'pt'
    ? [
        'Como funciona o diagrama?',
        'Quais são as alternativas?',
        'Dados de emissões',
        'Equipamentos do sistema',
        'Recuperação parcial (LP)',
        'Flare Gas to Power',
        'Reinjeção de gás',
        'VRU Completa',
      ]
    : [
        'How does the diagram work?',
        'What are the alternatives?',
        'Emissions data',
        'System equipment',
        'Partial recovery (LP)',
        'Flare Gas to Power',
        'Gas reinjection',
        'Full VRU',
      ];

  return (
    <>
      {/* ===== FAB Button ===== */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); if (mode === 'analysis') startAnalysis(); }}
          className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-vs-accent text-white
            shadow-lg hover:bg-primary-600 transition-all duration-300 flex items-center justify-center
            ai-fab-pulse"
          title={t.aiAssistantTitle}
        >
          <Sparkle24Regular className="w-6 h-6" />
        </button>
      )}

      {/* ===== Panel Overlay ===== */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            className="fixed right-0 top-0 h-full z-50 shadow-xl slide-in-right flex flex-col"
            style={{
              width: '660px',
              maxWidth: '100vw',
              background: panelBg,
              borderLeft: `1px solid ${borderColor}`
            }}
          >
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent }}>
                  <Sparkle24Regular className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: textPrimary }}>{t.aiAssistantTitle}</h2>
                  <p className="text-xs" style={{ color: textSec }}>{t.aiAssistantSubtitle}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Dismiss24Regular style={{ color: textSec }} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex px-5 gap-1 pt-1" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <button
                onClick={() => setMode('chat')}
                className="px-4 py-2 flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-all"
                style={{
                  color: mode === 'chat' ? accent : textSec,
                  borderBottomColor: mode === 'chat' ? accent : 'transparent',
                }}
              >
                <Chat20Regular className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => { setMode('analysis'); if (phase === 'idle') startAnalysis(); }}
                className="px-4 py-2 flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-all"
                style={{
                  color: mode === 'analysis' ? accent : textSec,
                  borderBottomColor: mode === 'analysis' ? accent : 'transparent',
                }}
              >
                <Beaker20Regular className="w-4 h-4" />
                {t.analysis || 'Analysis'}
              </button>
            </div>

            {/* ===== CHAT MODE ===== */}
            {mode === 'chat' && (
              <>
                {/* Chat Messages */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div
                        className="max-w-[85%] rounded-lg px-3 py-2.5"
                        style={{
                          backgroundColor: msg.role === 'user'
                            ? accent
                            : (isDark ? '#2d2d2d' : '#f3f4f6'),
                          color: msg.role === 'user' ? '#ffffff' : textPrimary,
                        }}
                      >
                        {/* Message Text */}
                        <div className="text-xs leading-relaxed whitespace-pre-line">{msg.text}</div>

                        {/* Stats display */}
                        {msg.stats && (
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {[
                              { label: 'HP Flare', value: `${msg.stats.hpFlare} Sm³/d`, color: red },
                              { label: 'LP Flare', value: `${msg.stats.lpFlare} Sm³/d`, color: red },
                              { label: 'Hull Vent', value: `${msg.stats.hullVent} Sm³/d`, color: purple },
                              { label: 'Total', value: `${msg.stats.totalFlaring} Sm³/d`, color: red },
                              { label: t.emissionReduction || 'Reduction', value: `${msg.stats.reduction} tCO₂eq`, color: green },
                            ].map((s, j) => (
                              <div key={j} className="px-2 py-1 rounded" style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${borderColor}` }}>
                                <div className="text-[9px] uppercase" style={{ color: textSec }}>{s.label}</div>
                                <div className="text-[11px] font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Alternative options */}
                        {msg.alternatives && (
                          <div className="mt-2 space-y-1.5">
                            {msg.alternatives.map((alt) => (
                              <button
                                key={alt.id}
                                onClick={() => sendMessage(alt.name)}
                                className="w-full text-left px-2.5 py-2 rounded transition-colors hover:opacity-90"
                                style={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${alt.color}40` }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alt.color }} />
                                  <span className="text-[11px] font-semibold" style={{ color: alt.color }}>{alt.name}</span>
                                </div>
                                <div className="text-[10px] mt-0.5 ml-4" style={{ color: textSec }}>{alt.desc}</div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Alternative Diagram */}
                        {msg.diagram && (
                          <div className="mt-2 rounded overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
                            <div className="px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: isDark ? '#2a2d2e' : '#f0f8ff', color: msg.color }}>
                              {msg.title}
                            </div>
                            <AlternativeDiagram
                              type={msg.diagram}
                              color={msg.color}
                              isDark={isDark}
                              data={data}
                              textPrimary={textPrimary}
                              textSec={textSec}
                              borderColor={borderColor}
                              fmt={fmt}
                            />
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-[9px] mt-1 text-right" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : textSec }}>
                          {msg.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTypingResponse && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6' }}>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent, animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent, animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent, animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Suggestions */}
                {chatMessages.length <= 1 && (
                  <div className="px-5 py-2 flex flex-wrap gap-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
                    {quickSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(sug)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80"
                        style={{ backgroundColor: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input */}
                <div className="px-5 py-3 flex gap-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={t.language === 'pt' ? 'Pergunte sobre o diagrama...' : 'Ask about the diagram...'}
                    className="flex-1 px-3 py-2 text-xs rounded-lg outline-none transition-colors"
                    style={{
                      backgroundColor: isDark ? '#3c3c3c' : '#f3f4f6',
                      color: textPrimary,
                      border: `1px solid ${borderColor}`,
                    }}
                    disabled={isTypingResponse}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputText.trim() || isTypingResponse}
                    className="px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                    style={{
                      backgroundColor: inputText.trim() ? accent : (isDark ? '#333' : '#e5e5e5'),
                      color: inputText.trim() ? '#ffffff' : textSec,
                    }}
                  >
                    <Send20Regular className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* ===== ANALYSIS MODE ===== */}
            {mode === 'analysis' && (
            <>
            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

              {/* Completed Steps */}
              {completedSteps.map((step, i) => {
                const Icon = STEP_ICONS[step.id] || Search20Regular;
                const isComplete = step.id === 'complete';
                return (
                  <div key={i} className="flex items-start gap-3 animate-fade-in">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: isComplete ? green : `${accent}20`, color: isComplete ? '#fff' : accent }}>
                      {isComplete ? <CheckmarkCircle20Regular className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 text-xs leading-relaxed py-1.5" style={{ color: isComplete ? green : textPrimary }}>
                      {step.text}
                    </div>
                    <CheckmarkCircle20Regular className="w-4 h-4 flex-shrink-0 mt-1.5" style={{ color: green }} />
                  </div>
                );
              })}

              {/* Current Typing Step */}
              {phase === 'analyzing' && typedText && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${accent}20`, color: accent }}>
                    {(() => {
                      const steps = getSteps();
                      const Icon = STEP_ICONS[steps[currentStepIdx]?.id] || Search20Regular;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <div className="flex-1 text-xs leading-relaxed py-1.5 typing-cursor" style={{ color: textPrimary }}>
                    {typedText}
                  </div>
                </div>
              )}

              {/* ===== RESULTS (after analysis complete) ===== */}
              {phase === 'complete' && result && (
                <div className="space-y-4 mt-4 animate-fade-in">

                  {/* Optimized P&ID Diagram with real FPSO equipment */}
                  <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
                    <div className="px-3 py-2 text-xs font-bold" style={{ background: isDark ? '#2a2d2e' : '#f0f8ff', color: accent }}>
                      {t.aiPidTitle}
                    </div>
                    <svg viewBox="0 0 1100 670" className="w-full h-auto" style={{ background: bg }}>
                      <defs>
                        <style>{`
                          @keyframes recFlow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
                          .rec-flow { stroke-dasharray: 10,10; animation: recFlow 0.8s linear infinite; }
                          .res-flow { stroke-dasharray: 4,12; opacity: 0.4; }
                        `}</style>
                        <marker id="aGreen" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="7" markerHeight="5" orient="auto">
                          <path d="M0,0 L8,3 L0,6Z" fill={green} />
                        </marker>
                        <marker id="aDimRed" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="7" markerHeight="5" orient="auto">
                          <path d="M0,0 L8,3 L0,6Z" fill={red} opacity="0.4" />
                        </marker>
                        <marker id="aAccent" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="7" markerHeight="5" orient="auto">
                          <path d="M0,0 L8,3 L0,6Z" fill={accent} />
                        </marker>
                      </defs>

                      {/* Title Bar */}
                      <rect x="0" y="0" width="1100" height="34" fill={isDark ? '#2a2d2e' : '#f0f8ff'} />
                      <text x="550" y="14" textAnchor="middle" fontSize="10" fontWeight="700" fill={green}>
                        {t.aiPidTitle} — {t.aiOptimalEff}: {(result.optimalEfficiency * 100).toFixed(0)}%
                      </text>
                      <text x="550" y="28" textAnchor="middle" fontSize="7.5" fill={textSec}>
                        FPSO Gas Recovery System — Real Equipment from P&amp;ID Database
                      </text>

                      {/* ================================================================ */}
                      {/* ===== HP FLARE SECTION (y=50-230) ===== */}
                      {/* ================================================================ */}

                      {/* HP Section Label */}
                      <rect x="5" y="42" width="85" height="16" rx="3" fill={accent} fillOpacity="0.1" />
                      <text x="48" y="54" textAnchor="middle" fontSize="8" fontWeight="700" fill={accent}>HP FLARE</text>

                      {/* HP Flare KO Drum (6DS 2110) */}
                      <KODrum x={30} y={80} w={145} h={48} label="HP FLARE KO DRUM" tag="6DS 2110" textColor={textPrimary} />

                      {/* HP KO Drum Cooler (6EC 2110) */}
                      <EquipBox x={30} y={145} w={65} h={22} label="COOLER" tag="6EC 2110" color="#666" fontSize={6} />

                      {/* HP KO Drum Pumps */}
                      <text x="115" y="160" fontSize="6" fill="#888">6GX 2110 A/B</text>

                      {/* Recovery pipe: HP KO → SDV 52104 → Suction Scrubber → HP Compressor */}
                      <line x1="175" y1="104" x2="225" y2="104" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* SDV 52104 - HP Recovery */}
                      <SDVSymbol x={250} y={104} color={green} label={t.aiValveOpen} tag="SDV 52104" />

                      {/* SDV → Suction Scrubber */}
                      <line x1="275" y1="104" x2="320" y2="104" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* 1st Stage Suction Scrubber (6DS 5210A) */}
                      <g transform="translate(340,75)">
                        <rect width="36" height="58" rx="4" fill="white" stroke={green} strokeWidth="1.5" />
                        <text x="18" y="26" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={green}>SUCT.</text>
                        <text x="18" y="35" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={green}>SCRUB</text>
                        <text x="18" y="52" textAnchor="middle" fontSize="5" fontWeight="700" fill="#888">6DS</text>
                        <text x="18" y="59" textAnchor="middle" fontSize="5" fontWeight="700" fill="#888">5210A</text>
                      </g>

                      {/* Scrubber → Suction Cooler → HP Compressor */}
                      <line x1="376" y1="104" x2="405" y2="104" stroke={green} strokeWidth="2" className="rec-flow" />

                      {/* 1st Stage Suction Cooler (6EC 5210A) */}
                      <g transform="translate(405,90)">
                        <rect width="40" height="28" rx="2" fill="white" stroke={green} strokeWidth="1.2" />
                        <text x="20" y="12" textAnchor="middle" fontSize="5" fontWeight="600" fill={green}>COOLER</text>
                        <text x="20" y="22" textAnchor="middle" fontSize="5" fontWeight="700" fill="#888">6EC 5210A</text>
                      </g>

                      {/* Cooler → HP Compressor */}
                      <line x1="445" y1="104" x2="475" y2="104" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* HP Compressor 3rd Stage (6KB 5230A) */}
                      <CompressorSymbol x={515} y={104} color={green} tag="6KB 5230A" label="HP COMP. 3rd STG" />

                      {/* PIC 21006 - HP Flare Pressure Controller (from Pressure Control diagram) */}
                      <InstrCircle x={515} y={56} tag="PIC" color={green} />
                      <line x1="515" y1="68" x2="515" y2="82" stroke={green} strokeWidth="1" />
                      <text x="515" y="46" textAnchor="middle" fontSize="5.5" fill={green}>21006</text>
                      <text x="515" y="38" textAnchor="middle" fontSize="4.5" fill={textSec}>SP 950 mbarg</text>

                      {/* HP Comp → Gas Export */}
                      <line x1="537" y1="104" x2="640" y2="104" stroke={green} strokeWidth="2.5" className="rec-flow" markerEnd="url(#aGreen)" />

                      {/* HP Compressor Data Overlay */}
                      <DataOverlay x={515} y={152} text={`${fmt(result.hpCompressor.vazao)} Sm\u00B3/d`} color={green}
                        bgColor={isDark ? '#1e1e1e' : '#f0fff8'} />
                      {result.hpCompressor.utilizacao && (
                        <UtilizationBar x={490} y={164} percent={result.hpCompressor.utilizacao} color={green} />
                      )}

                      {/* Residual to HP TIP (6FB 2110) - thin red */}
                      <line x1="100" y1="80" x2="100" y2="55" stroke={red} strokeWidth="1.5" className="res-flow" markerEnd="url(#aDimRed)" />
                      <text x="100" y="48" textAnchor="middle" fontSize="6.5" fill={red} opacity="0.6">HP TIP</text>
                      <text x="100" y="42" textAnchor="middle" fontSize="5" fill="#888" opacity="0.5">6FB 2110</text>
                      <text x="145" y="70" fontSize="6" fill={red} opacity="0.6">{fmt(result.residualBurn * (hpFlow / (hpFlow + lpFlow)))} Sm³/d</text>


                      {/* ================================================================ */}
                      {/* ===== LP FLARE SECTION (y=250-440) ===== */}
                      {/* ================================================================ */}

                      {/* LP Section Label */}
                      <rect x="5" y="240" width="85" height="16" rx="3" fill={purple} fillOpacity="0.1" />
                      <text x="48" y="252" textAnchor="middle" fontSize="8" fontWeight="700" fill={purple}>LP FLARE</text>

                      {/* LP Flare KO Drum (6DS 2120) */}
                      <KODrum x={30} y={275} w={145} h={48} label="LP FLARE KO DRUM" tag="6DS 2120" textColor={textPrimary} />

                      {/* LP KO Drum Pumps */}
                      <text x="100" y="340" fontSize="6" fill="#888">6GX 2120 A/B</text>

                      {/* LP Recovery pipe: KO → SDV 51204 → Blower → LP Compressor */}
                      <line x1="175" y1="299" x2="225" y2="299" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* SDV 51204 - LP Recovery */}
                      <SDVSymbol x={250} y={299} color={green} label={t.aiValveOpen} tag="SDV 51204" />

                      {/* SDV → Blower */}
                      <line x1="275" y1="299" x2="330" y2="299" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* SDV 21801 - Blower Suction */}
                      <SDVSymbol x={310} y={299} color={green} tag="SDV 21801" />

                      {/* Hull Gas Vent Blower (6KA 2120) - Roots type */}
                      <BlowerSymbol x={375} y={299} color={purple} tag="6KA 2120" label="HULL VENT BLOWER" />

                      {/* VSD Instrument for blower */}
                      <EquipBox x={353} y={248} w={44} h={16} label="VSD" color={purple} fontSize={7} />
                      <line x1="375" y1="264" x2="375" y2="277" stroke={purple} strokeWidth="1" />

                      {/* Blower Data Overlay */}
                      <DataOverlay x={375} y={344} text={`${fmt(result.blower.vazao)} Sm\u00B3/d`} color={purple}
                        bgColor={isDark ? '#1e1e1e' : '#f5f0ff'} />
                      {result.blower.utilizacao && (
                        <UtilizationBar x={350} y={356} percent={result.blower.utilizacao} color={purple} />
                      )}

                      {/* 2nd Blower (6KA 2140) - standby/assist */}
                      <g transform="translate(375,385)">
                        <circle r="15" fill="white" stroke={result.blower2nd?.standby ? '#888' : purple} strokeWidth="1.5" strokeDasharray={result.blower2nd?.standby ? '3,2' : 'none'} />
                        <circle r="2" fill={result.blower2nd?.standby ? '#888' : purple} />
                        <path d="M-7,-3 Q0,-10 7,-3" fill="none" stroke={result.blower2nd?.standby ? '#888' : purple} strokeWidth="1" />
                        <path d="M-7,3 Q0,10 7,3" fill="none" stroke={result.blower2nd?.standby ? '#888' : purple} strokeWidth="1" />
                        <text x="0" y="-20" textAnchor="middle" fontSize="5.5" fontWeight="700" fill={result.blower2nd?.standby ? '#888' : purple}>6KA 2140</text>
                        <text x="0" y="25" textAnchor="middle" fontSize="5.5" fill={result.blower2nd?.standby ? '#888' : purple}>
                          {result.blower2nd?.standby ? 'STANDBY' : `${fmt(result.blower2nd?.vazao || 0)} Sm³/d`}
                        </text>
                        <text x="25" y="0" fontSize="5" fill="#888">VSD</text>
                      </g>

                      {/* Blower → LP Compressor */}
                      <line x1="397" y1="299" x2="455" y2="299" stroke={green} strokeWidth="2.5" className="rec-flow" />

                      {/* PIC 21016 - LP Flare Pressure Controller (from Pressure Control diagram) */}
                      <InstrCircle x={440} y={265} tag="PIC" color={green} />
                      <line x1="440" y1="277" x2="440" y2="299" stroke={green} strokeWidth="1" />
                      <text x="440" y="255" textAnchor="middle" fontSize="5.5" fill={green}>21016</text>
                      <text x="440" y="247" textAnchor="middle" fontSize="4.5" fill={textSec}>SP 70 mbarg</text>

                      {/* LP Compressor 2nd Stage (6KB 5120) */}
                      <CompressorSymbol x={500} y={299} color={green} tag="6KB 5120" label="LP COMP. 2nd STG" />

                      {/* LP Motor (6XA 5100) */}
                      <g transform="translate(540,280)">
                        <rect width="32" height="14" rx="2" fill="white" stroke={green} strokeWidth="1" />
                        <text x="16" y="10" textAnchor="middle" fontSize="5" fontWeight="600" fill={green}>M</text>
                      </g>
                      <text x="570" y="300" fontSize="5" fill="#888">6XA 5100</text>
                      <text x="570" y="308" fontSize="5" fill="#888">{result.lpCompressor.motor || 850} kW</text>

                      {/* LP Comp Data Overlay */}
                      <DataOverlay x={500} y={344} text={`${fmt(result.lpCompressor.vazao)} Sm\u00B3/d`} color={green}
                        bgColor={isDark ? '#1e1e1e' : '#f0fff8'} />
                      {result.lpCompressor.utilizacao && (
                        <UtilizationBar x={475} y={356} percent={result.lpCompressor.utilizacao} color={green} />
                      )}

                      {/* LP Comp → merges to HP header → Gas Export */}
                      <line x1="522" y1="299" x2="600" y2="299" stroke={green} strokeWidth="2.5" className="rec-flow" />
                      <line x1="600" y1="299" x2="640" y2="299" stroke={green} strokeWidth="2" className="rec-flow" />
                      <line x1="640" y1="299" x2="640" y2="104" stroke={green} strokeWidth="2" className="rec-flow" />

                      {/* Residual to LP TIP (6FB 2120) */}
                      <line x1="100" y1="323" x2="100" y2="370" stroke={red} strokeWidth="1.5" className="res-flow" markerEnd="url(#aDimRed)" />
                      <text x="100" y="382" textAnchor="middle" fontSize="6.5" fill={red} opacity="0.6">LP TIP</text>
                      <text x="100" y="392" textAnchor="middle" fontSize="5" fill="#888" opacity="0.5">6FB 2120</text>
                      <text x="145" y="350" fontSize="6" fill={red} opacity="0.6">{fmt(result.residualBurn * (lpFlow / (hpFlow + lpFlow)))} Sm³/d</text>


                      {/* ================================================================ */}
                      {/* ===== GAS EXPORT (right side) ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(660,60)">
                        <rect width="150" height="90" rx="6" fill={green} fillOpacity="0.08" stroke={green} strokeWidth="2" strokeDasharray="6,3" />
                        <text x="75" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill={green}>GAS EXPORT</text>
                        <text x="75" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill={green}>{fmt(result.totalRecovered)}</text>
                        <text x="75" y="55" textAnchor="middle" fontSize="8" fill={textSec}>Sm³/d</text>
                        <text x="75" y="72" textAnchor="middle" fontSize="8.5" fontWeight="600" fill={green}>
                          {(result.optimalEfficiency * 100).toFixed(0)}% {t.recoveryEfficiency || 'recovered'}
                        </text>
                        <text x="75" y="84" textAnchor="middle" fontSize="6.5" fill={textSec}>
                          → 1st/2nd Stage Separation
                        </text>
                      </g>


                      {/* ================================================================ */}
                      {/* ===== SEPARATION TRAINS ===== */}
                      {/* ================================================================ */}
                      <EquipBox x={830} y={80} w={130} h={28} label="1ST STAGE SEP." tag="6DS 3100A/B" color={textPrimary} />
                      <EquipBox x={830} y={118} w={130} h={28} label="2ND STAGE SEP." tag="6DS 3400A/B" color={textPrimary} />
                      <line x1="810" y1="94" x2="830" y2="94" stroke={accent} strokeWidth="1.5" />
                      <line x1="810" y1="104" x2="810" y2="132" stroke={accent} strokeWidth="1.2" />
                      <line x1="810" y1="132" x2="830" y2="132" stroke={accent} strokeWidth="1.5" />

                      {/* Test Separator */}
                      <EquipBox x={830} y={158} w={130} h={22} label="TEST SEP. 6DS 3060" color="#888" fontSize={6.5} />

                      {/* HP Gas Manifold connection */}
                      <line x1="810" y1="94" x2="810" y2="104" stroke={green} strokeWidth="1.5" className="rec-flow" />


                      {/* ================================================================ */}
                      {/* ===== CLOSED BYPASS SDV VALVES + FOV (from Pressure Control diagram) ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(860,210)">
                        <SDVSymbol x={0} y={0} color={red} label={t.aiValveClosed} tag="SDV 21105" />
                        <text x="0" y="26" textAnchor="middle" fontSize="5.5" fill={red}>HP Flare</text>
                      </g>
                      <g transform="translate(930,210)">
                        <SDVSymbol x={0} y={0} color={red} label={t.aiValveClosed} tag="SDV 21205" />
                        <text x="0" y="26" textAnchor="middle" fontSize="5.5" fill={red}>LP Flare</text>
                      </g>
                      {/* FOV Fail-Open Valves (armed, closed in recovery mode) */}
                      <g transform="translate(860,270)">
                        <rect x="-16" y="-8" width="32" height="16" rx="2" fill="white" stroke={red} strokeWidth="1" strokeDasharray="3,2" />
                        <text x="0" y="4" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={red}>FOV</text>
                        <text x="0" y="15" textAnchor="middle" fontSize="5" fill="#888">21104</text>
                      </g>
                      <g transform="translate(930,270)">
                        <rect x="-16" y="-8" width="32" height="16" rx="2" fill="white" stroke={red} strokeWidth="1" strokeDasharray="3,2" />
                        <text x="0" y="4" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={red}>FOV</text>
                        <text x="0" y="15" textAnchor="middle" fontSize="5" fill="#888">21204</text>
                      </g>

                      {/* Bypass pipes (dashed red, thin) */}
                      <line x1="860" y1="230" x2="860" y2="262" stroke={red} strokeWidth="1" className="res-flow" />
                      <line x1="930" y1="230" x2="930" y2="262" stroke={red} strokeWidth="1" className="res-flow" />
                      <line x1="860" y1="285" x2="860" y2="310" stroke={red} strokeWidth="1" className="res-flow" />
                      <line x1="930" y1="285" x2="930" y2="310" stroke={red} strokeWidth="1" className="res-flow" />


                      {/* ================================================================ */}
                      {/* ===== FLARE HEADERS (background) ===== */}
                      {/* ================================================================ */}
                      <g opacity="0.25">
                        <text x="20" y="195" fontSize="5" fill={textSec}>HP HEADERS: P21-P23 / P31-P33 / P41-P43 / P61-P63</text>
                        <text x="20" y="415" fontSize="5" fill={textSec}>LP HEADERS: P31-P33 / P41-P43 / P51-P53 / P61-P63</text>
                      </g>


                      {/* ================================================================ */}
                      {/* ===== OVERHEADS RECOVERY (bottom right) ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(830,310)">
                        <rect width="130" height="50" rx="4" fill="white" stroke="#888" strokeWidth="1" strokeDasharray="4,2" />
                        <text x="65" y="15" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="#888">OVERHEADS RECOVERY</text>
                        <text x="65" y="27" textAnchor="middle" fontSize="5.5" fill="#aaa">6EC 5505 / 6DS 5501</text>
                        <text x="65" y="38" textAnchor="middle" fontSize="5.5" fill="#aaa">6GX 5501A/B</text>
                        <text x="65" y="48" textAnchor="middle" fontSize="5" fill="#aaa">Glycol: 6UA 5020</text>
                      </g>

                      {/* ================================================================ */}
                      {/* ===== FLARE IGNITION PANEL ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(30, 410)">
                        <rect width="95" height="30" rx="3" fill="white" stroke="#888" strokeWidth="1" strokeDasharray="3,2" />
                        <text x="48" y="14" textAnchor="middle" fontSize="6" fontWeight="600" fill="#888">FLARE IGNITION</text>
                        <text x="48" y="25" textAnchor="middle" fontSize="5.5" fill="#aaa">6UB 2130 (SS316L)</text>
                      </g>


                      {/* ================================================================ */}
                      {/* ===== EQUIPMENT SUMMARY TABLE ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(160,430)">
                        <rect width="760" height="112" rx="4" fill={isDark ? '#252526' : '#fafafa'} stroke={borderColor} strokeWidth="1" />

                        {/* Table Header */}
                        <rect width="760" height="16" rx="4" fill={isDark ? '#2a2d2e' : '#f0f8ff'} />
                        <text x="10" y="12" fontSize="7" fontWeight="700" fill={accent}>{t.aiEquipmentSummary || 'Equipment Summary'}</text>
                        <text x="200" y="12" fontSize="6.5" fontWeight="600" fill={textSec}>Tag</text>
                        <text x="310" y="12" fontSize="6.5" fontWeight="600" fill={textSec}>Type</text>
                        <text x="450" y="12" fontSize="6.5" fontWeight="600" fill={textSec}>Pressure</text>
                        <text x="540" y="12" fontSize="6.5" fontWeight="600" fill={textSec}>Flow</text>
                        <text x="650" y="12" fontSize="6.5" fontWeight="600" fill={textSec}>Util.</text>

                        {/* HP Compressor Row */}
                        <text x="10" y="30" fontSize="6.5" fontWeight="600" fill={green}>HP Comp 3rd Stg</text>
                        <text x="200" y="30" fontSize="6.5" fill={textPrimary}>{result.hpCompressor.tag || '6KB 5230A'}</text>
                        <text x="310" y="30" fontSize="6.5" fill={textSec}>{result.hpCompressor.type || 'Centrifugal'}</text>
                        <text x="450" y="30" fontSize="6.5" fill={textPrimary}>{result.hpCompressor.pressao} bar</text>
                        <text x="540" y="30" fontSize="6.5" fill={green}>{fmt(result.hpCompressor.vazao)} Sm³/d</text>
                        <text x="650" y="30" fontSize="6.5" fontWeight="700" fill={green}>{result.hpCompressor.utilizacao || '—'}%</text>

                        {/* LP 1st Stage Row */}
                        <text x="10" y="44" fontSize="6.5" fontWeight="600" fill={green}>LP Comp 1st Stg</text>
                        <text x="200" y="44" fontSize="6.5" fill={textPrimary}>{result.lpCompressor1st?.tag || '6KB 5110'}</text>
                        <text x="310" y="44" fontSize="6.5" fill={textSec}>Centrifugal</text>
                        <text x="450" y="44" fontSize="6.5" fill={textPrimary}>{result.lpCompressor1st?.pressao || 10} bar</text>
                        <text x="540" y="44" fontSize="6.5" fill={green}>8.18M Sm³/d</text>
                        <text x="650" y="44" fontSize="6.5" fill={textSec}>—</text>

                        {/* LP 2nd Stage Row */}
                        <text x="10" y="58" fontSize="6.5" fontWeight="600" fill={green}>LP Comp 2nd Stg</text>
                        <text x="200" y="58" fontSize="6.5" fill={textPrimary}>{result.lpCompressor.tag || '6KB 5120'}</text>
                        <text x="310" y="58" fontSize="6.5" fill={textSec}>{result.lpCompressor.type || 'Centrifugal'}</text>
                        <text x="450" y="58" fontSize="6.5" fill={textPrimary}>{result.lpCompressor.pressao} bar</text>
                        <text x="540" y="58" fontSize="6.5" fill={green}>{fmt(result.lpCompressor.vazao)} Sm³/d</text>
                        <text x="650" y="58" fontSize="6.5" fontWeight="700" fill={green}>{result.lpCompressor.utilizacao || '—'}%</text>

                        {/* Blower Row */}
                        <text x="10" y="72" fontSize="6.5" fontWeight="600" fill={purple}>Hull Vent Blower</text>
                        <text x="200" y="72" fontSize="6.5" fill={textPrimary}>{result.blower.tag || '6KA 2120'}</text>
                        <text x="310" y="72" fontSize="6.5" fill={textSec}>Roots (VSD)</text>
                        <text x="450" y="72" fontSize="6.5" fill={textPrimary}>{result.blower.pressao} bar</text>
                        <text x="540" y="72" fontSize="6.5" fill={purple}>{fmt(result.blower.vazao)} Sm³/d</text>
                        <text x="650" y="72" fontSize="6.5" fontWeight="700" fill={purple}>{result.blower.utilizacao || '—'}%</text>

                        {/* 2nd Blower Row */}
                        <text x="10" y="86" fontSize="6.5" fontWeight="600" fill={result.blower2nd?.standby ? '#888' : purple}>2nd Blower</text>
                        <text x="200" y="86" fontSize="6.5" fill={textPrimary}>{result.blower2nd?.tag || '6KA 2140'}</text>
                        <text x="310" y="86" fontSize="6.5" fill={textSec}>Roots (VSD)</text>
                        <text x="450" y="86" fontSize="6.5" fill={textPrimary}>3.5 bar</text>
                        <text x="540" y="86" fontSize="6.5" fill={result.blower2nd?.standby ? '#888' : purple}>
                          {result.blower2nd?.standby ? 'STANDBY' : `${fmt(result.blower2nd?.vazao || 0)} Sm³/d`}
                        </text>
                        <text x="650" y="86" fontSize="6.5" fill={result.blower2nd?.standby ? '#888' : purple}>
                          {result.blower2nd?.standby ? '—' : `${result.blower2nd?.utilizacao || 0}%`}
                        </text>

                        {/* KO Drums + Pressure Control Row */}
                        <text x="10" y="100" fontSize="6.5" fontWeight="600" fill={textSec}>KO Drums</text>
                        <text x="200" y="100" fontSize="6.5" fill={textPrimary}>6DS 2110 / 2120 / 2130</text>
                        <text x="310" y="100" fontSize="6.5" fill={textSec}>Horizontal (2oo3)</text>
                        <text x="450" y="100" fontSize="6.5" fill={textPrimary}>14.8 / 8.65 bar</text>
                        <text x="540" y="100" fontSize="6.5" fill={textSec}>HP: 950 / LP: 70 mbarg</text>
                      </g>


                      {/* ================================================================ */}
                      {/* ===== SUMMARY BADGE ===== */}
                      {/* ================================================================ */}
                      <g transform="translate(550,610)">
                        <rect x="-280" y="-22" width="560" height="52" rx="5"
                          fill={isDark ? '#252526' : '#f0fff8'} stroke={green} strokeWidth="1.5" />
                        <text x="-175" y="-4" textAnchor="middle" fontSize="8" fontWeight="700" fill={green}>
                          {t.totalRecovered}: {fmt(result.totalRecovered)} Sm³/d
                        </text>
                        <text x="-15" y="-4" textAnchor="middle" fontSize="8" fontWeight="600" fill={textSec}>
                          CO₂ -{result.emissions.reductionPercent.toFixed(0)}%
                        </text>
                        <text x="105" y="-4" textAnchor="middle" fontSize="8" fontWeight="600" fill={textSec}>
                          Payback: {result.economics.payback.toFixed(1)} {t.aiYears}
                        </text>
                        <text x="-175" y="12" textAnchor="middle" fontSize="6.5" fill={textSec}>
                          HP: 6KB 5230A + LP: 6KB 5110/5120 + Blower: 6KA 2120/2140
                        </text>
                        <text x="80" y="12" textAnchor="middle" fontSize="6.5" fill={textSec}>
                          VPL: ${fmt(result.economics.vpl)} | TIR: {result.economics.tir.toFixed(1)}%
                        </text>
                        <text x="-50" y="24" textAnchor="middle" fontSize="5.5" fill={textSec}>
                          Pressure Control: PIC 21006 (HP 950mbarg) | PIC 21016 (LP 70mbarg) | PIC 21009 (Hull 50mbarg)
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* ===== BEFORE / AFTER COMPARISON ===== */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="rounded-lg p-3" style={{ background: isDark ? '#2a1a1a' : '#fef2f2', border: `1px solid ${red}30` }}>
                      <div className="text-xs font-bold mb-2" style={{ color: red }}>{t.aiBeforeTitle}</div>
                      <div className="space-y-1.5 text-xs" style={{ color: textPrimary }}>
                        <div className="flex justify-between">
                          <span>{t.totalFlaring}</span>
                          <span className="font-bold" style={{ color: red }}>
                            {fmt(result.emissions.current.vazao_lp_flare + result.emissions.current.vazao_hp_flare)} Sm³/d
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.emissions}</span>
                          <span className="font-bold" style={{ color: red }}>
                            {fmt(result.emissions.current.emissoes_total)} tCO₂/yr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.environmentalCost}</span>
                          <span className="font-bold" style={{ color: red }}>
                            ${fmt(result.emissions.current.custo_ambiental)}/yr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* After */}
                    <div className="rounded-lg p-3" style={{ background: isDark ? '#1a2a25' : '#f0fdf4', border: `1px solid ${green}30` }}>
                      <div className="text-xs font-bold mb-2" style={{ color: green }}>{t.aiAfterTitle}</div>
                      <div className="space-y-1.5 text-xs" style={{ color: textPrimary }}>
                        <div className="flex justify-between">
                          <span>{t.aiResidualBurn}</span>
                          <span className="font-bold" style={{ color: green }}>
                            {fmt(result.residualBurn)} Sm³/d
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.emissions}</span>
                          <span className="font-bold" style={{ color: green }}>
                            {fmt(result.emissions.proposed.emissoes_total)} tCO₂/yr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.gasRecovered}</span>
                          <span className="font-bold" style={{ color: green }}>
                            {fmt(result.totalRecovered)} Sm³/d
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Improvement Banner */}
                  <div className="rounded-lg p-3 text-center" style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}>
                    <div className="text-lg font-bold" style={{ color: accent }}>
                      -{result.emissions.reductionPercent.toFixed(1)}% {t.emissions}
                    </div>
                    <div className="text-xs mt-1" style={{ color: textSec }}>
                      VPL: ${fmt(result.economics.vpl)} | TIR: {result.economics.tir.toFixed(1)}% | Payback: {result.economics.payback.toFixed(1)} {t.aiYears}
                    </div>
                  </div>

                  {/* Recommendation with real equipment */}
                  <div className="rounded-lg p-3 text-xs" style={{ background: isDark ? '#2a2d2e' : '#f8f9fa', border: `1px solid ${borderColor}`, color: textSec }}>
                    <span style={{ color: green, fontWeight: 700 }}>&#10003; </span>
                    {t.aiRecommendation}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const svgEl = panelRef.current?.querySelector('svg');
                        if (!svgEl) return;
                        const svgData = new XMLSerializer().serializeToString(svgEl);
                        const blob = new Blob([svgData], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'FPSO_Optimized_PID_Gas_Recovery.svg';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}40` }}
                    >
                      <ArrowDownload20Regular className="w-4 h-4" />
                      {t.aiExportDiagram}
                    </button>
                    <button
                      onClick={startAnalysis}
                      className="py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: `${textSec}15`, color: textSec, border: `1px solid ${borderColor}` }}
                    >
                      <ArrowCounterclockwise20Regular className="w-4 h-4" />
                      {t.aiRestart}
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </>
      )}
    </>
  );
}


/* ===== Alternative Diagram Component ===== */

function AlternativeDiagram({ type, color, isDark, data, textPrimary, textSec, borderColor, fmt }) {
  const bg = isDark ? '#1e1e1e' : '#fafafa';
  const green = '#4ec9b0';
  const red = '#f44747';
  const purple = '#c586c0';
  const accent = '#007acc';

  const hpFlow = data?.monitoring?.totals?.totalHP || 7975;
  const lpFlow = data?.monitoring?.totals?.totalLP || 19925;
  const hullVent = data?.monitoring?.totals?.totalHull || 40000;
  const totalFlaring = hpFlow + lpFlow + hullVent;

  if (type === 'partial_recovery') {
    const recovered = lpFlow * 0.91 + hullVent * 0.95;
    const rate = (recovered / totalFlaring * 100).toFixed(0);
    return (
      <svg viewBox="0 0 500 220" className="w-full" style={{ background: bg }}>
        {/* Title */}
        <text x="250" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>Partial Recovery — LP Flare + Hull Vent Only</text>

        {/* HP Flare — still venting */}
        <rect x="20" y="40" width="80" height="30" rx="3" fill="none" stroke={red} strokeWidth="1.5" />
        <text x="60" y="58" textAnchor="middle" fontSize="7" fontWeight="600" fill={red}>HP Flare</text>
        <text x="60" y="80" textAnchor="middle" fontSize="6" fill={red}>{fmt(hpFlow)} Sm³/d</text>
        <line x1="100" y1="55" x2="140" y2="55" stroke={red} strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="160" y="50" fontSize="8" fill={red}>🔥</text>
        <text x="160" y="62" fontSize="6" fill={red}>Still flaring</text>

        {/* LP Flare — recovered */}
        <rect x="20" y="100" width="80" height="30" rx="3" fill="none" stroke={color} strokeWidth="1.5" />
        <text x="60" y="118" textAnchor="middle" fontSize="7" fontWeight="600" fill={color}>LP Flare</text>
        <text x="60" y="140" textAnchor="middle" fontSize="6" fill={color}>{fmt(lpFlow)} Sm³/d</text>
        <line x1="100" y1="115" x2="200" y2="115" stroke={green} strokeWidth="2" strokeDasharray="6,3" />

        {/* Hull Vent — recovered */}
        <rect x="20" y="160" width="80" height="30" rx="3" fill="none" stroke={purple} strokeWidth="1.5" />
        <text x="60" y="178" textAnchor="middle" fontSize="7" fontWeight="600" fill={purple}>Hull Vent</text>
        <text x="60" y="200" textAnchor="middle" fontSize="6" fill={purple}>{fmt(hullVent)} Sm³/d</text>
        <line x1="100" y1="175" x2="200" y2="145" stroke={green} strokeWidth="2" strokeDasharray="6,3" />

        {/* Blower */}
        <circle cx="230" cy="130" r="20" fill="none" stroke={green} strokeWidth="1.5" />
        <text x="230" y="127" textAnchor="middle" fontSize="6" fontWeight="600" fill={green}>BLOWER</text>
        <text x="230" y="137" textAnchor="middle" fontSize="5" fill={textSec}>6KA 2120</text>

        {/* LP Comp */}
        <line x1="250" y1="130" x2="290" y2="130" stroke={green} strokeWidth="2" strokeDasharray="6,3" />
        <circle cx="320" cy="130" r="20" fill="none" stroke={green} strokeWidth="1.5" />
        <text x="320" y="127" textAnchor="middle" fontSize="6" fontWeight="600" fill={green}>LP COMP</text>
        <text x="320" y="137" textAnchor="middle" fontSize="5" fill={textSec}>6KB 5120</text>

        {/* Export */}
        <line x1="340" y1="130" x2="390" y2="130" stroke={green} strokeWidth="2" strokeDasharray="6,3" />
        <rect x="390" y="115" width="90" height="30" rx="4" fill={green} fillOpacity="0.1" stroke={green} strokeWidth="1.5" />
        <text x="435" y="128" textAnchor="middle" fontSize="7" fontWeight="700" fill={green}>GAS EXPORT</text>
        <text x="435" y="140" textAnchor="middle" fontSize="8" fontWeight="700" fill={green}>{fmt(recovered)} Sm³/d</text>

        {/* Rate badge */}
        <rect x="380" y="155" width="110" height="18" rx="9" fill={green} fillOpacity="0.15" />
        <text x="435" y="167" textAnchor="middle" fontSize="7" fontWeight="700" fill={green}>Recovery: {rate}% (no HP)</text>
      </svg>
    );
  }

  if (type === 'full_recovery_vru') {
    const recovered = totalFlaring * 0.96;
    return (
      <svg viewBox="0 0 500 200" className="w-full" style={{ background: bg }}>
        <text x="250" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>Full VRU — Screw Compressors + Ejector ({'>'}95%)</text>

        {/* Sources */}
        {[
          { label: 'HP Flare', y: 45, val: hpFlow, c: red },
          { label: 'LP Flare', y: 85, val: lpFlow, c: color },
          { label: 'Hull Vent', y: 125, val: hullVent, c: purple },
        ].map((s, i) => (
          <g key={i}>
            <rect x="15" y={s.y} width="70" height="26" rx="3" fill="none" stroke={s.c} strokeWidth="1.2" />
            <text x="50" y={s.y + 16} textAnchor="middle" fontSize="6.5" fontWeight="600" fill={s.c}>{s.label}</text>
            <line x1="85" y1={s.y + 13} x2="140" y2={90} stroke={green} strokeWidth="1.5" strokeDasharray="5,3" />
          </g>
        ))}

        {/* VRU Unit */}
        <rect x="140" y="60" width="90" height="60" rx="5" fill={green} fillOpacity="0.08" stroke={green} strokeWidth="2" />
        <text x="185" y="80" textAnchor="middle" fontSize="8" fontWeight="700" fill={green}>VRU</text>
        <text x="185" y="92" textAnchor="middle" fontSize="5.5" fill={textSec}>Screw Comp.</text>
        <text x="185" y="102" textAnchor="middle" fontSize="5.5" fill={textSec}>+ Ejector</text>
        <text x="185" y="115" textAnchor="middle" fontSize="5" fill={textSec}>96% efficiency</text>

        {/* To Export */}
        <line x1="230" y1="90" x2="300" y2="90" stroke={green} strokeWidth="2.5" strokeDasharray="6,3" />

        {/* Cooler */}
        <rect x="300" y="78" width="50" height="24" rx="3" fill="none" stroke={green} strokeWidth="1.2" />
        <text x="325" y="93" textAnchor="middle" fontSize="6" fontWeight="600" fill={green}>COOLER</text>

        <line x1="350" y1="90" x2="380" y2="90" stroke={green} strokeWidth="2.5" strokeDasharray="6,3" />

        {/* Export */}
        <rect x="380" y="70" width="100" height="40" rx="5" fill={green} fillOpacity="0.1" stroke={green} strokeWidth="1.5" />
        <text x="430" y="87" textAnchor="middle" fontSize="7" fontWeight="700" fill={green}>GAS EXPORT</text>
        <text x="430" y="100" textAnchor="middle" fontSize="9" fontWeight="800" fill={green}>{fmt(recovered)}</text>

        {/* Residual */}
        <text x="185" y="140" textAnchor="middle" fontSize="6" fill={red}>Residual: {fmt(totalFlaring - recovered)} Sm³/d (4%)</text>

        {/* Benefits */}
        <rect x="140" y="155" width="340" height="30" rx="4" fill={isDark ? '#1a2a25' : '#f0fdf4'} stroke={green} strokeWidth="0.8" />
        <text x="310" y="170" textAnchor="middle" fontSize="6" fill={green}>Higher CAPEX (~$15-25M) | Better ROI 3-5yr | Max recovery | Compact footprint</text>
        <text x="310" y="181" textAnchor="middle" fontSize="5.5" fill={textSec}>Ideal for high-volume offshore applications with space constraints</text>
      </svg>
    );
  }

  if (type === 'flare_gas_to_power') {
    const powerMW = ((totalFlaring * 0.0353 * 1.055) / 24 * 0.35).toFixed(1);
    return (
      <svg viewBox="0 0 500 200" className="w-full" style={{ background: bg }}>
        <text x="250" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>Flare Gas to Power (FGTP) — Zero Flaring</text>

        {/* Flare Gas Collector */}
        <rect x="20" y="60" width="90" height="50" rx="4" fill={red} fillOpacity="0.08" stroke={red} strokeWidth="1.5" />
        <text x="65" y="80" textAnchor="middle" fontSize="7" fontWeight="600" fill={red}>Flare Gas</text>
        <text x="65" y="92" textAnchor="middle" fontSize="6" fill={red}>Collector</text>
        <text x="65" y="105" textAnchor="middle" fontSize="6" fill={textSec}>{fmt(totalFlaring)} Sm³/d</text>

        <line x1="110" y1="85" x2="155" y2="85" stroke={color} strokeWidth="2" strokeDasharray="6,3" />

        {/* Gas Treatment */}
        <rect x="155" y="65" width="70" height="40" rx="4" fill="none" stroke={color} strokeWidth="1.5" />
        <text x="190" y="82" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>Gas</text>
        <text x="190" y="92" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>Treatment</text>

        <line x1="225" y1="85" x2="270" y2="85" stroke={color} strokeWidth="2" strokeDasharray="6,3" />

        {/* Gas Turbine / Engine */}
        <rect x="270" y="55" width="90" height="60" rx="5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
        <text x="315" y="75" textAnchor="middle" fontSize="8" fontWeight="700" fill={color}>GAS</text>
        <text x="315" y="87" textAnchor="middle" fontSize="8" fontWeight="700" fill={color}>TURBINE</text>
        <text x="315" y="102" textAnchor="middle" fontSize="6" fill={textSec}>{powerMW} MW</text>

        <line x1="360" y1="85" x2="395" y2="85" stroke={accent} strokeWidth="2.5" />

        {/* Power Output */}
        <rect x="395" y="60" width="90" height="50" rx="5" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.5" />
        <text x="440" y="78" textAnchor="middle" fontSize="7" fontWeight="700" fill={accent}>POWER</text>
        <text x="440" y="92" textAnchor="middle" fontSize="10" fontWeight="800" fill={accent}>{powerMW} MW</text>
        <text x="440" y="105" textAnchor="middle" fontSize="5" fill={textSec}>→ FPSO Grid</text>

        {/* Benefits */}
        <rect x="60" y="135" width="380" height="45" rx="4" fill={isDark ? '#102030' : '#eff6ff'} stroke={color} strokeWidth="0.8" />
        <text x="250" y="150" textAnchor="middle" fontSize="6" fill={color}>Zero Flaring | Self-sufficient power | Reduces diesel consumption</text>
        <text x="250" y="162" textAnchor="middle" fontSize="5.5" fill={textSec}>CAPEX: $20-40M | Uses gas turbines (GE LM2500) or reciprocating engines (Wärtsilä)</text>
        <text x="250" y="174" textAnchor="middle" fontSize="5.5" fill={textSec}>Best for: Remote FPSOs with high fuel costs and reliable flare gas volume</text>
      </svg>
    );
  }

  if (type === 'reinjection') {
    const injRate = (totalFlaring * 0.93).toFixed(0);
    return (
      <svg viewBox="0 0 500 210" className="w-full" style={{ background: bg }}>
        <text x="250" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>Gas Reinjection — EOR + Pressure Maintenance</text>

        {/* Flare Gas */}
        <rect x="20" y="55" width="80" height="40" rx="4" fill={red} fillOpacity="0.08" stroke={red} strokeWidth="1.5" />
        <text x="60" y="72" textAnchor="middle" fontSize="7" fontWeight="600" fill={red}>Flare Gas</text>
        <text x="60" y="85" textAnchor="middle" fontSize="6" fill={textSec}>{fmt(totalFlaring)}</text>

        <line x1="100" y1="75" x2="145" y2="75" stroke={green} strokeWidth="2" strokeDasharray="6,3" />

        {/* Recovery Compressors */}
        <circle cx="175" cy="75" r="22" fill="none" stroke={green} strokeWidth="1.5" />
        <text x="175" y="72" textAnchor="middle" fontSize="6" fontWeight="600" fill={green}>COMP</text>
        <text x="175" y="82" textAnchor="middle" fontSize="5" fill={textSec}>Multi-stg</text>

        <line x1="197" y1="75" x2="235" y2="75" stroke={green} strokeWidth="2" strokeDasharray="6,3" />

        {/* Dehydration */}
        <rect x="235" y="58" width="60" height="34" rx="3" fill="none" stroke={color} strokeWidth="1.2" />
        <text x="265" y="73" textAnchor="middle" fontSize="6" fontWeight="600" fill={color}>DEHYD</text>
        <text x="265" y="83" textAnchor="middle" fontSize="5" fill={textSec}>TEG/Glycol</text>

        <line x1="295" y1="75" x2="335" y2="75" stroke={color} strokeWidth="2" strokeDasharray="6,3" />

        {/* Injection Compressor */}
        <circle cx="365" cy="75" r="22" fill="none" stroke={color} strokeWidth="2" />
        <text x="365" y="72" textAnchor="middle" fontSize="6" fontWeight="700" fill={color}>INJ</text>
        <text x="365" y="82" textAnchor="middle" fontSize="5" fill={color}>COMP</text>
        <text x="365" y="105" textAnchor="middle" fontSize="5.5" fill={textSec}>High P (300+ bar)</text>

        <line x1="387" y1="75" x2="420" y2="75" stroke={color} strokeWidth="2.5" strokeDasharray="6,3" />

        {/* Well / Reservoir */}
        <rect x="420" y="40" width="65" height="70" rx="5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="2" />
        <text x="452" y="60" textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>WELL</text>
        <text x="452" y="75" textAnchor="middle" fontSize="6" fill={textSec}>Reinjection</text>
        <text x="452" y="88" textAnchor="middle" fontSize="7" fontWeight="700" fill={color}>{fmt(Number(injRate))}</text>
        <text x="452" y="98" textAnchor="middle" fontSize="5" fill={textSec}>Sm³/d</text>

        {/* Benefits */}
        <rect x="40" y="130" width="420" height="60" rx="4" fill={isDark ? '#1e202e' : '#f5f0ff'} stroke={color} strokeWidth="0.8" />
        <text x="250" y="145" textAnchor="middle" fontSize="6" fill={color}>EOR: +5-15% oil recovery | Pressure maintenance | Zero surface emissions</text>
        <text x="250" y="157" textAnchor="middle" fontSize="5.5" fill={textSec}>CAPEX: $30-60M | Requires injection wells and high-pressure compressors</text>
        <text x="250" y="169" textAnchor="middle" fontSize="5.5" fill={textSec}>Best for: Mature fields with declining pressure needing production boost</text>
        <text x="250" y="181" textAnchor="middle" fontSize="5.5" fill={textSec}>Magnolia Block 17: Water depth 1200-1400m | 82 wells | Ideal candidate for EOR</text>
      </svg>
    );
  }

  return null;
}
