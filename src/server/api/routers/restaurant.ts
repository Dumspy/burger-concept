import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const resaurantRouter = createTRPCRouter({
    getBySlug: publicProcedure.input(z.object({
        slug: z.string(),
    })).query(async ({ input, ctx }) => {
        const res = await ctx.prisma.restaurant.findFirst({
            where: {
                name: input.slug.toLowerCase(),
            },
        });

        if (!res) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Restaurant not found",
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
            name: res.name.charAt(0).toUpperCase() + res.name.slice(1).toLowerCase(),
            body: res.body,
            address: res.address,
            image: res.image,
            reviews: {
                count: reviews._count.id,
                average: {
                    tasteRating: (reviews._avg.tasteRating ?? 0).toFixed(1),
                    textureRating: (reviews._avg.textureRating ?? 0).toFixed(1),
                    presentationRating: (reviews._avg.presentationRating ?? 0).toFixed(1),
                },
            },
        };
    })
});