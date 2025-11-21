// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Navbar from "./components/Navbar";
import { getMe } from "./lib/api";
import { useAuthStore } from "./store/useAuthStore"; // Import useAuthStore

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const { setAuth, token, userInfo, credits } = useAuthStore(); // Use Zustand store

  // 로그인 처리 useEffect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const tokenFromUrl = hash.replace("#token=", "");
      (async () => {
        try {
          const me = await getMe(tokenFromUrl);
          setAuth(tokenFromUrl, me); // Set auth state using Zustand
          window.history.replaceState({}, "", window.location.pathname);
        } catch (e) {
          console.error(e);
          alert("로그인 후 사용자 정보를 불러오지 못했습니다: " + (e as Error).message);
        }
      })();
    }
  }, [setAuth]); // Add setAuth to dependency array

  return (
    <div>
      <Navbar
        token={token}
        userEmail={userInfo?.email ?? null}
        userName={userInfo?.name ?? userInfo?.username ?? null}
        credits={credits}
        API_BASE_URL={API_BASE_URL}
        profileImageUrl={userInfo?.profile_image ?? null}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
