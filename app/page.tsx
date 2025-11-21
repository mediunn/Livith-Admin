'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DBStats {
  users: number;
  concerts: number;
  artists: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DBStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/health/db');
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-livith-black-100">
        <div className="bg-livith-black-90 px-8 py-4 border-b border-livith-black-80">
          <h1 className="text-2xl font-bold text-livith-white">Dashboard</h1>
          <p className="text-livith-black-50 text-sm mt-1">Overview of your database</p>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
                <p className="text-livith-black-30 text-sm mb-2">Total Users</p>
                <p className="text-livith-yellow-60 text-3xl font-bold">
                  {isLoading ? '...' : stats?.users ?? 0}
                </p>
              </div>
              <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
                <p className="text-livith-black-30 text-sm mb-2">Total Concerts</p>
                <p className="text-livith-yellow-60 text-3xl font-bold">
                  {isLoading ? '...' : stats?.concerts ?? 0}
                </p>
              </div>
              <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
                <p className="text-livith-black-30 text-sm mb-2">Total Artists</p>
                <p className="text-livith-yellow-60 text-3xl font-bold">
                  {isLoading ? '...' : stats?.artists ?? 0}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
              <h3 className="text-lg font-semibold text-livith-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/add-data">
                  <Button className="w-full bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30">
                    ➕ Add Data
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="outline" className="w-full bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60">
                    👥 View Users
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60">
                    ⚙️ Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
