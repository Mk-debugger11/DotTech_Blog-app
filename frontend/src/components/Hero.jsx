import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between min-h-[450px] md:min-h-[550px] py-12">
        {/* Left side content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-3/5"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
            Where great ideas find readers.
          </h1>
          <p className="text-lg md:text-xl text-secondary-text mb-8 max-w-xl font-sans">
            Discover stories, thinking, and expertise from writers on technology, startups, AI, and software development.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/newblog" 
              className="bg-accent-green hover:bg-green-700 text-white font-medium py-3 px-6 rounded-full transition-colors"
            >
              Start Writing
            </Link>
            <a 
              href="#feed" 
              className="bg-white border border-border hover:bg-surface text-foreground font-medium py-3 px-6 rounded-full transition-colors"
            >
              Explore Stories
            </a>
          </div>
        </motion.div>

        {/* Right side illustration (abstract shapes simulating editorial art) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:flex md:w-2/5 justify-center items-center relative h-64 mt-12 md:mt-0"
        >
          <div className="absolute top-0 right-10 w-32 h-32 bg-accent-green opacity-20 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="w-24 h-32 border-2 border-foreground rounded-t-full bg-white shadow-sm flex items-center justify-center">
              <span className="font-serif text-4xl">A</span>
            </div>
            <div className="w-24 h-32 bg-accent-green rounded-b-full flex items-center justify-center text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div className="w-24 h-24 bg-foreground rounded-full flex items-center justify-center text-white shadow-sm">
              <span className="font-serif text-3xl font-bold">"</span>
            </div>
            <div className="w-24 h-24 border-2 border-border rounded-xl flex items-center justify-center bg-surface">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-text"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
