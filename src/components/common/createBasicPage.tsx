
import React from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";

// Helper function to create basic admin pages with minimal boilerplate
export const createBasicPage = (title, description, Icon) => {
  const Page = () => {
    return (
      <AdminPageTemplate
        title={title}
        description={description}
        icon={Icon}
      >
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">This page is under development</h2>
          <p className="text-gray-600">
            The {title} page is currently being implemented. Check back soon for full functionality.
          </p>
        </div>
      </AdminPageTemplate>
    );
  };

  // Set display name for debugging purposes
  Page.displayName = title.replace(/\s+/g, '') + 'Page';
  
  return Page;
};
