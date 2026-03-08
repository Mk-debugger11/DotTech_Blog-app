import React, { useState, useEffect } from 'react';
import FetchWithAuth from '../utils/fetchWithAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

// Lucide icons for toolbar
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, ImageIcon, Strikethrough } from 'lucide-react';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL of the image:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 mb-4 bg-surface border border-border rounded-lg shadow-sm sticky top-[72px] z-10 text-secondary-text">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('bold') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('italic') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('strike') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Strikethrough className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-border mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Heading2 className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-border mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('bulletList') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('orderedList') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-background transition-colors ${editor.isActive('blockquote') ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
                <Quote className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-border mx-1"></div>
            
            <button
                type="button"
                onClick={addImage}
                className="p-2 rounded hover:bg-background transition-colors"
            >
                <ImageIcon className="w-4 h-4" />
            </button>
            
            <input
                type="color"
                onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
                data-testid="setColor"
                className="w-6 h-6 ml-2 cursor-pointer border-0 p-0 rounded overflow-hidden"
                title="Text Color"
            />
        </div>
    );
};

const BlogPostForm = () => {
    const navigate = useNavigate(); 
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const editSlug = searchParams.get('edit');

    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [categoryIds, setCategoryIds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDrafting, setIsDrafting] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(!!editSlug);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl mx-auto my-6 shadow-sm',
                },
            }),
            TextStyle,
            Color,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none font-sans text-foreground leading-relaxed whitespace-pre-wrap focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            setHasContent(!editor.isEmpty);
        },
    });

    useEffect(() => {
        // Fetch categories
        fetch('https://dottech-blog-app.onrender.com/blogs/categories/')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);

        if (editSlug) {
            FetchWithAuth(`https://dottech-blog-app.onrender.com/blogs/${editSlug}`)
                .then(res => {
                    if(!res.ok) throw new Error('Failed to fetch draft');
                    return res.json();
                })
                .then(data => {
                    setTitle(data.title);
                    setThumbnail(data.thumbnail || '');
                    setCategoryIds(data.categories?.map(c => c.id) || []);
                    if (editor) {
                        editor.commands.setContent(data.content);
                        setHasContent(!!data.content);
                    }
                    setIsLoadingEdit(false);
                })
                .catch(err => {
                    console.error(err);
                    alert("Could not load the draft.");
                    setIsLoadingEdit(false);
                });
        }
    }, [editSlug, editor]);

    const handleSubmit = (e, asDraft = false) => {
        e.preventDefault();
        
        const content = editor?.getHTML() || '';
        
        // Basic validation
        if (!title.trim() || !hasContent) return;
        
        if (asDraft) {
            setIsDrafting(true);
        } else {
            setIsPublishing(true);
        }

        const formData = {
            title: title,
            thumbnail: thumbnail,
            content: content,
            category_ids: categoryIds,
            is_published: !asDraft
        };

        const url = editSlug ? `https://dottech-blog-app.onrender.com/blogs/${editSlug}` : `https://dottech-blog-app.onrender.com/blogs/`;
        const method = editSlug ? 'PATCH' : 'POST';

        FetchWithAuth(url, {
            method: method,
            body: JSON.stringify(formData)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(JSON.stringify(data));
            }
            return data;
        })
        .then((data) => {
            console.log('Blog saved:', data);
            setTitle('');
            setThumbnail('');
            setCategoryIds([]);
            editor?.commands.setContent('');
            setHasContent(false);
            setIsPublishing(false);
            setIsDrafting(false);
            if (asDraft) {
                alert("Draft saved successfully!");
                navigate('/user/me?tab=drafts'); // Wait, currentUserId is better, or let's just go back
                // Or maybe just redirect to home
                navigate('/');
            } else {
                navigate(`/${data.slug || ''}`);
            }
        })
        .catch((err) => {
            console.error('Backend validation or server error:', err.message);
            alert(`Failed to save: ${err.message}`);
            setIsPublishing(false);
            setIsDrafting(false);
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-background relative"
        >
            {isLoadingEdit && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="text-foreground font-medium">Loading draft...</div>
                </div>
            )}
            <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-[680px] mx-auto px-4 pt-12 md:pt-16 pb-32">
                
                {/* Editor Top Bar/Actions */}
                <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                    <p className="text-sm text-secondary-text">{editSlug ? "Editing Draft" : "Draft in Progress"}</p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={!title.trim() || !hasContent || isPublishing || isDrafting}
                            className={`font-medium py-1.5 px-4 rounded-full border border-border transition-colors text-sm ${
                                !title.trim() || !hasContent || isPublishing || isDrafting
                                ? 'text-secondary-text cursor-not-allowed opacity-50'
                                : 'text-foreground hover:bg-surface'
                            }`}
                        >
                            {isDrafting ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !hasContent || isPublishing || isDrafting}
                            className={`font-medium py-1.5 px-4 rounded-full transition-colors text-sm ${
                                !title.trim() || !hasContent || isPublishing || isDrafting
                                ? 'bg-border text-secondary-text cursor-not-allowed'
                                : 'bg-accent-green hover:bg-green-700 text-white'
                            }`}
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Title Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className="w-full bg-transparent border-none focus:ring-0 text-4xl md:text-5xl font-serif font-bold text-foreground placeholder-secondary-text/50 p-0"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Thumbnail Input */}
                <div className="mb-6">
                    <input
                        type="url"
                        name="thumbnail"
                        placeholder="Thumbnail Image URL (Optional)"
                        className="w-full bg-transparent border-none focus:ring-0 text-lg font-sans text-secondary-text placeholder-secondary-text/50 p-0"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                    />
                </div>

                {/* Category Input (Multi-Select Pills) */}
                <div className="mb-6 border-b border-border pb-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-secondary-text mb-3">Select Topics</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => {
                            const isSelected = categoryIds.includes(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            setCategoryIds(prev => prev.filter(id => id !== cat.id));
                                        } else {
                                            setCategoryIds(prev => [...prev, cat.id]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                        isSelected 
                                            ? 'bg-accent-green/10 text-accent-green border-accent-green' 
                                            : 'bg-surface text-secondary-text border-border hover:border-foreground'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tiptap Editor */}
                <div className="relative">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                </div>

            </form>
        </motion.div>
    );
};

export default BlogPostForm;
