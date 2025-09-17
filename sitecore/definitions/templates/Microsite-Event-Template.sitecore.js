/* eslint-disable no-unused-vars */
import { CommonFieldTypes, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

export default function addEventTemplate(manifest) {
  manifest.addTemplate({
    name: 'Event',
    displayName: 'Event',
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      { name: 'date', type: CommonFieldTypes.Date },
      { name: 'summary', type: CommonFieldTypes.RichText },
    ],
  });
}
