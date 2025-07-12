import React, { useState } from 'react'
import { User } from "lucide-react";
import { LogOut } from "lucide-react";
import { Link } from 'react-router-dom';
import useAuthStore from "../store/store"
function Navbar() {
    const { setJwt } = useAuthStore.getState()
    const [active , setActive] = useState(false)
    return (
        <>
            <nav className='min-w-full flex justify-between items-center py-4 px-4 sm:px-8 xl:pr-16 bg-white border-b-1 border-b-black'>
                <div className='flex items-center gap-4'>
                    <div className="text-2xl xl:text-3xl font-serif">
                        <Link to="/">DotTech</Link>
                    </div>
                    <div className="searchBar">
                        <input type="text" className='border border-black rounded-xl focus:outline-black' />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="userprofile">
                        <Link to="/newblog">+ New Story</Link>
                    </div>
                    <div>
                        <div className="border border-black rounded-full overflow-hidden cursor-pointer">
                            <img onClick={() => {setActive(prev => !prev)}} src='/vite.svg' alt="" />
                        </div>
                        {active && <div className='flex justify-start py-2 px-2 absolute top-15 right-10 border border-gray-200 rounded-xl z-10 bg-white w-[180px] max-h-[100px]'>
                            <ul className='w-full'>
                                <Link to="/myProfile"><li className='mb-1 border-b flex items-center p-2 gap-2 cursor-pointer' onClick={() => {setActive(false)}}><User className="w-5 h-5" />Profile</li></Link>
                                <li className='mb-1 flex items-center p-2 gap-2 cursor-pointer' onClick={() => {setJwt(null)}} ><LogOut className="w-5 h-5 text-red-600" />Sign out</li> 
                            </ul>
                        </div>}
                    </div>
                </div>
            </nav>
        </>
    )
}
export default Navbar;