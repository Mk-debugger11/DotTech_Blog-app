import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import useAuthStore from '../../store/store';

function SignUp({ isOpen, setIsOpen, switchToSignIn }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const setJwt = useAuthStore((state) => state.setJwt);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        setIsLoading(true);
        
        const payload = {
            name: name,
            email: email,
            password: password
        };

        try {
            // Step 1: Create the User
            const response = await fetch('https://dottech-blog-app.onrender.com/users/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error
                const errorMsg = data.email ? `Email: ${data.email[0]}` : data.detail || "Signup failed. Please try again.";
                throw new Error(errorMsg);
            }

            // Step 2: Auto Login
            const loginPayload = {
                email: email,
                password: password
            };

            const loginResponse = await fetch('https://dottech-blog-app.onrender.com/blogs/login/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginPayload)
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                setJwt(loginData);
                setIsOpen(false);
            } else {
                throw new Error("Account created, but automatic login failed. Please sign in.");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            onClick={() => setIsOpen(false)} 
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm transition-all"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-[420px] bg-surface rounded-2xl flex flex-col items-center p-8 shadow-2xl border border-border overflow-hidden mx-4"
            >
                {/* Decorative background element */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-green/20 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="w-full flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-3xl font-serif font-bold text-foreground">Join DotTech.</h2>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-secondary-text hover:text-foreground transition-colors p-1"
                    >
                        <X size={24} strokeWidth={2} />
                    </button>
                </div>
                
                <form className="w-full flex flex-col gap-4 relative z-10" onSubmit={handleSignUp}>
                    {error && (
                        <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary-text ml-1">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="John Doe" 
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary-text ml-1">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com" 
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-secondary-text ml-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="Create a strong password" 
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:border-accent-green transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-12 mt-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium text-base transition-all flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                    </Button>
                </form>
                
                <div className="mt-8 flex gap-2 text-sm relative z-10">
                    <p className="text-secondary-text">Already have an account?</p>
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            if (switchToSignIn) switchToSignIn();
                        }} 
                        className="text-accent-green font-medium hover:underline transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
