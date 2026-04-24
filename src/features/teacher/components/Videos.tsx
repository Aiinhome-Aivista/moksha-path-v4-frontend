import React, { useState } from "react";
import { Play, ExternalLink, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export interface YouTubeLink {
  title: string;
  url: string;
  duration?: string;
  thumbnail?: string | null;
}

interface ResourceMaterialsProps {
  youtubeLinks: YouTubeLink[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 8;

const ResourceMaterials: React.FC<ResourceMaterialsProps> = ({
  youtubeLinks,
  isLoading = false,
}) => {
  const [uploadedVideos] = useState<YouTubeLink[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const allVideos = [...youtubeLinks, ...uploadedVideos];

  // Pagination Logic
  const totalPages = Math.ceil(allVideos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentVideos = allVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Loading videos...</p>
      </div>
    );
  }

  if (allVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Play size={40} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">No videos available</p>
        <p className="text-xs mt-1">
          Select a chapter and topic from the sidebar to load videos
        </p>
        {/* <div className="mt-6">
          <label className="flex items-center gap-2 cursor-pointer bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#A3C627] transition-colors">
            <span>Upload Video</span>
            <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
          </label>
        </div> */}
      </div>
    );
  }

  // Generate a YouTube thumbnail from a search URL or video URL
  // const getThumbnail = (url: string) => {
  //     // For search URLs, use a generic YouTube-style thumbnail
  //     const videoIdMatch = url.match(
  //         /(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  //     );
  //     if (videoIdMatch) {
  //         return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
  //     }
  //     return null;
  // };
  const getThumbnail = (url: string) => {
    if (!url) return null;
    try {
      const regex =
        /(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=|\/watch\?feature=player_embedded&v=)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      if (match) {
        return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Play size={20} className="text-red-500" />
        <h2 className="text-lg font-semibold text-gray-800">Videos</h2>
        <span className="px-4 py-2 rounded-full text-xs  bg-[#464646] text-white font-bold hover:bg-[#555555]">
          {allVideos.length} videos
        </span>
        {/* <label className="px-4 py-2 rounded-full text-xs  bg-[#A3C627] text-primary font-bold ml-auto flex items-center gap-2 cursor-pointer transition-colors">
          <Upload size={14} />
          <span>Upload</span>
          <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
        </label> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentVideos.map((link, index) => {
          const thumbnail = link.thumbnail || getThumbnail(link.url);

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group no-underline"
            >
              {/* Thumbnail */}
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-red-500 to-red-700">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={link.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={48} className="text-white/60" />
                  </div>
                )}

                {link.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">
                    {link.duration}
                  </span>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {link.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ExternalLink size={12} />
                  <span>Watch on YouTube</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
              currentPage === 1
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-500"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                  currentPage === page
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? "border-gray-100 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-500"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResourceMaterials;
