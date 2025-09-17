import { PageShell } from '../../components/layouts/PageShell';
import { FAQAccordion } from '../../components/molecules/FAQAccordion';
import { TwoColumn } from '../../components/layouts/TwoColumn';
import { Card } from '../../components/molecules/Card';

export default function Policies() {
  const faqItems = [
    {
      question: 'What are your operating hours?',
      answer: 'Our centers are open Monday through Friday from 6:00 AM to 6:00 PM. Extended hours may be available at select locations for an additional fee.',
    },
    {
      question: 'What should my child bring to childcare?',
      answer: 'Please send your child with a complete change of clothes, including underwear and socks, labeled with their name. We also recommend bringing a favorite comfort item, diaper bag (if applicable), and any necessary medications clearly labeled.',
    },
    {
      question: 'How do you handle sick children?',
      answer: 'For the safety of all children, we follow strict illness policies. Children with fever, vomiting, diarrhea, or contagious illnesses must stay home. We will contact parents immediately if a child becomes ill during the day.',
    },
    {
      question: 'What is your payment policy?',
      answer: 'Tuition is due on the 1st of each month. We offer automatic payment options for your convenience. Late fees apply after the 5th of the month. We accept various payment methods including credit cards, checks, and online payments.',
    },
    {
      question: 'How do you handle weather-related closures?',
      answer: 'We follow local school district closure guidelines. In case of severe weather, closures will be communicated via our emergency notification system, website, and local media. Make-up days are available for unexpected closures.',
    },
    {
      question: 'What is your staff-to-child ratio?',
      answer: 'We maintain state-required staff-to-child ratios: 1:4 for infants, 1:6 for toddlers, 1:10 for preschoolers, and 1:12 for school-age children. All staff members are trained in CPR and First Aid.',
    },
    {
      question: 'Do you provide meals and snacks?',
      answer: 'Yes, we provide nutritious breakfast, lunch, and afternoon snacks as part of our program. Our menus follow USDA guidelines and accommodate special dietary needs. Parents can review weekly menus online.',
    },
    {
      question: 'What is your discipline policy?',
      answer: 'We use positive guidance techniques that teach children appropriate behavior. Our approach focuses on redirection, teaching alternatives, and positive reinforcement rather than punishment.',
    },
    {
      question: 'How do you ensure child safety?',
      answer: 'Safety is our top priority. All centers have secure entry systems, background-checked staff, emergency evacuation procedures, and daily health checks. We conduct regular safety drills and maintain all equipment to current safety standards.',
    },
    {
      question: 'Can I visit my child during the day?',
      answer: 'We encourage parent visits! Please call ahead to schedule a visit during non-nap times. Unscheduled visits may disrupt classroom activities, so we ask that you check in at the front desk first.',
    },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">Policies & FAQs</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our programs, policies, and procedures.
            We're here to make your childcare experience as smooth as possible.
          </p>
        </div>

        <TwoColumn
          className="mb-16"
          left={
            <div>
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              <FAQAccordion items={faqItems} />
            </div>
          }
          right={
            <div className="space-y-6">
              <Card title="Emergency Procedures">
                <p className="mb-4">
                  In case of emergency, we follow established protocols to ensure child safety and parent notification.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Immediate medical attention for injuries</li>
                  <li>• Emergency contact notification within 30 minutes</li>
                  <li>• Coordination with emergency services</li>
                  <li>• Parent escort to medical facilities if needed</li>
                </ul>
              </Card>

              <Card title="Health & Wellness">
                <p className="mb-4">
                  We prioritize the health and wellness of every child in our care.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Daily health checks and temperature monitoring</li>
                  <li>• Hand washing and sanitizing procedures</li>
                  <li>• Immunization record verification</li>
                  <li>• Sick child policies for contagious illnesses</li>
                </ul>
              </Card>

              <Card title="Parent Communication">
                <p className="mb-4">
                  We believe in open, ongoing communication with parents.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Daily activity reports and photos</li>
                  <li>• Parent-teacher conferences</li>
                  <li>• Emergency notification system</li>
                  <li>• Online portal for updates and billing</li>
                </ul>
              </Card>
            </div>
          }
        />

        <div className="bg-blue-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="mb-4">
            Can't find the answer you're looking for? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Contact Your Local Center</h3>
              <p className="text-sm text-gray-600">
                Each KinderCare center has dedicated staff ready to answer your questions about their specific programs and policies.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Corporate Support</h3>
              <p className="text-sm text-gray-600">
                For general questions or support, contact our corporate office at 1-800-KINDERCARE or visit our website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}