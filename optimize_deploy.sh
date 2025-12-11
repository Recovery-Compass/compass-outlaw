#!/bin/bash

# Configuration
PROJECT_ID="agency-fortress-core-479708"
SERVICE_ACCOUNT="compass-outlaw@agency-fortress-core-479708.iam.gserviceaccount.com"
SERVICE_ACCOUNT_NAME="compass-outlaw"
USER_EMAIL="eric@recovery-compass.org"
REGION="us-west2"

echo "==================================================="
echo "   COMPASS OUTLAW OPTIMIZATION & DEPLOYMENT"
echo "==================================================="
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Account: $SERVICE_ACCOUNT"
echo "User:    $USER_EMAIL"
echo "==================================================="

# 0. Create Service Account if it doesn't exist
echo ""
echo "[0/5] Checking/Creating Service Account..."
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID > /dev/null 2>&1; then
    echo "Creating service account: $SERVICE_ACCOUNT_NAME..."
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="Compass Outlaw Service Account" \
        --project=$PROJECT_ID
else
    echo "Service account exists."
fi

# 1. Fix Console Permissions (Software Supply Chain Insights)
echo ""
echo "[1/5] Granting Container Analysis permissions to User..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/containeranalysis.occurrences.viewer" \
    --condition=None \
    --quiet

# 2. Grant 'ActAs' Permission to User (REQUIRED to use the Service Account)
echo ""
echo "[2/5] Granting 'ActAs' permission to User..."
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT \
    --member="user:$USER_EMAIL" \
    --role="roles/iam.serviceAccountUser" \
    --project=$PROJECT_ID \
    --condition=None \
    --quiet

# 3. Grant Runtime Permissions to Service Account
echo ""
echo "[3/5] Granting Runtime permissions to Service Account..."
# Allow SA to write logs and metric
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/logging.logWriter" \
    --condition=None \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/monitoring.metricWriter" \
    --condition=None \
    --quiet

# 4. Grant Build Permissions to Service Account (Required for Org Policy)
echo ""
echo "[4/5] Granting Build permissions to Service Account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/cloudbuild.builds.builder" \
    --condition=None \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.objectViewer" \
    --condition=None \
    --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/artifactregistry.writer" \
    --condition=None \
    --quiet

# 5. Trigger Optimized Build & Deploy
echo ""
echo "[5/5] Triggering Cloud Build (Optimized)..."

# Generate a timestamp tag since we are not in a git repo
BUILD_TAG="manual-$(date +%Y%m%d-%H%M%S)"
echo "Using Build Tag: $BUILD_TAG"

gcloud beta builds submit --config cloudbuild.yaml . \
    --project $PROJECT_ID \
    --service-account="projects/$PROJECT_ID/serviceAccounts/$SERVICE_ACCOUNT" \
    --substitutions=COMMIT_SHA=$BUILD_TAG

echo ""
echo "Optimization Complete."
echo "Service URL: https://compass-outlaw-169512654158.us-west2.run.app"
