/* eslint-disable no-unused-vars */
import { CommonFieldTypes, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

export default function addProgramTemplate(manifest) {
  manifest.addTemplate({
    name: 'Program',
    displayName: 'Program',
    fields: [
      { name: 'name', type: CommonFieldTypes.SingleLineText },
      { name: 'ageRange', type: CommonFieldTypes.SingleLineText },
      { name: 'summary', type: CommonFieldTypes.RichText },
    ],
  });
}
