'use client';
import { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Layers, Activity, X } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [showUploadsModal, setShowUploadsModal] = useState(false);
  const [showFailuresModal, setShowFailuresModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);

  const downloadCSV = () => {
    if (!stats || !stats.allRecords) return;
    const headers = ['ID', 'Date', 'Shift', 'Emp No', 'Opn Code', 'Machine No', 'Work Order', 'Qty', 'Time', 'Status', 'Filename'];
    const csvRows = [headers.join(',')];
    stats.allRecords.forEach(r => {
      const row = [r.id, r.date, r.shift, r.empNo, r.opnCode, r.machineNo, r.workOrderNo, r.qtyProd, r.timeTaken, r.status, r.filename];
      csvRows.push(row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_records_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error loading dashboard", err));
  }, []);

  if (!stats) return <div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Operational Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Uploads" value={stats.totalUploads} icon={<FileText size={24} color="var(--accent-blue)" />} onClick={() => setShowUploadsModal(true)} clickable />
        <StatCard title="Records Extracted" value={stats.totalRecords} icon={<Layers size={24} color="var(--accent-cyan)" />} onClick={() => setShowRecordsModal(true)} clickable />
        <StatCard title="Validation Failures" value={stats.recordsNeedingReview} icon={<AlertTriangle size={24} color="var(--warning-color)" />} isWarning={stats.recordsNeedingReview > 0} onClick={() => setShowFailuresModal(true)} clickable />
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

      <div style={{ marginTop: '3rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Past Scans
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ paddingBottom: '0.75rem', paddingRight: '1rem' }}>Document ID</th>
                <th style={{ paddingBottom: '0.75rem', paddingRight: '1rem' }}>Filename</th>
                <th style={{ paddingBottom: '0.75rem', paddingRight: '1rem' }}>Uploaded At</th>
                <th style={{ paddingBottom: '0.75rem', paddingRight: '1rem' }}>Status</th>
                <th style={{ paddingBottom: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.documents && stats.documents.map((doc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{doc.id}</td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>
                    <a href={doc.filename} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>View Image</a>
                  </td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>{new Date(doc.uploadedAt + 'Z').toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem',
                      background: doc.status === 'processed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: doc.status === 'processed' ? 'var(--success-color)' : 'var(--warning-color)'
                    }}>
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0' }}>
                    <a href={`/documents/${doc.id}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>Review Data</a>
                  </td>
                </tr>
              ))}
              {(!stats.documents || stats.documents.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No past scans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadsModal && (
        <Modal title="Total Uploads" onClose={() => setShowUploadsModal(false)}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem' }}>ID</th>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem' }}>Filename</th>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem' }}>Original Image URL</th>
                <th style={{ paddingBottom: '0.5rem', paddingRight: '1rem' }}>Uploaded At</th>
                <th style={{ paddingBottom: '0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.documents && stats.documents.map((doc, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{doc.id}</td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>{doc.filename.split('/').pop()}</td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>
                    <a href={doc.filename} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                      {doc.filename}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem 0', paddingRight: '1rem' }}>{new Date(doc.uploadedAt + 'Z').toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0' }}>{doc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {showFailuresModal && (
        <Modal title="Validation Failures" onClose={() => setShowFailuresModal(false)}>
          {(!stats.validationErrorsList || stats.validationErrorsList.length === 0) ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No validation failures to review.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.values(
                stats.validationErrorsList.reduce((acc, err) => {
                  if (!acc[err.documentId]) {
                    acc[err.documentId] = {
                      documentId: err.documentId,
                      filename: err.filename,
                      errors: []
                    };
                  }
                  acc[err.documentId].errors.push(err);
                  return acc;
                }, {})
              ).map((docGroup, i) => (
                <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Document: {docGroup.filename.split('/').pop()}
                    </span>
                    <a href={`/documents/${docGroup.documentId}`} style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500
                    }}>
                      Review Document
                    </a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {docGroup.errors.map((err, idx) => {
                      let parsedErrors = [];
                      try { parsedErrors = JSON.parse(err.validationErrors); } catch(e) {}
                      return (
                        <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Row #{err.sequenceNo}</span>
                          <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.2rem', color: 'var(--warning-color)', fontSize: '0.85rem' }}>
                            {parsedErrors.map((e, errIdx) => <li key={errIdx}>{e}</li>)}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showRecordsModal && (
        <Modal title="Records Extracted" onClose={() => setShowRecordsModal(false)} maxWidth="1100px">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={downloadCSV} style={{
              background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500
            }}>
              Download CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Date</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Shift</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Emp No</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Opn Code</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Machine</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Work Order</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Qty</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Status</th>
                  <th style={{ paddingBottom: '0.5rem', paddingRight: '0.5rem' }}>Source Document</th>
                </tr>
              </thead>
              <tbody>
                {stats.allRecords && stats.allRecords.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem' }}>{r.shift}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.empNo}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>{r.opnCode}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>{r.machineNo}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>{r.workOrderNo}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem' }}>{r.qtyProd}</td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>
                      <span style={{ color: r.status === 'approved' ? 'var(--success-color)' : 'var(--warning-color)' }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>
                      <a href={r.filename} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                        {r.filename.split('/').pop()}
                      </a>
                    </td>
                  </tr>
                ))}
                {(!stats.allRecords || stats.allRecords.length === 0) && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, maxWidth = '700px', children }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: '#15171e', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: maxWidth, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isWarning, onClick, clickable }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
      background: isWarning ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)', 
      border: `1px solid ${isWarning ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
      padding: '1.5rem', 
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
      cursor: clickable ? 'pointer' : 'default'
    }}
    onMouseEnter={(e) => { 
      e.currentTarget.style.transform = 'translateY(-2px)'; 
      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
      if (clickable) e.currentTarget.style.background = isWarning ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)';
    }}
    onMouseLeave={(e) => { 
      e.currentTarget.style.transform = 'translateY(0)'; 
      e.currentTarget.style.boxShadow = 'none'; 
      e.currentTarget.style.background = isWarning ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)';
    }}
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
