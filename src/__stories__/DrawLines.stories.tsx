import React, { useRef, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import DrawLine, { Props } from '../';
import { IDrawLineHandle } from '../interface';

export default {
  title: 'DrawLine',
  component: DrawLine,
} as Meta<Props>;

export const Base: Story<Props> = (args: Props) => {
  const ref = useRef<IDrawLineHandle | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [bgImgState, setBgImgState] = useState<HTMLImageElement | null>(null);

  const handleOnChange = ({ imgUrl }) => {
    console.group('handleOnChange');
    console.log({ imgUrl });

    const imgEl = imgRef.current;
    imgEl.src = imgUrl;
    imgEl.onload = () => {
      console.log('image loaded');
    };

    console.groupEnd();
  };

  const handleClearButton = () => {
    ref.current.eraseAllCanvas();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const nativeEv = e.nativeEvent;
    if (!nativeEv.target) return;

    const inputEl: HTMLInputElement = nativeEv.target as HTMLInputElement;
    const reader = new FileReader();
    const dataUrl = await new Promise<string | ArrayBuffer>(
      (resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        const imgFile = inputEl.files[0];
        reader.readAsDataURL(imgFile);
      }
    );

    if (typeof dataUrl !== 'string') throw new Error('dataUrl is NOT string');
    setCanvasBgFromDataUrl(dataUrl);
  };

  const setCanvasBgFromDataUrl = async (dataUrl: string) => {
    const bgImg = document.createElement('img');
    await new Promise<Event>((resolve, reject) => {
      bgImg.src = dataUrl;
      bgImg.onload = (e) => resolve(e);
      bgImg.onerror = (e) => reject(e);
    });
    setBgImgState(bgImg);
  };

  return (
    <div>
      <div
        className="buttons-container"
        style={{ display: 'flex', alignItems: 'flex-start' }}
      >
        <button onClick={handleClearButton}>全消し</button>
        <div style={{ marginLeft: '1rem' }}>
          <input type="file" onChange={handleFileChange} />
        </div>
      </div>
      <DrawLine
        ref={ref}
        {...args}
        onChange={handleOnChange}
        canvasBackgroundImg={bgImgState}
      />
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
  backgroundColor: '#ddd',
  usePressure: true,
  lineWidth: 10,
  minLineWidth: 1,
  strokeStyle: '#000',
  lineCap: 'round',
  lineJoin: 'round',
};
