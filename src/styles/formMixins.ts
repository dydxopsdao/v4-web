import { css } from 'styled-components';

import breakpoints from './breakpoints';
import { layoutMixins } from './layoutMixins';

const inputInnerButton = css`
  --button-textColor: var(--color-text-1);
  --button-backgroundColor: var(--color-layer-6);
  --button-border: none;
`;

const inputsColumn = css`
  ${layoutMixins.flexColumn}
  gap: var(--form-input-gap);
`;

export const formMixins = {
  inputsColumn,

  inputContainer: css`
    --input-height: var(--form-input-height);
    --input-width: 100%;
    --input-backgroundColor: ${({ theme }) => theme.inputBackground};

    ${layoutMixins.row}
    justify-content: space-between;
    width: var(--input-width);
    min-width: var(--input-width);
    flex: 1;

    height: var(--input-height);
    min-height: var(--input-height);
    max-height: var(--input-height);

    background-color: var(--input-backgroundColor);
    border: var(--border-width) solid var(--input-borderColor);
    border-radius: var(--input-radius, 0.5em);

    &:focus-within {
      filter: brightness(var(--hover-filter-base));
    }

    @media ${breakpoints.tablet} {
      --input-height: var(--form-input-height-mobile);
    }
  `,

  inputInnerButton,

  inputInnerToggleButton: css`
    ${() => inputInnerButton}

    --button-toggle-off-backgroundColor: var(--color-layer-6);
    --button-toggle-off-textColor: var(--color-text-1);
    --button-toggle-off-border: none;
    --button-toggle-on-backgroundColor: var(--color-layer-6);
    --button-toggle-on-textColor: var(--color-text-1);
    --button-toggle-on-border: none;

    svg {
      color: var(--color-text-0);
    }
  `,

  // TODO: replace with select menu design system
  inputSelectMenu: css`
    --trigger-textColor: var(--color-text-2);
    --trigger-backgroundColor: var(--color-layer-4);
    --trigger-open-backgroundColor: var(--color-layer-4);
    --trigger-border: none;
    --trigger-padding: var(--form-input-paddingY) var(--form-input-paddingX);
    --trigger-height: var(--form-input-height);

    --popover-backgroundColor: var(--color-layer-5);
    --popover-border: none;

    font: var(--font-base-book);

    @media ${breakpoints.tablet} {
      --trigger-height: var(--form-input-height-mobile);
    }
  `,

  inputSelectMenuItem: css`
    --item-checked-backgroundColor: var(--color-layer-4);
    --item-padding: 1rem var(--form-input-paddingX);
    font: var(--font-small-book);
  `,

  inputInnerSelectMenu: css`
    --trigger-textColor: var(--color-text-1);
    --trigger-backgroundColor: var(--color-layer-6);
    --trigger-open-backgroundColor: var(--color-layer-6);
    --trigger-border: none;
    --trigger-padding: 0 0.33rem;
    --trigger-height: 1.875rem;

    --popover-backgroundColor: var(--color-layer-5);
    --popover-border: none;

    font: var(--font-small-book);
  `,

  inputInnerSelectMenuItem: css`
    --item-checked-backgroundColor: var(--color-layer-4);

    font: var(--font-small-book);
  `,

  inputLabel: css`
    --label-textColor: var(--color-text-1);
    position: relative;
    height: 100%;
    width: 100%;
    gap: 0;

    border-radius: inherit;

    @media ${breakpoints.tablet} {
      gap: 0.25rem;
    }
  `,

  inputToggleGroup: css`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 0.5rem;

    > * {
      flex: 1 1 0.625rem;
    }

    > button {
      --button-toggle-off-backgroundColor: var(--color-layer-4);
      --button-toggle-off-textColor: var(--color-text-1);
    }
  `,

  withStickyFooter: css`
    footer {
      ${layoutMixins.stickyFooter}
    }
  `,

  footer: css`
    margin-top: auto;
    backdrop-filter: none;
    ${layoutMixins.noPointerEvents}
  `,

  transfersForm: css`
    ${() => inputsColumn}
    --form-input-gap: 1rem;
    --form-input-height: 3.5rem;
    --form-input-height-mobile: 4rem;
    --form-input-paddingY: 0.5rem;
    --form-input-paddingX: 0.75rem;

    height: 100%;

    label {
      --label-textColor: var(--color-text-0);
    }

    @media ${breakpoints.tablet} {
      --form-input-gap: 1rem;
    }
  `,

  stakingForm: css`
    ${() => inputsColumn}
    --form-input-gap: 1rem;
    --form-input-height: 3.5rem;
    --form-input-height-mobile: 4rem;
    --form-input-paddingY: 0.5rem;
    --form-input-paddingX: 0.75rem;

    --withReceipt-backgroundColor: var(--color-layer-2);

    height: 100%;

    label {
      --label-textColor: var(--color-text-1);
    }

    @media ${breakpoints.tablet} {
      --form-input-gap: 1rem;
    }
  `,
} satisfies Record<string, ReturnType<typeof css>>;
