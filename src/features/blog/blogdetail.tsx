import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ApiServices from "../../services/ApiServices";
import { Loader2 } from "lucide-react";

// ==========================================
// GLOBAL DATE FORMATTER (DD/MM/YYYY)
// ==========================================
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Invalid Date";
  }
};
// ==========================================

export const BlogDetail = () => {
  const params = useParams();
  const slug = Object.values(params)[0];
  const [blog, setBlog] = useState<any>(null);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [prevBlog, setPrevBlog] = useState<any>(null);
  const [nextBlog, setNextBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlogData = async () => {
      setIsLoading(true);
      try {
        const response = await ApiServices.getPublicBlogs();
        if (response.data.code === 200 || response.data.status === "success") {
          const allBlogs = response.data.data || [];
          const foundBlog = allBlogs.find(
            (b: any) =>
              b.slug.toLowerCase().trim() === slug?.toLowerCase().trim(),
          );
          setBlog(foundBlog || null);

          if (foundBlog) {
            const currentIndex = allBlogs.findIndex(
              (b: any) =>
                b.slug.toLowerCase().trim() === slug?.toLowerCase().trim(),
            );

            if (currentIndex !== -1) {
              // Assuming allBlogs is ordered by Date DESC (index 0 is newest)
              // Next (newer) is at currentIndex - 1
              setNextBlog(allBlogs[currentIndex - 1] || null);
              // Previous (older) is at currentIndex + 1
              setPrevBlog(allBlogs[currentIndex + 1] || null);
            }

            // Set sidebar articles
            const others = allBlogs.filter((b: any) => b.slug !== slug);
            setLatestArticles(others.slice(0, 5));

            // Related articles logic
            const related = others.filter(
              (b: any) => b.category === foundBlog.category,
            );
            const nonRelated = others.filter(
              (b: any) => b.category !== foundBlog.category,
            );
            setRelatedArticles([...related, ...nonRelated].slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Error fetching blog details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchBlogData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-[#FCEA0A] mb-4 mx-auto"
            size={50}
          />
          <p className="text-gray-500 font-medium">
            Loading article details...
          </p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-white font-sans min-h-screen pb-12 w-full">
        <div className="max-w-[1400px] mx-auto px-4 py-20 md:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            The blog post you are looking for does not exist. (URL slug: "
            {slug || "not provided"}")
          </p>
          <Link
            to="/blogs"
            className="px-6 py-3 bg-[#ffed00] text-black font-medium rounded-lg shadow-md hover:bg-yellow-400 transition-colors"
          >
            Back to All Blogs
          </Link>
        </div>
      </div>
    );
  }

  const imageBaseUrl = `${import.meta.env.VITE_API_BASE_URL}blogs/get-image/`;

  return (
    <div className="bg-white font-sans min-h-screen pb-12 w-full">
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: Main Article Content */}
          <div className="w-full lg:w-[65%] xl:w-[70%] border border-gray-100 shadow-sm rounded-lg overflow-hidden bg-white">
            {/* Hero Image */}
            <div className="w-full h-[300px] md:h-[450px] bg-gray-100">
              <img
                src={
                  blog.image?.startsWith("http")
                    ? blog.image
                    : `${imageBaseUrl}${blog.image}`
                }
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>

            {/* Article Content Padding Container */}
            <div className="p-6 md:p-10">
              {/* Category & Title */}
              <p className="text-[12px] font-bold text-blue-700 uppercase tracking-widest mb-3">
                {blog.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-4">
                {blog.title}
              </h1>

              {/* Meta Data */}
              <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                {formatDate(blog.publishDate || blog.created_at)} /{" "}
                {blog.category} / by {blog.author}
              </p>

              {/* Social Share Buttons */}
              <div className="flex items-center space-x-2 mb-10">
                <span className="text-gray-500 text-sm font-medium mr-2">
                  Share
                </span>
                {/* Facebook */}
                <button className="w-8 h-8 bg-[#1877f2] flex items-center justify-center text-white rounded-sm hover:opacity-90">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                {/* Twitter / X */}
                <button className="w-8 h-8 bg-black flex items-center justify-center text-white rounded-sm hover:opacity-90">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                {/* LinkedIn */}
                <button className="w-8 h-8 bg-[#0a66c2] flex items-center justify-center text-white rounded-sm hover:opacity-90">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>

              {/* Dynamic Blog Text Content */}
              <div className="prose max-w-none text-gray-700 text-[16px] blog-content-rendered">
                {/* 
                  Only show content once. If blog_content is available, use it. 
                  If not, use excerpt as the primary content but style it as full content.
                */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: blog.blog_content || blog.excerpt || "",
                  }}
                  className="leading-relaxed"
                />
              </div>

              {/* Comprehensive styles for rendered HTML content */}
              <style>{`
                .blog-content-rendered h1, .blog-content-rendered h2, .blog-content-rendered h3 { font-weight: 700; color: #111827; line-height: 1.3; }
                .blog-content-rendered h1 { font-size: 1.875rem; margin: 2rem 0 1.5rem; }
                .blog-content-rendered h2 { font-size: 1.5rem; margin: 1.75rem 0 1.25rem; }
                .blog-content-rendered h3 { font-size: 1.25rem; margin: 1.5rem 0 1rem; }
                .blog-content-rendered p { margin-bottom: 1.25rem; line-height: 1.75; color: #374151; }
                .blog-content-rendered strong { font-weight: 700; color: #111827; }
                .blog-content-rendered a { color: #b0cb1f; text-decoration: underline; transition: color 0.2s; }
                .blog-content-rendered a:hover { color: #c4e02a; }
                .blog-content-rendered ul, .blog-content-rendered ol { margin-left: 1.5rem; margin-bottom: 1.25rem; }
                .blog-content-rendered ul { list-style-type: disc; }
                .blog-content-rendered ol { list-style-type: decimal; }
                .blog-content-rendered li { margin-bottom: 0.5rem; }
                .blog-content-rendered blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #6b7280; }
                .blog-content-rendered table { width: 100%; margin: 1.5rem 0; border-collapse: collapse; table-layout: auto; }
                .blog-content-rendered th, .blog-content-rendered td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
                .blog-content-rendered th { background-color: #f3f4f6; font-weight: 700; }


              `}</style>

              {/* Added Previous / Next Navigation Section */}
              {/* <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-8">
                <div className="flex-1 w-full text-left">
                  {prevBlog && (
                    <Link to={`/blogs/${prevBlog.slug}`} className="block group">
                      <span className="block text-xs text-gray-400 mb-2">Previous Post</span>
                      <span className="block text-[14px] font-medium text-[#b0cb1f] group-hover:opacity-80 transition-opacity">
                        {prevBlog.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex-1 w-full text-left sm:text-right">
                  {nextBlog && (
                    <Link to={`/blogs/${nextBlog.slug}`} className="block group">
                      <span className="block text-xs text-gray-400 mb-2">Next Post</span>
                      <span className="block text-[14px] font-medium text-[#b0cb1f] group-hover:opacity-80 transition-opacity">
                        {nextBlog.title}
                      </span>
                    </Link>
                  )}
                </div>
              </div> */}
              <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-8">
                <div className="flex-1 w-full text-left">
                  {nextBlog && (
                    <Link
                      to={`/blogs/${nextBlog.slug}`}
                      className="block group"
                    >
                      <span className="block text-xs text-gray-400 mb-2">
                        Previous Post
                      </span>
                      <span className="block text-[14px] font-medium text-[#b0cb1f] group-hover:opacity-80 transition-opacity">
                        {nextBlog.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex-1 w-full text-left sm:text-right">
                  {prevBlog && (
                    <Link
                      to={`/blogs/${prevBlog.slug}`}
                      className="block group"
                    >
                      <span className="block text-xs text-gray-400 mb-2">
                        Next Post
                      </span>
                      <span className="block text-[14px] font-medium text-[#b0cb1f] group-hover:opacity-80 transition-opacity">
                        {prevBlog.title}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col space-y-8">
            {/* LATEST ARTICLES WIDGET */}
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-lg">
              <div className="inline-block bg-[#ffed00] text-black font-bold text-[13px] px-3 py-1.5 uppercase tracking-wide mb-6">
                LATEST ARTICLES
              </div>

              <div className="flex flex-col space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {latestArticles.map((article) => (
                  <Link
                    to={`/blogs/${article.slug}`}
                    key={article.slug}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <img
                      src={
                        article.image?.startsWith("http")
                          ? article.image
                          : `${imageBaseUrl}${article.image}`
                      }
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e: any) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-[14px] font-semibold text-gray-800 leading-snug group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-2">
                        {article.category} | {formatDate(article.publishDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* RELATED ARTICLES WIDGET */}
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-lg">
              <div className="inline-block bg-[#ffed00] text-black font-bold text-[13px] px-3 py-1.5 uppercase tracking-wide mb-6">
                RELATED ARTICLES
              </div>

              <div className="flex flex-col space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {relatedArticles.map((article) => (
                  <Link
                    to={`/blogs/${article.slug}`}
                    key={`related-${article.slug}`}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <img
                      src={
                        article.image?.startsWith("http")
                          ? article.image
                          : `${imageBaseUrl}${article.image}`
                      }
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e: any) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-[14px] font-semibold text-gray-800 leading-snug group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 mt-2">
                        {article.category} | {formatDate(article.publishDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
