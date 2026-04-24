import React, { createContext, useContext, useState, type ReactNode } from 'react';
import ApiServices from '../../../services/ApiServices';

export interface PageAccessItem {
  page_id: number;
  page_name: string;
  icon: string;
  route: string;
}

// interface UserData {
//   exp: number;
//   name: string;
//   roles: { role_id: number; role_name: string }[];
//   session_id: string;
//   user_id: string;
//   username: string;
// }
interface ModalContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  handleLoginSignIn: () => void;

  isSignInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  handleSignInSuccess: () => void;

  isAcademicDetailsOpen: boolean;
  openAcademicDetails: () => void;
  closeAcademicDetails: () => void;
  handleAcademicDetailsSelectSubjects: () => void;
  handleAcademicDetailsBack: () => void;

  isSelectSubjectsOpen: boolean;
  openSelectSubjects: () => void;
  closeSelectSubjects: () => void;
  handleSelectSubjectsBack: () => void;

  isSelectRoleOpen: boolean;
  openSelectRole: () => void;
  closeSelectRole: () => void;
  handleSelectRoleNext: (roleId: number) => void;

  // Selected role state
  selectedRoleId: number | null;
  setSelectedRoleId: (roleId: number | null) => void;

  // Profile Selection state
  isProfileSelectionOpen: boolean;
  openProfileSelection: () => void;
  closeProfileSelection: () => void;
  profilesList: any[];
  setProfilesList: (profiles: any[]) => void;

  // NEW AUTH STATES
  // user: UserData | null;
  // decodeUserToken: () => Promise<void>;

  // Menu / Page Access
  menuItems: PageAccessItem[];
  isMenuLoaded: boolean;
  fetchMenu: () => Promise<PageAccessItem[]>;
  clearMenu: () => void;

  // NEW STATES FOR AUTH FLOW
  initialAuthIdentifier: string;
  setInitialAuthIdentifier: (value: string) => void;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
}

const AuthContext = createContext<ModalContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAcademicDetailsOpen, setIsAcademicDetailsOpen] = useState(false);
  const [isSelectSubjectsOpen, setIsSelectSubjectsOpen] = useState(false);
  const [isSelectRoleOpen, setIsSelectRoleOpen] = useState(false);
  const [isProfileSelectionOpen, setIsProfileSelectionOpen] = useState(false);
  const [profilesList, setProfilesList] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [initialAuthIdentifier, setInitialAuthIdentifier] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  // const [user, setUser] = useState<UserData | null>(null);

  // Menu / Page Access state
  const [menuItems, setMenuItems] = useState<PageAccessItem[]>([]);
  const [isMenuLoaded, setIsMenuLoaded] = useState(false);

  const fetchMenu = async (): Promise<PageAccessItem[]> => {
    try {
      const response = await ApiServices.getPageAccess();
      if (
        response.data?.status === 'success' &&
        Array.isArray(response.data?.data)
      ) {
        const items: PageAccessItem[] = response.data.data;
        setMenuItems(items);
        setIsMenuLoaded(true);
        localStorage.setItem('page_access', JSON.stringify(items));
        return items;
      }
    } catch (error) {
      // console.error('Failed to fetch page access:', error);
      // Fallback to cached data
      const cached = localStorage.getItem('page_access');
      if (cached) {
        try {
          const items = JSON.parse(cached);
          setMenuItems(items);
          setIsMenuLoaded(true);
          return items;
        } catch { }
      }
    }
    return [];
  };

  const clearMenu = () => {
    setMenuItems([]);
    setIsMenuLoaded(false);
    localStorage.removeItem('page_access');
  };



  // Decode JWT API - with subscription_id sync ⭐
  // const decodeUserToken = async () => {
  //   try {
  //     const token = localStorage.getItem("auth_token");
  //     if (!token) return;

  //     const res = await ApiServices.decodeJwt();

  //     if (res.data.status === "success") {
  //       const userData = res.data.data;
  //       setUser(userData);
        
  //       let subscriptionId = userData?.subscription_id;

  //       // Fallback: check roles[0] if main field is null
  //       if (!subscriptionId && userData?.roles && userData.roles.length > 0) {
  //         subscriptionId = userData.roles[0]?.subscription_id;
  //       }

  //       // Ensure resolution is reflected in user_data storage
  //       if (subscriptionId) {
  //         userData.subscription_id = subscriptionId;
  //       }
        
  //       localStorage.setItem("user_data", JSON.stringify(userData));
        
  //       // Sync to localStorage
  //       if (subscriptionId) {
  //         localStorage.setItem("subscription_id", subscriptionId);
  //         // console.log(" subscription_id synced to localStorage:", subscriptionId);

  //         // Update active_profile as well
  //         const activeProfileStr = localStorage.getItem("active_profile");
  //         if (activeProfileStr) {
  //           try {
  //             const activeProfile = JSON.parse(activeProfileStr);
  //             activeProfile.subscription_id = subscriptionId;
  //             localStorage.setItem("active_profile", JSON.stringify(activeProfile));
  //             // console.log("✅ active_profile updated with subscription_id");
  //           } catch (e) {
  //             // console.error("Failed to update active_profile", e);
  //           }
  //         }
  //       } else {
  //         localStorage.removeItem("subscription_id");
  //         // console.log("⚠️ subscription_id not found in token");
  //       }
  //     }
  //   } catch (err) {
  //     // console.error("Decode token failed", err);
  //   }
  // };

  // Auto decode token on app refresh
  // useEffect(() => {
  //   decodeUserToken();
  // }, []);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const handleLoginSignIn = () => {
    setIsLoginOpen(false);
    setIsAcademicDetailsOpen(true);
  };

  // SignIn modal handlers
  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);
  const handleSignInSuccess = () => {
    setIsSignInOpen(false);
    // Navigate to dashboard after successful sign in
  };

  const openAcademicDetails = () => setIsAcademicDetailsOpen(true);
  const closeAcademicDetails = () => setIsAcademicDetailsOpen(false);
  const handleAcademicDetailsSelectSubjects = () => {
    setIsAcademicDetailsOpen(false);
    setIsSelectSubjectsOpen(true);
  };
  const handleAcademicDetailsBack = () => {
    setIsAcademicDetailsOpen(false);
    setIsSignInOpen(true);
  };

  const openSelectSubjects = () => setIsSelectSubjectsOpen(true);
  const closeSelectSubjects = () => setIsSelectSubjectsOpen(false);
  const handleSelectSubjectsBack = () => {
    setIsSelectSubjectsOpen(false);
    setIsAcademicDetailsOpen(true);
  };

  const openSelectRole = () => setIsSelectRoleOpen(true);
  const closeSelectRole = () => setIsSelectRoleOpen(false);
  const handleSelectRoleNext = (roleId: number) => {
    setSelectedRoleId(roleId);
    setIsSelectRoleOpen(false);
    setIsLoginOpen(true);
  };

  const openProfileSelection = () => setIsProfileSelectionOpen(true);
  const closeProfileSelection = () => setIsProfileSelectionOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isLoginOpen,
        openLogin,
        closeLogin,
        handleLoginSignIn,
        isSignInOpen,
        openSignIn,
        closeSignIn,
        handleSignInSuccess,
        isAcademicDetailsOpen,
        openAcademicDetails,
        closeAcademicDetails,
        handleAcademicDetailsSelectSubjects,
        handleAcademicDetailsBack,
        isSelectSubjectsOpen,
        openSelectSubjects,
        closeSelectSubjects,
        handleSelectSubjectsBack,
        isSelectRoleOpen,
        openSelectRole,
        closeSelectRole,
        handleSelectRoleNext,
        selectedRoleId,
        setSelectedRoleId,

        // Profile Selection
        isProfileSelectionOpen,
        openProfileSelection,
        closeProfileSelection,
        profilesList,
        setProfilesList,

        // new auth
        // user,
        // decodeUserToken,

        // menu / page access
        menuItems,
        isMenuLoaded,
        fetchMenu,
        clearMenu,

        // NEW STATES
        initialAuthIdentifier,
        setInitialAuthIdentifier,
        isNewUser,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};



