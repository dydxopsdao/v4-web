import { forwardRef } from 'react';

import styled, { css } from 'styled-components';

import { STRING_KEYS } from '@/constants/localization';
import { ORDERBOOK_ROW_HEIGHT } from '@/constants/orderbook';

import { useStringGetter } from '@/hooks/useStringGetter';

import { Output, OutputType } from '@/components/Output';

type StyleProps = {
  side?: 'top' | 'bottom';
  isHeader?: boolean;
};

type ElementProps = {
  spread?: number;
  spreadPercent?: number;
  tickSizeDecimals?: number;
};

export const OrderbookRow = styled.div<{ isHeader?: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: ${ORDERBOOK_ROW_HEIGHT}px;
  min-height: ${ORDERBOOK_ROW_HEIGHT}px;
  position: relative;
  padding-right: 0.5rem;
  font: var(--font-mini-book);

  > span {
    flex: 1 1 0%;
    text-align: right;
  }

  ${({ isHeader }) =>
    isHeader
      ? `
  padding-left: 2rem;
  gap: 2rem;
  > span {
    flex: 0 0 0%;
  }
  `
      : ``}
`;

export const OrderbookMiddleRow = forwardRef<HTMLDivElement, StyleProps & ElementProps>(
  ({ side, isHeader, spread, spreadPercent, tickSizeDecimals }, ref) => {
    const stringGetter = useStringGetter();

    return (
      <$OrderbookMiddleRow ref={ref} side={side} isHeader={isHeader}>
        <span tw="flex flex-col pr-0.5">{stringGetter({ key: STRING_KEYS.ORDERBOOK_SPREAD })}</span>
        <span tw="flex flex-col pr-0.5">
          <Output
            withSubscript
            type={OutputType.Number}
            value={spread}
            fractionDigits={tickSizeDecimals}
            tw="[justify-content:right]"
          />
        </span>
        <span tw="flex flex-col">
          <Output type={OutputType.Percent} value={spreadPercent} tw="[justify-content:right]" />
        </span>
      </$OrderbookMiddleRow>
    );
  }
);
const $OrderbookMiddleRow = styled(OrderbookRow)<{ side?: 'top' | 'bottom' }>`
  height: 1.75rem;
  border-top: var(--border);
  border-bottom: var(--border);
  white-space: nowrap;

  ${({ side }) =>
    side &&
    {
      top: css`
        border-top: none;
      `,
      bottom: css`
        border-bottom: none;
      `,
    }[side]};
`;

// matching the output height and styling with price span
