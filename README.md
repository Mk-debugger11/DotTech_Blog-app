# DotTech Backend API

This document details the REST API endpoints available in the DotTech backend. 

## Authentication & Users

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/users/` | POST | Register a new user account. |
| `/blogs/login/` | POST | Authenticate a user and return JWT tokens. |
| `/api/token/refresh/` | POST | Refresh an expired JWT access token. |
| `/users/userProfile/` | GET, PUT | Retrieve or update the authenticated user's profile. |
| `/users/<id>/profile/` | GET | Retrieve a public user profile by ID. |
| `/users/<id>/follow/` | POST | Toggle follow/unfollow status for a user. |
| `/users/<id>/blogs/` | GET | Retrieve all blog posts authored by a specific user. |
| `/users/<id>/bookmarks/` | GET | Retrieve all blog posts bookmarked by a specific user. |
| `/users/top-writers/` | GET | Retrieve a list of top-performing writers. |

## Blogs

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/blogs/` | GET, POST | List all published blog posts or create a new post. |
| `/blogs/<slug>` | GET | Retrieve a specific blog post by its slug. |
| `/blogs/trending/` | GET | Retrieve trending blog posts based on engagement. |
| `/blogs/search/?q=<query>` | GET | Search blog posts by keyword. |

### Categories

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/blogs/categories/` | GET | List all available categories. |
| `/blogs/categories/<slug>/` | GET | Retrieve blog posts belonging to a specific category. |

### Interactions & Metrics

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/blogs/<slug>/like/` | POST | Toggle like/unlike for a blog post. |
| `/blogs/<slug>/bookmark/` | POST | Toggle bookmark status for a blog post. |
| `/blogs/<slug>/comments/` | GET, POST | List comments or add a new comment to a blog post. |
| `/blogs/comments/<id>/` | DELETE | Delete a specific comment. |
| `/blogs/<slug>/view/` | POST | Record a unique view for a blog post. |
| `/blogs/<slug>/share/` | POST | Record a share action for a blog post. |
