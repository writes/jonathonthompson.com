/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
/* eslint-enable no-unused-vars */

/**
 * Adds the Hero component to the Sitecore manifest.
 * @param {Manifest} manifest
 */
export default function addHeroComponent(manifest) {
  manifest.addComponent({
    name: 'Hero',
    templateName: 'Hero',
    icon: SitecoreIcon.DocumentQuestion,
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      { name: 'body', type: CommonFieldTypes.RichText },
      { name: 'image', type: CommonFieldTypes.Image },
      { name: 'ctaText', type: CommonFieldTypes.SingleLineText },
      { name: 'ctaLink', type: CommonFieldTypes.GeneralLink },
    ],
  });
}
