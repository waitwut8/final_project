let loadUsername = async function () {
    let username = localStorage.getItem("user_name");
    let topelement = $(".username-title")[0]
    let titleelement = $("#username")[0]

    if (username){

        username = username.slice(0, -1)
        console.log(username)
        topelement.innerHTML = username;
        titleelement.innerHTML = "Hello, " + username;
    }
    else{
        setText(topelement, "Welcome!")
        setText(titleelement, "Welcome!")

    }
}
loadUsername()
async function loadHome() {
    const productsContainer = document.querySelector("#row");
  
    productsContainer.innerHTML = "";
    if (Boolean(localStorage.getItem("logged_in")) != true) {
        let list_of_items = await api.get(`${api_url}/product_noLogin/8`);
        list_of_items = list_of_items.data;
        addCards(list_of_items, productsContainer);
    }
    else{
        let list_of_items = await api.get(`/rec_products`);
        list_of_items = list_of_items.data.slice(0,8);
        console.log(_.flatten(_.values((list_of_items))));
        addCards(_.flatten(_.values((list_of_items))), productsContainer);
    }
    let comment_username = await api.get(`/username`)
    setText(getDoc("comment_username"), comment_username.data[0])
    setText(getDoc("company_roles"), comment_username.data[1])
    listenToNavBar()
    
  }

function listenToNavBar(){
    console.log($(".nav-link").on('click', function(){
        console.log("clicked?")
    }))

}
function hideLogin(){
    if(localStorage.getItem('access_token') && localStorage.getItem('refresh_token')){
        $(".fa-door-open").hide()
    }
}
if (!window.location.href.endsWith("login.html")){
    hideLogin()
}


  function addCards(list_of_items, productsContainer) {
      let carousel_array;
      let isFirst;
      for (const product of list_of_items) {
          var message = "";
          let discounted = 0;
          discounted = product.price * (1 - (product.discountPercentage + 5) / 100);
          discounted = discounted.toFixed(2);
          let ending = "";
          if (product.discountPercentage > 50 && product.discountPercentage < 75) {
              ending = "Hurry up! This is a limited time offer!";
          } else if (
              product.discountPercentage > 75 &&
              product.discountPercentage < 90
          ) {
              ending = "Clearance Sale! Get it before it's gone!";
          }
          message = `${(
              Number(product.discountPercentage) + 5
          ).toFixed()}% off! Save $${(product.price - discounted).toFixed(
              2
          )} ${ending}`;

          let {images} = product;

          carousel_array = [];
          isFirst = false
          for (const i of images) {
              if (!isFirst) {
                  isFirst = true
                  carousel_array.push(`
          <div class="carousel-item active ms-5">
      <img src="${i}" class=" " alt="..." style = "width: 10em" data-bs-interval="2000">
    </div>
          `);
              } else {
                  carousel_array.push(`
          <div class="carousel-item ms-5">
      <img src="${i}" class="  " alt="..." style = "width: 10em" data-bs-interval="2000">
    </div>
          `);
              }

          }



      const productCard = `
                      <div class="col-lg-3 mb-5 border border-black">
                            <div class="carousel slide" id = "${product.id}" data-bs-ride="carousel">
                                
                                <div class = "carousel-inner">
                                    ${carousel_array.toString().replaceAll(",", " ")}
                                    
                                </div>
                                
                            </div>
                                <div class="card-body p-4">
                                    <div class="badge bg-primary bg-gradient rounded-pill mb-2" id = "">$${discounted}</div>
                                    <h5 class="card-title mb-3">${product.title}</h5>
                                    <p class="card-text mb-0">${message}</p>
                                    <div>
                                    <button type = "button" class = "btn btn-outline-secondary" value = "Add to cart">Add to Cart</button>
                                    </div>
                                </div>
                               
                            
                        </div>
                  `;
      productsContainer.insertAdjacentHTML("beforeend", productCard);
    }
  }

  