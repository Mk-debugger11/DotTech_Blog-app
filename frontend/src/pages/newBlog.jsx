import React, { useState } from 'react'
import FetchWithAuth from '../utils/fetchWithAuth';
import { useNavigate } from 'react-router-dom';
const BlogPostForm = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });

    const handleChange = (e) => {
        setFormData(prev => ({...prev,[e.target.name]: e.target.value,}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(JSON.stringify(formData))
        // fetch('http://127.0.0.1:8000/blogs/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${jwt.access}`
        //     },
        //     body: JSON.stringify(formData),
        // })
        //     .then((res) => {
        //         return res.json();
        //     })
        //     .then((data) => {
        //         console.log('Blog created:', data);
        //         setFormData({ title: '', content: '' });
        //     })
        //     .catch((err) => {
        //         console.error('Error:', err);
        //     });
        FetchWithAuth(`http://127.0.0.1:8000/blogs/`,{
            method:'POST',
            body:JSON.stringify(formData)
        })
        .then((res)=>{
            return res.json()
        })
        .then((data)=>{
            console.log('Blog created:', data);
            setFormData({ title: '', content: '' });
            navigate('/')
        })
    };

    return (
        <div className="max-w-xl mx-auto p-6 border rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create Blog Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        className="w-full border p-2 rounded"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block font-medium">Content</label>
                    <textarea
                        name="content"
                        className="w-full border p-2 rounded"
                        rows={6}
                        value={formData.content}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default BlogPostForm;
