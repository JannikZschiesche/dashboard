import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  UploadCloud, LayoutDashboard, BarChart2, TrendingUp, PieChart as PieIcon, 
  Activity, Zap, Download, Table as TableIcon, AlertTriangle, Settings, X, PlusCircle 
} from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6', '#0ea5e9'];

// The individual chart widget component
function ChartWidget({ widget, data, columns, globalX, globalY, onRemove, onUpdate }) {
  const [showSettings, setShowSettings] = useState(false);
  
  const xCol = widget.xAxis || globalX;
  const yCol = widget.yAxis || globalY;

  const processedData = useMemo(() => {
    if (!data.length || !xCol || !yCol) return [];
    
    const isYNumeric = typeof data[0][yCol] === 'number';
    const aggregated = {};
    
    data.forEach(item => {
      const xVal = item[xCol];
      const yVal = item[yCol];
      
      if (xVal != null && yVal != null) {
        const xKey = String(xVal);
        if (!aggregated[xKey]) {
          aggregated[xKey] = { [xCol]: xVal, [yCol]: 0 };
        }
        
        if (isYNumeric) {
          aggregated[xKey][yCol] += Number(yVal);
        } else {
          aggregated[xKey][yCol] += 1;
        }
      }
    });
    
    return Object.values(aggregated);
  }, [data, xCol, yCol]);

  const pieData = useMemo(() => {
    return processedData.map(item => ({
      name: String(item[xCol]),
      value: item[yCol]
    }));
  }, [processedData, xCol, yCol]);

  const renderChart = () => {
    if (processedData.length === 0) return null;
    
    switch (widget.type) {
      case 'line':
        return (
          <LineChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <Tooltip />
            <Line type="monotone" dataKey={yCol} stroke="var(--chart-color-1)" strokeWidth={3} dot={{r:3, fill:"var(--bg-color)", strokeWidth:2}} activeDot={{r:6}} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Bar dataKey={yCol} fill="var(--chart-color-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip />
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <YAxis dataKey={yCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
            <Tooltip cursor={{strokeDasharray: '3 3'}} />
            <Scatter data={processedData} fill="var(--chart-color-4)" />
          </ScatterChart>
        );
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (widget.type) {
      case 'line': return <TrendingUp size={18} color="var(--chart-color-1)" />;
      case 'bar': return <BarChart2 size={18} color="var(--chart-color-2)" />;
      case 'pie': return <PieIcon size={18} color="var(--chart-color-3)" />;
      case 'scatter': return <Activity size={18} color="var(--chart-color-4)" />;
      default: return null;
    }
  };

  const getTitle = () => {
    switch (widget.type) {
      case 'line': return 'Trend Analysis (Line)';
      case 'bar': return 'Comparison (Bar)';
      case 'pie': return 'Distribution (Pie)';
      case 'scatter': return 'Correlation (Scatter)';
      default: return 'Widget';
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chart-title">
        {getIcon()}
        {getTitle()}
        <div className="widget-controls">
          <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} title="Configure">
            <Settings size={16} />
          </button>
          <button className="icon-btn" onClick={() => onRemove(widget.id)} title="Remove">
            <X size={16} />
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="widget-settings-panel">
          <div className="widget-settings-row">
            <label>Type:</label>
            <select className="select-input" value={widget.type} onChange={(e) => onUpdate(widget.id, { type: e.target.value })}>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Chart</option>
            </select>
          </div>
          <div className="widget-settings-row">
            <label>X-Axis:</label>
            <select className="select-input" value={widget.xAxis || ''} onChange={(e) => onUpdate(widget.id, { xAxis: e.target.value || null })}>
              <option value="">Global Setting</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="widget-settings-row">
            <label>Y-Axis:</label>
            <select className="select-input" value={widget.yAxis || ''} onChange={(e) => onUpdate(widget.id, { yAxis: e.target.value || null })}>
              <option value="">Global Setting</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="chart-container" style={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [globalXAxis, setGlobalXAxis] = useState('');
  const [globalYAxis, setGlobalYAxis] = useState('');
  
  const [widgets, setWidgets] = useState([
    { id: 'w1', type: 'line', xAxis: null, yAxis: null },
    { id: 'w2', type: 'pie', xAxis: null, yAxis: null },
    { id: 'w3', type: 'bar', xAxis: null, yAxis: null },
    { id: 'w4', type: 'scatter', xAxis: null, yAxis: null }
  ]);
  
  const [layout, setLayout] = useState([
    { i: 'w1', x: 0, y: 0, w: 6, h: 9 },
    { i: 'w2', x: 6, y: 0, w: 6, h: 9 },
    { i: 'w3', x: 0, y: 9, w: 6, h: 9 },
    { i: 'w4', x: 6, y: 9, w: 6, h: 9 },
    { i: 'data-table', x: 0, y: 18, w: 12, h: 10 },
  ]);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setChartData(results.data);
          }
        }
      });
    }
  };

  const setChartData = (newData) => {
    setData(newData);
    const cols = Object.keys(newData[0]);
    setColumns(cols);
    setGlobalXAxis(cols[0]);
    
    const numericCols = cols.filter(col => typeof newData[0][col] === 'number');
    if (numericCols.length > 0) {
      setGlobalYAxis(numericCols[0]);
    } else {
      setGlobalYAxis(cols[1] || cols[0]);
    }
  };

  const generateMockData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const regions = ['North', 'South', 'East', 'West'];
    
    const mockData = [];
    let entryIndex = 1;
    months.forEach((month, idx) => {
      regions.forEach(region => {
        mockData.push({
          EntryIndex: entryIndex++,
          Month: month,
          MonthIndex: idx + 1,
          Region: region,
          Revenue: Math.floor(Math.random() * 50000) + 10000,
          ActiveUsers: Math.floor(Math.random() * 5000) + 500,
          Satisfaction: parseFloat((Math.random() * 2 + 3).toFixed(1))
        });
      });
    });
    
    setChartData(mockData);
  };

  const downloadCSV = () => {
    if (data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dashboard_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addWidget = () => {
    const newId = 'w' + Date.now();
    setWidgets([...widgets, { id: newId, type: 'line', xAxis: null, yAxis: null }]);
    // Find highest Y to append to bottom
    let maxY = 0;
    layout.forEach(l => {
      if (l.y + l.h > maxY) maxY = l.y + l.h;
    });
    setLayout([...layout, { i: newId, x: 0, y: maxY, w: 6, h: 9 }]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setLayout(layout.filter(l => l.i !== id));
  };

  const updateWidgetConfig = (id, newConfig) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...newConfig } : w));
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const isGlobalYWarning = data.length > 0 && globalYAxis && typeof data[0][globalYAxis] !== 'number';

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>
          <LayoutDashboard className="inline-block mr-3 mb-1" size={32} />
          DataViz Pro
        </h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {data.length > 0 && (
            <>
              <button className="upload-btn" onClick={addWidget} style={{ background: '#10b981' }}>
                <PlusCircle size={20} />
                Add Chart
              </button>
              <button className="upload-btn" onClick={downloadCSV} style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}>
                <Download size={20} />
                CSV Download
              </button>
            </>
          )}
          <button className="upload-btn" onClick={generateMockData} style={{ background: 'var(--chart-color-2)' }}>
            <Zap size={20} />
            Auto-Generate Data
          </button>
          <label className="upload-btn">
            <UploadCloud size={20} />
            Import CSV
            <input type="file" accept=".csv" className="file-input" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {data.length > 0 ? (
        <>
          <div className="controls-bar glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Global X-Axis:</span>
              <select className="select-input" value={globalXAxis} onChange={e => setGlobalXAxis(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Global Y-Axis:</span>
              <select className="select-input" value={globalYAxis} onChange={e => setGlobalYAxis(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {isGlobalYWarning && (
              <div className="warning-box">
                <AlertTriangle size={16} />
                Global Y-Axis is text. Values are counted instead of summed.
              </div>
            )}
          </div>

          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
            onLayoutChange={(currentLayout) => onLayoutChange(currentLayout)}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={true}
            isResizable={true}
            margin={[20, 20]}
          >
            {widgets.map(w => (
              <div key={w.id}>
                <ChartWidget 
                  widget={w} 
                  data={data} 
                  columns={columns} 
                  globalX={globalXAxis} 
                  globalY={globalYAxis} 
                  onRemove={removeWidget}
                  onUpdate={updateWidgetConfig}
                />
              </div>
            ))}

            <div key="data-table" className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="chart-title"><TableIcon size={18} color="#94a3b8" /> Raw Data View</div>
              <div className="chart-container" style={{ overflow: 'auto', flexGrow: 1 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {columns.map(c => <th key={c}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 100).map((row, i) => (
                      <tr key={i}>
                        {columns.map(c => <td key={c}>{row[c]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ResponsiveGridLayout>
        </>
      ) : (
        <div className="glass-panel empty-state">
          <UploadCloud size={64} />
          <h2>No Data Uploaded</h2>
          <p>Please import a CSV file or generate mock data to visualize.</p>
        </div>
      )}
    </div>
  );
}
