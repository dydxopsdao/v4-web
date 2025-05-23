import { useMemo, useState } from 'react';

import { VaultShareUnlock } from '@/bonsai/public-calculators/vaultAccount';
import { sum } from 'lodash';
import styled from 'styled-components';

import { ButtonShape, ButtonSize } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';
import { ESTIMATED_BLOCK_TIME } from '@/constants/numbers';
import { timeUnits } from '@/constants/time';

import { useApiState } from '@/hooks/useApiState';
import { useStringGetter } from '@/hooks/useStringGetter';
import { useLoadedVaultAccount } from '@/hooks/vaultsHooks';

import { tradeViewMixins } from '@/styles/tradeViewMixins';

import { Button } from '@/components/Button';
import { Output, OutputType } from '@/components/Output';
import { ColumnDef, Table } from '@/components/Table';

import { mapIfPresent } from '@/lib/do';

export const VaultLockedSharesCard = ({ className }: { className?: string }) => {
  const stringGetter = useStringGetter();
  const [showShares, setShowShares] = useState(false);
  const vaultAccount = useLoadedVaultAccount().data;
  const rawLockedShares = vaultAccount?.vaultShareUnlocks;
  const lockedShares = useMemo(() => rawLockedShares, [rawLockedShares]);
  const lockedSharesTotalValue = useMemo(
    () => sum(lockedShares?.map((s) => s.amountUsdc)),
    [lockedShares]
  );

  if (lockedShares == null || lockedShares.length === 0) {
    return null;
  }
  return (
    <div className={className} tw="rounded-[0.7rem] border border-solid border-color-border">
      <div tw="flex justify-between px-1 py-0.625">
        <div tw="flex gap-0.5">
          <h3 tw="pt-[5px]">{stringGetter({ key: STRING_KEYS.LOCKED_BALANCE })}</h3>
          <span tw="text-color-text-0">
            <Output value={lockedSharesTotalValue} type={OutputType.CompactFiat} />
          </span>
        </div>
        <Button
          size={ButtonSize.XSmall}
          shape={ButtonShape.Pill}
          onClick={() => setShowShares((o) => !o)}
        >
          {showShares
            ? stringGetter({ key: STRING_KEYS.HIDE })
            : stringGetter({ key: STRING_KEYS.VIEW })}
        </Button>
      </div>
      {showShares && <VaultLockedSharesTable lockedShares={lockedShares} />}
    </div>
  );
};

const VaultLockedSharesTable = ({
  className,
  lockedShares,
}: {
  className?: string;
  lockedShares: VaultShareUnlock[];
}) => {
  const stringGetter = useStringGetter();
  const { height } = useApiState();

  const columns = useMemo<ColumnDef<VaultShareUnlock>[]>(
    () =>
      [
        {
          columnKey: 'time',
          getCellValue: (row) => row.unlockBlockHeight,
          label: stringGetter({ key: STRING_KEYS.AVAILABLE }),
          renderCell: ({ unlockBlockHeight }) => {
            const estimatedUnlockMs = mapIfPresent(
              unlockBlockHeight,
              height,
              // add a day so users don't get confused about why their money isn't unlocked when the day arrives
              (unblock, actual) =>
                new Date().getTime() + (unblock - actual) * ESTIMATED_BLOCK_TIME + timeUnits.day
            );
            return (
              <Output
                value={estimatedUnlockMs}
                type={OutputType.Date}
                dateOptions={{ format: 'medium' }}
              />
            );
          },
        },
        {
          columnKey: 'amount',
          getCellValue: (row) => row.amountUsdc,
          label: stringGetter({ key: STRING_KEYS.AMOUNT }),
          renderCell: ({ amountUsdc }) => <Output value={amountUsdc} type={OutputType.Fiat} />,
        },
      ] satisfies ColumnDef<VaultShareUnlock>[],
    [height, stringGetter]
  );
  return (
    <$Table
      withInnerBorders
      data={lockedShares}
      tableId="vault-locked-shares"
      getRowKey={(row) => `${row.amountUsdc ?? ''}${row.unlockBlockHeight ?? ''}`}
      label={stringGetter({ key: STRING_KEYS.MEGAVAULT })}
      defaultSortDescriptor={{
        column: 'time',
        direction: 'descending',
      }}
      columns={columns}
      className={className}
    />
  );
};

const $Table = styled(Table)`
  ${tradeViewMixins.horizontalTable}
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
` as typeof Table;
