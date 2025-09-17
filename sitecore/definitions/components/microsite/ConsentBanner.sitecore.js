/* eslint-disable no-unused-vars */
import { SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

export default function addConsentBannerComponent(manifest) {
  manifest.addComponent({
    name: 'ConsentBanner',
    templateName: 'ConsentBanner',
    icon: SitecoreIcon.Settings,
    fields: [],
  });
}
