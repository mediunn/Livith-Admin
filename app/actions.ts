'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * 테이블 데이터 조회
 * @param table - Prisma 모델명 (예: 'artists', 'concerts', 'songs')
 * @param options - 조회 옵션 (where, orderBy, take, skip 등)
 */
export async function getData(
  table: string,
  options?: {
    where?: any;
    orderBy?: any;
    take?: number;
    skip?: number;
    include?: any;
  }
) {
  try {
    const model = (prisma as any)[table];
    if (!model) {
      return { success: false, error: `테이블 '${table}'을 찾을 수 없습니다.` };
    }

    const data = await model.findMany(options);
    return { success: true, data };
  } catch (error) {
    console.error('getData 오류:', error);
    return { success: false, error: '데이터 조회 중 오류가 발생했습니다.' };
  }
}

/**
 * 새 레코드 추가
 * @param table - Prisma 모델명
 * @param data - 생성할 데이터
 */
export async function createData(table: string, data: any) {
  try {
    const model = (prisma as any)[table];
    if (!model) {
      return { success: false, error: `테이블 '${table}'을 찾을 수 없습니다.` };
    }

    // updated_at 자동 추가
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date(),
    };

    const newRecord = await model.create({ data: dataWithTimestamp });
    revalidatePath('/');

    return { success: true, data: newRecord };
  } catch (error) {
    console.error('createData 오류:', error);
    return { success: false, error: '데이터 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * 레코드 수정
 * @param table - Prisma 모델명
 * @param id - 수정할 레코드 ID
 * @param data - 수정할 데이터
 */
export async function updateData(table: string, id: number, data: any) {
  try {
    const model = (prisma as any)[table];
    if (!model) {
      return { success: false, error: `테이블 '${table}'을 찾을 수 없습니다.` };
    }

    // updated_at 자동 추가
    const dataWithTimestamp = {
      ...data,
      updated_at: new Date(),
    };

    const updatedRecord = await model.update({
      where: { id },
      data: dataWithTimestamp,
    });
    revalidatePath('/');

    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error('updateData 오류:', error);
    return { success: false, error: '데이터 수정 중 오류가 발생했습니다.' };
  }
}

/**
 * 레코드 삭제
 * @param table - Prisma 모델명
 * @param id - 삭제할 레코드 ID
 */
export async function deleteData(table: string, id: number) {
  try {
    const model = (prisma as any)[table];
    if (!model) {
      return { success: false, error: `테이블 '${table}'을 찾을 수 없습니다.` };
    }

    await model.delete({
      where: { id },
    });
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('deleteData 오류:', error);
    return { success: false, error: '데이터 삭제 중 오류가 발생했습니다.' };
  }
}

/**
 * 여러 레코드를 일괄 생성
 * @param table - Prisma 모델명
 * @param dataArray - 생성할 데이터 배열
 */
export async function bulkCreateData(table: string, dataArray: any[]) {
  try {
    const model = (prisma as any)[table];
    if (!model) {
      return { success: false, error: `테이블 '${table}'을 찾을 수 없습니다.` };
    }

    const results = [];
    for (const data of dataArray) {
      const newRecord = await model.create({ data });
      results.push(newRecord);
    }

    revalidatePath('/');
    return { success: true, data: results };
  } catch (error) {
    console.error('bulkCreateData 오류:', error);
    return { success: false, error: '일괄 생성 중 오류가 발생했습니다.' };
  }
}
