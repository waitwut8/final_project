function addProductRow(list) {
    table.row.add(list).draw();
}

function loadProducts() {
    api.get("/product/").then(async (res) => {
        for (const item of res.data) {
            console.log(`
            <div><img href = '${item.thumbnail.replaceAll("\"", "")}'></div>`)

            addProductRow([`
            <div><img src = ${item.thumbnail}></div>`, item.product_id, item.title, "$" + item.price, item.stock, `
            
            <!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#${item.product_id}">
  Edit Product
</button>

<!-- Modal -->
<div class="modal fade w-100" id="${item.product_id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">  
      <div>
        <input type = "hidden" value = "${item.product_id}" id = "productId" class = "product_id">
        <img src = ${item.thumbnail}>
        </div>
        <div  class = "mx-3">
        <label for = "productName" class = "form-label">Name</label>
        <input type = "text" value = "${item.title}" id = "productName" class = "form-control product_name" disabled>
        </div>
        <br>
        <div  class = "mx-3">
        <label for = "productPrice" class = "form-label">Description</label>
        <textarea id="productDescription" class="form-control product_description" rows="4">${item.description}</textarea>
        </div>
        <div  class = "mx-3">
        <label for = "productName" class = "form-label">Stock</label>
        <input type = "text" value = "${item.stock}" id = "${item.stock}" class = "form-control product_stock" disabled>
        
        </div>
        <div  class = "mx-3">
        <label for = "productName" class = "form-label">Price</label>
        <input type = "text" value = "$${item.price}" id = "${item.price}" class = "form-control product_price">
        
        </div>
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary submitting" onclick = "handleEdit()">Save changes</button>
      </div>
    </div>
  </div>
</div>
            `])


        }
    })
}

async function edit(data) {
    let public_data = (await api.get("/imagekit_public")).data
    let imagekit = new ImageKit({
        publicKey: public_data[0], urlEndpoint: public_data[1],


    });

    data = (await api.get("/imagekit_auth")).data
    let token = data.token, expiration = data.expire, signature = data.signature;


    let file = document.getElementById("file1");
    await imagekit.upload({
        file: file.files[0],
        fileName: `profile-${$("#inputUsername").val()}`,
        folder: "profiles",
        tags: ["tag1"],
        token: token,
        signature: signature,
        expire: expiration,
    }, function (err, result) {
        console.log(err);
        console.log(result);
        localStorage.setItem('url', JSON.stringify(result.url));

        editProduct({
            'product_id': $(".product_id").val(),
            'title': $(".product_name").val(),
            'price': $(".product_price").val(),
            'stock': $(".product_stock").val(),
            'thumbnail': localStorage.getItem('url'),
            'tags': [],
            'description': $('#productDescription').val().replaceAll('\n', ''),
            'images': [],
        })
    })

}

async function editProduct(data) {
    api.post("http://127.0.0.1:8000/product/update", data)
}

async function handleEdit() {

    await editProduct({
        'product_id': $(".product_id").val(),
        'title': $(".product_name").val(),
        'price': $(".product_price").val(),
        'stock': $(".product_stock").val(),
        'thumbnail': "",
        'tags': [],
        'description': $('#productDescription').val().replaceAll('\n', ''),
        'images': [],
    })
    localStorage.removeItem('url')

}

let table = $("#table").DataTable();


loadProducts()
///////////////////////////////////////////////////////

async function uploadNewImage(id, name){
    let public_data = (await api.get("/imagekit_public")).data
    let imagekit = new ImageKit({
        publicKey: public_data[0], urlEndpoint: public_data[1],


    });

    data = (await api.get("/imagekit_auth")).data
    let token = data.token, expiration = data.expire, signature = data.signature;
    let identifier = `#${id}`
    await imagekit.upload({
        file: $(identifier)[0].files[0],
        fileName: `product-${name}`,
        folder: "products",
        tags: ["tag1"],
        token: token,
        signature: signature,
        expire: expiration,
    }, function (err, result) {
        sessionStorage.setItem('url', JSON.stringify(result.url));
    })
}
async function handleAdd(){
    let id = (await api.get("/product/next-id")).data
    await uploadNewImage("file1", $("#addproductName").val())
    await addProduct(
        {
            // product_id: '9999',
            title: $("#addproductName").val(),
            description: $("#addproductDescription").val(),
            price: $("#addproductPrice").val(),
            stock: $("#addproductStock").val(),
            thumbnail: sessionStorage.getItem('url'),
            tags: [],
            images: [],
            brand: '',

        }
    )
}

async function addProduct(data){
    api.post("/product/add", data)
}
$("#saveProductBtn").click(function () {
    handleAdd().then((res) => {window.location.reload();})

})
function handleDelete(){

}
















