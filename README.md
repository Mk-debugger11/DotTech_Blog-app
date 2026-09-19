# DotTech Backend API Documentation

Welcome to the backend API documentation for **DotTech**. This document lists all the available endpoints you can use to interact with the backend, explained in simple language.

---

## 🔐 Authentication & Users API

Endpoints for user accounts, logging in, and profiles.

* **`POST /users/`** 
  * **What it does:** Sign up a new user. Send email, password, and name.
* **`POST /blogs/login/`**
  * **What it does:** Log in to your account. Send your email and password to receive your JWT access and refresh tokens.
* **`POST /api/token/refresh/`**
  * **What it does:** Refreshes an expired access token so you don't have to log in again.
* **`GET /users/userProfile/`**
  * **What it does:** View the profile of the currently logged-in user.
* **`PUT /users/userProfile/`**
  * **What it does:** Update the profile of the currently logged-in user (like adding a bio, avatar, or social links).
* **`GET /users/<id>/profile/`**
  * **What it does:** View the public profile of another user by their ID.
* **`POST /users/<id>/follow/`**
  * **What it does:** Follow or unfollow another user. It acts as a toggle.
* **`GET /users/<id>/blogs/`**
  * **What it does:** Get a list of all blog posts written by a specific user.
* **`GET /users/<id>/bookmarks/`**
  * **What it does:** Get a list of all blog posts bookmarked/saved by a specific user.
* **`GET /users/top-writers/`**
  * **What it does:** Get a list of the most popular writers on the platform.

---

## 📝 Blogs API

Endpoints for reading, writing, and interacting with blog posts.

* **`GET /blogs/`**
  * **What it does:** Get a list of all published blog posts (the main feed).
* **`POST /blogs/`**
  * **What it does:** Create a brand new blog post. (Requires you to be logged in).
* **`GET /blogs/<slug>`**
  * **What it does:** Read a specific blog post using its unique slug (URL-friendly title).
* **`GET /blogs/trending/`**
  * **What it does:** Get a list of trending blog posts based on views and engagement.
* **`GET /blogs/search/?q=<your-search-term>`**
  * **What it does:** Search for blog posts containing specific keywords.

### Categories

* **`GET /blogs/categories/`**
  * **What it does:** Get a list of all available blog categories (like Technology, Coding, AI, etc.).
* **`GET /blogs/categories/<slug>/`**
  * **What it does:** Get a list of blog posts that belong to a specific category.

### Interactions (Likes, Comments, Bookmarks)

* **`POST /blogs/<slug>/like/`**
  * **What it does:** Like or unlike a specific blog post. Acts as a toggle.
* **`POST /blogs/<slug>/bookmark/`**
  * **What it does:** Save or unsave a blog post to your personal bookmarks.
* **`GET /blogs/<slug>/comments/`**
  * **What it does:** View all the comments on a specific blog post.
* **`POST /blogs/<slug>/comments/`**
  * **What it does:** Add a new comment to a specific blog post.
* **`DELETE /blogs/comments/<id>/`**
  * **What it does:** Delete a specific comment that you previously made.

### Metrics

* **`POST /blogs/<slug>/view/`**
  * **What it does:** Records a new view for a blog post (tracked uniquely per IP/user).
* **`POST /blogs/<slug>/share/`**
  * **What it does:** Records that a user shared the blog post, incrementing its share count.
