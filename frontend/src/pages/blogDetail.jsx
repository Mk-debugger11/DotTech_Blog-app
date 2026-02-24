import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, BookmarkPlus, Share, MoreHorizontal, PlayCircle, Eye } from 'lucide-react';
import FetchWithAuth from '../utils/fetchWithAuth';
import useAuthStore from '../store/store';

function BlogDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { jwt } = useAuthStore.getState();
    const isAuthenticated = !!jwt?.access;
    const currentUserId = isAuthenticated ? JSON.parse(atob(jwt.access.split('.')[1])).user_id : null;
    const [blog, setBlogData] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    function fetchBlogs() {
        setIsLoading(true);
        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}`)
            .then((response) => {
                if (!response.ok) throw new Error("Not found");
                return response.json();
            })
            .then((data) => {
                setBlogData(data);
                setIsLoading(false);
                trackView();
            })
            .catch((err) => {
                console.error("Failed to fetch blog:", err);
                setIsLoading(false);
            });
    }

    function trackView() {
        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/view/`, { 
            method: 'POST',
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBlogData(prev => ({ ...prev, views: data.views_count }));
                }
            })
            .catch(err => console.error("Failed to track view:", err));
    }

    function fetchComments() {
        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/comments/`)
            .then((response) => response.json())
            .then((data) => setComments(data))
            .catch((err) => console.error("Failed to fetch comments:", err));
    }

    const handleLike = () => {
        if (!isAuthenticated) return navigate('/login');
        
        // Optimistic update
        const wasLiked = blog.is_liked_by_user;
        setBlogData(prev => ({
            ...prev,
            is_liked_by_user: !wasLiked,
            likes_count: wasLiked ? prev.likes_count - 1 : prev.likes_count + 1
        }));

        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/like/`, { 
            method: 'POST',
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => {
                setBlogData(prev => ({ ...prev, likes_count: data.likes_count, is_liked_by_user: data.liked }));
            })
            .catch(() => {
                // Revert
                setBlogData(prev => ({
                    ...prev,
                    is_liked_by_user: wasLiked,
                    likes_count: wasLiked ? prev.likes_count + 1 : prev.likes_count - 1
                }));
            });
    };

    const handleBookmark = () => {
        if (!isAuthenticated) return navigate('/login');
        
        const wasBookmarked = blog.is_bookmarked_by_user;
        setBlogData(prev => ({
            ...prev,
            is_bookmarked_by_user: !wasBookmarked,
            bookmarks_count: wasBookmarked ? prev.bookmarks_count - 1 : prev.bookmarks_count + 1
        }));

        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/bookmark/`, { 
            method: 'POST',
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => {
                setBlogData(prev => ({ ...prev, bookmarks_count: data.bookmarks_count, is_bookmarked_by_user: data.bookmarked }));
            })
            .catch(() => {
                setBlogData(prev => ({
                    ...prev,
                    is_bookmarked_by_user: wasBookmarked,
                    bookmarks_count: wasBookmarked ? prev.bookmarks_count + 1 : prev.bookmarks_count - 1
                }));
            });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                url: window.location.href
            }).then(() => recordShare()).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
            recordShare();
        }
    };

    const recordShare = () => {
        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/share/`, { 
            method: 'POST',
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => setBlogData(prev => ({ ...prev, shares: data.shares_count })))
            .catch(console.error);
    };

    const handlePostComment = () => {
        if (!isAuthenticated) return navigate('/login');
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        FetchWithAuth(`http://127.0.0.1:8000/blogs/${slug}/comments/`, {
            method: 'POST',
            body: JSON.stringify({ comment: newComment })
        })
            .then(res => res.json())
            .then(() => {
                setNewComment('');
                fetchComments(); // Refresh comments list
            })
            .catch(console.error)
            .finally(() => setIsSubmittingComment(false));
    };

    const handleDeleteComment = (id) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        
        FetchWithAuth(`http://127.0.0.1:8000/blogs/comments/${id}/`, {
            method: 'DELETE'
        })
            .then(() => {
                setComments(comments.filter(c => c.id !== id));
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchBlogs();
        fetchComments();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="max-w-[680px] mx-auto px-4 py-16 animate-pulse">
                <div className="h-12 bg-surface rounded w-3/4 mb-8"></div>
                <div className="flex gap-4 items-center mb-10">
                    <div className="w-12 h-12 rounded-full bg-surface"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-surface rounded w-1/4"></div>
                        <div className="h-3 bg-surface rounded w-1/3"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 bg-surface rounded w-full"></div>
                    <div className="h-4 bg-surface rounded w-full"></div>
                    <div className="h-4 bg-surface rounded w-5/6"></div>
                    <div className="h-4 bg-surface rounded w-full mt-8"></div>
                    <div className="h-4 bg-surface rounded w-full"></div>
                    <div className="h-4 bg-surface rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return <p className="p-16 text-center text-secondary-text font-sans">Blog post not found.</p>;
    }

    const rawDate = blog.created_at;
    const date = new Date(rawDate);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const wordCount = blog.content ? blog.content.split(' ').length : 0;
    const readTimeCalc = Math.max(1, Math.ceil(wordCount / 200));
    const authorName = blog.author?.name || "Anonymous";
    const initials = authorName.charAt(0).toUpperCase();

    return (
        <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-background min-h-screen pb-20"
        >
            <div className="max-w-[680px] mx-auto px-4 pt-12 md:pt-16">
                
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-[1.2] mb-8">
                    {blog.title}
                </h1>

                {/* Author Block */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-lg font-medium text-secondary-text">
                            {initials}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-base">{authorName}</span>
                                <span className="text-secondary-text">·</span>
                                <button className="text-accent-green font-medium text-sm hover:text-green-800 transition-colors">
                                    Follow
                                </button>
                            </div>
                            {/* Categories */}
                            {blog.categories && blog.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {blog.categories.map(cat => (
                                        <Link 
                                            key={cat.id} 
                                            to={`/category/${cat.slug}`}
                                            className="bg-accent-green/10 text-accent-green text-xs font-medium px-2 py-1 rounded-full hover:bg-accent-green/20 transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-secondary-text mt-2">
                                <span>{readTimeCalc} min read</span>
                                <span>·</span>
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar (Top) */}
                <div className="flex items-center justify-between py-3 border-y border-border mb-10 text-secondary-text">
                    <div className="flex items-center gap-6">
                        <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group ${blog.is_liked_by_user ? 'text-accent-green' : 'hover:text-foreground'}`}>
                            <Heart className={`w-5 h-5 ${blog.is_liked_by_user ? 'fill-current' : 'group-hover:fill-current'}`} />
                            <span className="text-sm">{blog.likes_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{blog.comments_count || comments.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-2 text-secondary-text">
                            <Eye className="w-5 h-5" />
                            <span className="text-sm">{blog.views || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="hover:text-foreground transition-colors">
                            <PlayCircle className="w-5 h-5" />
                        </button>
                        <button onClick={handleBookmark} className={`transition-colors ${blog.is_bookmarked_by_user ? 'text-accent-green' : 'hover:text-foreground'}`}>
                            <BookmarkPlus className={`w-5 h-5 ${blog.is_bookmarked_by_user ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={handleShare} className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Share className="w-5 h-5" />
                            {blog.shares > 0 && <span className="text-xs">{blog.shares}</span>}
                        </button>
                        <button className="hover:text-foreground transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Hero Thumbnail */}
                {blog.thumbnail && (
                    <div className="w-full mb-10 overflow-hidden rounded-2xl border border-border bg-surface">
                        <img 
                            src={blog.thumbnail} 
                            alt={blog.title} 
                            className="w-full h-auto object-cover max-h-[500px]"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Content */}
                <div 
                    className="prose prose-lg dark:prose-invert max-w-none font-sans text-foreground leading-relaxed mb-16"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />



                {/* Action Bar (Bottom) */}
                <div className="flex items-center justify-between py-4 border-y border-border text-secondary-text mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group ${blog.is_liked_by_user ? 'text-accent-green' : 'hover:text-foreground'}`}>
                            <Heart className={`w-6 h-6 ${blog.is_liked_by_user ? 'fill-current' : 'group-hover:fill-current'}`} />
                            <span className="text-base">{blog.likes_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <MessageCircle className="w-6 h-6" />
                            <span className="text-base">{blog.comments_count || comments.length || 0}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-5">
                        <button onClick={handleBookmark} className={`transition-colors ${blog.is_bookmarked_by_user ? 'text-accent-green' : 'hover:text-foreground'}`}>
                            <BookmarkPlus className={`w-6 h-6 ${blog.is_bookmarked_by_user ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={handleShare} className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Share className="w-6 h-6" />
                        </button>
                        <button className="hover:text-foreground transition-colors">
                            <MoreHorizontal className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <section className="bg-surface rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-bold font-sans text-foreground mb-6">Responses ({comments.length || 0})</h3>
                    
                    {/* Add Comment Input */}
                    {isAuthenticated ? (
                        <div className="mb-10 bg-background p-4 rounded-lg border border-border shadow-sm">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What are your thoughts?" 
                                className="w-full bg-transparent border-none focus:ring-0 resize-none text-foreground placeholder-secondary-text"
                                rows="3"
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={handlePostComment}
                                    disabled={isSubmittingComment || !newComment.trim()}
                                    className="bg-accent-green hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-5 rounded-full transition-colors"
                                >
                                    {isSubmittingComment ? 'Posting...' : 'Respond'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-10 bg-background p-6 rounded-lg border border-border text-center">
                            <p className="text-secondary-text mb-4">Sign in to join the conversation.</p>
                            <button onClick={() => navigate('/login')} className="bg-accent-green text-white px-6 py-2 rounded-full">Sign In</button>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-8">
                        {comments.length > 0 ? comments.map((comment, index) => (
                            <div key={index} className="border-b border-border pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium text-secondary-text">
                                            {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{comment.author?.name || "Unknown"}</p>
                                            <p className="text-xs text-secondary-text">
                                                {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    {currentUserId === comment.author?.id && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                                    {comment.comment}
                                </p>
                            </div>
                        )) : (
                            <p className="text-secondary-text text-sm italic">No responses yet. Be the first to share your thoughts!</p>
                        )}
                    </div>
                </section>

            </div>
        </motion.article>
    );
}

export default BlogDetail;