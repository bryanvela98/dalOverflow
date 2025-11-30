# Frontend Build & Deployment Documentation

## Overview

This document describes how to build and deploy the Dal Overflow React frontend application on AWS EC2.

## Table of Contents
- [Project Structure](#project-structure)
- [Build Process](#build-process)
- [Environment Configuration](#environment-configuration)
- [AWS EC2 Deployment](#aws-ec2-deployment)
- [Deployment Steps](#deployment-steps)
- [Troubleshooting](#troubleshooting)

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── routes/         # Route definitions
│   ├── hooks/          # Custom hooks
│   ├── styles/         # CSS files
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── eslint.config.js    # ESLint configuration
```

## Build Process

### Development Dependencies

The frontend uses the following tools:

- **Build Tool**: Vite 7.1.7
- **Framework**: React 18.3.1
- **Linter**: ESLint 9.36.0
- **Node Version**: 16+ (recommended)

### Available Scripts

From `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

#### Script Descriptions

**Development Mode**
```bash
npm run dev
```
- Starts development server
- Hot module replacement enabled
- Runs on port 5173 (default) or configured port
- Source maps enabled for debugging

**Production Build**
```bash
npm run build
```
- Creates optimized production bundle
- Output directory: `dist/`
- Minifies JavaScript and CSS
- Tree-shaking to remove unused code
- Asset optimization and compression

**Linting**
```bash
npm run lint
```
- Checks code quality with ESLint
- Enforces React hooks rules
- Checks for unused variables

**Preview Build**
```bash
npm run preview
```
- Serves production build locally
- Tests build before deployment
- Runs on port 4173 (default)

### Build Configuration

From `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})
```

### Build Output

When running `npm run build`, Vite creates:

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── index-[hash].css     # Compiled CSS
│   └── [images/fonts]       # Optimized assets
├── index.html               # Entry HTML file
└── vite.svg                 # Favicon
```

Typical build size:
- JavaScript: 150-300KB (gzipped)
- CSS: 20-50KB (gzipped)
- Total: ~200-400KB

## Environment Configuration

### API Endpoint Configuration

The frontend does **not** use `.env` files for configuration. API endpoints are configured directly in the code.

**Current Configuration**

Backend API calls use hardcoded endpoints in component files:

Example from `CreateQuestion.jsx`:
```javascript
const response = await fetch("http://localhost:5001/api/questions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  credentials: "include",
  body: JSON.stringify(backendData),
});
```

**For Production Deployment**

Replace `localhost:5001` with production backend URL:
```javascript
const API_BASE_URL = "http://3.99.149.123:5001";

const response = await fetch(`${API_BASE_URL}/api/questions`, {
  // ... rest of config
});
```

**Recommended: Create Environment Variable Support**

Add `.env` file support for cleaner configuration:

1. Create `frontend/.env.production`:
```properties
VITE_API_URL=http://3.99.149.123:5001
```

2. Update code to use environment variable:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
```

3. Vite automatically loads `.env` files and exposes variables prefixed with `VITE_`

## AWS EC2 Deployment

### Current Deployment Configuration

**EC2 Instance Details**

- **Instance ID**: i-00e18d4c974230652
- **Instance Name**: Dal Overflow
- **Instance Type**: t3.micro
- **Region**: ca-central-1 (Canada Central)
- **Availability Zone**: ca-central-1a
- **AMI**: Amazon Linux 2023
- **Operating System**: Amazon Linux 2023.9.20251117

**Network Configuration**

- **VPC ID**: vpc-0ae2d8f35d17a8915
- **Subnet ID**: subnet-014e0a5463b1178ed
- **Public IPv4**: 3.99.149.123
- **Private IPv4**: 172.31.13.72
- **Public DNS**: ec2-3-99-149-123.ca-central-1.compute.amazonaws.com

**Access URLs**

- **Frontend**: http://3.99.149.123:8000
- **Backend API**: http://3.99.149.123:5001

**Software Versions Installed**

- **Node.js**: v20.19.5
- **npm**: 10.8.2
- **Python**: 3.9.24

### Security Group Configuration

Required inbound rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Frontend access |
| Custom TCP | TCP | 5001 | 0.0.0.0/0 | Backend API |
| PostgreSQL | TCP | 5432 | localhost | Database (internal only) |

### Prerequisites

**On Local Machine:**
- SSH key pair (.pem file) for EC2 access
- Git installed
- Node.js 16+ installed (for local testing)

**On EC2 Instance:**
- Node.js and npm installed
- Python 3 installed
- PostgreSQL installed and running
- Git installed
- Project repository cloned

## Deployment Steps

### Initial Setup

#### 1. Connect to EC2 Instance

```bash
# SSH into EC2 using ec2-user (Amazon Linux default user)
ssh -i /path/to/your-key.pem ec2-user@3.99.149.123

# Or use the DNS name
ssh -i /path/to/your-key.pem ec2-user@ec2-3-99-149-123.ca-central-1.compute.amazonaws.com
```

**Note**: The username is `ec2-user` for Amazon Linux 2023, not `ubuntu`.

#### 2. Install Node.js and npm

```bash
# Update package manager
sudo apt update  # Ubuntu/Debian
# or
sudo yum update  # Amazon Linux

# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### 3. Clone Repository

```bash
# Navigate to home directory
cd /home/ec2-user

# Clone repository (replace with your GitLab URL)
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git

# Navigate to project
cd group02
```

**Current Deployment**: Project is located at `/home/ec2-user/group02`

#### 4. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Verify installation
npm list  # Check for any errors
```

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Install Python dependencies
pip3 install -r requirements.txt

# Set up environment variables
nano .env
```

Add backend configuration:
```properties
PORT=5001
DB_URL=postgresql://app_user:Thah1eith8@localhost:5432/daloverflow
SECRET_KEY=dev-secret
```

### Frontend Deployment

#### Development Mode Deployment (Current Setup)

```bash
# Navigate to frontend directory
cd /home/ubuntu/group02/frontend

# Start development server
npm run dev
```

This starts the frontend on port 5173 by default.

**To run on port 8000:**

Option 1: Modify `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: '0.0.0.0'  // Allow external access
  }
})
```

Option 2: Use command line flag:
```bash
npm run dev -- --port 8000 --host
```

#### Production Build Deployment (Recommended)

For production, build and serve static files:

```bash
# Build production bundle
cd /home/ubuntu/group02/frontend
npm run build

# Serve using a simple HTTP server
npm install -g serve
serve -s dist -l 8000
```

### Running Both Services

#### Current Deployment Method: Using Screen Sessions

The Dal Overflow application currently uses **GNU Screen** to manage backend and frontend processes.

**Active Screen Sessions**:
- `backend` - Running Python backend (Detached)
- `frontend` - Running Vite development server (Detached)

##### Managing Screen Sessions

```bash
# List all screen sessions
screen -ls

# Output:
# There are screens on:
#     106681.frontend (Detached)
#     103028.backend  (Detached)

# Reattach to backend screen
screen -r backend

# Reattach to frontend screen
screen -r frontend

# Detach from screen (while inside screen session)
# Press: Ctrl+A, then D

# Kill a screen session
screen -X -S backend quit
screen -X -S frontend quit
```

##### Starting Services with Screen

**Start Backend**:
```bash
# Create new screen session for backend
screen -S backend

# Navigate to backend directory
cd /home/ec2-user/group02/backend

# Start backend
python3 app.py

# Detach: Press Ctrl+A, then D
```

**Start Frontend**:
```bash
# Create new screen session for frontend
screen -S frontend

# Navigate to frontend directory
cd /home/ec2-user/group02/frontend

# Start frontend on port 8000
npm run dev -- --host 0.0.0.0 --port 8000

# Detach: Press Ctrl+A, then D
```

##### Viewing Process Status

```bash
# Check if services are running
ps aux | grep python
ps aux | grep node

# Check ports
sudo netstat -tulpn | grep :8000  # Frontend
sudo netstat -tulpn | grep :5001  # Backend

# View logs (reattach to screen session)
screen -r backend  # See backend output
screen -r frontend # See frontend output
```

### Updating Deployment

When code changes are pushed to the repository:

```bash
# SSH into EC2
ssh -i /path/to/group02-key.pem ec2-user@3.99.149.123

# Navigate to project
cd /home/ec2-user/group02

# Pull latest changes
git pull origin develop

# Update frontend dependencies (if package.json changed)
cd frontend
npm install

# Update backend dependencies (if requirements.txt changed)
cd ../backend
pip3 install -r requirements.txt --user

# Restart services using screen
# Kill existing screen sessions
screen -X -S frontend quit
screen -X -S backend quit

# Start new screen sessions
# Backend
screen -S backend
cd /home/ec2-user/group02/backend
python3 app.py
# Press Ctrl+A, then D to detach

# Frontend
screen -S frontend
cd /home/ec2-user/group02/frontend
npm run dev -- --host 0.0.0.0 --port 8000
# Press Ctrl+A, then D to detach

# Verify services are running
screen -ls
ps aux | grep python
ps aux | grep node
```

## Verification

### Check Services Status

```bash
# Check screen sessions
screen -ls

# Check processes
ps aux | grep python    # Backend
ps aux | grep node      # Frontend

# Check ports
sudo netstat -tulpn | grep :8000  # Frontend
sudo netstat -tulpn | grep :5001  # Backend

# View actual running commands
ps aux | grep "python3 app.py"
ps aux | grep "vite"
```

### Test Endpoints

```bash
# Test frontend
curl http://3.99.149.123:8000

# Test backend API
curl http://3.99.149.123:5001/api/questions

# Test from browser
# Navigate to: http://3.99.149.123:8000
```

### Check Logs

```bash
# View backend logs (reattach to screen)
screen -r backend
# Press Ctrl+A, then D to detach

# View frontend logs (reattach to screen)
screen -r frontend
# Press Ctrl+A, then D to detach

# Check system logs for errors
sudo journalctl -n 50

# Check for Python errors
sudo journalctl | grep python | tail -20
```

## Troubleshooting

### SSH Key Access Issues

**Issue**: `Permission denied (publickey)` when trying to SSH

**Solutions**:

1. **Verify you have the correct key file**: `group02-key.pem`

2. **Check key file permissions**:
```bash
# Key must have 400 permissions
chmod 400 /path/to/group02-key.pem
ls -la /path/to/group02-key.pem
# Should show: -r--------
```

3. **Use correct username**: `ec2-user` (not `ubuntu`)
```bash
ssh -i /path/to/group02-key.pem ec2-user@3.99.149.123
```

4. **Verify key matches EC2 instance**:
```bash
# Check key fingerprint
ssh-keygen -l -E md5 -f /path/to/group02-key.pem
# Compare with key fingerprint in AWS Console
```

5. **Contact team member with access**:
   - If you don't have the correct `.pem` file, contact the team member who created the EC2 instance
   - AWS only allows downloading the `.pem` file once during key pair creation
   - Team members with access can add your SSH public key to the server

6. **Alternative access methods**:
   - Use AWS Systems Manager Session Manager (requires SSM Agent configuration)
   - Use EC2 Instance Connect (may not work on all instances)
   - Ask team member to add your SSH public key to `~/.ssh/authorized_keys`

## Troubleshooting

### Frontend Not Accessible

**Issue**: Cannot access http://3.99.149.123:8000

**Solutions**:

1. Check if frontend screen session is running:
```bash
screen -ls
# Should show: 106681.frontend (Detached)
```

2. Check if frontend process is running:
```bash
ps aux | grep vite
# Should show: node .../vite --host 0.0.0.0 --port 8000
```

3. Check if port is open:
```bash
sudo netstat -tulpn | grep :8000
# Should show: tcp 0.0.0.0:8000 ... LISTEN ... /node
```

4. Verify security group allows port 8000 inbound traffic (AWS Console)

5. Restart frontend:
```bash
# Kill existing session
screen -X -S frontend quit

# Start new session
screen -S frontend
cd /home/ec2-user/group02/frontend
npm run dev -- --host 0.0.0.0 --port 8000
# Press Ctrl+A, then D
```

### Build Errors

**Issue**: `npm run build` fails

**Solutions**:

1. Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. Check Node version:
```bash
node --version  # Should be 16+
```

3. Check for disk space:
```bash
df -h
```

4. Review error logs and fix code issues

### API Connection Errors

**Issue**: Frontend cannot connect to backend

**Solutions**:

1. Verify backend is running on port 5001:
```bash
curl http://localhost:5001/api/questions
```

2. Check CORS configuration in backend

3. Verify API URLs in frontend code use correct IP (3.99.149.123:5001)

4. Check browser console for specific error messages

### Port Already in Use

**Issue**: Error: Port 8000 is already in use

**Solutions**:

1. Find process using port:
```bash
sudo lsof -i :8000
```

2. Kill the process:
```bash
sudo kill -9 <PID>
```

3. Or use different port:
```bash
npm run dev -- --port 8001 --host
```

### Permission Denied Errors

**Issue**: Permission errors when running commands

**Solutions**:

1. Fix ownership:
```bash
sudo chown -R ubuntu:ubuntu /home/ubuntu/group02
```

2. Fix permissions:
```bash
chmod -R 755 /home/ubuntu/group02
```

### EC2 Instance Restart

**Important**: After EC2 instance restarts, Screen sessions will be lost and services won't auto-start.

**To restart services after EC2 reboot**:

```bash
# SSH into EC2
ssh -i /path/to/group02-key.pem ec2-user@3.99.149.123

# Start backend
screen -S backend
cd /home/ec2-user/group02/backend
python3 app.py
# Press Ctrl+A, then D

# Start frontend
screen -S frontend
cd /home/ec2-user/group02/frontend
npm run dev -- --host 0.0.0.0 --port 8000
# Press Ctrl+A, then D

# Verify
screen -ls
```

**Recommendation for Production**: Consider using a process manager like PM2 or systemd services for auto-restart on system reboot.

## Performance Optimization

### Frontend Optimization

1. **Enable Gzip Compression**

If using nginx (recommended for production):
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Browser Caching**

Configure cache headers for static assets:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Bundle Analysis**

Check bundle size:
```bash
npm run build
ls -lh dist/assets/
```

### Resource Monitoring

```bash
# Monitor CPU and memory
htop

# Monitor disk usage
df -h

# Monitor network
sudo iftop
```

## Production Recommendations

### 1. Use Production Build

Instead of `npm run dev`, use production build:

```bash
npm run build
serve -s dist -l 8000
```

Or set up nginx to serve static files.

### 2. Set Up Nginx Reverse Proxy

Install and configure nginx:

```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/daloverflow
```

Example configuration:
```nginx
server {
    listen 80;
    server_name 3.99.149.123;

    # Frontend
    location / {
        root /home/ubuntu/group02/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/daloverflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Enable HTTPS

Use Let's Encrypt for free SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 4. Set Up Monitoring

Use CloudWatch for monitoring:
- CPU utilization
- Network in/out
- Disk I/O
- Memory usage

### 5. Enable Auto-scaling (Future)

For high traffic, consider:
- Application Load Balancer
- Auto Scaling Group
- Multiple EC2 instances

### 6. Database Backup

Regular PostgreSQL backups:
```bash
pg_dump daloverflow > backup_$(date +%Y%m%d).sql
```

## Cost Optimization

**Current Setup Cost (Approximate)**:
- EC2 t3.micro: ~$7.50/month
- EBS storage (8GB): ~$0.80/month
- Data transfer: Variable
- **Total**: ~$8-10/month

**Cost Saving Tips**:
1. Stop instance when not in use (development)
2. Use Reserved Instances for long-term (1-year commitment)
3. Monitor CloudWatch for unused resources
4. Set up billing alerts

## Screenshots

### EC2 Instance Dashboard

![EC2 Dashboard](screenshots/ec2-dashboard.png)
*EC2 instance running Dal Overflow application*

### Security Group Configuration

![Security Groups](screenshots/security-groups.png)
*Inbound rules for ports 22, 8000, 5001*

### Application Running

![Frontend](screenshots/frontend-running.png)
*Dal Overflow frontend accessible at http://3.99.149.123:8000*

### PM2 Process Manager

![PM2 Status](screenshots/pm2-status.png)
*Both frontend and backend services running under PM2*

---

Document Version: 1.0  
Last Updated: November 29, 2024  
Course: CSCI-5308 - Software Engineering  
Team: Group 02