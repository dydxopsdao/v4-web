import { FormEvent, useEffect, useMemo, useState } from 'react';

import { BonsaiHelpers } from '@/bonsai/ontology';
import { shallowEqual } from 'react-redux';
import styled from 'styled-components';

import {
  AdjustIsolatedMarginInputField,
  IsolatedMarginAdjustmentType,
  type SubaccountPosition,
} from '@/constants/abacus';
import { AlertType } from '@/constants/alerts';
import {
  ButtonAction,
  ButtonShape,
  ButtonSize,
  ButtonState,
  ButtonType,
} from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';
import { NumberSign, PERCENT_DECIMALS } from '@/constants/numbers';

import { useParameterizedSelector } from '@/hooks/useParameterizedSelector';
import { useStringGetter } from '@/hooks/useStringGetter';
import { useSubaccount } from '@/hooks/useSubaccount';

import { formMixins } from '@/styles/formMixins';

import { AlertMessage } from '@/components/AlertMessage';
import { Button } from '@/components/Button';
import { DiffOutput } from '@/components/DiffOutput';
import { FormInput } from '@/components/FormInput';
import { GradientCard } from '@/components/GradientCard';
import { Icon, IconName } from '@/components/Icon';
import { InputType } from '@/components/Input';
import { OutputType, ShowSign } from '@/components/Output';
import { ToggleGroup } from '@/components/ToggleGroup';
import { WithDetailsReceipt } from '@/components/WithDetailsReceipt';

import { getOpenPositionFromId, getOpenPositionFromIdForPostOrder } from '@/state/accountSelectors';
import { useAppSelector } from '@/state/appTypes';
import { getAdjustIsolatedMarginInputs } from '@/state/inputsSelectors';
import { getMarketMaxLeverage } from '@/state/perpetualsSelectors';

import abacusStateManager from '@/lib/abacus';
import { MustBigNumber } from '@/lib/numbers';
import { objectEntries } from '@/lib/objectHelpers';
import { orEmptyObj } from '@/lib/typeUtils';

type ElementProps = {
  marketId: SubaccountPosition['id'];
  onIsolatedMarginAdjustment?(): void;
};

const SIZE_PERCENT_OPTIONS = {
  '10%': '0.1',
  '25%': '0.25',
  '50%': '0.5',
  '75%': '0.75',
  '100%': '1',
};

export const AdjustIsolatedMarginForm = ({
  marketId,
  onIsolatedMarginAdjustment,
}: ElementProps) => {
  const stringGetter = useStringGetter();
  const { subaccountNumber: childSubaccountNumber, marginValueInitial: freeCollateral } =
    orEmptyObj(useParameterizedSelector(getOpenPositionFromId, marketId));
  const { marginUsage } = orEmptyObj(
    useParameterizedSelector(getOpenPositionFromIdForPostOrder, marketId)
  );

  const { tickSizeDecimals } = orEmptyObj(
    useParameterizedSelector(BonsaiHelpers.markets.createSelectMarketSummaryById, marketId)
  );
  const adjustIsolatedMarginInputs = useAppSelector(getAdjustIsolatedMarginInputs, shallowEqual);

  const {
    type: isolatedMarginAdjustmentType,
    amount,
    amountPercent,
    summary,
  } = adjustIsolatedMarginInputs ?? {};

  useEffect(() => {
    abacusStateManager.setAdjustIsolatedMarginValue({
      value: marketId,
      field: AdjustIsolatedMarginInputField.Market,
    });
  }, [marketId]);

  useEffect(() => {
    abacusStateManager.setAdjustIsolatedMarginValue({
      value: childSubaccountNumber,
      field: AdjustIsolatedMarginInputField.ChildSubaccountNumber,
    });

    return () => {
      abacusStateManager.setAdjustIsolatedMarginValue({
        value: null,
        field: AdjustIsolatedMarginInputField.ChildSubaccountNumber,
      });
      abacusStateManager.clearAdjustIsolatedMarginInputValues();
      abacusStateManager.clearTradeInputValues({ shouldResetSize: true });
    };
  }, [childSubaccountNumber]);

  const setAmount = ({ floatValue }: { floatValue?: number }) => {
    abacusStateManager.setAdjustIsolatedMarginValue({
      value: floatValue,
      field: AdjustIsolatedMarginInputField.Amount,
    });
  };

  const setPercent = (value: string) => {
    abacusStateManager.setAdjustIsolatedMarginValue({
      value,
      field: AdjustIsolatedMarginInputField.AmountPercent,
    });
  };

  const setMarginAction = (marginAction: string) => {
    abacusStateManager.setAdjustIsolatedMarginValue({
      value: marginAction,
      field: AdjustIsolatedMarginInputField.Type,
    });
  };

  const { adjustIsolatedMarginOfPosition } = useSubaccount();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const onSubmit = () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    adjustIsolatedMarginOfPosition({
      onError: (errorParams) => {
        setIsSubmitting(false);
        setErrorMessage(
          stringGetter({
            key: errorParams.errorStringKey,
            fallback: errorParams.errorMessage ?? '',
          })
        );
      },
      onSuccess: () => {
        setIsSubmitting(false);
        abacusStateManager.clearAdjustIsolatedMarginInputValues();
        onIsolatedMarginAdjustment?.();
      },
    });
  };

  const renderDiffOutput = ({
    type,
    value,
    newValue,
    showSign,
    withDiff,
  }: Pick<
    Parameters<typeof DiffOutput>[0],
    'type' | 'value' | 'newValue' | 'withDiff' | 'showSign'
  >) => (
    <DiffOutput
      type={type}
      value={value}
      newValue={newValue}
      showSign={showSign}
      withDiff={withDiff}
    />
  );

  const {
    crossFreeCollateral,
    crossFreeCollateralUpdated,
    crossMarginUsage,
    crossMarginUsageUpdated,
    positionMargin,
    positionMarginUpdated,
    positionLeverage,
    positionLeverageUpdated,
    liquidationPrice,
    liquidationPriceUpdated,
  } = summary ?? {};

  /**
   * TODO: Handle by adding AdjustIsolatedMarginValidator within Abacus
   */
  const marketMaxLeverage = useParameterizedSelector(getMarketMaxLeverage, marketId);

  const alertMessage = useMemo(() => {
    if (isolatedMarginAdjustmentType === IsolatedMarginAdjustmentType.Add) {
      if (MustBigNumber(amount).gt(MustBigNumber(crossFreeCollateral))) {
        return {
          message: stringGetter({ key: STRING_KEYS.TRANSFER_MORE_THAN_FREE }),
          type: AlertType.Error,
        };
      }

      if (crossMarginUsageUpdated && MustBigNumber(crossMarginUsageUpdated).gte(1)) {
        return {
          message: stringGetter({ key: STRING_KEYS.INVALID_NEW_ACCOUNT_MARGIN_USAGE }),
          type: AlertType.Error,
        };
      }
    } else if (isolatedMarginAdjustmentType === IsolatedMarginAdjustmentType.Remove) {
      if (MustBigNumber(amount).gte(MustBigNumber(freeCollateral))) {
        return {
          message: stringGetter({ key: STRING_KEYS.TRANSFER_MORE_THAN_FREE }),
          type: AlertType.Error,
        };
      }

      if (marginUsage?.postOrder && MustBigNumber(marginUsage.postOrder).gte(1)) {
        return {
          message: stringGetter({ key: STRING_KEYS.INVALID_NEW_ACCOUNT_MARGIN_USAGE }),
          type: AlertType.Error,
        };
      }

      if (positionLeverageUpdated && MustBigNumber(positionLeverageUpdated).gt(marketMaxLeverage)) {
        return {
          message: stringGetter({ key: STRING_KEYS.INVALID_NEW_POSITION_LEVERAGE }),
          type: AlertType.Error,
        };
      }
    }

    return null;
  }, [
    amount,
    crossFreeCollateral,
    crossMarginUsageUpdated,
    freeCollateral,
    isolatedMarginAdjustmentType,
    marginUsage,
    marketMaxLeverage,
    positionLeverageUpdated,
    stringGetter,
  ]);

  // currently the only action that trader can take to fix the errors/validations is modify the amount
  const ctaErrorAction =
    alertMessage?.type === AlertType.Error
      ? stringGetter({ key: STRING_KEYS.MODIFY_MARGIN_AMOUNT })
      : undefined;

  const {
    freeCollateralDiffOutput,
    marginUsageDiffOutput,
    positionMarginDiffOutput,
    leverageDiffOutput,
  } = useMemo(
    () => ({
      freeCollateralDiffOutput: renderDiffOutput({
        withDiff:
          !!crossFreeCollateralUpdated && crossFreeCollateral !== crossFreeCollateralUpdated,
        value: crossFreeCollateral,
        newValue: crossFreeCollateralUpdated,
        type: OutputType.Fiat,
      }),
      marginUsageDiffOutput: renderDiffOutput({
        withDiff: !!crossMarginUsageUpdated && crossMarginUsage !== crossMarginUsageUpdated,
        value: crossMarginUsage,
        newValue: crossMarginUsageUpdated,
        type: OutputType.Percent,
      }),
      positionMarginDiffOutput: renderDiffOutput({
        withDiff: !!positionMarginUpdated && positionMargin !== positionMarginUpdated,
        value: positionMargin,
        newValue: positionMarginUpdated,
        type: OutputType.Fiat,
      }),
      leverageDiffOutput: renderDiffOutput({
        withDiff: !!positionLeverageUpdated && positionLeverage !== positionLeverageUpdated,
        value: positionLeverage,
        newValue: positionLeverageUpdated,
        type: OutputType.Multiple,
        showSign: ShowSign.None,
      }),
    }),
    [
      crossFreeCollateral,
      crossFreeCollateralUpdated,
      crossMarginUsage,
      crossMarginUsageUpdated,
      positionMargin,
      positionMarginUpdated,
      positionLeverage,
      positionLeverageUpdated,
    ]
  );

  const formConfig =
    isolatedMarginAdjustmentType === IsolatedMarginAdjustmentType.Add
      ? {
          formLabel: stringGetter({ key: STRING_KEYS.AMOUNT_TO_ADD }),
          buttonLabel: stringGetter({ key: STRING_KEYS.ADD_MARGIN }),
          inputReceiptItems: [
            {
              key: 'cross-free-collateral',
              label: stringGetter({ key: STRING_KEYS.CROSS_FREE_COLLATERAL }),
              value: freeCollateralDiffOutput,
            },
            {
              key: 'cross-margin-usage',
              label: stringGetter({ key: STRING_KEYS.CROSS_MARGIN_USAGE }),
              value: marginUsageDiffOutput,
            },
          ],
          receiptItems: [
            {
              key: 'margin',
              label: stringGetter({ key: STRING_KEYS.POSITION_MARGIN }),
              value: positionMarginDiffOutput,
            },
            {
              key: 'leverage',
              label: stringGetter({ key: STRING_KEYS.POSITION_LEVERAGE }),
              value: leverageDiffOutput,
            },
          ],
        }
      : {
          formLabel: stringGetter({ key: STRING_KEYS.AMOUNT_TO_REMOVE }),
          buttonLabel: stringGetter({ key: STRING_KEYS.REMOVE_MARGIN }),
          inputReceiptItems: [
            {
              key: 'margin',
              label: stringGetter({ key: STRING_KEYS.POSITION_MARGIN }),
              value: positionMarginDiffOutput,
            },
            {
              key: 'leverage',
              label: stringGetter({ key: STRING_KEYS.POSITION_LEVERAGE }),
              value: leverageDiffOutput,
            },
          ],
          receiptItems: [
            {
              key: 'cross-free-collateral',
              label: stringGetter({ key: STRING_KEYS.CROSS_FREE_COLLATERAL }),
              value: freeCollateralDiffOutput,
            },
            {
              key: 'cross-margin-usage',
              label: stringGetter({ key: STRING_KEYS.CROSS_MARGIN_USAGE }),
              value: marginUsageDiffOutput,
            },
          ],
        };

  const gradientToColor = useMemo(() => {
    if (MustBigNumber(amount).isZero()) {
      return 'neutral';
    }

    if (isolatedMarginAdjustmentType === IsolatedMarginAdjustmentType.Add) {
      return 'positive';
    }

    if (isolatedMarginAdjustmentType === IsolatedMarginAdjustmentType.Remove) {
      return 'negative';
    }

    return 'neutral';
  }, [amount, isolatedMarginAdjustmentType]);

  const CenterElement = alertMessage ? (
    <AlertMessage type={alertMessage.type}>{alertMessage.message}</AlertMessage>
  ) : errorMessage ? (
    <AlertMessage type={AlertType.Error}>{errorMessage}</AlertMessage>
  ) : (
    <GradientCard
      fromColor="neutral"
      toColor={gradientToColor}
      tw="spacedRow h-4 items-center rounded-0.5 px-1 py-0.75"
    >
      <div tw="column font-small-medium">
        <span tw="text-color-text-0">{stringGetter({ key: STRING_KEYS.ESTIMATED })}</span>
        <span>{stringGetter({ key: STRING_KEYS.LIQUIDATION_PRICE })}</span>
      </div>
      <div>
        <DiffOutput
          withSubscript
          withDiff={
            !!liquidationPriceUpdated &&
            liquidationPrice !== liquidationPriceUpdated &&
            MustBigNumber(amount).gt(0)
          }
          sign={NumberSign.Negative}
          layout="column"
          value={liquidationPrice}
          newValue={liquidationPriceUpdated}
          type={OutputType.Fiat}
          fractionDigits={tickSizeDecimals}
        />
      </div>
    </GradientCard>
  );

  return (
    <$Form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <ToggleGroup
        size={ButtonSize.Small}
        value={isolatedMarginAdjustmentType?.name ?? IsolatedMarginAdjustmentType.Add.name}
        onValueChange={setMarginAction}
        items={[
          {
            value: IsolatedMarginAdjustmentType.Add.name,
            label: stringGetter({ key: STRING_KEYS.ADD_MARGIN }),
          },
          {
            value: IsolatedMarginAdjustmentType.Remove.name,
            label: stringGetter({ key: STRING_KEYS.REMOVE_MARGIN }),
          },
        ]}
      />

      <div tw="flexColumn gap-[0.56rem]">
        <$ToggleGroup
          items={objectEntries(SIZE_PERCENT_OPTIONS).map(([key, value]) => ({
            label: key,
            value: MustBigNumber(value).toFixed(PERCENT_DECIMALS),
          }))}
          value={MustBigNumber(amountPercent).toFixed(PERCENT_DECIMALS)}
          onValueChange={setPercent}
          shape={ButtonShape.Rectangle}
        />

        <WithDetailsReceipt side="bottom" detailItems={formConfig.inputReceiptItems}>
          <FormInput
            type={InputType.Currency}
            label={formConfig.formLabel}
            value={amount}
            onInput={setAmount}
          />
        </WithDetailsReceipt>
      </div>

      {CenterElement}

      <WithDetailsReceipt detailItems={formConfig.receiptItems}>
        <Button
          type={ButtonType.Submit}
          action={ButtonAction.Primary}
          disabled={isSubmitting || ctaErrorAction !== undefined}
          state={
            isSubmitting
              ? ButtonState.Loading
              : ctaErrorAction
                ? ButtonState.Disabled
                : ButtonState.Default
          }
          slotLeft={
            ctaErrorAction ? (
              <Icon iconName={IconName.Warning} tw="text-color-warning" />
            ) : undefined
          }
        >
          {ctaErrorAction ?? formConfig.buttonLabel}
        </Button>
      </WithDetailsReceipt>
    </$Form>
  );
};

const $Form = styled.form`
  ${formMixins.transfersForm}
`;
const $ToggleGroup = styled(ToggleGroup)`
  ${formMixins.inputToggleGroup}
`;
