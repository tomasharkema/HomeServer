#!/usr/bin/env bash

PIDFILE="/tmp/light.pid"

if [ -e "${PIDFILE}" ] && (ps -u $USER -f | grep "[ ]$(cat ${PIDFILE})[ ]"); then
    echo "Already running."
    exit 99
fi

nohup ./light.py >/dev/null 2>&1&
