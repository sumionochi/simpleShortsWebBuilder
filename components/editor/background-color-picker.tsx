'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChromePicker } from 'react-color';
import { colors } from '@/constants/colors';

interface BackgroundColorPickerProps {
  currentColor: string;
  handleBackgroundColorChange: (color: string) => void;
  audioUrl: string | null;
}

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  currentColor,
  handleBackgroundColorChange,
  audioUrl
}) => {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="background-color">
        <AccordionTrigger className="font-semibold">Select Background Color</AccordionTrigger>
        <AccordionContent>
          {audioUrl ? (
            <div className="flex flex-wrap gap-1 p-1">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="gap-2">
                  <div
                    style={{ background: currentColor }}
                    className="rounded-md h-full w-6 cursor-pointer active:scale-105"
                  />
                  <span>{currentColor}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="flex flex-col items-center justify-center w-[240px]"
                side="left"
                sideOffset={10}
              >
                <Tabs defaultValue="colorPicker">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="colorPicker">🎨</TabsTrigger>
                    <TabsTrigger value="suggestions">⚡️</TabsTrigger>
                  </TabsList>
                  <TabsContent value="colorPicker">
                    <ChromePicker
                      color={currentColor}
                      onChange={(color) => handleBackgroundColorChange(color.hex)}
                    />
                  </TabsContent>
                  <TabsContent value="suggestions">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {colors.map((color) => (
                        <div
                          key={color}
                          style={{ background: color }}
                          className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
                          onClick={() => handleBackgroundColorChange(color)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ):(
            <div className="text-start text-gray-500 italic">
              No audio file uploaded
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BackgroundColorPicker;
