'use client';

import { Field, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';

export type HeroFields = {
  title: Field<string>;
  body: Field<string>;
  image: { value: { src: string; alt: string } };
  ctaText?: Field<string>;
  ctaLink?: LinkField;
};

export function Hero(props: any) {
  const fields = props.fields as HeroFields;
  const ctaLink = fields.ctaLink;
  const fallbackText =
    fields.ctaText ??
    (ctaLink?.value?.text
      ? ({ value: ctaLink.value.text } as Field<string>)
      : undefined);
  const resolvedText =
    fallbackText ?? ({ value: 'Learn more' } as Field<string>);
  return (
    <section aria-label="Hero" className="hero bg-blue-500 text-white p-8">
      <h1 className="text-4xl font-bold">
        {/* <Text field={fields.title} /> */}
        {fields.title?.value || 'Welcome'}
      </h1>
      {/* Replace RichText with div to avoid SSR router issues */}
      <div
        className="mt-4"
        dangerouslySetInnerHTML={{ __html: fields.body?.value || '' }}
      />
      {fields.image?.value?.src && (
        /* Replace Image with img to avoid SSR router issues */
        <img
          src={fields.image.value.src}
          height={480}
          width={1280}
          loading="eager"
          className="mt-4"
          alt={fields.image.value.alt}
        />
      )}
      {ctaLink?.value?.href && (
        <Link
          href={ctaLink.value.href}
          className="mt-4 inline-block bg-white text-blue-500 px-4 py-2 rounded"
        >
          {/* <Text field={resolvedText} /> */}
          {resolvedText?.value || 'Learn more'}
        </Link>
      )}
    </section>
  );
}
