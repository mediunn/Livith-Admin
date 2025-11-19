'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchModal } from './SearchModal';

interface ConcertSetlistsCardProps {
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

export function ConcertSetlistsCard({ title, description, data, fields, onDataChange }: ConcertSetlistsCardProps) {
  const [rows, setRows] = useState(data);
  const [searchModal, setSearchModal] = useState<{
    isOpen: boolean;
    type: 'concert' | 'setlist' | null;
    rowIndex: number | null;
  }>({
    isOpen: false,
    type: null,
    rowIndex: null,
  });

  const getFieldLabel = (fieldName: string) => {
    const labelMap: Record<string, string> = {
      'concert_id': '콘서트 이름',
      'setlist_id': '셋리스트 이름',
      'type': '셋리스트 상태',
      'concert_title': '콘서트 제목',
      'setlist_title': '셋리스트 제목',
    };
    return labelMap[fieldName] || fieldName;
  };

  const getTypeLabel = (value: string) => {
    const typeMap: Record<string, string> = {
      'PAST': '진행 완료',
      'ONGOING': '진행 중',
      'EXPECTED': '예상',
    };
    return typeMap[value] || value;
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

  const openSearchModal = (type: 'concert' | 'setlist', rowIndex: number) => {
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

  const handleSearchSelect = (id: number, displayText: string) => {
    if (searchModal.rowIndex === null || searchModal.type === null) return;

    const fieldName = searchModal.type === 'concert' ? 'concert_id' : 'setlist_id';
    const titleFieldName = searchModal.type === 'concert' ? 'concert_title' : 'setlist_title';

    const updated = [...rows];
    updated[searchModal.rowIndex] = {
      ...updated[searchModal.rowIndex],
      [fieldName]: id,
      [titleFieldName]: displayText,
      _isModified: true,
    };
    setRows(updated);
    onDataChange(updated);
  };

  const isDateField = (fieldName: string): boolean => {
    const dateFields = [
      'debut_date', 'start_date', 'end_date', 'scheduled_at', 'setlist_date'
    ];
    return dateFields.includes(fieldName);
  };

  const renderField = (row: any, field: any, index: number) => {
    if (field.name === 'concert_id') {
      return (
        <div
          onClick={() => openSearchModal('concert', index)}
          className="bg-livith-black-80 border border-livith-black-50 rounded-md px-3 py-2 text-livith-white cursor-pointer hover:border-livith-yellow-60 transition-colors"
        >
          {row.concert_id ? (
            <div>
              <div className="text-sm">{row.concert_id}</div>
              {row.concert_title && (
                <div className="text-xs text-livith-black-30 truncate">{row.concert_title}</div>
              )}
            </div>
          ) : (
            <div className="text-livith-black-50 text-sm">클릭하여 검색</div>
          )}
        </div>
      );
    }

    if (field.name === 'setlist_id') {
      return (
        <div
          onClick={() => openSearchModal('setlist', index)}
          className="bg-livith-black-80 border border-livith-black-50 rounded-md px-3 py-2 text-livith-white cursor-pointer hover:border-livith-yellow-60 transition-colors"
        >
          {row.setlist_id ? (
            <div>
              <div className="text-sm">{row.setlist_id}</div>
              {row.setlist_title && (
                <div className="text-xs text-livith-black-30 truncate">{row.setlist_title}</div>
              )}
            </div>
          ) : (
            <div className="text-livith-black-50 text-sm">클릭하여 검색</div>
          )}
        </div>
      );
    }

    if (field.name === 'concert_title' || field.name === 'setlist_title') {
      return (
        <div className="bg-livith-black-70 border border-livith-black-50 rounded-md px-3 py-2">
          <div className="text-sm text-livith-white">{row[field.name] || '-'}</div>
          <div className="text-xs text-livith-black-30 mt-1">(검색 시 자동 입력됨)</div>
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <Select
          value={row[field.name] || ''}
          onValueChange={(value) => updateRow(index, field.name, value)}
        >
          <SelectTrigger className="bg-livith-black-80 border-livith-black-50 text-livith-white">
            <SelectValue placeholder={`선택하세요`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {field.name === 'type' ? getTypeLabel(option) : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          searchType={searchModal.type}
        />
      )}
    </div>
  );
}
