'use client';
import { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Layers, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error loading dashboard", err));
  }, []);

  if (!stats) return <div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Operational Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Uploads" value={stats.totalUploads} icon={<FileText size={24} color="var(--accent-blue)" />} />
        <StatCard title="Records Extracted" value={stats.totalRecords} icon={<Layers size={24} color="var(--accent-cyan)" />} />
        <StatCard title="Validation Failures" value={stats.recordsNeedingReview} icon={<AlertTriangle size={24} color="var(--warning-color)" />} isWarning={stats.recordsNeedingReview > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Shift Summaries
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Shift</th>
                <th style={{ paddingBottom: '0.75rem' }}>Records Count</th>
              </tr>
            </thead>
            <tbody>
              {stats.shiftSummary.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{s.shift || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem 0' }}>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> Machine Output
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ paddingBottom: '0.75rem' }}>Machine No</th>
                <th style={{ paddingBottom: '0.75rem' }}>Total Qty Prod</th>
              </tr>
            </thead>
            <tbody>
              {stats.machineSummary.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{m.machineNo || 'Unknown'}</td>
                  <td style={{ padding: '0.75rem 0' }}>{m.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isWarning }) {
  return (
    <div style={{ 
      background: isWarning ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)', 
      border: `1px solid ${isWarning ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
      padding: '1.5rem', 
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: isWarning ? 'var(--warning-color)' : 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}
