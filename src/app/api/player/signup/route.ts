import { NextResponse } from 'next/server';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import ddb from '@/lib/dynamo'; // DynamoDB client
import bcrypt from 'bcrypt';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, rating } = body;

    if (!name || !email || !rating || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await ddb.send(new GetItemCommand({
      TableName: 'Player',
      Key: marshall({ email }),
    }));

    if (existingUser.Item) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Put new player
    const item = marshall({
      email,
      name,
      password: hashedPassword,
      rating,
      matches: [],
    });

    await ddb.send(new PutItemCommand({
      TableName: 'Player',
      Item: item,
    }));

    return NextResponse.json({ message: 'Player added successfully' }, { status: 200 });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
