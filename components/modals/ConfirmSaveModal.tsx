'use client';

import { Button } from '@/components/ui/button';

interface ConfirmSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: Record<string, any[]>;
  isLoading: boolean;
}

export function ConfirmSaveModal({ isOpen, onClose, onConfirm, changes, isLoading }: ConfirmSaveModalProps) {
  if (!isOpen) return null;

  const getChangeSummary = () => {
    const summary: { table: string; newCount: number; modifiedCount: number }[] = [];

    Object.entries(changes).forEach(([table, rows]) => {
      const newCount = rows.filter((row) => row._isNew).length;
      const modifiedCount = rows.filter((row) => row._isModified && !row._isNew).length;

      if (newCount > 0 || modifiedCount > 0) {
        summary.push({ table, newCount, modifiedCount });
      }
    });

    return summary;
  };

  const summary = getChangeSummary();
  const totalChanges = summary.reduce((acc, item) => acc + item.newCount + item.modifiedCount, 0);

  const getTableDisplayName = (tableName: string): string => {
    const displayNames: Record<string, string> = {
      'artists': 'Artists',
      'concerts': 'Concerts',
      'songs': 'Songs',
      'setlists': 'Setlists',
      'concert_comments': 'Concert Comments',
      'concert_genres': 'Concert Genres',
      'concert_info': 'Concert Info',
      'cultures': 'Cultures',
      'md': 'Merchandise',
      'schedule': 'Schedule',
      'concert_setlists': 'Concert Setlists',
      'setlist_songs': 'Setlist Songs',
      'home_sections': 'Home Sections',
      'home_concert_sections': 'Home Concert Sections',
      'search_sections': 'Search Sections',
      'search_concert_sections': 'Search Concert Sections',
      'users': 'Users',
      'reports': 'Reports',
      'resignations': 'Resignations',
      'banners': 'Banners',
    };
    return displayNames[tableName] || tableName;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-livith-black-90 rounded-lg border border-livith-black-50 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-livith-black-50">
          <h3 className="text-xl font-semibold text-livith-white">변경사항 확인</h3>
          <button
            onClick={onClose}
            className="text-livith-black-30 hover:text-livith-white transition-colors"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <p className="text-livith-white text-lg mb-2">
              총 <span className="text-livith-yellow-60 font-bold">{totalChanges}개</span>의 변경사항이 있습니다.
            </p>
            <p className="text-livith-black-30 text-sm">
              데이터베이스에 저장하시겠습니까?
            </p>
          </div>

          <div className="space-y-3">
            {summary.map((item) => (
              <div
                key={item.table}
                className="bg-livith-black-80 border border-livith-black-50 rounded-lg p-4"
              >
                <h4 className="text-livith-white font-semibold mb-2">
                  {getTableDisplayName(item.table)}
                </h4>
                <div className="flex gap-4 text-sm">
                  {item.newCount > 0 && (
                    <div className="text-livith-yellow-60">
                      ✨ 신규 추가: {item.newCount}개
                    </div>
                  )}
                  {item.modifiedCount > 0 && (
                    <div className="text-livith-yellow-60">
                      ✏️ 수정: {item.modifiedCount}개
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-livith-black-50 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-livith-black-30 hover:text-livith-white hover:bg-livith-black-80"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
          >
            {isLoading ? '저장 중...' : '확인 및 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
