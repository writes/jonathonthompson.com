/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

export default function addCenterFinderComponent(manifest) {
  manifest.addComponent({
    name: 'CenterFinder',
    templateName: 'CenterFinder',
    icon: SitecoreIcon.Target,
    fields: [
      { name: 'defaultZip', type: CommonFieldTypes.SingleLineText },
    ],
  });
}
