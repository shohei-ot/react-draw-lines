import React from 'react';
import { Meta, Story } from '@storybook/react';
import { ReactDrawLines, Props } from '..';

export default {
  title: 'ReactDrawLines',
  component: ReactDrawLines,
} as Meta<Props>;

export const Base: Story<Props> = (args: Props) => (
  <div>
    <ReactDrawLines {...args} />
  </div>
);
Base.args = {
  width: 600,
  height: 400,
  onDraw: (img) => {
    // console.log(img);
  },
  style: { backgroundColor: '#dfdfdf' },
};
