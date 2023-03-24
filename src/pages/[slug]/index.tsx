import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

const ProfilePage: NextPage<{ slug: string }> = ({ slug }) => {
  return (
    <>
      <Head>
        <title>{slug}</title>
      </Head>
      <main className="overflow-none flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
        <h1 className="text-lg">{slug}</h1>
        <h2>home</h2>
      </div>
    </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = (context) => {
  const slug = context.params?.slug;
  console.log(slug)
  if (typeof slug !== "string") throw new Error("no slug");

  return {
    props: {
      slug,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;