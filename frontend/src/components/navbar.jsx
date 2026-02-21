import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Search, Edit, Moon, Sun, Bookmark, Settings, FileText } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from "../store/store";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function Navbar() {
    const navigate = useNavigate();
    const { jwt, setJwt } = useAuthStore.getState();
    const currentUserId = jwt?.access ? JSON.parse(atob(jwt.access.split('.')[1])).user_id : null;
    const [active, setActive] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const debouncedSearch = useDebounce(searchQuery, 300);
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fetch user profile
    useEffect(() => {
        if (jwt?.access) {
            fetch('http://127.0.0.1:8000/users/userProfile/', {
                headers: {
                    'Authorization': `Bearer ${jwt.access}`
                }
            })
            .then(res => res.json())
            .then(data => setUserProfile(data))
            .catch(console.error);
        }
    }, [jwt]);

    const { data: searchResults, isLoading: isSearchLoading } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch) return null;
            const res = await fetch(`http://127.0.0.1:8000/blogs/search/?q=${encodeURIComponent(debouncedSearch)}`);
            if (!res.ok) throw new Error('Search failed');
            return res.json();
        },
        enabled: debouncedSearch.length > 0
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActive(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchActive(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [active]);

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
                <div className="hidden md:flex relative items-center group" ref={searchRef}>
                    <Search className="w-5 h-5 text-secondary-text absolute left-3 group-focus-within:text-foreground transition-colors z-10" />
                    <input 
                        type="text" 
                        placeholder="Search DotTech" 
                        className='bg-background border border-border rounded-full py-2.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-foreground focus:w-96 transition-all duration-300' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchActive(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                setSearchActive(false);
                                navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
                            }
                        }}
                    />
                    
                    {/* Search Dropdown */}
                    <AnimatePresence>
                        {searchActive && debouncedSearch && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-12 left-0 w-96 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[70vh]"
                            >
                                {isSearchLoading ? (
                                    <div className="p-4 text-center text-sm text-secondary-text">Searching...</div>
                                ) : searchResults ? (
                                    <div className="overflow-y-auto">
                                        {/* Posts */}
                                        {searchResults.posts?.length > 0 && (
                                            <div className="p-2">
                                                <div className="px-3 py-1 text-xs font-bold text-secondary-text uppercase tracking-wider">Posts</div>
                                                {searchResults.posts.slice(0, 3).map(post => (
                                                    <Link key={post.id} to={`/${post.slug}`} onClick={() => setSearchActive(false)} className="block px-3 py-2 hover:bg-background rounded-lg group">
                                                        <div className="font-medium text-foreground text-sm group-hover:text-accent-green line-clamp-1">{post.title}</div>
                                                        <div className="text-xs text-secondary-text mt-0.5">by {post.author?.name}</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Categories */}
                                        {searchResults.categories?.length > 0 && (
                                            <div className="p-2 border-t border-border">
                                                <div className="px-3 py-1 text-xs font-bold text-secondary-text uppercase tracking-wider">Topics</div>
                                                <div className="flex flex-wrap gap-2 px-3 py-2">
                                                    {searchResults.categories.map(cat => (
                                                        <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setSearchActive(false)} className="bg-background border border-border text-foreground text-xs px-2.5 py-1 rounded-full hover:border-foreground transition-colors">
                                                            {cat.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Writers */}
                                        {searchResults.writers?.length > 0 && (
                                            <div className="p-2 border-t border-border">
                                                <div className="px-3 py-1 text-xs font-bold text-secondary-text uppercase tracking-wider">People</div>
                                                {searchResults.writers.map(writer => (
                                                    <Link key={writer.id} to={`/user/${writer.id}`} onClick={() => setSearchActive(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-background rounded-lg">
                                                        <div className="w-6 h-6 rounded-full bg-accent-green text-white flex items-center justify-center text-[10px] font-bold">
                                                            {writer.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="font-medium text-foreground text-sm">{writer.name}</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {(!searchResults.posts?.length && !searchResults.writers?.length && !searchResults.categories?.length) && (
                                            <div className="p-4 text-center text-sm text-secondary-text">No results found for "{debouncedSearch}"</div>
                                        )}

                                        <button 
                                            onClick={() => { setSearchActive(false); navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`); }}
                                            className="w-full text-left px-4 py-3 border-t border-border text-sm text-foreground hover:bg-background hover:text-accent-green transition-colors"
                                        >
                                            See all results for "{debouncedSearch}"
                                        </button>
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
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

                <div className="relative" ref={dropdownRef}>
                    <div 
                        className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border border-border"
                        onClick={() => setActive(!active)}
                    >
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-accent-green flex items-center justify-center text-white font-serif font-bold text-sm">
                            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
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
                                    <p className="font-medium text-foreground text-sm">{userProfile?.name || 'User'}</p>
                                    <p className="text-xs text-secondary-text mt-1">@{userProfile?.name ? userProfile.name.toLowerCase().replace(/\s+/g, '') : 'user'}</p>
                                </div>
                                <ul className='w-full py-2 text-sm text-secondary-text font-sans'>
                                    <Link to={`/user/${currentUserId}`}>
                                        <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                            <User className="w-4 h-4 mr-3" /> Profile
                                        </li>
                                    </Link>
                                    <Link to={`/user/${currentUserId}?tab=bookmarks`}>
                                        <li className='flex items-center px-4 py-2 hover:text-foreground hover:bg-background cursor-pointer' onClick={() => setActive(false)}>
                                            <Bookmark className="w-4 h-4 mr-3" /> Bookmarks
                                        </li>
                                    </Link>
                                    <div className="h-px bg-border my-2"></div>
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