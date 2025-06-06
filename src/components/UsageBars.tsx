import styled from 'styled-components';

import { leverageRiskLevel, RiskLevel } from '@/lib/risk';
import { usageColorFromRiskLevel } from '@/lib/styles';

type ElementProps = {
  value: number;
};

type StyleProps = {
  className?: string;
};

export const UsageBars = ({ value, className }: ElementProps & StyleProps) => (
  <$UsageBars className={className} riskLevel={leverageRiskLevel(value)}>
    {Array.from({ length: 3 }, (_, i) => (
      <$Bar
        key={i}
        style={{
          '--i': i,
          '--l': 3,
        }}
        active={i <= leverageRiskLevel(value)}
      />
    ))}
  </$UsageBars>
);

const $UsageBars = styled.div<{ riskLevel: RiskLevel }>`
  ${({ riskLevel }) => usageColorFromRiskLevel(riskLevel)}

  width: 0.875rem;
  height: 0.875rem;
  display: flex;
  align-items: end;
  justify-content: space-between;
`;

const $Bar = styled.div<{ active: boolean; style?: { [custom: string]: string | number } }>`
  --active-delay: calc(0.2s * calc(var(--i) + 1));

  max-width: 3px;
  height: min(calc(100% / calc(var(--l) - var(--i)) + 0.1rem), 100%);
  opacity: ${({ active }) => (active ? 1 : 0.2)};
  flex: 1;
  background-color: currentColor;
  border-radius: 1px;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.3s linear var(--active-delay);
  }
`;
