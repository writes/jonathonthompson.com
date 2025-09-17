/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

export default function addLeadFormComponent(manifest) {
  manifest.addComponent({
    name: 'LeadForm',
    templateName: 'LeadForm',
    icon: SitecoreIcon.Form,
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      { name: 'submitText', type: CommonFieldTypes.SingleLineText },
    ],
  });
}
