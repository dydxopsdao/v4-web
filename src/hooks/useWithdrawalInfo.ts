import { useEffect, useMemo } from 'react';

import { ByteArrayEncoding, encodeJson } from '@dydxprotocol/v4-client-js';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { DialogTypes } from '@/constants/dialogs';
import { ESTIMATED_BLOCK_TIME } from '@/constants/numbers';

import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { closeDialog, openDialog } from '@/state/dialogs';
import { getSelectedLocale } from '@/state/localizationSelectors';

import { wrapAndLogError } from '@/lib/asyncUtils';
import { formatRelativeTime } from '@/lib/dateTime';
import { BIG_NUMBERS, MustBigNumber } from '@/lib/numbers';
import { orEmptyObj } from '@/lib/typeUtils';

import { useApiState } from './useApiState';
import { useDydxClient } from './useDydxClient';
import { useEnvFeatures } from './useEnvFeatures';
import { useTokenConfigs } from './useTokenConfigs';

export const useWithdrawalInfo = ({
  transferType,
}: {
  transferType: 'withdrawal' | 'transfer';
}) => {
  const { getWithdrawalAndTransferGatingStatus, getWithdrawalCapacityByDenom } = useDydxClient();
  const { usdcDenom, usdcDecimals } = useTokenConfigs();
  const { height } = orEmptyObj(useApiState());
  const selectedLocale = useAppSelector(getSelectedLocale);
  const dispatch = useAppDispatch();
  const { withdrawalSafetyEnabled } = useEnvFeatures();

  const { data: usdcWithdrawalCapacity } = useQuery({
    enabled: withdrawalSafetyEnabled,
    queryKey: ['usdcWithdrawalCapacity'],
    queryFn: wrapAndLogError(
      async () => {
        const response = await getWithdrawalCapacityByDenom({ denom: usdcDenom });
        return JSON.parse(encodeJson(response, ByteArrayEncoding.BIGINT));
      },
      'useWithdrawalInfo/getWithdrawalCapacityByDenom',
      true
    ),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const { data: withdrawalAndTransferGatingStatus } = useQuery({
    enabled: withdrawalSafetyEnabled,
    queryKey: ['withdrawalTransferGateStatus'],
    queryFn: wrapAndLogError(
      () => getWithdrawalAndTransferGatingStatus(),
      'useWithdrawalInfo/getWithdrawalAndTransferGatingStatus',
      true
    ),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const capacity = useMemo(() => {
    const capacityList = usdcWithdrawalCapacity?.limiterCapacityList;
    if (!capacityList || capacityList.length < 2) {
      if (!withdrawalSafetyEnabled) {
        return BigNumber(Infinity);
      }

      return BIG_NUMBERS.ZERO;
    }

    const [{ capacity: daily }, { capacity: weekly }] = capacityList;
    const dailyBN = MustBigNumber(daily);
    const weeklyBN = MustBigNumber(weekly);
    return BigNumber.minimum(dailyBN, weeklyBN).div(10 ** usdcDecimals);
  }, [usdcDecimals, usdcWithdrawalCapacity]);

  const withdrawalAndTransferGatingStatusValue = useMemo(() => {
    const { withdrawalsAndTransfersUnblockedAtBlock } = withdrawalAndTransferGatingStatus ?? {};
    if (
      height &&
      withdrawalsAndTransfersUnblockedAtBlock &&
      height < withdrawalsAndTransfersUnblockedAtBlock &&
      withdrawalSafetyEnabled
    ) {
      return {
        estimatedUnblockTime: formatRelativeTime(
          Date.now() + (withdrawalsAndTransfersUnblockedAtBlock - height) * ESTIMATED_BLOCK_TIME,
          {
            locale: selectedLocale,
            largestUnit: 'day',
          }
        ),
        isGated: true,
      };
    }
    return {
      estimatedUnblockTime: null,
      isGated: false,
    };
  }, [height, withdrawalAndTransferGatingStatus, withdrawalSafetyEnabled]);

  useEffect(() => {
    if (
      withdrawalAndTransferGatingStatusValue.isGated &&
      withdrawalAndTransferGatingStatusValue.estimatedUnblockTime &&
      withdrawalSafetyEnabled
    ) {
      dispatch(closeDialog());
      dispatch(
        openDialog(
          DialogTypes.WithdrawalGated({
            transferType,
            estimatedUnblockTime: withdrawalAndTransferGatingStatusValue.estimatedUnblockTime,
          })
        )
      );
    }
  }, [transferType, withdrawalAndTransferGatingStatusValue.isGated, withdrawalSafetyEnabled]);

  return {
    usdcWithdrawalCapacity: capacity,
    withdrawalAndTransferGatingStatus,
  };
};
