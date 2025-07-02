import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import SignIn from '../components/modals/signin';
import useAuthStore from '../store/store';
function NewUserLandingPage() {
    const [isOpen , setIsOpen] = useState(false)
    return (
        <>  
            <SignIn isOpen={isOpen} setIsOpen={setIsOpen}/>
            <div className='h-screen bg-[#f5f3eb] flex flex-col'>
                <nav className='min-w-full flex justify-between items-center py-4 px-4 sm:px-6 border-b-1 border-b-black'>
                    <div className="text-2xl xl:text-3xl font-serif">
                        DotTech
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={()=>{setIsOpen(true)}} className="hover:bg-gray-200 bg-transparent text-black border-1 border-gray-300 cursor-pointer">
                            Sign in
                        </Button>
                        <Button className="border cursor-pointer">
                            Sign Up
                        </Button>
                    </div>
                </nav>
                {/* flex1 says it to occupy the remaining space */}
                <div className="flex-1 flex justify-center ">
                    <div className='w-full flex flex-col sm:items-start px-5 sm:px-7 lg:px-9 xl:px-13 text-[#242424] my-auto'>
                        <div className='text-[25px] sm:text-[35px] lg:text-[45px] xl:text-[55px] xs:text-[90px] font-semibold font-serif leading-[50px] lg:leading-[60px] xl:leading-[80px]'>
                            <h1>Tech insights</h1>
                            <h1>that shape tomorrow.</h1>
                        </div>
                        <div className='mt-6'>
                            <p className='text-sm sm:text-base lg:text-lg'>Explore ideas, tutorials, and breakthroughs from developers, engineers, and tech thinkers around the world.</p>
                        </div>
                        <div>
                            <Button className="text-xl w-40 h-10 rounded-2xl cursor-pointer mt-10">
                                Get Started
                            </Button>
                        </div>
                    </div>
                    <div className='image hidden'>

                    </div>
                </div>
                <footer className='h-20 border-t border-black flex justify-center items-center gap-2'>
                    <p>Developed By Mukul</p>
                    <Link to="https://github.com/Mk-debugger11" target="_blank">
                        <img src="/github.svg" className='w-5'/>
                    </Link>
                </footer>
            </div>
        </>
    )
}

export default NewUserLandingPage;