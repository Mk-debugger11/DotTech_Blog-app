import React from 'react'
import Navbar from '../components/navbar'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home'
import BlogDetail from '../pages/blogDetail'
import BlogPostForm from '../pages/newBlog'
import MyProfile from '../pages/myProfile'
function LoggedInHomePage() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="pt-17"> {/* Adjust pt-16 to navbar height */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/:slug' element={<BlogDetail />}/>
          <Route path='/newblog' element={<BlogPostForm />}/>
          <Route path ='/myProfile' element={ <MyProfile/> }/>
        </Routes>
      </div>
    </>
  )
}

export default LoggedInHomePage;