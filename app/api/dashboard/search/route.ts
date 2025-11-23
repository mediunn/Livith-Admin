import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const query = searchParams.get('q') || '';

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type is required' },
        { status: 400 }
      );
    }

    let results;

    switch (type) {
      case 'concerts':
        results = await prisma.concerts.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { artist: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            title: true,
            artist: true,
            start_date: true,
            end_date: true,
            venue: true,
            status: true,
          },
        });
        break;

      case 'songs':
        results = await prisma.songs.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { artist: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            title: true,
            artist: true,
          },
        });
        break;

      case 'setlists':
        results = await prisma.setlists.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { artist: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            title: true,
            artist: true,
            start_date: true,
            end_date: true,
          },
        });
        break;

      case 'users':
        results = await prisma.users.findMany({
          where: {
            OR: [
              { nickname: { contains: query } },
              { email: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updated_at: 'desc' },
          select: {
            id: true,
            nickname: true,
            email: true,
            provider: true,
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    );
  }
}
