#!/bin/sh
# Pre-update script for Watchtower
# This script runs before the container is updated

echo "[$(date)] Pre-update: Starting backup..."

# Backup SQLite database if it exists
if [ -f "/app/data/app.db" ]; then
    BACKUP_DIR="/app/data/backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/app-$(date +%Y%m%d-%H%M%S).db"
    cp /app/data/app.db "$BACKUP_FILE"
    echo "[$(date)] Database backed up to: $BACKUP_FILE"
    
    # Keep only last 10 backups
    ls -t "$BACKUP_DIR"/app-*.db 2>/dev/null | tail -n +11 | xargs -r rm -f
    echo "[$(date)] Old backups cleaned up"
fi

echo "[$(date)] Pre-update: Backup complete"
exit 0
