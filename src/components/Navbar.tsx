// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Coins, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar: React.FC<{ API_BASE_URL: string }> = ({ API_BASE_URL }) => {
  const { token, userInfo, credits, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4"> {/* New container for left group */}
          <Link to="/">
            <h1 className="text-3xl">Virtual TryOn</h1>
          </Link>
          <nav>
            <ul className="flex items-center gap-4">
              <li>
                <Link to="/shop">Shop</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900">크레딧: {credits}</span>
          </div>
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            {!token ? (
              <>
                <button
                  onClick={() => {
                    const redirectUri = window.location.origin;
                    window.location.href =
                      `${API_BASE_URL}/auth/google/login?redirect_uri=` +
                      encodeURIComponent(redirectUri);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Google 로그인
                </button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  {userInfo?.profile_image ? (
                    <img
                      src={userInfo.profile_image}
                      alt="User Profile"
                      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
