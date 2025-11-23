import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const song = await prisma.songs.findUnique({
      where: { id },
    });

    if (!song) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: song,
    });
  } catch (error) {
    console.error('Song detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch song details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const song = await prisma.songs.update({
      where: { id },
      data: {
        title: body.title,
        artist: body.artist,
        youtube_id: body.youtube_id || null,
        img_url: body.img_url || null,
        lyrics: body.lyrics || null,
        pronunciation: body.pronunciation || null,
        translation: body.translation || null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: song,
    });
  } catch (error) {
    console.error('Song update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update song' },
      { status: 500 }
    );
  }
}
