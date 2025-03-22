// SDK Initialization and Configurations: Getting ImageKit to do the heavy lifting.
async function initializeImageKit() {
    try {
        const ress = await api.get("/imagekit_public");
        const datas = ress.data;
        return new ImageKit({
            publicKey: datas[0],
            urlEndpoint: datas[1]
        });
    } catch (error) {
        console.error("Error initializing ImageKit:", error);
        alert("Error initializing image upload. Please try again later.");
    }
}

// Upload Profile Picture: Time to upload that shiny profile pic of yours. No turning back now.
async function upload() {
    try {
        // Get ImageKit authentication details. Yes, we’re asking for permission to upload.
        const res = await api.get("/imagekit_auth");
        const { token, expire: expiration, signature } = res.data;

        // Initialize ImageKit because we need it to actually do stuff.
        const imagekit = await initializeImageKit();
        const fileInput = document.getElementById("file1");

        if (fileInput.files.length === 0) {
            alert("Please select an image to upload.");
            return;
        }

        // You clicked "Upload"? Hold tight, we're about to upload!
        $("#upload").text("Uploading...").prop("disabled", true);

        // Upload the image to ImageKit
        await imagekit.upload({
            file: fileInput.files[0],
            fileName: `profile-${$("#inputUsername").val()}`,
            folder: "profiles",
            tags: ["profile-pic"],
            token,
            signature,
            expire: expiration,
        }, async function (err, result) {
            if (err) {
                console.error("Upload Error:", err);
                alert("Image upload failed. Please try again.");
                $("#upload").text("Upload").prop("disabled", false);
                return;
            }
            console.log("Upload Success:", result);

            // Save the new profile image URL. Go ahead, show off that new look.
            await api.post("/user/change_profile_pic", { 'url': result.url });

            // Update the profile image on the page, because we’re all about instant gratification.
            $("#image").attr('src', result.url);
            alert("Profile picture updated successfully!");

            // Reset the button text, because we’re done now.
            $("#upload").text("Upload").prop("disabled", false);
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        alert("An unexpected error occurred. Please try again later.");
        $("#upload").text("Upload").prop("disabled", false);
    }
}

// Fetch and Display User Profile Data: Bring out the big guns.
async function start_profile() {
    try {
        const res = await api.get("/user/whoami");
        const profile = res.data;

        // Populate the form with existing profile data. You know, just in case you forgot.
        $("#inputUsername").val(profile.username);
        $("#inputEmail").val(profile.email);
        $("#inputFirst").val(profile.first_name);
        $("#inputLast").val(profile.last_name);

        // Get the profile picture because... duh.
        const image = (await api.get("/user/get_profile_pic")).data;
        $("#image").attr('src', image);

    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Error loading profile information. Please refresh the page.");
    }
}

// Edit and Save Profile Information: Make those changes and save them. No regrets.
async function edit_profile() {
    try {
        const username = $("#inputUsername").val();
        const email = $("#inputEmail").val();
        const firstName = $("#inputFirst").val();
        const lastName = $("#inputLast").val();

        // Show that you’re doing something, so let's disable the save button.
        $("#save").text("Saving...").prop("disabled", true);

        const res = await api.post("/user/edit_profile", {
            username,
            email,
            first_name: firstName,
            last_name: lastName,
        });

        if (res.status === 200) {
            alert("Profile updated successfully!");
        } else {
            alert("Error updating profile. Please try again.");
        }
        $("#save").text("Save Changes").prop("disabled", false);

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("An unexpected error occurred. Please try again later.");
        $("#save").text("Save Changes").prop("disabled", false);
    }
}

// Event Listeners and Startup Initialization: Everything starts here. The show is about to begin.
function startup() {
    start_profile();

    // Attach event listeners to buttons. Because interaction is everything.
    $("#upload").on("click", function () {
        upload();
    });

    $("#save").on("click", function () {
        edit_profile();
    });
}

// Change Password: Because who doesn’t need to change their password now and then?
function change_password() {
    const newPassword = $('#newPassword').val();
    const confirmNewPassword = $('#confirmNewPassword').val();

    if (newPassword !== confirmNewPassword) {
        alert("Passwords do not match!");
    } else {
        api.post("/user/change_password", { "password": newPassword });
    }
}

// Password Change Event Listener: When you’re ready to change that password.
$('#changePassword').on('click', function (e) {
    e.preventDefault();
    change_password();
});

// Kickstart the process. It's all happening.
startup();
