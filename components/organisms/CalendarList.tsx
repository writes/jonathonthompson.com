import { Text, Field } from '@sitecore-jss/sitecore-jss-nextjs';

export type EventFields = {
  title: Field<string>;
  date: Field<string>;
  summary?: Field<string>;
};

export type CalendarListFields = {
  title: Field<string>;
  events: EventFields[];
};

export function CalendarList(props: any) {
  const fields = props.fields as CalendarListFields;

  return (
    <section className="calendar p-8">
      <h2 className="text-3xl font-bold mb-4">
        <Text field={fields.title} />
      </h2>
      <ul className="space-y-4">
        {fields.events.map((event, index) => (
          <li key={index} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">
              <Text field={event.title} />
            </h3>
            <p className="text-gray-600">
              <Text field={event.date} />
            </p>
            {event.summary && (
              <p>
                <Text field={event.summary} />
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
