// Adding a product row to the table. Simple, just add it and draw.
function addProductRow(list) {
    table.row.add(list).draw();
}

// Upload handler. You thought it was going to be a quick job? Think again.
async function upload() {
    try {
        // Get ImageKit authentication details. Without this, nothing happens.
        const res = await api.get("/imagekit_auth");
        const { token, expire: expiration, signature } = res.data;

        // Initialize ImageKit because we don't just use plain image uploads.
        const imagekit = await initializeImageKit();
        const fileInput = document.getElementById("file1");

        // Make sure the user actually selected a file. Seriously.
        if (fileInput.files.length === 0) {
            alert("Please select an image to upload.");
            return;
        }

        // Start uploading... slow and steady wins the race (hopefully)
        await imagekit.upload({
            file: fileInput.files[0],
            fileName: `profile-${$("#inputUsername").val()}`,
            folder: "profiles",
            tags: ["profile-pic"],
            token,
            signature,
            expire: expiration,
        }, async function (err, result) {
            if (err) {
                console.error("Upload Error:", err);
                alert("Image upload failed. Please try again.");
                $("#upload").text("Upload").prop("disabled", false);
                return;
            }
            console.log("Upload Success:", result);

            // Save the URL of the new profile picture. This isn’t a hobby, it’s a mission.
            await api.post("/user/change_profile_pic", {
                'url': result.url
            });

            // Update the profile image on the page with the new URL. Instant gratification.
            $("#image").attr('src', result.url);

            // Reset the button text. It was never that serious anyway.
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        alert("An unexpected error occurred. Please try again later.");
        $("#upload").text("Upload").prop("disabled", false);
    }
}

// Load products from the API and render them like a champ.
function loadProducts() {
    api.get("/product/").then(async (res) => {
        for (const item of res.data) {
            

            // Add product details to the table row. Super smooth.
            addProductRow([`
    <div style="text-align: center;">
        <img src="${item.thumbnail.replace("\"", "")}" style="max-width: 100px; height: auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
    </div>`,
                item.product_id,
                `<div style="font-weight: bold; color: #343a40;">${item.title}</div>`,
                `<div style="font-weight: bold; color: #343a40;">${item.description}</div>`,
                `<div style="font-size: 1.1rem; color: #28a745; font-weight: bold;">$${item.price}</div>`,
                `<div style="font-size: 1rem; color: #007bff; font-weight: bold;">${item.stock}</div>`,
                `
    <!-- Button to edit product details in a modal -->
    <button type="button" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#${item.product_id}">
        <i class="bi bi-pencil-square"></i> Edit Product
    </button>
    <button type="button" class="btn btn-danger btn-sm" style="margin-left: 10px;" onclick = "handleDelete(${item.product_id})">
        <i class="bi bi-trash"></i> Delete
    </button>
    <!-- Modal content to edit the product details -->
    <div class="modal fade w-100" id="${item.product_id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Edit product</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div>
                        <input type="hidden" value="${item.product_id}" id="productId" class="product_id">
                        <img src="${item.thumbnail}" id="image" style="max-width: 100px; border-radius: 8px; margin-bottom: 15px;">
                        <div class="mb-3">
                            <label for="formFile" class="form-label">Change file</label>
                            <input class="form-control" type="file" id="file1">
                        </div>
                    </div>
                    <div class="mx-3">
                        <label for="productName" class="form-label">Name</label>
                        <input type="text" value="${item.title}" id="productName" class="form-control product_name" disabled>
                    </div>
                    <br>
                    <div class="mx-3">
                        <label for="productPrice" class="form-label">Description</label>
                        <textarea id="productDescription" class="form-control product_description" rows="4">${item.description}</textarea>
                    </div>
                    <div class="mx-3">
                        <label for="productStock" class="form-label">Stock</label>
                        <input type="text" value="${item.stock}" id="productStock" class="form-control product_stock" disabled>
                    </div>
                    <div class="mx-3">
                        <label for="productPrice" class="form-label">Price</label>
                        <input type="text" value="$${item.price}" id="productPrice" class="form-control product_price">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary submitting" onclick="handleEdit()">Save changes</button>
                </div>
            </div>
        </div>
    </div>
    `]
            );
        }
    });
}

// Edit handler. This will let you upload a new profile picture, or just edit details.
async function edit(data) {
    // Get the public data for ImageKit
    let public_data = (await api.get("/imagekit_public")).data;
    let imagekit = new ImageKit({
        publicKey: public_data[0], urlEndpoint: public_data[1],
    });

    data = (await api.get("/imagekit_auth")).data;
    let { token, expire: expiration, signature } = data;

    
    if (file.files.length > 0) {
        console.log("Uploading image...");
        await imagekit.upload({
            file: document.getElementById("file1").files[0],
            fileName: `profile-${$("#inputUsername").val()}`,
            folder: "profiles",
            tags: ["tag1"],
            token,
            signature,
            expire: expiration,
        }, function (err, result) {
            if (err) {
                console.error("Upload error:", err);
            }
            console.log(result);
            localStorage.setItem('url', JSON.stringify(result.url));

            // Now edit the product with the new image URL
            editProduct({
                'product_id': $(".product_id").val(),
                'title': $(".product_name").val(),
                'price': $(".product_price").val(),
                'stock': $(".product_stock").val(),
                'thumbnail': localStorage.getItem('url'),
                'tags': [],
                'description': $('#productDescription').val().replaceAll('\n', ''),
                'images': [],
            });

            // Reload the page like nothing happened.
            
        });
    } else {
        // No image file, just update the product as is.
        editProduct({
            'product_id': $(".product_id").val(),
            'title': $(".product_name").val(),
            'price': $(".product_price").val(),
            'stock': $(".product_stock").val(),
            'thumbnail': '',
            'tags': [],
            'description': $('#productDescription').val().replaceAll('\n', ''),
            'images': [],
        });
        
    }
}

// Send updated product data to the server. Easy, right?
async function editProduct(data) {
    api.post("http://127.0.0.1:8000/product/update", data);
}

// Handle the edit button click. Who’s ready for changes?
async function handleEdit() {
    edit();
   
}

// Initialize the DataTable because... we like smooth tables.
let table = $("#table").DataTable();

// Load the products, so we have something to look at.
loadProducts();

// Upload new product image logic. Uploading is the real fun part.
async function uploadNewImage( name) {
    let public_data = (await api.get("/imagekit_public")).data;
    let imagekit = new ImageKit({
        publicKey: public_data[0], urlEndpoint: public_data[1],
    });

    data = (await api.get("/imagekit_auth")).data;
    let { token, expire: expiration, signature } = data;
    let identifier = `#file1`;
    if ($("#file2")[0].files.length > 0) {
        alert("uploading...")
        await imagekit.upload({
            file: $("#file2")[0].files[0],
            fileName: `product-${name}`,
            folder: "products",
            tags: ["tag1"],
            token,
            signature,
            expire: expiration,
        }, function (err, result) {
            console.log(err, result)
            sessionStorage.setItem('url', JSON.stringify(result.url));
        });
        alert("finished uploading")
    }
    
}

// Handle adding a product after uploading its image.
async function handleAdd() {

    let id = (await api.get("/product/next-id")).data;
    await uploadNewImage($("#addproductName").val());
    console.log({
        title: $("#addproductName").val(),
        description: $("#addproductDescription").val(),
        price: $("#addproductPrice").val(),
        stock: $("#addproductStock").val(),
        thumbnail: sessionStorage.getItem('url'),
        tags: [],
        images: [],
        brand: '',
    })
    await addProduct({
        title: $("#addproductName").val(),
        description: $("#addproductDescription").val(),
        price: $("#addproductPrice").val(),
        stock: $("#addproductStock").val(),
        thumbnail: sessionStorage.getItem('url'),
        tags: [],
        images: [],
        brand: '',
    });
    window.location.reload();
}

// Add a product to the server. Because, why not?
async function addProduct(data) {
    api.post("/product/add", data);
}

// Save the new product when the button is clicked. Boom, done.
$("#saveProductBtn").on("click", function () {
    handleAdd().then(() => { 
        table.clear().draw();
        window.location.reload();
    });
});

// Placeholder for future delete logic.
function handleDelete(id) {
    // Coming soon: Delete product functionality.
    api.delete("/product/delete/"+id, {'product_id':id});
    window.location.reload();
    // window.location.reload();
}
