
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  actions,
  className
}) => {
  return (
    <div className={cn("mb-6 flex flex-col gap-1 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
            <Icon className="h-5 w-5 text-primary dark:text-primary-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold md:text-2xl dark:text-white">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="mt-4 flex items-center gap-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};
