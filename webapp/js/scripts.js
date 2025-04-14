// Base API URL for making requests. Because we always need to make a local request, right?
const api_url = "http://127.0.0.1:8000";

// Save the current URL in localStorage. Because why not store everything in there?
localStorage.setItem('loadedBefore', window.location.href);
function showSpinner() {
    document.getElementById("globalSpinner").style.display = "flex";
}

function hideSpinner() {
    document.getElementById("globalSpinner").style.display = "none";
}


// Modal for login - The classic "Oops, you're logged out" message.
function setModal_Login() {
    // Define the modal HTML template that shows when the user needs to login again.
    const modal = `
        <div id="login_modal" class="modal fade">
            <!-- External style sheets because we totally trust external resources -->
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
            <div class="modal-dialog modal-confirm">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <div class="icon-box">
                            <i class="material-icons">&#xE5CD;</i> <!-- Icon to make you feel something -->
                        </div>
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <!-- Close button for the modal -->
                    </div>
                    <div class="modal-body text-center">
                        <h4>Ooops!</h4>
                        <p>Seems like your session has expired. Try logging in again.</p>
                        <button class="btn btn-success" data-dismiss="modal" id="login-button">Try Again</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add the modal to the body of the page because who doesn't like dynamically injecting HTML?
    const body = document.getElementsByTagName('body')[0];
    if (body) {
        body.innerHTML += modal;
    }
}

// Custom navigation bar element, because we're fancy and have our own web component now.
customElements.define('navigation-bar', class extends HTMLElement {
    constructor() {
        super();
        const template = $("#navigation-bar")[0].content; // The template in the document
        const shadow = this.attachShadow({mode: 'open'}); // Shadow DOM to keep things neat
        shadow.appendChild(template.cloneNode(true)); // Append the template to the shadow DOM
    }
});

// Show the login modal and redirect to login page when clicked.
function callModal(id) {
    const modal = new bootstrap.Modal(document.getElementById(id), {});
    modal.show(); // Show that beauty

    // When the "Try Again" button is clicked, force them to log in again.
    document.getElementById('login-button').addEventListener('click', function () {
        window.location.href = "login.html"; // Redirect to login page.
    });
}

// Axios API setup, because sending API requests should be as easy as pie.
const api = axios.create({
    baseURL: api_url,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Intercept API responses to check for expired session or refresh tokens.
api.interceptors.response.use(function (response) {
    return response; // All good, return the response, nice.
}, async function (error) {
    console.log(error); // Oops, error happened, let's see why.

    if (error.response.status === 401) {
        // Token expired? Let’s refresh it, of course.
        try {
            const res = await axios.post(`${api_url}/user/refresh`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("refresh_token")}`, // Pass the refresh token in the header. Like we're supposed to.
                },
            });

            // Save the new tokens in localStorage. Let's just keep piling up that local storage, shall we?
            localStorage.setItem("refresh_token", res.data["refresh_token"]);
            localStorage.setItem("access_token", res.data["access_token"]);
            console.log(res.response.status); // If you want to log the refresh success... or failure?
            location.reload(); // Refresh the page because who doesn’t love a hard refresh?
        } catch (e) {
            // If refreshing fails, prompt the user to login.
            callModal('login_modal');
        }
    } else if (error.response.status === 401) {
        console.log(error.response); // Error? Let’s just print the response and alert.
        alert("Unauthorized access, please login");
        window.location.href = "login.html"; // Redirect them to login page.
    }

    return Promise.reject(error); // Pass the error along, like a good citizen.
});

// Intercept API requests to inject the access token.
api.interceptors.request.use(function (config) {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Bearer token for authentication.
    }
    return config;
});

// Fetch the header HTML and load it dynamically. Because why hard-code when you can fetch?
fetch('header.html')
    .then(res => res.text())
    .then((res) => {
        $("#header").html(res); // Inject the fetched header into the page.
    }).then(() => {
    loadUsername(); // Also, let's load the username, for added complexity.
});

fetch('admin_header.html')
    .then(res => res.text())
    .then((res) => {
        $("#admin-header").html(res); // Inject the fetched header into the page.
    }).then(() => {
    loadUsername(); // Also, let's load the username, for added complexity.
});

// Utility function to capitalize the first letter of a string.
function capitalize(s) {
    return String(s[0]).toUpperCase() + String(s).slice(1); // First letter, uppercased. Standard.
}

// Get the stored token from localStorage because the web is all about convenience.
function getToken() {
    return localStorage.getItem("access_token");
}

// Set product info in localStorage and navigate to the product page.
let setProduct = async function (id) {
    const res = await api.get(`/product/${id}`);
    const product = JSON.stringify(res.data); // Serialize the product data because storage demands it.
    console.log(product); // Let's log it for good measure.
    localStorage.setItem("product", product); // Save it in localStorage, of course.
    window.location.href = "product.html"; // Move them to the product page.
};

// Set text content for a given element. Yes, it's that simple.
function setText(element, text) {
    element.textContent = text; // Write text to the DOM.
}

// Set text content for a list of elements. Because why settle for one when you can do more?
function setTextByList(elementList, textList) {
    for (let index = 0; index < elementList.length; index++) {
        const element = elementList[index];
        const text = textList[index];
        setText(element, text); // Apply the text to each element.
    }
}

// Set HTML content of an element (beware of innerHTML, my friend).
function setHTML(element, html) {
    console.log(element, html); // Log it. Just because.
    element.innerHTML = html; // Set the inner HTML. Sure, why not?
}

// Get DOM element by ID. The classic getById method because life’s too short for more complex selectors.
function getDoc(id) {
    return document.getElementById(id);
}

// Log out the user by clearing localStorage and redirecting them home.
function logout() {
    localStorage.clear(); // Clear all the stored tokens. Bye-bye, security.
    alert("Logged out"); // Obviously, a loud alert for all to hear.
    window.location.href = "index.html"; // Bring them back to the homepage.
}

// Hide login button if the tokens exist (because we’re too good to log in again).
function hideLogin() {
    if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
        $(".fa-door-open").hide(); // Hide the login icon (now they can’t log out! Muahaha).
        $('.fa-door-open').parent().parent().parent().width('0px').css('padding', '0px'); // Let’s make sure they won’t find it.
    }
}

// Hide login button on pages that are not the login page. Duh.
if (!window.location.href.endsWith("login.html")) {
    hideLogin();
}

// Add a product to the cart. Let's just make shopping a bit more magical.
async function addToCart(id) {
    let response;
    try {
        response = await api.post(`/cart/add/${id}`, {'product_id': id});

        // Make things animate, because why not?
        $(`#p_${id}`).removeClass("hidden").addClass("pop-in");

        setTimeout(() => {
            $(`#p_${id}`).removeClass("pop-in").addClass("fade-out");
        }, 2000);

        $(`#p_${id}`).removeClass("fade-out").addClass("hidden");

    } catch (e) {
        console.log(e.response.status); // Log the error. Like a responsible adult.
        window.location.href = "login.html"; // Redirect to login because apparently we never learn.
    }
}

// Load the username from localStorage and show it. Or show "Welcome!" if none is found.
async function loadUsername() {
    let username = localStorage.getItem("user_name");
    const titleElement = $("#username");
    const topElement = $(".username-title");

    if (username) {
        console.log(username);
        console.log(topElement);

        topElement.text(username); // Display the username somewhere important.
        titleElement.innerHTML = "Hello, " + capitalize(username); // Also, show a welcome message, because why not?
    } else {
        titleElement.text("Welcome!"); // Default message when no username exists.
        topElement.text("Welcome!"); // No username? Just welcome them like a friendly ghost.
    }
}
async function loadCartCount(){
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