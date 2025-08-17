import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAccessButton() {
  const [isVisible, setIsVisible] = useState(true);

  const goToAdmin = () => {
    window.location.href = "/admin";
  };

  const hideButton = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        {/* Main admin access button */}
        <Button
          onClick={goToAdmin}
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Settings className="w-6 h-6 text-white" />
        </Button>
        
        {/* Close button (appears on hover) */}
        <Button
          onClick={hideButton}
          size="sm"
          variant="outline"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-0"
        >
          <X className="w-3 h-3 text-gray-600 hover:text-red-600" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Admin Panel
        </div>
      </div>
    </div>
  );
}