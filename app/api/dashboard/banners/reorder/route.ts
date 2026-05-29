import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 배너 순서 변경: id(기본키)는 고정한 채 두 행의 내용(데이터)을 통째로 맞바꾼다.
// banners 테이블에 순서 전용 컬럼이 없으므로, id 오름차순 슬롯에 데이터를 갈아끼우는 방식.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idA = parseInt(body.idA);
    const idB = parseInt(body.idB);

    if (!idA || !idB || idA === idB) {
      return NextResponse.json(
        { success: false, error: 'idA, idB가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    const [a, b] = await Promise.all([
      prisma.banners.findUnique({ where: { id: idA } }),
      prisma.banners.findUnique({ where: { id: idB } }),
    ]);

    if (!a || !b) {
      return NextResponse.json(
        { success: false, error: '대상 배너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const now = new Date();
    // id, created_at은 슬롯 식별자로 유지하고 내용만 서로 교환
    await prisma.$transaction([
      prisma.banners.update({
        where: { id: a.id },
        data: {
          title: b.title,
          category: b.category,
          content: b.content,
          img_url: b.img_url,
          link_url: b.link_url,
          updated_at: now,
        },
      }),
      prisma.banners.update({
        where: { id: b.id },
        data: {
          title: a.title,
          category: a.category,
          content: a.content,
          img_url: a.img_url,
          link_url: a.link_url,
          updated_at: now,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Banner reorder error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reorder banners';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
