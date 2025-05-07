// src/app/api/player/create/route.ts

import { NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import ddb from '@/lib/dynamo'; // DynamoDB client

export async function POST(request: Request) {
  const body = await request.json();
  const {name, email, level } = body;

  if (!name || !email || !level) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const command = new PutCommand({
      TableName: 'Player', // replace with your DynamoDB table name
      Item: {
        email,
        name,
        level,
        createdAt: new Date().toISOString(),
      },
    });

    await ddb.send(command);
    return NextResponse.json({ message: 'Player added successfully' }, { status: 200 });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
