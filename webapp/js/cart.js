async function cartLoad() {
    let response = await api.get("/cart");
    if (response.status === 200){
    let data = response.data;
    localStorage.setItem("cart", JSON.stringify(data));
    renderCart();
    }
  }
  
  function renderCart() {
    
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart.products.length === 0) {
      return 1;
    }
    const productsContainer = document.querySelector("#productContainer");
    productsContainer.innerHTML = ""; // Clear existing products
  
    let sumTotal = 0,
      sumDiscountedTotal = 0,
      sumTotalProducts = 0,
      sumTotalQuantity = 0;
    console.log(cart["products"])
    cart["products"].forEach((product) => {
      console.log(product)
      sumTotalProducts += 1;
      sumTotalQuantity += product.quantity;
      sumTotal += product.total * product.quantity;
      sumDiscountedTotal += product.discountedTotal * product.quantity;
  
      const productRow = createProductRow(product);
      productsContainer.innerHTML += productRow;
  
      const totalRow = createTotalRow(product);
      productsContainer.appendChild(totalRow);
    });
  
    updateCartSummary(sumTotal, sumDiscountedTotal, sumTotalProducts, sumTotalQuantity);
  }
  
  function createProductRow(product) {
    let img = product.thumbnail,


    quantity = product.quantity,
    price = product.price
    let productRow = `
       <div class="row mb-4 d-flex justify-content-between align-items-center">
    <div class="col-md-2 col-lg-2 col-xl-2">
      <img
        src="${img}"
        class="img-fluid rounded-3" alt="Cotton T-shirt">
    </div>
    <div class="col-md-3 col-lg-3 col-xl-3">

      <h6 class="mb-0">${product.title}</h6>
    </div>
    <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
        onclick=" reduceCart('${product.title}').then((res)=>{this.parentNode.querySelector('input[type=number]').stepDown()})">
        <i class="fas fa-minus"></i>
      </button>

      <input id="form1" name="quantity" min = '0' value="${quantity}" type="number"
        class="form-control form-control-sm" style = "width:5rem" readonly/>

      <button data-mdb-button-init data-mdb-ripple-init class="btn btn-link px-2"
        onclick=" increaseCart('${product.title}').then((res)=>{this.parentNode.querySelector('input[type=number]').stepUp()});">
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
      <h6 class="mb-0">${price}</h6>
    </div>
    <div class="col-md-1 col-lg-1 col-xl-1 text-end">
      <a href="#!" class="text-muted"><i class="fas fa-times"></i></a>
    </div>
  </div>
`
 
    return productRow;
  }


function reduceCart(title){
  let r = {"product_name": title,
    "quantity": 1}
    console.log(r)
  api.delete("/cart",{headers:{}, data: {"product_name": title, "quantity": 1}})
  cartLoad().then()
  

}
function increaseCart(title){
  let r = {"product_name": title,
    "quantity": 1}
    console.log(r)
  api.post("/cart", r)
  cartLoad().then()
}

  function createTotalRow(product) {
    const totalRow = document.createElement("div");
    totalRow.classList.add("row");
  
    const totalPrice = document.createElement("div");
    totalPrice.classList.add("col-md-8");
    totalPrice.innerHTML = `<p><strong>Total:</strong> $${(product.total.toFixed(2) * product.quantity).toFixed(2)}</p>`;
  
    const discountedTotalPrice = document.createElement("div");
    discountedTotalPrice.classList.add("col-md-4");
    discountedTotalPrice.innerHTML = `<p><strong>Discounted Total:</strong> $${(product.discountedTotal.toFixed(2) * product.quantity).toFixed(2)}</p>`;
  
    totalRow.appendChild(totalPrice);
    totalRow.appendChild(discountedTotalPrice);
    totalRow.appendChild(document.createElement("hr"));
  
    return totalRow;
  }
  
  function updateCartSummary(sumTotal, sumDiscountedTotal, sumTotalProducts, sumTotalQuantity) {
    // document.querySelector(".card-body p:nth-child(1)").innerText = `Total: $${sumTotal.toFixed(2)}`;
    // document.querySelector(".card-body p:nth-child(2)").innerText = `Discounted Total: $${sumDiscountedTotal.toFixed(2)}`;
    // document.querySelector(".card-body p:nth-child(3)").innerText = `Total Products: ${sumTotalProducts}`;
    // document.querySelector(".card-body p:nth-child(4)").innerText = `Total Quantity: ${sumTotalQuantity}`;
    document.getElementById("products").innerHTML = `items: ${sumTotalQuantity}`
    document.getElementById("price").innerHTML = `$${sumTotal.toFixed(2)}`
  }
  async function loadCheckout(){
    document.getElementById("checkout").addEventListener("click", (e) =>{
      e.preventDefault();
      let promo = document.getElementById("form3Examplea2").value
      checkout(promo)
    })
  }  
  async function checkout(promo){
    let response = api.post(`/checkout?promo=${promo}`).then((res) => {alert('Checkout Successful'); window.location.href = "index.html";}).catch((err) => {alert('Checkout Failed')})

  }