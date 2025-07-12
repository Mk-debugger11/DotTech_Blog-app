import React, { useEffect } from 'react'
import { useState } from 'react'
import BlogCard from '../components/blogCard'
function Home() {
    const [blogs,setBlogs] = useState([])
    function fetchBlogs(){
        fetch('http://127.0.0.1:8000/blogs/')
        .then((response)=>{
            return response.json()
        })
        .then((data)=>{
            console.log(data)
            setBlogs(data)
        })
    }
    useEffect(()=>{
        fetchBlogs()
    },[])
    if(blogs.length === 0){
        return <p>No Blogs Posted Yet</p>
    }
    return (
        <>
            <div className='h-[100%] border border-black flex'>
                <div className='left-panel border border-black w-[75%]'>
                    {blogs.map((ele)=>{
                        const rawDate = ele.created_at
                        const date = new Date(rawDate)
                        const formatedDate = date.toLocaleDateString()
                        return <BlogCard key={ele.slug} author={ele.author.name} slug={ele.slug} title = {ele.title} content = {ele.content} createdAt = {formatedDate}/>
                    })}
                </div>
                <div className='right-panel border border-black'>

                </div>
            </div>
        </>
    )
}

export default Home