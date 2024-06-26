import type { Story } from '@ladle/react';

import { TimeoutButton, type TimeoutButtonProps } from './TimeoutButton';
import { StoryWrapper } from '.ladle/components';

export const TimeoutButtonStory: Story<TimeoutButtonProps> = (args) => {
  return (
    <StoryWrapper>
      {/* eslint-disable-next-line no-alert */}
      <TimeoutButton {...args} onClick={() => alert('Timeout button clicked!')}>
        Continue
      </TimeoutButton>
    </StoryWrapper>
  );
};

TimeoutButtonStory.args = {
  timeoutInSeconds: 5,
};
