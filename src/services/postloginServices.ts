import ddb from '@/src/lib/dynamo';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';



export async function ensureUser(email: string, name: string) {
    const getCommand = new GetItemCommand({
      TableName: "Player",
      Key: marshall({email}),
    });
  
    const result = await ddb.send(getCommand);
  
    if (!result.Item) {

        const item = marshall({
            email: email,
            name: name,
            rating: 500,
            matches: [],
          });


        const putCommand = new PutItemCommand({
          TableName: "Player",
          Item: item,
        });
    
        await ddb.send(putCommand);
      }
    
      return true;
  }