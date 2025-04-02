export interface TimelineComment {
  _id: string;
  text: string;
  importance: 'info' | 'warning' | 'critical';
  user: string | { _id: string; name: string; email: string };
  timestamp: string;
  deployment_id: string;
}

export interface DeploymentTask {
  _id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deployment_id: string;
}

export interface WifiDeployment {
  _id: string;
  site_id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  start_date?: string;
  completion_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
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