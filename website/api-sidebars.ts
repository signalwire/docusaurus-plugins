import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    'intro',
    'authentication',
    {
      type: 'category',
      label: 'API Endpoints',
      items: [
        'users/index',
        'orders/index',
        'products/index',
      ],
    },
  ],
};

export default sidebars;