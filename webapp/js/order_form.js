let table = $("#order-table").DataTable()
/**
 * 
 * @param {Number} id 
 */
async function loadOrderTable(id){
    let data = (await api.get("/order/all")).data
    let products = (await api.get("/product/")).data
    table.clear().draw()
    data = _.filter(data, (order) => order.id == id)
    console.log(data)
    if(data.length == 0){
        $(`#order-message`).removeClass("hidden").addClass("pop-in");

        setTimeout(() => {
            $(`#order-message`).removeClass("pop-in").addClass("fade-out");
        }, 2000);

        $(`#order-message`).removeClass("fade-out").addClass("hidden");
        return;
    }
    data.forEach(order => {
        console.log(order.items)
        let itemCounts = {};
        order.items.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
        console.log(itemCounts)
        let itemDetails = Object.keys(itemCounts).map(product_id => {
            let product = products.find(p => p.product_id == product_id);
            return `<tr><td>${product.title}</td><td>${itemCounts[product_id]}</td></tr>`;
        }).join("");
        let sum = 0
        for (const i of Object.keys(itemCounts)) {
            sum += products.find(p => p.product_id == i).price * itemCounts[i]
        }
        console.log(itemDetails)
        
        order.items = itemDetails;
        console.log(String(order.items).replace(",", "").replace(",", ""))
        table.row.add([
            
            `<table class='table'>
            <thead>
                <tr>
                <th>Name</th>
                <th>Quantity</th>
                </tr>
            </thead>
            
            <tbody>
            
                
                ${order.items}
                
            </tbody>
            </table>`,
            `<span class="badge bg-success">${order.created_at}</span>`,
            `<span class="badge bg-primary">${sum.toLocaleString("en-US", {"style":"currency","currency":"USD"})}</span>`,
            `<span class="badge bg-info">${order.status}</span>`
        ]).draw()
    })
}
$("#order-track-submit").on("click", async function(event){
    event.preventDefault()
    let id = $("#order-track-input").val()
    await loadOrderTable(id)
})