'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  description: string;
  onSaveAll: () => void;
  onTempSave?: () => void;
  onReset?: () => void;
  hasChanges: boolean;
  isSaving: boolean;
}

export function Header({ title, description, onSaveAll, onTempSave, onReset, hasChanges, isSaving }: HeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="bg-livith-black-90 px-8 py-4 flex items-center justify-between border-b border-livith-black-80">
        <div>
          <h1 className="text-2xl font-bold text-livith-white">{title}</h1>
          <p className="text-livith-black-50 text-sm mt-1">{description}</p>
        </div>

        <div className="flex gap-3">
          {onReset && hasChanges && (
            <Button
              onClick={() => setShowResetConfirm(true)}
              variant="outline"
              className="bg-livith-black-80 border-livith-black-50 text-livith-black-30 hover:text-red-400 hover:bg-livith-black-70"
            >
              초기화
            </Button>
          )}
          {onTempSave && (
            <Button
              onClick={onTempSave}
              disabled={!hasChanges}
              variant="outline"
              className="bg-livith-black-80 border-livith-black-50 text-livith-white hover:bg-livith-black-70 disabled:opacity-50"
            >
              임시저장
            </Button>
          )}
          <Button
            onClick={onSaveAll}
            disabled={!hasChanges || isSaving}
            className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 disabled:opacity-50"
          >
            {isSaving ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50">
              <h3 className="text-lg font-semibold text-livith-white">전체 초기화</h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-livith-white mb-2">정말 초기화하시겠습니까?</p>
              <p className="text-livith-black-30 text-sm">
                모든 임시저장 내용이 삭제됩니다.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end gap-3">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  onReset?.();
                  setShowResetConfirm(false);
                }}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                초기화
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
