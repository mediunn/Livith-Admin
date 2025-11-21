import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { table } = params;
    const body = await request.json();

    let result;

    switch (table) {
      case 'users':
        result = await prisma.users.create({
          data: {
            nickname: body.nickname || null,
            email: body.email || null,
            provider: body.provider || 'manual',
            provider_id: body.provider_id || null,
            marketing_consent: body.marketing_consent || false,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'concerts':
        result = await prisma.concerts.create({
          data: {
            code: body.code || null,
            title: body.title,
            artist: body.artist || null,
            status: body.status || 'UPCOMING',
            start_date: body.start_date,
            end_date: body.end_date,
            venue: body.venue || null,
            ticket_site: body.ticket_site || null,
            ticket_url: body.ticket_url || null,
            label: body.label || null,
            introduction: body.introduction || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'artists':
        result = await prisma.artists.create({
          data: {
            artist: body.artist,
            category: body.category || null,
            debut_date: body.debut_date || null,
            keywords: body.keywords || null,
            instagram_url: body.instagram_url || null,
            img_url: body.img_url || null,
            detail: body.detail || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'songs':
        result = await prisma.songs.create({
          data: {
            title: body.title,
            artist: body.artist,
            youtube_id: body.youtube_id || null,
            img_url: body.img_url || null,
            lyrics: body.lyrics || null,
            pronunciation: body.pronunciation || null,
            translation: body.translation || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'setlists':
        result = await prisma.setlists.create({
          data: {
            title: body.title,
            artist: body.artist || null,
            start_date: body.start_date,
            end_date: body.end_date,
            venue: body.venue || null,
            img_url: body.img_url || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'banners':
        result = await prisma.banners.create({
          data: {
            title: body.title || null,
            category: body.category || null,
            content: body.content || null,
            img_url: body.img_url || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'md':
        result = await prisma.md.create({
          data: {
            concert_id: body.concert_id,
            name: body.name,
            price: body.price || null,
            img_url: body.img_url || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'schedules':
        result = await prisma.schedule.create({
          data: {
            concert_id: body.concert_id,
            category: body.category,
            scheduled_at: body.scheduled_at ? new Date(body.scheduled_at) : new Date(),
            type: body.type || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'genres':
        result = await prisma.genres.create({
          data: {
            name: body.name,
          },
        });
        break;

      case 'cultures':
        result = await prisma.cultures.create({
          data: {
            concert_id: body.concert_id,
            title: body.title,
            content: body.content,
            img_url: body.img_url || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'reports':
        result = await prisma.reports.create({
          data: {
            comment_id: body.comment_id || null,
            comment_content: body.comment_content,
            comment_user_id: body.comment_user_id,
            report_reason: body.report_reason || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'concert_info':
        result = await prisma.concert_info.create({
          data: {
            concert_id: body.concert_id,
            category: body.category,
            content: body.content,
            img_url: body.img_url || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        break;

      case 'home_sections':
        result = await prisma.home_sections.create({
          data: {
            section_title: body.section_title,
            section_type: body.section_type || null,
          },
        });
        break;

      case 'search_sections':
        result = await prisma.search_sections.create({
          data: {
            section_title: body.section_title,
            section_type: body.section_type || null,
          },
        });
        break;

      case 'home_concert_sections':
        result = await prisma.home_concert_sections.create({
          data: {
            home_section_id: body.home_section_id,
            concert_id: body.concert_id,
            sorted_index: body.sorted_index || 0,
          },
        });
        break;

      case 'search_concert_sections':
        result = await prisma.search_concert_sections.create({
          data: {
            search_section_id: body.search_section_id,
            concert_id: body.concert_id,
            sorted_index: body.sorted_index || 0,
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown table' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create data' },
      { status: 500 }
    );
  }
}
