async function loadPage(){
    /** {
     "id": "97d22b8b-b724-4ce1-bf92-b4125a5966be",
     "title": "Essence Mascara Lash Princess",
     "description": "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
     "category": "beauty",
     "price": 9.99,
     "discountPercentage": 7.17,
     "stock": 5,
     "tags": [
     "beauty",
     "mascara"
     ],
     "brand": "Essence",
     "weight": 2,
     "dimensions": {
     "width": 23.17,
     "height": 14.43,
     "depth": 28.01
     },
     "warrantyInformation": "1-month warranty",
     "shippingInformation": "Ships in 1 month",
     "availabilityStatus": "Low Stock",
     "returnPolicy": "30 days return policy",
     "minimumOrderQuantity": 24,
     "images": [
     "assets/images/Essence_Mascara_Lash_Princess_1.png"
     ],
     "thumbnail": "assets/images/Essence_Mascara_Lash_Princess_thumbnail.png"
     }
        */
    let to_search = getAllUrlParams(window.location.href).product_name
    let res = await api.get(`/product/${to_search}`);
    let product = res.data
    let sku = product.id

    let name = product.title
    let description = product.description
    let category = product.category
    let price = product.price * (1-product.discountPercentage/100)
    let dimensions = product.dimensions

    let warranty = product.warrantyInformation
    let shipping = product.shippingInformation
    let images = product.images
    console.log(images)
    let thumbnail = product.thumbnail
    
    
    changeCarousel(images)
    change_content(name, sku, product.price, price, description, dimensions, warranty, shipping)
}
function changeCarousel(images){
    /*
    * <li
                                data-bs-target="#carouselId"
                                data-bs-slide-to="0"
                                class="active"
                                aria-current="true"
                                aria-label="First slide"
                            ></li>
                            <li
                                data-bs-target="#carouselId"
                                data-bs-slide-to="1"
                                aria-label="Second slide"
                            ></li>
                            <li
                                data-bs-target="#carouselId"
                                data-bs-slide-to="2"
                                aria-label="Third slide"
                            ></li>*/
    let target_list;
    target_list = ""
    let first_target = false
    console.log(images
    )

    for (let i = 0; i < images.length; i++) {
        if (!first_target) {
            target_list += `
            <li
                                data-bs-target="#carouselId"
                                data-bs-slide-to="${i}"
                                class="active"
                                aria-current="true"
                                aria-label="${i + 1} slide"
                            ></li>`
            first_target = true
        } else {
            target_list += `<li
                data-bs-target="#carouselId"
                data-bs-slide-to="${i}"
                aria-label="${i} slide"
            ></li>`
        }
    }
    console.log(target_list)
    $(".carousel-indicators")[0].innerHTML = target_list
    /*
    * <div class="carousel-item active">
                                <img
                                    src="holder.js/900x500/auto/#777:#555/text:First slide"
                                    class="w-100 d-block"
                                    alt="First slide"
                                />
                            </div>
                            <div class="carousel-item">
                                <img
                                    src="holder.js/900x500/auto/#666:#444/text:Second slide"
                                    class="w-100 d-block"
                                    alt="Second slide"
                                />
                            </div>
                            <div class="carousel-item">
                                <img
                                    src="holder.js/900x500/auto/#666:#444/text:Third slide"
                                    class="w-100 d-block"
                                    alt="Third slide"
                                />
                            </div>*/
    let first_carousel = false;
    let carousel_html = ""
    console.log(images)
    for (const j of images){
        console.log(j)
        if (!first_carousel) {
            carousel_html += `<div class="carousel-item active">
                                <img
                                    src="${j}"
                                    class="w-100 d-block"
                                    alt="First slide"
                                />
                            </div>`
        }
        else{
            carousel_html += `<div class="carousel-item">
                                <img
                                    src="${j}"
                                    class="w-100 d-block"
                                    alt="Second slide"
                                />
                            </div>`
        }
    }
    console.log(carousel_html)
    $(".carousel-inner")[0].innerHTML = carousel_html
}

function change_content(name, sku, highprice, lowprice, description, dim, warranty, shipping){
    $("#name").text(name)
    $("#id").text(`SKU: ${sku}`)
    $("#highprice").text(`$${highprice}`)
    $("#lowprice").text(`$${lowprice}`)
    $("#description").text(description)
    $("#dimensions").text(`${dim.width}x${dim.height}x${dim.depth}`)
    $("#warranty").text(warranty)
    $("#shipping").text(shipping)

}
function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // set parameter name and value (use 'true' if empty)
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {

                // create key if it doesn't exist
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string'){
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    return obj;
}