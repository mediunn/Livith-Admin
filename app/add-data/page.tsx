'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { TableCard } from '@/components/tables/TableCard';
import { SetlistSongsCard } from '@/components/tables/SetlistSongsCard';
import { ConcertSetlistsCard } from '@/components/tables/ConcertSetlistsCard';
import { ConfirmSaveModal } from '@/components/modals/ConfirmSaveModal';
import { createData, updateData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const tableCategories = {
  core: {
    title: 'Core Tables',
    tables: {
      artists: {
        title: 'Artists',
        description: 'Manage artist records',
        fields: [
          { name: 'artist', type: 'text' as const },
          { name: 'category', type: 'text' as const },
          { name: 'detail', type: 'text' as const },
          { name: 'instagram_url', type: 'text' as const },
          { name: 'keywords', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
          { name: 'debut_date', type: 'select' as const, options: Array.from({ length: 77 }, (_, i) => String(2026 - i)) },
        ],
      },
      concerts: {
        title: 'Concerts',
        description: 'Manage concert records',
        fields: [
          { name: 'code', type: 'text' as const },
          { name: 'title', type: 'text' as const },
          { name: 'start_date', type: 'text' as const },
          { name: 'end_date', type: 'text' as const },
          { name: 'status', type: 'select' as const, options: ['ONGOING', 'UPCOMING', 'COMPLETED'] },
          { name: 'poster', type: 'text' as const },
          { name: 'artist_id', type: 'number' as const },
          { name: 'ticket_site', type: 'select' as const, options: ['NOL 티켓', '예스24', '멜론티켓', '티켓링크', '네이버 예약', '기타'] },
          { name: 'ticket_url', type: 'text' as const },
          { name: 'venue', type: 'text' as const },
          { name: 'introduction', type: 'text' as const },
          { name: 'label', type: 'text' as const },
        ],
      },
      songs: {
        title: 'Songs',
        description: 'Manage song records',
        fields: [
          { name: 'title', type: 'text' as const },
          { name: 'artist', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
          { name: 'pronunciation', type: 'text' as const },
          { name: 'translation', type: 'text' as const },
          { name: 'lyrics', type: 'text' as const },
          { name: 'youtube_id', type: 'text' as const },
        ],
      },
      setlists: {
        title: 'Setlists',
        description: 'Manage setlist records',
        fields: [
          { name: 'title', type: 'text' as const },
          { name: 'artist', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
          { name: 'end_date', type: 'text' as const },
          { name: 'start_date', type: 'text' as const },
          { name: 'venue', type: 'text' as const },
        ],
      },
    },
  },
  concert_related: {
    title: 'Concert Related Tables',
    tables: {
      concert_comments: {
        title: 'Concert Comments',
        description: 'Manage concert comment records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'user_id', type: 'number' as const },
          { name: 'content', type: 'text' as const },
        ],
      },
      concert_genres: {
        title: 'Concert Genres',
        description: 'Manage concert genre records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'concert_title', type: 'text' as const },
          { name: 'genre_id', type: 'number' as const },
          { name: 'name', type: 'text' as const },
        ],
      },
      concert_info: {
        title: 'Concert Info',
        description: 'Manage concert info records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'category', type: 'text' as const },
          { name: 'content', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
        ],
      },
      cultures: {
        title: 'Cultures',
        description: 'Manage culture records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'content', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
          { name: 'title', type: 'text' as const },
        ],
      },
      md: {
        title: 'Merchandise',
        description: 'Manage merchandise records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'name', type: 'text' as const },
          { name: 'price', type: 'text' as const },
          { name: 'img_url', type: 'text' as const },
        ],
      },
      schedule: {
        title: 'Schedule',
        description: 'Manage schedule records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'category', type: 'text' as const },
          { name: 'scheduled_at', type: 'text' as const },
          { name: 'type', type: 'select' as const, options: ['CONCERT', 'TICKETING'] },
        ],
      },
    },
  },
  setlist_related: {
    title: 'Setlist Related Tables',
    tables: {
      concert_setlists: {
        title: 'Concert Setlists',
        description: 'Manage concert setlist records',
        fields: [
          { name: 'concert_id', type: 'number' as const },
          { name: 'setlist_id', type: 'number' as const },
          { name: 'type', type: 'select' as const, options: ['ONGOING', 'PAST', 'EXPECTED'] },
          { name: 'concert_title', type: 'text' as const },
          { name: 'setlist_title', type: 'text' as const },
        ],
      },
      setlist_songs: {
        title: 'Setlist Songs',
        description: 'Manage setlist song records',
        fields: [
          { name: 'setlist_id', type: 'number' as const },
          { name: 'song_id', type: 'number' as const },
          { name: 'order_index', type: 'number' as const },
          { name: 'setlist_date', type: 'text' as const },
          { name: 'setlist_title', type: 'text' as const },
          { name: 'song_title', type: 'text' as const },
          { name: 'fanchant_point', type: 'text' as const },
          { name: 'fanchant', type: 'text' as const },
        ],
      },
    },
  },
  home_sections: {
    title: 'Home Section Tables',
    tables: {
      home_sections: {
        title: 'Home Sections',
        description: 'Manage home section records',
        fields: [
          { name: 'section_title', type: 'text' as const },
        ],
      },
      home_concert_sections: {
        title: 'Home Concert Sections',
        description: 'Manage home concert section records',
        fields: [
          { name: 'home_section_id', type: 'number' as const },
          { name: 'concert_id', type: 'number' as const },
          { name: 'section_title', type: 'text' as const },
          { name: 'concert_title', type: 'text' as const },
          { name: 'sorted_index', type: 'number' as const },
        ],
      },
    },
  },
  search_sections: {
    title: 'Search Section Tables',
    tables: {
      search_sections: {
        title: 'Search Sections',
        description: 'Manage search section records',
        fields: [
          { name: 'section_title', type: 'text' as const },
        ],
      },
      search_concert_sections: {
        title: 'Search Concert Sections',
        description: 'Manage search concert section records',
        fields: [
          { name: 'search_section_id', type: 'number' as const },
          { name: 'concert_id', type: 'number' as const },
          { name: 'section_title', type: 'text' as const },
          { name: 'concert_title', type: 'text' as const },
          { name: 'sorted_index', type: 'number' as const },
        ],
      },
    },
  },
  user_related: {
    title: 'User Related Tables',
    tables: {
      users: {
        title: 'Users',
        description: 'Manage user records',
        fields: [
          { name: 'interest_concert_id', type: 'number' as const },
          { name: 'provider', type: 'select' as const, options: ['kakao', 'apple'] },
          { name: 'provider_id', type: 'text' as const },
          { name: 'email', type: 'text' as const },
          { name: 'nickname', type: 'text' as const },
          { name: 'marketing_consent', type: 'select' as const, options: ['true', 'false'] },
          { name: 'refresh_token', type: 'text' as const },
        ],
      },
      reports: {
        title: 'Reports',
        description: 'Manage report records',
        fields: [
          { name: 'comment_id', type: 'number' as const },
          { name: 'comment_content', type: 'text' as const },
          { name: 'comment_user_id', type: 'number' as const },
          { name: 'report_reason', type: 'text' as const },
        ],
      },
      resignations: {
        title: 'Resignations',
        description: 'Manage resignation records',
        fields: [
          { name: 'user_id', type: 'number' as const },
          { name: 'content', type: 'text' as const },
        ],
      },
    },
  },
  banners: {
    title: 'Banner Tables',
    tables: {
      banners: {
        title: 'Banners',
        description: 'Manage banner records',
        fields: [
          { name: 'img_url', type: 'text' as const },
          { name: 'category', type: 'text' as const },
          { name: 'title', type: 'text' as const },
          { name: 'content', type: 'text' as const },
        ],
      },
    },
  },
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const allTables = Object.values(tableCategories).flatMap(category =>
    Object.keys(category.tables)
  );

  const [changes, setChanges] = useState<Record<string, any[]>>(
    allTables.reduce((acc, table) => ({ ...acc, [table]: [] }), {})
  );

  // Load temp save on mount
  useEffect(() => {
    const savedData = localStorage.getItem('livith_temp_save');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setChanges(parsed);
      } catch (error) {
        console.error('Failed to load temp save:', error);
      }
    }
  }, []);

  const handleDataChange = (table: string, newData: any[]) => {
    setChanges((prev) => ({
      ...prev,
      [table]: newData,
    }));
  };

  const handleTempSave = () => {
    try {
      localStorage.setItem('livith_temp_save', JSON.stringify(changes));
      toast({
        title: '임시저장 완료',
        description: '변경사항이 임시저장되었습니다.',
      });
    } catch (error) {
      toast({
        title: '임시저장 실패',
        description: '임시저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    let hasError = false;
    const errors: string[] = [];

    try {
      for (const [table, rows] of Object.entries(changes)) {
        if (table === 'setlist_songs') {
          const groupedBySetlist: Record<string, any[]> = {};
          rows.forEach((row) => {
            const setlistId = row.setlist_id || 'new';
            if (!groupedBySetlist[setlistId]) {
              groupedBySetlist[setlistId] = [];
            }
            groupedBySetlist[setlistId].push(row);
          });

          for (const [setlistId, songs] of Object.entries(groupedBySetlist)) {
            for (let idx = 0; idx < songs.length; idx++) {
              const row = songs[idx];
              const dataWithOrder = { ...row, order_index: idx };

              try {
                if (row._isNew) {
                  const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = dataWithOrder;
                  const result = await createData(table, data);
                  if (!result.success) {
                    hasError = true;
                    errors.push(`${table} 생성 실패: ${result.error}`);
                  }
                } else if (row._isModified && row.id) {
                  const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = dataWithOrder;
                  const result = await updateData(table, row.id, data);
                  if (!result.success) {
                    hasError = true;
                    errors.push(`${table} 수정 실패: ${result.error}`);
                  }
                }
              } catch (err) {
                hasError = true;
                errors.push(`${table} 처리 중 오류 발생`);
              }
            }
          }
        } else if (table === 'concert_setlists') {
          for (const row of rows) {
            const dataWithStatus = { ...row, status: '' };
            try {
              if (row._isNew) {
                const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = dataWithStatus;
                const result = await createData(table, data);
                if (!result.success) {
                  hasError = true;
                  errors.push(`${table} 생성 실패: ${result.error}`);
                }
              } else if (row._isModified && row.id) {
                const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = dataWithStatus;
                const result = await updateData(table, row.id, data);
                if (!result.success) {
                  hasError = true;
                  errors.push(`${table} 수정 실패: ${result.error}`);
                }
              }
            } catch (err) {
              hasError = true;
              errors.push(`${table} 처리 중 오류 발생`);
            }
          }
        } else {
          for (const row of rows) {
            try {
              if (row._isNew) {
                const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = row;
                const result = await createData(table, data);
                if (!result.success) {
                  hasError = true;
                  errors.push(`${table} 생성 실패: ${result.error}`);
                }
              } else if (row._isModified && row.id) {
                const { _isNew, _isModified, id, created_at, updated_at, deleted_at, ...data } = row;
                const result = await updateData(table, row.id, data);
                if (!result.success) {
                  hasError = true;
                  errors.push(`${table} 수정 실패: ${result.error}`);
                }
              }
            } catch (err) {
              hasError = true;
              errors.push(`${table} 처리 중 오류 발생`);
            }
          }
        }
      }

      if (hasError) {
        toast({
          title: '일부 데이터 저장 실패',
          description: errors.length > 0 ? errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : '') : '일부 데이터 저장 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      } else {
        // Clear temp save after successful save
        localStorage.removeItem('livith_temp_save');

        toast({
          title: '저장 완료',
          description: '모든 변경사항이 성공적으로 저장되었습니다.',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };

  const hasChanges = Object.values(changes).some(
    (data) => data.some((row) => row._isNew || row._isModified)
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-livith-black-100">
        <Header
          title="Database Management"
          description="Add and manage data across all tables"
          onSaveAll={handleOpenConfirmModal}
          onTempSave={handleTempSave}
          hasChanges={hasChanges}
          isSaving={isSaving}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="flex flex-col gap-8 w-full">
            {Object.entries(tableCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="flex flex-col gap-4">
                <div className="border-b border-livith-black-50 pb-2">
                  <h2 className="text-xl font-bold text-livith-yellow-60">{category.title}</h2>
                </div>
                <div className="flex flex-col gap-6">
                  {Object.entries(category.tables).map(([tableName, config]) => {
                    if (tableName === 'setlist_songs') {
                      return (
                        <SetlistSongsCard
                          key={tableName}
                          title={config.title}
                          description={config.description}
                          data={[]}
                          fields={config.fields}
                          onDataChange={(data) => handleDataChange(tableName, data)}
                        />
                      );
                    } else if (tableName === 'concert_setlists') {
                      return (
                        <ConcertSetlistsCard
                          key={tableName}
                          title={config.title}
                          description={config.description}
                          data={[]}
                          fields={config.fields}
                          onDataChange={(data) => handleDataChange(tableName, data)}
                        />
                      );
                    } else {
                      return (
                        <TableCard
                          key={tableName}
                          title={config.title}
                          description={config.description}
                          data={[]}
                          fields={config.fields}
                          onDataChange={(data) => handleDataChange(tableName, data)}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ConfirmSaveModal
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmSave}
        changes={changes}
        isLoading={isSaving}
      />
    </div>
  );
}
