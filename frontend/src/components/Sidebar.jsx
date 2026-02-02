import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const trendingStories = [
    { id: '01', title: 'Why React 19 is a Game Changer', author: 'Dan Abramov', readTime: '5 min read' },
    { id: '02', title: 'Building Scalable APIs with Django', author: 'Jane Doe', readTime: '8 min read' },
    { id: '03', title: 'The Future of AI in Software Engineering', author: 'John Smith', readTime: '12 min read' },
  ];

  const recommendedTopics = [
    'React', 'Django', 'JavaScript', 'AI', 'Machine Learning', 'Startups', 'Web Development', 'Career'
  ];

  const topWriters = [
    { id: 1, name: 'Alice Walker', avatar: 'AW' },
    { id: 2, name: 'Bob Singer', avatar: 'BS' },
    { id: 3, name: 'Charlie Day', avatar: 'CD' },
  ];

  return (
    <aside className="sticky top-24 space-y-10 pl-6 border-l border-border min-h-[calc(100vh-120px)]">
      
      {/* Trending Stories */}
      <div>
        <h3 className="font-sans font-bold text-base mb-6 text-foreground flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          Trending on DotTech
        </h3>
        <div className="space-y-6">
          {trendingStories.map((story) => (
            <motion.div 
              key={story.id} 
              className="flex gap-4 group cursor-pointer"
              whileHover={{ x: 4 }}
            >
              <span className="text-3xl font-bold text-border group-hover:text-secondary-text transition-colors">
                {story.id}
              </span>
              <div>
                <p className="text-sm text-foreground font-medium mb-1">
                  <span className="inline-block w-4 h-4 bg-foreground rounded-full mr-2 align-middle"></span>
                  {story.author}
                </p>
                <h4 className="font-bold text-foreground leading-tight group-hover:text-accent-green transition-colors">
                  {story.title}
                </h4>
                <p className="text-xs text-secondary-text mt-1">{story.readTime}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended Topics */}
      <div>
        <h3 className="font-sans font-bold text-base mb-4 text-foreground">Recommended Topics</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedTopics.map(topic => (
            <span 
              key={topic} 
              className="bg-surface hover:bg-border text-foreground text-sm py-2 px-4 rounded-full cursor-pointer transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Top Writers */}
      <div>
        <h3 className="font-sans font-bold text-base mb-4 text-foreground">Top Writers</h3>
        <div className="space-y-4">
          {topWriters.map(writer => (
            <div key={writer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-border rounded-full flex items-center justify-center text-sm font-medium text-secondary-text">
                  {writer.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{writer.name}</p>
                  <p className="text-xs text-secondary-text">Top writer in Tech</p>
                </div>
              </div>
              <button className="text-sm font-medium text-accent-green hover:text-green-800 transition-colors border border-accent-green rounded-full px-3 py-1 hover:bg-accent-green hover:text-white">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Card */}
      <div className="bg-surface p-6 rounded-xl border border-border">
        <h3 className="font-bold text-foreground mb-2">Stay in the loop</h3>
        <p className="text-sm text-secondary-text mb-4">Get the latest tech stories delivered weekly.</p>
        <div className="flex flex-col gap-3">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="border border-border bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-accent-green focus:ring-1 focus:ring-accent-green"
          />
          <button className="bg-foreground text-white font-medium text-sm py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Footer Links (Medium style) */}
      <div className="pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-xs text-secondary-text">
        <span className="cursor-pointer hover:text-foreground">Help</span>
        <span className="cursor-pointer hover:text-foreground">Status</span>
        <span className="cursor-pointer hover:text-foreground">About</span>
        <span className="cursor-pointer hover:text-foreground">Careers</span>
        <span className="cursor-pointer hover:text-foreground">Press</span>
        <span className="cursor-pointer hover:text-foreground">Blog</span>
        <span className="cursor-pointer hover:text-foreground">Privacy</span>
        <span className="cursor-pointer hover:text-foreground">Terms</span>
        <span className="cursor-pointer hover:text-foreground">Text to speech</span>
      </div>
    </aside>
  );
};

export default Sidebar;
