import { Link } from "react-router-dom";
const BlogCard = (props) => {
    return (
        <div className="flex flex-col md:flex-row justify-between gap-6 border-b py-6 px-4 max-w-4xl mx-auto">
            {/* Left content */}
            <div className="flex-1">
                {/* Author */}
                <p className="text-sm text-gray-600 mb-1">
                    <span className="inline-block w-5 h-5 bg-black rounded-full mr-1 align-middle"></span>
                    by <span className="font-medium">{props.author}</span>
                </p>

                {/* Title */}
                <h2 className="text-2xl font-bold text-black leading-snug">
                    <Link to={`/${props.slug}`}>{props.title}</Link>
                </h2>

                {/* Subtitle */}
                <p className="text-gray-500 mt-1">
                   {props.content}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 flex-wrap">
                    <span className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>{props.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                        Like
                    </span>
                    <span className="flex items-center gap-1">
                       Comments
                    </span>
                </div>
            </div>

            {/* Right image */}
            <div className="w-full md:w-[200px] flex-shrink-0">
                
            </div>
        </div>
    );
};

export default BlogCard;
