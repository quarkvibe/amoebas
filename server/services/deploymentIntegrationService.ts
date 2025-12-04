import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { activityMonitor } from './activityMonitor';

const execAsync = promisify(exec);

/**
 * Deployment Integration Service
 * Detects existing services, suggests DNS/proxy configuration
 * Helps Amoeba integrate seamlessly with existing infrastructure
 * 
 * Following ARCHITECTURE.md:
 * - Single responsibility: Deployment detection and guidance
 * - Cellular isolation: Independent service
 * - Information dense: Complete deployment intelligence
 */

export interface ServiceDetection {
  port: number;
  processName: string;
  pid: number;
  command?: string;
}

export interface DeploymentRecommendation {
  scenario: string;
  description: string;
  nginxConfig?: string;
  dnsConfig?: {
    type: 'A' | 'CNAME' | 'subdomain';
    record: string;
    value: string;
    ttl: number;
  };
  steps: string[];
  warnings?: string[];
}

export interface DeploymentStatus {
  currentPort: number;
  portAvailable: boolean;
  conflictingServices: ServiceDetection[];
  nginxInstalled: boolean;
  nginxRunning: boolean;
  sslAvailable: boolean;
  recommendations: DeploymentRecommendation[];
  suggestedSubdomain: string;
  publicIP?: string;
  hostname?: string;
}

class DeploymentIntegrationService {
  
  /**
   * Analyze current deployment environment
   */
  async analyzeEnvironment(): Promise<DeploymentStatus> {
    activityMonitor.logActivity('info', '🔍 Analyzing deployment environment...');
    
    const currentPort = parseInt(process.env.PORT || '5000', 10);
    
    // Detect conflicting services
    const conflictingServices = await this.detectPortConflicts(currentPort);
    const portAvailable = conflictingServices.length === 0;
    
    // Check for nginx
    const nginxInstalled = await this.isNginxInstalled();
    const nginxRunning = await this.isNginxRunning();
    
    // Check for SSL/certificates
    const sslAvailable = await this.hasSSLCertificates();
    
    // Get public IP
    const publicIP = await this.getPublicIP();
    
    // Get hostname
    const hostname = os.hostname();
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations({
      portAvailable,
      conflictingServices,
      nginxInstalled,
      nginxRunning,
      currentPort,
    });
    
    // Suggest subdomain
    const suggestedSubdomain = this.suggestSubdomain();
    
    activityMonitor.logActivity('success', '✅ Environment analysis complete');
    
    return {
      currentPort,
      portAvailable,
      conflictingServices,
      nginxInstalled,
      nginxRunning,
      sslAvailable,
      recommendations,
      suggestedSubdomain,
      publicIP,
      hostname,
    };
  }
  
  /**
   * Detect services running on same or nearby ports
   */
  private async detectPortConflicts(targetPort: number): Promise<ServiceDetection[]> {
    const conflicts: ServiceDetection[] = [];
    
    try {
      // Check ports around target (target ± 5)
      const portsToCheck = [
        targetPort,
        ...Array.from({ length: 10 }, (_, i) => targetPort - 5 + i)
      ].filter(p => p > 0 && p < 65536);
      
      for (const port of portsToCheck) {
        const service = await this.checkPort(port);
        if (service) {
          conflicts.push(service);
        }
      }
      
      activityMonitor.logActivity('debug', `Found ${conflicts.length} conflicting services`);
    } catch (error: any) {
      activityMonitor.logError(error, 'Port conflict detection');
    }
    
    return conflicts;
  }
  
  /**
   * Check if specific port is in use
   */
  private async checkPort(port: number): Promise<ServiceDetection | null> {
    try {
      // Use lsof on Unix-like systems
      if (process.platform !== 'win32') {
        const { stdout } = await execAsync(`lsof -i :${port} -t -sTCP:LISTEN`);
        
        if (stdout.trim()) {
          const pid = parseInt(stdout.trim(), 10);
          const processInfo = await this.getProcessInfo(pid);
          
          return {
            port,
            pid,
            processName: processInfo.name,
            command: processInfo.command,
          };
        }
      } else {
        // Windows: Use netstat
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        if (stdout.trim()) {
          // Parse Windows netstat output
          const lines = stdout.trim().split('\n');
          if (lines.length > 0) {
            return {
              port,
              pid: 0, // Would need to parse PID from netstat
              processName: 'Unknown (Windows)',
            };
          }
        }
      }
    } catch (error) {
      // Port not in use or error checking
    }
    
    return null;
  }
  
  /**
   * Get process information by PID
   */
  private async getProcessInfo(pid: number): Promise<{ name: string; command?: string }> {
    try {
      const { stdout } = await execAsync(`ps -p ${pid} -o comm=,args=`);
      const parts = stdout.trim().split(/\s+/);
      
      return {
        name: parts[0] || 'Unknown',
        command: parts.slice(1).join(' '),
      };
    } catch (error) {
      return { name: 'Unknown' };
    }
  }
  
  /**
   * Check if nginx is installed
   */
  private async isNginxInstalled(): Promise<boolean> {
    try {
      await execAsync('which nginx');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check if nginx is running
   */
  private async isNginxRunning(): Promise<boolean> {
    try {
      if (process.platform !== 'win32') {
        const { stdout } = await execAsync('pgrep nginx');
        return stdout.trim().length > 0;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Check for SSL certificates
   */
  private async hasSSLCertificates(): Promise<boolean> {
    try {
      // Check for Let's Encrypt certificates
      const letsencryptPath = '/etc/letsencrypt/live';
      const stats = await fs.stat(letsencryptPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get public IP address
   */
  private async getPublicIP(): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync('curl -s ifconfig.me');
      return stdout.trim();
    } catch (error) {
      return undefined;
    }
  }
  
  /**
   * Suggest subdomain name
   */
  private suggestSubdomain(): string {
    // Suggest based on hostname or default
    const hostname = os.hostname();
    
    if (hostname.includes('prod') || hostname.includes('production')) {
      return 'amoeba.yourdomain.com';
    } else if (hostname.includes('stage') || hostname.includes('staging')) {
      return 'amoeba-staging.yourdomain.com';
    } else if (hostname.includes('dev')) {
      return 'amoeba-dev.yourdomain.com';
    }
    
    return 'amoeba.yourdomain.com';
  }
  
  /**
   * Generate deployment recommendations
   */
  private async generateRecommendations(context: any): Promise<DeploymentRecommendation[]> {
    const recommendations: DeploymentRecommendation[] = [];
    
    // Scenario 1: Port conflict exists
    if (!context.portAvailable && context.conflictingServices.length > 0) {
      recommendations.push(this.getPortConflictRecommendation(context));
    }
    
    // Scenario 2: Nginx installed, recommend reverse proxy
    if (context.nginxInstalled) {
      recommendations.push(this.getNginxProxyRecommendation(context));
    }
    
    // Scenario 3: No nginx, recommend installation
    if (!context.nginxInstalled) {
      recommendations.push(this.getNginxInstallRecommendation());
    }
    
    // Scenario 4: Subdomain configuration
    recommendations.push(this.getSubdomainRecommendation(context));
    
    // Scenario 5: SSL/HTTPS setup
    recommendations.push(this.getSSLRecommendation(context));
    
    return recommendations;
  }
  
  /**
   * Recommendation for port conflicts
   */
  private getPortConflictRecommendation(context: any): DeploymentRecommendation {
    const conflicts = context.conflictingServices.map((s: ServiceDetection) => 
      `  - Port ${s.port}: ${s.processName} (PID: ${s.pid})`
    ).join('\n');
    
    return {
      scenario: 'Port Conflict Detected',
      description: `Port ${context.currentPort} is already in use by another service.`,
      steps: [
        `Conflicting services:\n${conflicts}`,
        `Option 1: Change Amoeba port in .env:\n  PORT=5001 (or any available port)`,
        `Option 2: Stop conflicting service if not needed`,
        `Option 3: Use nginx reverse proxy (recommended for production)`,
      ],
      warnings: [
        'Changing port requires server restart',
        'Ensure firewall allows the new port',
      ],
    };
  }
  
  /**
   * Recommendation for nginx reverse proxy
   */
  private getNginxProxyRecommendation(context: any): DeploymentRecommendation {
    const amoebaPort = context.currentPort;
    const subdomain = 'amoeba.yourdomain.com';
    
    const nginxConfig = `
# /etc/nginx/sites-available/amoeba
server {
    listen 80;
    server_name ${subdomain};
    
    # Redirect HTTP to HTTPS (after SSL is configured)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://localhost:${amoebaPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support for terminal
        proxy_read_timeout 86400;
    }
    
    # Health check endpoint (optional)
    location /healthz {
        proxy_pass http://localhost:${amoebaPort}/api/testing/health;
        access_log off;
    }
}

# HTTPS configuration (after obtaining SSL certificate)
# server {
#     listen 443 ssl http2;
#     server_name ${subdomain};
#     
#     ssl_certificate /etc/letsencrypt/live/${subdomain}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${subdomain}/privkey.pem;
#     
#     # Same proxy configuration as above
#     location / {
#         proxy_pass http://localhost:${amoebaPort};
#         # ... (same proxy settings)
#     }
# }
`.trim();
    
    return {
      scenario: 'Nginx Reverse Proxy (Recommended)',
      description: 'Use nginx to route subdomain to Amoeba, allowing it to coexist with other services',
      nginxConfig,
      dnsConfig: {
        type: 'A',
        record: subdomain,
        value: context.publicIP || 'YOUR_SERVER_IP',
        ttl: 3600,
      },
      steps: [
        `1. Create nginx configuration file:\n   sudo nano /etc/nginx/sites-available/amoeba`,
        `2. Paste the configuration above`,
        `3. Enable the site:\n   sudo ln -s /etc/nginx/sites-available/amoeba /etc/nginx/sites-enabled/`,
        `4. Test nginx configuration:\n   sudo nginx -t`,
        `5. Reload nginx:\n   sudo systemctl reload nginx`,
        `6. Configure DNS (see DNS Config below)`,
        `7. Access Amoeba at: http://${subdomain}`,
      ],
      warnings: [
        'Ensure nginx is configured to proxy WebSocket connections (for terminal)',
        'Add firewall rules to allow HTTP/HTTPS (ports 80, 443)',
      ],
    };
  }
  
  /**
   * Recommendation for nginx installation
   */
  private getNginxInstallRecommendation(): DeploymentRecommendation {
    const platform = process.platform;
    let installCmd = '';
    
    if (platform === 'darwin') {
      installCmd = 'brew install nginx';
    } else if (platform === 'linux') {
      installCmd = 'sudo apt install nginx -y  # or: sudo yum install nginx -y';
    }
    
    return {
      scenario: 'Install Nginx (Recommended for Production)',
      description: 'Nginx allows multiple services to run on one server with different subdomains',
      steps: [
        `1. Install nginx:\n   ${installCmd}`,
        `2. Start nginx:\n   sudo systemctl start nginx`,
        `3. Enable on boot:\n   sudo systemctl enable nginx`,
        `4. Verify running:\n   sudo systemctl status nginx`,
        `5. Then configure reverse proxy (see Nginx Reverse Proxy recommendation)`,
      ],
    };
  }
  
  /**
   * DNS/Subdomain configuration recommendation
   */
  private getSubdomainRecommendation(context: any): DeploymentRecommendation {
    const suggestedSubdomain = 'amoeba.yourdomain.com';
    const publicIP = context.publicIP || 'YOUR_SERVER_IP';
    
    return {
      scenario: 'DNS Configuration',
      description: 'Configure your domain nameserver to point subdomain to this server',
      dnsConfig: {
        type: 'A',
        record: suggestedSubdomain,
        value: publicIP,
        ttl: 3600,
      },
      steps: [
        `1. Access your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)`,
        `2. Navigate to DNS settings`,
        `3. Add A record:`,
        `   Type: A`,
        `   Name: amoeba (or your preferred subdomain)`,
        `   Value: ${publicIP}`,
        `   TTL: 3600 (1 hour)`,
        `4. Save changes`,
        `5. Wait for DNS propagation (5-30 minutes)`,
        `6. Test: ping ${suggestedSubdomain}`,
        `7. Access Amoeba: http://${suggestedSubdomain}`,
      ],
      warnings: [
        'DNS changes can take 5-30 minutes to propagate globally',
        'Some registrars cache DNS for up to 24 hours',
        'Test with: dig amoeba.yourdomain.com or nslookup amoeba.yourdomain.com',
      ],
    };
  }
  
  /**
   * SSL certificate recommendation
   */
  private getSSLRecommendation(context: any): DeploymentRecommendation {
    const subdomain = 'amoeba.yourdomain.com';
    
    return {
      scenario: 'SSL Certificate (HTTPS)',
      description: 'Secure your Amoeba installation with free Let\'s Encrypt SSL',
      steps: [
        `1. Ensure DNS is configured and propagated (wait 30 min after DNS setup)`,
        `2. Install certbot:\n   sudo apt install certbot python3-certbot-nginx`,
        `3. Obtain certificate:\n   sudo certbot --nginx -d ${subdomain}`,
        `4. Certbot will automatically:\n   - Obtain certificate\n   - Update nginx config\n   - Configure HTTPS redirect`,
        `5. Test auto-renewal:\n   sudo certbot renew --dry-run`,
        `6. Access Amoeba: https://${subdomain} (secure!)`,
      ],
      warnings: [
        'DNS must be configured BEFORE running certbot',
        'Port 80 must be accessible (certbot uses it for verification)',
        'Certificates auto-renew every 90 days',
      ],
    };
  }
  
  /**
   * Generate nginx configuration for specific scenario
   */
  generateNginxConfig(options: {
    subdomain: string;
    amoebaPort: number;
    sslEnabled: boolean;
    existingServices?: Array<{ path: string; port: number }>;
  }): string {
    
    const { subdomain, amoebaPort, sslEnabled, existingServices } = options;
    
    const config = `
# Amoeba AI Platform - Nginx Configuration
# Generated by Amoeba Deployment Integration Service

# HTTP server (redirect to HTTPS if SSL enabled)
server {
    listen 80;
    server_name ${subdomain};
    
    ${sslEnabled ? `
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
    ` : `
    # Proxy to Amoeba (HTTP only - configure SSL for production!)
    location / {
        proxy_pass http://localhost:${amoebaPort};
        proxy_http_version 1.1;
        
        # WebSocket support (required for terminal)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts (important for long-running AI generations)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    `}
}
${sslEnabled ? `
# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${subdomain};
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/${subdomain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${subdomain}/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Amoeba
    location / {
        proxy_pass http://localhost:${amoebaPort};
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check (public, no auth)
    location /healthz {
        proxy_pass http://localhost:${amoebaPort}/api/testing/health;
        access_log off;
    }
}
` : ''}
# Additional service routing (if you have other apps on same server)
${existingServices && existingServices.length > 0 ? existingServices.map(svc => `
# ${svc.path} → Port ${svc.port}
# location ${svc.path} {
#     proxy_pass http://localhost:${svc.port};
# }
`).join('\n') : ''}
`.trim();
    
    return config;
  }
  
  /**
   * Detect other web services on common ports
   */
  async detectExistingServices(): Promise<Array<{ name: string; port: number; url?: string }>> {
    const commonPorts = [80, 443, 3000, 3001, 4000, 8000, 8080, 8443, 9000];
    const services: Array<{ name: string; port: number; url?: string }> = [];
    
    for (const port of commonPorts) {
      const service = await this.checkPort(port);
      if (service) {
        services.push({
          name: service.processName,
          port: service.port,
          url: port === 80 ? 'http://localhost' : port === 443 ? 'https://localhost' : `http://localhost:${port}`,
        });
      }
    }
    
    return services;
  }
  
  /**
   * Validate DNS configuration
   */
  async validateDNS(domain: string): Promise<{
    configured: boolean;
    pointsToThisServer: boolean;
    resolvedIP?: string;
    serverIP?: string;
    message: string;
  }> {
    
    try {
      // Resolve domain to IP
      const { stdout } = await execAsync(`dig +short ${domain} A`);
      const resolvedIP = stdout.trim().split('\n')[0];
      
      // Get server's public IP
      const serverIP = await this.getPublicIP();
      
      const pointsToThisServer = resolvedIP === serverIP;
      
      return {
        configured: !!resolvedIP,
        pointsToThisServer,
        resolvedIP,
        serverIP,
        message: pointsToThisServer 
          ? `✅ DNS correctly configured: ${domain} → ${resolvedIP}`
          : resolvedIP
            ? `⚠️ DNS points to ${resolvedIP} but server IP is ${serverIP}`
            : `❌ DNS not configured for ${domain}`,
      };
    } catch (error: any) {
      return {
        configured: false,
        pointsToThisServer: false,
        message: `❌ Error checking DNS: ${error.message}`,
      };
    }
  }
  
  /**
   * Get deployment health summary
   */
  async getDeploymentHealth(): Promise<{
    status: 'optimal' | 'functional' | 'needs_attention' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    
    const analysis = await this.analyzeEnvironment();
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Check for port conflicts
    if (!analysis.portAvailable) {
      issues.push(`Port conflict on ${analysis.currentPort}`);
      recommendations.push('Change PORT in .env or stop conflicting service');
      score -= 30;
    }
    
    // Check for nginx
    if (!analysis.nginxInstalled) {
      issues.push('Nginx not installed');
      recommendations.push('Install nginx for production reverse proxy');
      score -= 20;
    } else if (!analysis.nginxRunning) {
      issues.push('Nginx installed but not running');
      recommendations.push('Start nginx: sudo systemctl start nginx');
      score -= 15;
    }
    
    // Check for SSL
    if (!analysis.sslAvailable) {
      issues.push('No SSL certificates found');
      recommendations.push('Configure SSL with Let\'s Encrypt for HTTPS');
      score -= 15;
    }
    
    // Determine status
    let status: 'optimal' | 'functional' | 'needs_attention' | 'critical';
    if (score >= 90) status = 'optimal';
    else if (score >= 70) status = 'functional';
    else if (score >= 50) status = 'needs_attention';
    else status = 'critical';
    
    return {
      status,
      score,
      issues,
      recommendations,
    };
  }
}

export const deploymentIntegrationService = new DeploymentIntegrationService();

