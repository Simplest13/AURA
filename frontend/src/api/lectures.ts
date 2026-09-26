import api from '../api/axios';
import type { Lecture } from '../types';

export const getLectures = async () => {
  const response = await api.get('/api/lectures/lectures');
  return response.data as Lecture[];
};

export const createLecture = async (lecture: Omit<Lecture, 'id'>) => {
  const response = await api.post('/api/lectures/lectures', lecture);
  return response.data as Lecture;
};
