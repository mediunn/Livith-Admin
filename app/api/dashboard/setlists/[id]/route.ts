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

    // Fetch setlist with all related data
    const setlist = await prisma.setlists.findUnique({
      where: { id },
      include: {
        setlist_songs: {
          include: {
            songs: true,
          },
          orderBy: {
            order_index: 'asc',
          },
        },
        concert_setlists: {
          include: {
            concerts: {
              select: {
                id: true,
                title: true,
                artist: true,
                start_date: true,
                end_date: true,
                venue: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!setlist) {
      return NextResponse.json(
        { success: false, error: 'Setlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: setlist,
    });
  } catch (error) {
    console.error('Setlist detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch setlist details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete related records first
    await prisma.setlist_songs.deleteMany({
      where: { setlist_id: id },
    });
    await prisma.concert_setlists.deleteMany({
      where: { setlist_id: id },
    });

    // Delete the setlist
    const result = await prisma.setlists.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Setlist delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete setlist' },
      { status: 500 }
    );
  }
}
