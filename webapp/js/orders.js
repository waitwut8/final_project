let table = new DataTable('#orders');

// Make `counter` synchronous – it's just counting.
function counter(arr) {
    return arr.reduce((counts, item) => {
        counts[item] = (counts[item] || 0) + 1;
        return counts;
    }, {});
}

async function updateStage(id, stage) {
    if (typeof stage === "number" && stage >= 0 && stage <= 3) {
        try {
            await api.post(`/order/change_state/${id}`, {
                state: stage,
                order_id: id
            });
            await populate_table();  // Refresh data, not whole page!
        } catch (err) {
            console.error("Failed to update order state:", err);
        }
    } else {
        console.warn("Invalid stage value:", stage);
    }
}

async function searchForId(productId) {
    try {
        const res = await api.get(`/product/searchid/${productId}`);
        return res.data;
    } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        return null;
    }
}

async function populate_table() {
    $("#progress-bar").width("0%");
    $("#orders").hide();
    table.clear().draw();

    try {
        const { data: orders } = await api.get("/order/all");
        for (const order of orders) {
            const itemCounts = counter(order.items);
            let tooltip = "";
            let index = 1;

            // Avoid multiple await calls: parallelize product title lookups
            const productPromises = Object.keys(itemCounts).map(id => searchForId(id));
            const productTitles = await Promise.all(productPromises);

            for (let i = 0; i < productTitles.length; i++) {
                const product = productTitles[i];
                if (product && product.title) {
                    tooltip += `<tr>
                        <td>${index++}</td>
                        <td>${product.title}</td>
                        <td>${itemCounts[Object.keys(itemCounts)[i]]}</td>
                    </tr>`;
                }
            }

            const username = await api.post("/user/whothis", { user_id: order.user_id })
    .then(res => res.data)
    .catch(err => {
        console.warn(`Failed to fetch user ${order.user_id}:`, err);
        return "user does not exist";
    });

if (username === "user does not exist") {
    console.warn(`Skipping order #${order.id} — user ${order.user_id} doesn't exist.`);
    continue; // Skip this order entirely
}

            const modalId = `a${order.id}`;

            const modalHTML = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="${modalId}-label">Summary of order #${order.id}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <table class="table table-striped">
                                    <tr><th>#</th><th>Name</th><th>Qty</th></tr>
                                    ${tooltip}
                                    <tr><td></td><td><strong>Total</strong></td><td>${order.items.length}</td></tr>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-success" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>`;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const statusDropdown = `
                <div class="btn-group">
                    <button type="button" class="btn btn-danger">${order.status}</button>
                    <button type="button" class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" onclick="updateStage('${order.id}', 0)">Set to Pending</a></li>
                        <li><a class="dropdown-item" onclick="updateStage('${order.id}', 1)">Set to Processing</a></li>
                        <li><a class="dropdown-item" onclick="updateStage('${order.id}', 2)">Set to Completed</a></li>
                        <li><a class="dropdown-item" onclick="updateStage('${order.id}', 3)">Set to Cancelled</a></li>
                    </ul>
                </div>`;

            table.row.add([
                order.id,
                username !== "user does not exist" ? username : "👻 Ghost User",
                `<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#${modalId}">Open</button>`,
                statusDropdown,
                order.created_at
            ]).draw(false);
        }

        $("#orders").show();
    } catch (err) {
        console.error("Failed to populate table:", err);
    }
}
