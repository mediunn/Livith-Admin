import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concert_id, setlist, songs, type } = body;

    // Validate required fields
    if (!concert_id || !setlist || !songs || songs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get concert info
    const concert = await prisma.concerts.findUnique({
      where: { id: concert_id },
      select: { title: true, artist: true, start_date: true, end_date: true, venue: true },
    });

    if (!concert) {
      return NextResponse.json(
        { success: false, error: 'Concert not found' },
        { status: 404 }
      );
    }

    // 1. Create setlist
    const newSetlist = await prisma.setlists.create({
      data: {
        title: setlist.title || concert.title,
        artist: setlist.artist || concert.artist,
        start_date: setlist.start_date || concert.start_date,
        end_date: setlist.end_date || concert.end_date,
        venue: setlist.venue || concert.venue,
        img_url: setlist.img_url || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 2. Create concert_setlist relationship
    await prisma.concert_setlists.create({
      data: {
        concert_id: concert_id,
        setlist_id: newSetlist.id,
        type: type || 'EXPECTED',
        status: '',
        concert_title: concert.title,
        setlist_title: newSetlist.title,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 3. Process songs - create if not exist, then link to setlist_songs
    const createdSongs = [];
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      let songId = song.id;

      // If song doesn't have an ID, create it
      if (!songId) {
        const newSong = await prisma.songs.create({
          data: {
            title: song.title,
            artist: song.artist || concert.artist,
            youtube_id: song.youtube_id || null,
            img_url: song.img_url || null,
            lyrics: song.lyrics || null,
            pronunciation: song.pronunciation || null,
            translation: song.translation || null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
        songId = newSong.id;
        createdSongs.push(newSong);
      }

      // Create setlist_songs relationship
      await prisma.setlist_songs.create({
        data: {
          setlist_id: newSetlist.id,
          song_id: songId,
          order_index: i,
          setlist_date: newSetlist.start_date,
          setlist_title: newSetlist.title,
          song_title: song.title,
          fanchant: song.fanchant || null,
          fanchant_point: song.fanchant_point || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        setlist: newSetlist,
        songsCreated: createdSongs.length,
        totalSongs: songs.length,
      },
    });
  } catch (error) {
    console.error('Create setlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create setlist' },
      { status: 500 }
    );
  }
}
