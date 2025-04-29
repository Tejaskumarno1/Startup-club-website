
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "./PageHeader";
import { LucideIcon } from "lucide-react";

interface PageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  description, 
  icon,
  children,
  headerActions
}) => {
  return (
    <MainLayout>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={headerActions}
      />
      {children}
    </MainLayout>
  );
};
