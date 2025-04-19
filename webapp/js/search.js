

// Fetch product data from the FastAPI endpoint and store it in local storage
const fetchDataAndStore = async () => {
    try {
        // Fetching the product data from the FastAPI endpoint
        const res = await api.get("/product");  // Getting all the product goodness from the server. Mmmm data.

        // Store it in localStorage like we're hoarding digital treasures
        localStorage.setItem('data', JSON.stringify(res.data)); // Saving the fetched data in localStorage (our personal vault).

        // Log the product data to console so we can pretend to be debugging superheroes
        console.log("Product Data:", JSON.stringify(res.data)); // *Pretends to be impressed* Wow, look at that data!
    } catch (error) {
        // In case something goes wrong, we throw our hands in the air and scream... silently.
        console.error("Failed to fetch product data:", error);  // Looks like the server's taking a coffee break.
    }
};

// Initialize _brand_filters as an empty Set (Because why not start clean?)
let _brand_filters = new Set(), _tag_filters = new Set();  // Set, because regular arrays were too mainstream for our filtering needs.
let fmi_price = 0; // fmi => filter minimum price
let fma_price = 0; // fma => filter maximum price
// Initialize data from localStorage and search input (We are getting nostalgic now... and efficient)
let data = JSON.parse(localStorage.getItem('data'));  // We retrieve our precious data from storage like Indiana Jones digging up artifacts.
let _input = document.getElementById('search-input');  // Getting our search input, because we’re all about that search life.

// Handle search button click and trigger product search when the "search" button is clicked
$("#btn-success").on('click', () => {
    const keyword = current_query;  // Grabbing the search keyword like it’s a new clue.
    searchProducts(keyword);  // Get ready for some search action.
});



// Trigger product search when the Enter key is pressed. Yeah, we’re extra like that.
window.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {  // Enter key! THE MOST DRAMATIC KEY!
        searchProducts($("#search-input")[0].value);  // Searching on Enter—because why not make the universe follow our rules?
    }
});

// Initial product search trigger (still not sure why it's here, but keeping it because "why not?")
// Check if URL parameters exist, then search with the provided keyword
const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get('keyword'); // Assuming the parameter is named 'keyword'
const current_query = keyword;
if (current_query) {
    $("#search-result").text(`You searched for "${current_query}"`); // Display the current search query in the search result section
}
 // Display the current search query in the search result section
if (keyword) {
    searchProducts(keyword); // Search with the keyword from the URL
} else {
    searchProducts(); // Default search if no keyword is provided
}




// Function to display product information in the results container
const extracted = (product, resultsContainer) => {
    const productDiv = document.createElement("div");  // Creating a div to hold our product. It's like building a tiny home.
    productDiv.className = "product card mb-3 col-6 mx-auto";  // Adjusted to make it responsive. We're fancy like that.

    // Now, let’s fill the div with actual product info. Prepare to be wowed.
    productDiv.innerHTML = `
        <div class="card shadow-lg border-light mb-4" style="border-radius: 15px; overflow: hidden; background: #f9f9f9;">
            <div class="card-body">
                <!-- Product Title -->
                <h4 class="card-title font-weight-bold text-dark fs-4" style="line-height: 1.4; color: #333;">
                    ${product.title}  <!-- The star of the show, ladies and gentlemen! -->
                </h4>

                <!-- Product Thumbnail and Description -->
                <div class="d-flex mb-3">
                    <img src="${product.thumbnail.replaceAll('\"', '')}" class="img-fluid rounded-3 mr-3" alt="${product.title}"
                         style="max-width: 130px; max-height: 130px; object-fit: cover; border: 4px solid #f0f0f0; box-shadow: 0 8px 16px rgba(0,0,0,0.1);" />
                    <p class="card-text text-secondary ms-1 fs-5" style=" color: #666; word-wrap: break-word">${product.description.length > 75 ? product.description.substring(0, 75) + '...' : product.description}</p>  <!-- A little something about the product. -->
                </div>

                <hr class="my-3" style="border-color: #e0e0e0;"/>

                <!-- Price and Add to Cart Section -->
                <div class="d-flex justify-content-between align-items-center">
                    <!-- Price -->
                    <span class=" price">
                        $${product.price}  <!-- Let's make that price shine bright like a diamond. -->
                    </span>

                    <!-- Add to Cart Button -->
                    <button id="cart-${product.product_id}" class="btn btn-gradient add-to-cart-btn" style="border-radius: 25px; padding: 10px 20px; background: linear-gradient(135deg, #6c63ff, #3a8dff); color: white; border: none;">
                        <i class="fas fa-cart-plus"></i> Add to Cart  <!-- We want the cart filled to the brim, people! -->
                    </button>
                </div>

                <!-- Success Message for Cart -->
                <p class="hidden text-success mb-0" id="p_${product.product_id}" style="font-size: 0.9rem; font-weight: bold;">
                    <i class="fas fa-check-circle"></i> Product added to cart!  <!-- We can only hope that this shows up when the cart actually gets filled. -->
                </p>

                <!-- View More Details Button -->
                <button class="btn btn-info mt-3" style="border-radius: 25px; padding: 10px 20px; background: #17a2b8; color: white; border: none;" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-modal-${product.product_id}" aria-controls="offcanvasTop"id="view-details-${product.product_id}">
                    <i class="fas fa-info-circle"></i> View More Details  <!-- Because sometimes, we just need to know more. -->
                </button>
                
            </div>
        </div>
        


                
            
        
    `;


    // Append the product card to the results container. Because we're about to drop a knowledge bomb here.
    resultsContainer.appendChild(productDiv);
    resultsContainer.insertAdjacentHTML("afterend", `<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvas-modal-${product.product_id}" aria-labelledby="offcanvasTopLabel" data-bs-scroll="true" data-bs-backdrop="false">
        <div class="offcanvas-header">
            <h5 id="offcanvasTopLabel">${product.title}</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="product-card card shadow-lg rounded-lg">
            
            <!-- Product Image Section -->
            <div class="">
            <div class="col-md-6 d-flex justify-content-center align-items-center mb-4 mb-md-0">
            <div class="product-image-container">
                <img src="${product.thumbnail}" alt="${product.title}" class="img-fluid rounded-lg shadow-sm" style="max-width: 100%; max-height: 300px; object-fit: cover;">
                <!-- Optional: Subtle hover effect to highlight the image -->
                <div class="image-overlay d-flex justify-content-center align-items-center">
                <i class="fas fa-search-plus text-white" style="font-size: 2rem;"></i>
                </div>
            </div>
            </div>
            <div class="card-body">
            <!-- Price -->
            <div class="product-price mb-3">
                <h4 class="text-success font-weight-bold" style="font-size: 1.8rem;">$${product.price}</h4>
            </div>

            <!-- Buttons: Add to Cart & More Details -->
            <div class="d-flex mb-3">
                <button class="btn btn-success flex-fill mr-2" id="modal-cart-${product.product_id}">
                <i class="fas fa-cart-plus"></i> <span class="d-none d-sm-inline">ADD TO CART</span>
                </button>
                <button class="btn btn-primary flex-fill">
                <i class="fas fa-info-circle"></i> <span class="d-none d-sm-inline">MORE DETAILS</span>
                </button>
            </div>

            <!-- Product Description -->
            <div class="product-details mb-3">
                <p class="text-muted" style="font-size: 1rem; line-height: 1.6; color: #6c757d;">${product.description}</p>
            </div>

            
            </div>
            </div>

            <!-- Review Section -->
            <div class="product-reviews mt-4 mx-2">
            <h5 class="text-dark font-weight-bold mb-3">Customer Reviews</h5>
            <div class="review-list">
            <!-- Placeholder for reviews -->
            <p class="text-muted">No reviews yet. Be the first to review this product!</p>
            </div>
            <div class="add-review mt-3">
            <h6 class="text-dark font-weight-bold">Add a Review</h6>
            <textarea class="form-control mb-2" id="review-text-${product.product_id}" rows="3" placeholder="Write your review here..."></textarea>
            <!-- Rating Bar -->
            <div class="product-rating mb-3">
                <h6 class="text-dark font-weight-bold">Rating:</h6>
                <div class="rating-bar d-flex align-items-center">
                <input type="number" id="rating-input-${product.product_id}" class="form-control mx-1" min="1" max="5" step="1" placeholder="Rate (1-5)" style="width: 120px;" />
                
                </div>
            </div>
            <button class="btn btn-primary" id="submit-review-${product.product_id}">Submit Review</button>
            </div>
            </div>
            </div>
        </div>
        </div>`);

    // Fetch and display all reviews for the product
    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/product/${product.product_id}`);
            if (response.status === 200) {
                const reviews = response.data;
                const reviewList = document.querySelector(`#offcanvas-modal-${product.product_id} .review-list`);
                reviewList.innerHTML = ""; // Clear existing reviews
                if (reviews.length > 0) {
                    reviews.forEach(async review => {
                        let user = (await api.post("/user/whothis", { "user_id": review.user_id })).data;
                        console.log(user)
                        reviewList.innerHTML += `<p class="text-dark"><strong>${user}:</strong> ${review.review} (Rating: ${review.rating}/5)</p>`;
                    });
                } else {
                    reviewList.innerHTML = "<p class='text-muted'>No reviews yet. Be the first to review this product!</p>";
                }
            } else {
                console.error("Failed to fetch reviews");
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    // Call fetchReviews to load reviews when the product card is created
    fetchReviews();
    // Submit a review request to the server
    document.getElementById(`submit-review-${product.product_id}`).addEventListener("click", async () => {
        const reviewText = document.getElementById(`review-text-${product.product_id}`).value;
        const ratingInput = Number(document.getElementById(`rating-input-${product.product_id}`).value);
        console.log(reviewText, ratingInput)
        if (reviewText && ratingInput >= 1 && ratingInput <= 5) {
            try {
                const response = await api.post("/reviews/add", {
                    product_id: product.product_id,
                    review: reviewText,
                    rating: ratingInput
                });

                if (response.status === 200) {
                    const reviewList = document.querySelector(`#offcanvas-modal-${product.product_id} .review-list`);
                    reviewList.innerHTML += `<p class="text-dark"><strong>Anonymous:</strong> ${reviewText} (Rating: ${ratingInput}/5)</p>`;
                    document.getElementById(`review-text-${product.product_id}`).value = ""; // Clear the textarea
                    document.getElementById(`rating-input-${product.product_id}`).value = ""; // Clear the rating input
                } else {
                    alert("Failed to submit review. Please try again.");
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                alert("An error occurred while submitting your review. Please try again later.");
            }
        } else {
            alert("Please provide a valid review and rating (1-5) before submitting.");
        }
    });
    $(`#view-details-${product.product_id}`).on('click', function () {
        let modal = new bootstrap.Modal(document.getElementById(`product-modal-${product.product_id}`));
        modal.show(); // This ensures that the modal is shown properly.
    });

    console.log($(`#cart-${product.product_id}`))
    // Handle the "Add to Cart" button click event. Let's bring out the big guns.
    $(`#cart-${product.product_id}, #modal-cart-${product.product_id}`).on("click", (event) => {
        event.preventDefault();  // Prevent the default action, because we like to do things our way.
        console.log("clicked")
        addToCart(product.product_id);  // Add to cart logic. Assumed to be defined elsewhere, but we’re too cool to care.
    });
    // Update the product count text
    const productCountText = document.getElementById("product-count");
    if (productCountText) {
        productCountText.textContent = `${resultsContainer.children.length} products found`;
    }
};

// Function to search for products based on a keyword and filters
function searchProducts(keyword) {

    let resultsContainer = document.getElementById("search-results");  // Where the magic happens. We find, we filter, we display.
    let searchURL = `/product/search/${keyword}`;  
    resultsContainer.innerHTML = "";  
    if (!keyword) {  // If no keyword, let’s fetch all products. Like a buffet, but with less food and more data.
        searchURL = "/product/";  
    }

    // Let’s fetch and process the search results.
    api.get(searchURL).then((res) => {
        /**
         * @type {Array<Object>}
         */
        let results = res.data;  // These are the juicy results we’ve been waiting for.

        if (results.length === 0) {  // No products found? Well, that’s a bummer.
            resultsContainer.innerHTML = "<p>No products found</p>";  
            return;
        }
        fma_price = Number(localStorage.getItem("Maximum").replace(",", ""))
        fmi_price = Number(localStorage.getItem("Minimum").replace(",", ""))




        if (fma_price && fmi_price) {
            results = results.filter(product => _.gte(Number(String(product.price).replace("$", "")), fmi_price) && _.lte(Number(String(product.price).replace("$", "")), fma_price))

        }
        // Filter products based on selected brand filters
        if (_brand_filters.size !== 0) {  // We’re not playing around with brand filters. If they exist, we’re filtering hard.
            results = results.filter(product => _brand_filters.has(product.brand));  // Filtering based on the brand (let’s get specific).
        }
        if (_tag_filters.size !== 0) {  // We’re not playing around with tag filters. If they exist, we’re filtering hard.
            results = results.filter(product => _.intersection([..._tag_filters], product.tags).length != 0);  // Filtering based on the tag (let’s get specific).
        }
        results = results.filter(product => _.gte(Number(String(product.price).replace("$", "")), fmi_price) && _.lte(Number(String(product.price).replace("$", "")), fma_price))
        // Display the filtered products
        results.forEach((product) => {
            extracted(product, resultsContainer);  // We send each product to be displayed in style.
        });
        if (current_query){
        $('#search-result-breakdown').text(`Your search for "${current_query}" returned ${results.length} results:`);  // Let’s break down the search results for our users. They deserve to know.
        }
        else{
            $('#search-result-breakdown').text(`${results.length} results:`);  // Let’s break down the search results for our users. They deserve to know.
        }
    }).catch((error) => {
        console.error("Error fetching search results:", error);  // In case we hit a snag, we’ll just cry a little inside.
    });
}

// Trigger search on clicking the search button
$("#search-button").on('click', () => {
    searchProducts(current_query);  // Trigger the search. It’s go time!
});

// Function to load and run product filters (brands and tags)
async function runFilters() {
    try {
        // Fetch brand and tag filters from the server. Because filtering is life.
        const data = (await api.get("/product/filters")).data;
        const brands = data.brands;
        const tags = data.tags;
        console.log( $("#t_bloodhound .t_typeahead"),  $("#o_bloodhound .o_typeahead"))
        // Set up Bloodhound for brand filters (we’re pulling out the big guns for this one).
        const brand_filters = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: brands,  // Using local data because why call external APIs when we have it all right here?
        });
        
        // Initialize typeahead for brand search
        
            $("#o_bloodhound .o_typeahead").typeahead({
                hint: true,  // Hinting at possible brand names, because we’re considerate like that.
                highlight: true,  // Making sure the highlighted options are as obvious as possible.
                minLength: 1,  // Triggering after the first letter. We don’t believe in waiting.
                limit: 25,  
            }, {
                name: "brands",
                source: brand_filters,  // We tell Bloodhound where to get its data. It’s like being the teacher’s pet.
            });
        

        // Handle brand filter addition
        $("#brand-filter-adder").on("click", (event) => {
            event.preventDefault();  // Stopping the page from reloading. This isn't the 90s anymore.
            const _filter = $("#brand-search").val();  // Grab the brand filter the user typed in.
            if (brands.includes(_filter)) {  // If the brand exists in our list...
                console.log(`Adding filter for brand: ${_filter}`);  
                _brand_filters.add(_filter);  // Add that brand to our collection of filters.
                updateActiveFilters();  // Let’s update the UI, because we don’t keep things static around here.
            } else {
                console.log("Brand not found in filter list");  // Oops, brand’s not in our list. Better luck next time.
            }
        });

        // Handle filter removal
        $(document).on('click', '.cross-icon', function () {
            const filterBrand = $(this).data('brand');  // Get the brand to remove.
            _brand_filters.delete(filterBrand);  // Delete that brand from our collection like it never existed.
            updateActiveFilters();  // Update the UI and make sure everything reflects our fresh choices.
            searchProducts(current_query);  // Re-run the search with the new filters, because we’re thorough.
        });

        // Initialize typeahead for tag search
        const tag_filters = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: tags,  
        });
        
        $("#t_bloodhound .t_typeahead").typeahead({
            hint: true,  // Hinting at possible tag names, because we’re considerate like that.
            highlight: true,  // Making sure the highlighted options are as obvious as possible.
            minLength: 1,  // Triggering after the first letter. We don’t believe in waiting.
            limit: 25,  
        }, {
            name: "tags",
            source: tag_filters,  // We tell Bloodhound where to get its data. It’s like being the teacher’s pet.
        });
    

        // Handle tag filter addition
        $("#tag-filter-adder").on("click", (event) => {
            event.preventDefault();  // Stopping the page from reloading. This isn't the 90s anymore.
            const _filter = $("#tag-search").val();  // Grab the tag filter the user typed in.
            if (tags.includes(_filter)) {  // If the tag exists in our list...
                console.log(`Adding filter for tag: ${_filter}`);  // Let’s announce it to the world!
                _tag_filters.add(_filter);  // Add that tag to our collection of filters.
                updateActiveFilters();  // Let’s update the UI, because we don’t keep things static around here.
            } else {
                console.log("Tag not found in filter list");  // Oops, tag’s not in our list. Better luck next time.
            }
        });

        // Handle filter removal
        $(document).on('click', '.cross-icon', function () {
            const filterTag = $(this).data('tag');  // Get the tag to remove.
            _tag_filters.delete(filterTag);  // Delete that tag from our collection like it never existed.
            updateActiveFilters();  // Update the UI and make sure everything reflects our fresh choices.
            searchProducts(current_query);  // Re-run the search with the new filters, because we’re thorough.
        });

    } catch (error) {
        console.error("Error fetching filters:", error);  // If anything goes wrong, we console-log our sadness.
    }
}

// Function to update the active filters UI
function updateActiveFilters() {
    const activeFiltersContainer = $("#active-filters");
    activeFiltersContainer.empty();  // Empty the old filters because we like a clean slate.

    // Append active brand filters
    _brand_filters.forEach((brand) => {
        activeFiltersContainer.append(`
            <div class="cross-container">
                <p class="sample-text">
                    <span class="cross-icon" data-brand="${brand}">&times;</span> ${brand}  <!-- Filter removal button—click it to undo your choices. -->
                </p>
            </div>
        `);
    });

    // Append active tag filters
    const tagFiltersContainer = $("#tag-active-filters");
    tagFiltersContainer.empty();  // Empty the old filters because we like a clean slate.

    _tag_filters.forEach((tag) => {
        tagFiltersContainer.append(`
            <div class="cross-container">
                <p class="sample-text">
                    <span class="cross-icon" data-tag="${tag}">&times;</span> ${tag}  <!-- Filter removal button—click it to undo your choices. -->
                </p>
            </div>
        `);
    });

    // Re-run the search with the current filters
    searchProducts(current_query);  // Don’t forget to refresh the results.
}

// Run the filters setup (setting up the showtime!)
function waitForTypeaheadAndBloodhound() {
    return new Promise((resolve, reject) => {
        const maxRetries = 100; // Avoid infinite waiting in case the universe breaks
        let attempts = 0;

        function check() {
            const bloodhoundReady = typeof Bloodhound !== 'undefined';
            const typeaheadReady = typeof $.fn.typeahead !== 'undefined';

            if (bloodhoundReady && typeaheadReady) {
                console.log("🐦 Typeahead and 🩸 Bloodhound are ready.");
                resolve();
            } else if (attempts >= maxRetries) {
                reject(new Error("Bloodhound and Typeahead never showed up. They ghosted us."));
            } else {
                attempts++;
                setTimeout(check, 50);
            }
        }

        check();
    });
}


function updateSlider($slider, $output, label) {
    let value = Number($slider.val()).toLocaleString();
    $output.text(`${label}: $${value}`);
    localStorage.setItem(label, value)
    console.log(value);
}

$(".slider").each(function () {
    let $slider = $(this);
    let $output = $("#" + $slider.data("output"));
    let label = $slider.data("label");

    // Set initial value
    updateSlider($slider, $output, label);

    // Update on input
    $slider.on("input", function () {
        updateSlider($slider, $output, label);
    });
    $slider.on("change", function () {
        searchProducts(current_query);
    });
});
$(document).ready(function(){
    console.log("jQuery version:", $.fn.jquery);
console.log("Does typeahead exist:", typeof $.fn.typeahead);

    console.log("Document is ready, running filters...");
    runFilters()
    console.log("jQuery version:", $.fn.jquery);
console.log("Does typeahead exist:", typeof $.fn.typeahead);
})