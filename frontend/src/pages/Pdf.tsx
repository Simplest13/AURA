import React, { useState } from 'react';
import api from '../api/axios';

const Pdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      // Simple upload as base64 placeholder
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        // Upload document
        const uploadRes = await api.post('/api/pdf/documents', {
          name: file.name,
          content: base64,
        });
        const docId = uploadRes.data.id;
        // Summarise
        const sumRes = await api.post('/api/pdf/summarize', { documentId: docId });
        setSummary(sumRes.data.summary || 'No summary returned');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>PDF Upload & Summarise</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload & Summarise'}
        </button>
      </form>
      {summary && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default Pdf;
