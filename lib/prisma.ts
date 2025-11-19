/**
 * Prisma Client Singleton
 *
 * Next.js의 Hot Reload로 인한 다중 Prisma Client 인스턴스 생성을 방지합니다.
 * 개발 환경에서는 global 객체에 저장하여 재사용하고,
 * 프로덕션 환경에서는 매번 새 인스턴스를 생성합니다.
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient를 global 객체에 저장하기 위한 타입 확장
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client 인스턴스 생성 또는 재사용
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 개발 환경에서만 global 객체에 저장
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 기본 export
export default prisma;
