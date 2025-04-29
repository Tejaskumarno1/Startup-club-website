
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface NavButton {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: string;
  description?: string;
}

interface NavigationButtonCardProps {
  title: string;
  description: string;
  buttons: NavButton[];
  onNavigate: (href: string) => void;
  columns?: number;
}

export const NavigationButtonCard: React.FC<NavigationButtonCardProps> = ({
  title,
  description,
  buttons,
  onNavigate,
  columns = 4
}) => {
  // Determine grid columns based on props or default to 4
  const gridColsClass = 
    columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
    columns === 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" :
    columns === 4 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" :
    columns === 5 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5" :
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridColsClass} gap-3`}>
          {buttons.map((button, index) => {
            const ButtonIcon = button.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                onClick={() => onNavigate(button.href)}
                style={{ borderColor: `${button.color}30` }}
                title={button.description || button.label}
              >
                <ButtonIcon 
                  className="h-6 w-6 mb-1" 
                  style={{ color: button.color }}
                />
                <span className="text-xs text-center line-clamp-2">{button.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
};
