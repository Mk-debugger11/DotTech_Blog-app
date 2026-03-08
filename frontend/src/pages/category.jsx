import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenTool, Hash } from 'lucide-react';
import BlogCard from '../components/blogCard';
import Sidebar from '../components/Sidebar';

function CategoryFeed() {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    function fetchCategoryBlogs(pageNumber = 1, reset = false) {
        if (!hasMore && !reset) return;

        if (reset) {
            setIsLoading(true);
        } else {
            setIsFetchingMore(true);
        }

        fetch(`https://dottech-blog-app.onrender.com/blogs/?search=${slug}&page=${pageNumber}`)
            .then(response => response.json())
            .then(data => {
                const results = data.results || data;
                
                if (reset) {
                    setBlogs(results);
                } else {
                    setBlogs(prev => [...prev, ...results]);
                }
                
                setHasMore(!!data.next);
                setIsLoading(false);
                setIsFetchingMore(false);
            })
            .catch(err => {
                console.error("Failed to fetch blogs:", err);
                setIsLoading(false);
                setIsFetchingMore(false);
            });
    }

    useEffect(() => {
        // Fetch Category Details
        fetch(`https://dottech-blog-app.onrender.com/blogs/categories/${slug}/`)
            .then(res => res.json())
            .then(data => setCategory(data))
            .catch(err => console.error("Failed to fetch category:", err));

        // Initial fetch of posts
        setPage(1);
        setHasMore(true);
        fetchCategoryBlogs(1, true);
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
                if (!isLoading && !isFetchingMore && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchCategoryBlogs(nextPage, false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, isFetchingMore, hasMore, page, slug]);

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            {/* Category Header */}
            {category && (
                <div className="bg-surface border-b border-border py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm">
                            <Hash className="w-8 h-8 text-accent-green" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-foreground">{category.name}</h1>
                            {category.description && (
                                <p className="text-secondary-text mt-1 max-w-2xl">{category.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column (Blog Feed) */}
                    <div className="w-full lg:w-[75%]">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                            <h2 className="text-xl font-bold font-serif text-foreground">Latest in {category?.name || 'Topic'}</h2>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-8 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-6 pb-8 border-b border-border">
                                        <div className="flex-1 space-y-4">
                                            <div className="h-4 bg-surface rounded w-1/4"></div>
                                            <div className="h-8 bg-surface rounded w-3/4"></div>
                                            <div className="h-4 bg-surface rounded w-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <PenTool className="w-12 h-12 text-secondary-text mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-foreground mb-2">No stories here</h2>
                                <p className="text-secondary-text">Be the first to write about this topic.</p>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                {blogs.map(ele => {
                                    const date = new Date(ele.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    const wordCount = ele.content ? ele.content.split(' ').length : 0;
                                    const readTimeCalc = Math.max(1, Math.ceil(wordCount / 200));

                                    return (
                                        <BlogCard 
                                            key={ele.slug} 
                                            author={ele.author?.name || 'Anonymous'} 
                                            slug={ele.slug} 
                                            title={ele.title} 
                                            content={ele.content} 
                                            createdAt={date}
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

export default CategoryFeed;
