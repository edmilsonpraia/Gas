# 🚀 Guia de Instalação Rápida

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** (recomendado: versão LTS mais recente)
  - Download: https://nodejs.org/
  - Verificar instalação: `node --version`

## Passo a Passo

### 1. Abrir o Terminal

Navegue até a pasta do projeto:

```bash
cd c:\Users\user\Desktop\UCAN\UCAN\gas-recovery-app
```

### 2. Instalar Dependências

Execute o comando:

```bash
npm install
```

⏳ Este processo pode levar alguns minutos na primeira vez.

### 3. Executar o Aplicativo

Após a instalação, execute:

```bash
npm run dev
```

✅ O aplicativo abrirá automaticamente no navegador em:
```
http://localhost:3000
```

## Problemas Comuns

### Erro: "npm not found"
- Reinstale o Node.js do site oficial
- Reinicie o terminal após a instalação

### Erro de porta em uso
- Feche outros servidores rodando na porta 3000
- Ou edite `vite.config.js` para usar outra porta

### Erro ao instalar dependências
Execute:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Build para Produção

Para criar uma versão otimizada:

```bash
npm run build
```

Os arquivos estarão em `dist/`.

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Executar em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Visualizar build |
| `npm run lint` | Verificar código |

## Recursos da Aplicação

✅ **Conversor de Unidades** - 50+ unidades em 6 categorias
✅ **Sistema de Monitoramento** - HP/LP Flare em tempo real
✅ **Gráficos Interativos** - 4 tipos de visualização com Plotly.js
✅ **Comparação de Cenários** - Atual vs Proposto com análise econômica
✅ **Cálculos Ambientais** - Emissões, custos e equivalências
✅ **Exportação** - Excel, JSON e PDF
✅ **Interface Minimalista** - Design moderno e responsivo

## Suporte

Em caso de dúvidas:
1. Verifique o arquivo README.md
2. Consulte a documentação do Vite: https://vitejs.dev/
3. Documentação do React: https://react.dev/

---

**Desenvolvido para TCC - Engenharia de Petróleos | UCAN 2025**
**Autora: Leodumira Irina Pereira Lourenço**
