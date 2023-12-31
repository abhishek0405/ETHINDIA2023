import type { GatsbyBrowser } from 'gatsby';
import { StrictMode } from 'react';

import { App } from './src/App';
import { Root } from './src/Root';
import { MetaMaskProvider } from '@metamask/sdk-react';

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}) => (
  <StrictMode>
    <MetaMaskProvider debug={false} sdkOptions={{
      checkInstallationImmediately: false,
      dappMetadata: {
        name: "Demo React App",
        url: window.location.host,
      }
    }}>
      <Root>{element}</Root>
    </MetaMaskProvider>
  </StrictMode>
);

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => <App>{element}</App>;
