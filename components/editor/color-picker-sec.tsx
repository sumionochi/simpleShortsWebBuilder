'use client'

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChromePicker } from 'react-color';
import { colors } from '@/constants/colors';

interface ColorPickerSecProps {
  attribute: string;
  label: string;
  currentColor: string;
  handleAttributeChangeSec: (attribute: string, value: any) => void;
} 

const ColorPickerSec: React.FC<ColorPickerSecProps> = ({
  attribute,
  label,
  currentColor,
  handleAttributeChangeSec,
}) => {

  return (
    <div className={`flex flex-col gap-2`}>
      <Label htmlFor={attribute}>{label}</Label>

      <div className='flex flex-wrap gap-1 p-1'>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant='outline' className='gap-2'>
              <div
                style={{ background: currentColor }}
                className="rounded-md h-full w-6 cursor-pointer active:scale-105"
              />
              <span>{currentColor}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='flex flex-col items-center justify-center w-[240px]'
            side='left'
            sideOffset={10}
          >
            <Tabs defaultValue='colorPickerSec'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='colorPickerSec'>🎨</TabsTrigger>
                <TabsTrigger value='suggestions'>⚡️</TabsTrigger>
              </TabsList>
              <TabsContent value='colorPickerSec'>
                <ChromePicker
                  color={currentColor}
                  onChange={(color) => handleAttributeChangeSec(attribute, color.hex)}
                />
              </TabsContent>
              <TabsContent value='suggestions'>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {colors.map((color) => (
                    <div
                      key={color}
                      style={{ background: color }}
                      className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                      onClick={() => handleAttributeChangeSec(attribute, color)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs> 
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ColorPickerSec;