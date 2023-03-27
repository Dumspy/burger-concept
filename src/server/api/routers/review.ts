import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const reviewRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        restuantId: z.string(),
        burgerName: z.string().min(3).max(50),
        tasteRating: z.number().min(0).max(4),
        textureRating: z.number().min(0).max(4),
        presentationRating: z.number().min(0).max(4),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.create({
        data: {
          burgerName: input.burgerName,
          tasteRating: input.tasteRating,
          textureRating: input.textureRating,
          presentationRating: input.presentationRating,
          restaurant: {
            connect: {
              id: input.restuantId,
            },
          },
        },
      });

      return review;
    }),
  getReviewsByRestaurantId: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.prisma.restaurant.findUnique({
        where: {
          id: input.restaurantId,
        },
      });

      if (!res) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reviews not found',
        });
      }

      const reviews = await ctx.prisma.review.findMany({
        select: {
            burgerName: true,
            tasteRating: true,
            textureRating: true,
            presentationRating: true,
            createdAt: true,
            body: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          restaurantId: input.restaurantId,
        },
        take: 5,
      });

      return reviews;
    }),
});
