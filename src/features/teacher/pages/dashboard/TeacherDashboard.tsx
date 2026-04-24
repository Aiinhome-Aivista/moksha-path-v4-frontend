import { useState, useEffect } from 'react';
import ApiServices from '../../../../services/ApiServices';
import OverviewTab from './overviewTab';
import SyllabusTab from './syllabusTab';
import MockExamsTab from './mockExamsTab';
import RemediationTab from './remediationTab';
import Loader from '../../../../components/common/Loader';

type TabName = 'Overview' | 'Syllabus' | 'Mock Exams' | 'Remediation';

const tabs: { name: TabName }[] = [
  { name: 'Overview' },
  { name: 'Syllabus' },
  { name: 'Mock Exams' },
  { name: 'Remediation' },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Overview');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      
      // Fetch profile details
      try {
        const profileRes = await ApiServices.getTeacherProfile();
        console.log("Teacher Profile Response:", profileRes.data);
        if (profileRes.data?.status === 'success') {
          setProfileData(profileRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch teacher profile details', error);
      }

      // Fetch profile image
      try {
        const imageRes = await ApiServices.getUserProfileImage();
        console.log("Teacher Profile Image Response:", imageRes.data);
        const imgData = imageRes.data?.data?.image || imageRes.data?.data?.profile_image;
        if (imageRes.data?.status === 'success' && imgData) {
          // Add data URI prefix if missing
          const profileImg = imgData.startsWith('data:') 
            ? imgData 
            : `data:image/jpeg;base64,${imgData}`;
          setProfileImage(profileImg);
        }
      } catch (error) {
        console.error('Failed to fetch teacher profile image', error);
      }

      // Fetch dashboard data
      try {
        const dashboardRes = await ApiServices.getTeacherDashboard();
        console.log("Teacher Dashboard Response:", dashboardRes.data);
        if (dashboardRes.data?.status === 'success' && dashboardRes.data?.data) {
          setDashboardData(dashboardRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch teacher dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const teacher_name = profileData?.teacher_name || 'Teacher';
  const school_name = profileData?.school_name || 'Moksha Path';
  const class_name = profileData?.class_name || '';

  return (
    // Single wrapper for the entire dashboard
    <div className="flex flex-col">
      
      {/* 1. THE HEADER ROW */}
            <div className="grid grid-cols-1 mb-1 lg:grid-cols-3 xl:grid-cols-4 items-center relative -ml-6">

{/* <div className="flex lg:flex-row flex-col items-center w-full relative pt-2 -ml-6"> */}
        
        {/* Left: Dark Profile Pill */}
        <div className="flex items-center gap-4 bg-[#4a4b4c] text-white py-4 pl-6 pr-16 rounded-r-[10rem] shadow-md z-10 relative flex-shrink-0 min-w-[320px]">
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                className="w-14 h-14 rounded-full border-2 border-white object-cover shadow-sm"
                alt="profile"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-white bg-gradient-to-br from-[#BADA55] to-lime-400 flex items-center justify-center text-white text-xl font-black shadow-sm">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  teacher_name.charAt(0).toUpperCase()
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold text-gray-200 leading-none mb-0.5">
              Greetings
            </span>
            <h2 className="text-xl font-black leading-none tracking-tight">
              {teacher_name}
            </h2>
            <p className="text-[10px] text-gray-300 font-medium mt-1 tracking-wide">
              {school_name} {class_name ? `(${class_name})` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between px-6 py-2 -ml-2 bg-[#E9E9E9] h-14 rounded-tr-full rounded-br-full lg:col-span-2 xl:col-span-3">
          <h1 className="text-[#00bcd4] font-black text-lg tracking-tight  whitespace-nowrap hidden sm:block ml-1 xl:ml-6">
            My Dashboard
          </h1>
          <div className="flex gap-2 xl:gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.name
                    ? "bg-yellow-500  text-black px-4 xl:px-10 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 px-2 xl:px-6"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="px-2 w-full animate-in fade-in duration-500 min-h-[500px] flex flex-col items-center">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader size="xl" text="Fetching dashboard data..." />
          </div>
        ) : (
          <div className="w-full">
            {activeTab === 'Overview' && <OverviewTab data={dashboardData?.overview_dashboard} />}
            {activeTab === 'Syllabus' && <SyllabusTab data={dashboardData?.overview_dashboard} />}
            {activeTab === 'Mock Exams' && <MockExamsTab data={dashboardData?.mock_exam_dashboard} />}
            {activeTab === 'Remediation' && <RemediationTab data={dashboardData?.remediation_dashboard} />}
          </div>
        )}
      </main>
      
    </div>
  );
};

export default TeacherDashboard;