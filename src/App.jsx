import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { UploadCloud, LayoutDashboard, BarChart2, TrendingUp, PieChart as PieIcon, Activity, Zap, Download, Table as TableIcon, AlertTriangle } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

export default function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxisCol, setXAxisCol] = useState('');
  const [yAxisCol, setYAxisCol] = useState('');
  
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
    setXAxisCol(cols[0]);
    
    const numericCols = cols.filter(col => typeof newData[0][col] === 'number');
    if (numericCols.length > 0) {
      setYAxisCol(numericCols[0]);
    } else {
      setYAxisCol(cols[1] || cols[0]);
    }
  };

  const generateMockData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const regions = ['North', 'South', 'East', 'West'];
    
    const mockData = [];
    months.forEach((month, idx) => {
      regions.forEach(region => {
        mockData.push({
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

  const layout = [
    { i: 'a', x: 0, y: 0, w: 6, h: 11 },
    { i: 'b', x: 6, y: 0, w: 6, h: 11 },
    { i: 'c', x: 0, y: 11, w: 6, h: 11 },
    { i: 'd', x: 6, y: 11, w: 6, h: 11 },
    { i: 'e', x: 0, y: 22, w: 12, h: 12 },
  ];

  const processedData = useMemo(() => {
    if (!data.length || !xAxisCol || !yAxisCol) return [];
    
    const isYNumeric = typeof data[0][yAxisCol] === 'number';
    const aggregated = {};
    
    data.forEach(item => {
      const xVal = item[xAxisCol];
      const yVal = item[yAxisCol];
      
      if (xVal != null && yVal != null) {
        const xKey = String(xVal);
        if (!aggregated[xKey]) {
          aggregated[xKey] = { [xAxisCol]: xVal, [yAxisCol]: 0 };
        }
        
        if (isYNumeric) {
          aggregated[xKey][yAxisCol] += Number(yVal);
        } else {
          aggregated[xKey][yAxisCol] += 1;
        }
      }
    });
    
    return Object.values(aggregated).slice(0, 100);
  }, [data, xAxisCol, yAxisCol]);

  const pieData = useMemo(() => {
    return processedData.map(item => ({
      name: String(item[xAxisCol]),
      value: item[yAxisCol]
    })).slice(0, 10);
  }, [processedData, xAxisCol, yAxisCol]);

  const isYWarning = data.length > 0 && yAxisCol && typeof data[0][yAxisCol] !== 'number';

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>
          <LayoutDashboard className="inline-block mr-3 mb-1" size={32} />
          DataViz Pro
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {data.length > 0 && (
            <button className="upload-btn" onClick={downloadCSV} style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}>
              <Download size={20} />
              CSV Download
            </button>
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
              <span style={{ color: 'var(--text-secondary)' }}>X-Axis (Category):</span>
              <select className="select-input" value={xAxisCol} onChange={e => setXAxisCol(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Y-Axis (Value):</span>
              <select className="select-input" value={yAxisCol} onChange={e => setYAxisCol(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {isYWarning && (
              <div className="warning-box">
                <AlertTriangle size={16} />
                Selected Y-Axis is text. Values are being counted instead of summed!
              </div>
            )}
          </div>

          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={true}
            isResizable={true}
            margin={[20, 20]}
          >
            <div key="a" className="glass-panel">
              <div className="chart-title"><TrendingUp size={18} color="var(--chart-color-1)" /> Trend Analysis (Line)</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={xAxisCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey={yAxisCol} stroke="var(--chart-color-1)" strokeWidth={3} dot={{r:3, fill:"var(--bg-color)", strokeWidth:2}} activeDot={{r:6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div key="b" className="glass-panel">
              <div className="chart-title"><BarChart2 size={18} color="var(--chart-color-2)" /> Comparison (Bar)</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={xAxisCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey={yAxisCol} fill="var(--chart-color-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div key="c" className="glass-panel">
              <div className="chart-title"><PieIcon size={18} color="var(--chart-color-3)" /> Distribution (Pie)</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip />
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div key="d" className="glass-panel">
              <div className="chart-title"><Activity size={18} color="var(--chart-color-4)" /> Volume Analysis (Area)</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-color-4)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--chart-color-4)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={xAxisCol} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey={yAxisCol} stroke="var(--chart-color-4)" fillOpacity={1} fill="url(#colorY)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div key="e" className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="chart-title"><TableIcon size={18} color="#94a3b8" /> Raw Data View</div>
              <div className="chart-container" style={{ overflow: 'auto' }}>
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
