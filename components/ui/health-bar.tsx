import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "lib/utils"

const HealthBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Function to calculate color based on value
  const getColor = (value: number, darkenFactor = 0) => {
    const darkRed = [139, 0, 0];
    const darkYellow = [153, 153, 0];
    const darkGreen = [0, 59, 22];

    let baseColor;
    if (value <= 50) {
      baseColor = darkRed.map((channel, index) =>
        Math.round(channel + (darkYellow[index]! - channel) * (value / 50))
      );
    } else {
      baseColor = darkYellow.map((channel, index) =>
        Math.round(channel + (darkGreen[index]! - channel) * ((value - 50) / 50))
      );
    }

    // Darken the color
    return baseColor.map(channel => Math.max(0, channel - darkenFactor * 10));
  }

  const pulseIntensity = Math.max(0, (100 - (value || 0)) / 100); // More intense pulse at lower health

  // Calculate pulse duration based on health (5s at 100 health, 1s at 0 health)
  const pulseDuration = 5 - (4 * pulseIntensity);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-md bg-black/20 shadow-inner",
        className
      )}
      {...props}
    >
      <style jsx>{`
        @keyframes pulse {
          0% {
            background-color: rgb(${getColor(value || 0, 0).join(',')});
          }
          50% {
            background-color: rgb(${getColor(value || 0, pulseIntensity).join(',')});
          }
          100% {
            background-color: rgb(${getColor(value || 0, 0).join(',')});
          }
        }
      `}</style>
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          animation: `pulse ${pulseDuration}s ease-in-out infinite`,
        }}
      />
    </ProgressPrimitive.Root>
  );
})
HealthBar.displayName = ProgressPrimitive.Root.displayName

export { HealthBar }