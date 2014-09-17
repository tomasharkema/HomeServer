#!/usr/bin/env bash

PIDFILE="/tmp/server.pid"

if [ -e "${PIDFILE}" ] && (ps -u $USER -f | grep "[ ]$(cat ${PIDFILE})[ ]"); then
    echo "Already running."
    exit 99
fi
echo "RUN!"
nohup ./server.py&
