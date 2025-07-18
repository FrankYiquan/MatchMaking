import { auth0 } from "@/src/lib/auth0";
import { Card, CardContent } from "@/components/ui/card";
import { getMatchPerPlayer, getPlayerData } from "@/src/services/profileDataFetch";

import BeginMatchButton from "../component/redirectPage";
import WinnerSelector from "../component/winnerSelector";
import { redirect } from "next/navigation";



export default async function Home() {
    const session = await auth0.getSession();
    //console.log("user data: ",session?.user)
    if (!session){
      redirect("/"); 
    }
    const playerData = await getPlayerData(session?.user?.email ?? "")
    const matchIDs = playerData?.matches
    const matchData = await getMatchPerPlayer(matchIDs)

    const wonMatches = matchData.filter(match => match.winner === (session?.user?.email ?? "")).length
    const totalMatchesNum = Array.isArray(playerData?.matches)
                                ? playerData.matches.length
                                : 0;
    
    const finishedMatches = matchData.filter(match => match.status === "finish")
    const pareparedMatches = matchData.filter(match => match.status === "prepare")

    const totalfinishNum =
                        finishedMatches.length > 0
                            ? ((wonMatches / finishedMatches.length) * 100).toFixed(1)
                            : "0.0";
    
    



    const stats = [
        {
          label: "Total Matches Matched",
          value: totalMatchesNum,
          change: "+4.5%",
          changeType: "increase",
        },
        {
          label: "Total Matches Won",//
          value: wonMatches,
          change: "-0.5%",
          changeType: "decrease",
        },
        {
          label: "Winning Rate",
          value: totalMatchesNum > 0
          ? totalfinishNum + "%"
          : "0%",
          change: "+4.5%",
          changeType: "increase",
        },
        {
          label: "Rating",
          value: playerData?.rating ?? 0,
          change: "+21.2%",
          changeType: "increase",
        },
      ];

  
    return (
        <div className="p-6 space-y-8">
            <div>
                 <h1 className="text-2xl font-semibold">Hi, {session?.user?.name}</h1>
                <div className="flex justify-center">
                        <BeginMatchButton />
                </div>
            </div>
           
            
             {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="text-xl text-purple-800 ">{stat.label}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>

            {/* Matches History Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Match History</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left"></th>
                <th className="px-4 py-2 text-left">Match ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">Opponent</th>
                <th className="px-4 py-2 text-left">WON(y/n)</th>
              </tr>
            </thead>
            <tbody>
            {finishedMatches.map((match) => {
                const isWin = match.winner === session?.user?.email;
                const opponent =
                    match.email_1 === session?.user?.email ? match.email_2 : match.email_1;
                const [date, time] = match.startTime.split("T")

                return (
                    <tr key={match.MatchID} className="border-t">
                    <td className="px-4 py-2">
                        <div
                        aria-label={isWin ? "success" : "error"}
                        className={`status ${isWin ? "status-success" : "status-error"}`}
                        ></div>
                    </td>
                    <td className="px-4 py-2">{match.MatchID}</td>
                    <td className="px-4 py-2">{date}</td>
                    <td className="px-4 py-2">{time}</td>
                    <td className="px-4 py-2">{opponent}</td>
                    <td className="px-4 py-2">{isWin ? "y" : "n"}</td>
                    </tr>
                );
                })}
            </tbody>
          </table>
        </div>
      </div>

             {/* Upcoming Matches Table */}

    <div>     
        <h2 className="text-xl font-semibold mb-4">Upcoming Match</h2>
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Match ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">Opponent</th>
                <th className="px-4 py-2 text-left">Select Winner</th>
              </tr>
            </thead>
            <tbody>
            {pareparedMatches.map((match) => {
                const opponent =
                    match.email_1 === session?.user?.email ? match.email_2 : match.email_1;
                const [date2, time2] = match.startTime.split("T")
              
                return (
                    <tr key={match.MatchID} className="border-t">
                        <td className="px-4 py-2">{match.MatchID}</td>
                        <td className="px-4 py-2">{date2}</td>
                        <td className="px-4 py-2">{time2}</td>
                        <td className="px-4 py-2">{opponent}</td>
                        <td className="px-4 py-2">
                            <WinnerSelector
                                matchID={match.MatchID}
                                time={match.startTime}
                                email1={match.email_1}
                                email2={match.email_2}
                            />
                        </td>
                 </tr>
                );
                })}
            </tbody>
          </table>
        </div>
      </div>       


    </div>
        
  )

}