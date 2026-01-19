# 🏭 Simulador Gas Recovery - Campo Magnólia

Aplicação web moderna para simulação e análise de estratégias de redução de queima de gás.

## 📋 Sobre o Projeto

**Autora:** Leodumira Irina Pereira Lourenço
**Instituição:** UCAN - Universidade Católica de Angola
**Curso:** Engenharia de Petróleos
**Ano:** 2025
**Tema:** Estratégias de Redução de Queima de Gás - Campo Magnólia

## ✨ Funcionalidades Completas

### 🔄 Conversor de Unidades Integrado
- Conversão automática entre múltiplas unidades
- **Vazão:** Sm³/d, KSm³/d, MSm³/d, m³/h, m³/s, ft³/d, Mft³/d, L/s, bbl/d (9 unidades)
- **Pressão:** bar, kPa, MPa, psi, atm, kgf/cm² (8 unidades)
- **Temperatura:** °C, K, °F, °R (4 escalas)
- **Massa:** kg/s, kg/h, t/h, t/d, lb/h, lb/s (6 unidades)
- **Energia:** kW, MW, HP, BTU/h, kcal/h (5 unidades)
- **Volume:** m³, L, bbl, gal, ft³ (5 unidades)

### 🧮 Calculadora Automática
- Operações rápidas: ×2, ÷2, +10%, -10%, +20%, -20%
- Fórmulas personalizadas com variáveis
- Calculadora multi-variável
- Avaliação segura de expressões matemáticas

### 📊 Gráficos Interativos (Plotly.js)
- **Comparação de Vazões:** Barras verticais HP/LP Flare
- **Distribuição HP vs LP:** Gráfico de pizza com percentuais
- **Pressão vs Temperatura:** Gráfico de duplo eixo
- **Vazões dos Compressores:** Comparação de equipamentos
- Todos com zoom, pan, export PNG e interatividade completa

### 🎯 Sistema de Monitoramento
- Monitoramento em tempo real HP/LP Flare
- **4 componentes** configuráveis (HP1, HP2, LP1, LP2)
- Alertas automáticos quando excede limite de 61.000 Sm³/d
- Cálculos instantâneos de totais
- Indicador de eficiência operacional

### 🌍 Comparação de Cenários (NOVO!)
- **Cenário Atual:** Sistema convencional de queima
- **Cenário Proposto:** Sistema com recuperação de gás (85% eficiência)
- **Imagens dos Sistemas:** Diagramas de fluxo (01.jpeg e 02.jpeg)
- **Cálculos Ambientais:**
  - Emissões de CO₂eq por fonte (LP Flare, HP Flare, Hull Vent)
  - Custo ambiental (@ $84/tCO₂eq)
  - Equivalências (carros, árvores, casas)
- **Análise Econômica:**
  - VPL (Valor Presente Líquido) - 10 anos
  - TIR (Taxa Interna de Retorno)
  - Payback (período de retorno)
  - Viabilidade do projeto

### 📥 Exportação de Dados (IMPLEMENTADO!)
- **Excel (.xlsx):** Relatório completo com múltiplas abas
  - Resumo Executivo (comparações, melhorias)
  - Detalhes Técnicos (emissões por fonte, dados operacionais)
- **JSON:** Dados brutos completos para integração
- **PDF:** Em desenvolvimento (estrutura pronta)

### 🎨 Interface Moderna e Minimalista
- Design limpo inspirado em aplicações desktop C#/WPF
- Paleta de cores profissional (cinza + vermelho sutil)
- **5 Abas Organizadas:**
  1. Visão Geral - Dashboard com KPIs
  2. Comparação - Cenários Atual vs Proposto
  3. Gráficos - 4 visualizações interativas
  4. Calculadora - Fórmulas personalizadas
  5. Relatórios - Exportação de dados
- Animações suaves (fadeIn, transitions)
- 100% responsivo (desktop, tablet, mobile)
- Sidebar expansível com seções colapsáveis
- Scrollbar personalizado

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework frontend
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Plotly.js** - Gráficos científicos interativos
- **Lucide React** - Ícones modernos
- **XLSX** - Exportação para Excel
- **jsPDF** - Geração de PDFs

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+ (recomendado: versão LTS mais recente)
- npm ou yarn

### Passos de Instalação

1. **Clone ou acesse o diretório do projeto:**
```bash
cd gas-recovery-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse no navegador:**
```
http://localhost:3000
```

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
gas-recovery-app/
├── public/               # Arquivos estáticos
├── src/
│   ├── components/       # Componentes React
│   │   ├── Charts.jsx    # Gráficos Plotly
│   │   ├── MetricCard.jsx # Cards de métricas
│   │   ├── Sidebar.jsx   # Barra lateral
│   │   └── UnitInput.jsx # Input com conversor
│   ├── utils/
│   │   └── unitConverter.js # Conversor de unidades
│   ├── App.jsx          # Componente principal
│   ├── index.css        # Estilos globais Tailwind
│   └── main.jsx         # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Como Usar

### 1. Configurar Parâmetros
- Use a **sidebar** à esquerda para inserir valores
- Ative o **Sistema de Monitoramento** para HP/LP Flare
- Configure **vazão, pressão e temperatura** dos compressores

### 2. Visualizar Dados
- **Visão Geral:** KPIs principais e resumos
- **Gráficos:** Visualizações interativas
- **Calculadora:** Operações e fórmulas (em desenvolvimento)
- **Relatórios:** Exportação de dados

### 3. Converter Unidades
- Cada campo numérico possui um **dropdown de unidades**
- Expanda "**Conversões**" para ver valores em todas as unidades
- Use "**Calculadora**" para operações rápidas

### 4. Exportar Resultados
- Clique em **Excel**, **JSON** ou **PDF** no cabeçalho
- Relatórios completos com todos os dados

## 🔧 Customização

### Alterar Cores do Tema

Edite `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Altere estas cores
        600: '#dc2626',
        700: '#b91c1c',
      }
    }
  }
}
```

### Adicionar Novas Unidades

Edite `src/utils/unitConverter.js`:

```js
static CONVERSIONS = {
  volume_flow: {
    'NovaUnidade': fatorDeConversao,
    // ...
  }
}
```

### Modificar Limite de Flaring

Em `src/components/Sidebar.jsx`, altere:

```js
const limit = 61000; // Altere para seu limite
```

## 📊 Dados Padrão

### Sistema de Monitoramento
- **HP Componente 1:** 15.000 Sm³/d
- **HP Componente 2:** 11.000 Sm³/d
- **LP Componente 3:** 10.000 Sm³/d
- **LP Componente 4:** 8.000 Sm³/d
- **Limite Total:** 61.000 Sm³/d

### Compressores
- **HP:** 250.000 Sm³/d, 151 bar, 80°C
- **LP:** 200.000 Sm³/d, 10 bar, 60°C
- **Blower:** 250.000 Sm³/d, 1.913 bar, 50°C

## 🌐 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Arraste a pasta dist/ para Netlify
```

### GitHub Pages

1. Edite `vite.config.js`:
```js
export default defineConfig({
  base: '/nome-do-repositorio/',
  // ...
})
```

2. Build e deploy:
```bash
npm run build
npm run deploy # configure script no package.json
```

## 📝 Licença

Este projeto é parte de um Trabalho de Conclusão de Curso (TCC) da UCAN.

## 👨‍💻 Autoria

**Leodumira Irina Pereira Lourenço**
Engenharia de Petróleos - UCAN 2025

Campo Magnólia - Estratégias de Redução de Queima de Gás

---

## 🆘 Suporte

Em caso de dúvidas ou problemas:

1. Consulte o arquivo [INSTALACAO.md](INSTALACAO.md) para guia passo a passo
2. Verifique se todas as dependências estão instaladas: `npm install`
3. Confirme que está usando Node.js 18+: `node --version`
4. Limpe o cache se houver problemas:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Comandos Principais

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento (abre em http://localhost:3000)
npm run dev

# Build de produção
npm run build

# Visualizar build
npm run preview
```

---

## 🎯 Diferencial desta Versão

Transformação completa do aplicativo Streamlit Python para React JavaScript:

| Aspecto | Python/Streamlit | JavaScript/React |
|---------|------------------|------------------|
| **Performance** | Servidor necessário | 100% no browser |
| **Velocidade** | Recarrega a cada input | Instantâneo (estado local) |
| **Tamanho** | ~50MB Python + deps | ~2MB build minificado |
| **Deploy** | Streamlit Cloud, Heroku | Vercel, Netlify (grátis) |
| **Customização** | Limitada (st.markdown) | Total controle (React/Tailwind) |
| **Offline** | Não | Sim (após primeiro load) |
| **Gráficos** | Plotly Python | Plotly.js (mesma lib) |
| **Exportação** | Limitada | Excel/JSON nativos |

---

**Desenvolvido com ❤️ usando React 18 + Vite + Tailwind CSS + Plotly.js**

**Stack Tecnológico:**
- ⚛️ React 18.2
- ⚡ Vite 5.0
- 🎨 Tailwind CSS 3.4
- 📊 Plotly.js 2.28
- 📥 XLSX (exportação Excel)
- 🎯 jsPDF (exportação PDF)
- 🎨 Lucide React (ícones)
