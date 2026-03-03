/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CÁLCULOS TÉCNICOS E AMBIENTAIS
 * Módulo para cálculos de emissões, custos e indicadores econômicos
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export class EmissionCalculator {
  // Fator de emissão (combustão de gás natural - padrão da indústria)
  // 1 Sm³ de gás natural queimado gera aproximadamente 2.75 kg de CO₂
  static FATOR_EMISSAO = 0.00275; // tCO₂eq/Sm³ (para combustão)

  // Custo de carbono
  static CARBON_PRICE = 84; // USD/tCO₂eq

  // Fatores operacionais e econômicos (adicionados da migração)
  static OPEX_PERCENTUAL = 0.05;  // 5% do CAPEX por ano
  static EFFICIENCY_DEGRADATION = 0.01;  // 1% de degradação por ano
  static OPEX_GROWTH = 0.025;  // 2.5% de crescimento ao ano (inflação)
  static DISCOUNT_RATE = 0.10;  // 10% ao ano (taxa de desconto)
  static AVAILABILITY_FACTOR = 0.95;  // 95% de disponibilidade (uptime)

  /**
   * Calcula emissões de CO2 equivalente (somente para gás QUEIMADO em flares)
   * @param {number} vazaoGas - Vazão de gás queimado (Sm³/d)
   * @param {number} diasAno - Dias de operação por ano
   * @returns {number} Emissões em tCO₂eq/ano
   */
  static calcularEmissoesCO2eq(vazaoGas, diasAno = 365) {
    // Emissões de combustão (somente para flare)
    // Hull vent não é combustão, então não usa esta função
    return vazaoGas * diasAno * this.FATOR_EMISSAO;
  }

  /**
   * Calcula custo ambiental
   * @param {number} emissoesCO2eq - Emissões em tCO₂eq/ano
   * @returns {number} Custo em USD/ano
   */
  static calcularCustoAmbiental(emissoesCO2eq) {
    return emissoesCO2eq * this.CARBON_PRICE;
  }

  /**
   * Calcula emissões por fonte para cenário atual
   * IMPORTANTE: Somente FLARE emite CO2 por combustão!
   * Hull Vent é ventilação (não queima), então emissões_hull = 0
   * @param {Object} data - Dados de vazões
   * @returns {Object} Emissões por fonte
   */
  static calcularCenarioAtual(data) {
    const vazaoLPFlare = (data.monitoring?.totals?.totalLP || 27900);
    const vazaoHPFlare = (data.monitoring?.totals?.totalHP || 40000);
    const vazaoHull = 0; // Hull vent (sem dados)

    // Emissões SOMENTE de flare (combustão)
    const emissoesLPFlare = this.calcularEmissoesCO2eq(vazaoLPFlare);
    const emissoesHPFlare = this.calcularEmissoesCO2eq(vazaoHPFlare);
    const emissoesHull = 0; // Hull vent não é considerado para emissões de flare

    // Total = somente LP Flare + HP Flare
    const emissoesTotal = emissoesLPFlare + emissoesHPFlare;
    const custoAmbiental = this.calcularCustoAmbiental(emissoesTotal);

    return {
      emissoes_lp_flare: emissoesLPFlare,
      emissoes_hp_flare: emissoesHPFlare,
      emissoes_hull: emissoesHull,
      emissoes_total: emissoesTotal,
      custo_ambiental: custoAmbiental,
      vazao_lp_flare: vazaoLPFlare,
      vazao_hp_flare: vazaoHPFlare,
      vazao_hull: vazaoHull
    };
  }

  /**
   * Calcula emissões para cenário proposto (com recuperação)
   * IMPORTANTE: Somente FLARE emite CO2 por combustão!
   * Hull Vent é ventilação (não queima), então emissões_hull = 0
   * @param {Object} data - Dados de vazões
   * @param {number} eficienciaRecuperacao - Eficiência de recuperação (0-1)
   * @returns {Object} Emissões por fonte
   */
  static calcularCenarioProposto(data, eficienciaRecuperacao = 0.85) {
    const vazaoLPFlare = (data.monitoring?.totals?.totalLP || 27900);
    const vazaoHPFlare = (data.monitoring?.totals?.totalHP || 40000);
    const vazaoHull = 0; // Hull vent (sem dados)

    // Com sistema de recuperação de flare
    const vazaoRecuperada = (vazaoLPFlare + vazaoHPFlare) * eficienciaRecuperacao;
    const vazaoLPFlareReduzida = vazaoLPFlare * (1 - eficienciaRecuperacao);
    const vazaoHPFlareReduzida = vazaoHPFlare * (1 - eficienciaRecuperacao);

    // Hull vent pode ser capturado também (85% de eficiência)
    const vazaoHullRecuperada = vazaoHull * eficienciaRecuperacao;
    const vazaoHullReduzida = vazaoHull * (1 - eficienciaRecuperacao);

    // Emissões SOMENTE de flare (combustão)
    const emissoesLPFlare = this.calcularEmissoesCO2eq(vazaoLPFlareReduzida);
    const emissoesHPFlare = this.calcularEmissoesCO2eq(vazaoHPFlareReduzida);
    const emissoesHull = 0; // Hull vent não é considerado para emissões de flare

    // Total = somente LP Flare + HP Flare
    const emissoesTotal = emissoesLPFlare + emissoesHPFlare;
    const custoAmbiental = this.calcularCustoAmbiental(emissoesTotal);

    // Receita com venda de gás recuperado (inclui flare + hull vent)
    const vazaoRecuperadaTotal = vazaoRecuperada + vazaoHullRecuperada;
    const precoGas = 5.5; // USD/MMBTU
    const fatorConversao = 0.0373; // MMBTU/Sm³
    const receitaGas = vazaoRecuperadaTotal * 365 * precoGas * fatorConversao;

    return {
      emissoes_lp_flare: emissoesLPFlare,
      emissoes_hp_flare: emissoesHPFlare,
      emissoes_hull: emissoesHull,
      emissoes_total: emissoesTotal,
      custo_ambiental: custoAmbiental,
      vazao_recuperada: vazaoRecuperadaTotal,
      vazao_hull_recuperada: vazaoHullRecuperada,
      vazao_hull_residual: vazaoHullReduzida,
      receita_gas: receitaGas
    };
  }

  /**
   * Calcula equivalências de emissões
   * @param {number} emissoesCO2eq - Emissões em tCO₂eq
   * @returns {Object} Equivalências
   */
  static calcularEquivalencias(emissoesCO2eq) {
    return {
      carros: emissoesCO2eq / 4.6, // Carros por ano
      arvores: emissoesCO2eq / 0.021, // Árvores necessárias para compensar
      casas: emissoesCO2eq / 7.5 // Casas por ano
    };
  }
}

export class EconomicCalculator {
  /**
   * Calcula Valor Presente Líquido (VPL)
   * @param {number} investimentoInicial - Investimento inicial (USD)
   * @param {number} fluxoCaixaAnual - Fluxo de caixa anual (USD)
   * @param {number} taxaDesconto - Taxa de desconto (decimal)
   * @param {number} anos - Número de anos
   * @returns {number} VPL em USD
   */
  static calcularVPL(investimentoInicial, fluxoCaixaAnual, taxaDesconto, anos) {
    let vpl = -investimentoInicial;

    for (let ano = 1; ano <= anos; ano++) {
      vpl += fluxoCaixaAnual / Math.pow(1 + taxaDesconto, ano);
    }

    return vpl;
  }

  /**
   * Calcula Taxa Interna de Retorno (TIR)
   * @param {number} investimentoInicial - Investimento inicial (USD)
   * @param {number} fluxoCaixaAnual - Fluxo de caixa anual (USD)
   * @param {number} anos - Número de anos
   * @returns {number} TIR em percentual
   */
  static calcularTIR(investimentoInicial, fluxoCaixaAnual, anos) {
    // Método de Newton-Raphson para encontrar TIR
    let tir = 0.1; // Estimativa inicial de 10%
    const iteracoes = 100;
    const precisao = 0.0001;

    for (let i = 0; i < iteracoes; i++) {
      let vpl = -investimentoInicial;
      let derivada = 0;

      for (let ano = 1; ano <= anos; ano++) {
        vpl += fluxoCaixaAnual / Math.pow(1 + tir, ano);
        derivada -= (ano * fluxoCaixaAnual) / Math.pow(1 + tir, ano + 1);
      }

      if (Math.abs(vpl) < precisao) break;

      tir = tir - vpl / derivada;
    }

    return tir * 100; // Retorna em percentual
  }

  /**
   * Calcula Payback
   * @param {number} investimentoInicial - Investimento inicial (USD)
   * @param {number} fluxoCaixaAnual - Fluxo de caixa anual (USD)
   * @returns {number} Payback em anos
   */
  static calcularPayback(investimentoInicial, fluxoCaixaAnual) {
    return investimentoInicial / fluxoCaixaAnual;
  }

  /**
   * Calcula análise econômica completa do projeto COM OPEX e degradação
   * @param {Object} cenarioAtual - Dados do cenário atual
   * @param {Object} cenarioProposto - Dados do cenário proposto
   * @param {number} investimentoInicial - Investimento inicial em USD (padrão: 12M)
   * @returns {Object} Indicadores econômicos
   */
  static analisarProjeto(cenarioAtual, cenarioProposto, investimentoInicial = 12000000) {
    const economiaAmbiental = cenarioAtual.custo_ambiental - cenarioProposto.custo_ambiental;
    const receitaGasBase = cenarioProposto.receita_gas || 0;

    const anos = 10;
    const fluxosCaixa = [];

    // Calcular OPEX anual base
    const opexAnualBase = investimentoInicial * EmissionCalculator.OPEX_PERCENTUAL;

    // VPL com OPEX, degradação e inflação
    let vpn = -investimentoInicial; // Investimento inicial

    for (let ano = 1; ano <= anos; ano++) {
      // Receita com degradação de eficiência
      const fatorDegradacao = Math.pow(1 - EmissionCalculator.EFFICIENCY_DEGRADATION, ano);
      const receitaAnual = receitaGasBase * fatorDegradacao;

      // OPEX com inflação
      const opexAnual = opexAnualBase * Math.pow(1 + EmissionCalculator.OPEX_GROWTH, ano);

      // Fluxo de caixa líquido
      const fluxoAnual = receitaAnual + economiaAmbiental - opexAnual;
      fluxosCaixa.push(fluxoAnual);

      // Valor presente do fluxo
      const vpFluxo = fluxoAnual / Math.pow(1 + EmissionCalculator.DISCOUNT_RATE, ano);
      vpn += vpFluxo;
    }

    // TIR com os fluxos de caixa reais
    const tir = this.calcularTIR(investimentoInicial, fluxosCaixa[0], anos); // Simplificado

    // Payback descontado
    let payback = 999;
    let saldoAcumulado = -investimentoInicial;
    for (let ano = 1; ano <= anos; ano++) {
      const fluxoDescontado = fluxosCaixa[ano - 1] / Math.pow(1 + EmissionCalculator.DISCOUNT_RATE, ano);
      saldoAcumulado += fluxoDescontado;

      if (saldoAcumulado > 0 && payback === 999) {
        payback = ano - 1 + Math.abs(saldoAcumulado - fluxoDescontado) / fluxoDescontado;
        break;
      }
    }

    // ROI
    const roi = (vpn / investimentoInicial) * 100;

    // Fluxo médio anual
    const fluxoCaixaAnualMedio = fluxosCaixa.reduce((a, b) => a + b, 0) / fluxosCaixa.length;

    return {
      investimento_inicial: investimentoInicial,
      economia_ambiental: economiaAmbiental,
      receita_gas: receitaGasBase,
      opex_anual_base: opexAnualBase,
      fluxo_caixa_anual: fluxoCaixaAnualMedio,
      fluxos_caixa: fluxosCaixa,
      vpl: vpn,
      tir: tir,
      roi: roi,
      payback: payback,
      viavel: vpn > 0 && tir > 10,
      anos_analise: anos
    };
  }
}

export class GasRecoveryOptimizer {
  /**
   * FPSO Equipment Knowledge Base — extracted from real P&ID drawings
   * Tag numbering follows FPSO project standard (6XX NNNN)
   */
  static EQUIPMENT = {
    // ─── HP Flare System ───
    hpFlareKODrum: {
      tag: '6DS 2110', description: 'HP Flare KO Drum', type: 'Horizontal Vessel',
      designPressure: 14.8, workingPressure: 8.5,
      designTemp: 180, workingTemp: [45, 120],
      voting: '2oo3', heaterControl: true,
      material: 'CS'
    },
    hpFlareKODrum2nd: {
      tag: '6DS 2170', description: 'HP Flare KO Drum (2nd)', type: 'Horizontal Vessel',
      material: 'CS'
    },
    hpFlareCooler: {
      tag: '6EC 2110', description: 'HP Flare Condensate Cooler', type: 'Shell & Tube',
      material: 'CS/SS'
    },
    hpFlarePumps: {
      tag: '6GX 2110 A/B', description: 'HP Flare KO Drum Pumps', type: 'Centrifugal',
      redundancy: '2×100%', material: 'CS'
    },
    hpFlareTip: {
      tag: '6FB 2110', description: 'HP Flare TIP', type: 'Sonic Multi-Wire',
      designPressure: 14.0, designFlowrate: 14800000,
      designTemp: [-45, 150], workingTemp: [-4, 131],
      tipDiameter: 2200, connectionSize: '20"',
      ruptureDisc: 3.9, // bar
      material: 'Incoloy 800H'
    },

    // ─── LP Flare System ───
    lpFlareKODrum: {
      tag: '6DS 2120', description: 'LP Flare KO Drum', type: 'Horizontal Vessel',
      designPressure: 8.65, workingPressure: 3.5,
      designTemp: 185, workingTemp: [30, 90],
      voting: '2oo3',
      material: 'CS'
    },
    lpFlareKODrum2nd: {
      tag: '6DS 2130', description: 'LP Flare Knock Out Drum', type: 'Horizontal Vessel',
      material: 'CS'
    },
    lpFlarePumps: {
      tag: '6GX 2120 A/B', description: 'LP Flare KO Drum Pumps', type: 'Centrifugal',
      redundancy: '2×100%', material: 'CS'
    },
    lpFlareTip: {
      tag: '6FB 2120', description: 'LP Flare TIP', type: 'Pipe',
      designPressure: 0.65, designTemp: [0, 205], workingTemp: 74,
      tipDiameter: 410, connectionSize: '14"',
      ruptureDisc: 0.45, // bar
      material: 'Incoloy 800H'
    },

    // ─── Flare Ignition ───
    flareIgnitionPanel: {
      tag: '6UB 2130', description: 'Flare Ignition Panel', type: 'Flame Front',
      supplier: 'FET', product: 'Gas',
      designPressure: 10, workingPressure: 5,
      designTemp: 70, workingTemp: [52, 102],
      material: 'SS316L'
    },

    // ─── Hull Gas Vent System ───
    hullVentBlower: {
      tag: '6KA 2120', description: 'Hull Gas Vent Blower',
      type: 'Rotary Piston Compressor (Roots)',
      designPressure: 3.5, workingPressure: [0.03, 0.19],
      designTemp: 90, workingTemp: [45, 60],
      designFlowrate: 72000, // Sm³/d (confirmed from title block)
      motorPower: 32, vsd: true,
      material: 'CS'
    },
    hullVentBlower2nd: {
      tag: '6KA 2140', description: 'Hull Gas Vent Blower (2nd)',
      type: 'Rotary Piston Compressor (Roots)',
      designFlowrate: 72000, motorPower: 32, vsd: true,
      material: 'CS'
    },
    hullVentInletFilter: {
      tag: '6IF 2120', description: 'Hull Vent Inlet Filter',
      type: 'Inline Filter'
    },
    hullVentPackage: {
      tag: '6UB 2120', description: 'Hull Vent Collection Package'
    },

    // ─── HP Gas Compression ───
    hpCompressor3rdStage: {
      tag: '6KB 5230A', description: '3rd Stage HP Gas Compressor',
      type: 'Centrifugal',
      designPressure: 185, workingPressure: 140,
      designTemp: [-29, 180],
      designFlowrate: 4000000, // 4.0 × 10⁶ Sm³/d
      material: '12% Cr'
    },
    hpSuctionCooler1st: {
      tag: '6EC 5210A', description: '1st Stage HP Suction Cooler',
      type: 'Shell & Tube',
      designPressure: { shell: 14.5, tube: 42 },
      designTemp: { shell: [8, 35], tube: [-10, 108] },
      duty: 850,
      material: { shell: 'CS', tube: 'SS' }
    },
    hpSuctionCooler1stB: {
      tag: '6EC 5210B', description: '1st Stage HP Suction Cooler (Train B)',
      type: 'Shell & Tube', duty: 850
    },
    hpSuctionScrubber1st: {
      tag: '6DS 5210A', description: '1st Stage HP Suction Scrubber',
      type: 'Vertical Vessel',
      designPressure: 42, designTemp: [-12, 18],
      capacity: 3, material: 'CS'
    },

    // ─── LP Gas Compression ───
    lpCompressor2ndStage: {
      tag: '6KB 5120', description: '2nd Stage LP Gas Compressor',
      type: 'Centrifugal',
      designPressure: 15, workingPressure: 8,
      designTemp: [8, 130],
      designFlowrate: 8160000, // 8.16 × 10⁶ Sm³/d
      material: '12% Cr'
    },
    lpCompressor1stStage: {
      tag: '6KB 5110', description: '1st Stage LP Gas Compressor',
      type: 'Centrifugal', product: 'HC',
      designPressure: 10, designTemp: [8, 150],
      designFlowrate: 8180000, // 8.18 × 10⁶ Sm³/d
      antiSurge: 'FV 51014',
      material: '12% Cr'
    },
    lpSuctionScrubber: {
      tag: '6DS 5110', description: 'LP Compressor Suction Scrubber',
      type: 'Vertical Vessel', material: 'CS/SS'
    },
    lpSuctionCooler: {
      tag: '6EC 5110', description: 'LP Compressor Suction Cooler',
      type: 'Shell & Tube (Horizontal)', material: 'CS/SS'
    },
    lpSuctionPumps: {
      tag: '6GX 5110A/B', description: 'LP Comp Suction Pumps',
      type: 'Centrifugal', redundancy: '2×100%'
    },
    lpCompressorMotor: {
      tag: '6XA 5100', description: 'LP Compressor Motor',
      type: 'Electric Drive', motorPower: 850
    },

    // ─── Separation ───
    separator1stStageA: {
      tag: '6DS 3100A', description: '1st Stage Separator (Train A)',
      type: 'Horizontal 3-Phase Separator'
    },
    separator1stStageB: {
      tag: '6DS 3100B', description: '1st Stage Separator (Train B)',
      type: 'Horizontal 3-Phase Separator'
    },
    separator2ndStageA: {
      tag: '6DS 3400A', description: '2nd Stage Separator (Train A)',
      type: 'Horizontal 2-Phase Separator'
    },
    separator2ndStageB: {
      tag: '6DS 3400B', description: '2nd Stage Separator (Train B)',
      type: 'Horizontal 2-Phase Separator'
    },
    testSeparator: {
      tag: '6DS 3060', description: 'Test Separator'
    },
    molecularSieves: {
      tag: 'MS 052-055', description: 'Molecular Sieves',
      type: 'Gas Dehydration', quantity: 4
    },

    // ─── Overheads Recovery ───
    overheadCondenser: {
      tag: '6EC 5505', description: 'Overhead Condenser',
      duty: 200,
      designPressure: { shell: 85, tube: 13.5 },
      designTemp: 160, material: 'CS/SS'
    },
    overheadLiquidSep: {
      tag: '6DS 5501', description: 'Overhead Liquid Separator',
      size: '700mm ID × 1700mm',
      designPressure: 33, designTemp: 120
    },
    aromaticRecoveryPump: {
      tag: '6GX 5501A/B', description: 'Aromatic Recovery Pump',
      flowrate: 4.6, designPressure: 10, designTemp: 100,
      motorPower: 0.75
    },

    // ─── Glycol System ───
    glycolRegen: {
      tag: '6UA 5010', description: 'Glycol Regeneration'
    },
    glycolFlashDrum: {
      tag: '6UA 5020', description: 'Glycol Flash Drum (HP Flash Gas)'
    },

    // ─── Seal Gas / Overhead ───
    overheadGasTecUnit: {
      tag: '6KA 5510', description: 'Overhead Gas Tec. Unit'
    },
    sealGasPrimaryVent: {
      tag: '6KY 5100', description: 'Seal Gas (Primary Vent)'
    },
    hpGasCompressorSealVent: {
      tag: '6KY 5200B', description: 'HP Gas Compressor Seal Vent'
    },
    nitrogenSupply: {
      tag: '6KB 5410', description: 'Nitrogen Supply'
    },

    // ─── Fuel Gas ───
    lpFuelGasKODrum: {
      tag: '6DS 2220', description: 'LP Fuel Gas KO Drum'
    },

    // ─── Inert Gas System ───
    inertGasPackage: {
      tag: '5KY 6201', description: 'Inert Gas Generator Package'
    },
    gasFreeFan: {
      tag: '5KA 6201', description: 'Gas Freeing Fan',
      type: 'Centrifugal Fan',
      designFlowrate: 18100, // m³/hr
      designPressure: '2000 mm WG'
    },
    gasFreeFanMotor: {
      tag: '5XA 6201', description: 'Gas Freeing Fan Motor',
      type: 'Electric Drive'
    },
    iggDeckSeal: {
      tag: '5LC 6202', description: 'IGG Deck Seal',
      designFlowrate: 9450 // m³/hr
    },
    pvBreaker: {
      tag: '5LC 6215', description: 'Pressure/Vacuum Breaker',
      designFlowrate: 9950, // m³/hr
      setPressure: 2100, setVacuum: 700 // mmWG
    },

    // ─── Degassing / Produced Water ───
    degassingDrumA: {
      tag: '6DA 4120 A', description: 'Degassing Drum (Train A)',
      type: 'Vertical Vessel'
    },
    degassingDrumB: {
      tag: '6DA 4120 B', description: 'Degassing Drum (Train B)',
      type: 'Vertical Vessel'
    },

    // ─── Offloading ───
    tandemOffloading: {
      tag: '6UA 8301', description: 'Tandem Offloading System',
      product: { crude: 'Crude Oil', methanol: 'Methanol' },
      designPressure: 15.5, workingPressure: 6,
      designTemp: { crude: 75, methanol: 65 },
      workingTemp: { crude: 45, methanol: 'ATM' },
      designFlowrate: { crude: 7200, methanol: 200 }
    },

    // ─── Power Generation ───
    powerGenA: { tag: '6PY 1200A', description: 'Power Gen Package A' },
    powerGenB: { tag: '6PY 1200B', description: 'Power Gen Package B' },
    powerGenC: { tag: '6PY 1200C', description: 'Power Gen Package C' },

    // ─── Sand Handling ───
    sandHandling: { tag: '6DS 3110', description: 'Sand Handling System' }
  };

  /**
   * Flare header sections from P&IDs
   */
  static FLARE_HEADERS = {
    hp: ['P21', 'P22', 'P23', 'P31', 'P32', 'P33', 'P41', 'P42', 'P43', 'P61', 'P62', 'P63'],
    lp: ['P31', 'P32', 'P33', 'P41', 'P42', 'P43', 'P51', 'P52', 'P53', 'P61', 'P62', 'P63']
  };

  /**
   * Key instrument tags from P&IDs
   */
  static INSTRUMENTS = {
    hpCompPressure: { tag: 'PIC 52014', service: 'HP Compressor Discharge Pressure' },
    hpCompSuction: { tag: 'PT 52012', service: 'HP Compressor Suction Pressure' },
    lpCompPressure: { tag: 'PIC 51204', service: 'LP Compressor Discharge Pressure' },
    lpCompSuction: { tag: 'PIC 51101', service: 'LP Compression Suction' },
    blowerVSD: { tag: 'VSD', service: 'Hull Vent Blower Variable Speed Drive' },
    hpFlareKOLevel: { tag: 'LIC', service: 'HP Flare KO Drum Level' },
    lpFlareKOLevel: { tag: 'LIC', service: 'LP Flare KO Drum Level' },
    hpFlarePressure: { tag: 'PIC 21006', service: 'HP Flare Header Pressure', setpoint: 950 },
    hpKODrumPressure: { tag: 'PIC 21005', service: 'HP KO Drum Pressure', setpoint: 950 },
    lpFlarePressure: { tag: 'PIC 21016', service: 'LP Flare Header Pressure', setpoint: 70 },
    hullVentPressure: { tag: 'PIC 21009', service: 'Hull Vent / IGG Pressure', setpoint: 50 },
    blowerSuctionPS: { tag: 'PS 21804', service: 'Blower Suction Pressure Switch', sll: -40 },
    blowerDischPS: { tag: 'PS 21802', service: 'Blower Discharge Pressure', sll: -100, shh: 1000 }
  };

  /**
   * SDV (Shutdown Valve) tags from P&IDs — confirmed from Pressure Control diagram
   */
  static SDV_VALVES = {
    hpCompression: { tag: 'SDV 31022', service: 'HP Compression Isolation' },
    blowerSuction: { tag: 'SDV 21801', service: 'Hull Vent Blower Suction' },
    blower2ndIsolation: { tag: 'SDV 21002', service: '2nd Blower (6KA 2140) Isolation' },
    hpFlareIsolation: { tag: 'SDV 21105', service: 'HP Flare Isolation' },
    lpFlareIsolation: { tag: 'SDV 21205', service: 'LP Flare Isolation' },
    hpRecovery: { tag: 'SDV 52104', service: 'HP Recovery to Gas Manifold' },
    lpRecovery: { tag: 'SDV 51204', service: 'LP Recovery to LP Compression' }
  };

  /**
   * Fail-Open Valves from Pressure Control diagram
   */
  static FOV_VALVES = {
    hpFlare: { tag: 'FOV 21104', service: 'HP Flare Fail-Open' },
    lpFlare: { tag: 'FOV 21204', service: 'LP Flare Fail-Open' }
  };

  /**
   * Pressure Control system setpoints — from WhatsApp Pressure Control diagram
   */
  static PRESSURE_CONTROL = {
    hpFlare: {
      controller: 'PIC 21006', setpoint: 950, unit: 'mbarg',
      controlValve: 'PV 21006', ruptureDisc: 3.9, // bar
      tripSwitches: { tag: 'PS 21129/30/31', sll: 100, shh: 2000, unit: 'mbarg' }
    },
    hpKODrum: {
      controller: 'PIC 21005', setpoint: 950, unit: 'mbarg',
      controlValve: 'PV 21005'
    },
    lpFlare: {
      controller: 'PIC 21016', setpoint: 70, unit: 'mbarg',
      controlValve: 'PV 21007', ruptureDisc: 0.45, // bar
      tripSwitches: { tag: 'PS 21229/30/31', sll: 0, shh: 300, unit: 'mbarg' }
    },
    hullVent: {
      controller: 'PIC 21009', setpoint: 50, unit: 'mbarg',
      subControllers: ['PIC 21009 A', 'PIC 21009 B', 'PIC 21009 C'],
      loadingCurve: { minSpeed: 50, maxSpeed: 100, pressureRange: [50, 90] }
    },
    lpCompSuction: {
      controller: 'PIC 51101', linkedTo: 'PS 34002 A/B',
      tripSwitches: { shh: 2000, unit: 'mbarg' }
    },
    cargoTanks: {
      pvValves: { tag: 'PIV 61001/14', pressure: 140, vacuum: 70, unit: 'mbarg' },
      pvBreaker: { tag: 'LC 6215', pressure: 210, vacuum: 70, unit: 'mbarg' },
      hvvValves: { tag: 'HVV 61001/002', setpoint: 100, unit: 'mbarg' },
      cotPS: { tag: 'PS 31044', sll: 10, shh: 90, unit: 'mbarg' }
    }
  };

  /**
   * Engineering notes extracted from P&ID revision notes
   */
  static ENGINEERING_NOTES = {
    sbdvFastOpening: 'SBDV to be fast opening type (Note 14)',
    sdvClosesOnFlaring: 'SDV closes on initiation of flaring (Note 15)',
    futureGasExport: 'Future connection to gas export depressurisation (Note 12)',
    debottlenecking: 'New PV/V valves to allow 1775 Sm³/h per debottlenecking study (Note 13)',
    blowerDegradedMode: 'Blower discharge connection used only in degraded mode PV/PSV to flare (LP Note 14)',
    pumpAutoChangeover: 'Trip of duty pump initiates auto changeover of stand-by pump (Note 6)',
    twoBy100Pumps: '2 × 100% pumps redundancy (Note 9)',
    flarePipeSlope: 'All flare piping min 1% aft-to-bow, 4.5% bow-to-aft & transverse'
  };

  /**
   * Returns the complete equipment knowledge base for the AI
   */
  static getEquipmentDB() {
    return {
      equipment: this.EQUIPMENT,
      headers: this.FLARE_HEADERS,
      instruments: this.INSTRUMENTS,
      sdvValves: this.SDV_VALVES,
      fovValves: this.FOV_VALVES,
      pressureControl: this.PRESSURE_CONTROL,
      engineeringNotes: this.ENGINEERING_NOTES
    };
  }

  /**
   * Optimization using real FPSO equipment constraints
   */
  static optimize(data) {
    const hpFlareFlow = data?.monitoring?.totals?.totalHP || 7975;
    const lpFlareFlow = data?.monitoring?.totals?.totalLP || 19925;
    const totalFlaring = hpFlareFlow + lpFlareFlow;

    // Real equipment capacity limits from P&IDs
    const HP_COMP_DESIGN = this.EQUIPMENT.hpCompressor3rdStage.designFlowrate;  // 4,000,000 Sm³/d
    const LP_COMP_1ST_DESIGN = this.EQUIPMENT.lpCompressor1stStage.designFlowrate; // 8,180,000 Sm³/d
    const LP_COMP_2ND_DESIGN = this.EQUIPMENT.lpCompressor2ndStage.designFlowrate; // 8,160,000 Sm³/d
    const BLOWER_DESIGN = this.EQUIPMENT.hullVentBlower.designFlowrate;             // 72,000 Sm³/d
    const BLOWER_2_DESIGN = this.EQUIPMENT.hullVentBlower2nd.designFlowrate;        // 72,000 Sm³/d
    const TOTAL_BLOWER_DESIGN = BLOWER_DESIGN + BLOWER_2_DESIGN;                    // 144,000 Sm³/d (2× blowers)

    // Operating margins: use 85% of design capacity as max continuous
    const HP_COMP_MAX = HP_COMP_DESIGN * 0.85;
    const LP_COMP_MAX = Math.min(LP_COMP_1ST_DESIGN, LP_COMP_2ND_DESIGN) * 0.85;
    const BLOWER_MAX = TOTAL_BLOWER_DESIGN * 0.85;

    // Real pressure from Pressure Control diagram
    const HP_DESIGN_P = this.EQUIPMENT.hpCompressor3rdStage.workingPressure || 140;
    const LP_DESIGN_P = this.EQUIPMENT.lpCompressor2ndStage.workingPressure || 8;
    const HP_FLARE_SP = this.PRESSURE_CONTROL.hpFlare.setpoint;  // 950 mbarg
    const LP_FLARE_SP = this.PRESSURE_CONTROL.lpFlare.setpoint;  // 70 mbarg
    const HULL_VENT_SP = this.PRESSURE_CONTROL.hullVent.setpoint; // 50 mbarg

    // Sweep efficiency to find maximum feasible recovery
    let best = null;
    for (let eff = 0.85; eff <= 0.98; eff += 0.01) {
      const hpRec = hpFlareFlow * eff;
      const lpRec = lpFlareFlow * eff;

      // Size equipment with 10% safety margin, clamped to real design limits
      const hpCompRequired = hpRec * 1.1;
      const lpCompRequired = lpRec * 0.6 * 1.1;
      const blowerRequired = lpRec * 0.5 * 1.15;

      // Check against real equipment limits
      const hpFeasible = hpCompRequired <= HP_COMP_MAX;
      const lpFeasible = lpCompRequired <= LP_COMP_MAX;
      const blowerFeasible = blowerRequired <= BLOWER_MAX;

      if (hpFeasible && lpFeasible && blowerFeasible &&
          hpRec <= hpCompRequired && lpRec <= (lpCompRequired + blowerRequired * 0.5)) {
        const residual = totalFlaring - hpRec - lpRec;
        if (!best || residual < best.residualBurn) {
          const hpSuctionTemp = Array.isArray(this.EQUIPMENT.hpCompressor3rdStage.designTemp)
            ? this.EQUIPMENT.hpCompressor3rdStage.designTemp[0] : 40;
          const lpSuctionTemp = Array.isArray(this.EQUIPMENT.lpCompressor2ndStage.designTemp)
            ? this.EQUIPMENT.lpCompressor2ndStage.designTemp[0] : 8;
          const blowerWorkTemp = Array.isArray(this.EQUIPMENT.hullVentBlower.workingTemp)
            ? this.EQUIPMENT.hullVentBlower.workingTemp[1] : 60;

          // Determine blower distribution (primary + standby)
          const blower1Load = Math.min(blowerRequired, BLOWER_DESIGN);
          const blower2Load = Math.max(0, blowerRequired - BLOWER_DESIGN);

          best = {
            optimalEfficiency: eff,
            hpRecovered: hpRec,
            lpRecovered: lpRec,
            totalRecovered: hpRec + lpRec,
            residualBurn: residual,
            hpCompressor: {
              tag: this.EQUIPMENT.hpCompressor3rdStage.tag,
              name: this.EQUIPMENT.hpCompressor3rdStage.description,
              type: this.EQUIPMENT.hpCompressor3rdStage.type,
              vazao: Math.round(hpCompRequired),
              capacidadeDesign: HP_COMP_DESIGN,
              utilizacao: Math.round((hpCompRequired / HP_COMP_DESIGN) * 100),
              pressao: HP_DESIGN_P,
              temperatura: Math.round(hpSuctionTemp + (hpFlareFlow / 50000) * 8),
              material: this.EQUIPMENT.hpCompressor3rdStage.material
            },
            lpCompressor: {
              tag: this.EQUIPMENT.lpCompressor2ndStage.tag,
              name: this.EQUIPMENT.lpCompressor2ndStage.description,
              type: this.EQUIPMENT.lpCompressor2ndStage.type,
              vazao: Math.round(lpCompRequired),
              capacidadeDesign: LP_COMP_2ND_DESIGN,
              utilizacao: Math.round((lpCompRequired / LP_COMP_2ND_DESIGN) * 100),
              pressao: LP_DESIGN_P,
              temperatura: Math.round(lpSuctionTemp + (lpFlareFlow / 50000) * 5),
              motor: this.EQUIPMENT.lpCompressorMotor.motorPower,
              material: this.EQUIPMENT.lpCompressor2ndStage.material
            },
            lpCompressor1st: {
              tag: this.EQUIPMENT.lpCompressor1stStage.tag,
              name: this.EQUIPMENT.lpCompressor1stStage.description,
              type: this.EQUIPMENT.lpCompressor1stStage.type,
              designFlowrate: LP_COMP_1ST_DESIGN,
              pressao: this.EQUIPMENT.lpCompressor1stStage.designPressure,
              antiSurge: this.EQUIPMENT.lpCompressor1stStage.antiSurge
            },
            blower: {
              tag: this.EQUIPMENT.hullVentBlower.tag,
              name: this.EQUIPMENT.hullVentBlower.description,
              type: this.EQUIPMENT.hullVentBlower.type,
              vazao: Math.round(blower1Load),
              capacidadeDesign: BLOWER_DESIGN,
              utilizacao: Math.round((blower1Load / BLOWER_DESIGN) * 100),
              pressao: 0.19,
              temperatura: blowerWorkTemp,
              motor: this.EQUIPMENT.hullVentBlower.motorPower,
              vsd: true,
              material: this.EQUIPMENT.hullVentBlower.material
            },
            blower2nd: {
              tag: this.EQUIPMENT.hullVentBlower2nd.tag,
              name: this.EQUIPMENT.hullVentBlower2nd.description,
              vazao: Math.round(blower2Load),
              capacidadeDesign: BLOWER_2_DESIGN,
              utilizacao: Math.round((blower2Load / BLOWER_2_DESIGN) * 100),
              standby: blower2Load === 0,
              vsd: true,
              motor: 32
            },
            // Pressure control setpoints
            pressureControl: {
              hpFlare: { controller: 'PIC 21006', sp: HP_FLARE_SP, unit: 'mbarg' },
              lpFlare: { controller: 'PIC 21016', sp: LP_FLARE_SP, unit: 'mbarg' },
              hullVent: { controller: 'PIC 21009', sp: HULL_VENT_SP, unit: 'mbarg' },
              hpKODrum: { controller: 'PIC 21005', sp: HP_FLARE_SP, unit: 'mbarg' }
            },
            // Auxiliary equipment involved
            auxiliaryEquipment: {
              hpKODrum: this.EQUIPMENT.hpFlareKODrum,
              hpKODrum2: this.EQUIPMENT.hpFlareKODrum2nd,
              lpKODrum: this.EQUIPMENT.lpFlareKODrum,
              lpKODrum2: this.EQUIPMENT.lpFlareKODrum2nd,
              hpSuctionCoolerA: this.EQUIPMENT.hpSuctionCooler1st,
              hpSuctionCoolerB: this.EQUIPMENT.hpSuctionCooler1stB,
              hpSuctionScrubber: this.EQUIPMENT.hpSuctionScrubber1st,
              lpSuctionCooler: this.EQUIPMENT.lpSuctionCooler,
              lpSuctionScrubber: this.EQUIPMENT.lpSuctionScrubber,
              inletFilter: this.EQUIPMENT.hullVentInletFilter,
              molecularSieves: this.EQUIPMENT.molecularSieves,
              overheadCondenser: this.EQUIPMENT.overheadCondenser,
              flareIgnition: this.EQUIPMENT.flareIgnitionPanel,
              hpFlareTip: this.EQUIPMENT.hpFlareTip,
              lpFlareTip: this.EQUIPMENT.lpFlareTip,
              fovHP: this.FOV_VALVES.hpFlare,
              fovLP: this.FOV_VALVES.lpFlare
            }
          };
        }
      }
    }

    // If no feasible solution found, use a safe fallback
    if (!best) {
      best = {
        optimalEfficiency: 0.85,
        hpRecovered: hpFlareFlow * 0.85,
        lpRecovered: lpFlareFlow * 0.85,
        totalRecovered: totalFlaring * 0.85,
        residualBurn: totalFlaring * 0.15,
        hpCompressor: { tag: '6KB 5230A', vazao: Math.round(hpFlareFlow * 0.935), pressao: 140, temperatura: 80 },
        lpCompressor: { tag: '6KB 5120', vazao: Math.round(lpFlareFlow * 0.561), pressao: 8, temperatura: 55 },
        lpCompressor1st: { tag: '6KB 5110', pressao: 10 },
        blower: { tag: '6KA 2120', vazao: Math.round(lpFlareFlow * 0.489), pressao: 0.19, temperatura: 60 },
        blower2nd: { tag: '6KA 2140', vazao: 0, standby: true },
        pressureControl: {},
        auxiliaryEquipment: {}
      };
    }

    // Valve states with real SDV tags from Pressure Control diagram
    best.valveStates = {
      'SDV 31022': { state: 'OPEN', service: 'HP Compression Isolation' },
      'SDV 52104': { state: 'OPEN', service: 'HP Recovery → Gas Manifold' },
      'SDV 51204': { state: 'OPEN', service: 'LP Recovery → LP Compression' },
      'SDV 21801': { state: 'OPEN', service: 'Hull Vent Blower Suction' },
      'SDV 21002': { state: best.blower2nd?.standby ? 'CLOSED' : 'OPEN', service: '2nd Blower 6KA 2140' },
      'SDV 21105': { state: 'CLOSED', service: 'HP Flare Bypass (recovery mode)' },
      'SDV 21205': { state: 'CLOSED', service: 'LP Flare Bypass (recovery mode)' },
      'FOV 21104': { state: 'CLOSED', service: 'HP Flare Fail-Open (armed)' },
      'FOV 21204': { state: 'CLOSED', service: 'LP Flare Fail-Open (armed)' }
    };

    // Emissions and economics using existing calculators
    const cenarioAtual = EmissionCalculator.calcularCenarioAtual(data);
    const cenarioProposto = EmissionCalculator.calcularCenarioProposto(data, best.optimalEfficiency);
    const economics = EconomicCalculator.analisarProjeto(cenarioAtual, cenarioProposto);

    best.emissions = {
      current: cenarioAtual,
      proposed: cenarioProposto,
      reduction: cenarioAtual.emissoes_total - cenarioProposto.emissoes_total,
      reductionPercent: ((cenarioAtual.emissoes_total - cenarioProposto.emissoes_total) / cenarioAtual.emissoes_total * 100)
    };
    best.economics = economics;

    // Add full equipment database and pressure control reference
    best.equipmentDB = this.EQUIPMENT;
    best.pressureControlDB = this.PRESSURE_CONTROL;
    best.engineeringNotes = this.ENGINEERING_NOTES;

    return best;
  }
}

export default {
  EmissionCalculator,
  EconomicCalculator,
  GasRecoveryOptimizer
};
