import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

interface RestaurantByDistance {
    id: number;
    prettyName: string;
    slug: string;
    latitude: number;
    longitude: number;
    distance: number;
}

export const resaurantRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const res = await ctx.prisma.restaurant.findFirst({
        where: {
          slug: input.slug.toLowerCase(),
        },
      });

      if (!res) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Restaurant not found',
        });
      }

      const reviews = await ctx.prisma.review.aggregate({
        where: {
          restaurantId: res.id,
        },
        _avg: {
          tasteRating: true,
          textureRating: true,
          presentationRating: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        id: res.id,
        name: res.prettyName,
        body: res.body,
        address: res.address,
        image: res.image,
        reviews: {
          count: reviews._count.id,
          average: {
            tasteRating: (reviews._avg.tasteRating ?? 0).toFixed(1),
            textureRating: (reviews._avg.textureRating ?? 0).toFixed(1),
            presentationRating: (reviews._avg.presentationRating ?? 0).toFixed(
              1
            ),
          },
        },
      };
    }),
  getByDistance: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      /** */
      const res = await ctx.prisma
        .$queryRaw<RestaurantByDistance[]>`SELECT id, prettyName, slug, latitude, longitude,
        ( 6371 * acos( cos( radians(${input.lat}) ) *
          cos( radians( latitude ) ) *
          cos( radians( longitude ) - radians(${input.lng}) ) +
          sin( radians(${input.lat}) ) *
          sin( radians( latitude ) ) ) )
        AS distance
        FROM Restaurant
        ORDER BY distance
        LIMIT 10;`

        return res;
    }),
});
