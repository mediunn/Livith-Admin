import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;
    const body = await request.json();
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    let result;

    switch (table) {
      case 'users':
        result = await prisma.users.update({
          where: { id: numericId },
          data: {
            nickname: body.nickname || null,
            email: body.email || null,
            marketing_consent: body.marketing_consent,
            updated_at: new Date(),
          },
        });
        break;

      case 'concerts':
        result = await prisma.concerts.update({
          where: { id: numericId },
          data: {
            code: body.code || null,
            title: body.title,
            artist: body.artist || null,
            status: body.status,
            start_date: body.start_date,
            end_date: body.end_date,
            venue: body.venue || null,
            ticket_site: body.ticket_site || null,
            ticket_url: body.ticket_url || null,
            label: body.label || null,
            introduction: body.introduction || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'artists':
        result = await prisma.artists.update({
          where: { id: numericId },
          data: {
            artist: body.artist,
            category: body.category || null,
            debut_date: body.debut_date || null,
            keywords: body.keywords || null,
            instagram_url: body.instagram_url || null,
            img_url: body.img_url || null,
            detail: body.detail || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'songs':
        result = await prisma.songs.update({
          where: { id: numericId },
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
        break;

      case 'setlists':
        result = await prisma.setlists.update({
          where: { id: numericId },
          data: {
            title: body.title,
            artist: body.artist || null,
            start_date: body.start_date,
            end_date: body.end_date,
            venue: body.venue || null,
            img_url: body.img_url || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'banners':
        result = await prisma.banners.update({
          where: { id: numericId },
          data: {
            title: body.title || null,
            category: body.category || null,
            content: body.content || null,
            img_url: body.img_url || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'md':
        result = await prisma.md.update({
          where: { id: numericId },
          data: {
            concert_id: body.concert_id,
            name: body.name,
            price: body.price || null,
            img_url: body.img_url || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'schedules':
        result = await prisma.schedule.update({
          where: { id: numericId },
          data: {
            concert_id: body.concert_id,
            category: body.category,
            scheduled_at: body.scheduled_at ? new Date(body.scheduled_at) : undefined,
            type: body.type || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'genres':
        result = await prisma.genres.update({
          where: { id: numericId },
          data: {
            name: body.name,
          },
        });
        break;

      case 'cultures':
        result = await prisma.cultures.update({
          where: { id: numericId },
          data: {
            concert_id: body.concert_id,
            title: body.title,
            content: body.content,
            img_url: body.img_url || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'reports':
        result = await prisma.reports.update({
          where: { id: numericId },
          data: {
            comment_id: body.comment_id || null,
            comment_content: body.comment_content,
            comment_user_id: body.comment_user_id,
            report_reason: body.report_reason || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'concert_info':
        result = await prisma.concert_info.update({
          where: { id: numericId },
          data: {
            category: body.category,
            content: body.content,
            img_url: body.img_url || null,
            updated_at: new Date(),
          },
        });
        break;

      case 'home_sections':
        result = await prisma.home_sections.update({
          where: { id: numericId },
          data: {
            section_title: body.section_title,
            section_type: body.section_type || null,
          },
        });
        break;

      case 'search_sections':
        result = await prisma.search_sections.update({
          where: { id: numericId },
          data: {
            section_title: body.section_title,
            section_type: body.section_type || null,
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
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    const { table, id } = params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    let result;

    switch (table) {
      case 'users':
        result = await prisma.users.delete({
          where: { id: numericId },
        });
        break;

      case 'concerts':
        result = await prisma.concerts.delete({
          where: { id: numericId },
        });
        break;

      case 'artists':
        result = await prisma.artists.delete({
          where: { id: numericId },
        });
        break;

      case 'songs':
        result = await prisma.songs.delete({
          where: { id: numericId },
        });
        break;

      case 'setlists':
        // Delete related records first
        await prisma.setlist_songs.deleteMany({
          where: { setlist_id: numericId },
        });
        await prisma.concert_setlists.deleteMany({
          where: { setlist_id: numericId },
        });
        result = await prisma.setlists.delete({
          where: { id: numericId },
        });
        break;

      case 'banners':
        result = await prisma.banners.delete({
          where: { id: numericId },
        });
        break;

      case 'md':
        result = await prisma.md.delete({
          where: { id: numericId },
        });
        break;

      case 'schedules':
        result = await prisma.schedule.delete({
          where: { id: numericId },
        });
        break;

      case 'genres':
        result = await prisma.genres.delete({
          where: { id: numericId },
        });
        break;

      case 'cultures':
        result = await prisma.cultures.delete({
          where: { id: numericId },
        });
        break;

      case 'reports':
        result = await prisma.reports.delete({
          where: { id: numericId },
        });
        break;

      case 'concert_genres':
        result = await prisma.concert_genres.delete({
          where: { id: numericId },
        });
        break;

      case 'concert_setlists':
        result = await prisma.concert_setlists.delete({
          where: { id: numericId },
        });
        break;

      case 'concert_info':
        result = await prisma.concert_info.delete({
          where: { id: numericId },
        });
        break;

      case 'concert_comments':
        result = await prisma.concert_comments.delete({
          where: { id: numericId },
        });
        break;

      case 'home_sections':
        result = await prisma.home_sections.delete({
          where: { id: numericId },
        });
        break;

      case 'search_sections':
        result = await prisma.search_sections.delete({
          where: { id: numericId },
        });
        break;

      case 'home_concert_sections':
        result = await prisma.home_concert_sections.delete({
          where: { id: numericId },
        });
        break;

      case 'search_concert_sections':
        result = await prisma.search_concert_sections.delete({
          where: { id: numericId },
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
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
