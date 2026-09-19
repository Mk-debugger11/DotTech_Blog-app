import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PenTool, TrendingUp, Users } from 'lucide-react';
import SignIn from '../components/modals/signin';
import SignUp from '../components/modals/signup';

function NewUserLandingPage() {
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const openSignIn = () => {
        setIsSignUpOpen(false);
        setIsSignInOpen(true);
    };

    const openSignUp = () => {
        setIsSignInOpen(false);
        setIsSignUpOpen(true);
    };

    return (
        <>  
            <SignIn isOpen={isSignInOpen} setIsOpen={setIsSignInOpen} switchToSignUp={openSignUp} />
            <SignUp isOpen={isSignUpOpen} setIsOpen={setIsSignUpOpen} switchToSignIn={openSignIn} />
            
            <div className='min-h-screen bg-background flex flex-col font-sans overflow-hidden'>
                
                {/* Navbar */}
                <nav className='w-full flex justify-between items-center py-5 px-6 md:px-12 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40'>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif font-bold tracking-tight text-foreground"
                    >
                        DotTech.
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 items-center"
                    >
                        <button 
                            onClick={openSignIn} 
                            className="text-secondary-text hover:text-foreground font-medium transition-colors hidden sm:block"
                        >
                            Sign In
                        </button>
                        <Button 
                            onClick={openSignUp} 
                            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 font-medium transition-all"
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </nav>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col items-center justify-center relative px-6 w-full max-w-7xl mx-auto py-20">
                    
                    {/* Background Gradients removed per request */}

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center z-10 max-w-4xl"
                    >
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold leading-tight tracking-tight text-foreground mb-6">
                            Tech insights that <br />
                            <span className="text-accent-green">shape tomorrow.</span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-secondary-text mb-12 max-w-2xl mx-auto leading-relaxed">
                            Explore ideas, tutorials, and breakthroughs from developers, engineers, and tech thinkers around the world.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button 
                                onClick={openSignUp}
                                className="h-14 px-8 text-lg rounded-full bg-accent-green hover:bg-accent-green/90 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                            >
                                Start Reading <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button 
                                onClick={openSignIn}
                                variant="outline"
                                className="h-14 px-8 text-lg rounded-full border-2 border-border hover:bg-surface text-foreground font-medium transition-all"
                            >
                                Write a Story
                            </Button>
                        </div>
                    </motion.div>

                    {/* Features Grid removed per request */}
                </main>

                {/* Footer */}
                <footer className='w-full py-8 border-t border-border bg-surface flex flex-col md:flex-row justify-center md:justify-between items-center px-6 md:px-12 mt-auto z-10'>
                    <div className="text-xl font-serif font-bold text-foreground mb-4 md:mb-0">DotTech.</div>
                    <div className="flex items-center gap-6">
                        <p className="text-secondary-text font-medium text-sm">Developed By Mukul</p>
                        <Link to="https://github.com/Mk-debugger11" target="_blank" className="text-secondary-text hover:text-foreground transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default NewUserLandingPage;