// Just here to load the username and the home page content. Yep, that's it.
loadUsername();

// Function to load the username and display it somewhere on the page.
function loadUsername() {
    const username = localStorage.getItem('username') || 'Guest';
    document.querySelector("#username").textContent = username;
}

// The magical function that loads all the home page goodness. No big deal.
async function loadHome() {
    const productsContainer = document.querySelector("#row"); // Find where we’ll stuff all those shiny products.

    // Clearing out any existing products, because apparently, "starting fresh" is the new cool.
    productsContainer.innerHTML = "";

    // Fetch random products. They’re like the surprise party of e-commerce.
    let list_of_items = await api.get(`${api_url}/product/random`);
    list_of_items = list_of_items.data; // Look, we just wanted the data, not the rest of the fluff.

    // Populating the container with the products. Insert those shiny cards!
    addCards(list_of_items, productsContainer);

    // Uncomment below if you want to be a considerate developer and show logged-in users recommended products.
    // if (Boolean(localStorage.getItem("logged_in")) !== true) {
    //     // Logic for when they're not logged in. Clearly, they don't deserve recommendations.
    // } else {
    //     // Logic for when they are. Fetch recommended products. Because they should totally feel special.
    //     let list_of_items = await api.get(`/rec_products`);
    //     list_of_items = list_of_items.data.slice(0, 8); // Limit to top 8 because we have priorities.
    //     addCards(_.flatten(_.values(list_of_items)), productsContainer);
    // }

    // If you want to do something with the username, here's a placeholder.
    // let comment_username = await api.get(`/user/username`);
    // setText(getDoc("comment_username"), comment_username.data[0]);
    // setText(getDoc("company_roles"), comment_username.data[1]);

    // Setting up listener for that ultra-important navbar click event. This is going to be a game changer.
    listenToNavBar();
}

// Listen to clicks on the navbar links. (Spoiler: It just logs clicks for now)
function listenToNavBar() {
    $(".nav-link").on('click', function() {
        console.log("clicked?"); // Alert me when a navbar link gets clicked. Really important stuff.
    });
}

// Hide the login button if they're already logged in. Because we’re not here to waste time.
function hideLogin() {
    if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
        $(".fa-door-open").hide(); // If you're logged in, the door to log in again is *gone*.
    }
}

// If you’re not on the login page, hide the login button. It's basic logic, really.
if (!window.location.href.endsWith("login.html")) {
    hideLogin(); // Just in case you’re not logged in, let’s hide the button everywhere except the login page.
}

// This bad boy is what actually creates the product cards and inserts them. It's a work of art.
function addCards(list_of_items, productsContainer) {
    // Loop through each product and make it look good in a card, like a pro designer.
    for (const product of list_of_items) {
        const productCard = `
        <div class=" col-lg-3 col-md-4 mb-5">
            <div class="card border-0 rounded-3 shadow-sm h-100">
                <img src="${product.thumbnail.replaceAll('\"', '')}" alt="${product.title}" class="card-img-top rounded-top"> <!-- Thumbnail for that extra flair -->

                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-truncate mb-2">
                        ${product.title} <!-- Display the title, gotta tell them what they're looking at -->
                    </h5>
                    
                    <span class="badge bg-success bg-gradient rounded-pill fs-6 mb-3">
                        $${product.price} <!-- Price tag, because capitalism -->
                    </span>

                    <button type="button" class="btn btn-primary mt-auto rounded-pill" onclick="addToCart(${product.product_id})">
                        <i class="bi bi-cart-plus me-2"></i> Add to Cart <!-- The classic "Add to Cart" button. Go ahead, click it -->
                        
                    </button>
                    <p class="hidden text-success mb-0" id="p_${product.product_id}" style="font-size: 0.9rem;">
                        <i class="fas fa-check-circle"></i> Product added to cart!
                        </p>
                </div>
            </div>
        </div>
        `;
        // Stick the card right into the container like the pro you are. No drama.
        productsContainer.insertAdjacentHTML("beforeend", productCard);
    }
}
///////// BANNER //////////
function getRandomBanner(){
    let banner = document.querySelector("#banner");
    let banner_id = Math.floor(Math.random() * 5) + 1;
    // banner.innerHTML = `<img src="assets/images/banners/image_${banner_id}.png" class="img-fluid" alt="Banner">`;
    $("#banner").html(`<img class="img-fluid rounded-circle shadow-lg" src="assets/images/banners/image_${banner_id}.png" alt="Responsive Design Illustration" id="img" />`)
}
getRandomBanner(); // Get a random banner image and display it. Because variety is the spice of life.