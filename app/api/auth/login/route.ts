import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 환경 변수에서 관리자 비밀번호 가져오기
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: '서버 설정 오류: ADMIN_PASSWORD가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 비밀번호 확인
    if (password === adminPassword) {
      // 로그인 성공 - 쿠키 설정
      const cookieStore = await cookies();
      cookieStore.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: false, // HTTP 환경에서도 작동하도록
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      // 비밀번호 불일치
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
