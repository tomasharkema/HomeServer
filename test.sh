#!/bin/sh

npm install

jslint server.js
cp server.js server_test.js
NODE_ENV=testing forever start -l server.log -a -s server_test.js
sleep 5
jasmine-node spec
forever stop server_test.js

cd executables/DHT/
python -m py_compile server.py