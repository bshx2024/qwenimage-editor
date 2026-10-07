'use client';
import {createContext, useContext, useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {useInterval} from "ahooks";
import {usePathname} from "next/navigation";


const CommonContext = createContext(undefined);
export const CommonProvider = ({
                                 children,
                                 commonText,
                                 authText,
                                 menuText,
                                 pricingText
                               }) => {

  const pathname = usePathname();
  const {data: session, status} = useSession();
  const [userData, setUserData] = useState<any>({});
  const [intervalUserData, setIntervalUserData] = useState<number | undefined>(1000);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Automatically dismiss blocking loading modals when page route changes
  useEffect(() => {
    setShowLoadingModal(false);
    setShowGeneratingModal(false);
  }, [pathname]);


  const fetchUserCredits = async (uid: string) => {
    if (!uid) return;
    try {
      const res = await fetch(`/api/user/getAvailableTimes?userId=${uid}`);
      const data = await res.json();
      setUserData((prev: any) => ({
        ...prev,
        available_times: data.available_times ?? 0,
        subscribeStatus: data.subscribeStatus || '',
        activePlan: data.activePlan || 'Free Plan',
        isPro: Boolean(data.isPro),
      }));
    } catch (e) {
      console.warn('Failed to fetch user credits:', e);
    }
  };

  // Immediate reactive sync with NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // @ts-ignore
      const uid = session.user.user_id || '';
      const u = {
        user_id: uid,
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        available_times: 0,
        activePlan: 'Loading...',
      };
      setUserData(u);
      setShowLoginModal(false);
      setIntervalUserData(undefined);
      fetchUserCredits(uid);
    } else if (status === 'unauthenticated') {
      setUserData({});
    }
  }, [session, status]);

  useInterval(() => {
    init();
  }, intervalUserData);

  async function init() {
    if (status == 'authenticated') {
      // @ts-ignore
      const uid = session?.user?.user_id || '';
      const u = {
        user_id: uid,
        name: session?.user?.name,
        email: session?.user?.email,
        image: session?.user?.image,
      };
      setUserData((prev: any) => ({ ...prev, ...u }));
      setShowLoginModal(false);
      setIntervalUserData(undefined);
      fetchUserCredits(uid);
    }
  }

  return (
    <CommonContext.Provider
      value={{
        userData,
        setUserData,
        showLoginModal,
        setShowLoginModal,
        showLogoutModal,
        setShowLogoutModal,
        showLoadingModal,
        setShowLoadingModal,
        showGeneratingModal,
        setShowGeneratingModal,
        showPricingModal,
        setShowPricingModal,
        commonText,
        authText,
        menuText,
        pricingText,
        refreshUserCredits: (customUid?: string) => {
          const targetId = customUid || userData?.user_id || (session?.user as any)?.user_id;
          if (targetId) fetchUserCredits(targetId);
        },
      }}
    >
      {children}
    </CommonContext.Provider>
  );

}

export const useCommonContext = () => useContext(CommonContext)
