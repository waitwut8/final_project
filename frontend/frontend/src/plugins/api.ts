import axios from 'axios'
const api_url = 'http://localhost:8000'
const api = axios.create({ baseURL: api_url })


api.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(function (config) {


  return config;
}
  ,
  async function (error) {

    if (
      error.status === 401

    ) {
      console.error("oh no")

      let res = await api.post("/user/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
          }
        }
      )
      console.log(res)
      if (res.status === 200) {
        localStorage.setItem("access_token", res.data.access_token);
        return api.request(error.config);
      }
      else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        console.error("refresh token expired, maybe log in again?")
      }








    }

    return Promise.reject(error);
  }
)
export default api