'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getData } from '@/app/actions';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: number, displayText: string, extraData?: any) => void;
  searchType: 'setlist' | 'song' | 'concert' | 'user' | 'artist' | 'genre' | 'home_section' | 'search_section';
}

export function SearchModal({ isOpen, onClose, onSelect, searchType }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults([]);
      setSelectedId(null);
      setSelectedText('');
      loadAllData();
    }
  }, [isOpen, searchType]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const tableMap: Record<string, string> = {
        'song': 'songs',
        'setlist': 'setlists',
        'concert': 'concerts',
        'user': 'users',
        'artist': 'artists',
        'genre': 'genres',
        'home_section': 'home_sections',
        'search_section': 'search_sections',
      };

      const table = tableMap[searchType] || 'songs';
      const response = await getData(table, {});
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results.filter((item) => {
    const query = searchQuery.toLowerCase();

    if (searchType === 'user') {
      return (
        item.nickname?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query)
      );
    } else if (searchType === 'artist') {
      return item.artist?.toLowerCase().includes(query);
    } else if (searchType === 'genre') {
      return item.name?.toLowerCase().includes(query);
    } else if (searchType === 'home_section' || searchType === 'search_section') {
      return item.section_title?.toLowerCase().includes(query);
    }

    return (
      item.title?.toLowerCase().includes(query) ||
      item.artist?.toLowerCase().includes(query)
    );
  });

  const handleSelect = (item: any) => {
    let displayText = item.title;

    if (searchType === 'setlist' || searchType === 'concert') {
      displayText = `${item.title} - ${item.artist}`;
    } else if (searchType === 'user') {
      displayText = item.nickname || item.email;
    } else if (searchType === 'artist') {
      displayText = item.artist;
    } else if (searchType === 'genre') {
      displayText = item.name;
    } else if (searchType === 'home_section' || searchType === 'search_section') {
      displayText = item.section_title;
    }

    setSelectedId(item.id);
    setSelectedText(displayText);
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      const selectedItem = results.find(item => item.id === selectedId);
      let extraData: any = {};

      if (searchType === 'setlist' && selectedItem) {
        extraData = {
          start_date: selectedItem.start_date,
          end_date: selectedItem.end_date,
          title: selectedItem.title,
          artist: selectedItem.artist,
        };
      } else if (searchType === 'concert' && selectedItem) {
        extraData = {
          title: selectedItem.title,
          artist: selectedItem.artist,
        };
      } else if (searchType === 'song' && selectedItem) {
        extraData = {
          title: selectedItem.title,
          artist: selectedItem.artist,
        };
      } else if (searchType === 'artist' && selectedItem) {
        extraData = {
          artist: selectedItem.artist,
        };
      } else if (searchType === 'user' && selectedItem) {
        extraData = {
          nickname: selectedItem.nickname,
          email: selectedItem.email,
        };
      } else if (searchType === 'genre' && selectedItem) {
        extraData = {
          name: selectedItem.name,
        };
      } else if ((searchType === 'home_section' || searchType === 'search_section') && selectedItem) {
        extraData = {
          section_title: selectedItem.section_title,
        };
      }

      onSelect(selectedId, selectedText, Object.keys(extraData).length > 0 ? extraData : undefined);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-livith-black-90 rounded-lg border border-livith-black-50 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-livith-black-50">
          <h3 className="text-lg font-semibold text-livith-white">
            {searchType === 'setlist' ? '셋리스트 검색' :
             searchType === 'concert' ? '콘서트 검색' :
             searchType === 'song' ? '곡 검색' :
             searchType === 'user' ? '사용자 검색' :
             searchType === 'artist' ? '아티스트 검색' :
             searchType === 'genre' ? '장르 검색' :
             searchType === 'home_section' ? '홈 섹션 검색' :
             searchType === 'search_section' ? '검색 섹션 검색' : '검색'}
          </h3>
          <button
            onClick={onClose}
            className="text-livith-black-30 hover:text-livith-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-livith-black-50">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50"
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="text-center text-livith-black-30 py-8">로딩 중...</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center text-livith-black-30 py-8">검색 결과가 없습니다</div>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedId === item.id
                      ? 'bg-livith-yellow-60 border-livith-yellow-60 text-livith-black-100'
                      : 'bg-livith-black-80 border-livith-black-50 text-livith-white hover:border-livith-yellow-60'
                  }`}
                >
                  <div className="font-medium">
                    {searchType === 'user' ? (item.nickname || item.email) :
                     searchType === 'artist' ? item.artist :
                     searchType === 'genre' ? item.name :
                     searchType === 'home_section' || searchType === 'search_section' ? item.section_title :
                     item.title}
                  </div>
                  {(searchType === 'setlist' || searchType === 'concert' || searchType === 'song') && item.artist && (
                    <div className="text-sm opacity-70">{item.artist}</div>
                  )}
                  {searchType === 'user' && item.email && (
                    <div className="text-sm opacity-70">{item.email}</div>
                  )}
                  <div className="text-xs opacity-50 mt-1">ID: {item.id}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-livith-black-50 flex justify-between items-center">
          <div className="text-sm text-livith-black-30">
            {selectedId !== null && (
              <span>선택됨: {selectedText}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-livith-black-30 hover:text-livith-white"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedId === null}
              className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 disabled:opacity-50"
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
