import { ComponentFactory } from '@sitecore-jss/sitecore-jss-nextjs';
import { Hero } from '@/components/organisms/Hero';
import { ProgramsGrid } from '@/components/organisms/ProgramsGrid';
import { CenterFinder } from '@/components/organisms/CenterFinder';
import { AnnouncementBar } from '@/components/organisms/AnnouncementBar';
import { LeadForm } from '@/components/organisms/LeadForm';
import { CalendarList } from '@/components/organisms/CalendarList';
import { ConsentBanner } from '@/components/organisms/ConsentBanner';

export const componentFactory: ComponentFactory = (componentName) => {
  switch (componentName) {
    case 'Hero':
      return Hero;
    case 'ProgramsGrid':
      return ProgramsGrid;
    case 'CenterFinder':
      return CenterFinder;
    case 'AnnouncementBar':
      return AnnouncementBar;
    case 'LeadForm':
      return LeadForm;
    case 'CalendarList':
      return CalendarList;
    case 'ConsentBanner':
      return ConsentBanner;
    default:
      return null;
  }
};
