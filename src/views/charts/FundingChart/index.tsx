import { useState } from 'react';

import { BonsaiHooks } from '@/bonsai/ontology';
import { curveMonotoneX, curveStepAfter } from '@visx/curve';
import type { TooltipContextType } from '@visx/xychart';
import styled, { css } from 'styled-components';

import { ButtonSize } from '@/constants/buttons';
import {
  FundingDirection,
  FundingRateResolution,
  type FundingChartDatum,
} from '@/constants/charts';
import { STRING_KEYS } from '@/constants/localization';
import { FUNDING_DECIMALS } from '@/constants/numbers';
import { EMPTY_ARR } from '@/constants/objects';
import { timeUnits } from '@/constants/time';

import { useBreakpoints } from '@/hooks/useBreakpoints';
import { useStringGetter } from '@/hooks/useStringGetter';

import breakpoints from '@/styles/breakpoints';

import { LoadingSpace } from '@/components/Loading/LoadingSpinner';
import { Output, OutputType } from '@/components/Output';
import { ToggleGroup } from '@/components/ToggleGroup';
import { AxisLabelOutput } from '@/components/visx/AxisLabelOutput';
import { TimeSeriesChart } from '@/components/visx/TimeSeriesChart';

import { MustBigNumber } from '@/lib/numbers';

import { FundingChartTooltipContent } from './Tooltip';

const FUNDING_RATE_TIME_RESOLUTION = timeUnits.hour;

const getAllFundingRates = (oneHourRate: number = 0) => ({
  [FundingRateResolution.OneHour]: oneHourRate,
  [FundingRateResolution.EightHour]: MustBigNumber(oneHourRate).times(8).toNumber(),
  [FundingRateResolution.Annualized]: MustBigNumber(oneHourRate)
    .times(24 * 365)
    .toNumber(),
});

type ElementProps = {
  selectedLocale: string;
};

export const FundingChart = ({ selectedLocale }: ElementProps) => {
  // Context
  const { isMobile } = useBreakpoints();
  const stringGetter = useStringGetter();

  // Chart data
  const { data, status } = BonsaiHooks.useCurrentMarketHistoricalFunding();
  const isLoading = status === 'pending';
  const isError = status === 'error';

  const latestDatum = data?.[data.length - 1];

  // Chart state
  const [fundingRateView, setFundingRateView] = useState(FundingRateResolution.OneHour);

  const [tooltipContext, setTooltipContext] = useState<TooltipContextType<FundingChartDatum>>();

  // Computations
  const latestFundingRate =
    latestDatum && getAllFundingRates(latestDatum.fundingRate)[fundingRateView];

  return (
    <TimeSeriesChart
      selectedLocale={selectedLocale}
      data={data ?? EMPTY_ARR}
      yAxisScaleType="symlog"
      margin={{
        left: isMobile ? 0 : 88,
        right: 0,
        top: 60,
        bottom: 32,
      }}
      padding={{
        left: 0.025,
        right: 0.025,
        top: 0.05,
        bottom: 0.05,
      }}
      series={[
        {
          dataKey: 'funding-rate',
          xAccessor: (datum) => datum?.time ?? 0,
          yAccessor: (datum) => datum?.fundingRate ?? 0,
          colorAccessor: () => 'var(--color-text-1)',
          getCurve: ({ zoom }) => (zoom > 12 ? curveMonotoneX : curveStepAfter),
        },
      ]}
      tickFormatY={(value) =>
        `${(getAllFundingRates(value)[fundingRateView] * 100).toFixed(fundingRateView === FundingRateResolution.Annualized ? 0 : FUNDING_DECIMALS)}%`
      }
      renderXAxisLabel={({ tooltipData }) => {
        const tooltipDatum = tooltipData!.nearestDatum?.datum ?? latestDatum;

        return (
          <AxisLabelOutput
            type={OutputType.DateTime}
            value={tooltipDatum?.time}
            tw="shadow-[0_0_0.5rem_var(--color-layer-2)]"
          />
        );
      }}
      renderYAxisLabel={({ tooltipData }) => {
        const tooltipDatum = tooltipData!.nearestDatum?.datum ?? latestDatum;

        return (
          <$YAxisLabelOutput
            type={OutputType.SmallPercent}
            fractionDigits={FUNDING_DECIMALS}
            value={getAllFundingRates(tooltipDatum?.fundingRate)[fundingRateView]}
            accentColor={
              {
                [FundingDirection.ToLong]: 'var(--color-negative)',
                [FundingDirection.ToShort]: 'var(--color-positive)',
                [FundingDirection.None]: 'var(--color-layer-6)',
              }[tooltipDatum?.direction ?? FundingDirection.None]
            }
          />
        );
      }}
      renderTooltip={({ tooltipData }) => (
        <FundingChartTooltipContent
          fundingRateView={fundingRateView}
          tooltipData={tooltipData}
          latestDatum={latestDatum}
        />
      )}
      onTooltipContext={(ttContext) => setTooltipContext(ttContext)}
      minZoomDomain={FUNDING_RATE_TIME_RESOLUTION * 4}
      defaultZoomDomain={timeUnits.day * 14}
      numGridLines={1}
      slotEmpty={
        isLoading ? (
          <LoadingSpace id="funding-chart-loading" />
        ) : (
          isError && (
            <div tw="flex flex-col justify-center text-center align-middle">
              {stringGetter({ key: STRING_KEYS.SOMETHING_WENT_WRONG })}
            </div>
          )
        )
      }
    >
      <div tw="isolate m-1 [place-self:start_end]">
        <ToggleGroup
          items={Object.keys(FundingRateResolution).map((rate) => ({
            value: rate as FundingRateResolution,
            label:
              {
                [FundingRateResolution.OneHour]: stringGetter({
                  key: STRING_KEYS.RATE_1H,
                }),
                [FundingRateResolution.EightHour]: stringGetter({
                  key: STRING_KEYS.RATE_8H,
                }),
                [FundingRateResolution.Annualized]: stringGetter({
                  key: STRING_KEYS.ANNUALIZED,
                }),
              }[rate] ?? '',
          }))}
          value={fundingRateView}
          onValueChange={setFundingRateView}
          size={ButtonSize.XSmall}
        />
      </div>

      <$CurrentFundingRate isShowing={!tooltipContext?.tooltipOpen}>
        <h4>
          {
            {
              [FundingRateResolution.OneHour]: stringGetter({
                key: STRING_KEYS.CURRENT_RATE_1H,
              }),
              [FundingRateResolution.EightHour]: stringGetter({
                key: STRING_KEYS.CURRENT_RATE_8H,
              }),
              [FundingRateResolution.Annualized]: stringGetter({
                key: STRING_KEYS.CURRENT_ANNUALIZED_RATE,
              }),
            }[fundingRateView]
          }
        </h4>
        <$Output
          type={OutputType.SmallPercent}
          value={latestFundingRate}
          fractionDigits={FUNDING_DECIMALS}
          isNegative={(latestFundingRate ?? 0) < 0}
        />
      </$CurrentFundingRate>
    </TimeSeriesChart>
  );
};
const $CurrentFundingRate = styled.div<{ isShowing?: boolean }>`
  place-self: start center;
  padding: clamp(1.5rem, 9rem - 15%, 4rem);
  pointer-events: none;

  font: var(--font-large-book);

  background: radial-gradient(50% 50% at 50% 50%, var(--color-layer-2) 35%, transparent);
  border-radius: 50%;

  text-align: center;

  /* Tooltip state-based */
  transition: opacity var(--ease-out-expo) 0.25s;
  ${({ isShowing }) =>
    !isShowing &&
    css`
      opacity: 0;
    `}

  @media ${breakpoints.mobile} {
    place-self: start start;
    text-align: start;
    padding: 1.25rem;
  }

  h4 {
    font: var(--font-small-medium);
    color: var(--color-text-0);
  }
`;

const $Output = styled(Output)<{ isNegative?: boolean }>`
  color: ${({ isNegative }) => (isNegative ? `var(--color-negative)` : `var(--color-positive)`)};
`;
const $YAxisLabelOutput = styled(AxisLabelOutput)`
  --axisLabel-offset: 0.5rem;

  [data-side='left'] & {
    translate: calc(-50% - var(--axisLabel-offset)) 0;

    @media ${breakpoints.mobile} {
      translate: calc(50% + var(--axisLabel-offset)) 0;
    }
  }

  [data-side='right'] & {
    translate: calc(-50% - var(--axisLabel-offset)) 0;
  }
`;
