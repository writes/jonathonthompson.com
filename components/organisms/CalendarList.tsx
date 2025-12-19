'use client';

import { Field } from '@sitecore-jss/sitecore-jss-nextjs';

type EventSource = {
  title?: Field<string> | string;
  date?: Field<string> | string;
  summary?: Field<string> | string;
};

export type CalendarListFields = {
  title?: Field<string>;
  events?: EventSource[] | { value?: EventSource[] };
};

function coerceField(field?: Field<string> | string): Field<string> {
  if (!field) {
    return { value: '' } as Field<string>;
  }

  if (typeof field === 'string') {
    return { value: field } as Field<string>;
  }

  return field;
}

function normalizeEvents(events?: CalendarListFields['events']) {
  const rawEvents = Array.isArray(events)
    ? events
    : Array.isArray((events as { value?: EventSource[] })?.value)
    ? ((events as { value?: EventSource[] }).value as EventSource[])
    : [];

  return rawEvents
    .map((event: any) => {
      const source = event?.fields ?? event;
      if (!source) return null;

      return {
        title: coerceField(source.title),
        date: coerceField(source.date),
        summary: source.summary ? coerceField(source.summary) : undefined,
      };
    })
    .filter(
      (
        event
      ): event is {
        title: Field<string>;
        date: Field<string>;
        summary?: Field<string>;
      } => Boolean(event?.title?.value)
    );
}

export function CalendarList(props: any) {
  const fields = (props.fields as CalendarListFields) ?? {};
  const events = normalizeEvents(fields.events);

  return (
    <section className="calendar p-8">
      <h2 className="text-3xl font-bold mb-4">
        {/* <Text field={coerceField(fields.title)} /> */}
        {coerceField(fields.title).value}
      </h2>
      <ul className="space-y-4">
        {events.map((event, index) => (
          <li key={index} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">
              {/* <Text field={event.title} /> */}
              {event.title.value}
            </h3>
            <p className="text-gray-600">
              {/* <Text field={event.date} /> */}
              {event.date.value}
            </p>
            {event.summary && (
              <p>
                {/* <Text field={event.summary} /> */}
                {event.summary.value}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
