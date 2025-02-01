makeGraph("/top_products", getDoc("mostSold"), 'bar', 'Products Sold')
const fmter = new Intl.NumberFormat(
    'en-US', {
        style: 'currency',
        currency: 'USD'

    }
)


makeGraph("/revenue_over_time", getDoc("revenue"), 'line', 'Gross Revenue').then(()=>{
    var revenue = (`<p>${fmter.format(Number(localStorage.getItem('Gross Revenue')).toFixed(2))} USD</p>`)
    $("#rev")[0].innerHTML=(revenue)
})
console.log(localStorage.getItem('Gross Revenue'))
makeGraph("/orders_over_time", getDoc('orders'), 'line', 'Orders Placed').then(()=>{
    setText(getDoc('order'), localStorage.getItem('Orders Placed'))})
makeGraph("/products_over_time", getDoc('productsSold'), 'line', 'Sold').then(()=>{
    setText(getDoc('shipped_p'), localStorage.getItem('Sold'))
})

