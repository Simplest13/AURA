import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLectures, createLecture } from '../api/lectures';
import type { Lecture } from '../types';

const Lectures: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: lectures, isLoading, error } = useQuery<Lecture[]>(['lectures'], getLectures);

  const createMut = useMutation(createLecture, {
    onSuccess: () => queryClient.invalidateQueries(['lectures']),
  });

  const [title, setTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const handleAdd = () => {
    if (title && audioUrl) {
      createMut.mutate({ title, audioUrl } as any);
      setTitle('');
      setAudioUrl('');
    }
  };

  if (isLoading) return <p>Loading lectures...</p>;
  if (error) return <p>Error loading lectures.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Lectures</h2>
      <ul>
        {lectures?.map((lec) => (
          <li key={lec.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{lec.title}</strong> – <a href={lec.audioUrl} target="_blank" rel="noreferrer">Audio</a>
          </li>
        ))}
      </ul>
      <h3>Add Lecture</h3>
      <div>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Audio URL" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
};

export default Lectures;
