import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardWidgetProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function DashboardWidget({ 
  title, 
  icon, 
  description, 
  actions, 
  children 
}: DashboardWidgetProps) {
  return (
    <Card className="border border-gray-200 border rounded-none bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base font-semibold text-gray-900">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{title}</span>
          </CardTitle>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
} 