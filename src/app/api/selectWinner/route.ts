import { NextRequest, NextResponse } from "next/server";
import ddb from "@/src/lib/dynamo";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { matchID, winner } = body;

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
    return NextResponse.json({ message: `Winner is updated` }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update winner' }, { status: 500 });
  }
}
