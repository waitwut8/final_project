function updateStage(id, stage) {
    if (typeof (stage) == "number" && 1 <= stage <= 4) {
        api.post(`/update_order_stage?order_id=${id}&stage=${stage}`)
        location.reload()
    }
}

function populate_table() {
    $("#progress-bar").width("0%")
    $("#orders").hide()

        api.get("/get_orders").then(async (dataset) => {
            console.log(dataset.data)
            let data = dataset.data
            let table = new DataTable('#orders')
            let i = 0;
            
            
            
            for (const idx of data) {




                //     $("#orders").append(`
                //     <tr>
                //     <td>${idx.id}</td>
                //     <td>${idx.userId}</td>
                //     <td>${idx.products.length}</td>
                //     <td>${idx.progress}</td>
                //     <td>${idx.created_at}</td>
                //     </tr>
                //
                // `);
                table.row.add(
                    [
                        idx.id,
                        idx.userId,
                        idx.products.length,
                                                    `<div class="btn-group">
                            <button type="button" class="btn btn-danger">${idx.progress}</button>
                            <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 1)">Set to Processing</a></li>
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 2)">Set to Delivery Warehouse</a></li>
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 3)">Set to On The Way</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 4)">Set to Delivered</a></li>
                            </ul>
                            </div>
                            `,
                        idx.created_at
                    ]
                ).draw(true);

                i += 1;
                

            }
            
            console.log("done")



        
            $("#orders").show()

           
    })

    




    


  


}





