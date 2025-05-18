import ddb from '@/src/lib/dynamo';
import { AppendNewMatchId, CheckAndSet, Insert } from '@/src/services/matchServices';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { waitForDecided } from '@/src/services/matchServices';
import { getPlayerData, getMatchPerPlayer } from '@/src/services/profileDataFetch';

export async function POST(req: NextRequest ){

  while (true) {
    const body = await req.json();
    const { date, startEmail, email, startTime, endTime } = body;
    
   
    const Querycommand = new QueryCommand({
        TableName: "MatchRequest",
        KeyConditionExpression: "#date = :date",
        FilterExpression: "( (#start BETWEEN :startTime AND :endTime) OR (:startTime BETWEEN #start AND #end) ) AND #email <> :email AND #decided = :falseValue",
        ExpressionAttributeNames:{
            "#start": "startTime",
            "#end": "endTime",
           // "#startEmail": "startEmail", //sk
            "#date": "date", // pk
            "#email": "email",
            "#decided": "decided",

        },
        ExpressionAttributeValues: {
            ":startTime": { S: startTime },
            ":endTime": { S: endTime },
           // ":startEmail": { S: startEmail },
            ":date": { S: date },
            ":email": {S: email},
            ":falseValue": {BOOL: false}
        },
    });

    let firstMatch
    try{
        const result = await ddb.send(Querycommand);
        //console.log(result)
        //the first match
        if (result.Items?.length && result.Items.length > 0){
            firstMatch = result.Items[0]
        } else{
            // if no match found, store the match request into DB
            const futureMatch = {
              date: date,  // Just store the date as a string
              startEmail: startEmail,
              email: email,
              startTime: startTime,
              endTime: endTime,
              decided: false
            };
            
            await Insert(futureMatch, "MatchRequest")
            //have a for loop keep checking the status for 15 seconds
            const waitKey = {
              date: date,  // Just store the date as a string
              startEmail: startEmail,
            }
            const checkDecided = await waitForDecided(waitKey)

            if (checkDecided){
              const player = await getPlayerData(email)
              const latestMatchID = player?.matches?.length
                ? player.matches[player.matches.length - 1]
                : null;
              if (latestMatchID != null){
                //query the match data
                const match = await getMatchPerPlayer([latestMatchID])
                const matchData = match[0]
                const opponentEmail = matchData.email_1 === email ? matchData.email_2 : matchData.email_1;
                const startTime = matchData.startTime

                const earlymatchObject = {
                  email: opponentEmail,
                  startTime: startTime,
                }

                return Response.json({ message: "New Matches has been created", match: earlymatchObject}, { status: 201 })

              }
            }

            return Response.json({ message: "No matches found" }, { status: 200 })
        }
    }catch (err){
            console.error(err);
            return Response.json({ error: "DynamoDB query failed" }, { status: 500 });
    }

    //at this stage, new match is ready
    const matchId = uuidv4();
    const opponentEmail = firstMatch.email?.S;

    if (!opponentEmail) {
      return Response.json({ error: "Invalid opponent email" }, { status: 400 });
    }

    //compare start time, choose the later starttime as the actual start time 
    // Ensure both values are Date objects
    const requestedStartTime = startTime; // startTime from req body
    if (!firstMatch.startTime || !firstMatch.startTime.S) {
      throw new Error("Missing startTime in firstMatch");
    }
    
    const matchStartTime = firstMatch.startTime.S; // unwrap DynamoDB value

    // Pick the later start time
    let actualStartTime = requestedStartTime;
    if (requestedStartTime < matchStartTime) {
      actualStartTime = matchStartTime;
    }

    const newMatch = {
      MatchID: matchId,
      startTime: actualStartTime,
      email_1: email,
      email_2: opponentEmail, // Now definitely a string
      winner:  "" ,
      status: "prepare",
    };

    await Insert(newMatch, "Match")


    //set the matched request to be decided 
    const delteKey = {
      date: firstMatch.date.S ,
      startEmail: firstMatch.startEmail.S,
    }

    const check = await CheckAndSet(delteKey)
    if (!check.success){
      continue;

    }
    await AppendNewMatchId(newMatch.email_1, matchId)
    await AppendNewMatchId(newMatch.email_2, matchId)

    //email here

    const matchObject = {
      email: opponentEmail,
      startTime: actualStartTime,
    }

    return Response.json({ message: "New Matches has been created", match: matchObject}, { status: 201 })
  }
}

