import { Text, Field } from '@sitecore-jss/sitecore-jss-nextjs';

export type AnnouncementFields = {
  title: Field<string>;
  body: Field<string>;
  severity?: Field<string>; // e.g., 'info', 'warning', 'error'
};

export function AnnouncementBar(props: any) {
  const fields = props.fields as AnnouncementFields;

  if (!fields.title?.value) return null;

  const severity = fields.severity?.value || 'info';
  const bgClass =
    severity === 'warning'
      ? 'bg-yellow-500'
      : severity === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  return (
    <div
      className={`${bgClass} text-white p-4 text-center`}
      role="banner"
      aria-label="Announcement"
    >
      <h2 className="font-bold">
        <Text field={fields.title} />
      </h2>
      <p>
        <Text field={fields.body} />
      </p>
    </div>
  );
}
