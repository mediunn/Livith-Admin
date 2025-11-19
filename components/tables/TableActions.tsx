'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateData, deleteData } from '@/app/actions';

function DeleteButtonInner() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      variant="destructive"
      disabled={pending}
    >
      {pending ? '삭제 중...' : '삭제'}
    </Button>
  );
}

export function DeleteButton({ table, id }: { table: string; id: number }) {
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteData(table, id);
  };

  return (
    <form action={handleDelete}>
      <DeleteButtonInner />
    </form>
  );
}

function UpdateButtonInner() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
    >
      {pending ? '저장 중...' : '저장'}
    </Button>
  );
}

export function EditForm({
  table,
  row,
  columns
}: {
  table: string;
  row: any;
  columns: string[]
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        data[key] = value;
      }
    });

    const result = await updateData(table, row.id, data);

    if (result.success) {
      setIsEditing(false);
    } else {
      alert(result.error);
    }
  };

  if (!isEditing) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditing(true)}
      >
        수정
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-livith-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-livith-black-100 mb-4">
          데이터 수정
        </h3>

        <form action={handleUpdate} className="space-y-4">
          {columns.map((col) => {
            if (col === 'id' || col === 'created_at' || col === 'updated_at') {
              return null;
            }

            return (
              <div key={col}>
                <label className="block text-sm font-medium text-livith-black-90 mb-1">
                  {col}
                </label>
                <Input
                  type="text"
                  name={col}
                  defaultValue={row[col] || ''}
                  className="w-full"
                />
              </div>
            );
          })}

          <div className="flex gap-2 pt-4">
            <UpdateButtonInner />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
