import { ENVIRONMENT_CONFIG_MAP } from '@/constants/networks';

import { getSelectedNetwork } from '@/state/appSelectors';
import { useAppSelector } from '@/state/appTypes';

export interface EnvironmentFeatures {
  checkForGeo: boolean;
  withdrawalSafetyEnabled: boolean;
  CCTPWithdrawalOnly: boolean;
  CCTPDepositOnly: boolean;
  debugCompliance: boolean;
  isSlTpLimitOrdersEnabled: boolean;
}

export const useEnvFeatures = (): EnvironmentFeatures => {
  const selectedNetwork = useAppSelector(getSelectedNetwork);
  return ENVIRONMENT_CONFIG_MAP[selectedNetwork].featureFlags;
};
