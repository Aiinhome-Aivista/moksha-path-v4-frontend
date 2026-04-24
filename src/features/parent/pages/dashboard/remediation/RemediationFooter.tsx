import React from "react";
import { remediationFooterData } from "../NewStudent";

interface FooterCardProps {
  title: string;
  value: string;
  subtitle: string;
  description: string;
  progress: number;
  color: string;
}

const FooterCard: React.FC<FooterCardProps> = ({
  title,
  value,
  subtitle,
  description,
  progress,
  color,
}) => {
  return (
    <div className=" p-4 flex flex-col justify-between">
      {/* Top */}
      <div className="flex justify-between items-end mt-2">
        <div className="flex gap-2 items-end">
          <img src="https://static.vecteezy.com/system/resources/thumbnails/071/242/165/small/pixelated-human-head-with-brain-inside-a-minimalist-illustration-for-mental-health-awareness-free-vector.jpg" alt="icon" className="h-12" />
          <h3 className="font-semibold text-xl text-[#4DA1B3]">{title}</h3>
        </div>
        <span className="text-sm text-[#fcc40d] font-semibold">{value}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded mb-2">
        <div
          className="h-2 rounded"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>

      {/* Subtitle */}
      <p className="text-sm font-bold tracking-tight text-primary mb-1">
        {subtitle}
      </p>

      {/* Description */}

      {/* Button */}
      <div className="flex gap-1 justify-around items-center">
        <span className="material-symbols-outlined text-yellow-500 text-5xl font-extrabold">
          keyboard_arrow_right
        </span>
        <p className="text-xs text-primary leading-tight mb-3 w-80">
          {description}
        </p>
        <button className="text-normal bg-[#4DA1B3] text-white font-semibold px-4 py-2 rounded-full">
          Buy a Plan
        </button>
      </div>
    </div>
  );
};

/* ------------------ Main Footer ------------------ */

const RemediationFooter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {remediationFooterData.map((item, i) => (
        <FooterCard key={i} {...item} />
      ))}
    </div>
  );
};

export default RemediationFooter;
