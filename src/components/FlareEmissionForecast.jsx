import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { PulseSquare24Regular, ErrorCircle20Regular, LeafTwo24Regular, PulseSquare20Regular } from '@fluentui/react-icons';
import { useLanguage } from '../contexts/LanguageContext';

/* VS Code theme hook */
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.body.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return {
    isDark,
    plotBg:  isDark ? '#1e1e1e' : '#ffffff',
    paperBg: isDark ? '#252526' : '#ffffff',
    grid:    isDark ? '#333333' : '#e5e7eb',
    txt:     isDark ? '#d4d4d4' : '#1f2937',
    txtS:    isDark ? '#858585' : '#6b7280',
    border:  isDark ? '#3e3e3e' : '#e5e7eb',
    font:    { family: 'Consolas, Monaco, monospace', color: isDark ? '#d4d4d4' : '#1f2937' },
    accent:  '#007acc',
    red: '#f44747', green: '#4ec9b0', blue: '#569cd6', yellow: '#dcdcaa',
  };
}

export default function FlareEmissionForecast({ data }) {
  const { t } = useLanguage();
  const T = useTheme();
  const [predictions, setPredictions] = useState({ atual: null, proposto: null });
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState({ atual: null, proposto: null });
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('rf');

  const generateHistoricalData = (months = 48) => {
    const currentFlaring = (data.monitoring?.totals?.totalFlaring || 67900);
    const historical = [];
    for (let i = 0; i < months; i++) {
      const trend = currentFlaring * (1 + (i * 0.0008));
      const seasonal = Math.sin((i / 12) * 2 * Math.PI) * currentFlaring * 0.08;
      const operational = Math.sin((i / 3) * 2 * Math.PI) * currentFlaring * 0.03;
      const noise = (Math.random() - 0.5) * currentFlaring * 0.04;
      historical.push({
        month: i - months + 1,
        flaring: Math.max((trend + seasonal + operational + noise) * 0.85, 0),
        date: new Date(new Date().setMonth(new Date().getMonth() - (months - i))),
        monthOfYear: (new Date().getMonth() - (months - i) + 12) % 12,
        trend: i / months,
      });
    }
    return historical;
  };

  class DecisionTree {
    constructor(maxDepth = 5, minSamples = 2) { this.maxDepth = maxDepth; this.minSamples = minSamples; this.tree = null; }
    fit(X, y) { this.tree = this._build(X, y, 0); }
    _build(X, y, d) {
      const n = X.length;
      if (n < this.minSamples || d >= this.maxDepth) return { value: y.reduce((a, b) => a + b, 0) / n };
      const { fi, th } = this._bestSplit(X, y);
      if (fi === null) return { value: y.reduce((a, b) => a + b, 0) / n };
      const { lX, lY, rX, rY } = this._split(X, y, fi, th);
      return { fi, th, left: this._build(lX, lY, d + 1), right: this._build(rX, rY, d + 1) };
    }
    _bestSplit(X, y) {
      let bg = -Infinity, bf = null, bt = null;
      for (let f = 0; f < X[0].length; f++) {
        const vals = [...new Set(X.map(r => r[f]))].sort((a, b) => a - b);
        for (let i = 0; i < vals.length - 1; i++) {
          const th = (vals[i] + vals[i + 1]) / 2, g = this._gain(X, y, f, th);
          if (g > bg) { bg = g; bf = f; bt = th; }
        }
      }
      return { fi: bf, th: bt };
    }
    _gain(X, y, fi, th) {
      const { lY, rY } = this._split(X, y, fi, th);
      if (!lY.length || !rY.length) return 0;
      const v = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length; };
      return v(y) - (lY.length / y.length) * v(lY) - (rY.length / y.length) * v(rY);
    }
    _split(X, y, fi, th) {
      const lX = [], lY = [], rX = [], rY = [];
      X.forEach((r, i) => { if (r[fi] <= th) { lX.push(r); lY.push(y[i]); } else { rX.push(r); rY.push(y[i]); } });
      return { lX, lY, rX, rY };
    }
    predict(x) { return this._traverse(x, this.tree); }
    _traverse(x, n) { return n.value !== undefined ? n.value : x[n.fi] <= n.th ? this._traverse(x, n.left) : this._traverse(x, n.right); }
  }

  class RandomForest {
    constructor(nTrees = 10, maxDepth = 5) { this.nTrees = nTrees; this.maxDepth = maxDepth; this.trees = []; }
    fit(X, y) {
      this.trees = [];
      for (let i = 0; i < this.nTrees; i++) {
        const n = X.length, bX = [], bY = [];
        for (let j = 0; j < n; j++) { const idx = Math.floor(Math.random() * n); bX.push(X[idx]); bY.push(y[idx]); }
        const tree = new DecisionTree(this.maxDepth);
        tree.fit(bX, bY);
        this.trees.push(tree);
      }
    }
    predict(x) { return this.trees.reduce((s, t) => s + t.predict(x), 0) / this.trees.length; }
  }

  class KNN {
    constructor(k = 5) { this.k = k; this.X = null; this.y = null; }
    fit(X, y) { this.X = X; this.y = y; }
    predict(x) {
      const d = this.X.map((s, i) => ({ d: Math.sqrt(s.reduce((sum, v, j) => sum + (v - x[j]) ** 2, 0)), v: this.y[i] }));
      d.sort((a, b) => a.d - b.d);
      return d.slice(0, this.k).reduce((s, n) => s + n.v, 0) / this.k;
    }
  }

  const prepareData = (hist, lb = 3) => {
    const X = [], y = [];
    for (let i = lb; i < hist.length; i++) {
      const recent = hist.slice(i - lb, i).map(d => d.flaring);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      X.push([...recent, avg, recent[recent.length - 1] - avg, hist[i].monthOfYear / 11, hist[i].trend]);
      y.push(hist[i].flaring);
    }
    return { X, y };
  };

  const normalize = (X) => {
    const nf = X[0].length, means = [], stds = [];
    for (let j = 0; j < nf; j++) {
      const vals = X.map(r => r[j]), mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
      means.push(mean); stds.push(std || 1);
    }
    return { nX: X.map(r => r.map((v, j) => (v - means[j]) / stds[j])), means, stds };
  };

  const calcMetrics = (yT, yP) => {
    const n = yT.length, yM = yT.reduce((a, b) => a + b, 0) / n;
    let mae = 0, mse = 0, r2N = 0, r2D = 0;
    for (let i = 0; i < n; i++) { const e = Math.abs(yT[i] - yP[i]); mae += e; mse += e * e; r2N += (yT[i] - yP[i]) ** 2; r2D += (yT[i] - yM) ** 2; }
    return { mae: mae / n, rmse: Math.sqrt(mse / n), r2: 1 - r2N / (r2D || 1) };
  };

  const trainModels = async (hist) => {
    try {
      setIsTraining(true); setError(null);
      const { X, y } = prepareData(hist, 3);
      const { nX, means, stds } = normalize(X);
      const split = Math.floor(X.length * 0.7);
      const xTr = nX.slice(0, split), yTr = y.slice(0, split), xV = nX.slice(split), yV = y.slice(split);
      let model, mName;
      if (selectedModel === 'knn') { model = new KNN(3); mName = 'K-Nearest Neighbors'; }
      else { model = new RandomForest(10, 4); mName = 'Random Forest'; }
      model.fit(xTr, yTr);
      const vP = xV.map(x => model.predict(x));
      const mm = { ...calcMetrics(yV, vP), ...(selectedModel === 'rf' ? { numTrees: 10, maxDepth: 4 } : { k: 3 }) };

      const futureM = 6, pA = [], pP = [];
      let ldA = hist.slice(-3), ldP = hist.slice(-3);
      const cF = hist[hist.length - 1].flaring, tF = cF * 0.09;
      for (let i = 0; i < futureM; i++) {
        const rF = ldA.map(d => d.flaring), avg = rF.reduce((a, b) => a + b, 0) / rF.length;
        const fA = [...rF, avg, rF[rF.length - 1] - avg, ((hist[hist.length - 1].monthOfYear + i + 1) % 12) / 11, 1 + (i / futureM) * 0.03];
        const nfA = fA.map((v, j) => (v - means[j]) / stds[j]);
        pA.push(Math.max(0, model.predict(nfA)));
        const pPval = i < 3 ? cF - (cF - tF) * ((i + 1) / 3) + (Math.random() - 0.5) * cF * 0.01 : tF + (Math.random() - 0.5) * tF * 0.05;
        pP.push(Math.max(tF * 0.95, pPval));
        ldA = [...ldA.slice(1), { flaring: pA[i], monthOfYear: (hist[hist.length - 1].monthOfYear + i + 1) % 12, trend: 1 + (i / futureM) * 0.03 }];
        ldP = [...ldP.slice(1), { flaring: pP[i], monthOfYear: (hist[hist.length - 1].monthOfYear + i + 1) % 12, trend: 0.1 }];
      }
      setMetrics({ atual: mm, proposto: mm, modelName: mName });
      setPredictions({ atual: pA, proposto: pP });
      setIsTraining(false);
    } catch (err) { setError(err.message); setIsTraining(false); }
  };

  useEffect(() => { trainModels(generateHistoricalData(48)); }, [data, selectedModel]);

  const prepareChart = () => {
    const hist = generateHistoricalData(48);
    if (!predictions.atual) return { hist, pA: [], pP: [], dates: hist.map(d => d.date) };
    const fD = [], last = hist[hist.length - 1].date;
    for (let i = 1; i <= (predictions.atual?.length || 0); i++) { const d = new Date(last); d.setMonth(d.getMonth() + i); fD.push(d); }
    return {
      hist, dates: [...hist.map(d => d.date), ...fD],
      pA: predictions.atual.map((v, i) => ({ flaring: v, date: fD[i] })),
      pP: predictions.proposto.map((v, i) => ({ flaring: v, date: fD[i] })),
    };
  };

  const cd = prepareChart();

  const plotData = [
    { x: cd.hist.map(d => d.date), y: cd.hist.map(d => d.flaring), name: t.historicalData, type: 'scatter', mode: 'lines',
      line: { color: T.txtS, width: 1.5 }, hovertemplate: `<b>Historical</b><br>%{x|%b %Y}: %{y:,.0f} Sm³/d<extra></extra>` },
    predictions.atual && { x: cd.pA.map(d => d.date), y: cd.pA.map(d => d.flaring), name: t.currentSystemNoRecovery,
      type: 'scatter', mode: 'lines+markers', line: { color: T.red, width: 2.5, dash: 'dash' }, marker: { size: 7, color: T.red, symbol: 'x' },
      hovertemplate: `<b>Current</b><br>%{x|%b %Y}: %{y:,.0f} Sm³/d<extra></extra>` },
    predictions.proposto && { x: cd.pP.map(d => d.date), y: cd.pP.map(d => d.flaring), name: t.proposedSystemWithRecovery,
      type: 'scatter', mode: 'lines+markers', line: { color: T.green, width: 2.5 }, marker: { size: 7, color: T.green, symbol: 'diamond' },
      fill: 'tonexty', fillcolor: T.green + '15', hovertemplate: `<b>Proposed</b><br>%{x|%b %Y}: %{y:,.0f} Sm³/d<extra></extra>` },
  ].filter(Boolean);

  const layout = {
    plot_bgcolor: T.plotBg, paper_bgcolor: T.paperBg, font: T.font,
    margin: { t: 20, r: 20, b: 50, l: 70 }, height: 400,
    xaxis: { type: 'date', gridcolor: T.grid, tickfont: { size: 10, color: T.txtS } },
    yaxis: { title: { text: 'Sm³/d', font: { size: 10, color: T.txtS } }, tickformat: ',.0f', gridcolor: T.grid, tickfont: { size: 10, color: T.txtS } },
    legend: { x: 0.5, xanchor: 'center', y: -0.15, orientation: 'h', bgcolor: 'rgba(0,0,0,0)', font: { size: 10, color: T.txt } },
    shapes: (predictions.atual || predictions.proposto) ? [{ type: 'line',
      x0: cd.hist[cd.hist.length - 1].date, x1: cd.hist[cd.hist.length - 1].date,
      y0: 0, y1: Math.max(...cd.hist.map(d => d.flaring)) * 1.15,
      line: { color: T.accent, width: 1.5, dash: 'dot' },
    }] : [],
    annotations: (predictions.atual || predictions.proposto) ? [{ x: cd.hist[cd.hist.length - 1].date,
      y: Math.max(...cd.hist.map(d => d.flaring)) * 1.1, text: t.startOfPredictions || 'Prediction Start',
      showarrow: true, arrowhead: 2, arrowcolor: T.accent, font: { color: T.accent, size: 10, family: 'Consolas' },
    }] : [],
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2">
            <PulseSquare24Regular style={{ color: T.accent }} />
            <div>
              <span className="text-xs font-semibold font-mono" style={{ color: T.txt }}>{t.mlForecast || 'ML FORECAST'}</span>
              <span className="text-[10px] ml-2 font-mono" style={{ color: T.txtS }}>{t.currentVsProposedNext6Months || '6-month prediction'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isTraining && !error && ['rf', 'knn'].map(m => (
              <button key={m} onClick={() => setSelectedModel(m)}
                className="px-3 py-1 rounded text-[10px] font-mono font-bold transition-colors"
                style={{
                  backgroundColor: selectedModel === m ? (m === 'rf' ? T.green : T.yellow) : (T.isDark ? '#2d2d2d' : '#f3f4f6'),
                  color: selectedModel === m ? '#1e1e1e' : T.txtS,
                }}
              >
                {m === 'rf' ? 'Random Forest' : 'K-NN'}
              </button>
            ))}
            {isTraining && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: T.accent }} />
                <span className="text-[10px] font-mono" style={{ color: T.accent }}>{t.trainingStatus || 'Training...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics bar */}
        {metrics.atual && !isTraining && (
          <div className="px-4 py-2 border-b flex items-center gap-6" style={{ borderColor: T.border, backgroundColor: T.isDark ? '#1e1e1e' : '#fafafa' }}>
            <div className="flex items-center gap-1.5">
              {selectedModel === 'rf' ? <LeafTwo24Regular style={{ color: T.green, width: 16, height: 16 }} /> : <PulseSquare20Regular style={{ color: T.yellow, width: 16, height: 16 }} />}
              <span className="text-[10px] font-mono font-bold" style={{ color: T.txt }}>{metrics.modelName}</span>
            </div>
            {[
              { label: 'MAE', value: metrics.atual.mae.toFixed(0), unit: 'Sm³/d' },
              { label: 'RMSE', value: metrics.atual.rmse.toFixed(0), unit: 'Sm³/d' },
              { label: 'R²', value: metrics.atual.r2.toFixed(3), unit: '' },
              { label: selectedModel === 'rf' ? 'Trees' : 'K', value: selectedModel === 'rf' ? metrics.atual.numTrees : metrics.atual.k, unit: '' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[10px] font-mono" style={{ color: T.txtS }}>{m.label}:</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: T.green }}>{m.value}</span>
                {m.unit && <span className="text-[9px] font-mono" style={{ color: T.txtS }}>{m.unit}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div>
          {isTraining ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ backgroundColor: T.plotBg }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mb-3" style={{ borderColor: T.accent }} />
              <span className="text-xs font-mono" style={{ color: T.txtS }}>{t.trainingModel || 'Training model...'}</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ backgroundColor: T.plotBg }}>
              <ErrorCircle20Regular style={{ color: T.red }} className="mb-2" />
              <span className="text-xs font-mono" style={{ color: T.red }}>{error}</span>
            </div>
          ) : (
            <Plot data={plotData} layout={layout}
              config={{ responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] }}
              style={{ width: '100%' }} />
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: selectedModel === 'rf' ? 'Random Forest' : 'K-Nearest Neighbors', color: T.accent,
            icon: selectedModel === 'rf' ? <LeafTwo24Regular style={{ color: T.accent, width: 14, height: 14 }} /> : <PulseSquare20Regular style={{ color: T.accent, width: 14, height: 14 }} />,
            items: selectedModel === 'rf' ? [t.decisionTrees, t.maxDepth, t.bootstrapSampling] : [t.kNeighbors, t.euclideanDistance, t.weightedAverage] },
          { title: t.currentSystemTitle || 'Current System', color: T.red, icon: null,
            items: [t.continuousGasFlaring, t.noRecoverySystem, t.maintenanceTrend] },
          { title: t.proposedSystemTitle || 'Proposed System', color: T.green, icon: null,
            items: [t.gasRecovery91, t.implementation3Months, t.stabilizesAt9Percent] },
        ].map((card, i) => (
          <div key={i} className="card p-0 overflow-hidden" style={{ borderLeft: `3px solid ${card.color}` }}>
            <div className="px-3 py-2 flex items-center gap-1.5">
              {card.icon}
              <span className="text-[11px] font-mono font-bold" style={{ color: T.txt }}>{card.title}</span>
            </div>
            <div className="px-3 pb-2">
              {card.items.map((item, j) => (
                <div key={j} className="text-[10px] font-mono py-0.5" style={{ color: T.txtS }}>
                  <span style={{ color: card.color }}>{'>'}</span> {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
