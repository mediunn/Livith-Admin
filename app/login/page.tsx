'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공 - 페이지 새로고침으로 리다이렉트
        window.location.href = '/';
      } else {
        setError(data.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-livith-black-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-livith-black-90 rounded-lg border border-livith-black-50 p-8">
          {/* Logo/Title */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Livith"
                className="h-6"
              />
              <span className="text-livith-white text-2xl font-bold">Admin</span>
            </div>
            <p className="text-livith-black-30 text-sm">
              관리자 로그인이 필요합니다
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-livith-white mb-2"
              >
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                className="bg-livith-black-80 border-livith-black-50 text-livith-white placeholder:text-livith-black-50"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-livith-caution/10 border border-livith-caution rounded-lg p-3">
                <p className="text-livith-caution text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-livith-black-30 text-xs">
              Livith Admin Dashboard v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
