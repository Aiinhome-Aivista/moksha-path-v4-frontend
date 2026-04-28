import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ApiServices from "../../services/ApiServices";
import { Loader2, BookOpen } from "lucide-react";

export const BlogPage = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const [allStudyMaterials, setAllStudyMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const fetchPublicBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await ApiServices.getPublicBlogs();
      if (response.data.code === 200 || response.data.status === "success") {
        setAllStudyMaterials(response.data.data || []);
      }
    } catch (error) {
      // console.error("Error fetching public blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicBlogs();
  }, []);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Pagination Logic
  const totalPosts = allStudyMaterials.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
  const currentPosts = allStudyMaterials.slice(startIndex, endIndex);

  // Handlers for buttons
  const goToPage = (page: number) => setCurrentPage(page);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-gray-50 font-sans min-h-screen w-full">
      {/* Invisible div acting as our scroll anchor */}
      <div ref={topRef} className="h-0 w-0" />

      {/* INCREASED WIDTH HERE: Changed from max-w-7xl to max-w-[1400px] */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8">
        {/* Blog Grid */}
        <div className="flex justify-center min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#FCEA0A] mb-4" size={50} />
              <p className="text-gray-500 font-medium">
                Fetching latest blogs...
              </p>
            </div>
          ) : currentPosts.length > 0 ? (
            <div className="inline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Card Image */}
                  <div className="h-52 bg-gray-200 overflow-hidden p-3 rounded-t-xl">
                    <div className="w-full h-full rounded-lg overflow-hidden relative">
                      <img
                        src={encodeURI(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        // onError={(e: any) => {
                        //   e.target.src =
                        //     "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80";
                        // }}
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">
                      {post.category}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-800 leading-snug mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-xs text-gray-500 italic mb-4">
                      Leave a Comment / {post.category} / {post.author}
                    </p>
                    <p className="text-sm text-gray-600 mb-6 flex-grow line-clamp-3">
                      {(() => {
                        let plainExcerpt =
                          post.excerpt?.replace(/<[^>]*>?/gm, " ").trim() || "";
                        if (plainExcerpt.startsWith(post.title)) {
                          plainExcerpt = plainExcerpt
                            .substring(post.title.length)
                            .trim();
                        }
                        // Truncate to 150 chars if longer and add ellipsis
                        return plainExcerpt.length > 150
                          ? plainExcerpt.substring(0, 150) + "..."
                          : plainExcerpt;
                      })()}
                    </p>

                    {/* Link pinned to bottom */}
                    <Link
                      to={`/blogs/${post.slug}`}
                      className="w-full py-2.5 bg-[#FCEA0A] hover:bg-yellow-400 text-black font-medium text-sm rounded transition-colors mt-auto text-center block shadow-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No blogs found
              </h2>
              <p className="text-gray-500">
                We haven't published any articles yet. Please check back later!
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination */}
        <div className="mt-12 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-600">
          <div className="flex space-x-1">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="px-3 md:px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>

            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 md:px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => goToPage(number)}
                className={`px-3 md:px-4 py-2 font-medium rounded shadow-sm transition-all duration-200 ${
                  currentPage === number
                    ? "bg-[#FCEA0A] text-black"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-[#fef08a]"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 md:px-4 py-2 bg-[#FCEA0A] text-black font-medium rounded shadow-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-3 md:px-4 py-2 bg-[#FCEA0A] text-black font-medium rounded shadow-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>

          <div className="font-medium text-gray-500">
            Showing {totalPosts > 0 ? startIndex + 1 : 0}-{endIndex} of{" "}
            {totalPosts} articles
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
