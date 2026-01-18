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

    const artist = await prisma.artists.findUnique({
      where: { id },
    });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: artist,
    });
  } catch (error) {
    console.error('Artist detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artist details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.artists.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Artist deleted successfully',
    });
  } catch (error) {
    console.error('Artist delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete artist' },
      { status: 500 }
    );
  }
}
