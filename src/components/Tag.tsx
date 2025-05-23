import styled, { css } from 'styled-components';

export enum TagSize {
  Small = 'Small',
  Medium = 'Medium',
}

export enum TagType {
  Side = 'Side',
  Number = 'Number',
}

export enum TagSign {
  Positive = 'Positive',
  Negative = 'Negative',
  Warning = 'Warning',
  Neutral = 'Neutral',
}

type StyleProps = {
  size?: TagSize;
  type?: TagType;
  sign?: TagSign;
  isHighlighted?: boolean;
};

export const Tag = styled.span<StyleProps>`
  font-family: var(--fontFamily-base);
  font-weight: var(--fontWeight-book);
  display: inline-flex;

  background-color: var(--color-layer-6);
  border-radius: 0.25rem;

  color: var(--color-text-2);
  letter-spacing: 0.04em;
  line-height: 1.3;

  ${({ type, size }) =>
    ({
      [TagSize.Small]: css`
        padding: ${type === TagType.Number
          ? '0.125rem 0.344rem'
          : '0.125rem 0.219rem 0.125rem 0.25rem'};

        font: var(--font-tiny-book);
      `,
      [TagSize.Medium]: css`
        padding: ${type === TagType.Number
          ? '0.156rem 0.438rem'
          : '0.156rem 0.219rem 0.156rem 0.25rem'};

        font: var(--font-mini-book);
      `,
    })[size ?? TagSize.Small]}

  ${({ sign }) =>
    sign !== undefined &&
    {
      [TagSign.Positive]: css`
        color: var(--color-positive);
        background-color: var(--color-gradient-positive);
      `,
      [TagSign.Negative]: css`
        color: var(--color-negative);
        background-color: var(--color-gradient-negative);
      `,
      [TagSign.Neutral]: css`
        background-color: var(--color-layer-3);
      `,
      [TagSign.Warning]: css`
        background-color: var(--color-gradient-warning);
      `,
    }[sign]}

    ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      background-color: var(--color-accent);
      color: var(--color-text-button);
    `}
`;

export const NewTag = styled(Tag)`
  background-color: var(--color-accent-faded);
  color: var(--color-accent);
  text-transform: uppercase;
`;

export const AccentTag = styled(Tag)`
  background-color: var(--color-accent-faded);
  color: var(--color-accent);
`;

export const WarningTag = styled(Tag)`
  background-color: var(--color-layer-3);
  color: var(--color-warning);
  border: solid 1px var(--color-warning);
`;

export const SuccessTag = styled(Tag)`
  background-color: var(--color-layer-3);
  color: var(--color-success);
  border: solid 1px var(--color-success);
`;
