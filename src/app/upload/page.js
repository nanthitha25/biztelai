'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        router.push(`/documents/${data.documentId}`);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Upload Operational Document</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Digitize your handwritten logs instantly using Vision AI.</p>

      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--accent-blue)',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '2rem'
        }}
      >
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {!preview ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <UploadCloud size={48} color="var(--accent-blue)" />
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>Click or drag file to upload</p>
              <p style={{ color: 'var(--text-secondary)' }}>Supports JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <img src={preview} alt="Preview" style={{ maxHeight: '300px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{file.name}</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          width: '100%',
          padding: '1rem',
          background: !file || uploading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          color: !file || uploading ? 'var(--text-secondary)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '1.125rem',
          fontWeight: 600,
          cursor: !file || uploading ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'opacity 0.2s',
          opacity: uploading ? 0.8 : 1
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            Extracting Data with AI...
          </>
        ) : (
          <>
            <CheckCircle size={24} />
            Process Document
          </>
        )}
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
