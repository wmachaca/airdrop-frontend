import output from '@/merkle/output.json';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(output);
}
