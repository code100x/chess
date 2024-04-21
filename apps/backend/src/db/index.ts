//why are we exporting prisma from the generated prisma client? when we are supposed to import it from the @repo/db/client. but if we're doing it it's throwing error Just need to fix the tsconfig.json folder to make it work
import prisma from '@repo/db/client';

export const db = prisma;
