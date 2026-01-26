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

export default {
  EmissionCalculator,
  EconomicCalculator
};
