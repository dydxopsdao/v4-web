import { forwardRef } from 'react';

import styled, { css } from 'styled-components';

import {
  ButtonAction,
  ButtonShape,
  ButtonSize,
  ButtonState,
  ButtonStyle,
} from '@/constants/buttons';

import { LoadingDots } from '@/components/Loading/LoadingDots';

import { BaseButton, BaseButtonProps } from './BaseButton';

export type ButtonStateConfig = {
  isDisabled?: boolean;
  isLoading?: boolean;
};

type ElementProps = {
  children?: React.ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  href?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  onClick?: React.MouseEventHandler<HTMLButtonElement> | React.MouseEventHandler<HTMLAnchorElement>;
  slotLeft?: React.ReactNode;
  slotRight?: React.ReactNode;
  state?: ButtonState | ButtonStateConfig;
  withContentOnLoading?: boolean;
};

type StyleProps = {
  action?: ButtonAction;
  state: Record<string, boolean | undefined>;
  buttonStyle?: ButtonStyle;
  className?: string;
};

export type ButtonProps = BaseButtonProps & ElementProps & Omit<StyleProps, keyof ElementProps>;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      action = ButtonAction.Secondary,
      size = ButtonSize.Base,
      shape = ButtonShape.Rectangle,
      state: stateConfig = ButtonState.Default,
      buttonStyle = ButtonStyle.Default,

      children,
      slotLeft = null,
      slotRight = null,
      withContentOnLoading = false,

      ...otherProps
    },
    ref
  ) => {
    const state: Record<string, boolean | undefined> =
      typeof stateConfig === 'string'
        ? { [stateConfig]: true }
        : {
            [ButtonState.Loading]: stateConfig.isLoading,
            [ButtonState.Disabled]: stateConfig.isDisabled,
          };

    return (
      <StyledBaseButton
        disabled={!!state[ButtonState.Disabled] || !!state[ButtonState.Loading]}
        {...{ ref, action, size, shape, state, buttonStyle, ...otherProps }}
      >
        {state[ButtonState.Loading] ? (
          <>
            {withContentOnLoading && slotLeft}
            {withContentOnLoading && children}
            {withContentOnLoading && slotRight}
            {!withContentOnLoading && <LoadingDots size={3} />}
          </>
        ) : (
          <>
            {slotLeft}
            {children}
            {slotRight}
          </>
        )}
      </StyledBaseButton>
    );
  }
);

const buttonActionVariants = {
  [ButtonAction.Base]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-1);
      --button-backgroundColor: var(--color-layer-5);
      --button-border: solid var(--border-width) var(--color-border);
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-text-1);
      --button-backgroundColor: transparent;
      --button-border: none;
    `,
  },
  [ButtonAction.Primary]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-button);
      --button-backgroundColor: var(--color-accent);
      --button-border: solid var(--border-width, var(--default-border-width)) var(--color-accent);
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-accent);
      --button-backgroundColor: transparent;
      --button-border: none;
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
  },

  [ButtonAction.SimplePrimary]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-2);
      --button-backgroundColor: var(--color-accent);
      --button-border: none;
      --button-hover-filter: none;
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-text-2);
      --button-backgroundColor: transparent;
      --button-border: solid var(--border-width, var(--default-border-width)) var(--color-accent);
      --button-hover-filter: none;
    `,
  },

  [ButtonAction.SimpleSecondary]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-2);
      --button-backgroundColor: var(--color-layer-4);
      --button-border: none;
      --button-hover-filter: none;
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-text-2);
      --button-backgroundColor: transparent;
      --button-border: solid var(--border-width, var(--default-border-width)) var(--color-layer-4);
      --button-hover-filter: none;
    `,
  },
  [ButtonAction.Secondary]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-1);
      --button-backgroundColor: var(--color-layer-3);
      --button-border: solid var(--border-width) var(--color-border);
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-text-0);
      --button-backgroundColor: transparent;
      --button-border: none;
    `,
  },

  [ButtonAction.Create]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-button);
      --button-backgroundColor: var(--color-success-background);
      --button-border: solid var(--border-width, var(--default-border-width))
        var(--color-border-white);
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-green);
      --button-backgroundColor: transparent;
      --button-border: none;
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
  },

  [ButtonAction.Destroy]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-button);
      --button-backgroundColor: var(--color-red);
      --button-border: solid var(--border-width, var(--default-border-width))
        var(--color-border-white);
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-red);
      --button-backgroundColor: transparent;
      --button-border: none;
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
  },

  [ButtonAction.Navigation]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-text-1);
      --button-backgroundColor: transparent;
      --button-border: none;
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-text-1);
      --button-backgroundColor: transparent;
      --button-border: none;
    `,
  },

  [ButtonAction.Reset]: {
    [ButtonStyle.Default]: css`
      --button-textColor: var(--color-red);
      --button-backgroundColor: var(--color-layer-3);
      --button-border: solid var(--border-width, var(--default-border-width))
        var(--color-border-red);
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
    [ButtonStyle.WithoutBackground]: css`
      --button-textColor: var(--color-red);
      --button-backgroundColor: transparent;
      --button-border: none;
      --button-hover-filter: brightness(var(--hover-filter-variant));
    `,
  },
};

const getDisabledStateForButtonAction = (action?: ButtonAction, buttonStyle?: ButtonStyle) => {
  if (action === ButtonAction.Navigation || buttonStyle === ButtonStyle.WithoutBackground) {
    return css`
      --button-textColor: var(--color-text-0);
      --button-hover-filter: none;
      --button-cursor: not-allowed;
    `;
  }
  if (action === ButtonAction.SimplePrimary || action === ButtonAction.SimpleSecondary) {
    return css`
      --button-textColor: var(--color-text-0);
      --button-backgroundColor: var(--button-disabled-backgroundColor, var(--color-layer-2));
      --button-border: solid var(--border-width) var(--color-border);
      --button-hover-filter: none;
      --button-cursor: not-allowed;
    `;
  }
  return css`
    --button-textColor: var(--color-text-0);
    --button-backgroundColor: var(--button-disabled-backgroundColor, var(--color-layer-2));
    --button-border: solid var(--border-width) var(--color-layer-6);
    --button-hover-filter: none;
    --button-cursor: not-allowed;
  `;
};

const buttonStateVariants = (
  action?: ButtonAction,
  buttonStyle?: ButtonStyle
): Record<ButtonState, ReturnType<typeof css>> => ({
  [ButtonState.Default]: css``,

  [ButtonState.Disabled]: getDisabledStateForButtonAction(action, buttonStyle),

  [ButtonState.Loading]: css`
    ${() => buttonStateVariants(action, buttonStyle)[ButtonState.Disabled]}
    min-width: 4em;
  `,
});

const StyledBaseButton = styled(BaseButton)<StyleProps>`
  ${({ action, buttonStyle }) => action && buttonStyle && buttonActionVariants[action][buttonStyle]}

  ${({ action, state, buttonStyle }) =>
    state &&
    css`
      // Ordered from lowest to highest priority (ie. Disabled should overwrite Active and Loading states)
      ${state[ButtonState.Loading] && buttonStateVariants(action, buttonStyle)[ButtonState.Loading]}
      ${state[ButtonState.Disabled] &&
      buttonStateVariants(action, buttonStyle)[ButtonState.Disabled]}
    `}
`;
