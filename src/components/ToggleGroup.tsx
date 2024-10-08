import { type Ref } from 'react';

import { Item, Root } from '@radix-ui/react-toggle-group';
import styled, { css } from 'styled-components';

import { ButtonShape, ButtonSize } from '@/constants/buttons';
import { type MenuItem } from '@/constants/menus';

import { useBreakpoints } from '@/hooks/useBreakpoints';

import { layoutMixins } from '@/styles/layoutMixins';

import { type BaseButtonProps } from '@/components/BaseButton';
import { ToggleButton } from '@/components/ToggleButton';

import { forwardRefFn } from '@/lib/genericFunctionalComponentUtils';

type ElementProps<MenuItemValue extends string> = {
  items: MenuItem<MenuItemValue>[];
  value: MenuItemValue;
  onValueChange: (value: MenuItemValue) => void;
  onInteraction?: () => void;
  ensureSelected?: boolean;
};

type StyleProps = {
  className?: string;
  overflow?: 'scroll' | 'wrap';
};

export const ToggleGroup = forwardRefFn(
  <MenuItemValue extends string>(
    {
      items,
      value,
      ensureSelected = true,
      onValueChange,
      onInteraction,

      className,
      overflow = 'scroll',
      size,
      shape = ButtonShape.Pill,

      ...buttonProps
    }: ElementProps<MenuItemValue> & StyleProps & BaseButtonProps,
    ref: Ref<HTMLDivElement>
  ) => {
    const { isTablet } = useBreakpoints();

    return (
      <$Root
        ref={ref}
        type="single"
        value={value}
        onValueChange={(newValue: MenuItemValue) => {
          if ((ensureSelected && newValue) || !ensureSelected) {
            onValueChange(newValue);
          }
          onInteraction?.();
        }}
        className={className}
        loop
        overflow={overflow}
        tw="row gap-[0.33em]"
      >
        {items.map((item) => (
          <Item key={item.value} value={item.value} disabled={item.disabled} asChild>
            <ToggleButton
              size={size ?? (isTablet ? ButtonSize.Small : ButtonSize.XSmall)}
              shape={shape}
              disabled={item.disabled}
              {...buttonProps}
            >
              {item.slotBefore}
              <$Label>{item.label}</$Label>
              {item.slotAfter}
            </ToggleButton>
          </Item>
        ))}
      </$Root>
    );
  }
);

const $Root = styled(Root)<{ overflow: 'scroll' | 'wrap' }>`
  ${({ overflow }) =>
    ({
      scroll: css`
        overflow-x: auto;
      `,
      wrap: css`
        display: flex;
        flex-wrap: wrap;
      `,
    })[overflow]}
`;

const $Label = styled.div`
  ${layoutMixins.textTruncate}
  // don't truncate 2 characters
  min-width: 1rem;
`;
