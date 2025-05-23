import { DydxChainId, ENVIRONMENT_CONFIG_MAP } from '@/constants/networks';

import type { RootState } from './_store';

export const getSelectedNetwork = (state: RootState) => state.app.selectedNetwork;
export const getInitializationError = (state: RootState) => state.app.initializationError;

export const getSelectedDydxChainId = (state: RootState) =>
  ENVIRONMENT_CONFIG_MAP[state.app.selectedNetwork].dydxChainId as DydxChainId;

export const getMetadataEndpoint = (state: RootState) =>
  ENVIRONMENT_CONFIG_MAP[getSelectedNetwork(state)].endpoints.metadataService;
