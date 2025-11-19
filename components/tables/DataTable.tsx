'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updateData, deleteData } from '@/app/actions';

interface DataTableProps {
  data: any[];
  table: string;
}

export function DataTable({ data, table }: DataTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  if (!data || data.length === 0) {
    return <p className="text-livith-black-50">데이터가 없습니다.</p>;
  }

  const columns = Object.keys(data[0]);

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setEditForm(row);
  };

  const handleSave = async (id: number) => {
    const { id: _, created_at, updated_at, ...dataToUpdate } = editForm;
    const result = await updateData(table, id, dataToUpdate);

    if (result.success) {
      setEditingId(null);
      setEditForm({});
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const result = await deleteData(table, id);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="border border-livith-black-30 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-livith-black-5">
            {columns.map((col) => (
              <TableHead key={col} className="font-semibold text-livith-black-100">
                {col}
              </TableHead>
            ))}
            <TableHead className="font-semibold text-livith-black-100">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="hover:bg-livith-black-5">
              {columns.map((col) => (
                <TableCell key={col} className="text-livith-black-90">
                  {editingId === row.id && col !== 'id' && col !== 'created_at' && col !== 'updated_at' ? (
                    <input
                      type="text"
                      value={editForm[col] ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, [col]: e.target.value })}
                      className="w-full px-2 py-1 border border-livith-black-30 rounded"
                    />
                  ) : (
                    <span className="text-sm">
                      {row[col]?.toString().substring(0, 50) || '-'}
                    </span>
                  )}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-2">
                  {editingId === row.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(row.id)}
                        className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row)}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id)}
                      >
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
