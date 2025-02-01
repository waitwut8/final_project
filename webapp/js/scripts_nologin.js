const api_url = "http://127.0.0.1:8000";



// Add a response interceptor
const api = axios.create({
    baseURL: api_url,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {

        if (
            error.response.status === 401

        ) {
            try {
                let res = await axios.post(
                    `${api_url}/refresh`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
                        },
                    }
                )
                localStorage.setItem("refresh_token", res.data["refresh_token"]);
                localStorage.setItem("access_token", res.data["access_token"]);
                console.log(res.response.status)
                location.reload();
            }
            catch (e) {
                callModal('login_modal')
            }



        } else if (error.response.status === 401) {
            console.log(error.response);
            alert("Unauthorized access, please login");
            window.location.href = "login.html";
        }

        return Promise.reject(error);
    }
);

api.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
function capitalize(s)
{
    return String(s[0]).toUpperCase() + String(s).slice(1);
}
function getToken() {
    return localStorage.getItem("access_token");
}





let setProduct = async function (id) {
    let res = await api.get(`/product/${id}`);
    let product = JSON.stringify(res.data);
    console.log(product);
    localStorage.setItem("product", product);
    window.location.href = "product.html";
};

function setText(element, text) {
    element.textContent = text;
}
function setTextByList(elementList, textList) {
    for (let index = 0; index < elementList.length; index++) {
        const element = elementList[index];
        const text = textList[index];
        setText(element, text);
    }
}
function setHTML(element, HTML) {
    element.innerHTML = HTML;
}
function getDoc(id) {
    return document.getElementById(id);
}


function logout() {
    localStorage.clear();
    alert("Logged out");
}

// async function loadPost(postId) {
//   let response = fetch(`/posts/${postId}`);
//   if (response.status !== 200) {
//     console.log("Error fetching post data");
//     alert("Error fetching post data");
//     return;
//   }
//   let data = await response.data;
//   let documentPostTitle = document.getElementsByClassName("card-title")[0],
//     documentPostBody = document.getElementsByClassName("cart-text"),
//     postTitle = data["title"],
//     postBody = data["body"];
//   if (postTitle && postBody) {
//     documentPostTitle.textContent = postTitle;
//     documentPostBody.textContent = postBody;
//   } else {
//     alert("Content not loaded, redirecting to login page");
//     window.location.href = "login.html";
//   }
// }





