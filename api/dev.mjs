// eslint-disable-next-line import/extensions
import('./index.js').then(({ app, server }) => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  import('vite-plugin-blocklet').then(({ setupClient }) => {
    setupClient(app, {
      server,
      importMetaHot: import.meta.hot,
    });
  });
});
