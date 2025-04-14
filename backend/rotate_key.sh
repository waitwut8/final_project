#!/bin/bash

ENV_FILE=".env"
BACKUP_FILE=".env.bak"

# Generate a new 256-bit hex key (64-character hex string)
NEW_SECRET=$(openssl rand -hex 32)

echo "🔐 Generating new JWT secret key..."

# Backup the .env file just in case chaos strikes
cp "$ENV_FILE" "$BACKUP_FILE"
echo "🛟 Backup created at $BACKUP_FILE"

# Ensure .env ends with a newline
echo >> "$ENV_FILE"

# Format the new line with quotes
NEW_LINE="JWT_SECRET=\"$NEW_SECRET\""

# If JWT_SECRET exists, replace it; else, append
if grep -q '^JWT_SECRET=' "$ENV_FILE"; then
    sed -i'' -e "s|^JWT_SECRET=.*|$NEW_LINE|" "$ENV_FILE"
    echo "🔄 JWT_SECRET updated in $ENV_FILE"
else
    echo "$NEW_LINE" >> "$ENV_FILE"
    echo "➕ JWT_SECRET added to $ENV_FILE"
fi

echo "✅ JWT_SECRET successfully rotated."
