# Deployment Guide

## Architecture Overview

The application uses a three-tier architecture:

- **Frontend**: React application hosted on Vercel
- **Backend**: Flask REST API running on Dal VM (csci5308-vm2.research.cs.dal.ca)
- **Database**: PostgreSQL database server
- **Tunnel**: Ngrok tunnel for HTTPS access to backend (development/testing only)

**Production URLs:**

- Frontend: https://frontend-five-roan-92.vercel.app
- Backend (via ngrok): https://[your-ngrok-url].ngrok-free.dev
- Backend (direct): http://csci5308-vm2.research.cs.dal.ca:5001

## Prerequisites

### For Backend Deployment

- SSH access to Dal VM (csci5308-vm2.research.cs.dal.ca)
- Python 3.10 or higher installed on the VM
- PostgreSQL 12 or higher
- Git configured with repository access
- Required GitLab CI/CD variables configured (see Environment Variables section)

### For Frontend Deployment

- Vercel account with deployment access
- Node.js v16 or higher (for local builds)
- npm v7 or higher

### For CI/CD Pipeline

- GitLab Runner registered with "deployment" tag
- SSH key pair for VM access
- All required environment variables configured in GitLab

## Environment Variables

### Backend Variables

Configure these in GitLab CI/CD Variables (Settings > CI/CD > Variables):

| Variable                   | Type     | Protected | Masked | Description                                                                                         |
| -------------------------- | -------- | --------- | ------ | --------------------------------------------------------------------------------------------------- |
| `DB_URL`                   | Variable | No        | Yes    | PostgreSQL connection string: `postgresql://user:password@host:port/database`                       |
| `SECRET_KEY`               | Variable | No        | Yes    | Flask session secret key (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `GEMINI_API_KEY`           | Variable | No        | Yes    | Google Gemini API key for AI features                                                               |
| `FLASK_PORT`               | Variable | No        | No     | Port number (default: 5001)                                                                         |
| `SERVER_IP`                | Variable | No        | No     | VM hostname: `csci5308-vm2.research.cs.dal.ca`                                                      |
| `SERVER_USER`              | Variable | No        | No     | SSH username (e.g., `deployer`)                                                                     |
| `ID_RSA`                   | File     | No        | N/A    | Private SSH key for VM access                                                                       |
| `CLOUDINARY_CLOUD_NAME`    | Variable | No        | No     | Cloudinary cloud name for image uploads                                                             |
| `CLOUDINARY_UPLOAD_PRESET` | Variable | No        | No     | Cloudinary upload preset                                                                            |

### Frontend Variables

| Variable       | Type     | Description                                                    |
| -------------- | -------- | -------------------------------------------------------------- |
| `VERCEL_TOKEN` | Variable | Vercel deployment token from https://vercel.com/account/tokens |
| `VITE_API_URL` | Variable | Backend API URL (set in `frontend/src/constants/apiConfig.js`) |

### DCode Integration Variables

| Variable           | Type     | Description                                  |
| ------------------ | -------- | -------------------------------------------- |
| `DCODE_PROJECT_ID` | Variable | DCodeHub project ID for code quality metrics |
| `DCODE_API_KEY`    | Variable | DCodeHub API key                             |

## Backend Deployment

### Initial Setup on Dal VM

1. **Connect to the VM**

```bash
ssh deployer@csci5308-vm2.research.cs.dal.ca
```

2. **Clone the repository**

```bash
cd ~
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git
cd group02
```

3. **Configure Git credentials for HTTPS**

Since SSH is blocked from the VM, use HTTPS with Personal Access Token:

```bash
git config credential.helper store
git pull origin develop  # Enter token when prompted
```

4. **Set up Python virtual environment**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

5. **Create .env file**

```bash
cat > .env << EOF
PORT=5001
DB_URL=postgresql://username:password@host:5432/database
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-preset
EOF
```

6. **Start the application**

```bash
# For testing (foreground)
python app.py

# For production (background)
nohup python app.py > flask.log 2>&1 &
```

7. **Verify the application is running**

```bash
lsof -i :5001
curl http://localhost:5001/api/questions
```

### Setting Up Ngrok Tunnel (Optional for HTTPS)

Ngrok provides HTTPS access to the backend during development and testing:

1. **Install ngrok**

```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

2. **Configure ngrok**

Sign up at https://dashboard.ngrok.com and get your auth token:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

3. **Start ngrok tunnel**

```bash
nohup ngrok http 5001 > ngrok.log 2>&1 &
```

4. **Get the HTTPS URL**

```bash
curl http://localhost:4040/api/tunnels | grep -o 'https://[^"]*'
```

5. **Update frontend configuration**

Update `frontend/src/constants/apiConfig.js` with the ngrok URL.

### Automated Deployment via GitLab CI/CD

The recommended deployment method uses the GitLab pipeline:

1. **Navigate to GitLab Pipelines**

Visit: https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02/-/pipelines

2. **Find the latest pipeline**

Click on the pipeline for your recent commit to the develop or main branch.

3. **Trigger deployment**

In the "deploy" stage, click the play button next to `deploy_backend_to_vm`.

The pipeline will:

- Connect to the VM via SSH
- Pull the latest code from develop branch
- Install dependencies
- Create .env file with GitLab CI/CD variables
- Restart the Flask application
- Verify the application is running

### Manual Deployment

If you need to deploy manually without the pipeline:

```bash
# On your local machine
cd /path/to/group02
git pull origin develop

# On the VM
ssh deployer@csci5308-vm2.research.cs.dal.ca << 'EOF'
cd ~/group02
git pull origin develop
cd backend
source venv/bin/activate
pip install -r requirements.txt
pkill -f "python.*app.py" || true
sleep 2
nohup python app.py > flask.log 2>&1 &
sleep 3
lsof -i :5001
EOF
```

## Frontend Deployment

### Initial Vercel Setup

1. **Install Vercel CLI** (optional, for command-line deployment)

```bash
npm install -g vercel
```

2. **Link project to Vercel**

```bash
cd frontend
npx vercel link
```

This creates a `.vercel` directory with project configuration.

3. **Configure environment variables in Vercel**

Visit your project settings at https://vercel.com/dashboard and add:

- `VITE_API_URL`: Backend API URL (or leave empty to use default from `apiConfig.js`)

### Deployment Methods

#### Method 1: GitLab CI/CD (Recommended)

1. Navigate to: https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02/-/pipelines
2. Find the latest pipeline
3. In the "deploy" stage, click play button next to `deploy_frontend_vercel`

The pipeline will build and deploy the frontend automatically.

#### Method 2: Manual Deployment via CLI

```bash
cd frontend
npx vercel --prod --yes
```

Enter your Vercel token when prompted (or use `--token` flag).

#### Method 3: Git Integration

Push to the develop or main branch, and Vercel will automatically deploy if Git integration is enabled.

### Vercel Configuration

The frontend includes a `vercel.json` configuration file:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures proper routing for the React single-page application.

### Build Verification

Before deploying, verify the build works locally:

```bash
cd frontend
npm install
npm run build
npm run preview
```

Visit http://localhost:4173 to test the production build.

## CI/CD Pipeline

The GitLab CI/CD pipeline consists of four stages:

### 1. Test Stage

Runs on every push to develop, main, or merge requests:

- `backend_tests`: Executes pytest with coverage reporting
- Generates coverage reports in Cobertura format
- Fails the pipeline if tests fail

### 2. Quality Stage

Analyzes code quality using DPy (Python code analyzer):

- `code_quality_designite`: Runs static analysis on backend code
- `upload_to_dcode`: Uploads metrics to DCodeHub for monitoring
- Generates reports for architecture, design, and implementation smells
- Set to allow failure (won't block pipeline)

### 3. Build Stage

Validates that the frontend builds successfully:

- `build_frontend`: Compiles the React application
- Catches build errors before deployment
- Runs on develop and main branches only

### 4. Deploy Stage

Manual deployment to production environments:

- `deploy_backend_to_vm`: Deploys Flask app to Dal VM
- `deploy_frontend_vercel`: Deploys React app to Vercel
- Both jobs require manual triggering for safety
- Only available on develop and main branches

### Pipeline Triggers

The pipeline runs automatically on:

- Push to develop branch
- Push to main branch
- Creation of merge requests

Deployment jobs must be manually triggered via the GitLab UI.

## Troubleshooting

### Backend Issues

**Application not starting:**

```bash
# Check logs
ssh deployer@csci5308-vm2.research.cs.dal.ca
cd ~/group02/backend
tail -f flask.log
```

Common issues:

- Missing or invalid environment variables in .env
- Database connection failure (check DB_URL)
- Port 5001 already in use: `lsof -i :5001` and kill the process

**Database connection errors:**

Verify the database URL format:

```
postgresql://username:password@hostname:5432/database_name
```

Test the connection:

```bash
psql "postgresql://username:password@hostname:5432/database_name"
```

**Import errors or missing dependencies:**

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Issues

**Build failures:**

```bash
cd frontend
npm install
npm run build
```

Check for:

- Syntax errors in JavaScript/JSX files
- Missing dependencies in package.json
- Environment variable issues

**CORS errors in browser console:**

Verify backend CORS configuration allows the Vercel domain. The backend should include:

```python
CORS(app,
    resources={r"/api/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning", "User-Agent"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
```

**Ngrok warning page appearing:**

The frontend uses a custom fetch wrapper to bypass ngrok's warning page. Verify `frontend/src/utils/api.js` includes:

```javascript
headers: {
  "ngrok-skip-browser-warning": "69420",
  "User-Agent": "CustomAgent"
}
```

### Pipeline Issues

**Pipeline stuck or failing:**

1. Check GitLab Runner status: Settings > CI/CD > Runners
2. Verify all required variables are set and not protected (for develop branch)
3. Review job logs for specific error messages

**SSH authentication failure:**

Verify the ID_RSA variable contains a valid private key:

- Type: File
- Value: Complete private key including BEGIN/END markers
- Permissions: Set to 400 in pipeline script

**Deployment job can't find files:**

Ensure the deployer user has access to the project directory:

```bash
ssh deployer@csci5308-vm2.research.cs.dal.ca
ls -la ~/group02
```

## Monitoring and Maintenance

### Health Checks

**Backend health check:**

```bash
curl http://csci5308-vm2.research.cs.dal.ca:5001/api/questions
```

Expected: JSON response with questions array.

**Frontend health check:**

Visit https://frontend-five-roan-92.vercel.app and verify the homepage loads.

### Log Management

**Backend logs:**

```bash
ssh deployer@csci5308-vm2.research.cs.dal.ca
cd ~/group02/backend
tail -f flask.log
```

**Vercel logs:**

Visit https://vercel.com/dashboard and select the project to view deployment and runtime logs.

### Code Quality Monitoring

DCode dashboard: https://dcodehub.com

Track metrics for:

- Architecture smells
- Design smells
- Implementation smells
- Code complexity trends

### Database Backups

Perform regular PostgreSQL backups:

```bash
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql
```

Store backups in a secure location separate from the VM.

### Updating Dependencies

**Backend:**

```bash
cd backend
source venv/bin/activate
pip list --outdated
pip install --upgrade package_name
pip freeze > requirements.txt
```

**Frontend:**

```bash
cd frontend
npm outdated
npm update package_name
npm install
```

Test thoroughly before deploying dependency updates.

### Security Considerations

1. **Keep secrets secure**: Never commit .env files or tokens to Git
2. **Rotate credentials periodically**: Update database passwords, API keys, and tokens
3. **Monitor access logs**: Review SSH access and API usage patterns
4. **Update dependencies**: Apply security patches promptly
5. **Use HTTPS**: Always access the application over HTTPS in production

### Rollback Procedure

If a deployment causes issues:

1. **Backend rollback:**

```bash
ssh deployer@csci5308-vm2.research.cs.dal.ca
cd ~/group02
git log --oneline  # Find previous working commit
git checkout <commit-hash>
cd backend
source venv/bin/activate
pkill -f "python.*app.py"
nohup python app.py > flask.log 2>&1 &
```

2. **Frontend rollback:**

In Vercel dashboard:

- Go to project deployments
- Find previous working deployment
- Click "Promote to Production"

Or via CLI:

```bash
vercel rollback
```

## Support and Documentation

- **Project Repository**: https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02
- **Issue Tracker**: GitLab Issues in the repository
- **Code Quality**: https://dcodehub.com
- **Vercel Dashboard**: https://vercel.com/dashboard

For questions or issues, contact the development team or create an issue in the GitLab repository.
