// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Coins } from 'lucide-react';

interface NavbarProps {
  token: string | null;
  userEmail: string | null;
  userName: string | null; // Add userName to props
  credits: number;
  API_BASE_URL: string;
  profileImageUrl: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ token, userEmail, userName, credits, API_BASE_URL, profileImageUrl }) => {
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
              <>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
