import { PageShell } from '../../components/layouts/PageShell';
import { CalendarList } from '../../components/organisms/CalendarList';
import { Card } from '../../components/molecules/Card';
import { Badge } from '../../components/atoms/Badge';

export default function Calendar() {
  const calendarFields = {
    title: { value: 'Center Calendar & Events' },
    events: [
      {
        title: { value: 'Martin Luther King Jr. Day' },
        date: { value: 'January 15, 2025' },
        summary: { value: 'Center closed in observance of Martin Luther King Jr. Day.' },
      },
      {
        title: { value: 'Winter Program Showcase' },
        date: { value: 'February 14, 2025' },
        summary: { value: 'Join us for our annual winter program showcase featuring student artwork, music, and performances.' },
      },
      {
        title: { value: 'Presidents Day' },
        date: { value: 'February 17, 2025' },
        summary: { value: 'Center closed in observance of Presidents Day.' },
      },
      {
        title: { value: 'Spring Break' },
        date: { value: 'March 10-14, 2025' },
        summary: { value: 'Spring break week. Extended care available for an additional fee.' },
      },
      {
        title: { value: 'Easter Egg Hunt' },
        date: { value: 'March 29, 2025' },
        summary: { value: 'Annual Easter egg hunt and spring festival. Family friendly event!' },
      },
      {
        title: { value: 'Parent-Teacher Conferences' },
        date: { value: 'April 15-19, 2025' },
        summary: { value: 'Schedule your parent-teacher conference to discuss your child\'s progress.' },
      },
      {
        title: { value: 'Earth Day Celebration' },
        date: { value: 'April 22, 2025' },
        summary: { value: 'Environmental awareness activities and outdoor learning experiences.' },
      },
      {
        title: { value: 'Spring Program Showcase' },
        date: { value: 'May 9, 2025' },
        summary: { value: 'Celebrate the end of our spring session with student performances and exhibitions.' },
      },
      {
        title: { value: 'Memorial Day' },
        date: { value: 'May 26, 2025' },
        summary: { value: 'Center closed in observance of Memorial Day.' },
      },
      {
        title: { value: 'Summer Program Registration' },
        date: { value: 'June 1-15, 2025' },
        summary: { value: 'Early registration period for summer camp programs. Limited spots available!' },
      },
    ],
  };

  const importantDates = [
    { date: 'January 15', event: 'MLK Day - Closed', type: 'holiday' },
    { date: 'February 17', event: 'Presidents Day - Closed', type: 'holiday' },
    { date: 'March 10-14', event: 'Spring Break', type: 'break' },
    { date: 'May 26', event: 'Memorial Day - Closed', type: 'holiday' },
    { date: 'June 20', event: 'Juneteenth - Closed', type: 'holiday' },
    { date: 'July 4', event: 'Independence Day - Closed', type: 'holiday' },
    { date: 'September 2', event: 'Labor Day - Closed', type: 'holiday' },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">Center Calendar</h1>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Stay informed about important dates, holidays, events, and program schedules.
            All dates are subject to change.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <CalendarList fields={calendarFields} />
          </div>

          <div className="space-y-6">
            <Card title="Important Dates">
              <div className="space-y-3">
                {importantDates.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.date}</span>
                    <Badge
                      variant={
                        item.type === 'holiday' ? 'error' :
                        item.type === 'break' ? 'warning' : 'primary'
                      }
                      size="sm"
                    >
                      {item.event}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Weather Policy">
              <p className="text-sm mb-3">
                We follow local school district guidelines for weather-related closures.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Closures announced by 6:00 AM</li>
                <li>• Emergency notification system</li>
                <li>• Make-up days available</li>
                <li>• Check our website for updates</li>
              </ul>
            </Card>

            <Card title="Extended Hours">
              <p className="text-sm mb-3">
                Available at select locations for early drop-off and late pick-up.
              </p>
              <div className="text-sm">
                <p><strong>Early Care:</strong> 6:00 AM - 8:00 AM</p>
                <p><strong>Late Care:</strong> 5:00 PM - 6:00 PM</p>
                <p className="text-xs text-gray-600 mt-2">Additional fees apply</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Calendar Legend</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Badge variant="error" size="sm" className="mr-2">Holiday</Badge>
              <span className="text-sm">Center Closed</span>
            </div>
            <div className="flex items-center">
              <Badge variant="warning" size="sm" className="mr-2">Break</Badge>
              <span className="text-sm">Modified Schedule</span>
            </div>
            <div className="flex items-center">
              <Badge variant="primary" size="sm" className="mr-2">Event</Badge>
              <span className="text-sm">Special Activities</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}