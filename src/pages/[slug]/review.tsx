import type { GetStaticProps, NextPage } from 'next';
import { z } from 'zod';
import { Form, Field } from 'houseform';
import Image from 'next/image';
import Head from 'next/head';
import { generateSSGHelper } from '~/server/helpers/ssgHelper';
import { api } from '~/utils/api';
import Router from 'next/router';
import Link from 'next/link';

const StarField = ({
  name,
  title,
  stars,
}: {
  name: string;
  title: string;
  stars: number;
}) => {
  return (
    <Field<number>
      name={name}
      initialValue={0}
      onChangeValidate={z
        .number()
        .min(0)
        .max(stars - 1)}
    >
      {({ value, setValue, onBlur, errors }) => {
        return (
          <div className="py-2">
            <fieldset>
              <legend className="text-sm text-slate-200">{title}</legend>
              <div className="flex flex-row justify-center">
                {Array.from({ length: stars }).map((_, i) => {
                  return (
                    <div key={i}>
                      <input
                        type="checkbox"
                        id={`star${i}for${name}`}
                        name={name}
                        value={i}
                        checked={value === i}
                        className="absolute -left-[100vw]"
                        onChange={(e) => setValue(parseInt(e.target.value))}
                      />
                      <label
                        htmlFor={`star${i}for${name}`}
                        className={'' + (value >= i ? 'text-yellow-500' : '')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        );
      }}
    </Field>
  );
};

interface FormTypes {
  burgerName: string;
  taste: number;
  texture: number;
  presentation: number;
}

const ReviewPage: NextPage<{ slug: string }> = ({ slug }) => {
  const { data } = api.resaurant.getBySlug.useQuery({ slug });

  const { mutate, isLoading: isPosting } = api.review.create.useMutation({
    onSuccess: () => {
      void Router.push(`/${slug}`);
    },
    onError: (e) => {
      console.log(e);
    },
  });

  if (!data) return <div> 404 </div>;

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="flex min-h-full w-1/3 flex-col items-center overflow-hidden border border-slate-200 p-10 text-center">
          <h1 className="py-2 text-lg font-semibold">
            {' '}
            Vurder din burger hos
            <br />
            {data.name}
          </h1>
          <Image
            src={data.image}
            alt=""
            width={256}
            height={256}
            className="h-32 w-32 rounded-full object-cover py-2"
          />
          <Form<FormTypes>
            onSubmit={(values) => {
              mutate({
                tasteRating: values.taste,
                textureRating: values.texture,
                presentationRating: values.presentation,
                burgerName: values.burgerName,
                restuantId: data.id,
              });
            }}
          >
            {({ isValid, submit }) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
              >
                <Field<string>
                  name="burgerName"
                  onChangeValidate={z
                    .string()
                    .min(3, 'Must be at least 3 characters long')}
                >
                  {({ value, setValue, onBlur, errors }) => {
                    return (
                      <div className="flex flex-col items-center py-2">
                        <label className="text-sm text-slate-200">
                          Burger navn
                        </label>
                        <input
                          value={value}
                          onBlur={onBlur}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-48 rounded-md border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                          placeholder={'Chessburger'}
                          type="text"
                        />
                        {errors.map((error) => (
                          <p key={error}>{error}</p>
                        ))}
                      </div>
                    );
                  }}
                </Field>

                <StarField name="taste" title="Smag" stars={5} />
                <StarField name="texture" title="Texture" stars={5} />
                <StarField name="presentation" title="Præsentation" stars={5} />

                <button
                  disabled={!isValid || isPosting}
                  type="submit"
                  className={
                    'w-32 rounded-md bg-blue-600 p-2 hover:bg-blue-500 disabled:bg-slate-600 disabled:hover:bg-slate-600'
                  }
                >
                  Submit
                </button>
              </form>
            )}
          </Form>
          <Link href={`/${slug}`}>
            <button className="mt-2 rounded bg-red-600 p-2 text-slate-200 hover:bg-red-500">
              Tilbage
            </button>
          </Link>
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

export default ReviewPage;
