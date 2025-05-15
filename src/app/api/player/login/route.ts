import { NextResponse } from 'next/server';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import ddb from '@/lib/dynamo'; // DynamoDB client
import bcrypt from 'bcrypt';



export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { email, password } = body;
  
      if (!email || !password) {
        return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
      }
  
      const result = await ddb.send(
        new GetItemCommand({
          TableName: 'Player',
          Key: marshall({ email }),
        })
      );
  
      if (!result.Item) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
  
      const user = unmarshall(result.Item);
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
  
      // Return basic info without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;


      return NextResponse.json({ message: 'Login successful', user: userWithoutPassword });
    } catch (error) {
      console.error('Login Error:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }