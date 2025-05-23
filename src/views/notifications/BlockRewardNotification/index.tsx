import styled from 'styled-components';

import { STRING_KEYS } from '@/constants/localization';

import { useStringGetter } from '@/hooks/useStringGetter';

import { Details } from '@/components/Details';
import { Icon, IconName } from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import { Notification, NotificationProps } from '@/components/Notification';
import { Output, OutputType } from '@/components/Output';

type ElementProps = {
  amount: string;
  tokenName: string;
};

export type BlockRewardNotificationProps = NotificationProps & ElementProps;

export const BlockRewardNotification = ({
  isToast,
  amount,
  tokenName,
  notification,
}: BlockRewardNotificationProps) => {
  const stringGetter = useStringGetter();

  return (
    <Notification
      isToast={isToast}
      notification={notification}
      slotIcon={<Icon iconName={IconName.RewardStar} />}
      slotTitle={stringGetter({ key: STRING_KEYS.TRADING_REWARD_RECEIVED })}
      slotCustomContent={
        <$Details
          items={[
            {
              key: 'block_reward',
              label: stringGetter({ key: STRING_KEYS.BLOCK_REWARD }),
              value: <$Output type={OutputType.Asset} value={amount} tag={tokenName} />,
            },
          ]}
        />
      }
      tw="bg-[url('/dots-background-2.svg')] bg-cover"
    />
  );
};
const $Details = styled(Details)`
  --details-item-vertical-padding: 0;

  dd {
    color: var(--color-text-2);
  }
`;
const $Output = styled(Output)`
  &:before {
    content: '+';
    color: var(--color-success);
    margin-right: 0.5ch;
  }
`;
