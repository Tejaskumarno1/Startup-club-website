
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

interface AdminPageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const AdminPageTemplate: React.FC<AdminPageTemplateProps> = ({ 
  title, 
  description, 
  icon,
  children
}) => {
  return (
    <MainLayout>
      <div className="container py-6">
        <PageHeader
          title={title}
          description={description}
          icon={icon}
        />
        
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
          <aside className="hidden md:block">
            <AdminNavigation />
          </aside>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};
