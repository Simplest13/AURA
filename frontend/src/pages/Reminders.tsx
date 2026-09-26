import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../api/reminders';
import type { Reminder } from '../types';

const Reminders: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: reminders, isLoading, error } = useQuery<Reminder[]>(['reminders'], getReminders);

  const createMut = useMutation(createReminder, {
    onSuccess: () => queryClient.invalidateQueries(['reminders']),
  });
  const updateMut = useMutation(({ id, updates }: { id: string; updates: Partial<Reminder> }) => updateReminder(id, updates), {
    onSuccess: () => queryClient.invalidateQueries(['reminders']),
  });
  const deleteMut = useMutation(deleteReminder, {
    onSuccess: () => queryClient.invalidateQueries(['reminders']),
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    createMut.mutate({ title: newTitle, dueTime: newDue || null, tag: newTag || 'General' } as any);
    setNewTitle('');
    setNewDue('');
    setNewTag('');
  };

  const toggleComplete = (rem: Reminder) => {
    updateMut.mutate({ id: rem.id, updates: { completed: !rem.completed } });
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id);
  };

  if (isLoading) return <p>Loading reminders...</p>;
  if (error) return <p>Error loading reminders.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Reminders</h2>
      <ul>
        {reminders?.map((rem) => (
          <li key={rem.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{rem.title}</strong> (due: {rem.dueTime || 'N/A'}) [{rem.tag}]
            <br />
            Completed: {rem.completed ? 'Yes' : 'No'}
            <button onClick={() => toggleComplete(rem)} style={{ marginLeft: '0.5rem' }}>
              Toggle
            </button>
            <button onClick={() => handleDelete(rem.id)} style={{ marginLeft: '0.5rem' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <h3>Add Reminder</h3>
      <div>
        <input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <input placeholder="Due (ISO)" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
        <input placeholder="Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
};

export default Reminders;
