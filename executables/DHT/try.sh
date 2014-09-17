#!/usr/bin/env bash

PIDFILE="/tmp/try.pid"

if [ -e "${PIDFILE}" ] && (ps -u $USER -f | grep "[ ]$(cat ${PIDFILE})[ ]"); then
    echo "Already running."
    exit 99
fi

nohup ./try.py >/dev/null 2>&1&
