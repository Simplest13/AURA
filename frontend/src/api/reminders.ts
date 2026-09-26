import api from '../api/axios';
import type { Reminder } from '../types';

export const getReminders = async (userId?: string) => {
  // userId is not needed; JWT identifies user
  const response = await api.get('/api/reminders/reminders');
  return response.data as Reminder[];
};

export const createReminder = async (reminder: Omit<Reminder, 'id' | 'userId' | 'completed'>) => {
  const response = await api.post('/api/reminders/reminders', reminder);
  return response.data as Reminder;
};

export const updateReminder = async (id: string, updates: Partial<Reminder>) => {
  const response = await api.put(`/api/reminders/reminders/${id}`, updates);
  return response.data as Reminder;
};

export const deleteReminder = async (id: string) => {
  await api.delete(`/api/reminders/reminders/${id}`);
};
