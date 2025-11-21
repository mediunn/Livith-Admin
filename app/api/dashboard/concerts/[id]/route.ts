import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Fetch concert with all related data
    const concert = await prisma.concerts.findUnique({
      where: { id },
      include: {
        concert_setlists: {
          include: {
            setlists: true,
          },
        },
        md: true,
        schedule: true,
        cultures: true,
        concert_genres: {
          include: {
            genres: true,
          },
        },
        concert_info: true,
      },
    });

    if (!concert) {
      return NextResponse.json(
        { success: false, error: 'Concert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: concert,
    });
  } catch (error) {
    console.error('Concert detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch concert details' },
      { status: 500 }
    );
  }
}
