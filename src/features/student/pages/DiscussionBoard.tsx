import React from "react";
import { Clock } from "lucide-react";

const DiscussionBoard: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Icon/Illustration Container */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            Discussion Board
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
            We're building a vibrant space for you to collaborate, share insights, and grow together with your community.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Clock size={16} />
            Launching Soon
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#b0cb1f] animate-bounce shadow-sm" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-[#b0cb1f] animate-bounce shadow-sm" style={{ animationDelay: "200ms" }} />
            <span className="w-2 h-2 rounded-full bg-[#b0cb1f] animate-bounce shadow-sm" style={{ animationDelay: "400ms" }} />
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="fixed top-1/2 left-1/4 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="fixed bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default DiscussionBoard;
