import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BonsaiCore } from '@/bonsai/ontology';
import type { EncodeObject } from '@cosmjs/proto-signing';
import { type IndexedTx } from '@cosmjs/stargate';
import { Method } from '@cosmjs/tendermint-rpc';
import { type Nullable } from '@dydxprotocol/v4-abacus';
import { SubaccountClient, type LocalWallet } from '@dydxprotocol/v4-client-js';
import { useMutation } from '@tanstack/react-query';
import Long from 'long';
import { formatUnits, parseUnits } from 'viem';

import type {
  HumanReadableCancelOrderPayload,
  HumanReadablePlaceOrderPayload,
  HumanReadableSubaccountTransferPayload,
  HumanReadableTriggerOrdersPayload,
  ParsingError,
} from '@/constants/abacus';
import { AMOUNT_RESERVED_FOR_GAS_USDC, AMOUNT_USDC_BEFORE_REBALANCE } from '@/constants/account';
import { AnalyticsEvents, DEFAULT_TRANSACTION_MEMO, TransactionMemo } from '@/constants/analytics';
import { DialogTypes } from '@/constants/dialogs';
import { ErrorParams } from '@/constants/errors';
import { QUANTUM_MULTIPLIER } from '@/constants/numbers';
import { timeUnits } from '@/constants/time';
import { TradeTypes } from '@/constants/trade';
import { DydxAddress, WalletType } from '@/constants/wallets';

import { clearSubaccountState } from '@/state/account';
import { removeLatestReferrer } from '@/state/affiliates';
import { getLatestReferrer } from '@/state/affiliatesSelector';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { openDialog } from '@/state/dialogs';
import {
  cancelAllOrderFailed,
  cancelAllSubmitted,
  cancelOrderFailed,
  cancelOrderSubmitted,
  clearLocalOrders,
  closeAllPositionsSubmitted,
  placeOrderFailed,
  placeOrderSubmitted,
} from '@/state/localOrders';
import { selectPendingWithdraws } from '@/state/transfersSelectors';

import abacusStateManager from '@/lib/abacus';
import { parseToPrimitives } from '@/lib/abacus/parseToPrimitives';
import { track } from '@/lib/analytics/analytics';
import { getValidErrorParamsFromParsingError } from '@/lib/errors';
import { isTruthy } from '@/lib/isTruthy';
import { log } from '@/lib/telemetry';
import { hashFromTx } from '@/lib/txUtils';

import { useAccounts } from './useAccounts';
import { useDydxClient } from './useDydxClient';
import { useParameterizedSelector } from './useParameterizedSelector';
import { useReferredBy } from './useReferredBy';
import { useTokenConfigs } from './useTokenConfigs';

type SubaccountContextType = ReturnType<typeof useSubaccountContext>;
const SubaccountContext = createContext<SubaccountContextType>({} as SubaccountContextType);
SubaccountContext.displayName = 'Subaccount';

export const SubaccountProvider = ({ ...props }) => {
  const { localDydxWallet } = useAccounts();

  return (
    <SubaccountContext.Provider value={useSubaccountContext({ localDydxWallet })} {...props} />
  );
};

export const useSubaccount = () => useContext(SubaccountContext);

const useSubaccountContext = ({ localDydxWallet }: { localDydxWallet?: LocalWallet }) => {
  const dispatch = useAppDispatch();
  const { usdcDenom, usdcDecimals, chainTokenDecimals } = useTokenConfigs();
  const { sourceAccount } = useAccounts();
  const { compositeClient, faucetClient } = useDydxClient();

  const isKeplr = sourceAccount.walletInfo?.name === WalletType.Keplr;

  const { getFaucetFunds, getNativeTokens } = useMemo(
    () => ({
      getFaucetFunds: async ({
        dydxAddress,
        subaccountNumber,
      }: {
        dydxAddress: DydxAddress;
        subaccountNumber: number;
      }) => faucetClient?.fill(dydxAddress, subaccountNumber, 100),

      getNativeTokens: async ({ dydxAddress }: { dydxAddress: DydxAddress }) =>
        faucetClient?.fillNative(dydxAddress),
    }),
    [faucetClient]
  );

  const {
    depositToSubaccount,
    withdrawFromSubaccount,
    transferFromSubaccountToAddress,
    transferNativeToken,
    sendSkipWithdrawFromSubaccount,
  } = useMemo(
    () => ({
      depositToSubaccount: async ({
        subaccountClient,
        amount,
      }: {
        subaccountClient: SubaccountClient;
        assetId?: number;
        amount: number;
      }) => {
        try {
          return await compositeClient?.depositToSubaccount(
            subaccountClient,
            amount.toFixed(usdcDecimals),
            TransactionMemo.depositToSubaccount
          );
        } catch (error) {
          log('useSubaccount/depositToSubaccount', error);
          throw error;
        }
      },
      withdrawFromSubaccount: async ({
        subaccountClient,
        amount,
      }: {
        subaccountClient: SubaccountClient;
        amount: number;
      }) => {
        try {
          return await compositeClient?.withdrawFromSubaccount(
            subaccountClient,
            amount.toFixed(usdcDecimals),
            undefined,
            TransactionMemo.withdrawFromSubaccount
          );
        } catch (error) {
          log('useSubaccount/withdrawFromSubaccount', error);
          throw error;
        }
      },
      transferFromSubaccountToAddress: async ({
        subaccountClient,
        assetId = 0,
        amount,
        recipient,
      }: {
        subaccountClient: SubaccountClient;
        assetId?: number;
        amount: number;
        recipient: string;
      }) => {
        try {
          return await compositeClient?.validatorClient.post.send(
            subaccountClient.wallet,
            () =>
              new Promise((resolve) => {
                const msg =
                  compositeClient.validatorClient.post.composer.composeMsgWithdrawFromSubaccount(
                    subaccountClient.address,
                    subaccountClient.subaccountNumber,
                    assetId,
                    Long.fromNumber(amount * QUANTUM_MULTIPLIER),
                    recipient
                  );

                resolve([msg]);
              }),
            false,
            undefined,
            `${DEFAULT_TRANSACTION_MEMO} | transfer usdc to ${subaccountClient.address}`,
            Method.BroadcastTxCommit
          );
        } catch (error) {
          log('useSubaccount/transferFromSubaccountToAddress', error);
          throw error;
        }
      },

      transferNativeToken: async ({
        subaccountClient,
        amount,
        recipient,
        memo,
      }: {
        subaccountClient: SubaccountClient;
        amount: number;
        recipient: string;
        memo?: string;
      }) => {
        try {
          return await compositeClient?.validatorClient.post.send(
            subaccountClient.wallet,
            () =>
              new Promise((resolve) => {
                const msg = compositeClient.sendTokenMessage(
                  subaccountClient.wallet,
                  amount.toString(),
                  recipient
                );

                resolve([msg]);
              }),
            false,
            compositeClient.validatorClient.post.defaultDydxGasPrice,
            memo,
            Method.BroadcastTxCommit
          );
        } catch (error) {
          log('useSubaccount/transferNativeToken', error);
          throw error;
        }
      },

      sendSkipWithdrawFromSubaccount: async ({
        subaccountClient,
        amount,
        payload,
      }: {
        subaccountClient: SubaccountClient;
        amount: number;
        payload: string;
      }) => {
        if (!compositeClient) throw new Error('client not initialized');
        try {
          const transaction = JSON.parse(payload);

          const msg = compositeClient.withdrawFromSubaccountMessage(
            subaccountClient,
            amount.toFixed(usdcDecimals)
          );
          const ibcMsg: EncodeObject = {
            typeUrl: transaction.msgTypeUrl,
            value: {
              ...transaction.msg,
              timeoutTimestamp: transaction.msg.timeoutTimestamp
                ? // Signer expects BigInt but the payload types the value as string
                  BigInt(Long.fromValue(transaction.msg.timeoutTimestamp).toString())
                : undefined,
            },
          };

          return await compositeClient.send(
            subaccountClient.wallet,
            () => Promise.resolve([msg, ibcMsg]),
            false,
            undefined,
            TransactionMemo.withdrawFromAccount
          );
        } catch (error) {
          // Reset the default options after the tx is sent.
          if (isKeplr && window.keplr) {
            window.keplr.defaultOptions = {};
          }
          log('useSubaccount/sendSkipWithdrawFromSubaccount', error);
          throw error;
        }
      },
    }),
    [compositeClient, isKeplr, usdcDecimals]
  );

  const [subaccountNumber] = useState(0);

  useEffect(() => {
    abacusStateManager.setSubaccountNumber(subaccountNumber);
  }, [subaccountNumber]);

  const subaccountClient = useMemo(
    () => (localDydxWallet ? new SubaccountClient(localDydxWallet, subaccountNumber) : undefined),
    [localDydxWallet, subaccountNumber]
  );

  const dydxAddress = localDydxWallet?.address as DydxAddress;

  useEffect(() => {
    dispatch(clearSubaccountState());
    dispatch(clearLocalOrders());
  }, [dispatch, dydxAddress]);

  // ------ Deposit/Withdraw Methods ------ //
  const pendingWithdraws = useParameterizedSelector(selectPendingWithdraws, dydxAddress);
  const hasPendingWithdraws = useMemo(() => {
    if (pendingWithdraws.length > 0) {
      const idleTimes = pendingWithdraws.reduce((acc, w) => {
        if (w.transactions.some((t) => t.status === 'idle')) {
          if (w.updatedAt) {
            return [...acc, w.updatedAt];
          }
        }

        return acc;
      }, [] as number[]);

      return idleTimes.some((t) => t > Date.now() - 10 * timeUnits.minute);
    }

    return false;
  }, [pendingWithdraws]);

  const rebalanceWalletFunds = useCallback(
    async (balance: string) => {
      if (!subaccountClient) return;
      const balanceAmount = parseFloat(balance);
      const shouldDeposit = balanceAmount - AMOUNT_RESERVED_FOR_GAS_USDC > 0;
      const shouldWithdraw = balanceAmount - AMOUNT_USDC_BEFORE_REBALANCE <= 0;
      if (shouldDeposit && !hasPendingWithdraws) {
        await depositToSubaccount({
          amount: balanceAmount - AMOUNT_RESERVED_FOR_GAS_USDC,
          subaccountClient,
        });
      } else if (shouldWithdraw) {
        await withdrawFromSubaccount({
          amount: AMOUNT_RESERVED_FOR_GAS_USDC - balanceAmount,
          subaccountClient,
        });
      }
    },
    [subaccountClient, depositToSubaccount, withdrawFromSubaccount, hasPendingWithdraws]
  );

  const balances = useAppSelector(BonsaiCore.account.balances.data);
  const usdcCoinBalance = balances.usdcAmount;

  useEffect(() => {
    if (usdcCoinBalance && !isKeplr) {
      rebalanceWalletFunds(usdcCoinBalance);
    }
  }, [usdcCoinBalance, rebalanceWalletFunds, isKeplr]);

  const [showDepositDialog, setShowDepositDialog] = useState(true);

  useEffect(() => {
    if (isKeplr && usdcCoinBalance) {
      if (showDepositDialog) {
        const balanceAmount = parseFloat(usdcCoinBalance);
        const usdcBalance = balanceAmount - AMOUNT_RESERVED_FOR_GAS_USDC;
        const shouldDeposit = usdcBalance > 0 && usdcBalance.toFixed(2) !== '0.00';
        if (shouldDeposit) {
          dispatch(
            openDialog(
              DialogTypes.ConfirmPendingDeposit({
                usdcBalance,
              })
            )
          );
        }
      }
      setShowDepositDialog(false);
    }
  }, [isKeplr, usdcCoinBalance, showDepositDialog, dispatch]);

  const deposit = useCallback(
    async (amount: number) => {
      if (!subaccountClient) {
        return undefined;
      }

      return depositToSubaccount({ subaccountClient, amount });
    },
    [subaccountClient, depositToSubaccount]
  );

  const depositCurrentBalance = useCallback(async () => {
    const currentBalance = (
      await compositeClient?.validatorClient.get.getAccountBalance(dydxAddress as string, usdcDenom)
    )?.amount;

    if (!currentBalance) throw new Error('Failed to get current balance');

    const balanceAmount = formatUnits(BigInt(currentBalance), usdcDecimals);

    const depositAmount = parseFloat(balanceAmount) - AMOUNT_RESERVED_FOR_GAS_USDC;

    if (depositAmount > 0) {
      await deposit(depositAmount);
    }
  }, [usdcDecimals, compositeClient, dydxAddress, usdcDenom, deposit]);

  const withdraw = useCallback(
    async (amount: number) => {
      if (!subaccountClient) {
        return undefined;
      }

      return withdrawFromSubaccount({ subaccountClient, amount });
    },
    [subaccountClient, withdrawFromSubaccount]
  );

  // ------ Transfer Methods ------ //

  const transfer = useCallback(
    async (amount: number, recipient: string, coinDenom: string, memo?: string) => {
      if (!subaccountClient) {
        return undefined;
      }
      return (await (coinDenom === usdcDenom
        ? transferFromSubaccountToAddress({ subaccountClient, amount, recipient })
        : transferNativeToken({ subaccountClient, amount, recipient, memo }))) as IndexedTx;
    },
    [subaccountClient, transferFromSubaccountToAddress, transferNativeToken, usdcDenom]
  );

  const sendSkipWithdraw = useCallback(
    async (amount: number, payload: string, isCctp?: boolean) => {
      const cctpWithdraw = () => {
        return new Promise<string>((resolve, reject) => {
          abacusStateManager.cctpWithdraw((success, error, data) => {
            const parsedData = JSON.parse(data);
            // eslint-disable-next-line eqeqeq
            if (success && parsedData?.code == 0) {
              resolve(parsedData?.transactionHash);
            } else {
              reject(error);
            }
          });
        });
      };
      if (isCctp) {
        return cctpWithdraw();
      }

      if (!subaccountClient) {
        return undefined;
      }

      // If the dYdX USDC balance is less than the amount to IBC transfer, the signature cannot be made,
      // so disable the balance check only for this tx.
      if (isKeplr && window.keplr) {
        window.keplr.defaultOptions = {
          sign: {
            disableBalanceCheck: true,
          },
        };
      }
      const tx = await sendSkipWithdrawFromSubaccount({ subaccountClient, amount, payload });

      // Reset the default options after the tx is sent.
      if (isKeplr && window.keplr) {
        window.keplr.defaultOptions = {};
      }
      return hashFromTx(tx.hash);
    },
    [subaccountClient, sendSkipWithdrawFromSubaccount, isKeplr]
  );

  const adjustIsolatedMarginOfPosition = useCallback(
    ({
      onError,
      onSuccess,
    }: {
      onError?: (onErrorParams: ErrorParams) => void;
      onSuccess?: (
        subaccountTransferPayload?: Nullable<HumanReadableSubaccountTransferPayload>
      ) => void;
    }) => {
      const callback = (
        success: boolean,
        parsingError?: Nullable<ParsingError>,
        data?: Nullable<HumanReadableSubaccountTransferPayload>
      ) => {
        if (success) {
          onSuccess?.(data);
        } else {
          onError?.(getValidErrorParamsFromParsingError(parsingError));
        }
      };

      const subaccountTransferPayload = abacusStateManager.adjustIsolatedMarginOfPosition(callback);
      return subaccountTransferPayload;
    },
    []
  );

  // ------ Faucet Methods ------ //
  const requestFaucetFunds = useCallback(async () => {
    try {
      if (!dydxAddress) throw new Error('dydxAddress is not connected');

      await Promise.all([
        getFaucetFunds({ dydxAddress, subaccountNumber }),
        getNativeTokens({ dydxAddress }),
      ]);
    } catch (error) {
      log('useSubaccount/getFaucetFunds', error);
      throw error;
    }
  }, [dydxAddress, getFaucetFunds, getNativeTokens, subaccountNumber]);

  // ------ Trading Methods ------ //
  const placeOrder = useCallback(
    ({
      isClosePosition = false,
      onError,
      onSuccess,
    }: {
      isClosePosition?: boolean;
      onError?: (onErrorParams: ErrorParams) => void;
      onSuccess?: (placeOrderPayload: Nullable<HumanReadablePlaceOrderPayload>) => void;
    }) => {
      const callback = (
        success: boolean,
        parsingError?: Nullable<ParsingError>,
        data?: Nullable<HumanReadablePlaceOrderPayload>
      ) => {
        if (success) {
          onSuccess?.(data);
        } else {
          const errorParams = getValidErrorParamsFromParsingError(parsingError);
          onError?.(errorParams);

          if (data?.clientId !== undefined) {
            dispatch(
              placeOrderFailed({
                clientId: data.clientId,
                errorParams,
              })
            );
          }
        }
      };

      let placeOrderParams;

      if (isClosePosition) {
        placeOrderParams = abacusStateManager.closePosition(callback);
      } else {
        placeOrderParams = abacusStateManager.placeOrder(callback);
      }

      if (placeOrderParams?.clientId) {
        dispatch(
          placeOrderSubmitted({
            marketId: placeOrderParams.marketId,
            clientId: placeOrderParams.clientId,
            orderType: placeOrderParams.type as TradeTypes,
          })
        );
      }

      return placeOrderParams;
    },
    [dispatch]
  );

  const closePosition = useCallback(
    ({
      onError,
      onSuccess,
    }: {
      onError: (onErrorParams: ErrorParams) => void;
      onSuccess?: (placeOrderPayload: Nullable<HumanReadablePlaceOrderPayload>) => void;
    }) => placeOrder({ isClosePosition: true, onError, onSuccess }),
    [placeOrder]
  );

  const cancelOrder = useCallback(
    ({
      orderId,
      onError,
      onSuccess,
    }: {
      orderId: string;
      onError?: (onErrorParams: ErrorParams) => void;
      onSuccess?: () => void;
    }) => {
      const callback = (success: boolean, parsingError?: Nullable<ParsingError>) => {
        if (success) {
          onSuccess?.();
        } else {
          const errorParams = getValidErrorParamsFromParsingError(parsingError);
          dispatch(
            cancelOrderFailed({
              orderId,
              errorParams,
            })
          );
          onError?.(errorParams);
        }
      };

      dispatch(cancelOrderSubmitted(orderId));
      abacusStateManager.cancelOrder(orderId, callback);
    },
    [dispatch]
  );

  const openOrders = useAppSelector(BonsaiCore.account.openOrders.data);

  // when marketId is provided, only cancel orders for that market, otherwise cancel globally
  const cancelAllOrders = useCallback(
    (marketId?: string) => {
      // this is for each single cancel transaction
      const callback = (
        success: boolean,
        parsingError?: Nullable<ParsingError>,
        data?: Nullable<HumanReadableCancelOrderPayload>
      ) => {
        const matchedOrder = openOrders.find((order) => order.id === data?.orderId);
        // ##OrderOnlyConfirmedCancelViaIndexer: success here does not necessarily mean orders are successfully canceled,
        // we use indexer response as source of truth on whether the order is actually canceled
        if (!success) {
          const errorParams = getValidErrorParamsFromParsingError(parsingError);
          if (matchedOrder) {
            dispatch(
              cancelAllOrderFailed({
                order: matchedOrder,
                errorParams,
              })
            );
          }
        }
      };

      const orderIds = abacusStateManager.getCancelableOrderIds(marketId);
      dispatch(cancelAllSubmitted({ marketId, orderIds }));
      abacusStateManager.cancelAllOrders(marketId, callback);
    },
    [dispatch, openOrders]
  );

  const closeAllPositions = useCallback(() => {
    // this is for each single close position / place order transaction
    const callback = (
      success: boolean,
      parsingError?: Nullable<ParsingError>,
      data?: Nullable<HumanReadablePlaceOrderPayload>
    ) => {
      if (!success) {
        const errorParams = getValidErrorParamsFromParsingError(parsingError);
        if (data?.clientId !== undefined) {
          dispatch(
            placeOrderFailed({
              clientId: data.clientId,
              errorParams,
            })
          );
        }
      }
    };

    const payload = abacusStateManager.closeAllPositions(callback);
    if (payload) {
      dispatch(
        closeAllPositionsSubmitted(
          payload.payloads.toArray().map((orderPayload) => orderPayload.clientId)
        )
      );
    }
  }, [dispatch]);

  // ------ Trigger Orders Methods ------ //
  const placeTriggerOrders = useCallback(
    async ({
      onError,
      onSuccess,
    }: {
      onError?: (onErrorParams: ErrorParams) => void;
      onSuccess?: () => void;
    } = {}) => {
      const callback = (
        success: boolean,
        parsingError?: Nullable<ParsingError>,
        data?: Nullable<HumanReadableTriggerOrdersPayload>
      ) => {
        const placeOrderPayloads = data?.placeOrderPayloads.toArray() ?? [];
        const cancelOrderPayloads = data?.cancelOrderPayloads.toArray() ?? [];

        if (success) {
          // #OrderOnlyConfirmedCancelViaIndexer
          // even though trigger orders are probably confirmed canceled, we use indexer as source of truth to trigger order status toast
          onSuccess?.();
        } else {
          const errorParams = getValidErrorParamsFromParsingError(parsingError);
          onError?.(errorParams);

          placeOrderPayloads.forEach((payload: HumanReadablePlaceOrderPayload) => {
            dispatch(
              placeOrderFailed({
                clientId: payload.clientId,
                errorParams,
              })
            );
          });

          cancelOrderPayloads.forEach((payload: HumanReadableCancelOrderPayload) => {
            dispatch(
              cancelOrderFailed({
                orderId: payload.orderId,
                errorParams,
              })
            );
          });
        }
      };

      const triggerOrderParams = abacusStateManager.triggerOrders(callback);

      triggerOrderParams?.placeOrderPayloads
        .toArray()
        .forEach((payload: HumanReadablePlaceOrderPayload) => {
          dispatch(
            placeOrderSubmitted({
              marketId: payload.marketId,
              clientId: payload.clientId,
              orderType: payload.type as TradeTypes,
            })
          );
        });

      triggerOrderParams?.cancelOrderPayloads
        .toArray()
        .forEach((payload: HumanReadableCancelOrderPayload) => {
          dispatch(cancelOrderSubmitted(payload.orderId));
        });

      return triggerOrderParams;
    },
    [dispatch]
  );

  // ------ Listing Method ------ //
  const createPermissionlessMarket = useCallback(
    async (ticker: string) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      } else if (!subaccountClient?.address) {
        throw new Error('wallet not initialized');
      }

      track(AnalyticsEvents.LaunchMarketTransaction({ marketId: ticker }));

      const response = await compositeClient.createMarketPermissionless(
        subaccountClient,
        ticker,
        undefined,
        undefined,
        TransactionMemo.launchMarket
      );

      return response;
    },
    [compositeClient, subaccountClient]
  );

  // ------ Staking Methods ------ //
  const delegate = useCallback(
    async (validator: string, amount: number) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!subaccountClient?.wallet.address) {
        throw new Error('wallet not initialized');
      }

      const response = await compositeClient.validatorClient.post.delegate(
        subaccountClient,
        subaccountClient.wallet.address,
        validator,
        parseUnits(amount.toString(), chainTokenDecimals).toString(),
        Method.BroadcastTxCommit
      );

      return response;
    },
    [subaccountClient, compositeClient, chainTokenDecimals]
  );

  const getDelegateFee = useCallback(
    async (validator: string, amount: number) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!localDydxWallet?.address) {
        throw new Error('wallet not initialized');
      }

      const tx = await compositeClient.simulate(
        localDydxWallet,
        () =>
          Promise.resolve([
            compositeClient.validatorClient.post.delegateMsg(
              localDydxWallet.address ?? '',
              validator,
              parseUnits(amount.toString(), chainTokenDecimals).toString()
            ),
          ]),
        compositeClient.validatorClient.post.defaultDydxGasPrice
      );

      return tx;
    },
    [localDydxWallet, compositeClient, chainTokenDecimals]
  );

  const undelegate = useCallback(
    async (amounts: Record<string, number | undefined>) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!localDydxWallet) {
        throw new Error('wallet not initialized');
      }

      const msgs = Object.keys(amounts)
        .map((validator) => {
          const amount = amounts[validator];
          if (!amount) {
            return undefined;
          }
          return compositeClient.validatorClient.post.undelegateMsg(
            localDydxWallet.address ?? '',
            validator,
            parseUnits(amount.toString(), chainTokenDecimals).toString()
          );
        })
        .filter(isTruthy);

      const tx = await compositeClient.send(
        localDydxWallet,
        () => Promise.resolve(msgs),
        false,
        compositeClient.validatorClient.post.defaultDydxGasPrice,
        undefined,
        Method.BroadcastTxCommit
      );

      return tx;
    },
    [localDydxWallet, compositeClient, chainTokenDecimals]
  );

  const getUndelegateFee = useCallback(
    async (amounts: Record<string, number | undefined>) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!localDydxWallet) {
        throw new Error('wallet not initialized');
      }

      const msgs = Object.keys(amounts)
        .map((validator) => {
          const amount = amounts[validator];
          if (!amount) {
            return undefined;
          }
          return compositeClient.validatorClient.post.undelegateMsg(
            localDydxWallet.address ?? '',
            validator,
            parseUnits(amount.toString(), chainTokenDecimals).toString()
          );
        })
        .filter(isTruthy);

      const tx = await compositeClient.simulate(
        localDydxWallet,
        () => Promise.resolve(msgs),
        compositeClient.validatorClient.post.defaultDydxGasPrice
      );

      return tx;
    },
    [localDydxWallet, compositeClient, chainTokenDecimals]
  );

  const withdrawReward = useCallback(
    async (validators: string[]) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!localDydxWallet) {
        throw new Error('wallet not initialized');
      }

      const msgs = validators
        .map((validator) => {
          return compositeClient.validatorClient.post.withdrawDelegatorRewardMsg(
            localDydxWallet.address ?? '',
            validator
          );
        })
        .filter(isTruthy);

      const tx = await compositeClient.send(
        localDydxWallet,
        () => Promise.resolve(msgs),
        false,
        compositeClient.validatorClient.post.defaultGasPrice,
        undefined,
        Method.BroadcastTxCommit
      );

      return tx;
    },
    [localDydxWallet, compositeClient]
  );

  const getWithdrawRewardFee = useCallback(
    async (validators: string[]) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!localDydxWallet) {
        throw new Error('wallet not initialized');
      }

      const msgs = validators
        .map((validator) => {
          return compositeClient.validatorClient.post.withdrawDelegatorRewardMsg(
            localDydxWallet.address ?? '',
            validator
          );
        })
        .filter(isTruthy);

      const tx = await compositeClient.simulate(
        localDydxWallet,
        () => Promise.resolve(msgs),
        compositeClient.validatorClient.post.defaultGasPrice
      );

      return tx;
    },
    [localDydxWallet, compositeClient]
  );

  const registerAffiliate = useCallback(
    async (affiliate: string) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (!subaccountClient?.wallet.address) {
        throw new Error('wallet not initialized');
      }
      if (affiliate === subaccountClient.wallet.address) {
        throw new Error('affiliate can not be the same as referree');
      }
      try {
        const response = await compositeClient.validatorClient.post.registerAffiliate(
          subaccountClient,
          affiliate
        );
        return response;
      } catch (error) {
        log('useSubaccount/registerAffiliate', error);
        throw error;
      }
    },
    [subaccountClient, compositeClient]
  );

  const latestReferrer = useAppSelector(getLatestReferrer);
  const { data: referredBy, isFetched: isReferredByFetched } = useReferredBy();

  const { mutateAsync: registerAffiliateMutate, isPending: isRegisterAffiliatePending } =
    useMutation({
      mutationFn: async (affiliateAddress: string) => {
        const tx = await registerAffiliate(affiliateAddress);
        dispatch(removeLatestReferrer());
        track(AnalyticsEvents.AffiliateRegistration({ affiliateAddress }));
        return tx;
      },
    });

  useEffect(() => {
    if (!subaccountClient) return;

    if (dydxAddress === latestReferrer) {
      dispatch(removeLatestReferrer());
      return;
    }
    if (
      compositeClient &&
      latestReferrer &&
      dydxAddress &&
      usdcCoinBalance &&
      parseFloat(usdcCoinBalance) > AMOUNT_USDC_BEFORE_REBALANCE &&
      isReferredByFetched &&
      !referredBy?.affiliateAddress &&
      !isRegisterAffiliatePending
    ) {
      registerAffiliateMutate(latestReferrer);
    }
  }, [
    compositeClient,
    latestReferrer,
    dydxAddress,
    registerAffiliateMutate,
    usdcCoinBalance,
    subaccountClient,
    isReferredByFetched,
    referredBy?.affiliateAddress,
    dispatch,
    isRegisterAffiliatePending,
  ]);

  useEffect(() => {
    if (referredBy?.affiliateAddress && latestReferrer) {
      dispatch(removeLatestReferrer());
    }
  }, [referredBy?.affiliateAddress, dispatch, latestReferrer]);

  const getVaultAccountInfo = useCallback(async () => {
    if (!compositeClient?.validatorClient) {
      throw new Error('client not initialized');
    }
    const result = await compositeClient.validatorClient.get.getMegavaultOwnerShares(dydxAddress);
    if (result == null) {
      return result;
    }
    return parseToPrimitives(result);
  }, [compositeClient?.validatorClient, dydxAddress]);

  const depositToMegavault = useCallback(
    async (amount: number) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (subaccountClient == null) {
        throw new Error('local wallet client not initialized');
      }

      return compositeClient.depositToMegavault(subaccountClient, amount, Method.BroadcastTxCommit);
    },
    [compositeClient, subaccountClient]
  );

  const withdrawFromMegavault = useCallback(
    async (shares: number, minAmount: number) => {
      if (!compositeClient) {
        throw new Error('client not initialized');
      }
      if (subaccountClient == null) {
        throw new Error('local wallet client not initialized');
      }
      return compositeClient.withdrawFromMegavault(
        subaccountClient,
        shares,
        minAmount,
        Method.BroadcastTxCommit
      );
    },
    [compositeClient, subaccountClient]
  );

  return {
    // Deposit/Withdraw/Faucet Methods
    deposit,
    withdraw,
    requestFaucetFunds,

    // Transfer Methods
    transfer,
    sendSkipWithdraw,
    adjustIsolatedMarginOfPosition,
    depositCurrentBalance,

    // Trading Methods
    placeOrder,
    closePosition,
    closeAllPositions,
    cancelOrder,
    cancelAllOrders,
    placeTriggerOrders,

    // Listing Methods
    createPermissionlessMarket,

    // Staking methods
    delegate,
    getDelegateFee,
    undelegate,
    getUndelegateFee,
    withdrawReward,
    getWithdrawRewardFee,

    // affiliates
    registerAffiliate,
    referredBy: referredBy?.affiliateAddress,

    // vaults
    getVaultAccountInfo,
    depositToMegavault,
    withdrawFromMegavault,
  };
};
