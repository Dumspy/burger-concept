import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { generateSSGHelper } from '~/server/helpers/ssgHelper';
import { api } from '~/utils/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
dayjs.extend(relativeTime);

const Stars = (props: { stars: number }) => {
  return (
    <div className="flex flex-row">
      {Array.from({ length: props.stars+1 }).map((_, i) => {
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6 text-yellow-500"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        );
      })}
    </div>
  );
};

const ReviewFeed = (props: { restaurantId: string }) => {
  const { data, isLoading } = api.review.getReviewsByRestaurantId.useQuery({
    restaurantId: props.restaurantId,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex h-4/5 flex-col justify-start">
      {data.map((review, i) => (
        <div
          key={i}
          className="flex h-1/5 justify-between border-b border-slate-400"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Burger: {review.burgerName}
            </h1>
            <p>{review.body}</p>
            <div className='flex flex-row gap-2'><p>Smag: </p><Stars stars={review.tasteRating}/></div>
            <div className='flex flex-row gap-2'><p>Texture: </p><Stars stars={review.textureRating}/></div>
            <div className='flex flex-row gap-2'><p>Præsentation: </p><Stars stars={review.presentationRating}/></div>
          </div>
          <p className="">{dayjs(review.createdAt).fromNow()}</p>
        </div>
      ))}
    </div>
  );
};

const RestaurantPage: NextPage<{ slug: string }> = ({ slug }) => {
  const { data } = api.resaurant.getBySlug.useQuery({ slug });
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          <div className="flex h-1/5 items-center justify-between border-b border-slate-400">
            <div className="ml-2 flex gap-2">
              <Image
                src={data.image}
                alt={`Logo of ${data.name}`}
                width={128}
                height={128}
                className="h-28 w-28 rounded-full object-cover"
              />
              <div>
                <h1 className="text-3xl font-bold">{data.name}</h1>
                <h2 className="text-lg font-semibold">{data.address}</h2>
                <p className="font-semibold text-green-500">Åben</p>
                <Link href={`/${slug}/review`}>
                  <button className="bg-blue-600 hover:bg-blue-500 text-slate-200 font-bold p-2 rounded">Anmeld</button>
                </Link>
              </div>
            </div>
            <div className="mr-2 flex flex-col gap-1 text-right">
              <h1>Anmeldelser ({data.reviews.count})</h1>
              <p>Smag: {data.reviews.average.tasteRating}</p>
              <p>Texture: {data.reviews.average.textureRating}</p>
              <p>Præsentation: {data.reviews.average.presentationRating}</p>
            </div>
          </div>
          <ReviewFeed restaurantId={data.id} />
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('no slug');

  await ssg.resaurant.getBySlug.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' };
};

export default RestaurantPage;
