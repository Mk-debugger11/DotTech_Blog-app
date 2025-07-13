import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
function BlogDetail() {
    const { slug } = useParams()
    const [blog , setBlogData] = useState([])
    const [comments , setComments] = useState([])
    function fetchBlogs(){
        fetch(`http://127.0.0.1:8000/blogs/${slug}`)
        .then((response)=>{
            return response.json()
        })
        .then((data)=>{
            console.log(data)
            setBlogData(data)
        })
    }
    function fetchComments(){
      fetch(`http://127.0.0.1:8000/blogs/${slug}/comments/`)
      .then((response)=>{
          return response.json()
      })
      .then((data)=>{
          console.log(data)
          setComments(data)
      })
  }
    useEffect(()=>{
        fetchBlogs()
        fetchComments()
    },[])
    if (!blog) {
        return <p className="p-4 text-center text-gray-600">Loading...</p>;
      }
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Blog title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{blog.title}</h1>

      {/* Author and meta */}
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-2 flex-wrap">
        <span>👤 {blog.author?.name || "Unknown Author"}</span>
        <span>📅 {blog.created_at}</span>
        <span>👁️ {blog.views} views</span>
        {blog.category && <span>🏷️ Category: {blog.category.name}</span>}
      </div>

      {/* Blog content */}
      <div className="prose max-w-none text-gray-800 whitespace-pre-line">
        {blog.content}
      </div>
    </div>
  )
}

export default BlogDetail