"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

const MatchDisplay = () => {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("Me");
  const [loadingUser, setLoadingUser] = useState(true);

  const [opponent, setOpponent] = useState<{ email: string, startTime: string } | null>(null);
  const [loadingOpponent, setLoadingOpponent] = useState(true);

  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  
  const router = useRouter();
  //const hasFetchedOpponent = useRef(false);



  // Fetch current user's profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/auth/profile");
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email);
          setName(data.nickname);
        } else {
          setEmail(null);
          router.push("/");
          return
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setEmail(null);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchProfile();
  }, []);

  // Fetch opponent's data (simulate API call)
  useEffect(() => {
    if (!email) return;
  
    const fetchKey = `hasFetchedOpponent-${email}-${date}-${startTime}-${endTime}`;
    const alreadyFetched = localStorage.getItem(fetchKey);
  
    if (alreadyFetched) {
      // Optionally load cached opponent if you stored it before
      const cachedOpponent = localStorage.getItem(`${fetchKey}-data`);
      if (cachedOpponent) {
        setOpponent(JSON.parse(cachedOpponent));
      }
      setLoadingOpponent(false);
      return;
    }
  
    const actualStartTime = `${date}T${startTime}:00`;
    const actualEndTime = `${date}T${endTime}:00`;
  
    async function fetchOpponent() {
      const startEmail = `${actualStartTime}#${email}`;
      const payload = {
        date,
        startEmail,
        email,
        startTime: actualStartTime,
        endTime: actualEndTime
      };
  
      console.log("Posting to /api/matching with: ", JSON.stringify(payload));
  
      try {
        const res = await fetch(`/api/matching`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (res.status === 201) {
          const data = await res.json();
          setOpponent(data.match);
          localStorage.setItem(`${fetchKey}-data`, JSON.stringify(data.match));
        } else {
          setOpponent(null);
        }
  
        // Mark as fetched
        localStorage.setItem(fetchKey, "true");
      } catch (error) {
        console.error("Failed to fetch opponent:", error);
        setOpponent(null);
      } finally {
        setLoadingOpponent(false);
      }
    }
  
    fetchOpponent();
  }, [email, date, startTime, endTime]);

  if (loadingUser) {
    return <div>Loading user info...</div>;
  }

  

  return (
    <>

{!loadingOpponent && (
  <div className="p-4">
    {opponent === null ? (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.257 3.099c.366-.446.985-.535 1.431-.169l.086.076 7.2 7.2c.446.366.535.985.169 1.431l-.076.086-7.2 7.2c-.446.366-1.065.277-1.431-.169l-.086-.076-7.2-7.2a1 1 0 0 1 0-1.414l7.2-7.2z" />
          </svg>
          <span><strong>No available user right now.</strong></span>
        </div>
        <p className="mt-2">We will notify you via email if a new player is matched with you.</p>
        <button
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={() => window.location.href = "/"}
        >
          Continue
        </button>
      </div>
    ) : (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 0 1 0 1.414L9 14.414l-3.707-3.707a1 1 0 0 1 1.414-1.414L9 11.586l6.293-6.293a1 1 0 0 1 1.414 0z" />
          </svg>
          <span><strong>Match created!</strong></span>
        </div>
        <p className="mt-2">Your match is scheduled to start at: <strong>{opponent.startTime.split("T")[0]} at {opponent.startTime.split("T")[1]}</strong></p>
        <button
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => window.location.href = "/"}
        >
          Continue
        </button>
      </div>
    )}
  </div>
)}


    <div className="flex justify-center items-center h-screen bg-base-200 bg-gradient-animate">
      <div className="flex justify-between items-center w-full max-w-7xl px-10">
        {/* Me */}
        <div className="bg-primary text-primary-content rounded-box w-1/3 h-104 p-8 text-center shadow-lg flex flex-col justify-center items-center">
        <div className="badge badge-success">
          <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></circle><polyline points="7 13 10 16 17 8" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></polyline></g></svg>
          Ready to Match 
        </div>
          <h2 className="text-3xl font-bold mb-4">{name}</h2>
          <p>Email: {email}</p>
          <p>Date: {date}</p>
          <p>Start Time: {startTime}</p>
          <p>End Time: {endTime}</p>
        </div>

        {/* VS Sign */}
        <div className="text-4xl font-bold  text-secondary-content mx-30">VS</div>

        {/* Opponent */}
        <div className="bg-secondary  rounded-box w-1/3 h-104 p-8 text-center shadow-lg flex flex-col justify-center items-center">
          {loadingOpponent ? (
            <span className="loading loading-spinner text-error loading-xl"></span>
          ) : opponent ? ( 
            <>
              <div className="badge badge-success">
                <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></circle><polyline points="7 13 10 16 17 8" fill="none" stroke="currentColor" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="2"></polyline></g></svg>
                Ready to Match
              </div>
              <h2 className="text-3xl font-bold mb-4">{opponent.email}</h2>
              <p>Date: {opponent.startTime.split("T")[0]}</p>
              <p>StartTime: {opponent.startTime.split("T")[1]}</p>
            </>
          ) : (
            <>
              <div className="badge badge-error">
                <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1.972" y="11" width="20.056" height="2" transform="translate(-4.971 12) rotate(-45)" fill="currentColor" strokeWidth={0}></rect><path d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z" strokeWidth={0} fill="currentColor"></path></g></svg>
                No avaiable Player
              </div>
              <p>We will notify you through email if a new player is matched with you</p>
            </>
          )}
        </div>
      </div>
    </div>
   </>
  );
};

export default MatchDisplay;
