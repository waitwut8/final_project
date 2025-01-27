import axios from 'axios'
const api_url = 'http://localhost:8000'
const api = axios.create({baseURL: api_url})

// api.interceptors.request.use((config) => {
//     alert('request')
//     return config
// })

// api.interceptors.response.use(
//     function (response) {
//       return response;
//     },
//     async function (error) {
  
//       if (
//         error.response.status === 401 
  
//       ) {
//         try {
//           let res = await axios.post(
//               `${api_url}/refresh`,
//               {},
//               {
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
//                 },
//               }
//           )
//           localStorage.setItem("refresh_token", res.data["refresh_token"]);
//           localStorage.setItem("access_token", res.data["access_token"]);
//           console.log(res.status)
//           location.reload();
//         }
//         catch (e) {
//           console.error(e)
//         }
  
  
        
//       } else if (error.response.status === 401) {
//         console.log(error.response);
//         alert("Unauthorized access, please login");
//         window.location.href = "login.html";
//       }
  
//       return Promise.reject(error);
//     }
//   );


api.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
export default api