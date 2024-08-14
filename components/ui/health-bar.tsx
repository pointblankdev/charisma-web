import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "lib/utils"

const HealthBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Function to calculate color based on value
  const getColor = (value: number) => {
    const darkRed = [139, 0, 0];
    const darkYellow = [153, 153, 0];
    const darkGreen = [0, 59, 22];

    if (value <= 50) {
      // Interpolate between dark red and dark yellow
      return darkRed.map((channel, index) =>
        Math.round(channel + (darkYellow[index] - channel) * (value / 50))
      );
    } else {
      // Interpolate between dark yellow and dark green
      return darkYellow.map((channel, index) =>
        Math.round(channel + (darkGreen[index] - channel) * ((value - 50) / 50))
      );
    }
  }

  const barColor = getColor(value || 0);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-md bg-black/20 shadow-inner",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: `rgb(${barColor.join(',')})`,
        }}
      />
    </ProgressPrimitive.Root>
  );
})
HealthBar.displayName = ProgressPrimitive.Root.displayName

export { HealthBar }