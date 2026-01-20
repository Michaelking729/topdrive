import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' }, orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(drivers.map(d => ({ id: d.id, name: d.name, email: d.email })));
}
