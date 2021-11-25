import React, { useRef } from 'react';
import { Meta, Story } from '@storybook/react';
import { DrawLine, Props } from '../';

export default {
  title: 'DrawLine',
  component: DrawLine,
} as Meta<Props>;

export const Base: Story<Props> = (args: Props) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const handleOnChange = (imgUrl) => {
    const imgEl = imgRef.current;
    if (!imgEl) return;
    imgEl.src = imgUrl;
    imgEl.onload = () => {
      console.log('image loaded');
    };
  };

  return (
    <div>
      <DrawLine {...args} onChange={handleOnChange} />
      <hr />
      <div>
        <small>onChange image</small>
        <br />
        <img ref={imgRef} style={{ border: '1px solid #000' }} />
      </div>
    </div>
  );
};
Base.args = {
  canvasWidth: 600,
  canvasHeight: 400,
  backgroundColor: '#ccc',
};
