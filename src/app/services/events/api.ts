import globalAxios from "../../axios/index";
// @ts-ignore
import store from "store";

export async function getEvents(query?: any, params?: any, options?: any) {
  const token = store.get("accessToken");

  return await globalAxios.get(`/events`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    params: { ...params, ...query },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function addEvent(body: any, options: any) {
  const token = store.get("accessToken");

  return await globalAxios.post(`/events`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function getEventById(id: number) {
  const token = store.get("accessToken");

  return await globalAxios.get(`/events/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateEvent(body: any, options: any) {
  const token = store.get("accessToken");

  return await globalAxios.put(`/events/${body?.id}`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}

export async function deleteEvent(id: any, options: any) {
  const token = store.get("accessToken");

  return await globalAxios.delete(`/events/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    skipErrorHandler: true,
    ...(options || {}),
  });
}
