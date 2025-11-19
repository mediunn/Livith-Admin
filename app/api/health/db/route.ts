import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 간단한 쿼리로 데이터베이스 연결 테스트
    await prisma.$queryRaw`SELECT 1`;

    // 추가 정보 수집
    const userCount = await prisma.users.count();
    const concertCount = await prisma.concerts.count();
    const artistCount = await prisma.artists.count();

    return NextResponse.json({
      status: 'connected',
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        concerts: concertCount,
        artists: artistCount,
      }
    });
  } catch (error: any) {
    console.error('Database connection error:', error);

    return NextResponse.json({
      status: 'disconnected',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
