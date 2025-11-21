// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Navbar from "./components/Navbar";
import { getMe } from "./lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 사용자 정보 컨텍스트
interface UserContextType {
  token: string | null;
  userId: number | null;
  userEmail: string | null;
  profileImageUrl: string | null;
  userName: string | null;
}

export const UserContext = createContext<UserContextType | null>(null);

// 컨텍스트를 사용하기 위한 커스텀 훅
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
    ],
  },
]);

function Layout() {
  // 상태 관리 로직을 Home.tsx에서 여기로 이동
  const [credits, setCredits] = useState<number>(50);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // 로그인 처리 useEffect도 여기로 이동
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const tokenFromUrl = hash.replace("#token=", "");
      (async () => {
        try {
          setToken(tokenFromUrl);
          const me = await getMe(tokenFromUrl);
          setUserId(me.id);
          const email = me.email ?? me.username ?? me.name ?? null;
          setUserEmail(email);
          const name = me.name ?? me.username ?? me.email ?? null;
          setUserName(name);
          if (me.profile_image) {
            setProfileImageUrl(me.profile_image);
          }
          window.history.replaceState({}, "", window.location.pathname);
        } catch (e) {
          console.error(e);
          alert("로그인 후 사용자 정보를 불러오지 못했습니다: " + (e as Error).message);
        }
      })();
    }
  }, []);

  return (
    <UserContext.Provider value={{ token, userId, userEmail, profileImageUrl, userName }}>
      <div>
        <Navbar token={token} userEmail={userEmail} userName={userName} credits={credits} API_BASE_URL={API_BASE_URL} profileImageUrl={profileImageUrl} />
        <main>
          <Outlet />
        </main>
      </div>
    </UserContext.Provider>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
