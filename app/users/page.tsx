import { getData } from '@/app/actions';
import { Header } from '@/components/layout/Header';

export default async function UsersPage() {
  const result = await getData('users', {
    orderBy: { created_at: 'desc' },
  });

  const users = result.success ? result.data : [];

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-livith-black-100">
        <div className="bg-livith-black-90 px-8 py-4 border-b border-livith-black-80">
          <h1 className="text-2xl font-bold text-livith-white">Users Management</h1>
          <p className="text-livith-black-50 text-sm mt-1">View and manage user accounts</p>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-livith-black-80 rounded-lg border border-livith-black-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-livith-white">전체 사용자</h3>
                <p className="text-livith-black-50 text-sm">총 {users.length}명의 사용자</p>
              </div>
              <div className="bg-livith-yellow-60 text-livith-black-100 px-3 py-1 rounded-full text-sm font-medium">
                {users.length} users
              </div>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 text-livith-black-30">
                등록된 사용자가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-livith-black-50">
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">닉네임</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">이메일</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">제공자</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">관심 콘서트</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">마케팅 동의</th>
                      <th className="text-left py-3 px-4 text-livith-black-30 text-sm font-medium">가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b border-livith-black-50 hover:bg-livith-black-90 transition-colors">
                        <td className="py-3 px-4 text-livith-white text-sm">{user.id}</td>
                        <td className="py-3 px-4 text-livith-white text-sm">
                          {user.nickname || '-'}
                        </td>
                        <td className="py-3 px-4 text-livith-white text-sm">
                          {user.email || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.provider === 'kakao'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.provider || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-livith-white text-sm">
                          {user.interest_concert_id || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {user.marketing_consent ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                              동의
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                              미동의
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-livith-black-30 text-sm">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
