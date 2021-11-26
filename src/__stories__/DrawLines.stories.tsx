import React, { useRef } from 'react';
import { Meta, Story } from '@storybook/react';
import DrawLine, { Props, IDrawLineHandle } from '../';

export default {
  title: 'DrawLine',
  component: DrawLine,
} as Meta<Props>;

export const Base: Story<Props> = (args: Props) => {
  const ref = useRef<IDrawLineHandle | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleOnChange = ({ lines, imgUrl }) => {
    console.group('handleOnChange');
    console.log({ lines, imgUrl });

    const imgEl = imgRef.current;
    if (!imgEl) return;
    imgEl.src = imgUrl;
    imgEl.onload = () => {
      console.log('image loaded');
    };

    console.groupEnd();
  };

  const handleClearButton = () => {
    ref.current.eraseAllCanvas();
  };

  return (
    <div>
      <div className="buttons-container">
        <button onClick={handleClearButton}>全消し</button>
      </div>
      <DrawLine ref={ref} {...args} onChange={handleOnChange} />
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
