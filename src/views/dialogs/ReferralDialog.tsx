import { useEffect } from 'react';

import { styled } from 'twin.macro';

import { AFFILIATES_FEE_DISCOUNT_USD } from '@/constants/affiliates';
import { ButtonAction, ButtonSize } from '@/constants/buttons';
import { DialogProps, ReferralDialogProps } from '@/constants/dialogs';
import { STRING_KEYS } from '@/constants/localization';

import { useAccounts } from '@/hooks/useAccounts';
import { useAffiliatesInfo } from '@/hooks/useAffiliatesInfo';
import { useReferralAddress } from '@/hooks/useReferralAddress';
import { useReferredBy } from '@/hooks/useReferredBy';
import { useStringGetter } from '@/hooks/useStringGetter';

import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { Link } from '@/components/Link';

import { truncateAddress } from '@/lib/wallet';

import { OnboardingTriggerButton } from './OnboardingTriggerButton';

const CONTENT_SECTIONS = [
  {
    header: STRING_KEYS.LIGHTNING_FAST,
    description: STRING_KEYS.LIGHTNING_FAST_DISCRIPTION,
  },
  {
    header: STRING_KEYS.TRADE_ANYTHING,
    description: STRING_KEYS.TRADE_ANYTHING_DISCRIPTION,
  },
  {
    header: STRING_KEYS.EARN_USDC,
    description: STRING_KEYS.EARN_USDC_DISCRIPTION,
  },
];

export const ReferralDialog = ({ setIsOpen, refCode }: DialogProps<ReferralDialogProps>) => {
  const stringGetter = useStringGetter();
  const { dydxAddress } = useAccounts();

  const {
    data: referralAddress,
    isPending: isReferralAddressPending,
    isFetched: isReferralAddressFetched,
  } = useReferralAddress(refCode);

  const {
    affiliateMetadataQuery: { data: affiliatesInfo, isSuccess: isAffiliatesInfoSuccess },
  } = useAffiliatesInfo(referralAddress);

  const { data: referredBy, isPending: isReferredByPending } = useReferredBy();
  const isNotEligible = isAffiliatesInfoSuccess && !affiliatesInfo.isEligible;
  const isOwnReferralCode = isReferralAddressFetched && referralAddress === dydxAddress;
  const invalidReferralCode = isReferralAddressFetched && !referralAddress;

  useEffect(() => {
    // User has already registered a referral or is using their own referral
    if (Boolean(referredBy?.affiliateAddress) || isOwnReferralCode) {
      setIsOpen(false);
    }
  }, [referredBy?.affiliateAddress, setIsOpen, isOwnReferralCode]);

  if (
    isReferralAddressPending ||
    !!(dydxAddress && isReferredByPending) ||
    !!referredBy?.affiliateAddress ||
    isOwnReferralCode
  ) {
    return null;
  }

  return (
    <Dialog
      isOpen
      setIsOpen={setIsOpen}
      withClose={false}
      title={
        <span tw="flex flex-row items-end gap-[0.5ch]">
          {!isNotEligible && !invalidReferralCode ? (
            <>
              <span tw="text-color-text-1">{refCode}</span>
              <span tw="mb-0.25 text-color-text-0 font-small-book">
                ({truncateAddress(referralAddress)})
              </span>
            </>
          ) : (
            stringGetter({
              key: STRING_KEYS.WELCOME_DYDX,
            })
          )}
        </span>
      }
      description={stringGetter({
        key:
          !isNotEligible && !invalidReferralCode
            ? STRING_KEYS.INVITED_YOU
            : STRING_KEYS.THE_PRO_TRADING_PLATFORM,
      })}
      slotHeaderAbove={
        <$HeaderAbove tw="flex flex-row items-center gap-1">
          {!invalidReferralCode ? (
            <img src="/hedgies-placeholder.png" alt="hedgie" tw="h-5" />
          ) : (
            <div tw="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[100%] bg-color-layer-1">
              <div tw="flex h-2.5 w-2.5 items-center justify-center rounded-[100%] bg-color-text-0 text-color-layer-1 font-large-book">
                !
              </div>
            </div>
          )}
          <div tw="row">
            <$Triangle />
            <div tw="inline-block rounded-0.5 bg-color-layer-6 px-1 py-0.5 text-color-text-2">
              {!invalidReferralCode ? (
                <span>
                  {stringGetter({
                    key: STRING_KEYS.REFER_FOR_DISCOUNTS_FIRST_ORDER,
                    params: {
                      AMOUNT_USD: (
                        <span tw="text-color-success">
                          ${AFFILIATES_FEE_DISCOUNT_USD.toLocaleString()}
                        </span>
                      ),
                    },
                  })}{' '}
                  🤑
                </span>
              ) : (
                <span>
                  {stringGetter({
                    key: STRING_KEYS.COULD_NOT_FIND_AFFILIATE,
                  })}
                </span>
              )}
            </div>
          </div>
        </$HeaderAbove>
      }
    >
      <div tw="flex flex-col gap-2">
        <div tw="flex flex-col gap-1.5">
          {CONTENT_SECTIONS.map(({ header, description }, index) => (
            <div key={header} tw="flex flex-row items-center gap-1">
              <div tw="flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-[100%] bg-color-layer-5">
                <span tw="font-medium text-color-text-1">{index + 1}</span>
              </div>
              <div tw="flex flex-col">
                <div tw="font-medium-book">{stringGetter({ key: header })}</div>
                <div tw="text-color-text-0 font-base-book">
                  {stringGetter({ key: description })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div tw="flex flex-col items-center gap-0.5">
          {!dydxAddress ? (
            <OnboardingTriggerButton
              tw="w-full"
              size={ButtonSize.Medium}
              onClick={() => {
                setIsOpen(false);
              }}
            />
          ) : (
            <Button
              action={ButtonAction.Primary}
              size={ButtonSize.Medium}
              onClick={() => {
                setIsOpen(false);
              }}
              tw="w-full"
            >
              {stringGetter({ key: STRING_KEYS.TRADE_NOW })}
            </Button>
          )}
          <div tw="text-color-text-0 font-base-book">
            {stringGetter({
              key: STRING_KEYS.ALL_REWARDS_DYDX_COMMUNITY,
              params: {
                // TODO(affiliates): Add link to DYDX community
                DYDX_COMMUNITY_LINK: (
                  <Link isInline>{stringGetter({ key: STRING_KEYS.DYDX_COMMUNITY })}</Link>
                ),
              },
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const $HeaderAbove = styled.div`
  padding: var(--dialog-header-paddingTop) var(--dialog-header-paddingRight) 0
    var(--dialog-header-paddingLeft);
`;

const $Triangle = styled.div`
  width: 0;
  height: 0;

  border-top: 0.5rem solid transparent;
  border-bottom: 0.5rem solid transparent;
  border-right: 0.5rem solid var(--color-layer-6);
`;
