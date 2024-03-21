import globalAxios from '../../axios/index';
// @ts-ignore
import store from 'store';

export async function getAttendance(query?: any, params?: any, options?: any) {
  const token = store.get('accessToken');

  return await globalAxios.get(`/attendance`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    params: { ...params, ...query },
    skipErrorHandler: true,
    ...(options || {}),
  });
}
