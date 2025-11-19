'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchModal } from './SearchModal';

interface TableCardProps {
  title: string;
  description: string;
  data: any[];
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
  }>;
  onDataChange: (newData: any[]) => void;
}

export function TableCard({ title, description, data, fields, onDataChange }: TableCardProps) {
  const [rows, setRows] = useState(data);
  const [searchModal, setSearchModal] = useState<{
    isOpen: boolean;
    type: string | null;
    rowIndex: number | null;
    fieldName: string | null;
  }>({
    isOpen: false,
    type: null,
    rowIndex: null,
    fieldName: null,
  });

  const getSearchType = (fieldName: string): string | null => {
    if (fieldName === 'concert_id') return 'concert';
    if (fieldName === 'setlist_id') return 'setlist';
    if (fieldName === 'song_id') return 'song';
    if (fieldName === 'user_id') return 'user';
    if (fieldName === 'artist_id') return 'artist';
    if (fieldName === 'genre_id') return 'genre';
    if (fieldName === 'home_section_id') return 'home_section';
    if (fieldName === 'search_section_id') return 'search_section';
    return null;
  };

  const getFieldLabel = (fieldName: string): string => {
    const labelMap: Record<string, string> = {
      'concert_id': '콘서트',
      'user_id': '사용자',
      'content': '내용',
      'concert_title': '콘서트 제목',
      'genre_id': '장르',
      'name': '이름',
      'category': '카테고리',
      'img_url': '이미지 URL',
      'price': '가격',
      'scheduled_at': '예정 시간',
      'type': '타입',
      'home_section_id': '홈 섹션',
      'section_title': '섹션 제목',
      'sorted_index': '정렬 순서',
      'search_section_id': '검색 섹션',
      'artist_id': '아티스트',
      'setlist_id': '셋리스트',
      'song_id': '곡',
      'interest_concert_id': '관심 콘서트',
      'provider': '제공자',
      'provider_id': '제공자 ID',
      'email': '이메일',
      'nickname': '닉네임',
      'marketing_consent': '마케팅 동의',
      'refresh_token': '리프레시 토큰',
      'comment_id': '댓글',
      'comment_content': '댓글 내용',
      'comment_user_id': '댓글 작성자',
      'report_reason': '신고 사유',
      'title': '제목',
      'artist': '아티스트',
      'detail': '아티스트 설명',
      'instagram_url': '인스타그램 URL',
      'keywords': '키워드',
      'debut_date': '데뷔년도',
      'code': '코드',
      'start_date': '시작일',
      'end_date': '종료일',
      'status': '상태',
      'poster': '포스터',
      'ticket_site': '티켓 사이트',
      'ticket_url': '티켓 URL',
      'venue': '장소',
      'introduction': '소개',
      'label': '레이블',
    };
    return labelMap[fieldName] || fieldName;
  };

  const getPlaceholder = (fieldName: string): string => {
    const placeholderMap: Record<string, string> = {
      'artist': '원어 (한국어) 형식으로 입력',
      'category': 'ex. 싱어송라이터, 밴드 등',
      'keywords': 'ex. 팝, 듀오, 인디팝 등',
      'detail': '아티스트에 대한 설명을 입력하세요',
    };
    return placeholderMap[fieldName] || `${getFieldLabel(fieldName)} 입력`;
  };

  const addNewRow = () => {
    const newRow: any = {};
    fields.forEach(field => {
      newRow[field.name] = '';
    });
    newRow._isNew = true;
    const updated = [...rows, newRow];
    setRows(updated);
    onDataChange(updated);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value, _isModified: true };
    setRows(updated);
    onDataChange(updated);
  };

  const deleteRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onDataChange(updated);
  };

  const openSearchModal = (fieldName: string, rowIndex: number) => {
    const searchType = getSearchType(fieldName);
    if (searchType) {
      setSearchModal({
        isOpen: true,
        type: searchType,
        rowIndex,
        fieldName,
      });
    }
  };

  const closeSearchModal = () => {
    setSearchModal({
      isOpen: false,
      type: null,
      rowIndex: null,
      fieldName: null,
    });
  };

  const handleSearchSelect = (id: number, displayText: string, extraData?: any) => {
    if (searchModal.rowIndex === null || searchModal.fieldName === null) return;

    const updated = [...rows];
    const updatedRow: any = {
      ...updated[searchModal.rowIndex],
      [searchModal.fieldName]: id,
      _isModified: true,
    };

    // Auto-fill related fields based on search type
    if (extraData) {
      if (searchModal.fieldName === 'concert_id') {
        if (extraData.title) updatedRow.concert_title = extraData.title;
        if (extraData.artist) updatedRow.artist = extraData.artist;
      } else if (searchModal.fieldName === 'artist_id') {
        if (extraData.artist) updatedRow.artist = extraData.artist;
      } else if (searchModal.fieldName === 'user_id') {
        if (extraData.nickname) updatedRow.nickname = extraData.nickname;
        if (extraData.email) updatedRow.email = extraData.email;
      } else if (searchModal.fieldName === 'genre_id') {
        if (extraData.name) updatedRow.name = extraData.name;
      } else if (searchModal.fieldName === 'home_section_id') {
        if (extraData.section_title) updatedRow.section_title = extraData.section_title;
      } else if (searchModal.fieldName === 'search_section_id') {
        if (extraData.section_title) updatedRow.section_title = extraData.section_title;
      } else if (searchModal.fieldName === 'song_id') {
        if (extraData.title) updatedRow.song_title = extraData.title;
        if (extraData.artist) updatedRow.artist = extraData.artist;
      }
    }

    updated[searchModal.rowIndex] = updatedRow;
    setRows(updated);
    onDataChange(updated);
  };

  const isAutoFilledField = (fieldName: string, allFieldNames: string[]): boolean => {
    // If it's the Artists table (has 'artist' but not 'artist_id'), allow editing 'artist'
    if (fieldName === 'artist' && !allFieldNames.includes('artist_id')) {
      return false;
    }

    const autoFilledFields = [
      'concert_title', 'artist', 'nickname', 'email', 'name',
      'section_title', 'song_title'
    ];
    return autoFilledFields.includes(fieldName);
  };

  const isDateField = (fieldName: string): boolean => {
    const dateFields = [
      'debut_date', 'start_date', 'end_date', 'scheduled_at', 'setlist_date'
    ];
    return dateFields.includes(fieldName);
  };

  const renderField = (row: any, field: any, index: number) => {
    const allFieldNames = fields.map(f => f.name);
    const searchType = getSearchType(field.name);

    if (searchType) {
      // Determine the display name field based on the ID field
      let displayNameField = null;
      if (field.name === 'concert_id') displayNameField = 'concert_title';
      else if (field.name === 'setlist_id') displayNameField = 'setlist_title';
      else if (field.name === 'song_id') displayNameField = 'song_title';
      else if (field.name === 'artist_id') displayNameField = 'artist';
      else if (field.name === 'user_id') displayNameField = 'nickname';
      else if (field.name === 'genre_id') displayNameField = 'name';
      else if (field.name === 'home_section_id') displayNameField = 'section_title';
      else if (field.name === 'search_section_id') displayNameField = 'section_title';

      return (
        <div
          onClick={() => openSearchModal(field.name, index)}
          className="bg-livith-black-80 border border-livith-black-50 rounded-md px-3 py-2 text-livith-white cursor-pointer hover:border-livith-yellow-60 transition-colors"
        >
          {row[field.name] ? (
            <div>
              <div className="text-sm">{row[field.name]}</div>
              {displayNameField && row[displayNameField] && (
                <div className="text-xs text-livith-black-30 truncate">{row[displayNameField]}</div>
              )}
            </div>
          ) : (
            <div className="text-livith-black-50 text-sm">클릭하여 검색</div>
          )}
        </div>
      );
    }

    if (isAutoFilledField(field.name, allFieldNames)) {
      return (
        <div className="bg-livith-black-70 border border-livith-black-50 rounded-md px-3 py-2">
          <div className="text-sm text-livith-white">{row[field.name] || '-'}</div>
          <div className="text-xs text-livith-black-30 mt-1">(검색 시 자동 입력됨)</div>
        </div>
      );
    }

    if (field.type === 'select') {
      // Special handling for ticket_site field with "기타" option
      if (field.name === 'ticket_site') {
        const currentValue = row[field.name] || '';
        const isCustomValue = currentValue && !field.options?.includes(currentValue);

        if (isCustomValue || currentValue === '기타') {
          return (
            <div className="space-y-2">
              <Input
                type="text"
                value={isCustomValue ? currentValue : ''}
                onChange={(e) => updateRow(index, field.name, e.target.value)}
                className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50"
                placeholder="티켓 사이트 이름을 입력하세요"
              />
              <button
                onClick={() => updateRow(index, field.name, '')}
                className="text-xs text-livith-black-30 hover:text-livith-yellow-60 transition-colors"
              >
                드롭다운으로 변경
              </button>
            </div>
          );
        }
      }

      return (
        <Select
          value={row[field.name] || ''}
          onValueChange={(value) => {
            if (field.name === 'ticket_site' && value === '기타') {
              updateRow(index, field.name, '기타');
            } else {
              updateRow(index, field.name, value);
            }
          }}
        >
          <SelectTrigger className="bg-livith-black-80 border-livith-black-50 text-livith-white">
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Date fields use date picker
    const inputType = isDateField(field.name) ? 'date' : field.type;

    return (
      <Input
        type={inputType}
        value={row[field.name] || ''}
        onChange={(e) => updateRow(index, field.name, e.target.value)}
        className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50"
        placeholder={getPlaceholder(field.name)}
      />
    );
  };

  return (
    <div className="bg-livith-black-80 rounded-lg p-6 border border-livith-black-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-livith-white">{title}</h3>
          <p className="text-livith-black-50 text-sm">{description}</p>
        </div>
        <div className="bg-livith-yellow-60 text-livith-black-100 px-3 py-1 rounded-full text-sm font-medium">
          {rows.length} rows
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
            <div className="grid grid-cols-3 gap-3">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs text-livith-black-30 mb-1">
                    {getFieldLabel(field.name)}
                  </label>
                  {renderField(row, field, index)}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteRow(index)}
                className="text-livith-caution hover:bg-livith-caution/10"
              >
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addNewRow}
        className="w-full mt-4 border-2 border-dashed border-livith-black-50 rounded-lg py-4 text-livith-black-30 hover:border-livith-yellow-60 hover:text-livith-yellow-60 transition-colors"
      >
        + 새 데이터 추가
      </button>

      {searchModal.isOpen && searchModal.type && (
        <SearchModal
          isOpen={searchModal.isOpen}
          onClose={closeSearchModal}
          onSelect={handleSearchSelect}
          searchType={searchModal.type as any}
        />
      )}
    </div>
  );
}
