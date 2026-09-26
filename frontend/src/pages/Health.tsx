import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const Health: React.FC = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        setStatus(res.data.status);
        setVersion(res.data.version);
      })
      .catch(() => setStatus('Error'));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Health Check</h2>
      <p>Status: {status}</p>
      <p>Version: {version}</p>
    </div>
  );
};

export default Health;
