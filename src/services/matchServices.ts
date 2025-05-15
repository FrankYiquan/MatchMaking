import { PutItemCommand, DeleteItemCommand, UpdateItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import ddb from '@/src/lib/dynamo';
import WebSocket from 'ws';



export async function Insert(item: object, tableName: string) {
  try {
    await ddb.send(new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    }));

    const message = `new record created in ${tableName}: ${JSON.stringify(item)}`;
    console.log(message);
    return Response.json({ message }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

//this was never used
export async function Delete(key:object, tableName: string) {
    try {
        const deleteCommand = new DeleteItemCommand({
          TableName: tableName, 
          Key: marshall(key), 
        });
    
        // Send the delete command to DynamoDB
        const result = await ddb.send(deleteCommand);
    
        console.log("Item deleted successfully:", result);
        return { message: "Item deleted successfully" };
      } catch (error) {
        console.error("Error deleting item:", error);
        return { error: "Error deleting item" };
      }
}


export async function CheckAndSet(key: object) {
    const params = {
      TableName: "MatchRequest", 
      Key: marshall(key),
      UpdateExpression: "SET #decided = :trueValue", // Setting the 'decided' attribute to true
      ConditionExpression: "#decided = :falseValue", // Only update if 'decided' is currently false
      ExpressionAttributeNames: {
        "#decided": "decided" 
      },
      ExpressionAttributeValues: {
        ":trueValue": { BOOL: true }, 
        ":falseValue": { BOOL: false } 
      },
      ProjectionExpression: "#decided" // This returns the decided attribute value 
    };
    
    try {
      // Try to perform the update
      const result = await ddb.send(new UpdateItemCommand(params));
      console.log("Match request taken, 'decided' set to true", result.Attributes);
      return { success: true, message: "Match request taken and 'decided' set to true", status: 200 };
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Now we know 'err' is an instance of Error, so we can safely access 'err.name' and other properties
        if (err.name === "ConditionalCheckFailedException") {
          console.log("Match request already taken, 'decided' was true.");
          return { success: false, message: "Match request already taken, 'decided' was true.", status: 400 };
        } else {
          console.error("Error updating item:", err);
          return { success: false, message: "Error updating item", status: 500 };
        }
      } else {
        // If it's not an Error instance, just log it as an unknown error
        console.error("Unknown error:", err);
        return { success: false, message: "Unknown error", status: 500 };
      }
    }
  }


export async function AppendNewMatchId(email: string, matchID: string) {
    const command = new UpdateItemCommand({
      TableName: "Player",
      Key: {
        email: { S: email } // Primary key with type string
      },
      UpdateExpression: "SET matches = list_append(if_not_exists(matches, :empty_list), :new_match)",
      ExpressionAttributeValues: {
        ":new_match": {
          L: [{ S: matchID }] // Append a string inside a list
        },
        ":empty_list": {
          L: [] // Empty list fallback
        }
      },
      ReturnValues: "UPDATED_NEW"
    });
  
    await ddb.send(command);
  }

  export function waitForDecided(key: object, socketUrl: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(socketUrl);
  
      const MAX_ATTEMPTS = 3;
      const INTERVAL_MS = 5000;
  
      ws.on('open', () => {
        console.log("WebSocket connection opened");
  
        let attempt = 0;
  
        const interval = setInterval(async () => {
          attempt++;
  
          try {
            const result = await ddb.send(new GetItemCommand({
              TableName: "MatchRequest",
              Key: marshall(key),
            }));
  
            const decidedAttr = result.Item?.decided?.BOOL ?? false;
  
            ws.send(JSON.stringify({ status: decidedAttr }));
  
            if (decidedAttr) {
              clearInterval(interval);
              ws.send(JSON.stringify({ done: true }));
              ws.close();
              resolve(true);  // resolves promise with true
            }
  
          } catch (error) {
            console.error("DynamoDB error:", error);
            ws.send(JSON.stringify({ error: true }));
            // Optional: reject(error);
            // or keep trying
          }
  
          if (attempt >= MAX_ATTEMPTS) {
            clearInterval(interval);
            ws.send(JSON.stringify({ done: true }));
            ws.close();
            resolve(false);  // resolves promise with false since max attempts reached
          }
        }, INTERVAL_MS);
      });
  
      ws.on('error', (err) => {
        console.error("WebSocket error:", err);
        reject(err);  // reject promise on WS error
      });
  
      ws.on('close', () => {
        console.log("WebSocket connection closed");
      });
    });
  }
  
 