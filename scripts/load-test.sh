#!/usr/bin/env bash
# ==============================================================================
# CloudRetail - Load Test Shell Wrapper
# Usage: ./scripts/load-test.sh [duration_seconds] [concurrency] [target_url]
# Example: ./scripts/load-test.sh 10 25 http://localhost:8080
# ==============================================================================

DURATION=${1:-10}
CONCURRENCY=${2:-20}
TARGET_URL=${3:-"http://localhost:8080"}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "$DIR/load-test.js" "$TARGET_URL" "$CONCURRENCY" "$DURATION"
