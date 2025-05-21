import { NextRequest, NextResponse } from "next/server";
import ddb from "@/src/lib/dynamo";
import { UpdateItemCommand, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { error } from "console";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchID, winner, loser } = body;

  const params = {
    TableName: 'Match',
    Key: marshall({ "MatchID": matchID }), 
    UpdateExpression: 'SET #winner = :actualWinner, #status = :status',
    ExpressionAttributeNames: {
      '#winner': 'winner' ,
      '#status': "status" 

    },
    ExpressionAttributeValues: marshall({
        ':actualWinner': winner,
        ':status': 'finish' 
      }),
  };



  try {
    await ddb.send(new UpdateItemCommand(params));
    await batchUpdateRating(winner, loser)
    return NextResponse.json({ message: `Winner is updated` }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update winner' }, { status: 500 });
  }
}


function updateRatings(
  winnerRating: number,
  loserRating: number,
  k: number = 32
): [number, number] {
  const ratingDiff = loserRating - winnerRating;
  const expectedWin = 1 / (1 + Math.pow(10, ratingDiff / 400));

  const ratingChange = Math.round(k * (1 - expectedWin));

  const newWinnerRating = winnerRating + ratingChange;
  const newLoserRating = loserRating - ratingChange;

  return [newWinnerRating, newLoserRating];
}

async function batchUpdateRating(winnerId: string, loserId: string) {
  const params = {
    RequestItems: {
      Player: {
        Keys: [
          marshall({ email: winnerId }),
          marshall({ email: loserId }),
        ],
      },
    },
  };

  const command = new BatchGetItemCommand(params);
  const response = await ddb.send(command);

  const players = response.Responses?.Player || [];

  // Map players by userId (or email, depending on your key)
  // Map email to rating (default to 1200 if missing)
  const ratings = new Map<string, number>();
  for (const item of players) {
    const player = unmarshall(item);
    ratings.set(player.email, player.rating);
  }

 const winnerRating = ratings.get(winnerId);
 const loserRating = ratings.get(loserId);

if (winnerRating === undefined || loserRating === undefined) {
  return error("Cannot fetch user rating");
}

// update rating
  const [newWinnerRating, newLoserRating] = updateRatings(winnerRating, loserRating)
  await updateRating(winnerId, newWinnerRating)
  await updateRating(loserId, newLoserRating)
  return 
}

async function updateRating(email: string, rating: number){
  const params = {
    TableName: 'Player',
    Key: marshall({ "email": email }), 
    UpdateExpression: 'SET #rating = :rating',
    ExpressionAttributeNames: {
       '#rating': "rating" 

    },
    ExpressionAttributeValues: marshall({
        ':rating': rating
      }),
  };

  try {
    await ddb.send(new UpdateItemCommand(params));
    return NextResponse.json({ message: `player's rating is updated` }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update player rating' }, { status: 500 });
  }

}