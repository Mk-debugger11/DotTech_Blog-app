import React from 'react'

function Navbar() {
    return (
        <>
            <nav className='min-w-full flex justify-between items-center py-4 px-4 sm:px-8 xl:pr-16 border-b-1 border-b-black'>
                <div className='flex items-center gap-4'>
                    <div className="text-2xl xl:text-3xl font-serif">
                        DotTech
                    </div>
                    <div className="searchBar">
                        <input type="text" className='border border-black rounded-xl focus:outline-black'/>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="userprofile">
                        + New Story
                    </div>
                    <div className="border border-black rounded-full overflow-hidden">
                        <img src='/vite.svg' alt="" />
                    </div>
                </div>
            </nav>
        </>
    )
}
export default Navbar;