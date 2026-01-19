/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * VALIDADOR DE DADOS - Módulo de Validação de Entradas
 * Garante integridade dos dados inseridos pelo usuário
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export class DataValidator {
  /**
   * Valida valores de vazão volumétrica
   *
   * @param {number} value - Valor a ser validado
   * @param {number} min - Valor mínimo permitido
   * @param {number} max - Valor máximo permitido
   * @param {string} name - Nome do parâmetro (para mensagens de erro)
   * @returns {Object} { valid: boolean, message: string, value: number }
   */
  static validateFlow(value, min, max, name) {
    // Verificar se é um número
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        valid: false,
        message: `${name}: Valor deve ser numérico`,
        value: null
      };
    }

    // Verificar se é finito (não Infinity)
    if (!isFinite(value)) {
      return {
        valid: false,
        message: `${name}: Valor não pode ser infinito`,
        value: null
      };
    }

    // Verificar se está no intervalo permitido
    if (value < min) {
      return {
        valid: false,
        message: `${name}: Valor mínimo é ${min.toLocaleString('pt-BR')}`,
        value: min
      };
    }

    if (value > max) {
      return {
        valid: false,
        message: `${name}: Valor máximo é ${max.toLocaleString('pt-BR')}`,
        value: max
      };
    }

    // Validação bem-sucedida
    return {
      valid: true,
      message: '',
      value: value
    };
  }

  /**
   * Valida valores de temperatura
   *
   * @param {number} value - Temperatura em °C
   * @param {string} name - Nome do parâmetro
   * @returns {Object} Resultado da validação
   */
  static validateTemperature(value, name = 'Temperatura') {
    return this.validateFlow(
      value,
      -50,  // Mínimo: -50°C (operações criogênicas)
      200,  // Máximo: 200°C (limite seguro para equipamentos)
      name
    );
  }

  /**
   * Valida valores de pressão
   *
   * @param {number} value - Pressão em bar
   * @param {string} name - Nome do parâmetro
   * @returns {Object} Resultado da validação
   */
  static validatePressure(value, name = 'Pressão') {
    return this.validateFlow(
      value,
      0,    // Mínimo: 0 bar (vácuo/atmosférico)
      300,  // Máximo: 300 bar (limite seguro)
      name
    );
  }

  /**
   * Valida vazão de compressores
   *
   * @param {number} value - Vazão em Sm³/d
   * @param {string} name - Nome do compressor
   * @returns {Object} Resultado da validação
   */
  static validateCompressorFlow(value, name = 'Compressor') {
    return this.validateFlow(
      value,
      0,        // Mínimo: 0 Sm³/d (desligado)
      500000,   // Máximo: 500.000 Sm³/d (capacidade máxima típica)
      `${name} - Vazão`
    );
  }

  /**
   * Valida vazão de flaring
   *
   * @param {number} value - Vazão em Sm³/d
   * @param {string} name - Nome da fonte
   * @returns {Object} Resultado da validação
   */
  static validateFlaringFlow(value, name = 'Flaring') {
    return this.validateFlow(
      value,
      0,       // Mínimo: 0 Sm³/d (nenhuma queima)
      100000,  // Máximo: 100.000 Sm³/d (queima excessiva)
      `${name} - Vazão`
    );
  }

  /**
   * Valida percentual (0-100%)
   *
   * @param {number} value - Percentual
   * @param {string} name - Nome do parâmetro
   * @returns {Object} Resultado da validação
   */
  static validatePercentage(value, name = 'Percentual') {
    return this.validateFlow(
      value,
      0,    // Mínimo: 0%
      100,  // Máximo: 100%
      name
    );
  }

  /**
   * Valida taxa de desconto/crescimento
   *
   * @param {number} value - Taxa (ex: 0.10 para 10%)
   * @param {string} name - Nome do parâmetro
   * @returns {Object} Resultado da validação
   */
  static validateRate(value, name = 'Taxa') {
    return this.validateFlow(
      value,
      0,     // Mínimo: 0%
      1.0,   // Máximo: 100%
      name
    );
  }

  /**
   * Valida investimento/custos
   *
   * @param {number} value - Valor em USD ou k USD
   * @param {string} name - Nome do parâmetro
   * @returns {Object} Resultado da validação
   */
  static validateInvestment(value, name = 'Investimento') {
    return this.validateFlow(
      value,
      0,           // Mínimo: 0 USD
      100000000,   // Máximo: 100 milhões USD
      name
    );
  }

  /**
   * Valida múltiplos valores de uma vez
   *
   * @param {Object} data - Objeto com pares chave-valor
   * @param {Object} validators - Objeto com funções validadoras por chave
   * @returns {Object} { valid: boolean, errors: Array, sanitizedData: Object }
   */
  static validateBatch(data, validators) {
    const errors = [];
    const sanitizedData = {};

    Object.entries(data).forEach(([key, value]) => {
      if (validators[key]) {
        const result = validators[key](value, key);

        if (!result.valid) {
          errors.push({
            field: key,
            message: result.message
          });
        }

        // Usar valor sanitizado (ou corrigido)
        sanitizedData[key] = result.value !== null ? result.value : value;
      } else {
        // Se não há validador, aceitar valor
        sanitizedData[key] = value;
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors,
      sanitizedData: sanitizedData
    };
  }

  /**
   * Sanitiza valor numérico (corrige NaN e Infinity)
   *
   * @param {any} value - Valor a ser sanitizado
   * @param {number} defaultValue - Valor padrão se inválido
   * @returns {number} Valor sanitizado
   */
  static sanitizeNumber(value, defaultValue = 0) {
    const num = Number(value);

    if (isNaN(num) || !isFinite(num)) {
      return defaultValue;
    }

    return num;
  }

  /**
   * Sanitiza objeto com valores numéricos
   *
   * @param {Object} data - Objeto com valores numéricos
   * @param {Object} defaults - Valores padrão por chave
   * @returns {Object} Objeto sanitizado
   */
  static sanitizeData(data, defaults = {}) {
    const sanitized = {};

    Object.keys(data).forEach(key => {
      sanitized[key] = this.sanitizeNumber(
        data[key],
        defaults[key] || 0
      );
    });

    return sanitized;
  }
}

/**
 * Validadores pré-configurados para uso rápido
 */
export const Validators = {
  // Sistema de Monitoramento - HP Flare
  hp1: (value) => DataValidator.validateFlaringFlow(value, 'HP Comp 1'),
  hp2: (value) => DataValidator.validateFlaringFlow(value, 'HP Comp 2'),

  // Sistema de Monitoramento - LP Flare
  lp1: (value) => DataValidator.validateFlaringFlow(value, 'LP Comp 3'),
  lp2: (value) => DataValidator.validateFlaringFlow(value, 'LP Comp 4'),

  // Compressores - Vazão
  vazaoHP: (value) => DataValidator.validateCompressorFlow(value, 'HP'),
  vazaoLP: (value) => DataValidator.validateCompressorFlow(value, 'LP'),
  vazaoBlower: (value) => DataValidator.validateCompressorFlow(value, 'Blower'),

  // Compressores - Pressão
  pressaoHP: (value) => DataValidator.validatePressure(value, 'Pressão HP'),
  pressaoLP: (value) => DataValidator.validatePressure(value, 'Pressão LP'),
  pressaoBlower: (value) => DataValidator.validatePressure(value, 'Pressão Blower'),

  // Compressores - Temperatura
  temperaturaHP: (value) => DataValidator.validateTemperature(value, 'Temperatura HP'),
  temperaturaLP: (value) => DataValidator.validateTemperature(value, 'Temperatura LP'),
  temperaturaBlower: (value) => DataValidator.validateTemperature(value, 'Temperatura Blower'),

  // Econômicos
  investimento: (value) => DataValidator.validateInvestment(value, 'Investimento'),
  taxaDesconto: (value) => DataValidator.validateRate(value, 'Taxa de Desconto'),

  // Percentuais
  eficiencia: (value) => DataValidator.validatePercentage(value, 'Eficiência'),
  taxaRecuperacao: (value) => DataValidator.validatePercentage(value, 'Taxa de Recuperação')
};

export default {
  DataValidator,
  Validators
};
