'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchModal } from './SearchModal';

interface SetlistSongsCardProps {
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

export function SetlistSongsCard({ title, description, data, fields, onDataChange }: SetlistSongsCardProps) {
  const [rows, setRows] = useState(data);
  const [searchModal, setSearchModal] = useState<{
    isOpen: boolean;
    type: 'setlist' | 'song' | null;
    rowIndex: number | null;
  }>({
    isOpen: false,
    type: null,
    rowIndex: null,
  });
  const [expandedFanchants, setExpandedFanchants] = useState<Set<number>>(new Set());

  const getFieldLabel = (fieldName: string): string => {
    const labelMap: Record<string, string> = {
      'setlist_id': '셋리스트',
      'song_id': '곡',
      'order_index': '순서',
      'setlist_date': '셋리스트 날짜',
      'setlist_title': '셋리스트 제목',
      'song_title': '곡 제목',
      'fanchant_point': '팬챈트 포인트',
      'fanchant': '팬챈트',
    };
    return labelMap[fieldName] || fieldName;
  };

  const groupedBySetlist = useMemo(() => {
    const groups: Record<string, any[]> = {};
    rows.forEach((row, originalIndex) => {
      const setlistId = row.setlist_id || 'new';
      if (!groups[setlistId]) {
        groups[setlistId] = [];
      }
      groups[setlistId].push({ ...row, _originalIndex: originalIndex });
    });
    return groups;
  }, [rows]);

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

  const moveRow = (setlistId: string, fromIndex: number, toIndex: number) => {
    const group = groupedBySetlist[setlistId];
    if (!group) return;

    const newGroup = [...group];
    const [movedItem] = newGroup.splice(fromIndex, 1);
    newGroup.splice(toIndex, 0, movedItem);

    const updated = [...rows];
    newGroup.forEach((item, idx) => {
      const originalIndex = item._originalIndex;
      updated[originalIndex] = { ...updated[originalIndex], _isModified: true };
    });

    const otherRows = rows.filter(row => (row.setlist_id || 'new') !== setlistId);
    const reorderedGroup = newGroup.map(item => {
      const { _originalIndex, ...rest } = item;
      return rest;
    });

    const finalRows = [...otherRows, ...reorderedGroup];
    setRows(finalRows);
    onDataChange(finalRows);
  };

  const openSearchModal = (type: 'setlist' | 'song', rowIndex: number) => {
    setSearchModal({
      isOpen: true,
      type,
      rowIndex,
    });
  };

  const closeSearchModal = () => {
    setSearchModal({
      isOpen: false,
      type: null,
      rowIndex: null,
    });
  };

  const handleSearchSelect = (id: number, displayText: string, extraData?: any) => {
    if (searchModal.rowIndex === null || searchModal.type === null) return;

    const fieldName = searchModal.type === 'setlist' ? 'setlist_id' : 'song_id';
    const titleFieldName = searchModal.type === 'setlist' ? 'setlist_title' : 'song_title';

    const updated = [...rows];
    const updatedRow: any = {
      ...updated[searchModal.rowIndex],
      [fieldName]: id,
      [titleFieldName]: displayText,
      _isModified: true,
    };

    if (searchModal.type === 'setlist' && extraData) {
      updatedRow.setlist_date = extraData.start_date || '';
    }

    updated[searchModal.rowIndex] = updatedRow;
    setRows(updated);
    onDataChange(updated);
  };

  const toggleFanchant = (index: number) => {
    setExpandedFanchants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isDateField = (fieldName: string): boolean => {
    const dateFields = [
      'debut_date', 'start_date', 'end_date', 'scheduled_at', 'setlist_date'
    ];
    return dateFields.includes(fieldName);
  };

  const renderField = (row: any, field: any, index: number) => {
    if (field.name === 'fanchant') {
      return null;
    }

    if (field.name === 'order_index') {
      return (
        <div className="bg-livith-black-70 border border-livith-black-50 rounded-md px-3 py-2 text-livith-black-30 text-sm">
          자동
        </div>
      );
    }

    if (field.name === 'setlist_id' || field.name === 'song_id') {
      const type = field.name === 'setlist_id' ? 'setlist' : 'song';
      const titleField = field.name === 'setlist_id' ? 'setlist_title' : 'song_title';

      return (
        <div
          onClick={() => openSearchModal(type, index)}
          className="bg-livith-black-80 border border-livith-black-50 rounded-md px-3 py-2 text-livith-white cursor-pointer hover:border-livith-yellow-60 transition-colors"
        >
          {row[field.name] ? (
            <div>
              <div className="text-sm">{row[field.name]}</div>
              {row[titleField] && (
                <div className="text-xs text-livith-black-30 truncate">{row[titleField]}</div>
              )}
            </div>
          ) : (
            <div className="text-livith-black-50 text-sm">클릭하여 검색</div>
          )}
        </div>
      );
    }

    if (field.name === 'setlist_title' || field.name === 'song_title' || field.name === 'setlist_date') {
      return (
        <div className="bg-livith-black-70 border border-livith-black-50 rounded-md px-3 py-2">
          <div className="text-sm text-livith-white">{row[field.name] || '-'}</div>
          <div className="text-xs text-livith-black-30 mt-1">(검색 시 자동 입력됨)</div>
        </div>
      );
    }

    const inputType = isDateField(field.name) ? 'date' : field.type;

    return (
      <Input
        type={inputType}
        value={row[field.name] || ''}
        onChange={(e) => updateRow(index, field.name, e.target.value)}
        className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50"
        placeholder={`${getFieldLabel(field.name)} 입력`}
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

      <div className="space-y-6">
        {Object.entries(groupedBySetlist).map(([setlistId, group]) => (
          <div key={setlistId} className="border border-livith-black-50 rounded-lg p-4">
            <div className="mb-3 pb-2 border-b border-livith-black-50">
              <h4 className="text-sm font-semibold text-livith-yellow-60">
                셋리스트 ID: {setlistId} ({group.length}곡)
              </h4>
            </div>
            <div className="space-y-3">
              {group.map((row, groupIndex) => {
                const isExpanded = expandedFanchants.has(row._originalIndex);
                return (
                  <div key={row._originalIndex} className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveRow(setlistId, groupIndex, groupIndex - 1)}
                          disabled={groupIndex === 0}
                          className="h-6 px-2 text-livith-white hover:bg-livith-black-80 disabled:opacity-30"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveRow(setlistId, groupIndex, groupIndex + 1)}
                          disabled={groupIndex === group.length - 1}
                          className="h-6 px-2 text-livith-white hover:bg-livith-black-80 disabled:opacity-30"
                        >
                          ↓
                        </Button>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        {fields.filter(f => f.name !== 'fanchant').map((field) => (
                          <div key={field.name}>
                            <label className="block text-xs text-livith-black-30 mb-1">
                              {getFieldLabel(field.name)}
                            </label>
                            {renderField(row, field, row._originalIndex)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-livith-black-50 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-livith-black-30">팬챈트</label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFanchant(row._originalIndex)}
                          className="text-livith-yellow-60 hover:bg-livith-yellow-60/10 h-6 px-2"
                        >
                          {isExpanded ? '접기 ▲' : '펼치기 ▼'}
                        </Button>
                      </div>
                      {isExpanded && (
                        <Textarea
                          value={row.fanchant || ''}
                          onChange={(e) => updateRow(row._originalIndex, 'fanchant', e.target.value)}
                          className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50 min-h-[200px] resize-y"
                          placeholder="팬챈트 가사를 입력하세요..."
                        />
                      )}
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-livith-black-30">순서: {groupIndex + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRow(row._originalIndex)}
                        className="text-livith-caution hover:bg-livith-caution/10"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addNewRow}
        className="w-full mt-4 border-2 border-dashed border-livith-black-50 rounded-lg py-4 text-livith-black-30 hover:border-livith-yellow-60 hover:text-livith-yellow-60 transition-colors"
      >
        + 새 곡 추가
      </button>

      {searchModal.isOpen && searchModal.type && (
        <SearchModal
          isOpen={searchModal.isOpen}
          onClose={closeSearchModal}
          onSelect={handleSearchSelect}
          searchType={searchModal.type}
        />
      )}
    </div>
  );
}
