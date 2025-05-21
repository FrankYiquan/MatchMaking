import { auth0 } from "@/src/lib/auth0";
import { ensureUser } from "../services/postloginServices";
import { redirect } from 'next/navigation';


export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-animate p-8 text-center">
        <h1 className="text-7xl font-bold mb-6 text-white">
          Welcome to WePlay, <br /> Register your next Ping Pong Match
        </h1>
    
        <div className="space-x-4 mb-10">
          <a href="/auth/login?screen_hint=signup" className="btn btn-primary">
            Sign up
          </a>
          <a href="/auth/login" className="btn btn-secondary">
            Log In
          </a>
        </div>
    
        {/* Instruction Boxes */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl text-left">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white shadow-md">
            <h2 className="font-semibold text-lg mb-1">1. Create an Account</h2>
            <p>Log in or sign up to access the matchmaking system.</p>
          </div>
    
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white shadow-md">
            <h2 className="font-semibold text-lg mb-1">2. Register for a Match</h2>
            <p>Select your preferred date, start time, and end time for playing.</p>
          </div>
    
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white shadow-md">
            <h2 className="font-semibold text-lg mb-1">3. Matchmaking</h2>
            <p>You’ll either get an opponent instantly or receive an email when one becomes available.</p>
          </div>
    
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white shadow-md">
            <h2 className="font-semibold text-lg mb-1">4. Submit Match Result</h2>
            <p>After the game, only one player needs to log the result. Once submitted, the result is final and cannot be changed.</p>
          </div>
        </section>
      </main>
    );
    
  }

  const userId = session.user.sub; 


  if (!session.user.email || !userId){
    return { error: "email[sub] cannot be empty" }

  }

  await ensureUser(session.user.email, session.user.name ?? "");

  
  redirect(`/${userId}/profile`);
}

