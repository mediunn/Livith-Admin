import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteButton, EditForm } from './TableActions';

interface ServerDataTableProps {
  data: any[];
  table: string;
}

export function ServerDataTable({ data, table }: ServerDataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-livith-black-50">데이터가 없습니다.</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="border border-livith-black-30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-livith-black-5">
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold text-livith-black-100">
                  {col}
                </TableHead>
              ))}
              <TableHead className="font-semibold text-livith-black-100 text-right">
                작업
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className="hover:bg-livith-black-5">
                {columns.map((col) => (
                  <TableCell key={col} className="text-livith-black-90">
                    <span className="text-sm">
                      {row[col] !== null && row[col] !== undefined
                        ? String(row[col]).substring(0, 50)
                        : '-'}
                    </span>
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <EditForm table={table} row={row} columns={columns} />
                    <DeleteButton table={table} id={row.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
