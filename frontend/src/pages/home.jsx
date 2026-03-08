import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BlogCard from '../components/blogCard';
import Hero from '../components/Hero';
import Sidebar from '../components/Sidebar';

function Home() {
    const location = useLocation();
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    function fetchBlogs(pageNumber = 1, reset = false) {
        if (!hasMore && !reset) return;
        
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        const url = searchQuery 
            ? `https://dottech-blog-app.onrender.com/blogs/?search=${encodeURIComponent(searchQuery)}&page=${pageNumber}` 
            : `https://dottech-blog-app.onrender.com/blogs/?page=${pageNumber}`;
        
        if (reset) {
            setIsLoading(true);
        } else {
            setIsFetchingMore(true);
        }

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                // Determine if we're using DRF pagination (data.results) or old format (array)
                const results = data.results || data;
                
                if (reset) {
                    setBlogs(results);
                } else {
                    setBlogs(prev => [...prev, ...results]);
                }
                
                // If it's DRF paginated, 'next' tells us if there's more. If old format, assume no more.
                setHasMore(!!data.next);
                
                setIsLoading(false);
                setIsFetchingMore(false);
            })
            .catch((err) => {
                console.error("Failed to fetch blogs:", err);
                setIsLoading(false);
                setIsFetchingMore(false);
            });
    }

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchBlogs(1, true);
    }, [location.search]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
                if (!isLoading && !isFetchingMore && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchBlogs(nextPage, false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, isFetchingMore, hasMore, page]);

    useEffect(() => {
        fetch('https://dottech-blog-app.onrender.com/blogs/categories/')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to fetch categories:", err));
    }, []);

    const EmptyState = () => (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center"
        >
            <div className="w-32 h-32 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
                <PenTool className="w-12 h-12 text-secondary-text" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-3">No stories yet</h2>
            <p className="text-secondary-text max-w-md mb-8">
                Be the first writer to publish on DotTech. Share your knowledge, experiences, and ideas with the community.
            </p>
            <Link 
                to="/newblog" 
                className="bg-accent-green hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-full transition-colors inline-block"
            >
                Write Your First Story
            </Link>
        </motion.div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Hero />
            
            <main id="feed" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12 relative">
                    
                    {/* Left Column (Blog Feed) - 75% */}
                    <div className="w-full lg:w-[75%]">
                        
                        {/* Category Explorer */}
                        {!location.search && categories.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-secondary-text mb-4">Discover Topics</h2>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <Link 
                                            key={cat.id} 
                                            to={`/category/${cat.slug}`}
                                            className="bg-surface border border-border text-foreground px-4 py-2 rounded-full text-sm hover:border-foreground transition-colors whitespace-nowrap"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                            <h2 className="text-xl font-bold font-serif text-foreground">
                                {new URLSearchParams(location.search).get('search') 
                                    ? `Search Results for "${new URLSearchParams(location.search).get('search')}"`
                                    : "Latest Stories"}
                            </h2>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-8 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-6 pb-8 border-b border-border">
                                        <div className="flex-1 space-y-4">
                                            <div className="h-4 bg-surface rounded w-1/4"></div>
                                            <div className="h-8 bg-surface rounded w-3/4"></div>
                                            <div className="h-4 bg-surface rounded w-full"></div>
                                            <div className="h-4 bg-surface rounded w-5/6"></div>
                                        </div>
                                        <div className="w-[150px] h-[100px] bg-surface rounded-lg hidden sm:block"></div>
                                    </div>
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-2"
                            >
                                {blogs.map((ele) => {
                                    const rawDate = ele.created_at;
                                    const date = new Date(rawDate);
                                    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    
                                    // Mock read time based on content length
                                    const wordCount = ele.content ? ele.content.split(' ').length : 0;
                                    const readTimeCalc = Math.max(1, Math.ceil(wordCount / 200));

                                    return (
                                        <BlogCard 
                                            key={ele.slug} 
                                            author={ele.author.name || 'Anonymous'} 
                                            slug={ele.slug} 
                                            title={ele.title} 
                                            content={ele.content} 
                                            createdAt={formattedDate}
                                            readTime={`${readTimeCalc} min read`}
                                            likes={ele.likes_count || 0}
                                            comments={ele.comments_count || 0}
                                            categories={ele.categories || []}
                                            thumbnail={ele.thumbnail}
                                        />
                                    );
                                })}
                            </motion.div>
                        )}
                        
                        {isFetchingMore && (
                            <div className="py-8 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column (Sidebar) */}
                    <div className="w-full lg:w-[25%] mt-12 lg:mt-0">
                        <Sidebar />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;