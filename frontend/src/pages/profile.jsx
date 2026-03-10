import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Calendar, Github, Linkedin, Edit, Plus, FileText, Activity, User as UserIcon, Settings, MoreHorizontal } from 'lucide-react';
import FetchWithAuth from '../utils/fetchWithAuth';
import useAuthStore from '../store/store';
import BlogCard from '../components/blogCard';

const ProfileTabs = ({ activeTab, setActiveTab, isOwner }) => {
    const tabs = [
        { id: 'published', label: 'Published' },
        ...(isOwner ? [{ id: 'bookmarks', label: 'Bookmarks' }] : []),
        ...(isOwner ? [{ id: 'drafts', label: 'Drafts' }] : []),
        { id: 'about', label: 'About' },
        { id: 'activity', label: 'Activity' },
    ];

    return (
        <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                        activeTab === tab.id ? 'text-foreground' : 'text-secondary-text hover:text-foreground'
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="profileTabIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-2xl font-bold font-serif text-foreground">{value}</span>
        <span className="text-xs text-secondary-text uppercase tracking-wider">{label}</span>
    </div>
);

function Profile() {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    const { jwt } = useAuthStore();
    
    const currentUserId = jwt?.access ? JSON.parse(atob(jwt.access.split('.')[1])).user_id : null;
    const isOwner = currentUserId === parseInt(id);

    const [profile, setProfile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [blogsPage, setBlogsPage] = useState(1);
    const [blogsHasMore, setBlogsHasMore] = useState(true);
    const [isFetchingMoreBlogs, setIsFetchingMoreBlogs] = useState(false);

    const [bookmarksPage, setBookmarksPage] = useState(1);
    const [bookmarksHasMore, setBookmarksHasMore] = useState(true);
    const [isFetchingMoreBookmarks, setIsFetchingMoreBookmarks] = useState(false);
    const [activeTab, setActiveTab] = useState(tabParam || 'published');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    
    // Edit Profile state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', bio: '', website: '', github: '', linkedin: '', avatar: null });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    function fetchUserBlogs(pageNumber = 1) {
        if (pageNumber > 1) setIsFetchingMoreBlogs(true);
        FetchWithAuth(`https://dottech-blog-app.onrender.com/users/${id}/blogs/?page=${pageNumber}`)
            .then(res => res.json())
            .then(data => {
                const results = data.results || data;
                setBlogs(prev => pageNumber === 1 ? results : [...prev, ...results]);
                setBlogsHasMore(!!data.next);
                setIsFetchingMoreBlogs(false);
            })
            .catch(err => {
                console.error(err);
                setIsFetchingMoreBlogs(false);
            });
    }

    function fetchUserBookmarks(pageNumber = 1) {
        if (pageNumber > 1) setIsFetchingMoreBookmarks(true);
        FetchWithAuth(`https://dottech-blog-app.onrender.com/users/${id}/bookmarks/?page=${pageNumber}`)
            .then(res => res.json())
            .then(data => {
                const results = data.results || data;
                setBookmarks(prev => pageNumber === 1 ? results : [...prev, ...results]);
                setBookmarksHasMore(!!data.next);
                setIsFetchingMoreBookmarks(false);
            })
            .catch(err => {
                console.error(err);
                setIsFetchingMoreBookmarks(false);
            });
    }

    useEffect(() => {
        setIsLoading(true);
        // Fetch Profile
        FetchWithAuth(`https://dottech-blog-app.onrender.com/users/${id}/profile/`)
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setIsFollowing(data.is_following);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });

        setBlogsPage(1);
        setBlogsHasMore(true);
        fetchUserBlogs(1);
        
        if (isOwner) {
            setBookmarksPage(1);
            setBookmarksHasMore(true);
            fetchUserBookmarks(1);
        }
    }, [id, isOwner]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200) {
                if (activeTab === 'published' || activeTab === 'drafts') {
                    if (!isLoading && !isFetchingMoreBlogs && blogsHasMore) {
                        const nextPage = blogsPage + 1;
                        setBlogsPage(nextPage);
                        fetchUserBlogs(nextPage);
                    }
                } else if (activeTab === 'bookmarks') {
                    if (!isLoading && !isFetchingMoreBookmarks && bookmarksHasMore) {
                        const nextPage = bookmarksPage + 1;
                        setBookmarksPage(nextPage);
                        fetchUserBookmarks(nextPage);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading, isFetchingMoreBlogs, blogsHasMore, blogsPage, activeTab, isFetchingMoreBookmarks, bookmarksHasMore, bookmarksPage, id]);

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditForm({ ...editForm, avatar: e.target.files[0] });
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        const formData = new FormData();
        Object.keys(editForm).forEach(key => {
            if (editForm[key] !== null && editForm[key] !== '') {
                // If the avatar is just the URL string from the backend, don't send it.
                if (key === 'avatar' && typeof editForm[key] === 'string') return;
                formData.append(key, editForm[key]);
            }
        });

        FetchWithAuth('https://dottech-blog-app.onrender.com/users/userProfile/', {
            method: 'PATCH',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            setProfile(prev => ({ ...prev, ...data }));
            setIsEditModalOpen(false);
            setIsSaving(false);
        })
        .catch(err => {
            console.error(err);
            setIsSaving(false);
        });
    };

    const openEditModal = () => {
        setEditForm({
            name: profile.name || '',
            bio: profile.bio || '',
            website: profile.website || '',
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            avatar: profile.avatar || null
        });
        setIsEditModalOpen(true);
    };

    const handleFollow = () => {
        setFollowLoading(true);
        FetchWithAuth(`https://dottech-blog-app.onrender.com/users/${id}/follow/`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                setIsFollowing(data.is_following);
                setProfile(prev => ({
                    ...prev,
                    followers_count: data.is_following ? prev.followers_count + 1 : prev.followers_count - 1
                }));
                setFollowLoading(false);
            })
            .catch(err => {
                console.error(err);
                setFollowLoading(false);
            });
    };

    if (isLoading) {
        return (
            <div className="max-w-[1000px] mx-auto px-4 py-16 animate-pulse">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-32 h-32 rounded-full bg-surface"></div>
                    <div className="flex-1 space-y-4 pt-4">
                        <div className="h-8 bg-surface rounded w-1/3"></div>
                        <div className="h-4 bg-surface rounded w-1/4"></div>
                        <div className="h-4 bg-surface rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center py-20 text-secondary-text">Profile not found.</div>;
    }

    const publishedBlogs = blogs.filter(b => b.is_published !== false); // fallback if missing
    const draftBlogs = blogs.filter(b => b.is_published === false);

    const joinDate = new Date(profile.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start mb-16 relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent-green flex-shrink-0 flex items-center justify-center text-white text-4xl font-serif font-bold overflow-hidden shadow-sm">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold font-serif text-foreground">{profile.name || "Anonymous"}</h1>
                                <p className="text-secondary-text mt-1">@{profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') : `user${profile.id}`}</p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {isOwner ? (
                                    <>
                                        <button onClick={openEditModal} className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm font-medium text-foreground hover:bg-surface transition-colors">
                                            <Edit className="w-4 h-4" /> Edit Profile
                                        </button>
                                        <Link to="/newblog" className="flex items-center gap-2 px-4 py-2 bg-accent-green hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors">
                                            <Plus className="w-4 h-4" /> New Story
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                                isFollowing 
                                                ? 'border border-border text-foreground hover:bg-surface' 
                                                : 'bg-foreground text-background hover:bg-foreground/90'
                                            }`}
                                        >
                                            {followLoading ? 'Wait...' : isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="text-foreground text-base leading-relaxed max-w-2xl mb-6">
                                {profile.bio}
                            </p>
                        )}

                        {/* Metadata/Links */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-text mb-8">
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                    <LinkIcon className="w-4 h-4" /> Website
                                </a>
                            )}
                            {profile.github && (
                                <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                            )}
                            {profile.linkedin && (
                                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> Joined {joinDate}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-8 md:gap-12 py-6 border-y border-border/50">
                            <StatCard label="Stories" value={publishedBlogs.length} />
                            <StatCard label="Total Reads" value={profile.total_views} />
                            <StatCard label="Likes" value={profile.total_likes_received} />
                            <StatCard label="Followers" value={profile.followers_count} />
                            <StatCard label="Following" value={profile.following_count} />
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column (Content) - 70% */}
                    <div className="w-full lg:w-[70%]">
                        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwner={isOwner} />
                        
                        <div className="min-h-[400px]">
                            {/* PUBLISHED TAB */}
                            {activeTab === 'published' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                    {publishedBlogs.length > 0 ? (
                                        publishedBlogs.map((b) => {
                                            const formattedDate = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const wordCount = b.content ? b.content.split(' ').length : 0;
                                            const readTimeCalc = Math.max(1, Math.ceil(wordCount / 200));
                                            return (
                                                <BlogCard 
                                                    key={b.slug}
                                                    author={profile.name || 'Anonymous'}
                                                    slug={b.slug}
                                                    title={b.title}
                                                    content={b.content}
                                                    createdAt={formattedDate}
                                                    readTime={`${readTimeCalc} min read`}
                                                    likes={b.likes_count || 0}
                                                    comments={0}
                                                    categories={b.categories || []}
                                                    thumbnail={b.thumbnail}
                                                />
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-16 border border-dashed border-border rounded-xl">
                                            <FileText className="w-12 h-12 text-secondary-text mx-auto mb-4 opacity-50" />
                                            <h3 className="text-lg font-bold font-serif text-foreground mb-2">No stories published yet</h3>
                                            {isOwner ? (
                                                <Link to="/newblog" className="text-accent-green hover:underline">Write your first story</Link>
                                            ) : (
                                                <p className="text-secondary-text">Check back later.</p>
                                            )}
                                        </div>
                                    )}
                                    {isFetchingMoreBlogs && (
                                        <div className="py-8 flex justify-center">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* DRAFTS TAB */}
                            {activeTab === 'drafts' && isOwner && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    {draftBlogs.length > 0 ? (
                                        draftBlogs.map(b => (
                                            <div key={b.slug} className="p-5 border border-border rounded-xl hover:border-foreground/30 transition-colors flex justify-between items-center bg-surface">
                                                <div>
                                                    <h3 className="text-lg font-bold font-serif text-foreground mb-1">{b.title || "Untitled Draft"}</h3>
                                                    <p className="text-sm text-secondary-text">Last edited {new Date(b.last_updated).toLocaleDateString('en-US')}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/newblog?edit=${b.slug}`} className="text-sm font-medium text-foreground hover:underline">Continue</Link>
                                                    <button className="p-2 text-secondary-text hover:text-red-500 transition-colors">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16">
                                            <p className="text-secondary-text">You have no drafts.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* BOOKMARKS TAB */}
                            {activeTab === 'bookmarks' && isOwner && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                    {bookmarks.length > 0 ? (
                                        bookmarks.map((b) => {
                                            const formattedDate = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const wordCount = b.content ? b.content.split(' ').length : 0;
                                            const readTimeCalc = Math.max(1, Math.ceil(wordCount / 200));
                                            return (
                                                <BlogCard 
                                                    key={b.slug}
                                                    author={b.author?.name || 'Anonymous'}
                                                    slug={b.slug}
                                                    title={b.title}
                                                    content={b.content}
                                                    createdAt={formattedDate}
                                                    readTime={`${readTimeCalc} min read`}
                                                    likes={b.likes_count || 0}
                                                    comments={0}
                                                    categories={b.categories || []}
                                                    thumbnail={b.thumbnail}
                                                />
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-16">
                                            <p className="text-secondary-text">You have no bookmarked stories.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ABOUT TAB */}
                            {activeTab === 'about' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose dark:prose-invert max-w-none">
                                    <h2 className="font-serif text-xl font-bold mb-4">About</h2>
                                    <p className="text-secondary-text leading-relaxed whitespace-pre-wrap">
                                        {profile.bio || "This user hasn't written a bio yet."}
                                    </p>
                                </motion.div>
                            )}
                            
                            {/* ACTIVITY TAB */}
                            {activeTab === 'activity' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="flex gap-4 mb-8">
                                        <div className="mt-1"><Activity className="w-5 h-5 text-accent-green" /></div>
                                        <div>
                                            <p className="text-foreground font-medium">Joined DotTech</p>
                                            <p className="text-sm text-secondary-text">{joinDate}</p>
                                        </div>
                                    </div>
                                    {publishedBlogs.length > 0 && (
                                        <div className="flex gap-4">
                                            <div className="mt-1"><FileText className="w-5 h-5 text-secondary-text" /></div>
                                            <div>
                                                <p className="text-foreground font-medium">Published a story</p>
                                                <Link to={`/${publishedBlogs[0].slug}`} className="text-sm text-accent-green hover:underline">
                                                    {publishedBlogs[0].title}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right Column (Sidebar) - 30% */}
                    <div className="w-full lg:w-[30%] space-y-10">
                        {/* Featured Story */}
                        {publishedBlogs.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Featured</h3>
                                <div className="group cursor-pointer">
                                    <h4 className="text-lg font-bold font-serif text-foreground group-hover:underline leading-tight mb-2">
                                        <Link to={`/${publishedBlogs[0].slug}`}>{publishedBlogs[0].title}</Link>
                                    </h4>
                                    <div dangerouslySetInnerHTML={{ __html: publishedBlogs[0].content.substring(0, 100) + '...' }} className="text-sm text-secondary-text line-clamp-3 mb-3"></div>
                                    <div className="text-xs text-secondary-text">
                                        {new Date(publishedBlogs[0].created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Achievements</h3>
                            <div className="flex flex-wrap gap-2">
                                {publishedBlogs.length >= 1 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-xs font-medium text-foreground">
                                        🏆 First Story
                                    </span>
                                )}
                                {profile.total_likes_received >= 10 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-xs font-medium text-foreground">
                                        🌟 Rising Star
                                    </span>
                                )}
                                {profile.followers_count >= 5 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-xs font-medium text-foreground">
                                        👥 Community Builder
                                    </span>
                                )}
                                {publishedBlogs.length === 0 && (
                                    <span className="text-sm text-secondary-text">Complete tasks to earn badges.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold font-serif text-foreground">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary-text hover:text-foreground">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {/* 
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Profile Picture (Avatar)</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-secondary-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-surface file:text-foreground hover:file:bg-border transition-colors cursor-pointer" />
                                {editForm.avatar && typeof editForm.avatar === 'object' && (
                                    <p className="text-xs text-accent-green mt-2">New image selected: {editForm.avatar.name}</p>
                                )}
                            </div> 
                            */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows="3" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent-green resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Website URL</label>
                                <input type="url" name="website" value={editForm.website} onChange={handleEditChange} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">GitHub URL</label>
                                <input type="url" name="github" value={editForm.github} onChange={handleEditChange} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent-green" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">LinkedIn URL</label>
                                <input type="url" name="linkedin" value={editForm.linkedin} onChange={handleEditChange} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent-green" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 rounded-full border border-border text-foreground text-sm font-medium hover:bg-surface">Cancel</button>
                                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-full bg-accent-green text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default Profile;
