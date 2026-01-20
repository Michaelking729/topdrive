import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const notes = await prisma.driverNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(notes);
}
