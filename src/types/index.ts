export interface User {
  id: string;
  email: string;
  role: 'admin' | 'group_owner' | 'contributor' | 'reader';
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  primary_contact: string;
  created_at: string;
  notes?: string;
  created_by: string;
}

export interface Site {
  id: string;
  group_id: string;
  name: string;
  address: string;
  gps_coordinates?: string;
  onsite_contact: string;
  created_at: string;
  created_by: string;
}

export interface WANDeployment {
  id?: string;  // Client-side ID (temporary)
  _id?: string; // MongoDB ID
  site_id: string;
  provider: string;
  link_type: 'FTTO' | 'FTTH' | 'Starlink' | 'ADSL' | 'VDSL' | 'OTHER' | string;
  bandwidth: string;
  status: 'ordered' | 'active' | 'inactive' | 'canceled' | string;
  subscribed_by_site?: boolean;
  order_date?: string;
  activation_date?: string;
  cancellation_date?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
}

export interface Document {
  _id: string;
  site_id: string;
  name: string;
  type: string;
  description?: string;
  is_external: boolean;
  url?: string;
  file_info?: {
    filename: string;
    file_id: string;
    mime_type: string;
    size: number;
  };
  tags: string[];
  module: 'wifi' | 'wan' | 'particularities';
  created_by: User | string;
  created_at: string;
  updated_at: string;
  updated_by?: User | string;
  comments: {
    _id: string;
    text: string;
    user: string;
    timestamp: string;
  }[];
}

export interface Event {
  id: string;
  site_id: string;
  type: 'document_added' | 'wan_updated' | 'site_updated';
  description: string;
  created_at: string;
  created_by: string;
}

export interface Comment {
  _id: string;
  text: string;
  user: User | string;
  timestamp: string;
}

export interface DocumentActivity {
  _id: string;
  document_id: string;
  action: 'created' | 'updated' | 'deleted' | 'commented';
  user: User | string;
  timestamp: string;
  details?: string;
}