import type { GatsbySSR } from 'gatsby';
import { StrictMode } from 'react';

import { App } from './src/App';
import { Root } from './src/Root';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => (
  
  <StrictMode>
        {/* <MetaMaskProvider debug={false} sdkOptions={{
      checkInstallationImmediately: false,
      dappMetadata: {
        name: "Demo React App",
        url: window.location.host,
      }
    }}> */}
    <Root>{element}</Root>
    {/* </MetaMaskProvider> */}
  </StrictMode>
);

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element }) => (
  <MetaMaskUIProvider debug={false} sdkOptions={{
    checkInstallationImmediately: false,
    dappMetadata: {
      name: "Demo React App",
      url: window.location.host,
    }
  }}>
  <App>{element}</App>
  </MetaMaskUIProvider>
);
