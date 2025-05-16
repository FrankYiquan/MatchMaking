import { auth0 } from "@/src/lib/auth0";
import { ensureUser } from "../services/postloginServices";
import { redirect } from 'next/navigation';


export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-animate p-8 text-center">
        <h1 className="text-7xl font-bold mb-6    text-white">
        Welcome to WePlay, <br/> Register your next Ping Pong Match
      </h1>
      <div className="space-x-4">
        <a href="/auth/login?screen_hint=signup" className="btn btn-primary">
            Sign up
          </a>
          <a href="/auth/login" className="btn btn-secondary">
            Log In
          </a>
        </div>
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

