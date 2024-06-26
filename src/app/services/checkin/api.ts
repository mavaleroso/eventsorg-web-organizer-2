import globalAxios from "../../axios/index";
// @ts-ignore
import store from "store";

export async function postAttendance(query?: any, params?: any, options?: any) {
  const token = store.get("accessToken");

  return await globalAxios.post(
    `/admit`,
    { ...params, ...query },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: { ...params, ...query },
      skipErrorHandler: true,
      ...(options || {}),
    }
  );
}
