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
  const [setlistImgUrl, setSetlistImgUrl] = useState('');
  const [setlistStartDate, setSetlistStartDate] = useState('');
  const [setlistEndDate, setSetlistEndDate] = useState('');

  // Songs
  const [songs, setSongs] = useState<Song[]>([]);
  const [songQuery, setSongQuery] = useState('');
  const [songResults, setSongResults] = useState<SearchResult[]>([]);
  const [showSongModal, setShowSongModal] = useState(false);
  const [artistSongs, setArtistSongs] = useState<SearchResult[]>([]);
  const [isLoadingArtistSongs, setIsLoadingArtistSongs] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongYoutubeUrl, setNewSongYoutubeUrl] = useState('');

  // Calendar modal
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenCalendar = (type: 'start' | 'end') => {
    const currentValue = type === 'start' ? setlistStartDate : setlistEndDate;
    if (currentValue) {
      // Handle various date formats (YYYY-MM-DD, YYYY.MM.DD, etc.)
      const parsed = new Date(currentValue.replace(/\./g, '-'));
      if (!isNaN(parsed.getTime())) {
        setCalendarDate(parsed);
      } else {
        setCalendarDate(new Date());
      }
    } else {
      setCalendarDate(new Date());
    }
    setShowCalendar(type);
  };

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const formattedDate = formatDate(selectedDate);

    if (showCalendar === 'start') {
      setSetlistStartDate(formattedDate);
    } else {
      setSetlistEndDate(formattedDate);
    }
    setShowCalendar(null);
  };

  const changeMonth = (delta: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + delta, 1));
  };

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
        if (draft.setlistImgUrl) setSetlistImgUrl(draft.setlistImgUrl);
        if (draft.setlistStartDate) setSetlistStartDate(draft.setlistStartDate);
        if (draft.setlistEndDate) setSetlistEndDate(draft.setlistEndDate);
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
      setlistImgUrl,
      setlistStartDate,
      setlistEndDate,
      songs,
      newSongArtist,
    };
    localStorage.setItem('setlist-draft', JSON.stringify(draft));
  }, [selectedConcert, setlistTitle, setlistType, setlistImgUrl, setlistStartDate, setlistEndDate, songs, newSongArtist]);

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

  // Fetch artist songs when modal opens
  const fetchArtistSongs = async () => {
    if (!selectedConcert?.artist) return;

    setIsLoadingArtistSongs(true);
    try {
      const response = await fetch(`/api/dashboard/search?type=songs&q=${encodeURIComponent(selectedConcert.artist)}&limit=100`);
      const result = await response.json();
      if (result.success) {
        setArtistSongs(result.data);
      }
    } catch (error) {
      console.error('Artist songs fetch error:', error);
    } finally {
      setIsLoadingArtistSongs(false);
    }
  };

  // Search songs in modal
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
        }
      } catch (error) {
        console.error('Song search error:', error);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [songQuery]);

  // Open song modal and fetch artist songs
  const handleOpenSongModal = () => {
    setShowSongModal(true);
    setSongQuery('');
    setSongResults([]);
    fetchArtistSongs();
  };

  const handleSelectConcert = (concert: Concert) => {
    setSelectedConcert(concert);
    setConcertQuery('');
    setShowConcertResults(false);
    setSetlistTitle(concert.title);
    setSetlistStartDate(concert.start_date || '');
    setSetlistEndDate(concert.end_date || '');
    setNewSongArtist(concert.artist || '');
  };

  const handleAddExistingSong = (song: SearchResult, closeModal: boolean = false) => {
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

    if (closeModal) {
      setShowSongModal(false);
      setSongQuery('');
      setSongResults([]);
    }
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
            start_date: setlistStartDate || selectedConcert.start_date,
            end_date: setlistEndDate || selectedConcert.end_date,
            venue: selectedConcert.venue,
            img_url: setlistImgUrl || null,
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
        setSetlistImgUrl('');
        setSetlistStartDate('');
        setSetlistEndDate('');
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

  // Get songs to display in modal (search results or artist songs)
  const displaySongs = songQuery.length >= 2 ? songResults : artistSongs;

  return (
    <>
    {/* Song Selection Modal */}
    {showSongModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={() => setShowSongModal(false)}
      >
        <div
          className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-2xl max-h-[80vh] flex flex-col modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-livith-black-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-livith-white">곡 선택</h3>
            <button
              onClick={() => setShowSongModal(false)}
              className="text-livith-black-30 hover:text-livith-white text-xl"
            >
              ✕
            </button>
          </div>

          {/* Search Input */}
          <div className="px-6 py-4 border-b border-livith-black-50">
            <input
              type="text"
              value={songQuery}
              onChange={(e) => setSongQuery(e.target.value)}
              placeholder="곡 제목 또는 아티스트로 검색..."
              className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
              autoFocus
            />
            {songQuery.length === 0 && selectedConcert?.artist && (
              <p className="text-livith-black-30 text-sm mt-2">
                {selectedConcert.artist}의 곡 목록
              </p>
            )}
          </div>

          {/* Song List */}
          <div className="flex-1 overflow-auto">
            {isLoadingArtistSongs ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-livith-yellow-60"></div>
                <p className="text-livith-black-30 mt-4">곡 목록 로딩 중...</p>
              </div>
            ) : displaySongs.length > 0 ? (
              <div className="divide-y divide-livith-black-50">
                {displaySongs.map((song) => {
                  const isAlreadyAdded = songs.some(s => s.id === song.id);
                  return (
                    <button
                      key={song.id}
                      onClick={() => !isAlreadyAdded && handleAddExistingSong(song)}
                      disabled={isAlreadyAdded}
                      className={`w-full px-6 py-3 text-left flex items-center justify-between ${
                        isAlreadyAdded
                          ? 'opacity-50 cursor-not-allowed bg-livith-black-90'
                          : 'hover:bg-livith-black-70'
                      }`}
                    >
                      <div>
                        <span className="text-livith-white">{song.title}</span>
                        <span className="text-livith-black-30 text-sm ml-2">- {song.artist}</span>
                      </div>
                      {isAlreadyAdded ? (
                        <span className="text-livith-black-50 text-sm">추가됨</span>
                      ) : (
                        <span className="text-livith-yellow-60 text-sm">+ 추가</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-livith-black-30">
                {songQuery.length >= 2 ? '검색 결과가 없습니다.' : '등록된 곡이 없습니다.'}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-livith-black-50 flex justify-between items-center">
            <p className="text-livith-black-30 text-sm">
              선택된 곡: <span className="text-livith-yellow-60 font-medium">{songs.length}곡</span>
            </p>
            <Button
              onClick={() => setShowSongModal(false)}
              className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
            >
              완료
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Calendar Modal */}
    {showCalendar && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={() => setShowCalendar(null)}
      >
        <div
          className="bg-livith-black-80 rounded-xl border border-livith-black-50 p-8 modal-content min-w-[480px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => changeMonth(-1)}
              className="p-3 text-livith-black-30 hover:text-livith-white text-2xl hover:bg-livith-black-70 rounded-lg transition-colors"
            >
              ◀
            </button>
            <div className="flex items-center">
              <select
                value={calendarDate.getFullYear()}
                onChange={(e) => setCalendarDate(new Date(parseInt(e.target.value), calendarDate.getMonth(), 1))}
                className="bg-transparent text-2xl font-bold text-livith-white focus:outline-none cursor-pointer hover:text-livith-yellow-60 transition-colors appearance-none w-[4.5rem]"
              >
                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map((year) => (
                  <option key={year} value={year} className="bg-livith-black-90">{year}</option>
                ))}
              </select>
              <span className="text-2xl font-bold text-livith-white">년</span>
              <select
                value={calendarDate.getMonth()}
                onChange={(e) => setCalendarDate(new Date(calendarDate.getFullYear(), parseInt(e.target.value), 1))}
                className="bg-transparent text-2xl font-bold text-livith-white focus:outline-none cursor-pointer hover:text-livith-yellow-60 transition-colors appearance-none w-[2rem] text-right ml-3"
              >
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <option key={month} value={month} className="bg-livith-black-90">{month + 1}</option>
                ))}
              </select>
              <span className="text-2xl font-bold text-livith-white">월</span>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-3 text-livith-black-30 hover:text-livith-white text-2xl hover:bg-livith-black-70 rounded-lg transition-colors"
            >
              ▶
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div
                key={day}
                className={`text-center py-3 text-base font-semibold ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-livith-black-30'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: getFirstDayOfMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-14 h-14" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
              const isSelected = (showCalendar === 'start' && dateStr === setlistStartDate) ||
                                (showCalendar === 'end' && dateStr === setlistEndDate);
              const isToday = formatDate(new Date()) === dateStr;
              const dayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day).getDay();

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={`w-14 h-14 rounded-lg text-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-livith-yellow-60 text-livith-black-100'
                      : isToday
                        ? 'bg-livith-black-70 text-livith-yellow-60 border-2 border-livith-yellow-60'
                        : dayOfWeek === 0
                          ? 'text-red-400 hover:bg-livith-black-70'
                          : dayOfWeek === 6
                            ? 'text-blue-400 hover:bg-livith-black-70'
                            : 'text-livith-white hover:bg-livith-black-70'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => {
                setCalendarDate(new Date());
              }}
              className="text-livith-black-30 hover:text-livith-white text-base px-4 py-2 hover:bg-livith-black-70 rounded-lg transition-colors"
            >
              오늘로 이동
            </button>
            <Button
              onClick={() => setShowCalendar(null)}
              className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 px-6"
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    )}

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
            <div className="slide-up space-y-6">
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
                  <div className="flex gap-2">
                    {['EXPECTED', 'ONGOING', 'PAST'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSetlistType(type)}
                        className={`flex-1 px-4 py-2 rounded font-medium transition-all ${
                          setlistType === type
                            ? 'bg-livith-yellow-60 text-livith-black-100'
                            : 'bg-livith-black-90 text-livith-black-30 border border-livith-black-50 hover:border-livith-yellow-60 hover:text-livith-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-livith-white font-semibold mb-2">
                    시작일
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('start')}
                    className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-left hover:border-livith-yellow-60 transition-colors flex items-center justify-between"
                  >
                    <span className={setlistStartDate ? 'text-livith-white' : 'text-livith-black-30'}>
                      {setlistStartDate || 'YYYY-MM-DD'}
                    </span>
                    <span>📅</span>
                  </button>
                </div>
                <div>
                  <label className="block text-livith-white font-semibold mb-2">
                    종료일
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar('end')}
                    className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-left hover:border-livith-yellow-60 transition-colors flex items-center justify-between"
                  >
                    <span className={setlistEndDate ? 'text-livith-white' : 'text-livith-black-30'}>
                      {setlistEndDate || 'YYYY-MM-DD'}
                    </span>
                    <span>📅</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-livith-white font-semibold mb-2">
                  이미지 URL
                </label>
                <input
                  type="text"
                  value={setlistImgUrl}
                  onChange={(e) => setSetlistImgUrl(e.target.value)}
                  placeholder="셋리스트 이미지 URL (선택)"
                  className="w-full px-4 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                />
                {setlistImgUrl && (
                  <div className="mt-2">
                    <img
                      src={setlistImgUrl}
                      alt="셋리스트 이미지 미리보기"
                      className="max-h-40 rounded border border-livith-black-50 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Song Search & Add */}
              <div>
                <label className="block text-livith-white font-semibold mb-2">
                  2. 곡 추가
                </label>

                {/* Button to open song modal */}
                <button
                  type="button"
                  onClick={handleOpenSongModal}
                  className="w-full px-4 py-3 bg-livith-black-90 border border-livith-black-50 rounded text-left text-livith-black-30 hover:border-livith-yellow-60 hover:text-livith-white transition-all flex items-center justify-between"
                >
                  <span>기존 곡 검색하여 추가...</span>
                  <span className="text-livith-yellow-60">🔍</span>
                </button>

                {/* Add new song */}
                <div className="mt-3 space-y-2">
                  <p className="text-livith-black-30 text-sm">또는 새 곡 직접 추가:</p>
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
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
