import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const courseService = {
  getAllCourses: () => api.get('/courses'),
  getCourseDetails: (courseId) => api.get(`/courses/${courseId}`),
  createCourse: (name) => api.post('/courses', { name }),
  addHoles: (courseId, holes) => api.post(`/courses/${courseId}/holes`, { holes }),
};

export const roundService = {
  getAllRounds: () => api.get('/rounds'),
  getRoundDetails: (roundId) => api.get(`/rounds/${roundId}`),
  createRound: (courseId, playDate) => api.post('/rounds', { courseId, playDate }),
  updateRound: (roundId, scores) => api.put(`/rounds/${roundId}`, { scores }),
  approveRound: (roundId) => api.post(`/rounds/${roundId}/approve`),
  deleteRound: (roundId) => api.delete(`/rounds/${roundId}`),
};

export const ocrService = {
  extractScoreCard: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getOCRResult: (resultId) => api.get(`/ocr/result/${resultId}`),
  confirmOCRData: (resultId, courseName, playDate, scores) =>
    api.post('/ocr/confirm', { resultId, courseName, playDate, scores }),
};

export const statsService = {
  getOverallStats: () => api.get('/stats/overall'),
  getCourseStats: (courseId) => api.get(`/stats/course/${courseId}`),
  getHoleStats: (holeId) => api.get(`/stats/hole/${holeId}`),
};

export const holeService = {
  getHoleDetails: (holeId) => api.get(`/holes/${holeId}`),
  getHoleStats: (holeId) => api.get(`/holes/${holeId}/stats`),
};
