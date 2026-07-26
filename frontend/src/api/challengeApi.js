import axiosInstance from './axiosInstance';

/**
 * Challenge API
 *
 * GET  /api/challenges        → ChallengeResponse[] (all, with user status)
 * GET  /api/challenges/my     → ChallengeResponse[] (joined only)
 * POST /api/challenges/{id}/join → ChallengeResponse
 */

export async function getChallenges() {
  const res = await axiosInstance.get('/challenges');
  return res.data;
}

export async function getMyChallenges() {
  const res = await axiosInstance.get('/challenges/my');
  return res.data;
}

export async function joinChallenge(id) {
  const res = await axiosInstance.post(`/challenges/${id}/join`);
  return res.data;
}
