'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handleLogout = async () => {
    if (hasChanges) {
      const confirmed = confirm('저장하지 않은 변경사항이 있습니다. 로그아웃하시겠습니까?');
      if (!confirmed) return;
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

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
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-livith-black-30 hover:text-livith-white hover:bg-livith-black-80"
        >
          🚪 로그아웃
        </Button>
      </div>
    </header>
  );
}
