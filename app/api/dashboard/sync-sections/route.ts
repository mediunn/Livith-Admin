import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get 5 recently updated concerts
    const recentConcerts = await prisma.concerts.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        title: true,
      },
    });

    if (recentConcerts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No concerts found',
      }, { status: 400 });
    }

    // Get home_sections with title containing "최근" or "업데이트" or use the first section
    let homeSection = await prisma.home_sections.findFirst({
      where: {
        OR: [
          { section_title: { contains: '최근' } },
          { section_title: { contains: '업데이트' } },
        ],
      },
    });

    // If no matching section found, get the first one
    if (!homeSection) {
      homeSection = await prisma.home_sections.findFirst();
    }

    // Get search_sections with title containing "최근" or "업데이트" or use the first section
    let searchSection = await prisma.search_sections.findFirst({
      where: {
        OR: [
          { section_title: { contains: '최근' } },
          { section_title: { contains: '업데이트' } },
        ],
      },
    });

    // If no matching section found, get the first one
    if (!searchSection) {
      searchSection = await prisma.search_sections.findFirst();
    }

    const results = {
      homeSectionUpdated: false,
      searchSectionUpdated: false,
    };

    // Update home_concert_sections
    if (homeSection) {
      // Delete existing entries for this section
      await prisma.home_concert_sections.deleteMany({
        where: { home_section_id: homeSection.id },
      });

      // Create new entries
      await prisma.home_concert_sections.createMany({
        data: recentConcerts.map((concert, index) => ({
          home_section_id: homeSection!.id,
          concert_id: concert.id,
          section_title: homeSection!.section_title,
          concert_title: concert.title,
          sorted_index: index,
          updated_at: new Date(),
        })),
      });

      results.homeSectionUpdated = true;
    }

    // Update search_concert_sections
    if (searchSection) {
      // Delete existing entries for this section
      await prisma.search_concert_sections.deleteMany({
        where: { search_section_id: searchSection.id },
      });

      // Create new entries
      await prisma.search_concert_sections.createMany({
        data: recentConcerts.map((concert, index) => ({
          search_section_id: searchSection!.id,
          concert_id: concert.id,
          section_title: searchSection!.section_title,
          concert_title: concert.title,
          sorted_index: index,
          updated_at: new Date(),
        })),
      });

      results.searchSectionUpdated = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Sections updated successfully',
      results,
      concerts: recentConcerts.map(c => c.title),
    });
  } catch (error) {
    console.error('Sync sections error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync sections' },
      { status: 500 }
    );
  }
}
