async function loadPost(id) {
    let post_data = await api.get(`${api_url}/posts/${id}`);
    let post = post_data.data;
    localStorage.setItem("post", JSON.stringify(post));
    window.location.href = "posts.html";
  }
  async function loadPostPage() {
    let post = JSON.parse(localStorage.getItem("post"))[0];
    let postTitle = document.getElementsByClassName("card-title")[0],
      postBody = document.getElementsByClassName("card-text")[0],
      postLikes = document.getElementById("thumbsUpCount"),
      postDislikes = document.getElementById("thumbsDownCount"),
      postviews = document.getElementById("viewsCount");
    postTitle.textContent = post.title;
    postBody.textContent = post.body;
    postLikes.textContent = post["reactions"]["likes"];
    postDislikes.textContent = post.reactions.dislikes;
    postviews.textContent = post.views;
  }
  async function loadPosts() {
    const postContainer = document.querySelector(".row");
    postContainer.innerHTML = "";
    let post_req = await api.get("/posts_noLogin/3");
    let posts = post_req.data;
    for (const post of posts) {
      const productCard = `<div class = "col-4 py-1">
                      <div class="card-group">
    <div class="card">
      
      <div class="card-body">
        <h5 class="card-title">A ${post.tags[0]} story</h5>
        <p class="card-text">${post.title}...</p>
        
        
      </div>
      <div class="card-footer">
        <small class="text-muted" onclick = 'loadPost(${post.id})'">Click here to read more </small>
      
  
    </div>
    </div>
                  `;
      postContainer.insertAdjacentHTML("beforeend", productCard);
    }
  }