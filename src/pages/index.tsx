import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '~/utils/api';

interface Cords {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const Home: NextPage = () => {
  const [position, setPosition] = useState<Cords>();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setPosition({ coords: { latitude, longitude } });
        setEnabled(true);
      });
    }
  }, []);

  const { data } = api.resaurant.getByDistance.useQuery(
    {
      lat: position?.coords.latitude ?? 0,
      lng: position?.coords.longitude ?? 0,
    },
    { enabled: enabled }
  );

  return (
    <>
      <Head>
        <title>Rate Burger</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          <div className="flex flex-col gap-2 border-b border-slate-400 p-2">
            <h1 className="text-xl font-bold">Burger restauranger nær dig</h1>
            <button className="w-fit rounded-md bg-blue-600 p-2 hover:bg-blue-500">
              Register ny restaurang
            </button>
          </div>
          {data?.map((restaurant, i) => {
            return (
              <div
                key={i}
                className="flex h-24 w-full flex-row items-center justify-between border-b border-slate-400 p-2"
              >
                <div>
                  <h1>{restaurant.prettyName}</h1>
                  <p>{restaurant.distance.toFixed(2)} km væk</p>
                </div>
                <div>
                  <Link href={`${restaurant.slug}`}>
                    <button className="w-fit rounded-md bg-blue-600 p-2 hover:bg-blue-500">
                      Se anmeldelser
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Home;
