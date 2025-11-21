'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Concert {
  id: number;
  title: string;
  artist: string | null;
  start_date: string;
  end_date: string;
  venue: string | null;
  status: string;
}

interface Song {
  id?: number;
  title: string;
  artist: string;
  isNew?: boolean;
  fanchant?: string;
  fanchant_point?: string;
  youtube_id?: string;
}

interface SearchResult {
  id: number;
  title: string;
  artist: string | null;
}

export function SetlistCreator() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Concert search
  const [concertQuery, setConcertQuery] = useState('');
  const [concertResults, setConcertResults] = useState<Concert[]>([]);
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [showConcertResults, setShowConcertResults] = useState(false);

  // Setlist details
  const [setlistTitle, setSetlistTitle] = useState('');
  const [setlistType, setSetlistType] = useState('EXPECTED');

  // Songs
  const [songs, setSongs] = useState<Song[]>([]);
  const [songQuery, setSongQuery] = useState('');
  const [songResults, setSongResults] = useState<SearchResult[]>([]);
  const [showSongResults, setShowSongResults] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongYoutubeUrl, setNewSongYoutubeUrl] = useState('');

  // Extract YouTube video ID from various URL formats
  const extractYoutubeId = (url: string): string => {
    if (!url) return '';

    // If it's already just an ID (11 characters, alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    // youtu.be format: https://youtu.be/VIDEO_ID?si=...
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (longMatch) return longMatch[1];

    // youtube.com/embed format
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return url; // Return as-is if no match
  };

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('setlist-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.selectedConcert) setSelectedConcert(draft.selectedConcert);
        if (draft.setlistTitle) setSetlistTitle(draft.setlistTitle);
        if (draft.setlistType) setSetlistType(draft.setlistType);
        if (draft.songs) setSongs(draft.songs);
        if (draft.newSongArtist) setNewSongArtist(draft.newSongArtist);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save draft when data changes
  useEffect(() => {
    const draft = {
      selectedConcert,
      setlistTitle,
      setlistType,
      songs,
      newSongArtist,
    };
    localStorage.setItem('setlist-draft', JSON.stringify(draft));
  }, [selectedConcert, setlistTitle, setlistType, songs, newSongArtist]);

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('setlist-draft');
  };

  // Search concerts
  useEffect(() => {
    const searchConcerts = async () => {
      if (concertQuery.length < 2) {
        setConcertResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/dashboard/search?type=concerts&q=${encodeURIComponent(concertQuery)}`);
        const result = await response.json();
        if (result.success) {
          setConcertResults(result.data);
          setShowConcertResults(true);
        }
      } catch (error) {
        console.error('Concert search error:', error);
      }
    };

    const debounce = setTimeout(searchConcerts, 300);
    return () => clearTimeout(debounce);
  }, [concertQuery]);

  // Search songs
  useEffect(() => {
    const searchSongs = async () => {
      if (songQuery.length < 2) {
        setSongResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/dashboard/search?type=songs&q=${encodeURIComponent(songQuery)}`);
        const result = await response.json();
        if (result.success) {
          setSongResults(result.data);
          setShowSongResults(true);
        }
      } catch (error) {
        console.error('Song search error:', error);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [songQuery]);

  const handleSelectConcert = (concert: Concert) => {
    setSelectedConcert(concert);
    setConcertQuery('');
    setShowConcertResults(false);
    setSetlistTitle(concert.title);
    setNewSongArtist(concert.artist || '');
  };

  const handleAddExistingSong = (song: SearchResult) => {
    if (songs.some(s => s.id === song.id)) {
      toast({
        title: '중복된 곡',
        description: '이미 추가된 곡입니다.',
        variant: 'destructive',
      });
      return;
    }

    setSongs([...songs, {
      id: song.id,
      title: song.title,
      artist: song.artist || '',
      isNew: false,
    }]);
    setSongQuery('');
    setShowSongResults(false);
  };

  const handleAddNewSong = () => {
    if (!newSongTitle.trim()) {
      toast({
        title: '곡 제목 필요',
        description: '곡 제목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const youtubeId = extractYoutubeId(newSongYoutubeUrl);

    setSongs([...songs, {
      title: newSongTitle,
      artist: newSongArtist || selectedConcert?.artist || '',
      isNew: true,
      youtube_id: youtubeId || undefined,
    }]);
    setNewSongTitle('');
    setNewSongYoutubeUrl('');
  };

  const handleRemoveSong = (index: number) => {
    setSongs(songs.filter((_, i) => i !== index));
  };

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    const newSongs = [...songs];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= songs.length) return;

    [newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]];
    setSongs(newSongs);
  };

  const handleSubmit = async () => {
    if (!selectedConcert) {
      toast({
        title: '콘서트 선택 필요',
        description: '콘서트를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (songs.length === 0) {
      toast({
        title: '곡 추가 필요',
        description: '최소 1곡 이상 추가해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/create-setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concert_id: selectedConcert.id,
          setlist: {
            title: setlistTitle || selectedConcert.title,
            artist: selectedConcert.artist,
            start_date: selectedConcert.start_date,
            end_date: selectedConcert.end_date,
            venue: selectedConcert.venue,
          },
          songs: songs.map(song => ({
            id: song.isNew ? undefined : song.id,
            title: song.title,
            artist: song.artist,
            youtube_id: song.youtube_id,
            fanchant: song.fanchant,
            fanchant_point: song.fanchant_point,
          })),
          type: setlistType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '셋리스트 생성 완료',
          description: `셋리스트가 생성되었습니다. (새로운 곡 ${result.data.songsCreated}개 생성)`,
        });

        // Reset form and clear draft
        setSelectedConcert(null);
        setSetlistTitle('');
        setSongs([]);
        setSetlistType('EXPECTED');
        setNewSongArtist('');
        clearDraft();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: '생성 실패',
        description: '셋리스트 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-livith-black-80 rounded-lg border-2 border-livith-yellow-60">
      <div className="w-full px-6 py-4 flex items-center justify-between rounded-t-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">📝</span>
          <span className="text-livith-yellow-60 font-bold text-lg">셋리스트 추가하기</span>
          {(selectedConcert || songs.length > 0) && (
            <span className="text-xs bg-livith-yellow-60/20 text-livith-yellow-60 px-2 py-0.5 rounded">
              임시저장됨
            </span>
          )}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-livith-black-30 text-lg hover:text-livith-white"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-livith-black-50 p-6 space-y-6">
          {/* Concert Search */}
          <div>
            <label className="block text-livith-white font-semibold mb-2">
              1. 콘서트 검색
            </label>
            {selectedConcert ? (
              <div className="bg-livith-black-90 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-livith-white font-medium">{selectedConcert.title}</p>
                  <p className="text-livith-black-30 text-sm">
                    {selectedConcert.artist} | {selectedConcert.start_date} ~ {selectedConcert.end_date}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConcert(null)}
                  className="bg-livith-black-70 border-livith-black-50 text-livith-white"
                >
                  변경
                </Button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={concertQuery}
                  onChange={(e) => setConcertQuery(e.target.value)}
                  placeholder="콘서트 제목 또는 아티스트로 검색..."
                  className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                />
                {showConcertResults && concertResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-livith-black-90 border border-livith-black-50 rounded-lg max-h-60 overflow-auto">
                    {concertResults.map((concert) => (
                      <button
                        key={concert.id}
                        onClick={() => handleSelectConcert(concert)}
                        className="w-full px-4 py-3 text-left hover:bg-livith-black-70 border-b border-livith-black-50 last:border-b-0"
                      >
                        <p className="text-livith-white">{concert.title}</p>
                        <p className="text-livith-black-30 text-sm">
                          {concert.artist} | {concert.start_date}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Setlist Details */}
          {selectedConcert && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-livith-white font-semibold mb-2">
                    셋리스트 제목
                  </label>
                  <input
                    type="text"
                    value={setlistTitle}
                    onChange={(e) => setSetlistTitle(e.target.value)}
                    placeholder="셋리스트 제목"
                    className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                  />
                </div>
                <div>
                  <label className="block text-livith-white font-semibold mb-2">
                    타입
                  </label>
                  <select
                    value={setlistType}
                    onChange={(e) => setSetlistType(e.target.value)}
                    className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                  >
                    <option value="EXPECTED">EXPECTED</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="PAST">PAST</option>
                  </select>
                </div>
              </div>

              {/* Song Search & Add */}
              <div>
                <label className="block text-livith-white font-semibold mb-2">
                  2. 곡 추가
                </label>

                {/* Search existing song */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={songQuery}
                    onChange={(e) => setSongQuery(e.target.value)}
                    placeholder="기존 곡 검색..."
                    className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                  />
                  {showSongResults && songResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-livith-black-90 border border-livith-black-50 rounded-lg max-h-48 overflow-auto">
                      {songResults.map((song) => (
                        <button
                          key={song.id}
                          onClick={() => handleAddExistingSong(song)}
                          className="w-full px-4 py-2 text-left hover:bg-livith-black-70 border-b border-livith-black-50 last:border-b-0"
                        >
                          <span className="text-livith-white">{song.title}</span>
                          <span className="text-livith-black-30 text-sm ml-2">- {song.artist}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add new song */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSongTitle}
                      onChange={(e) => setNewSongTitle(e.target.value)}
                      placeholder="새 곡 제목"
                      className="flex-1 px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    />
                    <input
                      type="text"
                      value={newSongArtist}
                      onChange={(e) => setNewSongArtist(e.target.value)}
                      placeholder="아티스트"
                      className="w-40 px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSongYoutubeUrl}
                      onChange={(e) => setNewSongYoutubeUrl(e.target.value)}
                      placeholder="YouTube URL 또는 ID (선택)"
                      className="flex-1 px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    />
                    {newSongYoutubeUrl && (
                      <span className="flex items-center px-3 text-livith-black-30 text-sm">
                        ID: {extractYoutubeId(newSongYoutubeUrl) || '-'}
                      </span>
                    )}
                    <Button
                      onClick={handleAddNewSong}
                      className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
                    >
                      + 새 곡
                    </Button>
                  </div>
                </div>
              </div>

              {/* Song List */}
              {songs.length > 0 && (
                <div>
                  <label className="block text-livith-white font-semibold mb-2">
                    3. 곡 목록 ({songs.length}곡)
                  </label>
                  <div className="bg-livith-black-90 rounded-lg divide-y divide-livith-black-50">
                    {songs.map((song, index) => (
                      <div key={index} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-livith-black-30 w-6">{index + 1}.</span>
                          <div>
                            <span className="text-livith-white">{song.title}</span>
                            {song.isNew && (
                              <span className="ml-2 text-xs bg-livith-yellow-60/20 text-livith-yellow-60 px-2 py-0.5 rounded">
                                새 곡
                              </span>
                            )}
                            <span className="text-livith-black-30 text-sm ml-2">- {song.artist}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveSong(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-livith-black-30 hover:text-livith-white disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveSong(index, 'down')}
                            disabled={index === songs.length - 1}
                            className="p-1 text-livith-black-30 hover:text-livith-white disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleRemoveSong(index)}
                            className="p-1 text-red-500/50 hover:text-red-500 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-4 border-t border-livith-black-50">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedConcert || songs.length === 0}
                  className="w-full bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 py-3 text-lg font-semibold"
                >
                  {isLoading ? '생성 중...' : '셋리스트 생성'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
