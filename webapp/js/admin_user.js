const datatable = new DataTable('#userTable');
function dismissModal() {
    console.log("Modal dismissed")
    const modal = $(document.querySelector('.modal'));
    if (modal) {
        modal.hide(); // Hide the modal if it exists
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove(); // Remove the backdrop if it exists
    }
    window.location.reload(); // Reload the page to reflect changes

}
// Helper function to generate row data
function generateRowHTML(user) {

    return [
        `<span class="fw-bold text-muted">${user.id}</span>`,  // User ID in bold with muted color
        `<span class="text-primary">${user.username}</span>`,   // Username with primary text color
        `<span class="text-success">${user.email}</span>`,      // Email in green
        `<span class="badge bg-info text-dark">${user.role}</span>`,  // Role as a badge for extra emphasis
        user.active ? `<span class="badge bg-success">Active</span>` : `<span class="badge bg-danger">Inactive</span>`,  // Active status with badges
        `<div class="action-buttons">
        <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#edit-modal-${user.id}">
            Edit
        </button>

        <!-- Modal -->
        <div class="modal fade" id="edit-modal-${user.id}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Edit Profile</h5>
                        <button type="button" class="btn-close"  aria-label="Close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                    <form id="edit-profile-form-${user.id}">
                            <div class="mb-3">
                                <label for="username-${user.id}" class="form-label">Username</label>
                                <input type="text" class="form-control" id="username-${user.id}" value="${user.username}">
                            </div>
                            <div class="mb-3">
                                <label for="email-${user.id}" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email-${user.id}" value="${user.email}">
                            </div>
                            <div class="mb-3">
                                <label for="first-name-${user.id}" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="first-name-${user.id}" value="${user.first_name || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="last-name-${user.id}" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="last-name-${user.id}" value="${user.last_name || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="role-${user.id}" class="form-label">Role</label>
                                <select class="form-select" id="role-${user.id}">
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                    <option value="guest" ${user.role === 'guest' ? 'selected' : ''}>Guest</option>
                                </select>
                            </div>
                            
                                
                        </form>
                    </div>
                    <div class="modal-footer">
                    <!-- User Status Toggle Button -->
                                <button type="button" class="btn btn-warning toggle-status" data-value="${user.id}" >
                                    <i class="fas fa-toggle-${user.active ? 'off' : 'on'}"></i>
                                    ${user.active ? "Disable" : "Enable"}
                                </button>

                                <!-- Delete Button -->
                                <button type="button" class="btn btn-danger delete-user" data-value="${user.id}" >
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            
                            
                                <!-- Promote Button -->
                                <button type="button" class="btn btn-primary promote" data-value="${user.id}" >
                                    <i class="fas fa-arrow-up"></i> Promote
                                </button>

                                <!-- Demote Button -->
                                <button type="button" class="btn btn-secondary demote" data-value="${user.id}" >
                                    <i class="fas fa-arrow-down"></i> Demote
                                </button>
                            
                            <button type="button" class="btn btn-success save-profile" data-value="${user.id}" >
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        <button type="button" class="btn btn-secondary" >Close</button>
                    </div>
                </div>
            </div>
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
            dismissModal(); // Dismiss the modal after action
            datatable.clear().draw(); // Redraw the table to reflect changes
    start_noClick(); }
    )
}

function handleDeleteClick(event) {
    api.post("/user/delete", {user_id: event.target.dataset.value}).then(
        async (e) => {
            dismissModal(); // Dismiss the modal after action
            datatable.clear().draw(); // Redraw the table to reflect changes
    start_noClick(); 
        }
    )
}
function handlePromoteClick(event) {
    api.post("/user/promote", {user_id: event.target.dataset.value}).then(
        async (e) => {
            dismissModal(); // Dismiss the modal after action
            datatable.clear().draw(); // Redraw the table to reflect changes
    start_noClick(); 
        }
    )
}
function handleDemoteClick(event) {
    api.post("/user/demote", {user_id: event.target.dataset.value}).then(
        async (e) => {
            dismissModal(); // Dismiss the modal after action
            datatable.clear().draw(); // Redraw the table to reflect changes
    start_noClick(); 
        }
    )
}
function handleSaveClick(event) {
    console.log(event)
    const userId = event.target.dataset.value; // Get user ID from the button's data attribute
    console.log(userId)
    const username = document.getElementById(`username-${userId}`).value;
    const email = document.getElementById(`email-${userId}`).value;
    const role = document.getElementById(`role-${userId}`).value;
    const first_name = document.getElementById(`first-name-${userId}`).value;
    const last_name = document.getElementById(`last-name-${userId}`).value;

    api.post("/user/edit_user", {'user_id': userId, 'requested_user': {'email': email, 'username': username, 'role': role, 'first_name': first_name, 'lastName': last_name}})
    dismissModal(); // Dismiss the modal after action
    datatable.clear().draw(); // Redraw the table to reflect changes
    start_noClick(); // Call the function to fetch and display users again
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
    $('.btn-success').on('click', handleSaveClick);
}
async function start_noClick(){
    const users = (await fetchAllUsers()).data; // Inline `data` variable

    users.forEach(user => {
        console.log(user);
        addRow(generateRowHTML(user)); // Reuse the helper function for row creation
    });


}

// Start execution
start()