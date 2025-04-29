
import React from 'react';
import { AdminPageTemplate } from '@/components/admin/AdminPageTemplate';
import { SponsorManagement } from '@/components/admin/sponsors/SponsorManagement';
import { Handshake } from 'lucide-react';

export default function ManageSponsors() {
  return (
    <AdminPageTemplate
      title="Sponsor Management"
      description="Add and manage website sponsors"
      icon={Handshake}
    >
      <SponsorManagement />
    </AdminPageTemplate>
  );
}
