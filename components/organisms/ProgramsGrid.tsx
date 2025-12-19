'use client';

import { Field } from '@sitecore-jss/sitecore-jss-nextjs';

type ProgramSource = {
  name?: Field<string> | string;
  ageRange?: Field<string> | string;
  summary?: Field<string> | string;
};

export type ProgramsGridFields = {
  title?: Field<string>;
  programs?: ProgramSource[] | { value?: ProgramSource[] };
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

function normalizePrograms(programs?: ProgramsGridFields['programs']) {
  const rawPrograms = Array.isArray(programs)
    ? programs
    : Array.isArray((programs as { value?: ProgramSource[] })?.value)
    ? ((programs as { value?: ProgramSource[] }).value as ProgramSource[])
    : [];

  return rawPrograms
    .map((program: any) => {
      const source = program?.fields ?? program;
      if (!source) {
        return null;
      }

      return {
        name: coerceField(source.name),
        ageRange: coerceField(source.ageRange),
        summary: coerceField(source.summary),
      };
    })
    .filter(
      (
        program
      ): program is {
        name: Field<string>;
        ageRange: Field<string>;
        summary: Field<string>;
      } => Boolean(program?.name)
    );
}

export function ProgramsGrid(props: any) {
  const fields = (props.fields as ProgramsGridFields) ?? {};
  const programs = normalizePrograms(fields.programs);
  return (
    <section className="programs p-8">
      <h2 className="text-3xl font-bold">
        {/* <Text
          field={coerceField(fields.title ?? ({ value: '' } as Field<string>))}
        /> */}
        {coerceField(fields.title ?? ({ value: '' } as Field<string>)).value}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {programs.map((program, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">
              {/* <Text field={program.name} /> */}
              {program.name.value}
            </h3>
            <p className="text-gray-600">
              {/* <Text field={program.ageRange} /> */}
              {program.ageRange.value}
            </p>
            <p>
              {/* <Text field={program.summary} /> */}
              {program.summary?.value || ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
