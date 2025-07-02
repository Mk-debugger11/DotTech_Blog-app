import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'
import { X } from "lucide-react";
import useAuthStore from '../../store/store';
function SignIn({ isOpen, setIsOpen }) {
    const [email , setEmail] = useState('')
    const [password , setPassword] = useState('')
    const [response, setResponse] = useState('')
    const setKey = useAuthStore((state)=> state.setJwt)
    function SignInForm(){
        const credentials = {
            email: email,
            password: password,
        }
        fetch('http://127.0.0.1:8000/blogs/login/',{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials)
        })
        .then((response)=>{
            return response.json()
        })
        .then((data)=>{
            setKey(data)
        })
    }
    useEffect(()=>{
        console.log(response)
    },[response])
    return (
        <>
            {isOpen &&
                <div onClick={() => { setIsOpen(false) }} className="bg-[rgba(245,243,235,0.8)] min-w-screen min-h-screen fixed flex justify-center items-center ">
                    <div onClick={(e) => { e.stopPropagation() }} className="relative w-100 h-auto bg-white rounded-xl flex flex-col gap-3 items-center p-5 pb-8 shadow-xl">
                        <div className="text-2xl font-serif flex">
                            <div className="logo">
                                DotTech
                            </div>
                            <div className="absolute right-10">
                                <X size={24} strokeWidth={2} className="text-black cursor-pointer" onClick={() => { setIsOpen(false) }} />
                            </div>
                        </div>
                        <div className="forms flex flex-col gap-3">
                            <input type="email" placeholder='Enter your Registered Email' className='login-form' onChange={(e)=>{setEmail(e.target.value)}}/>
                            <input type="password" placeholder='Enter your Password' className='login-form' onChange={(e)=>{setPassword(e.target.value)}}/>
                        </div>
                        <div className="button mt-4">
                            <Button className="w-80 rounded-xl" onClick={SignInForm}>
                                Sign In
                            </Button>
                        </div>
                        <div className="signupLink flex gap-2">
                            <p>Don't have an Account</p>
                            <Link className='text-[#df451f] underline'>Sign Up</Link>
                        </div>
                    </div>
                </div>
            }

        </>
    )
}

export default SignIn