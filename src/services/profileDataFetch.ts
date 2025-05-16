import ddb from '@/src/lib/dynamo';
import { GetItemCommand,BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export async function getPlayerData(email: string) {
    const queryCommand = new GetItemCommand({
              TableName: "Player", 
              Key: marshall({email}), 
            });
    const response = await ddb.send(queryCommand);
    return response.Item ? unmarshall(response.Item) : null;
}

export async function getMatchPerPlayer(matchIDs: string[]) {
    if (!matchIDs || matchIDs.length === 0) return [];
  
    // ✅ Use marshall to properly format keys
    const keys = matchIDs.map(id => marshall({ MatchID: id }));

    const command = new BatchGetItemCommand({
      RequestItems: {
        Match: {
          Keys: keys,
        },
      },
    });

  
    const response = await ddb.send(command);
  
    const matches =
      response.Responses?.Match?.map((item) => unmarshall(item)) ?? [];
    return matches;
  }