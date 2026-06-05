'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export default function DocumentsQueue() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => setDocuments(data));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Review Queue</h2>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        {documents.map((doc) => (
          <Link key={doc.id} href={`/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <FileText size={24} color="var(--accent-blue)" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{doc.filename}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  backgroundColor: doc.status === 'processed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)',
                  color: doc.status === 'processed' ? 'var(--success-color)' : 'var(--text-secondary)'
                }}>
                  {doc.status}
                </span>
                <ArrowRight color="var(--text-secondary)" />
              </div>
            </div>
          </Link>
        ))}
        {documents.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>No documents in queue.</div>
        )}
      </div>
    </div>
  );
}
