import { STRING_KEYS } from '@/constants/localization';

import { useBreakpoints } from '@/hooks/useBreakpoints';
import { useStringGetter } from '@/hooks/useStringGetter';

import { AttachedExpandingSection } from '@/components/ContentSection';
import { ContentSectionHeader } from '@/components/ContentSectionHeader';
import { OrdersTable, OrdersTableColumnKey } from '@/views/tables/OrdersTable';

import { calculateIsAccountViewOnly } from '@/state/accountCalculators';
import { useAppSelector } from '@/state/appTypes';

import { isTruthy } from '@/lib/isTruthy';

export const Orders = () => {
  const stringGetter = useStringGetter();
  const { isTablet, isNotTablet } = useBreakpoints();
  const isAccountViewOnly = useAppSelector(calculateIsAccountViewOnly);

  return (
    <AttachedExpandingSection>
      {isNotTablet && <ContentSectionHeader title={stringGetter({ key: STRING_KEYS.ORDERS })} />}

      <OrdersTable
        tableType="OPEN"
        columnKeys={
          isTablet
            ? [OrdersTableColumnKey.StatusFill, OrdersTableColumnKey.PriceType]
            : [
                OrdersTableColumnKey.Market,
                OrdersTableColumnKey.Status,
                OrdersTableColumnKey.Side,
                OrdersTableColumnKey.Amount,
                OrdersTableColumnKey.Filled,
                OrdersTableColumnKey.OrderValue,
                OrdersTableColumnKey.Price,
                OrdersTableColumnKey.Trigger,
                OrdersTableColumnKey.MarginType,
                OrdersTableColumnKey.GoodTil,
                !isAccountViewOnly && OrdersTableColumnKey.Actions,
              ].filter(isTruthy)
        }
        withOuterBorder={isNotTablet}
      />
    </AttachedExpandingSection>
  );
};
