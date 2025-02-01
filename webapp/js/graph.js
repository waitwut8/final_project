async function makeGraph(url, ctx, type, title) {
   res = await api.get(url)

            new Chart(ctx, {
                type: type,
                data: {
                    labels: res.data[0],
                    datasets: [{
                        label: title,
                        data: res.data[1],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            })
            console.log(res.data[2], title)
            localStorage.setItem(title, res.data[2])
            return res

        
    

}










