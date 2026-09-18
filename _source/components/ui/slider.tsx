"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      {/* Track (inset groove) */}
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 bg-secondary/80 dark:bg-secondary"
        style={{
          boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -1px -1px 3px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Range (glossy red fill) */}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full rounded-full"
          style={{
            background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(219, 35, 33, 0.3)',
          }}
        />
      </SliderPrimitive.Track>
      
      {/* Thumbs (tactile metallic knobs) */}
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-5 shrink-0 rounded-full transition-all hover:scale-110 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 1) 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(200, 200, 200, 0.8)',
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };