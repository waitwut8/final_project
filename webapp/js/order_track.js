
let table = $("#order-table").DataTable()

async function loadOrderTable() {
    let response = (await api.get("/order/")).data
let products = (await api.get("/product/")).data
    table.clear().draw()
    response.forEach(order => {
        console.log(order.items)
        let itemCounts = {};
        order.items.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
        console.log(itemCounts)
        let itemDetails = Object.keys(itemCounts).map(product_id => {
            let product = products.find(p => p.product_id == product_id);
            return `${product.title} (x${itemCounts[product_id]})`;
        }).join(", ");
        let sum = 0
        for (const i of Object.keys(itemCounts)) {
            sum += products.find(p => p.product_id == i).price * itemCounts[i]
        }
        console.log(itemDetails)
        for (const i of Object.keys(itemCounts)) {
            itemDetails += `
            
            `
        }
        order.items = itemDetails;
        console.log(order.items)
        table.row.add([
            order.id,
            String(order.items),
            order.created_at,
            sum.toLocaleString("en-US", {"style":"currency","currency":"USD"}),
            order.status
            
        ]).draw()
    })
}
loadOrderTable()