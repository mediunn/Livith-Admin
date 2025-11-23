import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usersPage = parseInt(searchParams.get('usersPage') || '1');
    const concertsPage = parseInt(searchParams.get('concertsPage') || '1');
    const artistsPage = parseInt(searchParams.get('artistsPage') || '1');
    const songsPage = parseInt(searchParams.get('songsPage') || '1');
    const setlistsPage = parseInt(searchParams.get('setlistsPage') || '1');
    const bannersPage = parseInt(searchParams.get('bannersPage') || '1');

    const mdPage = parseInt(searchParams.get('mdPage') || '1');
    const schedulesPage = parseInt(searchParams.get('schedulesPage') || '1');
    const genresPage = parseInt(searchParams.get('genresPage') || '1');
    const culturesPage = parseInt(searchParams.get('culturesPage') || '1');
    const reportsPage = parseInt(searchParams.get('reportsPage') || '1');
    const concertCommentsPage = parseInt(searchParams.get('concertCommentsPage') || '1');
    const homeSectionsPage = parseInt(searchParams.get('homeSectionsPage') || '1');
    const searchSectionsPage = parseInt(searchParams.get('searchSectionsPage') || '1');

    // Fetch counts and paginated data for all main tables in parallel
    const [
      usersCount,
      concertsCount,
      artistsCount,
      songsCount,
      setlistsCount,
      bannersCount,
      mdCount,
      schedulesCount,
      genresCount,
      culturesCount,
      reportsCount,
      concertCommentsCount,
      homeSectionsCount,
      searchSectionsCount,
      recentlyUpdatedConcerts,
      recentUsers,
      recentConcerts,
      recentArtists,
      recentSongs,
      recentSetlists,
      recentBanners,
      recentMd,
      recentSchedules,
      recentGenres,
      recentCultures,
      recentReports,
      recentConcertComments,
      recentHomeSections,
      recentSearchSections,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.concerts.count(),
      prisma.artists.count(),
      prisma.songs.count(),
      prisma.setlists.count(),
      prisma.banners.count(),
      prisma.md.count(),
      prisma.schedule.count(),
      prisma.genres.count(),
      prisma.cultures.count(),
      prisma.reports.count(),
      prisma.concert_comments.count(),
      prisma.home_sections.count(),
      prisma.search_sections.count(),
      // Recently updated concerts for top section
      prisma.concerts.findMany({
        take: 5,
        orderBy: { updated_at: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          status: true,
          start_date: true,
          end_date: true,
          venue: true,
          poster: true,
          updated_at: true,
        },
      }),
      prisma.users.findMany({
        take: PAGE_SIZE,
        skip: (usersPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.concerts.findMany({
        take: PAGE_SIZE,
        skip: (concertsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.artists.findMany({
        take: PAGE_SIZE,
        skip: (artistsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.songs.findMany({
        take: PAGE_SIZE,
        skip: (songsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.setlists.findMany({
        take: PAGE_SIZE,
        skip: (setlistsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.banners.findMany({
        take: PAGE_SIZE,
        skip: (bannersPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.md.findMany({
        take: PAGE_SIZE,
        skip: (mdPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.schedule.findMany({
        take: PAGE_SIZE,
        skip: (schedulesPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.genres.findMany({
        take: PAGE_SIZE,
        skip: (genresPage - 1) * PAGE_SIZE,
      }),
      prisma.cultures.findMany({
        take: PAGE_SIZE,
        skip: (culturesPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.reports.findMany({
        take: PAGE_SIZE,
        skip: (reportsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.concert_comments.findMany({
        take: PAGE_SIZE,
        skip: (concertCommentsPage - 1) * PAGE_SIZE,
        orderBy: { created_at: 'desc' },
        include: {
          concerts: {
            select: {
              id: true,
              title: true,
            },
          },
          users: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
      }),
      prisma.home_sections.findMany({
        take: PAGE_SIZE,
        skip: (homeSectionsPage - 1) * PAGE_SIZE,
        orderBy: { id: 'desc' },
      }),
      prisma.search_sections.findMany({
        take: PAGE_SIZE,
        skip: (searchSectionsPage - 1) * PAGE_SIZE,
        orderBy: { id: 'desc' },
      }),
    ]);

    // Fetch user info for reports
    const reportUserIds = recentReports.map((r: any) => r.comment_user_id).filter(Boolean);
    const reportUsers = reportUserIds.length > 0
      ? await prisma.users.findMany({
          where: { id: { in: reportUserIds } },
          select: { id: true, nickname: true, email: true },
        })
      : [];

    const userMap = new Map(reportUsers.map(u => [u.id, u]));
    const recentReportsWithUsers = recentReports.map((report: any) => ({
      ...report,
      users: userMap.get(report.comment_user_id) || null,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      recentlyUpdatedConcerts,
      stats: {
        users: {
          count: usersCount,
          recent: recentUsers,
        },
        concerts: {
          count: concertsCount,
          recent: recentConcerts,
        },
        artists: {
          count: artistsCount,
          recent: recentArtists,
        },
        songs: {
          count: songsCount,
          recent: recentSongs,
        },
        setlists: {
          count: setlistsCount,
          recent: recentSetlists,
        },
        banners: {
          count: bannersCount,
          recent: recentBanners,
        },
        md: {
          count: mdCount,
          recent: recentMd,
        },
        schedules: {
          count: schedulesCount,
          recent: recentSchedules,
        },
        genres: {
          count: genresCount,
          recent: recentGenres,
        },
        cultures: {
          count: culturesCount,
          recent: recentCultures,
        },
        reports: {
          count: reportsCount,
          recent: recentReportsWithUsers,
        },
        concert_comments: {
          count: concertCommentsCount,
          recent: recentConcertComments,
        },
        home_sections: {
          count: homeSectionsCount,
          recent: recentHomeSections,
        },
        search_sections: {
          count: searchSectionsCount,
          recent: recentSearchSections,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
