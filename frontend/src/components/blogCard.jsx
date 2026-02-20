import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Heart, MessageCircle, BookmarkPlus, Share } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogCard = ({ author, slug, title, content, createdAt, thumbnail, readTime = "5 min read", likes = 42, comments = 12, categories = [] }) => {
    // Generate a simple avatar from the author's name
    const initials = author ? author.charAt(0).toUpperCase() : 'A';
    
    // Create a mock excerpt by stripping potential HTML and taking first 150 chars
    const excerpt = content ? content.substring(0, 150) + (content.length > 150 ? '...' : '') : 'Read this amazing story...';

    const [showToast, setShowToast] = useState(false);

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(url);
        setShowToast(true);
    };

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group py-8 border-b border-border bg-background cursor-pointer"
        >
            <div className="flex flex-col md:flex-row justify-between gap-8 max-w-4xl mx-auto">
                {/* Left content */}
                <div className="flex-1 order-2 md:order-1">
                    {/* Author & Meta */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs font-medium text-secondary-text">
                            {initials}
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {author}
                        </p>
                        <span className="text-secondary-text text-sm">·</span>
                        <p className="text-sm text-secondary-text">
                            {createdAt}
                        </p>
                    </div>

                    {/* Title & Excerpt */}
                    <Link to={`/${slug}`} className="block group cursor-pointer mb-5">
                        <h2 className="text-2xl font-bold font-serif text-foreground group-hover:text-accent-green transition-colors leading-tight mb-2">
                            {title}
                        </h2>
                        <p className="text-secondary-text font-sans text-base leading-relaxed line-clamp-3">
                            {excerpt}
                        </p>
                    </Link>

                    {/* Categories */}
                    {categories && categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categories.map(cat => (
                                <Link 
                                    key={cat.id} 
                                    to={`/category/${cat.slug}`}
                                    className="bg-accent-green/10 text-accent-green text-xs font-medium px-2.5 py-1 rounded-full hover:bg-accent-green/20 transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4 sm:gap-6 text-sm text-secondary-text">
                            <span className="bg-surface px-2.5 py-1 rounded-full text-xs hidden sm:inline-block">
                                {readTime}
                            </span>
                            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <Heart className="w-5 h-5" />
                                <span>{likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span>{comments}</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-secondary-text">
                            <button className="hover:text-foreground transition-colors">
                                <BookmarkPlus className="w-5 h-5" />
                            </button>
                            <button onClick={handleShare} className="hover:text-foreground transition-colors">
                                <Share className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right image placeholder */}
                <div className="w-full md:w-[200px] h-[150px] md:h-auto order-1 md:order-2 flex-shrink-0 bg-surface border border-border rounded-lg overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                    {thumbnail ? (
                        <img 
                            src={thumbnail} 
                            alt={title} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-border"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    )}
                    <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-border"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
            </div>
            
            {showToast && (
                <div className="fixed bottom-6 right-6 bg-surface border border-border shadow-lg rounded-md px-4 py-3 z-50 overflow-hidden">
                    <p className="text-sm font-medium text-foreground">Link copied to clipboard</p>
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: 0 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-accent-green"
                    />
                </div>
            )}
        </motion.div>
    );
};

export default BlogCard;
