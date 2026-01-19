/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONVERSOR DE UNIDADES - Versão JavaScript
 * Módulo para conversão de unidades físicas e cálculos automáticos
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export class UnitConverter {
  // Definição de unidades e fatores de conversão
  static CONVERSIONS = {
    volume_flow: {
      'Sm³/d': 1.0,
      'KSm³/d': 1000.0,
      'MSm³/d': 1000000.0,
      'm³/h': 24.0,
      'm³/s': 86400.0,
      'ft³/d': 35.3147,
      'Mft³/d': 35314.7,
      'L/s': 86400000.0,
      'bbl/d': 6.28981
    },
    pressure: {
      'bar': 1.0,
      'bara': 1.0,
      'barg': 1.0,
      'kPa': 0.01,
      'MPa': 10.0,
      'psi': 0.0689476,
      'psig': 0.0689476,
      'psia': 0.0689476,
      'atm': 1.01325,
      'kgf/cm²': 0.980665
    },
    temperature: {
      '°C': { offset: 0, scale: 1 },
      'K': { offset: -273.15, scale: 1 },
      '°F': { offset: -32, scale: 5/9 },
      '°R': { offset: -491.67, scale: 5/9 }
    },
    mass_flow: {
      'kg/s': 1.0,
      'kg/h': 1/3600,
      't/h': 1000/3600,
      't/d': 1000/86400,
      'lb/h': 0.453592/3600,
      'lb/s': 0.453592
    },
    energy: {
      'kW': 1.0,
      'MW': 1000.0,
      'HP': 0.745699,
      'BTU/h': 0.000293071,
      'kcal/h': 0.001163
    },
    volume: {
      'm³': 1.0,
      'L': 0.001,
      'bbl': 0.158987,
      'gal': 0.00378541,
      'ft³': 0.0283168
    }
  };

  /**
   * Converte um valor de uma unidade para outra
   * @param {number} value - Valor a ser convertido
   * @param {string} fromUnit - Unidade de origem
   * @param {string} toUnit - Unidade de destino
   * @param {string} unitType - Tipo de unidade (volume_flow, pressure, etc)
   * @returns {number} Valor convertido
   */
  static convert(value, fromUnit, toUnit, unitType) {
    if (unitType === 'temperature') {
      // Conversão de temperatura (não-linear)
      const conversions = this.CONVERSIONS.temperature;
      const celsius = (value + conversions[fromUnit].offset) / conversions[fromUnit].scale;
      return celsius * conversions[toUnit].scale - conversions[toUnit].offset;
    } else {
      // Conversões lineares
      const conversions = this.CONVERSIONS[unitType] || {};
      if (!(fromUnit in conversions) || !(toUnit in conversions)) {
        return value;
      }

      // Converte para unidade base e depois para unidade destino
      const baseValue = value * conversions[fromUnit];
      return baseValue / conversions[toUnit];
    }
  }

  /**
   * Retorna lista de unidades disponíveis para um tipo
   * @param {string} unitType - Tipo de unidade
   * @returns {string[]} Array de unidades disponíveis
   */
  static getUnits(unitType) {
    return Object.keys(this.CONVERSIONS[unitType] || {});
  }

  /**
   * Converte um valor para todas as unidades disponíveis
   * @param {number} value - Valor a ser convertido
   * @param {string} fromUnit - Unidade de origem
   * @param {string} unitType - Tipo de unidade
   * @returns {Object} Objeto com todas as conversões
   */
  static convertToAll(value, fromUnit, unitType) {
    const units = this.getUnits(unitType);
    const conversions = {};

    units.forEach(unit => {
      conversions[unit] = this.convert(value, fromUnit, unit, unitType);
    });

    return conversions;
  }
}

/**
 * Calculadora automática com suporte a expressões matemáticas
 */
export class Calculator {
  /**
   * Avalia uma expressão matemática com variáveis
   * @param {string} expression - Expressão matemática (ex: "a + b * 2")
   * @param {Object} variables - Dicionário com valores das variáveis
   * @returns {number|null} Resultado da expressão ou null se houver erro
   */
  static evaluate(expression, variables = {}) {
    try {
      // Substitui variáveis na expressão
      let expr = expression;
      Object.entries(variables).forEach(([varName, value]) => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        expr = expr.replace(regex, value.toString());
      });

      // Funções matemáticas permitidas
      const allowedFunctions = {
        abs: Math.abs,
        round: Math.round,
        min: Math.min,
        max: Math.max,
        pow: Math.pow,
        sqrt: Math.sqrt,
        floor: Math.floor,
        ceil: Math.ceil
      };

      // Cria contexto seguro para eval
      const safeEval = (expr) => {
        // Remove caracteres perigosos
        if (/[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(expr)) {
          // Verifica se há chamadas de função não permitidas
          const funcCalls = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g) || [];
          for (const func of funcCalls) {
            if (!(func in allowedFunctions)) {
              throw new Error(`Função não permitida: ${func}`);
            }
          }
        }

        // Substitui funções permitidas
        let safeExpr = expr;
        Object.entries(allowedFunctions).forEach(([name, func]) => {
          safeExpr = safeExpr.replace(new RegExp(`\\b${name}\\b`, 'g'), `allowedFunctions.${name}`);
        });

        return Function('allowedFunctions', `"use strict"; return (${safeExpr})`)(allowedFunctions);
      };

      const result = safeEval(expr);
      return parseFloat(result);
    } catch (error) {
      console.error('Erro ao avaliar expressão:', error);
      return null;
    }
  }

  /**
   * Cria e avalia uma fórmula personalizada
   * @param {string} name - Nome da fórmula
   * @param {string} formula - Fórmula matemática
   * @param {Object} variables - Variáveis disponíveis
   * @returns {Object} Objeto com resultado e descrição
   */
  static createFormula(name, formula, variables) {
    const result = this.evaluate(formula, variables);
    if (result !== null) {
      return {
        result,
        description: `${name}: ${formula} = ${result.toFixed(2)}`
      };
    }
    return {
      result: null,
      description: `${name}: Erro ao calcular`
    };
  }

  /**
   * Operações rápidas
   */
  static quickOperations = {
    double: (value) => value * 2,
    half: (value) => value / 2,
    increase10: (value) => value * 1.1,
    decrease10: (value) => value * 0.9,
    increase20: (value) => value * 1.2,
    decrease20: (value) => value * 0.8
  };
}

/**
 * Formatador de números
 */
export class NumberFormatter {
  /**
   * Formata número com separadores de milhar
   * @param {number} value - Valor a ser formatado
   * @param {number} decimals - Casas decimais
   * @returns {string} Número formatado
   */
  static format(value, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  /**
   * Formata número com unidade
   * @param {number} value - Valor
   * @param {string} unit - Unidade
   * @param {number} decimals - Casas decimais
   * @returns {string} Valor formatado com unidade
   */
  static formatWithUnit(value, unit, decimals = 2) {
    return `${this.format(value, decimals)} ${unit}`;
  }

  /**
   * Formata notação científica
   * @param {number} value - Valor
   * @returns {string} Valor em notação científica
   */
  static toScientific(value) {
    return value.toExponential(2);
  }
}

export default {
  UnitConverter,
  Calculator,
  NumberFormatter
};
