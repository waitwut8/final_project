const api_url = "http://127.0.0.1:8000";
localStorage.setItem('loadedBefore', window.location.href)
function setModal_Login() {
  let modal = `<div id="login_modal" class="modal fade">
 <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
                <div class="modal-dialog modal-confirm">
                    <div class="modal-content">
                        <div class="modal-header justify-content-center">
                            <div class="icon-box">
                                <i class="material-icons">&#xE5CD;</i>
                            </div>
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        </div>
                        <div class="modal-body text-center">
                            <h4>Ooops!</h4>\t
                            <p>Seems like your session has expired. Try logging in again.</p>
                            <button class="btn btn-success" data-dismiss="modal" id = "login-button">Try Again</button>
                        </div>
                    </div>
                </div>
            </div>`

  let body = document.getElementsByTagName('body')[0]
  if (body) {
    body.innerHTML += modal
  }
}

function callModal(id){
  let modal = new bootstrap.Modal(document.getElementById(id), {})
  modal.show()
  document.getElementById('login-button').addEventListener('click', function(){
    window.location.href = "login.html"
  })

}
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
  console.log(element, html)
  element.innerHTML = HTML;
}
function getDoc(id) {
  return document.getElementById(id);
}


function logout() {
  localStorage.clear();
  alert("Logged out");
  window.location.href = "index.html"
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
function hideLogin(){
  if(localStorage.getItem('access_token') && localStorage.getItem('refresh_token')){
      $(".fa-door-open").hide()
      $('.fa-door-open').parent().parent().parent().width('0px').css('padding', '0px')

  }
}
if (!window.location.href.endsWith("login.html")){
  hideLogin()
}
async function addToCart(id) {
  const response = await api.post("/cart", {
    quantity: 1,
    product_name: id,
  })
  if (response.status === 200) {
    alert("Product added to cart");
  }



}

let load_Username = async function () {
  let username = localStorage.getItem("user_name");
  let topelement = $(".username-title")[0]

  if (username){

    username = username.slice(0, -1)
    console.log(username)
    topelement.innerHTML = capitalize(username);
    titleelement.innerHTML = "Hello, " + capitalize(username);
  }
  else{
    setText(topelement, "Welcome!")

  }
}



