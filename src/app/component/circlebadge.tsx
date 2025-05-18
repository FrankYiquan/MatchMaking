"use client";

import { useEffect, useState } from "react";

export default function CircleBadge() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null> (null)

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const res = await fetch("/auth/profile");
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(!!data); // Logged in if user exists
          setEmail(data.email)
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkLoginStatus();
  }, []);

  if (loading) return null; // Don't show anything until we know the login status

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <div className="w-20 rounded-full">
          <img alt="User avatar" src="/pingpong.jpg" />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-50 p-2 shadow z-10 text-center"
      >
        {isLoggedIn ? (
          <>
            <div className="text-xs text-gray-400">{email}</div>
            <li><a href="/auth/logout">Logout</a></li>
          </>
          
        ) : (
          <li><a href="/auth/login">Login</a></li>
        )}
      </ul>
    </div>
  );
}
