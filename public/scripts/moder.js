const postLink = document.getElementById('postLink');
const profileName = document.getElementById('profileName');
const profileLink = document.getElementById('profileLink');
const contentBlock2 = document.getElementById('content');
const addButton = document.getElementById('addLink');

fetch('/getUserName')
    .then(response => response.json())
    .then(user => {
        const usernameDisplay = document.getElementById('usernameDisplay');
        usernameDisplay.innerText = `${user.username}`;
    })
    .catch(error => console.error('Error:', error));

fetch('/profile')
        .then(response => response.json())
        .then(user => {
            contentBlock2.innerHTML =   `<div class="user-content">
                                            <div class="user-photo">
                                                <img src="materials/backrotate (2).gif">
                                            </div>
                                            <div class="user-info">
                                                <h2>${user.username}'s Profile</h2>
                                                <p>Email: ${user.email}</p>
                                                <p>Role: ${user.role}</p>
                                            </div>
                                        </div>`;
        })
    .catch(error => console.error('Error fetching profile:', error));


function profileLinkClick(event) {
    event.preventDefault();
    postLink.classList.remove('active');
    event.target.classList.add('active');
    fetch('/profile')
        .then(response => response.json())
        .then(user => {
            contentBlock2.innerHTML =   `<div class="user-content">
                                            <div class="user-photo">
                                                <img src="materials/backrotate (2).gif">
                                            </div>
                                            <div class="user-info">
                                                <h2>${user.username}'s Profile</h2>
                                                <p>Email: ${user.email}</p>
                                                <p>Role: ${user.role}</p>
                                            </div>
                                        </div>`;
        })
    .catch(error => console.error('Error fetching profile:', error));
}

function postLinkClick(event) {
    event.preventDefault();
    profileLink.classList.remove('active');
    event.target.classList.add('active');
    const addPost = document.createElement("a")
    fetch('/post/posts')
        .then(response => response.json())
        .then(posts => {
            if (contentBlock2) {
                contentBlock2.innerHTML = '';
                const contentBlock = document.createElement('div')
                contentBlock.classList.add('content-block')
                posts.forEach(post => {
                    contentBlock.innerHTML += ` <div class="post-block">
                                                    <h3>${post.title}</h3>
                                                    <p>${post.description}</p>
                                                    <div class="post-btn-container">
                                                        <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
                                                        <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                                                    </div>
                                                </div>`;
                    contentBlock2.appendChild(contentBlock)
                  });
            } else {
                console.error('Error: postContent element not found');
            }
        })
    .catch(error => console.error('Error fetching posts:', error))
}


function addLinkClick (event) {
    event.preventDefault()
    const newTitle = prompt("Enter title: ")
    const newDescription = prompt("Enter description: ")
    if(newTitle !== null && newDescription !== null) {
        fetch("/post/addpost", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTitle, description: newDescription}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        })
        .then(newPost => {
            console.log('Post added successfully:', newPost);
        })

    }

}

const menuBtn = document.querySelector(".menu-toggle-btn");
const sidebar = document.querySelector("aside");
const container = document.querySelector(".container");
const closeBtn = document.getElementById('close-btn');

closeBtn.addEventListener('click', function(event){
    event.preventDefault();
    sidebar.style.display = "none";
})

menuBtn.addEventListener('click', function(event){
    event.preventDefault();
    sidebar.style.display = "block";
})

addButton.addEventListener('click', addLinkClick);
profileName.addEventListener('click', profileLinkClick);
profileLink.addEventListener('click', profileLinkClick);
postLink.addEventListener('click', postLinkClick);

async function editPost(postId) {
    const newTitle = prompt('Enter new title:');
    const newDescription = prompt('Enter new description:');
    console.log('Edit post clicked', postId);
    if (newTitle !== null && newDescription !== null) {
        fetch(`/post/posts/${postId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: newTitle, description: newDescription}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
        })
        .then(updatedPost => {
            console.log('Post updated successfully:', updatedPost);
        })
    }
}

async function deletePost(postId) {
    try {
        const confirmDelete = confirm('Are you sure you want to delete this post?');
        if (confirmDelete) {
            const deleteResponse = await fetch(`/post/posts/${postId}`, {
                method: 'DELETE',
            });
            if (deleteResponse.ok) {
            } else {
                console.error(`Error deleting user with ID ${postId}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}