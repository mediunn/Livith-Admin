'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createData } from '@/app/actions';

interface CreateFormProps {
  table: string;
  fields: string[];
}

export function CreateForm({ table, fields }: CreateFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createData(table, formData);

    if (result.success) {
      setFormData({});
      setIsOpen(false);
      alert('데이터가 생성되었습니다.');
    } else {
      alert(result.error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
      >
        + 새 데이터 추가
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-livith-black-30 rounded-lg p-6 bg-livith-white">
      <h3 className="text-lg font-semibold text-livith-black-100 mb-4">새 데이터 추가</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-livith-black-90 mb-1">
              {field}
            </label>
            <Input
              type="text"
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30">
          생성
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
