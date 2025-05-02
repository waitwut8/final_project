// === USERNAME STUFF ===

// Just here to load the username and the home page content. Yep, that's it.
loadUsername();

// Function to load the username and display it somewhere on the page.
function loadUsername() {
    const username = localStorage.getItem('username') || 'Guest'; // Be fancy or just... be a guest
    document.querySelector("#username").textContent = username; // Slap that name right on the page
}


// === THE HOMEPAGE MEGAMIX ===

// The magical function that loads all the home page goodness. No big deal.
async function loadHome() {
    const productsContainer = document.querySelector("#row"); // Find where we’ll stuff all those shiny products.

    // Clearing out any existing products, because apparently, "starting fresh" is the new cool.
    productsContainer.innerHTML = "";

    // Check if user is logged in by sending a totally chill POST request (because why GET when you can POST?)
    try {
        let isLoggedIn = (await api.post(`${api_url}/user/is_token_active`)).data.active;
        console.log("Logged in?", isLoggedIn);

        if (isLoggedIn) {
            // Fetch recommended products. Because the algorithm *knows you better than your friends*.
            let list_of_items = await api.get(`${api_url}/product/recommend`);
            list_of_items = list_of_items.data.slice(0, 8); // Limit to top 8 because attention spans are fragile.
            addCards(_.flatten(_.values(list_of_items)), productsContainer); // Add those cards to the DOM like a boss.

            // Bonus feature: throw in some random brand recommendations just to spice things up.
            let list_of_items2 = await api.get("/product/recommend_random_brand");
            list_of_items2 = list_of_items2.data;
            $("#tag-title").text(`You might like ${list_of_items2.brand}`);
            addCards(list_of_items2.recommended_products, $("#tag-content")[0]);
        }
    } catch (error) {
        console.error("Error checking login status or loading recommended products:", error);
        // You're not logged in? Here's some *completely random* products. May the odds be ever in your favor.
        try {
            let list_of_items = await api.get(`${api_url}/product/random`);
            list_of_items = list_of_items.data;
            addCards(list_of_items, productsContainer);
        } catch (innerError) {
            console.error("Error loading random products:", innerError);
            productsContainer.innerHTML = '<p class="text-danger">Failed to load content. Please try again later.</p>';
        }
    }

    // If you’re still wondering about your own username for some reason, uncomment this
    // let comment_username = await api.get(`/user/username`);
    // setText(getDoc("comment_username"), comment_username.data[0]);
    // setText(getDoc("company_roles"), comment_username.data[1]);

    // Setting up listener for that ultra-important navbar click event. Game-changing stuff here.
    listenToNavBar();
}


// === NAVIGATION NINJAS ===

// Listen to clicks on the navbar links. (Spoiler: It just logs clicks for now)
function listenToNavBar() {
    $(".nav-link").on('click', function () {
        console.log("clicked?"); // The investigative journalism of frontend dev
    });
}


// === LOGIN BUTTON: THE VANISHING ACT ===

// Hide the login button if they're already logged in. Because we’re not here to waste time.
function hideLogin() {
    if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
        $(".fa-door-open").hide(); // If you're logged in, the door to log in again is *gone*. Poof.
    }
}

// If you’re not on the login page, hide the login button. It's basic logic, really.
if (!window.location.href.endsWith("login.html")) {
    hideLogin(); // Because seeing a login button when you're already logged in is just rude.
}


// === CARD-CREATION ENGINE 9000 ===

// This bad boy is what actually creates the product cards and inserts them. It's a work of art.
function addCards(list_of_items, productsContainer) {
    for (const product of list_of_items) {
        const productCard = `
        <div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-5">
            <div class="card border-0 rounded-3 shadow-sm h-100">
                <img src="${product.thumbnail.replaceAll('\"', '')}" alt="${product.title}" class="card-img-top rounded-top"> <!-- Thumbnail for that extra flair -->

                <div class="card-body d-flex flex-column p-4">
                    <h5 class="card-title fw-bold text-truncate mb-2">${product.title}</h5> <!-- Because people name things -->

                    <span class="badge bg-success bg-gradient rounded-pill fs-6 mb-3">
                        $${product.price} <!-- Capitalism badge -->
                    </span>

                    <button type="button" class="btn btn-primary mt-auto rounded-pill" onclick="addToCart(${product.product_id})">
                        <i class="bi bi-cart-plus me-2"></i> Add to Cart <!-- The sacred button of all online stores -->
                    </button>

                    <p class="hidden text-success mb-0" id="p_${product.product_id}" style="font-size: 0.9rem;">
                        <i class="fas fa-check-circle"></i> Product added to cart! <!-- Mini celebration -->
                    </p>
                </div>
            </div>
        </div>
        `;
        productsContainer.insertAdjacentHTML("beforeend", productCard); // DOM magic, baby.
    }
}


// === THE BANNER LOTTERY ===

// Why have one banner when you can have a surprise banner every time? 🍭
function getRandomBanner() {
    let banner_id = Math.floor(Math.random() * 5) + 1; // Lucky number between 1 and 5
    $("#banner").html(`
        <img class="img-fluid rounded-circle shadow-lg" src="assets/images/banners/image_${banner_id}.png" alt="Banner" id="img" />
    `);
}
getRandomBanner(); // Treat yourself to a different banner every reload. Spice of life, etc.


// === POST PARTY TIME ===

// Function to load posts and display them on the page.
async function loadPosts() {
    const postsContainer = $("#posts-container"); // The sacred scroll holder of content
    postsContainer.empty(); // Yeet any pre-existing content

    try {
        const response = await api.get("/post/random"); // Random? Chaotic? Perfect.
        const posts = response.data;

        let row;
        posts.forEach((post, index) => {
            if (index % 4 === 0) {
                row = $('<div class="row mb-4"></div>'); // A fresh new row every 4 posts. Because grid, baby.
                postsContainer.append(row);
            }

            const randomImage = `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`; // Guaranteed to be vaguely artistic

            const postCard = `
                <div class="col-lg-3 col-md-6 col-sm-12 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${randomImage}" class="card-img-top rounded-top" alt="Random Image">
                        <div class="card-body">
                            <h5 class="card-title text-truncate text-primary fw-bold">${post.title.replace(/<[^>]*>/g, '')}</h5>
                            <p class="card-text text-muted">${post.content.substring(0, 100)}...</p>
                            <p class="card-text">
                                <span class="text-success"><i class="fas fa-thumbs-up"></i> ${post.likes}</span>
                                <span class="text-danger ms-3"><i class="fas fa-thumbs-down"></i> ${post.dislikes}</span><br>
                                <small class="text-muted"><i class="fas fa-eye"></i> ${post.views} views</small>
                            </p>
                            <button class="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#postModal-${post.id}">
                                <i class="fas fa-book-open"></i> Read More
                            </button>
                        </div>
                    </div>
                </div>
            `;
            row.append(postCard); // Throw it in like it’s hot

            const postModal = `
                <div class="modal fade" id="postModal-${post.id}" tabindex="-1" aria-labelledby="postModalLabel-${post.id}" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="postModalLabel-${post.id}">${post.title.replace(/<[^>]*>/g, '')}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <img src="${randomImage}" class="img-fluid rounded mb-3" alt="Random Image">
                                <p>${post.content}</p>
                                <p>
                                    <strong class="text-success"><i class="fas fa-thumbs-up"></i> Likes:</strong> ${post.likes} |
                                    <strong class="text-danger"><i class="fas fa-thumbs-down"></i> Dislikes:</strong> ${post.dislikes}<br>
                                    <strong class="text-muted"><i class="fas fa-eye"></i> Views:</strong> ${post.views}
                                </p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $("body").append(postModal); // Slap that modal onto the body like a dramatic twist in a TV show
        });
    } catch (error) {
        console.error("Error loading posts:", error);
        postsContainer.html('<p class="text-danger">Failed to load posts. Please try again later.</p>');
    }
}

loadPosts(); // Let's get those hot takes, personal blogs, and oversharing on display

function handleAddPosts(){
    addPosts()
}
function addPosts(){
    api.post("/post/", {
        'user_id': 1,
        'title': $("#post-title").val(),
        'content': $("#post-content").val(),
        'likes': 0,
        'dislikes': 0,
        'views': 0,
        'created_at': new Date().toISOString()
    })
    window.location.reload()
}

/**
 * id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    title: str
    content: str
    likes: int
    dislikes: int
    views: int
    created_at: Optional[str]
 */