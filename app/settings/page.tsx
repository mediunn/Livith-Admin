'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DBHealthResponse {
  status: 'connected' | 'disconnected';
  database?: string;
  timestamp: string;
  error?: string;
  stats?: {
    users: number;
    concerts: number;
    artists: number;
  };
}

export default function SettingsPage() {
  const [dbHealth, setDbHealth] = useState<DBHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const sshTunnelCommand = `ssh -i /Users/youz2me/Documents/인증서/livith-key.pem -L 3307:livithdb.c142i2022qs5.ap-northeast-2.rds.amazonaws.com:3306 ubuntu@43.203.48.65 -N &`;

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(sshTunnelCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const checkDatabaseConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/health/db');
      const data = await response.json();
      setDbHealth(data);
    } catch (error) {
      setDbHealth({
        status: 'disconnected',
        error: '연결 확인 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-livith-black-100">
        <div className="bg-livith-black-90 px-8 py-4 border-b border-livith-black-80">
          <h1 className="text-2xl font-bold text-livith-white">Settings</h1>
          <p className="text-livith-black-50 text-sm mt-1">System configuration and status</p>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            {/* Database Connection Status */}
            <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-livith-white">데이터베이스 연결 상태</h3>
                <Button
                  onClick={checkDatabaseConnection}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
                >
                  {isLoading ? '확인 중...' : '🔄 새로고침'}
                </Button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-livith-yellow-60"></div>
                  <p className="text-livith-black-30 mt-4">연결 상태 확인 중...</p>
                </div>
              ) : dbHealth ? (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-livith-black-30">상태:</span>
                    {dbHealth.status === 'connected' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-300 font-medium">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        연결됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-300 font-medium">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        연결 끊김
                      </span>
                    )}
                  </div>

                  {/* Connection Details */}
                  {dbHealth.status === 'connected' && (
                    <>
                      {dbHealth.database && (
                        <div className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
                          <p className="text-livith-black-30 text-sm mb-1">데이터베이스 호스트</p>
                          <p className="text-livith-white font-mono text-sm">{dbHealth.database}</p>
                        </div>
                      )}

                      {dbHealth.stats && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
                            <p className="text-livith-black-30 text-sm mb-2">사용자</p>
                            <p className="text-livith-yellow-60 text-2xl font-bold">{dbHealth.stats.users}</p>
                          </div>
                          <div className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
                            <p className="text-livith-black-30 text-sm mb-2">콘서트</p>
                            <p className="text-livith-yellow-60 text-2xl font-bold">{dbHealth.stats.concerts}</p>
                          </div>
                          <div className="bg-livith-black-90 rounded-lg p-4 border border-livith-black-50">
                            <p className="text-livith-black-30 text-sm mb-2">아티스트</p>
                            <p className="text-livith-yellow-60 text-2xl font-bold">{dbHealth.stats.artists}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Error Message */}
                  {dbHealth.error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                      <p className="text-red-300 text-sm font-medium mb-1">오류</p>
                      <p className="text-red-200 text-sm">{dbHealth.error}</p>
                    </div>
                  )}

                  {/* SSH Tunnel Reconnect - Only show in development when disconnected */}
                  {dbHealth.status === 'disconnected' && (
                    <div className="bg-livith-yellow-60/10 border border-livith-yellow-60/50 rounded-lg p-4">
                      <p className="text-livith-yellow-60 text-sm font-medium mb-3">🔧 SSH 터널 재연결 (개발 환경)</p>
                      <p className="text-livith-black-30 text-xs mb-3">
                        터미널에서 아래 명령어를 실행하여 SSH 터널을 재연결하세요:
                      </p>
                      <div className="bg-livith-black-100 rounded p-3 mb-3">
                        <code className="text-livith-white text-xs break-all font-mono">
                          {sshTunnelCommand}
                        </code>
                      </div>
                      <Button
                        onClick={copyCommand}
                        size="sm"
                        className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
                      >
                        {copied ? '✓ 복사됨!' : '📋 명령어 복사'}
                      </Button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="pt-4 border-t border-livith-black-50">
                    <p className="text-livith-black-30 text-xs">
                      마지막 확인: {new Date(dbHealth.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-livith-black-30">
                  연결 상태를 확인할 수 없습니다.
                </div>
              )}
            </div>

            {/* System Information */}
            <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
              <h3 className="text-lg font-semibold text-livith-white mb-4">시스템 정보</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-livith-black-50">
                  <span className="text-livith-black-30">환경</span>
                  <span className="text-livith-white font-medium">
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-livith-black-50">
                  <span className="text-livith-black-30">Next.js 버전</span>
                  <span className="text-livith-white font-medium">14.2.33</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-livith-black-30">Prisma ORM</span>
                  <span className="text-livith-white font-medium">5.22.0</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
