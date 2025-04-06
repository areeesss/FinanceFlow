import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export const LoadingSpinner = ({
  size = "md",
  className = "",
  fullScreen = false,
}: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
        <Loader2
          className={cn(
            "animate-spin text-primary",
            sizeMap[size],
            className
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeMap[size],
          className
        )}
      />
    </div>
  );
};