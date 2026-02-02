import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import BlogCard from '../components/blogCard';
import Hero from '../components/Hero';
import Sidebar from '../components/Sidebar';

function Home() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    function fetchBlogs() {
        setIsLoading(true);
        fetch('http://127.0.0.1:8000/blogs/')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setBlogs(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch blogs:", err);
                setIsLoading(false);
            });
    }

    useEffect(() => {
        fetchBlogs();
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
                    
                    {/* Left Column (Blog Feed) - 70% */}
                    <div className="w-full lg:w-[70%]">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                            <h2 className="text-xl font-bold font-serif text-foreground">Latest Stories</h2>
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
                                            likes={Math.floor(Math.random() * 100)} // Mock likes
                                            comments={Math.floor(Math.random() * 20)} // Mock comments
                                        />
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>
                    
                    {/* Right Column (Sidebar) - 30% */}
                    <div className="hidden lg:block lg:w-[30%]">
                        <Sidebar />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;