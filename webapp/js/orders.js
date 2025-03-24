let table = new DataTable('#orders')
function updateStage(id, stage) {
    if (typeof (stage) == "number" && 1 <= stage <= 4) {
        api.post(`/order/change_state/${id}`, {
            'state': stage,
            'order_id': id
        })
        table.rows().remove().draw();
        window.location.reload()


    }
}
async function searchForId(e){
    return api.get(`/product/searchid/${e}`, {'product_id': e});
}


async function counter(arr) {
    const counts = {}; // This will hold the counts
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1; // If item exists, increment; otherwise, start at 1
    });
    

    return counts;
}

async function populate_table() {
    $("#progress-bar").width("0%")
    $("#orders").hide()

        api.get("/order/all").then(async (dataset) => {
            console.log(dataset.data)
            let {data} = dataset

            let i = 0;
            
            
            
            for (const idx of data) {
                items = await counter(idx.items)
                tooltip = ""
                for (const i of Object.keys(items)) {
                    title = (await api.get(`/product/searchid/${i}`, {'product_id': i})).data
                    if (title){
                        title = title.title
                    console.log(title)
                    tooltip += `<tr><td>${_.indexOf(Object.keys(items), i)+1}</td><td>${title}</td><td>${items[i]}</td></tr>`;
                    }
                }


                let username = (await api.post("/user/whothis", {'user_id': idx.user_id})).data;
                if (username != "user does not exist"){
                console.log(username)
                table.row.add(
                    [
                        idx.id,
                        username,
                        `<button class = "btn btn-success" title="${tooltip}" data-bs-toggle="modal" data-bs-target="#a${idx.id}">Click to open</button>
<div class="modal fade" id="a${idx.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Summary of products from order ${idx.id}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <table class="table table-striped">
      <tr>
      <th>No.</th>
      <th>Name</th>
      <th>Quantity</th>
      </tr>
    ${tooltip}
    <tr>
    <td></td>
    <td>Total</td>
    <td>${idx.items.length}</td>
</tr>
</table>
        
      </div>
      <div class="modal-footer">
        
        <button type="button" class="btn btn-success" data-bs-dismiss = "modal">Close</button>
      </div>
    </div>
  </div>
</div>`,
                                                    `<div class="btn-group">
                            <button type="button" class="btn btn-danger">${idx.status}</button>
                            <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 0)">Set to Pending</a></li>
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 1)">Set to Processing</a></li>
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 2)">Set to Completed</a></li>
                                
                                <li><a class="dropdown-item"  onclick = "updateStage('${idx.id}', 3)">Set to Cancelled</a></li>
                            </ul>
                            </div>
                            `,
                        idx.created_at
                    ]
                ).draw(true);


                i += 1;

                

            }
            
            console.log("done")

        }

        
            $("#orders").show()

           
    })

    




    


  


}





