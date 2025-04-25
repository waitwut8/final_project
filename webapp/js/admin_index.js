makeGraph("/analytics/get_top_products", getDoc("mostSold"), 'bar', 'Products Sold')
const fmter = new Intl.NumberFormat(
    'en-US', {
        style: 'currency',
        currency: 'USD'

    }
)


makeGraph("/analytics/get_revenue_over_time", getDoc("revenue"), 'line', 'Gross Revenue').then(()=>{
    let revenue = (`<p>${fmter.format(Number(localStorage.getItem('Gross Revenue')).toFixed(2))} USD</p>`)
    $("#rev")[0].innerHTML=(revenue)
})
makeGraph("/analytics/get_orders_over_time", getDoc("orders"), 'line', 'Orders made').then(()=>{
    let revenue = (`<p>${fmter.format(Number(localStorage.getItem('Gross Revenue')).toFixed(2))} USD</p>`)
    $("#rev")[0].innerHTML=(revenue)
})
makeGraph("/analytics/get_products_over_time", getDoc("productsSold"), 'line', 'Products sold').then(()=>{
    let revenue = (`<p>${fmter.format(Number(localStorage.getItem('Gross Revenue')).toFixed(2))} USD</p>`)
    $("#rev")[0].innerHTML=(revenue)
})


