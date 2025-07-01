const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface FirewallRule {
  id: string;
  name: string;
  action: 'Allow' | 'Deny' | 'Drop';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'Any';
  source_ip: string;
  destination_ip: string;
  source_port?: number;
  destination_port?: number;
  direction: 'Inbound' | 'Outbound' | 'Both';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NetworkInterface {
  id: number;
  name: string;
  alias?: string;
  interface_type: string;
  vrf_id?: number;
  role?: string;
  bandwidth_up?: number;
  bandwidth_down?: number;
  addressing_mode: 'Manual' | 'DHCP' | 'PPPoE';
  status?: string;
  manual_ip?: string;
  manual_netmask?: string;
  manual_gateway?: string;
  manual_dns?: string;
  dhcp_ip?: string;
  dhcp_netmask?: string;
  dhcp_gateway?: string;
  dhcp_dns?: string;
  pppoe_username?: string;
  pppoe_password?: string;
  pppoe_ip?: string;
  pppoe_netmask?: string;
  pppoe_gateway?: string;
  pppoe_dns?: string;
  last_renewed?: string;
  created_at: string;
  updated_at: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  log_type: string;
  message: string;
  severity?: string;
  source_ip?: string;
  dest_ip?: string;
  user?: string;
  action?: string;
}

export interface FirewallStatus {
  enabled: boolean;
  rules_count: number;
  active_connections: number;
  blocked_connections: number;
  uptime: string;
}

export interface FirewallStatistics {
  total_packets: number;
  total_bytes: number;
  blocked_packets: number;
  blocked_bytes: number;
  allowed_packets: number;
  allowed_bytes: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Firewall Rules
  async getRules(): Promise<FirewallRule[]> {
    return this.request<FirewallRule[]>('/rules');
  }

  async addRule(rule: Omit<FirewallRule, 'id' | 'created_at' | 'updated_at'>): Promise<FirewallRule> {
    return this.request<FirewallRule>('/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async deleteRule(id: string): Promise<void> {
    return this.request<void>(`/rules/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleRule(id: string): Promise<void> {
    return this.request<void>(`/rules/${id}/toggle`, {
      method: 'PUT',
    });
  }

  // Network Interfaces
  async getInterfaces(): Promise<NetworkInterface[]> {
    return this.request<NetworkInterface[]>('/network/interfaces');
  }

  async addInterface(iface: Omit<NetworkInterface, 'id' | 'created_at' | 'updated_at'>): Promise<NetworkInterface> {
    return this.request<NetworkInterface>('/network/interfaces', {
      method: 'POST',
      body: JSON.stringify(iface),
    });
  }

  async updateInterface(id: number, iface: Partial<NetworkInterface>): Promise<NetworkInterface> {
    return this.request<NetworkInterface>(`/network/interfaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(iface),
    });
  }

  async deleteInterface(id: number): Promise<void> {
    return this.request<void>(`/network/interfaces/${id}`, {
      method: 'DELETE',
    });
  }

  // Logs
  async getLogs(params?: {
    log_type?: string;
    from?: string;
    to?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<LogEntry[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    const endpoint = query ? `/logs?${query}` : '/logs';
    return this.request<LogEntry[]>(endpoint);
  }

  // Status and Statistics
  async getStatus(): Promise<FirewallStatus> {
    return this.request<FirewallStatus>('/status');
  }

  async getStatistics(): Promise<FirewallStatistics> {
    return this.request<FirewallStatistics>('/statistics');
  }

  async toggleFirewall(): Promise<void> {
    return this.request<void>('/toggle', {
      method: 'POST',
    });
  }

  // Dashboard Status
  async getDashboardStatus(): Promise<any> {
    return this.request<any>('/dashboard/status');
  }
}

export const apiClient = new ApiClient(); 