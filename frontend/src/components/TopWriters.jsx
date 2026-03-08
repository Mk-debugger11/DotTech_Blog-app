import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FetchWithAuth from '../utils/fetchWithAuth';
import useAuthStore from '../store/store';

const fetchTopWriters = async ({ pageParam = 1 }) => {
    const res = await FetchWithAuth(`https://dottech-blog-app.onrender.com/users/top-writers/?limit=5&page=${pageParam}`);
    if (!res.ok) throw new Error('Failed to fetch top writers');
    return res.json();
};

const TopWriters = () => {
    const queryClient = useQueryClient();
    const { jwt } = useAuthStore();
    const isAuthenticated = !!jwt;

    const [page, setPage] = useState(1);
    const [allWriters, setAllWriters] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    const { data: responseData, isLoading, isError, isFetching } = useQuery({
        queryKey: ['topWriters', page],
        queryFn: () => fetchTopWriters({ pageParam: page }),
    });

    useEffect(() => {
        if (responseData) {
            const results = responseData.results || responseData;
            setAllWriters(prev => page === 1 ? results : [...prev, ...results]);
            setHasMore(!!responseData.next);
        }
    }, [responseData, page]);

    const followMutation = useMutation({
        mutationFn: async (userId) => {
            const res = await FetchWithAuth(`https://dottech-blog-app.onrender.com/users/${userId}/follow/`, {
                method: 'POST',
                body: JSON.stringify({})
            });
            if (!res.ok) throw new Error('Failed to toggle follow');
            return res.json();
        },
        onMutate: async (userId) => {
            await queryClient.cancelQueries({ queryKey: ['topWriters'] });
            const previousWriters = queryClient.getQueryData(['topWriters']);
            
            queryClient.setQueryData(['topWriters', page], (old) => {
                if (!old) return old;
                // Handle both object with results or direct array
                const isPaginated = !!old.results;
                const arr = isPaginated ? old.results : old;
                
                const updatedArr = arr.map(w => {
                    if (w.id === userId) {
                        const newIsFollowing = !w.is_following;
                        return {
                            ...w,
                            is_following: newIsFollowing,
                            followers_count: newIsFollowing ? w.followers_count + 1 : Math.max(0, w.followers_count - 1)
                        };
                    }
                    return w;
                });
                
                // Also update local state so UI updates instantly
                setAllWriters(prev => prev.map(w => {
                    if (w.id === userId) {
                        const newIsFollowing = !w.is_following;
                        return {
                            ...w,
                            is_following: newIsFollowing,
                            followers_count: newIsFollowing ? w.followers_count + 1 : Math.max(0, w.followers_count - 1)
                        };
                    }
                    return w;
                }));
                
                if (isPaginated) {
                    return { ...old, results: updatedArr };
                }
                return updatedArr;
            });
            
            return { previousWriters };
        },
        onError: (err, userId, context) => {
            if (context?.previousWriters) {
                queryClient.setQueryData(['topWriters'], context.previousWriters);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['topWriters'] });
        }
    });

    const handleFollowClick = (e, userId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            window.location.href = '/'; 
            return;
        }
        followMutation.mutate(userId);
    };
    
    const handleLoadMore = () => {
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className="mt-12 bg-surface p-6 rounded-xl border border-border">
                <h3 className="text-sm font-bold font-sans text-foreground uppercase tracking-wider mb-6 pb-2 border-b border-border">
                    Top Writers
                </h3>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-border"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-border rounded w-2/3"></div>
                                <div className="h-3 bg-border rounded w-1/2"></div>
                            </div>
                            <div className="w-16 h-8 rounded-full bg-border"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mt-12 bg-surface p-6 rounded-xl border border-border text-center">
                <p className="text-secondary-text text-sm">Could not load top writers.</p>
            </div>
        );
    }

    if (!allWriters || allWriters.length === 0) {
        return (
            <div className="mt-12 bg-surface p-6 rounded-xl border border-border text-center">
                <p className="text-secondary-text text-sm">No active writers this month.</p>
            </div>
        );
    }

    return (
        <div className="mt-12 bg-surface p-6 rounded-xl border border-border">
            <h3 className="text-sm font-bold font-sans text-foreground uppercase tracking-wider mb-6 pb-2 border-b border-border flex items-center justify-between">
                <span>Top Writers</span>
                <span className="text-[10px] font-normal text-secondary-text uppercase tracking-wider border border-border px-2 py-0.5 rounded-full">Last 30 Days</span>
            </h3>
            <div className="space-y-6">
                {allWriters.map((writer) => {
                    const avatarUrl = writer.avatar?.startsWith('http') 
                        ? writer.avatar 
                        : (writer.avatar ? `https://dottech-blog-app.onrender.com${writer.avatar}` : null);
                        
                    return (
                        <motion.div 
                            key={writer.id}
                            className="flex items-center gap-3 group"
                            whileHover={{ x: 4 }}
                        >
                            <Link to={`/user/${writer.id}`} className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-border text-center flex items-center justify-center font-bold text-secondary-text border border-border">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={writer.name} className="w-full h-full object-cover" />
                                    ) : (
                                        writer.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>
                            
                            <div className="flex-1 min-w-0">
                                <Link to={`/user/${writer.id}`}>
                                    <h4 className="text-sm font-bold text-foreground truncate group-hover:text-accent-green transition-colors">
                                        {writer.name}
                                    </h4>
                                </Link>
                                <p className="text-xs text-secondary-text truncate mt-0.5">
                                    {writer.bio || `${writer.followers_count} followers`}
                                </p>
                            </div>
                            
                            <button
                                onClick={(e) => handleFollowClick(e, writer.id)}
                                disabled={followMutation.isPending}
                                className={`flex-shrink-0 text-xs font-medium px-4 py-1.5 rounded-full transition-colors ${
                                    writer.is_following 
                                        ? 'bg-border text-foreground hover:bg-red-500/10 hover:text-red-500' 
                                        : 'bg-foreground text-background hover:bg-accent-green'
                                }`}
                            >
                                {writer.is_following ? 'Following' : 'Follow'}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
            
            {hasMore && (
                <button 
                    onClick={handleLoadMore} 
                    disabled={isFetching}
                    className="w-full mt-6 text-xs font-medium text-secondary-text hover:text-foreground transition-colors py-2 border border-border rounded-lg bg-surface hover:bg-border"
                >
                    {isFetching ? 'Loading...' : 'Show More Writers'}
                </button>
            )}
        </div>
    );
};

export default TopWriters;
