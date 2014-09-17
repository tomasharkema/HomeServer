#!/usr/bin/env bash

PIDFILE="/tmp/pir.pid"

if [ -e "${PIDFILE}" ] && (ps -u $USER -f | grep "[ ]$(cat ${PIDFILE})[ ]"); then
    echo "Already running."
    exit 99
fi
echo "RUN!"
nohup ./pir.py >/dev/null 2>&1&
