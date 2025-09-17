/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

/**
 * Adds the AnnouncementBar component to the Sitecore manifest.
 * @param {Manifest} manifest
 */
export default function addAnnouncementBarComponent(manifest) {
  manifest.addComponent({
    name: 'AnnouncementBar',
    templateName: 'AnnouncementBar',
    icon: SitecoreIcon.Bell,
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      { name: 'body', type: CommonFieldTypes.RichText },
      {
        name: 'severity',
        type: CommonFieldTypes.Droplist,
        source: 'info|warning|error',
      },
    ],
  });
}
