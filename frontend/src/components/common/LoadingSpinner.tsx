import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
    </div>
  );
};