import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    let section;
    let concerts;

    if (type === 'home') {
      section = await prisma.home_sections.findUnique({
        where: { id: numericId },
      });

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      const homeConcertSections = await prisma.home_concert_sections.findMany({
        where: { home_section_id: numericId },
        orderBy: { sorted_index: 'asc' },
      });

      // Get concert details for each
      const concertIds = homeConcertSections.map(hcs => hcs.concert_id);
      const concertDetails = await prisma.concerts.findMany({
        where: { id: { in: concertIds } },
        select: {
          id: true,
          title: true,
          artist: true,
          status: true,
          start_date: true,
          end_date: true,
        },
      });

      // Map concerts with sorted_index
      concerts = homeConcertSections.map(hcs => {
        const concert = concertDetails.find(c => c.id === hcs.concert_id);
        return {
          ...concert,
          sorted_index: hcs.sorted_index,
          section_concert_id: hcs.id,
        };
      });
    } else if (type === 'search') {
      section = await prisma.search_sections.findUnique({
        where: { id: numericId },
      });

      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }

      const searchConcertSections = await prisma.search_concert_sections.findMany({
        where: { search_section_id: numericId },
        orderBy: { sorted_index: 'asc' },
      });

      // Get concert details for each
      const concertIds = searchConcertSections.map(scs => scs.concert_id);
      const concertDetails = await prisma.concerts.findMany({
        where: { id: { in: concertIds } },
        select: {
          id: true,
          title: true,
          artist: true,
          status: true,
          start_date: true,
          end_date: true,
        },
      });

      // Map concerts with sorted_index
      concerts = searchConcertSections.map(scs => {
        const concert = concertDetails.find(c => c.id === scs.concert_id);
        return {
          ...concert,
          sorted_index: scs.sorted_index,
          section_concert_id: scs.id,
        };
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        section,
        concerts,
      },
    });
  } catch (error) {
    console.error('Section detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch section details' },
      { status: 500 }
    );
  }
}
