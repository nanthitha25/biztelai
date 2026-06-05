'use client';
import { useEffect, useState, use } from 'react';
import { Check, AlertTriangle, Save } from 'lucide-react';

export default function ReviewPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [records, setRecords] = useState([]);
  const [document, setDocument] = useState(null);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    // Fetch docs to get the image URL
    fetch('/api/records')
      .then(res => res.json())
      .then(data => {
        const doc = data.find(d => d.id === id);
        setDocument(doc);
      });

    // Fetch records
    fetch(`/api/records?documentId=${id}`)
      .then(res => res.json())
      .then(data => setRecords(data));
  }, [id]);

  const handleChange = (recordId, field, value) => {
    setRecords(records.map(r => r.id === recordId ? { ...r, [field]: value } : r));
  };

  const handleSave = async (record) => {
    setSaving({ ...saving, [record.id]: true });
    try {
      const res = await fetch('/api/records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, updates: record })
      });
      const data = await res.json();
      if (data.success) {
        setRecords(records.map(r => r.id === record.id ? data.record : r));
      }
    } catch (e) {
      console.error(e);
    }
    setSaving({ ...saving, [record.id]: false });
  };

  if (!document) return <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 5rem)', overflow: 'hidden' }}>
      
      {/* Left Pane - Image Preview */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
          Original Document
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
          <img src={document.filename} alt="Document" style={{ maxWidth: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Right Pane - Data Grid */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
          Extracted Data Review
        </div>
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {['Seq', 'Date', 'Shift', 'Emp No', 'Opn Code', 'Machine', 'Work Order', 'Qty', 'Time', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(record => {
                const conf = JSON.parse(record.confidenceData || '{}');
                let errors = [];
                try {
                  if (typeof record.validationErrors === 'string') {
                    if (record.validationErrors.startsWith('[')) {
                      errors = JSON.parse(record.validationErrors);
                    } else if (record.validationErrors) {
                      errors = [record.validationErrors];
                    }
                  } else if (Array.isArray(record.validationErrors)) {
                    errors = record.validationErrors;
                  }
                } catch (e) {
                  errors = [String(record.validationErrors)];
                }
                const hasErrors = errors.length > 0;

                return (
                  <tr key={record.id} style={{ height: '64px', borderBottom: '1px solid var(--border-color)', backgroundColor: hasErrors ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.sequenceNo || ''} onChange={(e) => handleChange(record.id, 'sequenceNo', e.target.value)} style={inputStyle(conf.sequenceNo, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.date || ''} onChange={(e) => handleChange(record.id, 'date', e.target.value)} style={inputStyle(conf.date, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.shift || ''} onChange={(e) => handleChange(record.id, 'shift', e.target.value)} style={inputStyle(conf.shift, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.empNo || ''} onChange={(e) => handleChange(record.id, 'empNo', e.target.value)} style={inputStyle(conf.empNo, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.opnCode || ''} onChange={(e) => handleChange(record.id, 'opnCode', e.target.value)} style={inputStyle(conf.opnCode, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.machineNo || ''} onChange={(e) => handleChange(record.id, 'machineNo', e.target.value)} style={inputStyle(conf.machineNo, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.workOrderNo || ''} onChange={(e) => handleChange(record.id, 'workOrderNo', e.target.value)} style={inputStyle(conf.workOrderNo, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.qtyProd || ''} onChange={(e) => handleChange(record.id, 'qtyProd', e.target.value)} style={inputStyle(conf.qtyProd, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input value={record.timeTaken || ''} onChange={(e) => handleChange(record.id, 'timeTaken', e.target.value)} style={inputStyle(conf.timeTaken, hasErrors)} />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleSave(record)}
                          disabled={saving[record.id]}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: hasErrors ? 'var(--error-color)' : 'var(--success-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: saving[record.id] ? 0.5 : 1
                          }}
                        >
                          {hasErrors ? <AlertTriangle size={14} /> : <Check size={14} />}
                          Save
                        </button>
                        {hasErrors && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--error-color)', maxWidth: '150px', whiteSpace: 'normal' }}>
                            {errors.map((err, i) => <div key={i}>• {err}</div>)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle = (confidence, hasErrors) => {
  const isLowConf = confidence === 'low' || confidence === 'medium';
  return {
    width: '100%',
    minWidth: '60px',
    background: isLowConf ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
    border: isLowConf ? '1px solid var(--warning-color)' : '1px solid transparent',
    color: 'var(--text-primary)',
    padding: '0.25rem',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    borderBottomColor: isLowConf ? 'var(--warning-color)' : 'var(--border-color)',
    transition: 'all 0.2s',
  };
};
