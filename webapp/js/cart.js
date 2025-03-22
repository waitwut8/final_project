async function cartLoad() {
    let response = await api.get("/cart/");
    if (response.status === 200) {
        let data = response.data;
        data = Array.from(new Set(data)).map(a =>
            ({ name: a, y: data.filter(f => f === a).length })
        );
        console.log(data);
        localStorage.setItem("cart", JSON.stringify(data));
        renderCart();
    }
}
function remove_clear(product_id){
    console.log("omg help")
    api.post(`/cart/remove_all/${product_id}`, {"product_id": product_id})
    window.location.reload()
    console.log("cleared")
}
async function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    console.log(cart);

    if (cart.length === 0) {
        return;
    }

    const productsContainer = document.querySelector("#productContainer");
    productsContainer.innerHTML = ""; // Clear existing products

    let sumTotal = 0,
        sumDiscountedTotal = 0,
        sumTotalProducts = 0,
        sumTotalQuantity = 0;

    for (let product of cart) {
        console.log("Processing Product:", product);

        let quantity = product.y;
        product = (await api.get("/product/search/" + product.name)).data[0];
        console.log("Product Data:", product);

        sumTotalProducts += 1;
        sumTotalQuantity += quantity;
        sumTotal += product.price * quantity;
        sumDiscountedTotal += product.price * quantity;

        const productRow = createProductRow(product, quantity);
        productsContainer.innerHTML += productRow;

        const totalRow = createTotalRow(product, quantity);
        productsContainer.appendChild(totalRow);
    }

    updateCartSummary(sumTotal, sumDiscountedTotal, sumTotalProducts, sumTotalQuantity);
}

function createProductRow(product, quantity) {
    const img = product.thumbnail;
    const price = product.price;

    let productRow = `
       <div class="row mb-4 d-flex justify-content-between align-items-center">
          <div class="col-md-2 col-lg-2 col-xl-2">
              <img src="${img}" class="img-fluid rounded-3" alt="${product.title}">
          </div>
          <div class="col-md-3 col-lg-3 col-xl-3">
              <h6 class="mb-0">${product.title}</h6>
          </div>
          <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
              <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
                      onclick="reduceCart('${product.product_id}').then((res) => {this.parentNode.querySelector('input[type=number]').stepDown()})">
                  <i class="fas fa-minus"></i>
              </button>
              <input id="form1" name="quantity" min="0" value="${quantity}" type="number"
                     class="form-control form-control-sm" style="width:5rem" readonly/>
              <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
                      onclick="increaseCart('${product.product_id}').then((res) => {this.parentNode.querySelector('input[type=number]').stepUp()})">
                  <i class="fas fa-plus"></i>
              </button>
          </div>
          <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
              <h6 class="mb-0">$${price}</h6>
          </div>
          <div class="col-md-1 col-lg-1 col-xl-1 text-end">
              <button class="text-muted a_${product.product_id} btn btn-close" onclick = "console.log('aaaaah'); remove_clear(${product.product_id})"></button>
          </div>
      </div>
    `;



    return productRow;
}

async function reduceCart(id) {
    await api.post(`/cart/remove/${id}`, { headers: {}, data: { "product_id": id } });

    // Get the updated cart data from localStorage
    let cart = JSON.parse(localStorage.getItem("cart"));

    let updatedCart = cart.map(item => {
        if (item.name === id && item.y > 0) {
            item.y--;
        }
        return item;
    });

    // Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update the DOM directly using jQuery
    let productRow = $(`#cart-item-${id}`);
    if (productRow.length) {
        let quantityInput = productRow.find("input[type=number]");
        let priceElement = productRow.find(".price");

        // Retrieve the quantity and price
        let newQuantity = updatedCart.find(item => item.name === id).y;
        let price = parseFloat(priceElement.data("price")); // Ensure price is a number

        // Check if price and quantity are valid numbers before updating
        if (isNaN(price) || isNaN(newQuantity)) {
            console.error(`Invalid price or quantity: Price = ${price}, Quantity = ${newQuantity}`);
            return;
        }

        // Update the DOM with the new quantity and total price
        quantityInput.val(newQuantity);
        priceElement.text(`$${(newQuantity * price).toFixed(2)}`);
    }

    // Optionally, update the cart summary
    updateCartSummaryIncremental(updatedCart);
}

async function increaseCart(id) {
    await api.post(`/cart/add/${id}`, { headers: {}, data: { "product_id": id } });

    // Get the updated cart data from localStorage
    let cart = JSON.parse(localStorage.getItem("cart"));

    let updatedCart = cart.map(item => {
        if (item.name == id) {
            item.y++;
        }
        return item;
    });
    console.log(updatedCart)
    // Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update the DOM directly using jQuery
    let productRow = $(`#cart-item-${id}`);
    if (productRow.length) {
        let quantityInput = productRow.find("input[type=number]");
        let priceElement = productRow.find(".price");

        // Retrieve the quantity and price
        let newQuantity = updatedCart.find(item => item.name === id).y;
        let price = parseFloat(priceElement.data("price")); // Ensure price is a number

        // Check if price and quantity are valid numbers before updating
        if (isNaN(price) || isNaN(newQuantity)) {
            console.error(`Invalid price or quantity: Price = ${price}, Quantity = ${newQuantity}`);
            return;
        }

        // Update the DOM with the new quantity and total price
        quantityInput.val(newQuantity);
        priceElement.text(`$${(newQuantity * price).toFixed(2)}`);
    }

    // Optionally, update the cart summary
    updateCartSummaryIncremental(updatedCart);
}

async function updateCartSummaryIncremental(cart) {
    let sumTotal = (await api.get("/cart/total")).data, sumDiscountedTotal = 0, sumTotalProducts = 0, sumTotalQuantity = 0;
    console.log(sumTotal)
    sumTotal  = sumTotal.total
    for (const product of cart){
        sumTotalProducts += product.y;
    }
    console.log(sumTotalProducts)


    // Update the cart summary directly using jQuery
    $("#products").text(`items: ${sumTotalProducts}`);
    $("#price").text(`$${sumTotal.toFixed(2)}`);
}


function createTotalRow(product, quantity) {
    const totalRow = document.createElement("div");
    totalRow.classList.add("row");

    const totalPrice = document.createElement("div");
    totalPrice.classList.add("col-md-8");
    totalPrice.innerHTML = `<p id ="total"><strong>Total:</strong> $${(product.price * quantity).toFixed(2)}</p>`;

    const discountedTotalPrice = document.createElement("div");
    discountedTotalPrice.classList.add("col-md-4");
    discountedTotalPrice.innerHTML = `<p><strong>Discounted Total:</strong> $${(product.price * quantity).toFixed(2)}</p>`;

    totalRow.appendChild(totalPrice);
    totalRow.appendChild(discountedTotalPrice);
    totalRow.appendChild(document.createElement("hr"));

    return totalRow;
}

function updateCartSummary(sumTotal, sumDiscountedTotal, sumTotalProducts, sumTotalQuantity) {
    document.getElementById("products").innerHTML = `Items: ${sumTotalQuantity}`;
    document.getElementById("price").innerHTML = `$${sumTotal.toFixed(2)}`;
}

async function loadCheckout() {
    document.getElementById("checkout").addEventListener("click", (e) => {
        e.preventDefault();
        let promo = document.getElementById("form3Examplea2").value;
        checkout(promo);
    });
}

async function checkout(promo) {
    try {
        await api.get(`/cart/checkout?promo=${promo}`);
        alert('Checkout Successful');
        window.location.href = "index.html";
    } catch (err) {
        alert('Checkout Failed');
    }
}
