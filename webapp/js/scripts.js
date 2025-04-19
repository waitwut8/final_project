const api_url = "http://127.0.0.1:8000"
localStorage.setItem('loadedBefore', window.location.href);
$("#search-bar-button").on("click", function (e) {
    e.preventDefault();
    redirect_to_search();
}
);
function showSpinner() {
    document.getElementById("globalSpinner").style.display = "flex";
}
function hideSpinner() {
    document.getElementById("globalSpinner").style.display = "none";
}
function setModalLogin() {
    const modalTemplate = `
        <div id="login-modal" class="modal fade">
            <link rel="stylesheet" href="https:
            <link rel="stylesheet" href="https:
            <div class="modal-dialog modal-confirm">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <div class="icon-box">
                            <i class="material-icons">&#xE5CD;</i>
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    </div>
                    <div class="modal-body text-center">
                        <h4>Oops!</h4>
                        <p>Your session has expired. Please log in again.</p>
                        <button class="btn btn-success" data-dismiss="modal" id="login-button">Try Again</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalTemplate);
}
customElements.define('navigation-bar', class extends HTMLElement {
    constructor() {
        super();
        const template = $("#navigation-bar")[0].content;
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.cloneNode(true));
    }
});
function callModal(id) {
    const modal = new bootstrap.Modal(document.getElementById(id), {});
    modal.show();
    document.getElementById('login-button').addEventListener('click', function () {
        window.location.href = "login.html";
    });
}
const api = axios.create({
    baseURL: api_url,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});
api.interceptors.response.use(function (response) {
    return response;
}, async function (error) {
    console.log(error);
    if (error.response.status === 401) {
        try {
            const res = await axios.post(`${api_url}/user/refresh`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
                },
            });
            localStorage.setItem("refresh_token", res.data["refresh_token"]);
            localStorage.setItem("access_token", res.data["access_token"]);
            console.log(res.response.status);
            location.reload();
        } catch (e) {
            callModal('login_modal');
        }
    } else if (error.response.status === 401) {
        console.log(error.response);
        alert("Unauthorized access, please login");
        window.location.href = "login.html";
    }
    return Promise.reject(error);
});
api.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
fetch('header.html')
    .then(res => res.text())
    .then((res) => {
        $("#header").html(res);
    }).then(() => {
        loadUsername();
    });
fetch('admin_header.html')
    .then(res => res.text())
    .then((res) => {
        $("#admin-header").html(res);
    }).then(() => {
        loadUsername();
    });
function capitalize(s) {
    return String(s[0]).toUpperCase() + String(s).slice(1);
}
function getToken() {
    return localStorage.getItem("access_token");
}
let setProduct = async function (id) {
    const res = await api.get(`/product/${id}`);
    const product = JSON.stringify(res.data);
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
function setHTML(element, html) {
    console.log(element, html);
    element.innerHTML = html;
}
function getDoc(id) {
    return document.getElementById(id);
}
function logout() {
    localStorage.clear();
    alert("Logged out");
    window.location.href = "index.html";
}
function hideLogin() {
    if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
        $(".fa-door-open").hide();
        $('.fa-door-open').parent().parent().parent().width('0px').css('padding', '0px');
    }
}
if (!window.location.href.endsWith("login.html")) {
    hideLogin();
}
async function addToCart(id) {
    let response;
    try {
        response = await api.post(`/cart/add/${id}`, { 'product_id': id });
        $(`#p_${id}`).removeClass("hidden").addClass("pop-in");
        setTimeout(() => {
            $(`#p_${id}`).removeClass("pop-in").addClass("fade-out");
        }, 2000);
        $(`#p_${id}`).removeClass("fade-out").addClass("hidden");
    } catch (e) {
        console.log(e.response.status);
        window.location.href = "login.html";
    }
}
async function loadUsername() {
    let username = localStorage.getItem("user_name");
    const titleElement = $("#username");
    const topElement = $(".username-title");
    if (username) {
        console.log(username);
        console.log(topElement);
        topElement.text(username);
        titleElement.innerHTML = "Hello, " + capitalize(username);
    } else {
        titleElement.text("Welcome!");
        topElement.text("Welcome!");
    }
}
async function loadCartCount() {
    let response = await api.get("/cart/count");
    let count = response.data.item_count
    $("#cart-count").text(count);
}
async function isLoggedIn() {
    let response = await api.post("/user/is_token_active");
    return response.data.active;
}
$(document).ready(async function () {
    try {
        if (await isLoggedIn()) {
            $("#order-logged-in").show();
            $('#order-not-logged-in').hide();
        } else {
            $("#order-logged-in").hide();
            $('#order-not-logged-in').show();
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        $("#order-logged-in").hide();
        $('#order-not-logged-in').show();
    }
}
)



function redirect_to_search() {
    const searchQuery = document.querySelector("#search-bar").value;
    if (searchQuery) {
        window.location.href = `search.html?keyword=${searchQuery}`;
    } else {
        triggerSearchEmptyModel();
    }
}

function triggerSearchEmptyModel() {
    console.log("welp this is awkward");
}
