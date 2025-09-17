import { Text, Field } from '@sitecore-jss/sitecore-jss-nextjs';

export type ProgramsGridFields = {
  title: Field<string>;
  programs: Array<{
    name: Field<string>;
    ageRange: Field<string>;
    summary: Field<string>;
  }>;
};

export function ProgramsGrid(props: any) {
  const fields = props.fields as ProgramsGridFields;
  return (
    <section className="programs p-8">
      <h2 className="text-3xl font-bold">
        <Text field={fields.title} />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {fields.programs.map((program, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">
              <Text field={program.name} />
            </h3>
            <p className="text-gray-600">
              <Text field={program.ageRange} />
            </p>
            <p>
              <Text field={program.summary} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
