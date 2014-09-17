#!/bin/sh

cd /var/www/pi/raspberrypi/node

git pull
forever stop server.js
npm install
forever start server.js
