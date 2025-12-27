import React from 'react';

interface TextSegmentStyle {
  stack: number;
  place: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  fontSize?: string;
  color?: string;
  lineHeight?: string;
  transform?: string;
  width?: string;
  height?: string;
  justifyContent?: string;
  alignItems?: string;
}

export const getCaptionStyles = (styleName: string, customStyle?: TextSegmentStyle) => {
  const baseTextStyle = {
    fontSize: customStyle?.fontSize || '2rem',
    color: customStyle?.color || 'white',
    textAlign: 'center' as const,
    margin: '0',
    padding: '0 0',
    lineHeight: customStyle?.lineHeight || '1.2',
  };

  const [stackStr, place] = styleName.split('stack');
  const stack = parseInt(stackStr, 10) || 1;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    width: customStyle?.width || '100%',
    height: customStyle?.height || 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  switch (place) {
    case 'center':
      containerStyle.top = customStyle?.top || '50%';
      containerStyle.left = customStyle?.left || '50%';
      containerStyle.transform = customStyle?.transform || 'translate(-50%, -50%)';
      containerStyle.justifyContent = 'center';
      containerStyle.alignItems = 'center';
      break;
    case 'top':
      containerStyle.top = customStyle?.top || '10%';
      containerStyle.left = customStyle?.left || '50%';
      containerStyle.transform = customStyle?.transform || 'translateX(-50%)';
      containerStyle.justifyContent = 'flex-start';
      break;
    case 'bottom':
      containerStyle.bottom = customStyle?.bottom || '10%';
      containerStyle.left = customStyle?.left || '50%';
      containerStyle.transform = customStyle?.transform || 'translateX(-50%)';
      containerStyle.justifyContent = 'flex-end';
      break;
    case 'left':
      containerStyle.alignItems = 'flex-start';
      containerStyle.top = customStyle?.top || '50%';
      containerStyle.left = customStyle?.left || '10%';
      containerStyle.transform = customStyle?.transform || 'translateY(-50%)';
      break;
    case 'right':
      containerStyle.top = customStyle?.top || '50%';
      containerStyle.right = customStyle?.right || '10%';
      containerStyle.transform = customStyle?.transform || 'translateY(-50%)';
      containerStyle.alignItems = 'flex-end';
      break;
    default:
      containerStyle.bottom = customStyle?.bottom || '10%';
      containerStyle.left = customStyle?.left || '50%';
      containerStyle.transform = customStyle?.transform || 'translateX(-50%)';
  }

  if (stack > 1) {
    containerStyle.height = customStyle?.height || 'auto'; // Changed to 'auto'
  }

  const textStyle = {
    ...baseTextStyle,
    textAlign: place === 'left' ? 'left' as const : place === 'right' ? 'right' as const : 'center' as const,
    marginBottom: stack > 1 ? '0px' : '0', // Add margin between lines for multi-line
  };

  return {
    container: containerStyle,
    text: textStyle,
  };
};