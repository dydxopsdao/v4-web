import { useState } from 'react';

import type { TvWidget } from '@/constants/tvchart';

import { useChartMarketAndResolution } from '@/hooks/tradingView/useChartMarketAndResolution';
import { useTradingViewLaunchable } from '@/hooks/tradingView/useTradingViewLaunchable';
import { useTradingViewTheme } from '@/hooks/tradingView/useTradingViewTheme';
import { useSimpleUiEnabled } from '@/hooks/useSimpleUiEnabled';

import { BaseTvChart } from './BaseTvChart';

export const TvChartLaunchable = ({ marketId }: { marketId: string }) => {
  const isSimpleUi = useSimpleUiEnabled();

  const [tvWidget, setTvWidget] = useState<TvWidget>();

  useTradingViewLaunchable({
    marketId,
    tvWidget,
    setTvWidget,
  });

  useChartMarketAndResolution({
    currentMarketId: marketId,
    isViewingUnlaunchedMarket: true,
    tvWidget,
  });

  useTradingViewTheme({
    tvWidget,
  });

  return <BaseTvChart isLaunchable tvWidget={tvWidget} isSimpleUi={isSimpleUi} />;
};
