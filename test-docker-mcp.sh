#!/bin/bash
# Quick test to verify Docker access from MCP environment
echo "Testing Docker access..."
docker --version 2>&1 || echo "Docker not available in this environment"
echo "Current directory: $(pwd)"
echo "Checking /projects path..."
ls -la /projects/Downloads/development/SOS 2>&1 | head -5 || echo "Cannot access /projects path from current environment"
