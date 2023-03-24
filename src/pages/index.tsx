import { type NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { api } from '~/utils/api';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Rate Burger</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="flex min-h-full w-1/3 flex-col items-center overflow-hidden border border-slate-200 p-10 text-center">
          <h1 className="mb-4 text-lg font-semibold"> Vurder din burger hos</h1>
          <Image
            src="/placeholder-burger.jpg"
            alt=""
            width={256}
            height={256}
            className="mb-4 h-48 w-48 rounded-full object-cover"
          />
          <form>
            <div>
              <label
                htmlFor="first_name"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Burger navn
              </label>
              <input
                type="text"
                id="first_name"
                className="block w-full rounded-md border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Chessburger"
              />
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Home;
