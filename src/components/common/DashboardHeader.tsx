import React, { useState, useEffect } from "react";
import ApiServices from "../../services/ApiServices";

interface ProfileHeaderProps {
  avatarUrl: string;
  greeting: string;
  name: string;
  subtitle: string;
  altText: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps & { isLoading?: boolean; profileImage?: string }> = ({
  avatarUrl,
  greeting,
  name,
  subtitle,
  altText,
  isLoading,
  profileImage,
}) => (
  <div className="flex items-center gap-4 bg-[#4a4b4c] text-white py-4 pl-6 pr-16 rounded-r-[10rem] shadow-md z-10 relative flex-shrink-0 min-w-[320px]">
    <div className="relative shrink-0">
      {profileImage || avatarUrl ? (
        <img
          src={profileImage || avatarUrl}
          className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-sm"
          alt={altText}
        />
      ) : (
        <div className="w-14 h-14 rounded-full border-2 border-white bg-gradient-to-br from-[#BADA55] to-lime-400 flex items-center justify-center text-white text-xl font-black shadow-sm">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
      )}
    </div>
    <div className="flex flex-col justify-center">
      <span className="text-xl font-bold text-gray-200 leading-none mb-0.5">
        {greeting}
      </span>
      <h2 className="text-xl font-black leading-none tracking-tight">
        {name}
      </h2>
      <p className="text-[10px] text-gray-300 font-medium mt-1 tracking-wide">{subtitle}</p>
    </div>
  </div>
);

interface DashboardHeaderProps {
  profile?: {
    avatarUrl?: string;
    greeting?: string;
    name?: string;
    school?: string;
  };
  meta: {
    title: string;
    academicYear: string;
  };
  profileAltText?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  profile,
  meta,
  profileAltText = "Profile",
}) => {
  const [dynProfile, setDynProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const [profileRes, imageRes] = await Promise.all([
          ApiServices.getProfileInfo(),
          ApiServices.getUserProfileImage(),
        ]);

        if (profileRes.data?.status === "success") {
          setDynProfile(profileRes.data.data);
        }
        if (imageRes.data?.status === "success") {
          const imgData = imageRes.data.data?.image || imageRes.data.data?.profile_image;
          if (imgData) {
            const profileImg = imgData.startsWith("data:")
              ? imgData
              : `data:image/jpeg;base64,${imgData}`;
            setProfileImage(profileImg);
          }
        }
      } catch (error) {
        // console.error("Failed to fetch profile info", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const name = profile?.name || dynProfile?.full_name || "User";
  const school = profile?.school || dynProfile?.school_name || "";
  const greeting = profile?.greeting || "Greetings";
  const avatarUrl = profile?.avatarUrl || "";

  return (
    <div className="flex items-center w-full relative pt-2 -ml-6">
      <ProfileHeader
        avatarUrl={avatarUrl}
        greeting={greeting}
        name={name}
        subtitle={school}
        altText={profileAltText}
        isLoading={isLoading}
        profileImage={profileImage}
      />
      <div className="flex flex-1 items-center justify-start px-6 py-2 bg-[#E9E9E9] h-14 rounded-tr-full rounded-br-full">
        <div>
          <span className="text-lg font-bold text-cyan-600">{meta.title}</span>
          <span className="text-gray-400 mx-2 font-light">|</span>
          <span className="text-sm font-semibold text-primary">{meta.academicYear}</span>
        </div>
      </div>
    </div>
  );
};