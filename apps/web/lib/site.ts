const repo = 'https://github.com/samuelcorsan/reforma-digital';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = new URL(
  process.env.APP_ORIGIN ||
    (productionHost ? `https://${productionHost}` : 'http://localhost:3000'),
);
export const links = {
  repo,
  install: `${repo}/releases/tag/v0.1.0-pre-alpha`,
  contributing: `${repo}/blob/main/CONTRIBUTING.md`,
  license: `${repo}/blob/main/LICENSE`,
};
