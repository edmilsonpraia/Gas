// VS Code Dark theme colors for Plotly charts
export const VS_COLORS = {
  accent: '#007acc',
  error: '#f44747',
  success: '#4ec9b0',
  warning: '#dcdcaa',
  info: '#569cd6',
  string: '#ce9178',
  keyword: '#c586c0',

  // Series palette for charts
  series: ['#007acc', '#4ec9b0', '#f44747', '#dcdcaa', '#569cd6', '#ce9178', '#c586c0', '#9cdcfe'],

  // Before/After comparison
  current: '#f44747',
  proposed: '#4ec9b0',

  // Component breakdown (4 shades)
  components: ['#007acc', '#569cd6', '#9cdcfe', '#b3d9ff'],

  // Pie/distribution
  distribution: ['#007acc', '#569cd6'],
};

export const getChartLayout = (isDark = false) => ({
  plot_bgcolor: isDark ? '#1e1e1e' : '#ffffff',
  paper_bgcolor: isDark ? '#252526' : '#ffffff',
  font: {
    family: 'Segoe UI, sans-serif',
    color: isDark ? '#d4d4d4' : '#1e1e1e',
  },
  xaxis: {
    gridcolor: isDark ? '#3c3c3c' : '#e5e5e5',
    zerolinecolor: isDark ? '#3c3c3c' : '#e5e5e5',
  },
  yaxis: {
    gridcolor: isDark ? '#3c3c3c' : '#e5e5e5',
    zerolinecolor: isDark ? '#3c3c3c' : '#e5e5e5',
  },
  legend: {
    bgcolor: isDark ? 'rgba(37,37,38,0.9)' : 'rgba(255,255,255,0.9)',
    bordercolor: isDark ? '#3c3c3c' : '#e5e5e5',
    font: { color: isDark ? '#d4d4d4' : '#1e1e1e' },
  },
});
