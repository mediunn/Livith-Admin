'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TableStats {
  count: number;
  recent?: any[];
}

interface DashboardStats {
  users: TableStats;
  concerts: TableStats;
  artists: TableStats;
  songs: TableStats;
  setlists: TableStats;
  banners: TableStats;
  md: TableStats;
  schedules: TableStats;
  genres: TableStats;
  cultures: TableStats;
  reports: TableStats;
  concert_comments: TableStats;
  home_sections: TableStats;
  search_sections: TableStats;
}

interface RecentConcert {
  id: number;
  title: string;
  artist: string | null;
  status: string;
  start_date: string;
  end_date: string;
  venue: string | null;
  poster: string | null;
  updated_at: string;
}

interface ConcertDetail {
  id: number;
  title: string;
  artist: string | null;
  status: string;
  start_date: string;
  end_date: string;
  venue: string | null;
  poster: string | null;
  code: string | null;
  ticket_site: string | null;
  ticket_url: string | null;
  label: string | null;
  introduction: string | null;
  concert_setlists: {
    id: number;
    type: string;
    status: string | null;
    setlists: {
      id: number;
      title: string;
      artist: string | null;
      start_date: string;
      end_date: string;
      venue: string | null;
    };
  }[];
  md: {
    id: number;
    name: string;
    price: string | null;
    img_url: string | null;
  }[];
  schedule: {
    id: number;
    category: string;
    scheduled_at: string;
    type: string | null;
  }[];
  cultures: {
    id: number;
    title: string;
    content: string;
    img_url: string | null;
  }[];
  concert_genres: {
    id: number;
    genres: {
      id: number;
      name: string;
    };
  }[];
  concert_info: {
    id: number;
    category: string;
    content: string;
    img_url: string | null;
  }[];
  concert_comments: {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
    users: {
      id: number;
      nickname: string | null;
      email: string | null;
    };
  }[];
}

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  recentlyUpdatedConcerts: RecentConcert[];
  stats: DashboardStats;
  error?: string;
}

const PAGE_SIZE = 20;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [tablePages, setTablePages] = useState<Record<string, number>>({
    users: 1,
    concerts: 1,
    artists: 1,
    songs: 1,
    setlists: 1,
    banners: 1,
    md: 1,
    schedules: 1,
    genres: 1,
    cultures: 1,
    reports: 1,
    home_sections: 1,
    search_sections: 1,
  });
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    tableName: string;
    item: any;
    fields: { key: string; label: string; type: string }[];
  } | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ tableName: string; id: number; title: string } | null>(null);
  const [concertDetail, setConcertDetail] = useState<ConcertDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [commentDetail, setCommentDetail] = useState<any | null>(null);
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    tableName: string;
    fields: { key: string; label: string; type: string }[];
  } | null>(null);
  const [addFormData, setAddFormData] = useState<Record<string, any>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [sectionDetail, setSectionDetail] = useState<{
    type: 'home' | 'search';
    section: any;
    concerts: any[];
  } | null>(null);
  const [isLoadingSectionDetail, setIsLoadingSectionDetail] = useState(false);
  const [sectionConcertQuery, setSectionConcertQuery] = useState('');
  const [sectionConcertResults, setSectionConcertResults] = useState<any[]>([]);
  const [showSectionConcertResults, setShowSectionConcertResults] = useState(false);
  const [reportCommentQuery, setReportCommentQuery] = useState('');
  const [reportCommentResults, setReportCommentResults] = useState<any[]>([]);
  const [showReportCommentResults, setShowReportCommentResults] = useState(false);
  const { toast } = useToast();

  // Search concerts for section
  useEffect(() => {
    const searchConcerts = async () => {
      if (sectionConcertQuery.length < 2) {
        setSectionConcertResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/dashboard/search?type=concerts&q=${encodeURIComponent(sectionConcertQuery)}`);
        const result = await response.json();
        if (result.success) {
          setSectionConcertResults(result.data);
          setShowSectionConcertResults(true);
        }
      } catch (error) {
        console.error('Concert search error:', error);
      }
    };

    const debounce = setTimeout(searchConcerts, 300);
    return () => clearTimeout(debounce);
  }, [sectionConcertQuery]);

  // Search comments for report
  useEffect(() => {
    const searchComments = async () => {
      if (reportCommentQuery.length < 2) {
        setReportCommentResults([]);
        return;
      }

      try {
        // Search from concert_comments
        const allComments = data?.stats.concert_comments.recent || [];
        const filtered = allComments.filter((comment: any) =>
          comment.content?.toLowerCase().includes(reportCommentQuery.toLowerCase()) ||
          comment.users?.nickname?.toLowerCase().includes(reportCommentQuery.toLowerCase()) ||
          comment.users?.email?.toLowerCase().includes(reportCommentQuery.toLowerCase()) ||
          comment.id.toString().includes(reportCommentQuery)
        );
        setReportCommentResults(filtered.slice(0, 10));
        setShowReportCommentResults(true);
      } catch (error) {
        console.error('Comment search error:', error);
      }
    };

    const debounce = setTimeout(searchComments, 300);
    return () => clearTimeout(debounce);
  }, [reportCommentQuery, data]);

  const handleSelectCommentForReport = (comment: any) => {
    setAddFormData(prev => ({
      ...prev,
      comment_id: comment.id,
      comment_content: comment.content,
      comment_user_id: comment.user_id,
    }));
    setReportCommentQuery('');
    setShowReportCommentResults(false);
  };

  const handleAddConcertToSection = async (concertId: number) => {
    if (!sectionDetail) return;

    try {
      const tableName = sectionDetail.type === 'home' ? 'home_concert_sections' : 'search_concert_sections';
      const sectionIdKey = sectionDetail.type === 'home' ? 'home_section_id' : 'search_section_id';

      const response = await fetch(`/api/dashboard/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [sectionIdKey]: sectionDetail.section.id,
          concert_id: concertId,
          sorted_index: sectionDetail.concerts.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add concert');
      }

      toast({
        title: '추가 완료',
        description: '콘서트가 섹션에 추가되었습니다.',
      });

      // Refresh section detail
      fetchSectionDetail(sectionDetail.type, sectionDetail.section.id);
      setSectionConcertQuery('');
      setShowSectionConcertResults(false);
    } catch (error) {
      toast({
        title: '추가 실패',
        description: '콘서트 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveConcertFromSection = async (sectionConcertId: number) => {
    if (!sectionDetail) return;

    try {
      const tableName = sectionDetail.type === 'home' ? 'home_concert_sections' : 'search_concert_sections';

      const response = await fetch(`/api/dashboard/${tableName}/${sectionConcertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove concert');
      }

      toast({
        title: '삭제 완료',
        description: '콘서트가 섹션에서 제거되었습니다.',
      });

      // Refresh section detail
      fetchSectionDetail(sectionDetail.type, sectionDetail.section.id);
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: '콘서트 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSyncSections = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/dashboard/sync-sections', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: '동기화 완료',
          description: `홈/서치 섹션이 업데이트되었습니다.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: '동기화 실패',
        description: '섹션 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchConcertDetail = async (concertId: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/dashboard/concerts/${concertId}`);
      const result = await response.json();
      if (result.success) {
        setConcertDetail(result.data);
      } else {
        toast({
          title: '오류',
          description: '콘서트 상세 정보를 불러올 수 없습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '콘서트 상세 정보를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const fetchUserDetail = async (userId: number) => {
    try {
      // Find user from the stats data
      const user = data?.stats.users.recent?.find((u: any) => u.id === userId);
      if (user) {
        setUserDetail(user);
      } else {
        // Fetch from API if not in recent
        const response = await fetch(`/api/dashboard/users/${userId}`);
        const result = await response.json();
        if (result.success) {
          setUserDetail(result.data);
        } else {
          toast({
            title: '오류',
            description: '사용자 정보를 불러올 수 없습니다.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '사용자 정보를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  const fetchCommentDetail = async (commentId: number) => {
    try {
      // Find comment from the stats data
      const comment = data?.stats.concert_comments.recent?.find((c: any) => c.id === commentId);
      if (comment) {
        setCommentDetail(comment);
      } else {
        // Fetch from API if not in recent
        const response = await fetch(`/api/dashboard/concert_comments/${commentId}`);
        const result = await response.json();
        if (result.success) {
          setCommentDetail(result.data);
        } else {
          toast({
            title: '오류',
            description: '댓글 정보를 불러올 수 없습니다.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '댓글 정보를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  const fetchStats = async (pages?: Record<string, number>) => {
    const currentPages = pages || tablePages;
    const params = new URLSearchParams();
    params.set('usersPage', currentPages.users?.toString() || '1');
    params.set('concertsPage', currentPages.concerts?.toString() || '1');
    params.set('artistsPage', currentPages.artists?.toString() || '1');
    params.set('songsPage', currentPages.songs?.toString() || '1');
    params.set('setlistsPage', currentPages.setlists?.toString() || '1');
    params.set('bannersPage', currentPages.banners?.toString() || '1');
    params.set('mdPage', currentPages.md?.toString() || '1');
    params.set('schedulesPage', currentPages.schedules?.toString() || '1');
    params.set('genresPage', currentPages.genres?.toString() || '1');
    params.set('culturesPage', currentPages.cultures?.toString() || '1');
    params.set('reportsPage', currentPages.reports?.toString() || '1');
    params.set('homeSectionsPage', currentPages.home_sections?.toString() || '1');
    params.set('searchSectionsPage', currentPages.search_sections?.toString() || '1');

    try {
      const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      await fetchStats();
      setIsLoading(false);
    };
    initialFetch();
  }, []);

  const handlePageChange = async (tableName: string, newPage: number) => {
    const newPages = { ...tablePages, [tableName]: newPage };
    setTablePages(newPages);
    setLoadingTable(tableName);
    await fetchStats(newPages);
    setLoadingTable(null);
  };

  const handleEdit = (tableName: string, item: any, fields: { key: string; label: string; type: string }[]) => {
    setEditModal({ isOpen: true, tableName, item, fields });
    const formData: Record<string, any> = {};
    fields.forEach(field => {
      formData[field.key] = item[field.key] || '';
    });
    setEditFormData(formData);
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/dashboard/${editModal.tableName}/${editModal.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      toast({
        title: '수정 완료',
        description: '데이터가 성공적으로 수정되었습니다.',
      });

      setEditModal(null);
      await fetchStats();

      // Refresh concert detail if open
      if (concertDetail) {
        await fetchConcertDetail(concertDetail.id);
      }
    } catch (error) {
      toast({
        title: '수정 실패',
        description: '데이터 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/dashboard/${deleteConfirm.tableName}/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast({
        title: '삭제 완료',
        description: '데이터가 성공적으로 삭제되었습니다.',
      });

      setDeleteConfirm(null);
      await fetchStats();

      // Refresh concert detail if open
      if (concertDetail) {
        await fetchConcertDetail(concertDetail.id);
      }
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: '데이터 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleAdd = (tableName: string, fields: { key: string; label: string; type: string }[]) => {
    setAddModal({ isOpen: true, tableName, fields });
    const formData: Record<string, any> = {};
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        formData[field.key] = false;
      } else {
        formData[field.key] = '';
      }
    });
    setAddFormData(formData);
    // Reset report comment search state
    setReportCommentQuery('');
    setReportCommentResults([]);
    setShowReportCommentResults(false);
  };

  const handleSaveAdd = async () => {
    if (!addModal) return;

    setIsAdding(true);
    try {
      const response = await fetch(`/api/dashboard/${addModal.tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to add');
      }

      toast({
        title: '추가 완료',
        description: '데이터가 성공적으로 추가되었습니다.',
      });

      setAddModal(null);
      await fetchStats();
    } catch (error) {
      toast({
        title: '추가 실패',
        description: '데이터 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const fetchSectionDetail = async (type: 'home' | 'search', id: number) => {
    setIsLoadingSectionDetail(true);
    try {
      const response = await fetch(`/api/dashboard/sections/${type}/${id}`);
      const result = await response.json();
      if (result.success) {
        setSectionDetail({
          type,
          section: result.data.section,
          concerts: result.data.concerts,
        });
      } else {
        toast({
          title: '오류',
          description: '섹션 상세 정보를 불러올 수 없습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '섹션 상세 정보를 불러올 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSectionDetail(false);
    }
  };

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const extractInstagramUsername = (url: string | null) => {
    if (!url) return null;
    // Extract username from Instagram URL
    const match = url.match(/instagram\.com\/([^/?]+)/);
    return match ? match[1] : null;
  };

  // User Section
  const userTableConfigs = [
    {
      key: 'users',
      name: 'Users',
      icon: '👥',
      columns: ['ID', 'Nickname', 'Email', 'Provider', 'Provider ID', 'Marketing', 'Created', 'Updated', ''],
      editFields: [
        { key: 'nickname', label: 'Nickname', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'marketing_consent', label: 'Marketing Consent', type: 'checkbox' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.nickname || '-'}</td>
          <td className="px-4 py-2 text-livith-white text-sm whitespace-nowrap">{item.email || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.provider}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{item.provider_id || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.marketing_consent ? 'Y' : 'N'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
    {
      key: 'reports',
      name: 'Reports',
      icon: '🚨',
      columns: ['ID', 'Comment ID', 'Content', 'User', 'Reason', 'Created', 'Updated', ''],
      editFields: [
        { key: 'comment_id', label: 'Comment ID', type: 'text' },
        { key: 'comment_content', label: 'Content', type: 'textarea' },
        { key: 'comment_user_id', label: 'User ID', type: 'text' },
        { key: 'report_reason', label: 'Reason', type: 'text' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => item.comment_id && fetchCommentDetail(item.comment_id)}
          >
            {item.comment_id || '-'}
          </td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap max-w-[200px] truncate">{item.comment_content || '-'}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => fetchUserDetail(item.comment_user_id)}
          >
            {item.users?.nickname || item.users?.email || item.comment_user_id}
          </td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.report_reason || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
    {
      key: 'concert_comments',
      name: 'Comments',
      icon: '💬',
      columns: ['ID', 'Concert', 'User', 'Content', 'Created', 'Updated', ''],
      editFields: [
        { key: 'concert_id', label: 'Concert ID', type: 'text' },
        { key: 'user_id', label: 'User ID', type: 'text' },
        { key: 'content', label: 'Content', type: 'textarea' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline max-w-[200px] truncate"
            onClick={() => fetchConcertDetail(item.concert_id)}
          >
            {item.concerts?.title || item.concert_id}
          </td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => fetchUserDetail(item.user_id)}
          >
            {item.users?.nickname || item.users?.email || item.user_id}
          </td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap max-w-[300px] truncate">{item.content || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
  ];

  // Content Section
  const tableConfigs = [
    {
      key: 'concerts',
      name: 'Concerts',
      icon: '🎵',
      columns: ['ID', 'Code', 'Title', 'Artist', 'Status', 'Start', 'End', 'Venue', 'Ticket Site', 'Label', 'Created', ''],
      editFields: [
        { key: 'code', label: 'Code', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'artist', label: 'Artist', type: 'text' },
        { key: 'status', label: 'Status', type: 'select' },
        { key: 'start_date', label: 'Start Date', type: 'text' },
        { key: 'end_date', label: 'End Date', type: 'text' },
        { key: 'venue', label: 'Venue', type: 'text' },
        { key: 'ticket_site', label: 'Ticket Site', type: 'text' },
        { key: 'ticket_url', label: 'Ticket URL', type: 'text' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'introduction', label: 'Introduction', type: 'textarea' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.code || '-'}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => fetchConcertDetail(item.id)}
          >
            {item.title}
          </td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.artist || '-'}</td>
          <td className="px-4 py-2 whitespace-nowrap">
            <span className={`px-2 py-1 rounded text-xs ${
              item.status === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
              item.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{item.start_date}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{item.end_date}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.venue || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.ticket_site || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.label || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
        </>
      ),
    },
    {
      key: 'artists',
      name: 'Artists',
      icon: '🎤',
      columns: ['ID', 'Name', 'Category', 'Debut', 'Keywords', 'Instagram', 'Created', 'Updated', ''],
      editFields: [
        { key: 'artist', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'debut_date', label: 'Debut Year', type: 'text' },
        { key: 'keywords', label: 'Keywords', type: 'text' },
        { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
        { key: 'img_url', label: 'Image URL', type: 'text' },
        { key: 'detail', label: 'Detail', type: 'textarea' },
      ],
      renderRow: (item: any) => {
        const instaUsername = extractInstagramUsername(item.instagram_url);
        return (
          <>
            <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
            <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.artist}</td>
            <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.category || '-'}</td>
            <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.debut_date || '-'}</td>
            <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.keywords || '-'}</td>
            <td className="px-4 py-2 text-sm whitespace-nowrap">
              {instaUsername ? (
                <a
                  href={item.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-livith-yellow-60 hover:underline"
                >
                  @{instaUsername}
                </a>
              ) : (
                <span className="text-livith-black-30">-</span>
              )}
            </td>
            <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
            <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
          </>
        );
      },
    },
    {
      key: 'songs',
      name: 'Songs',
      icon: '🎶',
      columns: ['ID', 'Title', 'Artist', 'YouTube', 'Lyrics', 'Created', 'Updated', ''],
      editFields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'artist', label: 'Artist', type: 'text' },
        { key: 'youtube_id', label: 'YouTube ID', type: 'text' },
        { key: 'img_url', label: 'Image URL', type: 'text' },
        { key: 'lyrics', label: 'Lyrics', type: 'textarea' },
        { key: 'pronunciation', label: 'Pronunciation', type: 'textarea' },
        { key: 'translation', label: 'Translation', type: 'textarea' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.title}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.artist}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.youtube_id || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.lyrics ? '있음' : '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
    {
      key: 'setlists',
      name: 'Setlists',
      icon: '📝',
      columns: ['ID', 'Title', 'Artist', 'Start', 'End', 'Venue', 'Created', 'Updated', ''],
      editFields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'artist', label: 'Artist', type: 'text' },
        { key: 'start_date', label: 'Start Date', type: 'text' },
        { key: 'end_date', label: 'End Date', type: 'text' },
        { key: 'venue', label: 'Venue', type: 'text' },
        { key: 'img_url', label: 'Image URL', type: 'text' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.title}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.artist || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{item.start_date}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{item.end_date}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.venue || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
  ];

  // Overview Section (Banners, Home Sections, Search Sections)
  const overviewTableConfigs = [
    {
      key: 'banners',
      name: 'Banners',
      icon: '🖼️',
      columns: ['ID', 'Title', 'Category', 'Content', 'Image', 'Created', 'Updated', ''],
      editFields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'content', label: 'Content', type: 'text' },
        { key: 'img_url', label: 'Image URL', type: 'text' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.title || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.category || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.content || '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.img_url ? '있음' : '-'}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.created_at)}</td>
          <td className="px-4 py-2 text-livith-black-30 text-sm whitespace-nowrap">{formatDate(item.updated_at)}</td>
        </>
      ),
    },
    {
      key: 'home_sections',
      name: 'Home Sections',
      icon: '🏠',
      columns: ['ID', 'Section Title', 'Type', ''],
      editFields: [
        { key: 'section_title', label: 'Section Title', type: 'text' },
        { key: 'section_type', label: 'Type', type: 'text' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => fetchSectionDetail('home', item.id)}
          >
            {item.section_title || '-'}
          </td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.section_type || '-'}</td>
        </>
      ),
    },
    {
      key: 'search_sections',
      name: 'Search Sections',
      icon: '🔍',
      columns: ['ID', 'Section Title', 'Type', ''],
      editFields: [
        { key: 'section_title', label: 'Section Title', type: 'text' },
        { key: 'section_type', label: 'Type', type: 'text' },
      ],
      renderRow: (item: any) => (
        <>
          <td className="px-4 py-2 text-livith-white whitespace-nowrap">{item.id}</td>
          <td
            className="px-4 py-2 text-livith-yellow-60 whitespace-nowrap cursor-pointer hover:underline"
            onClick={() => fetchSectionDetail('search', item.id)}
          >
            {item.section_title || '-'}
          </td>
          <td className="px-4 py-2 text-livith-black-30 whitespace-nowrap">{item.section_type || '-'}</td>
        </>
      ),
    },
  ];

  return (
    <div className="h-full">
      <div className="h-full flex flex-col bg-livith-black-100">
        <div className="bg-livith-black-90 px-8 py-4 border-b border-livith-black-80">
          <h1 className="text-2xl font-bold text-livith-white">Dashboard</h1>
          <p className="text-livith-black-50 text-sm mt-1">Overview of your database</p>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <div className="w-full overflow-hidden">
            {/* Recently Updated Concerts */}
            {!isLoading && data?.recentlyUpdatedConcerts && data.recentlyUpdatedConcerts.length > 0 && (
              <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-livith-white">🔥 최근 업데이트된 콘서트</h3>
                  <button
                    onClick={handleSyncSections}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-livith-yellow-60 text-livith-black-100 text-sm font-medium rounded hover:bg-livith-yellow-30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSyncing ? '동기화 중...' : 'DB로 업데이트'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {data.recentlyUpdatedConcerts.map((concert) => (
                    <div
                      key={concert.id}
                      className="bg-livith-black-90 rounded-lg border border-livith-black-50 p-4 hover:border-livith-yellow-60 transition-colors cursor-pointer"
                      onClick={() => fetchConcertDetail(concert.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          concert.status === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
                          concert.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {concert.status}
                        </span>
                        <span className="text-livith-black-30 text-xs">#{concert.id}</span>
                      </div>
                      <h4 className="text-livith-white font-medium text-sm mb-1 line-clamp-2">{concert.title}</h4>
                      <p className="text-livith-black-30 text-xs mb-2">{concert.artist || '-'}</p>
                      <div className="text-livith-black-30 text-xs space-y-1">
                        <p>📅 {concert.start_date} ~ {concert.end_date}</p>
                        {concert.venue && <p>📍 {concert.venue}</p>}
                      </div>
                      <div className="mt-3 pt-3 border-t border-livith-black-50">
                        <p className="text-livith-yellow-60 text-xs">
                          Updated: {new Date(concert.updated_at).toLocaleString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4 animate-pulse">
                    <div className="h-4 bg-livith-black-60 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-livith-black-60 rounded w-12"></div>
                  </div>
                ))
              ) : data?.stats ? (
                <>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">👥 Users</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.users.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">🎵 Concerts</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.concerts.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">🎤 Artists</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.artists.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">🎶 Songs</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.songs.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">📝 Setlists</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.setlists.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">🖼️ Banners</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.banners.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">🛍️ MD</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.md.count}</p>
                  </div>
                  <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-4">
                    <p className="text-livith-black-30 text-xs mb-1">📅 Schedules</p>
                    <p className="text-livith-yellow-60 text-2xl font-bold">{data.stats.schedules.count}</p>
                  </div>
                </>
              ) : (
                <div className="col-span-4 text-center text-livith-black-30 py-8">
                  데이터를 불러올 수 없습니다.
                </div>
              )}
            </div>

            {/* User Section */}
            {!isLoading && data?.stats && (
              <div className="space-y-4 w-full overflow-hidden mb-6">
                <h3 className="text-lg font-semibold text-livith-white">👥 User Section</h3>
                {userTableConfigs.map(config => {
                  const tableData = data.stats[config.key as keyof DashboardStats];
                  const isExpanded = expandedTables.has(config.key);
                  const hasRecent = tableData.recent && tableData.recent.length > 0;

                  return (
                    <div key={config.key} className="bg-livith-black-80 rounded-lg border border-livith-black-50 overflow-hidden max-w-full">
                      <button
                        onClick={() => toggleTable(config.key)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-livith-black-70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{config.icon}</span>
                          <span className="text-livith-white font-semibold">{config.name}</span>
                          <span className="bg-livith-yellow-60/20 text-livith-yellow-60 px-2 py-0.5 rounded text-sm">
                            {tableData.count}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(config.key, config.editFields);
                            }}
                            className="w-5 h-5 bg-livith-yellow-60 text-livith-black-100 text-sm font-bold rounded hover:bg-livith-yellow-30 flex items-center justify-center leading-none"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-livith-black-30 text-lg">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {isExpanded && hasRecent && (
                        <div className="border-t border-livith-black-50">
                          <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] relative">
                            {loadingTable === config.key && (
                              <div className="absolute inset-0 bg-livith-black-80/80 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-livith-yellow-60"></div>
                              </div>
                            )}
                            <table className="w-full min-w-max">
                              <thead className="bg-livith-black-90 sticky top-0">
                                <tr>
                                  {config.columns.map(col => (
                                    <th key={col} className="px-4 py-3 text-left text-livith-black-30 text-sm font-medium whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-livith-black-50">
                                {tableData.recent!.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-livith-black-70">
                                    {config.renderRow(item)}
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <button
                                        onClick={() => handleEdit(config.key, item, config.editFields)}
                                        className="text-sm text-livith-black-50 hover:text-livith-black-30 leading-none"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({
                                          tableName: config.key,
                                          id: item.id,
                                          title: item.title || item.artist || item.nickname || `ID: ${item.id}`
                                        })}
                                        className="text-sm text-red-500/50 hover:text-red-500 leading-none ml-3"
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-6 py-3 bg-livith-black-90 border-t border-livith-black-50 flex items-center justify-between">
                            <span className="text-livith-black-30 text-sm">
                              {tableData.count}개 중 {((tablePages[config.key] - 1) * PAGE_SIZE) + 1}-{Math.min(tablePages[config.key] * PAGE_SIZE, tableData.count)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] - 1)}
                                disabled={tablePages[config.key] <= 1 || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ← 이전
                              </button>
                              <span className="text-livith-black-30 text-sm px-2">
                                {tablePages[config.key]} / {Math.ceil(tableData.count / PAGE_SIZE)}
                              </span>
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] + 1)}
                                disabled={tablePages[config.key] >= Math.ceil(tableData.count / PAGE_SIZE) || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                다음 →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isExpanded && !hasRecent && (
                        <div className="border-t border-livith-black-50 px-6 py-8 text-center text-livith-black-30">
                          데이터가 없습니다.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overview Section */}
            {!isLoading && data?.stats && (
              <div className="space-y-4 w-full overflow-hidden mb-6">
                <h3 className="text-lg font-semibold text-livith-white">📊 Overview Section</h3>
                {overviewTableConfigs.map(config => {
                  const tableData = data.stats[config.key as keyof DashboardStats];
                  const isExpanded = expandedTables.has(config.key);
                  const hasRecent = tableData.recent && tableData.recent.length > 0;

                  return (
                    <div key={config.key} className="bg-livith-black-80 rounded-lg border border-livith-black-50 overflow-hidden max-w-full">
                      <button
                        onClick={() => toggleTable(config.key)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-livith-black-70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{config.icon}</span>
                          <span className="text-livith-white font-semibold">{config.name}</span>
                          <span className="bg-livith-yellow-60/20 text-livith-yellow-60 px-2 py-0.5 rounded text-sm">
                            {tableData.count}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(config.key, config.editFields);
                            }}
                            className="w-5 h-5 bg-livith-yellow-60 text-livith-black-100 text-sm font-bold rounded hover:bg-livith-yellow-30 flex items-center justify-center leading-none"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-livith-black-30 text-lg">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {isExpanded && hasRecent && (
                        <div className="border-t border-livith-black-50">
                          <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] relative">
                            {loadingTable === config.key && (
                              <div className="absolute inset-0 bg-livith-black-80/80 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-livith-yellow-60"></div>
                              </div>
                            )}
                            <table className="w-full min-w-max">
                              <thead className="bg-livith-black-90 sticky top-0">
                                <tr>
                                  {config.columns.map(col => (
                                    <th key={col} className="px-4 py-3 text-left text-livith-black-30 text-sm font-medium whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-livith-black-50">
                                {tableData.recent!.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-livith-black-70">
                                    {config.renderRow(item)}
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <button
                                        onClick={() => handleEdit(config.key, item, config.editFields)}
                                        className="text-sm text-livith-black-50 hover:text-livith-black-30 leading-none"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({
                                          tableName: config.key,
                                          id: item.id,
                                          title: item.title || item.section_title || `ID: ${item.id}`
                                        })}
                                        className="text-sm text-red-500/50 hover:text-red-500 leading-none ml-3"
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-6 py-3 bg-livith-black-90 border-t border-livith-black-50 flex items-center justify-between">
                            <span className="text-livith-black-30 text-sm">
                              {tableData.count}개 중 {((tablePages[config.key] - 1) * PAGE_SIZE) + 1}-{Math.min(tablePages[config.key] * PAGE_SIZE, tableData.count)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] - 1)}
                                disabled={tablePages[config.key] <= 1 || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ← 이전
                              </button>
                              <span className="text-livith-black-30 text-sm px-2">
                                {tablePages[config.key]} / {Math.ceil(tableData.count / PAGE_SIZE)}
                              </span>
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] + 1)}
                                disabled={tablePages[config.key] >= Math.ceil(tableData.count / PAGE_SIZE) || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                다음 →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isExpanded && !hasRecent && (
                        <div className="border-t border-livith-black-50 px-6 py-8 text-center text-livith-black-30">
                          데이터가 없습니다.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Content Section */}
            {!isLoading && data?.stats && (
              <div className="space-y-4 w-full overflow-hidden">
                <h3 className="text-lg font-semibold text-livith-white">🎵 Content Section</h3>
                {tableConfigs.map(config => {
                  const tableData = data.stats[config.key as keyof DashboardStats];
                  const isExpanded = expandedTables.has(config.key);
                  const hasRecent = tableData.recent && tableData.recent.length > 0;

                  return (
                    <div key={config.key} className="bg-livith-black-80 rounded-lg border border-livith-black-50 overflow-hidden max-w-full">
                      <button
                        onClick={() => toggleTable(config.key)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-livith-black-70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{config.icon}</span>
                          <span className="text-livith-white font-semibold">{config.name}</span>
                          <span className="bg-livith-yellow-60/20 text-livith-yellow-60 px-2 py-0.5 rounded text-sm">
                            {tableData.count}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdd(config.key, config.editFields);
                            }}
                            className="w-5 h-5 bg-livith-yellow-60 text-livith-black-100 text-sm font-bold rounded hover:bg-livith-yellow-30 flex items-center justify-center leading-none"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-livith-black-30 text-lg">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {isExpanded && hasRecent && (
                        <div className="border-t border-livith-black-50">
                          <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] relative">
                            {loadingTable === config.key && (
                              <div className="absolute inset-0 bg-livith-black-80/80 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-livith-yellow-60"></div>
                              </div>
                            )}
                            <table className="w-full min-w-max">
                              <thead className="bg-livith-black-90 sticky top-0">
                                <tr>
                                  {config.columns.map(col => (
                                    <th key={col} className="px-4 py-3 text-left text-livith-black-30 text-sm font-medium whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-livith-black-50">
                                {tableData.recent!.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-livith-black-70">
                                    {config.renderRow(item)}
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <button
                                        onClick={() => handleEdit(config.key, item, config.editFields)}
                                        className="text-sm text-livith-black-50 hover:text-livith-black-30 leading-none"
                                      >
                                        수정
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({
                                          tableName: config.key,
                                          id: item.id,
                                          title: item.title || item.artist || item.nickname || `ID: ${item.id}`
                                        })}
                                        className="text-sm text-red-500/50 hover:text-red-500 leading-none ml-3"
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="px-6 py-3 bg-livith-black-90 border-t border-livith-black-50 flex items-center justify-between">
                            <span className="text-livith-black-30 text-sm">
                              {tableData.count}개 중 {((tablePages[config.key] - 1) * PAGE_SIZE) + 1}-{Math.min(tablePages[config.key] * PAGE_SIZE, tableData.count)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] - 1)}
                                disabled={tablePages[config.key] <= 1 || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ← 이전
                              </button>
                              <span className="text-livith-black-30 text-sm px-2">
                                {tablePages[config.key]} / {Math.ceil(tableData.count / PAGE_SIZE)}
                              </span>
                              <button
                                onClick={() => handlePageChange(config.key, tablePages[config.key] + 1)}
                                disabled={tablePages[config.key] >= Math.ceil(tableData.count / PAGE_SIZE) || loadingTable === config.key}
                                className="px-3 py-1 text-sm bg-livith-black-70 text-livith-white rounded hover:bg-livith-black-60 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                다음 →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isExpanded && !hasRecent && (
                        <div className="border-t border-livith-black-50 px-6 py-8 text-center text-livith-black-30">
                          데이터가 없습니다.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50">
              <h3 className="text-lg font-semibold text-livith-white">
                {editModal.tableName.charAt(0).toUpperCase() + editModal.tableName.slice(1)} 수정
              </h3>
              <p className="text-livith-black-30 text-sm">ID: {editModal.item.id}</p>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {editModal.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-livith-black-30 text-sm mb-2">
                    {field.label}
                  </label>
                  {field.type === 'select' && field.key === 'status' ? (
                    <select
                      value={editFormData[field.key] || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    >
                      <option value="ONGOING">ONGOING</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={editFormData[field.key] || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60 resize-y"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData[field.key] || false}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-livith-black-50 bg-livith-black-90 text-livith-yellow-60 focus:ring-livith-yellow-60"
                      />
                      <span className="text-livith-white text-sm">활성화</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={editFormData[field.key] || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end gap-3">
              <Button
                onClick={() => setEditModal(null)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50">
              <h3 className="text-lg font-semibold text-livith-white">삭제 확인</h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-livith-white mb-2">정말 삭제하시겠습니까?</p>
              <p className="text-livith-black-30 text-sm">
                {deleteConfirm.title}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end gap-3">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                취소
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50">
              <h3 className="text-lg font-semibold text-livith-white">
                {addModal.tableName.charAt(0).toUpperCase() + addModal.tableName.slice(1)} 추가
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Comment search for reports */}
              {addModal.tableName === 'reports' && (
                <div className="relative">
                  <label className="block text-livith-black-30 text-sm mb-2">
                    댓글 검색
                  </label>
                  <input
                    type="text"
                    value={reportCommentQuery}
                    onChange={(e) => setReportCommentQuery(e.target.value)}
                    placeholder="댓글 내용, 사용자, ID로 검색..."
                    className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                  />
                  {showReportCommentResults && reportCommentResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-livith-black-90 border border-livith-black-50 rounded-lg max-h-48 overflow-auto shadow-lg">
                      {reportCommentResults.map((comment) => (
                        <button
                          key={comment.id}
                          onClick={() => handleSelectCommentForReport(comment)}
                          className="w-full px-4 py-2 text-left hover:bg-livith-black-60 border-b border-livith-black-50 last:border-b-0"
                        >
                          <p className="text-livith-white text-sm truncate">{comment.content}</p>
                          <p className="text-livith-black-30 text-xs">
                            ID: {comment.id} | {comment.users?.nickname || comment.users?.email || `User ${comment.user_id}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  {addFormData.comment_id && (
                    <div className="mt-2 p-2 bg-livith-black-70 rounded border border-livith-black-50">
                      <p className="text-livith-yellow-60 text-xs mb-1">선택된 댓글:</p>
                      <p className="text-livith-white text-sm truncate">{addFormData.comment_content}</p>
                      <p className="text-livith-black-30 text-xs">
                        Comment ID: {addFormData.comment_id} | User ID: {addFormData.comment_user_id}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {addModal.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-livith-black-30 text-sm mb-2">
                    {field.label}
                  </label>
                  {field.type === 'select' && field.key === 'status' ? (
                    <select
                      value={addFormData[field.key] || ''}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    >
                      <option value="">선택하세요</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={addFormData[field.key] || ''}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60 resize-y"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addFormData[field.key] || false}
                        onChange={(e) => setAddFormData(prev => ({ ...prev, [field.key]: e.target.checked }))}
                        className="w-4 h-4 rounded border-livith-black-50 bg-livith-black-90 text-livith-yellow-60 focus:ring-livith-yellow-60"
                      />
                      <span className="text-livith-white text-sm">활성화</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      value={addFormData[field.key] || ''}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-livith-black-90 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end gap-3">
              <Button
                onClick={() => setAddModal(null)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveAdd}
                disabled={isAdding}
                className="bg-livith-yellow-60 text-livith-black-100 hover:bg-livith-yellow-30"
              >
                {isAdding ? '추가 중...' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {userDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-livith-white">👤 사용자 정보</h3>
              <button
                onClick={() => setUserDetail(null)}
                className="text-livith-black-30 hover:text-livith-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-livith-black-30 text-sm">ID:</span>
                <span className="text-livith-white ml-2">{userDetail.id}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">닉네임:</span>
                <span className="text-livith-white ml-2">{userDetail.nickname || '-'}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">이메일:</span>
                <span className="text-livith-white ml-2">{userDetail.email || '-'}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">Provider:</span>
                <span className="text-livith-white ml-2">{userDetail.provider}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">마케팅 동의:</span>
                <span className="text-livith-white ml-2">{userDetail.marketing_consent ? 'Y' : 'N'}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">가입일:</span>
                <span className="text-livith-white ml-2">{new Date(userDetail.created_at).toLocaleString('ko-KR')}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end">
              <Button
                onClick={() => setUserDetail(null)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Modal */}
      {commentDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-livith-black-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-livith-white">💬 댓글 정보</h3>
              <button
                onClick={() => setCommentDetail(null)}
                className="text-livith-black-30 hover:text-livith-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <span className="text-livith-black-30 text-sm">ID:</span>
                <span className="text-livith-white ml-2">{commentDetail.id}</span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">Concert ID:</span>
                <span
                  className="text-livith-yellow-60 ml-2 cursor-pointer hover:underline"
                  onClick={() => {
                    setCommentDetail(null);
                    fetchConcertDetail(commentDetail.concert_id);
                  }}
                >
                  {commentDetail.concert_id}
                </span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">User ID:</span>
                <span
                  className="text-livith-yellow-60 ml-2 cursor-pointer hover:underline"
                  onClick={() => {
                    setCommentDetail(null);
                    fetchUserDetail(commentDetail.user_id);
                  }}
                >
                  {commentDetail.user_id}
                </span>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">내용:</span>
                <p className="text-livith-white mt-1">{commentDetail.content || '-'}</p>
              </div>
              <div>
                <span className="text-livith-black-30 text-sm">작성일:</span>
                <span className="text-livith-white ml-2">{new Date(commentDetail.created_at).toLocaleString('ko-KR')}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end">
              <Button
                onClick={() => setCommentDetail(null)}
                variant="outline"
                className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section Detail Modal */}
      {(sectionDetail || isLoadingSectionDetail) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {isLoadingSectionDetail ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-livith-yellow-60"></div>
              </div>
            ) : sectionDetail && (
              <>
                <div className="px-6 py-4 border-b border-livith-black-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-livith-white">
                      {sectionDetail.type === 'home' ? '🏠' : '🔍'} {sectionDetail.section.section_title || 'Section'}
                    </h3>
                    <p className="text-livith-black-30 text-sm">
                      {sectionDetail.type === 'home' ? 'Home Section' : 'Search Section'} | {sectionDetail.section.section_type || '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSectionDetail(null)}
                    className="text-livith-black-30 hover:text-livith-white text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Add Concert Search */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">콘서트 추가</h4>
                    <div className="relative">
                      <input
                        type="text"
                        value={sectionConcertQuery}
                        onChange={(e) => setSectionConcertQuery(e.target.value)}
                        placeholder="콘서트 제목 또는 아티스트로 검색..."
                        className="w-full px-4 py-2 bg-livith-black-70 border border-livith-black-50 rounded text-livith-white focus:outline-none focus:border-livith-yellow-60"
                      />
                      {showSectionConcertResults && sectionConcertResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-livith-black-70 border border-livith-black-50 rounded-lg max-h-48 overflow-auto">
                          {sectionConcertResults.map((concert) => (
                            <button
                              key={concert.id}
                              onClick={() => handleAddConcertToSection(concert.id)}
                              className="w-full px-4 py-2 text-left hover:bg-livith-black-60 border-b border-livith-black-50 last:border-b-0"
                            >
                              <p className="text-livith-white text-sm">{concert.title}</p>
                              <p className="text-livith-black-30 text-xs">
                                {concert.artist} | {concert.start_date}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Concert List */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">
                      포함된 콘서트 ({sectionDetail.concerts.length})
                    </h4>
                    {sectionDetail.concerts.length > 0 ? (
                      <div className="space-y-3">
                        {sectionDetail.concerts.map((concert, index) => (
                          <div
                            key={concert.section_concert_id}
                            className="flex items-center justify-between p-3 bg-livith-black-70 rounded"
                          >
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80"
                              onClick={() => {
                                setSectionDetail(null);
                                fetchConcertDetail(concert.id);
                              }}
                            >
                              <span className="text-livith-black-30 text-sm w-6">
                                {concert.sorted_index !== undefined ? concert.sorted_index + 1 : index + 1}.
                              </span>
                              <div>
                                <p className="text-livith-white font-medium">{concert.title}</p>
                                <p className="text-livith-black-30 text-sm">
                                  {concert.artist || '-'} | {concert.start_date} ~ {concert.end_date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                concert.status === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
                                concert.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {concert.status}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveConcertFromSection(concert.section_concert_id);
                                }}
                                className="text-red-500/50 hover:text-red-500 text-sm ml-2"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm text-center py-4">
                        이 섹션에 포함된 콘서트가 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end">
                  <Button
                    onClick={() => setSectionDetail(null)}
                    variant="outline"
                    className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
                  >
                    닫기
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Concert Detail Modal */}
      {(concertDetail || isLoadingDetail) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {isLoadingDetail ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-livith-yellow-60"></div>
              </div>
            ) : concertDetail && (
              <>
                <div className="px-6 py-4 border-b border-livith-black-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-livith-white">{concertDetail.title}</h3>
                    <p className="text-livith-black-30 text-sm">{concertDetail.artist || '-'} | {concertDetail.venue || '-'}</p>
                  </div>
                  <button
                    onClick={() => setConcertDetail(null)}
                    className="text-livith-black-30 hover:text-livith-white text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">기본 정보</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-livith-black-30">ID:</span>
                        <span className="text-livith-white ml-2">{concertDetail.id}</span>
                      </div>
                      <div>
                        <span className="text-livith-black-30">Code:</span>
                        <span className="text-livith-white ml-2">{concertDetail.code || '-'}</span>
                      </div>
                      <div>
                        <span className="text-livith-black-30">Status:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          concertDetail.status === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
                          concertDetail.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {concertDetail.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-livith-black-30">기간:</span>
                        <span className="text-livith-white ml-2">{concertDetail.start_date} ~ {concertDetail.end_date}</span>
                      </div>
                      <div>
                        <span className="text-livith-black-30">Label:</span>
                        <span className="text-livith-white ml-2">{concertDetail.label || '-'}</span>
                      </div>
                      <div>
                        <span className="text-livith-black-30">Ticket:</span>
                        <span className="text-livith-white ml-2">{concertDetail.ticket_site || '-'}</span>
                      </div>
                    </div>
                    {concertDetail.introduction && (
                      <div className="mt-3 pt-3 border-t border-livith-black-50">
                        <span className="text-livith-black-30 text-sm">소개:</span>
                        <p className="text-livith-white text-sm mt-1">{concertDetail.introduction}</p>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">장르 ({concertDetail.concert_genres.length})</h4>
                    {concertDetail.concert_genres.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {concertDetail.concert_genres.map(cg => (
                          <span key={cg.id} className="px-3 py-1 bg-livith-black-70 rounded text-livith-white text-sm inline-flex items-center gap-2">
                            {cg.genres.name}
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  tableName: 'concert_genres',
                                  id: cg.id,
                                  title: cg.genres.name
                                });
                              }}
                              className="text-red-500/50 hover:text-red-500 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 장르가 없습니다.</p>
                    )}
                  </div>

                  {/* Setlists */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">셋리스트 ({concertDetail.concert_setlists.length})</h4>
                    {concertDetail.concert_setlists.length > 0 ? (
                      <div className="space-y-2">
                        {concertDetail.concert_setlists.map(cs => (
                          <div key={cs.id} className="flex items-center justify-between p-2 bg-livith-black-70 rounded text-sm">
                            <div>
                              <span className="text-livith-white">{cs.setlists.title}</span>
                              <span className="text-livith-black-30 ml-2">({cs.setlists.start_date} ~ {cs.setlists.end_date})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                cs.type === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
                                cs.type === 'EXPECTED' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {cs.type}
                              </span>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'concert_setlists',
                                    id: cs.id,
                                    title: cs.setlists.title
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 셋리스트가 없습니다.</p>
                    )}
                  </div>

                  {/* Schedules */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">스케줄 ({concertDetail.schedule.length})</h4>
                    {concertDetail.schedule.length > 0 ? (
                      <div className="space-y-2">
                        {concertDetail.schedule.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-livith-black-70 rounded text-sm">
                            <div>
                              <span className="text-livith-white">{s.category}</span>
                              {s.type && (
                                <span className="text-livith-black-30 ml-2">({s.type})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-livith-black-30">
                                {new Date(s.scheduled_at).toLocaleString('ko-KR')}
                              </span>
                              <button
                                onClick={() => handleEdit('schedules', { id: s.id, concert_id: concertDetail.id, category: s.category, type: s.type, scheduled_at: s.scheduled_at }, [
                                  { key: 'category', label: 'Category', type: 'text' },
                                  { key: 'type', label: 'Type', type: 'text' },
                                ])}
                                className="text-livith-black-50 hover:text-livith-black-30 text-xs"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'schedules',
                                    id: s.id,
                                    title: s.category
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 스케줄이 없습니다.</p>
                    )}
                  </div>

                  {/* MD */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">MD ({concertDetail.md.length})</h4>
                    {concertDetail.md.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {concertDetail.md.map(m => (
                          <div key={m.id} className="p-3 bg-livith-black-70 rounded">
                            <p className="text-livith-white text-sm font-medium">{m.name}</p>
                            {m.price && (
                              <p className="text-livith-yellow-60 text-sm">{m.price}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEdit('md', { id: m.id, concert_id: concertDetail.id, name: m.name, price: m.price, img_url: m.img_url }, [
                                  { key: 'name', label: 'Name', type: 'text' },
                                  { key: 'price', label: 'Price', type: 'text' },
                                  { key: 'img_url', label: 'Image URL', type: 'text' },
                                ])}
                                className="text-livith-black-50 hover:text-livith-black-30 text-xs"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'md',
                                    id: m.id,
                                    title: m.name
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 MD가 없습니다.</p>
                    )}
                  </div>

                  {/* Cultures */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">문화 정보 ({concertDetail.cultures.length})</h4>
                    {concertDetail.cultures.length > 0 ? (
                      <div className="space-y-3">
                        {concertDetail.cultures.map(c => (
                          <div key={c.id} className="p-3 bg-livith-black-70 rounded">
                            <p className="text-livith-white text-sm font-medium mb-1">{c.title}</p>
                            <p className="text-livith-black-30 text-sm line-clamp-2">{c.content}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleEdit('cultures', { id: c.id, concert_id: concertDetail.id, title: c.title, content: c.content, img_url: c.img_url }, [
                                  { key: 'title', label: 'Title', type: 'text' },
                                  { key: 'content', label: 'Content', type: 'textarea' },
                                  { key: 'img_url', label: 'Image URL', type: 'text' },
                                ])}
                                className="text-livith-black-50 hover:text-livith-black-30 text-xs"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'cultures',
                                    id: c.id,
                                    title: c.title
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 문화 정보가 없습니다.</p>
                    )}
                  </div>

                  {/* Concert Info */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">콘서트 정보 ({concertDetail.concert_info.length})</h4>
                    {concertDetail.concert_info.length > 0 ? (
                      <div className="space-y-2">
                        {concertDetail.concert_info.map(ci => (
                          <div key={ci.id} className="flex items-center justify-between p-2 bg-livith-black-70 rounded text-sm">
                            <div className="flex items-start gap-3">
                              <span className="text-livith-black-30 shrink-0">{ci.category}:</span>
                              <span className="text-livith-white">{ci.content}</span>
                            </div>
                            <div className="flex gap-2 shrink-0 ml-2">
                              <button
                                onClick={() => handleEdit('concert_info', { id: ci.id, concert_id: concertDetail.id, category: ci.category, content: ci.content, img_url: ci.img_url }, [
                                  { key: 'category', label: 'Category', type: 'text' },
                                  { key: 'content', label: 'Content', type: 'text' },
                                  { key: 'img_url', label: 'Image URL', type: 'text' },
                                ])}
                                className="text-livith-black-50 hover:text-livith-black-30 text-xs"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'concert_info',
                                    id: ci.id,
                                    title: ci.category
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 콘서트 정보가 없습니다.</p>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="bg-livith-black-90 rounded-lg p-4">
                    <h4 className="text-livith-yellow-60 font-semibold mb-3">코멘트 ({concertDetail.concert_comments.length})</h4>
                    {concertDetail.concert_comments.length > 0 ? (
                      <div className="space-y-3">
                        {concertDetail.concert_comments.map(comment => (
                          <div key={comment.id} className="p-3 bg-livith-black-70 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-livith-white text-sm font-medium">
                                {comment.users.nickname || comment.users.email || `User #${comment.users.id}`}
                              </span>
                              <span className="text-livith-black-30 text-xs">
                                {new Date(comment.created_at).toLocaleString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-livith-black-30 text-sm">{comment.content}</p>
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    tableName: 'concert_comments',
                                    id: comment.id,
                                    title: comment.content.substring(0, 30) + '...'
                                  });
                                }}
                                className="text-red-500/50 hover:text-red-500 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-livith-black-30 text-sm">등록된 코멘트가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-livith-black-50 flex justify-end">
                  <Button
                    onClick={() => setConcertDetail(null)}
                    variant="outline"
                    className="bg-livith-black-70 border-livith-black-50 text-livith-white hover:bg-livith-black-60"
                  >
                    닫기
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
