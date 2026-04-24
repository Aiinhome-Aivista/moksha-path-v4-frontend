import React from "react";
import { Play, ExternalLink, Loader2, Link as LinkIcon } from "lucide-react";
import { type StudyMaterialItem } from "./Notes";

export interface YouTubeLink {
  title: string;
  url: string;
  duration?: string;
  thumbnail?: string | null;
}

interface ResourceMaterialsProps {
  youtubeLinks: YouTubeLink[];
  externalLinks?: StudyMaterialItem[];
  isLoading?: boolean;
}

const ResourceMaterials: React.FC<ResourceMaterialsProps> = ({
  youtubeLinks,
  externalLinks = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 size={32} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Loading videos...</p>
      </div>
    );
  }

  if (youtubeLinks.length === 0 && externalLinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Play size={40} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">No videos or links available</p>
        <p className="text-xs mt-1">
          Select a chapter and topic from the sidebar to load videos
        </p>
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
      {/* Videos Section */}
      {youtubeLinks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Play size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold text-gray-800">Videos</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {youtubeLinks.length} videos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {youtubeLinks.map((link, index) => {
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

                {/* Play overlay */}
                {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play
                      size={20}
                      className="text-white ml-0.5"
                      fill="white"
                    />
                  </div>
                </div> */}

                {/* YouTube badge */}
                {/* <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  YouTube
                </span> */}

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
        </div>
      )}

      {/* External Links Section */}
      {externalLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">External Links</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {externalLinks.length} links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {externalLinks.map((link) => (
              <a
                key={link.id}
                href={link.link_url || link.resource}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-blue-400/40 border border-gray-200 transition-all cursor-pointer group no-underline flex flex-col"
              >
                {/* Visual Header / Box */}
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-100">
                  {link.thumbnail ? (
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LinkIcon size={32} className="text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3 bg-white">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <ExternalLink size={12} className="flex-shrink-0" />
                    <span className="truncate">{link.link_url || link.resource}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceMaterials;
