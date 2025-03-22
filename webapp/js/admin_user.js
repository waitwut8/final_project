const datatable = new DataTable('#userTable');

// Helper function to generate row data
function generateRowHTML(user) {

    return [
        `<span class="fw-bold text-muted">${user.id}</span>`,  // User ID in bold with muted color
        `<span class="text-primary">${user.username}</span>`,   // Username with primary text color
        `<span class="text-success">${user.email}</span>`,      // Email in green
        `<span class="badge bg-info text-dark">${user.role}</span>`,  // Role as a badge for extra emphasis
        user.active ? `<span class="badge bg-success">Active</span>` : `<span class="badge bg-danger">Inactive</span>`,  // Active status with badges
        `<div class="action-buttons">
        <div class="btn-group btn-group-sm" role="group">
            <!-- User Status Toggle Button -->
            <button type="button" class="btn btn-warning toggle-status" data-value="${user.id}">
                <i class="fas fa-toggle-${user.active ? 'off' : 'on'}"></i>
                ${user.active ? "Disable" : "Enable"}
            </button>
            
            <!-- Delete Button -->
            <button type="button" class="btn btn-danger delete-user" data-value="${user.id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>

        <div class="btn-group btn-group-sm mt-2" role="group">
            <!-- Promote Button -->
            <button type="button" class="btn btn-primary promote" data-value="${user.id}">
                <i class="fas fa-arrow-up"></i> Promote
            </button>

            <!-- Demote Button -->
            <button type="button" class="btn btn-secondary demote" data-value="${user.id}">
                <i class="fas fa-arrow-down"></i> Demote
            </button>
        </div>
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