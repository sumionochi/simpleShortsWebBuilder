'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChromePicker } from 'react-color';
import { colors } from '@/constants/colors';

interface ColorPickerProps {
  label: string;
  currentColor: string;
  handleColorChange: (value: string) => void; 
} 

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  currentColor,
  handleColorChange,
}) => {
  return (
    <div className={`flex flex-col gap-2 mt-1`}>
      <div className='flex flex-wrap gap-1 p-0'>
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
            <Tabs defaultValue='colorPicker'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='colorPicker'>🎨</TabsTrigger>
                <TabsTrigger value='suggestions'>⚡️</TabsTrigger>
              </TabsList>
              <TabsContent value='colorPicker'>
                <ChromePicker
                  color={currentColor}
                  onChange={(color) => handleColorChange(color.hex)} // Updated to use handleColorChange
                />
              </TabsContent>
              <TabsContent value='suggestions'>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {colors.map((color) => (
                    <div
                      key={color}
                      style={{ background: color }}
                      className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                      onClick={() => handleColorChange(color)} // Updated to use handleColorChange
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

export default ColorPicker;
