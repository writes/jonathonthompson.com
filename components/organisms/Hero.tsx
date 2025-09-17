import {
  RichText,
  Image,
  Text,
  Field,
} from '@sitecore-jss/sitecore-jss-nextjs';

export type HeroFields = {
  title: Field<string>;
  body: Field<string>;
  image: { value: { src: string; alt: string } };
  ctaText?: Field<string>;
  ctaUrl?: Field<string>;
};

export function Hero(props: any) {
  const fields = props.fields as HeroFields;
  return (
    <section aria-label="Hero" className="hero bg-blue-500 text-white p-8">
      <h1 className="text-4xl font-bold">
        <Text field={fields.title} />
      </h1>
      <RichText field={fields.body} className="mt-4" />
      {fields.image?.value?.src && (
        <Image
          field={fields.image}
          height={480}
          width={1280}
          loading="eager"
          className="mt-4"
          alt={fields.image.value.alt}
        />
      )}
      {fields.ctaUrl && (
        <a
          href={fields.ctaUrl.value}
          className="mt-4 inline-block bg-white text-blue-500 px-4 py-2 rounded"
        >
          <Text field={fields.ctaText ?? ({ value: 'Learn more' } as any)} />
        </a>
      )}
    </section>
  );
}
