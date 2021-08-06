let skip = 0;
let limit = 3;
let total = 1;

// Overlay for forms div

// url for API requests
let baseUrl = "http://localhost:3000/api";

const overlay = document.querySelector(".overlay");

overlay.addEventListener("click", (e) => {
  const activeDivs = document.querySelector(".active");
  activeDivs.classList.remove("active");
  overlay.classList.remove("show");
});

// Loading page
// getInsta();

// Show post picture
const addBtn = document.getElementById("add-post");
const postPictureForm = document.getElementById("create");

addBtn.addEventListener("click", (e) => {
  overlay.classList.add("show");
  postPictureForm.classList.add("active");
});

// Create an insta
const instaForm = document.getElementById("post-pic");
const publishBtn = document.getElementById("publish");

publishBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  let instaFormData = new FormData(instaForm);

  let name = instaFormData.get("name");
  let text = instaFormData.get("description");
  let file = document.getElementById("picture");

  let instaNameMsg = document.getElementById("insta-name-msg");
  let instaTextMsg = document.getElementById("insta-text-msg");
  let instaFileMsg = document.getElementById("insta-file-msg");

  if (name.trim() == "") {
    instaNameMsg.innerHTML = "";
    let msg = document.createElement("span");
    msg.textContent = "Name is required!";
    instaNameMsg.appendChild(msg);
  } else {
    instaNameMsg.innerHTML = "";
  }

  if (text.trim("") == "") {
    instaTextMsg.innerHTML = "";
    let msg = document.createElement("span");
    msg.textContent = "A description is required!";
    instaTextMsg.appendChild(msg);
  } else {
    instaTextMsg.innerHTML = "";
  }

  if (file.files.length == 0) {
    instaFileMsg.innerHTML = "";
    let msg = document.createElement("span");
    msg.textContent = "File cannot be empty!";
    instaFileMsg.appendChild(msg);
  } else {
    instaFileMsg.innerHTML = "";
  }

  if (name.trim() !== "" && text.trim() !== "" && file.files.length !== 0) {
    let url = `${baseUrl}/create-insta`;

    try {
      let response = await fetch(url, {
        method: "POST",
        body: instaFormData,
      });

      let data = await response.json();
      if (response.status == 200) {
        instaForm.reset();
        // skip = 0;
        getInsta();
      } else {
        console.log(data);
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }
});

let cards = document.querySelector(".cards");

// Add a comment
async function postComment(id, name, comment) {
  let commentURL = baseUrl + `/comment/${id}`;

  let _body = {
    name,
    comment,
    postId: id,
  };

  let response = await fetch(commentURL, {
    method: "POST",
    body: JSON.stringify(_body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let data = await response.json();
  // console.log(data);
  return data;
}

// Add a like
async function addOneLike(id) {
  let likeURL = baseUrl + `/likes/${id}`;
  let response = await fetch(likeURL, { method: "PUT" });
  let data = await response.json();
  // console.log(data);
  let card = document.getElementById(id);
  let span = card.querySelector(".card__stats span");
  span.textContent = data.insta.meta.likes;
  return;
}

// Add a report
async function reportInsta(id) {
  let likeURL = baseUrl + `/report/${id}`;
  await fetch(likeURL, { method: "PUT" });
  return;
}

// Show post elements
const postCommentForm = document.getElementById("comment");
const allComments = document.getElementById("read");

document.addEventListener("click", (e) => {
  if (e.target.matches("button")) {
    // Add one like from like button
    let parentCard = e.target.closest(".card");
    let dataset = parentCard ? parentCard.id : "";
    if (e.target.getAttribute("class") == "one-like") {
      addOneLike(dataset);
      e.target.classList.add("liked");
      e.target.setAttribute("disabled", "true");
    } else if (e.target.getAttribute("class") == "one-comment") {
      // Show the comment form from comment button
      overlay.classList.add("show");
      postCommentForm.classList.add("active");
      postCommentForm.setAttribute("dataset", dataset);
    } else if (e.target.getAttribute("class") == "one-report") {
      // Report the insta from report button
      reportInsta(dataset);
      // Animate report flag
      e.target.classList.add("flagged");
      e.target.setAttribute("disabled", "true");
    } else if (e.target.getAttribute("class") == "read-more-text") {
      let card = document.getElementById(dataset);
      let cardText = card.querySelector(".card__text");
      let btnState = e.target.getAttribute("state");

      if (btnState === "false") {
        // Open
        cardText.style.maxHeight = "max-content";
        e.target.setAttribute("state", "true");
        e.target.textContent = "..close";
      } else if (btnState === "true") {
        // Close
        cardText.style.maxHeight = "110px";
        e.target.setAttribute("state", "false");
        e.target.textContent = "Read more...";
      }
    }
  } else if (
    e.target.matches("span") &&
    e.target.getAttribute("class") == "author"
  ) {
    // Put comments in comment container
    getComments(e.target.closest(".card").id);

    overlay.classList.add("show");
    allComments.classList.add("active");
  }
});

// Post comment
const leaveCommentForm = document.getElementById("leave-comment");
const commentBtn = document.getElementById("comment-btn");

function isCommentFormValid(id, name, comment) {
  return id && name && comment;
}

commentBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  let formData = new FormData(leaveCommentForm);
  let id = postCommentForm.getAttribute("dataset");
  let name = formData.get("name");
  let comment = formData.get("comment-text");

  let commentNameMsg = document.getElementById("comment-name-msg");
  let commentTextMsg = document.getElementById("comment-text-msg");

  if (name.trim() == "") {
    commentNameMsg.innerHTML = "";
    let msg = document.createElement("span");
    msg.textContent = "Name is required!";
    commentNameMsg.appendChild(msg);
  } else {
    commentNameMsg.innerHTML = "";
  }

  if (comment.trim("") == "") {
    commentTextMsg.innerHTML = "";
    let msg = document.createElement("span");
    msg.textContent = "A comment is required!";
    commentTextMsg.appendChild(msg);
  } else {
    commentTextMsg.innerHTML = "";
  }

  // Validation ofr comment form
  if (isCommentFormValid(id, name, comment)) {
    await postComment(id, name, comment);
    leaveCommentForm.reset();
    return;
  }

  return;
});

// Main load functions
const commentContainer = document.querySelector(".comment-container");

function loadComments(data) {
  commentContainer.innerHTML = "";
  if (data.length > 0) {
    data.forEach((comment) => {
      let commentDiv = document.createElement("div");
      commentDiv.classList.add("comment");
      let author = document.createElement("p");
      author.classList.add("author");
      author.textContent = comment.name;
      let text = document.createElement("p");
      text.textContent = comment.comment;

      commentDiv.appendChild(author);
      commentDiv.appendChild(text);
      commentContainer.appendChild(commentDiv);
    });
  } else {
    let noComment = document.createElement("h3");
    noComment.textContent = "No comments!";

    commentContainer.appendChild(noComment);
  }
}

function putInstaOnPage(data) {
  let photoURL;
  data.forEach((insta) => {
    // Card div to contain everything
    let card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("id", insta._id);

    // Card Image
    let cardImage = document.createElement("div");
    cardImage.classList.add("card__image");
    photoURL = baseUrl + `/photos/${insta.imageURI}`;
    cardImage.style.backgroundImage = `url("${photoURL}")`;

    // Card Stats
    let cardStats = document.createElement("div");
    cardStats.classList.add("card__stats");
    cardStats.innerHTML = `<ul>
    <li><button class="one-like">Like</button></li>
    <li><button class="one-comment">Comment</button></li>
    <li>
      <button class="one-report">
        Report
        <div class="flag">
          <img
            src="./public/images/bookmark-check-fill.svg"
            alt="flag post"
          />
        </div>
      </button>
    </li>
  </ul>
  <p><strong>Likes: </strong><span>${insta.meta.likes}</span></p>`;

    // Card Text
    let cardText = document.createElement("div");
    cardText.classList.add("card__text");

    let author = document.createElement("span");
    author.classList.add("author");
    let text = document.createElement("p");
    author.textContent = insta.author;
    text.textContent = insta.description;

    cardText.appendChild(author);
    cardText.appendChild(text);

    // console.log(insta.description.length);
    // Append everything in order to cards div
    card.appendChild(cardImage);
    card.appendChild(cardStats);
    card.appendChild(cardText);

    // Read more Button
    if (insta.description.length >= 180) {
      let readMoreBtn = document.createElement("button");
      readMoreBtn.classList.add("read-more-text");
      readMoreBtn.setAttribute("state", "false");
      readMoreBtn.textContent = "Read more...";
      card.appendChild(readMoreBtn);
    }

    cards.appendChild(card);
  });
}

// API calls and create elements on page
async function getInsta() {
  let relativeURL = `/insta?limit=${limit}&skip=${skip}`;

  let response = await fetch(baseUrl + relativeURL);
  let allInsta = await response.json();

  skip += allInsta.meta.count || 1;
  total = allInsta.meta.total;

  putInstaOnPage(allInsta.data);
}

async function getComments(id) {
  let getCommentURL = baseUrl + `/comment/${id}`;

  let response = await fetch(getCommentURL);
  let data = await response.json();

  // Put comments on page
  loadComments(data.comments);
}

// Lazy loading all insta
let options = {
  root: null,
  rootMargin: "50px 0px",
  threshold: 0.05,
};

let observer = new IntersectionObserver(lazyLoading, options);
const footer = document.getElementById("footer");
observer.observe(footer);

function lazyLoading(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting && skip <= total) {
      getInsta();
      // console.log("It is");
    }
  });
}
