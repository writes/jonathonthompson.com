/* eslint-disable no-unused-vars */
import { CommonFieldTypes, SitecoreIcon, Manifest } from '@sitecore-jss/sitecore-jss-dev-tools';
import config from '../../../../sitecore.config';
/* eslint-enable no-unused-vars */

const { jssAppName } = config;

export default function addProgramsGridComponent(manifest) {
  manifest.addComponent({
    name: 'ProgramsGrid',
    templateName: 'ProgramsGrid',
    icon: SitecoreIcon.ApplicationsDialog,
    fields: [
      { name: 'title', type: CommonFieldTypes.SingleLineText },
      {
        name: 'programs',
        type: CommonFieldTypes.ContentList,
        source: `dataSource=/sitecore/content/${jssAppName}/Content/Programs`,
      },
    ],
  });
}
