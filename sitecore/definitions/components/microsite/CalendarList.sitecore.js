/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
import config from '../../../../sitecore.config';
/* eslint-enable no-unused-vars */

const { jssAppName } = config;

export default function addCalendarListComponent(manifest) {
  manifest.addComponent({
    name: 'CalendarList',
    templateName: 'CalendarList',
    icon: SitecoreIcon.Calendar,
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      {
        name: 'events',
        type: CommonFieldTypes.ContentList,
        source: `dataSource=/sitecore/content/${jssAppName}/Content/Events`,
      },
    ],
  });
}
