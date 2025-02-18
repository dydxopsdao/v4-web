import { shallowEqual } from 'react-redux';
import styled from 'styled-components';

import { ButtonAction, ButtonSize, ButtonType } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';
import { NumberSign } from '@/constants/numbers';
import { DydxChainAsset } from '@/constants/wallets';

import { useAccountBalance } from '@/hooks/useAccountBalance';
import { useStringGetter } from '@/hooks/useStringGetter';
import { useTokenConfigs } from '@/hooks/useTokenConfigs';

import { Button } from '@/components/Button';
import { DiffOutput } from '@/components/DiffOutput';
import { Output, OutputType } from '@/components/Output';
import { Tag } from '@/components/Tag';
import { WithDetailsReceipt } from '@/components/WithDetailsReceipt';
import { OnboardingTriggerButton } from '@/views/dialogs/OnboardingTriggerButton';

import { calculateCanAccountTrade } from '@/state/accountCalculators';
import { getSubaccount } from '@/state/accountSelectors';
import { useAppSelector } from '@/state/appTypes';
import { getTransferInputs } from '@/state/inputsSelectors';

import { isTruthy } from '@/lib/isTruthy';
import { MustBigNumber } from '@/lib/numbers';
import { isValidKey } from '@/lib/typeUtils';

type ElementProps = {
  selectedAsset: string;
  fee?: number;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export const TransferButtonAndReceipt = ({
  selectedAsset,
  fee,
  isDisabled,
  isLoading,
}: ElementProps) => {
  const stringGetter = useStringGetter();
  const canAccountTrade = useAppSelector(calculateCanAccountTrade, shallowEqual);
  const { size } = useAppSelector(getTransferInputs, shallowEqual) ?? {};
  const { tokensConfigs } = useTokenConfigs();

  const { equity: equityInfo, leverage: leverageInfo } =
    useAppSelector(getSubaccount, shallowEqual) ?? {};

  const { nativeTokenBalance } = useAccountBalance();

  const { current: equity, postOrder: newEquity } = equityInfo ?? {};
  const { current: leverage, postOrder: newLeverage } = leverageInfo ?? {};

  const isUSDCSelected = selectedAsset === DydxChainAsset.USDC;

  const balance = isUSDCSelected ? equity : nativeTokenBalance;
  const newNativeTokenBalance = nativeTokenBalance
    .minus(size?.size ?? 0)
    .minus(fee ?? 0) // show balance after fees for button receipt
    .toNumber();

  const newBalance = isUSDCSelected ? newEquity : newNativeTokenBalance;

  const selectedTokenConfig = isValidKey(selectedAsset, tokensConfigs)
    ? tokensConfigs[selectedAsset]
    : undefined;

  const transferDetailItems = [
    {
      key: 'fees',
      label: (
        <span>
          {stringGetter({ key: STRING_KEYS.FEES })} <Tag>{selectedTokenConfig?.name}</Tag>
        </span>
      ),
      value: <Output type={OutputType.Asset} value={fee} />,
    },
    {
      key: 'balance',
      label: (
        <span>
          {stringGetter({ key: STRING_KEYS.BALANCE })} <Tag>{selectedTokenConfig?.name}</Tag>
        </span>
      ),
      value: (
        <DiffOutput
          type={OutputType.Asset}
          value={balance}
          sign={NumberSign.Negative}
          newValue={newBalance}
          hasInvalidNewValue={MustBigNumber(newBalance).isNegative()}
          withDiff={newBalance !== null && !MustBigNumber(balance).eq(newBalance ?? 0)}
        />
      ),
    },
    isUSDCSelected && {
      key: 'leverage',
      label: <span>{stringGetter({ key: STRING_KEYS.LEVERAGE })}</span>,
      value: (
        <DiffOutput
          type={OutputType.Multiple}
          value={leverage}
          newValue={newLeverage}
          sign={NumberSign.Negative}
          withDiff={Boolean(newLeverage) && leverage !== newLeverage}
        />
      ),
    },
  ].filter(isTruthy);

  return (
    <$WithDetailsReceipt detailItems={transferDetailItems}>
      {!canAccountTrade ? (
        <OnboardingTriggerButton size={ButtonSize.Base} />
      ) : (
        <Button
          action={ButtonAction.Primary}
          type={ButtonType.Submit}
          state={{ isLoading, isDisabled }}
        >
          {stringGetter({ key: STRING_KEYS.CONFIRM_TRANSFER })}
        </Button>
      )}
    </$WithDetailsReceipt>
  );
};
const $WithDetailsReceipt = styled(WithDetailsReceipt)`
  --withReceipt-backgroundColor: var(--color-layer-2);

  dl {
    padding: var(--form-input-paddingY) var(--form-input-paddingX);
  }
`;
