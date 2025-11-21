'use client';

import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  description: string;
  onSaveAll: () => void;
  onTempSave?: () => void;
  hasChanges: boolean;
  isSaving: boolean;
}

export function Header({ title, description, onSaveAll, onTempSave, hasChanges, isSaving }: HeaderProps) {
  return (
    <header className="bg-livith-black-90 px-8 py-4 flex items-center justify-between border-b border-livith-black-80">
      <div>
        <h1 className="text-2xl font-bold text-livith-white">{title}</h1>
        <p className="text-livith-black-50 text-sm mt-1">{description}</p>
      </div>

      <div className="flex gap-3">
        {onTempSave && (
          <Button
            onClick={onTempSave}
            disabled={!hasChanges}
            variant="outline"
            className="bg-livith-black-80 border-livith-black-50 text-livith-white hover:bg-livith-black-70 disabled:opacity-50"
          >
            📝 임시저장
          </Button>
        )}
        <Button
          onClick={onSaveAll}
          disabled={!hasChanges || isSaving}
          className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 disabled:opacity-50"
        >
          {isSaving ? '💾 Saving...' : '💾 Save All Changes'}
        </Button>
      </div>
    </header>
  );
}
