import React, { useState, useEffect } from 'react';
import { User, LogOut, Search, Edit, Moon, Sun, Bookmark, Settings, FileText } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from "../store/store";

function Navbar() {
    const { setJwt } = useAuthStore.getState();
    const [active, setActive] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <nav className='sticky top-0 z-50 min-w-full flex justify-between items-center h-[72px] px-4 sm:px-6 lg:px-8 bg-surface border-b border-border transition-colors'>
            <div className='flex items-center gap-6'>
                <div className="text-2xl xl:text-3xl font-serif font-bold tracking-tight text-foreground">
                    <Link to="/">DotTech</Link>
                </div>
                <div className="hidden md:flex relative items-center group">
                    <Search className="w-5 h-5 text-secondary-text absolute left-3 group-focus-within:text-foreground transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className='bg-background border border-border rounded-full py-2.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-foreground focus:w-80 transition-all duration-300' 
                    />
                </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="text-secondary-text hover:text-foreground transition-colors p-2 rounded-full hover:bg-background"
                    aria-label="Toggle Dark Mode"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <Link to="/newblog" className="hidden sm:flex items-center gap-2 text-secondary-text hover:text-foreground transition-colors">
                    <Edit className="w-5 h-5" />
                    <span className="font-sans text-sm font-medium">Write</span>
                </Link>

                <div className="relative">
                    <div 
                        className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border border-border"
                        onClick={() => setActive(!active)}
                    >
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-accent-green flex items-center justify-center text-white font-serif font-bold text-sm">
                            M
                        </div>
                    </div>

                    <AnimatePresence>
                        {active && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className='absolute top-12 right-0 border border-border rounded-xl shadow-lg bg-surface w-56 overflow-hidden origin-top-right'
                            >
                                <div className="p-4 border-b border-border">
                                    <p className="font-medium text-foreground text-sm">Mukul</p>
                                    <p className="text-xs text-secondary-text mt-1">@mukul</p>
                                </div>
                                <ul className='w-full py-2 text-sm text-secondary-text font-sans'>
                                    <Link to="/myProfile">
                                        <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                            <User className="w-4 h-4 mr-3" /> Profile
                                        </li>
                                    </Link>
                                    <Link to="/myProfile">
                                        <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                            <Bookmark className="w-4 h-4 mr-3" /> Bookmarks
                                        </li>
                                    </Link>
                                    <Link to="/myProfile">
                                        <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                            <FileText className="w-4 h-4 mr-3" /> Stories
                                        </li>
                                    </Link>
                                    <div className="h-px bg-border my-2"></div>
                                    <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                        <Settings className="w-4 h-4 mr-3" /> Settings
                                    </li>
                                    <li className='flex items-center px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer' onClick={() => {setJwt(null)}}>
                                        <LogOut className="w-4 h-4 mr-3" /> Sign out
                                    </li> 
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;