const datatable = new DataTable('#userTable');

// Helper function to generate row data
function generateRowHTML(user) {
    return [
        user.id,
        user.username,
        user.email,
        user.role,
        user.active,
        `<div class="mb-3">
            <button type="button" class="btn btn-warning" data-value='${user.id}'>${user.active?"Disable":"Enable"}</button>
            <button type="button" class="btn btn-danger" data-value='${user.id}'>Delete</button>
            
        </div>
<div class = "mb-3">
<button type="button" class="btn btn-primary" data-value='${user.id}'>Promote</button>
            <button type="button" class="btn btn-secondary" data-value='${user.id}'>Demote</button>
</div>`
    ];
}

// Refactored addRow function
function addRow(rowData) {
    datatable.row.add(rowData).draw(false);
}

// Extracted function for handling button actions
function handleDisableClick(event) {
    api.post("/user/disable", {user_id: event.target.dataset.value}).then(
        async (e) => {

            window.location.reload()}
    )
}

function handleDeleteClick(event) {
    api.post("/user/delete", {user_id: event.target.dataset.value}).then(
        async (e) => {
            window.location.reload()
        }
    )
}
function handlePromoteClick(event) {
    api.post("/user/promote", {user_id: event.target.dataset.value}).then(
        async (e) => {
            window.location.reload()
        }
    )
}
function handleDemoteClick(event) {
    api.post("/user/demote", {user_id: event.target.dataset.value}).then(
        async (e) => {
            window.location.reload()
        }
    )
}
// Renamed and cleaned up function to fetch users
async function fetchAllUsers() {
    return await api.get("/user/");
}

async function start() {
    const users = (await fetchAllUsers()).data; // Inline `data` variable

    users.forEach(user => {
        console.log(user);
        addRow(generateRowHTML(user)); // Reuse the helper function for row creation
    });

    // Register event listener after DOM update
    $('.btn-warning').on('click', handleDisableClick);
    $('.btn-danger').on('click', handleDeleteClick);
    $('.btn-primary').on('click', handlePromoteClick);
    $('.btn-secondary').on('click', handleDemoteClick)
}

// Start execution
start()