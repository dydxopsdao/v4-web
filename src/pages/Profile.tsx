import { BonsaiHooks } from '@/bonsai/ontology';
import { Link as ReactLink, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { useEnsName } from 'wagmi';

import { OnboardingState } from '@/constants/account';
import { ButtonSize } from '@/constants/buttons';
import { DialogTypes } from '@/constants/dialogs';
import { STRING_KEYS } from '@/constants/localization';
import { AppRoute, HistoryRoute, PortfolioRoute } from '@/constants/routes';
import { ConnectorType, EvmAddress, WalletNetworkType, wallets } from '@/constants/wallets';

import { useAccounts } from '@/hooks/useAccounts';
import { useComplianceState } from '@/hooks/useComplianceState';
import { useEnvConfig } from '@/hooks/useEnvConfig';
import { useStringGetter } from '@/hooks/useStringGetter';
import { useTokenConfigs } from '@/hooks/useTokenConfigs';

import breakpoints from '@/styles/breakpoints';
import { layoutMixins } from '@/styles/layoutMixins';

import { AssetIcon } from '@/components/AssetIcon';
import { Details } from '@/components/Details';
import { Icon, IconName } from '@/components/Icon';
import { IconButton, type IconButtonProps } from '@/components/IconButton';
import { Link } from '@/components/Link';
import { Output, OutputType } from '@/components/Output';
import { Panel } from '@/components/Panel';
import { Toolbar } from '@/components/Toolbar';
import { FillsTable, FillsTableColumnKey } from '@/views/tables/FillsTable';

import { getOnboardingState } from '@/state/accountSelectors';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { openDialog } from '@/state/dialogs';

import { isTruthy } from '@/lib/isTruthy';
import { truncateAddress } from '@/lib/wallet';

import { GovernancePanel } from './token/GovernancePanel';
import { LaunchIncentivesPanel } from './token/LaunchIncentivesPanel';
import { MigratePanel } from './token/MigratePanel';
import { StakingPanel } from './token/StakingPanel';

const ENS_CHAIN_ID = 1; // Ethereum

type Action = {
  key: string;
  label: string;
  icon: IconButtonProps;
  state?: IconButtonProps['state'];
  href?: string;
  onClick?: () => void;
};

const Profile = () => {
  const stringGetter = useStringGetter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const deployerName = useEnvConfig('deployerName');

  const onboardingState = useAppSelector(getOnboardingState);
  const isConnected = onboardingState !== OnboardingState.Disconnected;

  const { sourceAccount, dydxAddress } = useAccounts();
  const { chainTokenImage, chainTokenLabel } = useTokenConfigs();
  const { disableConnectButton } = useComplianceState();
  const currentWeekTradingReward = BonsaiHooks.useHistoricalTradingRewardsWeekly().data;

  const { data: ensName } = useEnsName({
    address:
      sourceAccount.chain === WalletNetworkType.Evm
        ? (sourceAccount.address as EvmAddress)
        : undefined,
    chainId: ENS_CHAIN_ID,
  });

  const actions: Action[] = [
    {
      key: 'deposit',
      label: stringGetter({ key: STRING_KEYS.DEPOSIT }),
      icon: { iconName: IconName.Deposit },
      onClick: () => {
        dispatch(openDialog(DialogTypes.Deposit2({})));
      },
    },
    {
      key: 'withdraw',
      label: stringGetter({ key: STRING_KEYS.WITHDRAW }),
      icon: { iconName: IconName.Withdraw },
      onClick: () => {
        dispatch(openDialog(DialogTypes.Withdraw2({})));
      },
    },
    {
      key: 'transfer',
      label: stringGetter({ key: STRING_KEYS.TRANSFER }),
      icon: { iconName: IconName.Send },
      onClick: () => {
        dispatch(openDialog(DialogTypes.Transfer({})));
      },
    },
    isConnected
      ? {
          key: 'sign-out',
          label: stringGetter({ key: STRING_KEYS.SIGN_OUT }),
          icon: { iconName: IconName.Close },
          onClick: () => {
            dispatch(openDialog(DialogTypes.DisconnectWallet()));
          },
        }
      : {
          key: 'connect',
          label: stringGetter({ key: STRING_KEYS.CONNECT }),
          icon: { iconName: IconName.Transfer },
          state: { isDisabled: disableConnectButton },
          onClick: () => {
            dispatch(openDialog(DialogTypes.Onboarding()));
          },
        },
  ].filter(isTruthy);

  return (
    <$MobileProfileLayout>
      <header tw="row px-1 py-0 [grid-area:header]">
        <$ProfileIcon />
        <div>
          <h1 tw="font-extra-medium">
            {isConnected ? ensName ?? truncateAddress(dydxAddress) : '-'}
          </h1>
          {isConnected && sourceAccount.walletInfo ? (
            <$SubHeader>
              <$ConnectedIcon />
              <span>{stringGetter({ key: STRING_KEYS.CONNECTED_TO })}</span>
              <span>
                {sourceAccount.walletInfo.connectorType === ConnectorType.Injected
                  ? sourceAccount.walletInfo.name
                  : stringGetter({
                      key: wallets[sourceAccount.walletInfo.name as keyof typeof wallets].stringKey,
                    })}
              </span>
            </$SubHeader>
          ) : (
            <span>-</span>
          )}
        </div>
      </header>
      <$Actions withSeparators={false}>
        {actions.map(({ key, label, href, icon, state, onClick }) => {
          const action = (
            <>
              <$ActionButton {...icon} size={ButtonSize.Large} onClick={onClick} state={state} />
              <span>{label}</span>
            </>
          );
          return href ? (
            <ReactLink to={href} key={key}>
              {action}
            </ReactLink>
          ) : (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label key={key}>{action}</label>
          );
        })}
      </$Actions>

      <$PanelButton
        slotHeader={
          <$InlineRow>
            <Icon iconName={IconName.Gear} />
            {stringGetter({ key: STRING_KEYS.SETTINGS })}
          </$InlineRow>
        }
        onClick={() => navigate(AppRoute.Settings)}
        tw="[grid-area:settings]"
      />
      <$PanelButton
        slotHeader={
          <$InlineRow>
            <Icon iconName={IconName.HelpCircle} />
            {stringGetter({ key: STRING_KEYS.HELP })}
          </$InlineRow>
        }
        onClick={() => dispatch(openDialog(DialogTypes.Help()))}
        tw="[grid-area:help]"
      />

      <MigratePanel tw="[grid-area:migrate]" />

      <StakingPanel tw="[grid-area:staking]" />

      <$RewardsPanel
        slotHeaderContent={stringGetter({ key: STRING_KEYS.TRADING_REWARDS })}
        href={`/${chainTokenLabel}`}
        hasSeparator
      >
        <$Details
          items={[
            {
              key: 'week-rewards',
              label: stringGetter({ key: STRING_KEYS.THIS_WEEK }),
              value: (
                <Output
                  slotRight={
                    <AssetIcon logoUrl={chainTokenImage} symbol={chainTokenLabel} tw="ml-[0.5ch]" />
                  }
                  type={OutputType.Asset}
                  value={currentWeekTradingReward}
                />
              ),
            },
          ]}
          layout="grid"
        />
      </$RewardsPanel>
      <Panel
        slotHeaderContent={stringGetter({ key: STRING_KEYS.FEES })}
        href={`${AppRoute.Portfolio}/${PortfolioRoute.Fees}`}
        hasSeparator
        tw="[grid-area:fees]"
      >
        <$Details
          items={[
            { key: 'maker', label: stringGetter({ key: STRING_KEYS.MAKER }), value: '-' },
            { key: 'taker', label: stringGetter({ key: STRING_KEYS.TAKER }), value: '-' },
            { key: 'volume', label: stringGetter({ key: STRING_KEYS.VOLUME_30D }), value: '-' },
          ]}
          layout="grid"
        />
      </Panel>

      <$HistoryPanel
        slotHeaderContent={stringGetter({ key: STRING_KEYS.HISTORY })}
        href={`${AppRoute.Portfolio}/${PortfolioRoute.History}/${HistoryRoute.Trades}`}
        hasSeparator
      >
        <FillsTable
          columnKeys={[
            FillsTableColumnKey.Time,
            FillsTableColumnKey.Action,
            FillsTableColumnKey.Type,
            FillsTableColumnKey.Total,
          ]}
          withInnerBorders={false}
          initialPageSize={5}
        />
      </$HistoryPanel>
      <LaunchIncentivesPanel tw="[grid-area:incentives]" />
      <Panel tw="text-color-text-0 [grid-area:legal]">
        {stringGetter({
          key: STRING_KEYS.SITE_OPERATED_BY_SHORT,
          params: {
            NAME_OF_DEPLOYER: deployerName,
            LEARN_MORE_LINK: (
              <Link isInline onClick={() => dispatch(openDialog(DialogTypes.Help()))}>
                {stringGetter({ key: STRING_KEYS.LEARN_MORE_ARROW })}
              </Link>
            ),
          },
        })}
      </Panel>
      <GovernancePanel tw="[grid-area:governance]" />
    </$MobileProfileLayout>
  );
};

export default Profile;
const $MobileProfileLayout = styled.div`
  ${layoutMixins.contentContainerPage}

  display: grid;
  gap: 1rem;
  padding: 1.25rem 0.9rem;
  max-width: 100vw;

  grid-template-columns: 1fr 1fr;

  grid-template-areas:
    'header header'
    'actions actions'
    'settings help'
    'migrate migrate'
    'staking staking'
    'rewards fees'
    'history history'
    'governance governance'
    'incentives incentives'
    'legal legal';

  @media ${breakpoints.mobile} {
    grid-template-areas:
      'header header'
      'actions actions'
      'settings help'
      'migrate migrate'
      'staking staking'
      'rewards fees'
      'history history'
      'governance governance'
      'incentives incentives'
      'legal legal';
  }
`;
const $ProfileIcon = styled.div`
  width: 4rem;
  height: 4rem;
  margin-right: 1rem;

  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.profileYellow} 0%,
    ${({ theme }) => theme.profileRed} 100%
  );
`;

const $SubHeader = styled.div`
  ${layoutMixins.row}
  gap: 0.25rem;

  color: var(--color-text-0);

  font: var(--font-small-book);

  span:last-child {
    color: var(--color-text-1);
  }
`;

const $ConnectedIcon = styled.div`
  height: 0.5rem;
  width: 0.5rem;
  margin-right: 0.25rem;
  background: var(--color-success);

  border-radius: 50%;
  box-shadow: 0 0 0 0.2rem var(--color-gradient-success);
`;
const $Actions = styled(Toolbar)`
  ${layoutMixins.spacedRow}
  --stickyArea-topHeight: 5rem;
  grid-area: actions;

  > a,
  > label {
    ${layoutMixins.flexColumn}
    align-items: center;

    span {
      color: var(--color-text-0);
      font: var(--font-small-book);
    }
  }
`;

const $ActionButton = styled(IconButton)<{ iconName?: IconName }>`
  margin-bottom: 0.5rem;

  ${({ iconName }) =>
    iconName === IconName.Close
      ? css`
          --button-textColor: var(--color-red);
          --button-icon-size: 0.75em;
        `
      : iconName === IconName.Transfer &&
        css`
          --button-icon-size: 1.25em;
          --button-textColor: var(--color-text-2);
          --button-backgroundColor: var(--color-accent);
        `}

  &:disabled {
    --button-backgroundColor: var(--color-layer-2);
    --button-textColor: var(--color-text-0);
  }
`;

const $Details = tw(Details)`font-small-book [--details-value-font:--font-medium-book]`;

const $RewardsPanel = styled(Panel)`
  grid-area: rewards;
  align-self: flex-start;
  height: 100%;
  > div {
    height: 100%;
  }

  dl {
    --details-grid-numColumns: 1;
  }
`;
const $HistoryPanel = styled(Panel)`
  grid-area: history;
  --panel-content-paddingY: 0;
  --panel-content-paddingX: 0;

  > div > div {
    margin-top: 1px;
    border-radius: 0.875rem;
  }

  table {
    --tableCell-padding: 0.25rem 1rem;
    --tableRow-backgroundColor: var(--color-layer-3);
    --tableStickyRow-backgroundColor: var(--color-layer-3);
    background-color: var(--color-layer-3);
    thead {
      color: var(--color-text-0);
    }

    tbody {
      tr {
        td:nth-child(2),
        td:nth-child(3) {
          color: var(--color-text-0);
        }
      }
    }
  }
`;

const $InlineRow = tw.div`inlineRow gap-0.5 p-1`;

const $PanelButton = styled(Panel)`
  --panel-paddingY: 0 --panel-paddingX: 0;
`;
