import React from 'react';
import { getCaptionStyles } from '@/lib/captionStyles';

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
  fontFamily: string;
  opacity: number;
  fontWeight: number;
}

interface WordWithStyle {
  word: string;
  color?: string;
  start: number;
  end: number;
}

interface CaptionTextProps {
  textLines?: WordWithStyle[][];
  styleName: string;
  style?: TextSegmentStyle;
  paddingBetweenLines: number;
  paddingFromFrame: number;
  rowIndex?: number;
  totalRows?: number;
}

const CaptionText: React.FC<CaptionTextProps> = ({
  textLines,
  styleName,
  style,
  paddingFromFrame,
  paddingBetweenLines,
  rowIndex = 0,
  totalRows = 1,
}) => {
  const baseStyles = getCaptionStyles(styleName, style);
  const maxLines = style?.stack || 1;
  const filledTextLines: WordWithStyle[][] = new Array(maxLines).fill([]);

  textLines?.forEach((lineWords, idx) => {
    if (idx < maxLines) {
      filledTextLines[idx] = lineWords;
    }
  });

  let justifyContent = 'center';
  let alignItems = 'center';

  switch (style?.place) {
    case 'top':
      justifyContent = 'flex-start';
      alignItems = 'center';
      break;
    case 'bottom':
      justifyContent = 'flex-end';
      alignItems = 'center';
      break;
    case 'left':
      justifyContent = 'center';
      alignItems = 'flex-start';
      break;
    case 'right':
      justifyContent = 'center';
      alignItems = 'flex-end';
      break;
    case 'center':
    default:
      justifyContent = 'center';
      alignItems = 'center';
      break;
  }

  const rowHeight = 100 / totalRows;

  const mergedStyles = {
    container: {
      ...baseStyles.container,
      top: style?.top || 'auto',
      left: style?.left || '0%',
      right: style?.right || '0%',
      bottom: style?.bottom || 'auto',
      width: style?.width || '100%',
      height: style?.height || `${rowHeight}%`,
      justifyContent: style?.justifyContent || justifyContent,
      alignItems: style?.alignItems || alignItems,
      padding: `${paddingFromFrame}rem`,
      position: 'absolute' as 'absolute',
    },
    text: {
      ...baseStyles.text,
      fontSize: style?.fontSize || '2rem',
      fontFamily: style?.fontFamily,
      fontWeight: `${style?.fontWeight}`,
      opacity: style?.opacity,
      color: style?.color || '#000',
      lineHeight: style?.lineHeight || '1.2',
      transform: style?.transform || 'none',
    },
    word: {
      display: 'inline-block',
      marginRight: '0.25em',
    },
  };

  return (
    <div style={mergedStyles.container}>
      {filledTextLines.map((lineWords, lineIdx) => (
        <p
          key={lineIdx}
          style={{
            ...mergedStyles.text,
            marginTop: lineIdx === 0 ? '0px' : `${paddingBetweenLines}rem`,
          }}
        >
          {lineWords.length > 0 ? (
            lineWords.map((wordObj, wordIdx) => (
              <span
                key={wordIdx}
                style={{
                  ...mergedStyles.word,
                  color: wordObj.color || mergedStyles.text.color,
                }}
              >
                {wordObj.word}
              </span>
            ))
          ) : (
            ' '
          )}
        </p>
      ))}
    </div>
  );
};

export default CaptionText;