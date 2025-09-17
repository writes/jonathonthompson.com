import { PageShell } from '../../components/layouts/PageShell';
import { ProgramsGrid } from '../../components/organisms/ProgramsGrid';
import { TwoColumn } from '../../components/layouts/TwoColumn';
import { ImageWithCaption } from '../../components/molecules/ImageWithCaption';
import { Card } from '../../components/molecules/Card';

export default function Programs() {
  const programsFields = {
    title: { value: 'Our Programs' },
    programs: [
      {
        name: { value: 'Infant Care' },
        ageRange: { value: '6 weeks – 12 months' },
        summary: { value: 'Our infant care program provides a nurturing environment where babies receive personalized attention and care. We focus on building secure attachments, sensory development, and early learning through play.' },
      },
      {
        name: { value: 'Toddler Program' },
        ageRange: { value: '1 – 2 years' },
        summary: { value: 'The toddler program emphasizes exploration and discovery. Children engage in age-appropriate activities that promote physical development, language skills, and social interaction.' },
      },
      {
        name: { value: 'Preschool' },
        ageRange: { value: '3 – 5 years' },
        summary: { value: 'Our preschool program prepares children for kindergarten with a comprehensive curriculum covering academics, social skills, creativity, and physical development.' },
      },
      {
        name: { value: 'Pre-K' },
        ageRange: { value: '4 – 5 years' },
        summary: { value: 'The Pre-K program builds on preschool foundations with more structured learning, including early literacy, math concepts, and school readiness skills.' },
      },
      {
        name: { value: 'School Age' },
        ageRange: { value: '5 – 12 years' },
        summary: { value: 'Before and after school care for school-aged children, featuring homework help, enrichment activities, and recreational programs.' },
      },
      {
        name: { value: 'Summer Camp' },
        ageRange: { value: '5 – 12 years' },
        summary: { value: 'Fun-filled summer programs with educational activities, field trips, swimming, and special events to keep children engaged during school breaks.' },
      },
    ],
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">Our Programs</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            KinderCare offers comprehensive childcare programs designed to support every stage of your child's development,
            from infancy through school age.
          </p>
        </div>

        <ProgramsGrid fields={programsFields} />

        <TwoColumn
          className="my-16"
          left={
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Choose KinderCare?</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Experienced, certified teachers
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Age-appropriate curriculum
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Safe, nurturing environment
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Flexible scheduling options
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Nutritional meals and snacks
                </li>
              </ul>
            </div>
          }
          right={
            <ImageWithCaption
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643"
              alt="Children learning and playing"
              caption="Our programs foster creativity, learning, and friendship"
              width={600}
              height={400}
            />
          }
        />

        <div className="my-16">
          <h2 className="text-3xl font-bold text-center mb-8">Program Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Developmental Activities">
              <p>Age-appropriate activities that promote cognitive, physical, and social development.</p>
            </Card>
            <Card title="Educational Curriculum">
              <p>Structured learning programs that prepare children for academic success.</p>
            </Card>
            <Card title="Outdoor Play">
              <p>Daily outdoor activities and playtime in our secure playground areas.</p>
            </Card>
            <Card title="Nutritious Meals">
              <p>Healthy, balanced meals prepared fresh daily with attention to dietary needs.</p>
            </Card>
            <Card title="Parent Communication">
              <p>Regular updates, conferences, and open communication with parents.</p>
            </Card>
            <Card title="Safety First">
              <p>Comprehensive safety protocols and trained staff ensuring child security.</p>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}