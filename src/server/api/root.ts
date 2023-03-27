import { createTRPCRouter } from "~/server/api/trpc";
import { resaurantRouter } from "~/server/api/routers/restaurant";
import { reviewRouter } from "./routers/review";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  resaurant: resaurantRouter,
  review: reviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
