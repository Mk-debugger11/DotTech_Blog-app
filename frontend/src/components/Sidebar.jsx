import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TopWriters from './TopWriters';

const Sidebar = () => {
  const [trendingStories, setTrendingStories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrending = (pageNumber) => {
      setIsLoading(true);
      fetch(`https://dottech-blog-app.onrender.com/blogs/trending/?limit=3&page=${pageNumber}`)
          .then(res => res.json())
          .then(data => {
              const results = data.results || data;
              setTrendingStories(prev => pageNumber === 1 ? results : [...prev, ...results]);
              setHasMore(!!data.next);
              setIsLoading(false);
          })
          .catch(err => {
              console.error(err);
              setIsLoading(false);
          });
  };

  useEffect(() => {
      fetchTrending(1);
  }, []);

  const handleLoadMore = () => {
      if (!isLoading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTrending(nextPage);
      }
  };


  return (
    <aside className="lg:sticky lg:top-24 space-y-10 lg:pl-6 lg:border-l border-border lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pb-12" style={{ scrollbarWidth: 'none' }}>
      
      {/* Trending Stories */}
      <div>
        <h3 className="font-sans font-bold text-base mb-6 text-foreground flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          Trending on DotTech
        </h3>
        <div className="space-y-6">
          {trendingStories.length > 0 ? trendingStories.map((story, index) => {
            const rank = (index + 1).toString().padStart(2, '0');
            const authorName = story.author?.name || 'Anonymous';
            const wordCount = story.content ? story.content.split(' ').length : 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));

            return (
              <motion.div 
                key={story.slug} 
                className="flex gap-4 group cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <span className="text-3xl font-bold text-border group-hover:text-secondary-text transition-colors">
                  {rank}
                </span>
                <div>
                  <Link to={`/user/${story.author?.id}`}>
                    <p className="text-sm text-foreground font-medium mb-1 group-hover:opacity-80">
                      <span className="inline-block w-4 h-4 rounded-full mr-2 align-middle overflow-hidden bg-border text-center text-[10px] leading-4">
                        {story.author?.avatar ? (
                          <img src={story.author.avatar.startsWith('http') ? story.author.avatar : `https://dottech-blog-app.onrender.com${story.author.avatar}`} alt={authorName} className="w-full h-full object-cover" />
                        ) : authorName.charAt(0).toUpperCase()}
                      </span>
                      {authorName}
                    </p>
                  </Link>
                  <Link to={`/${story.slug}`}>
                    <h4 className="font-bold text-foreground leading-tight group-hover:text-accent-green transition-colors line-clamp-2">
                      {story.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-secondary-text mt-1">{readTime} min read</p>
                </div>
              </motion.div>
            );
          }) : (
            <div className="animate-pulse space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-border rounded"></div>
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="h-3 w-20 bg-border rounded"></div>
                      <div className="h-4 w-full bg-border rounded"></div>
                      <div className="h-3 w-16 bg-border rounded"></div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
        {hasMore && (
          <button 
            onClick={handleLoadMore} 
            disabled={isLoading}
            className="w-full mt-4 text-xs font-medium text-secondary-text hover:text-foreground transition-colors py-2 border border-border rounded-lg bg-surface hover:bg-border"
          >
            {isLoading ? 'Loading...' : 'Show More Trending'}
          </button>
        )}
      </div>

      <TopWriters />



    </aside>
  );
};

export default Sidebar;
