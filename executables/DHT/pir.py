#!/usr/bin/python
import requests
import time
import RPi.GPIO as io
import atexit
import os
import sys

pid = str(os.getpid())
pidfile = "/tmp/pir.pid"

def is_process_running(process_id):
    try:
        os.kill(process_id, 0)
        return True
    except OSError:
        return False

if os.path.exists(pidfile):
    print("pid running")
    pid_running = int(open(pidfile).read())
    if(is_process_running(pid_running)):
        sys.exit()
    
else:
    file(pidfile, 'w').write(pid)


def goodbye():
    os.remove(pidfile)

atexit.register(goodbye)

io.setmode(io.BCM)
 
pir_pin = 18
 
io.setup(pir_pin, io.IN)         # activate input

state = 0;

previousTime = int(round(time.time() * 1000));

requests.get("http://home.tomasharkema.nl/pir/1/0/")

initTime = int(round(time.time() * 1000));

while True:
    if io.input(pir_pin):
        if (state == 0) :
            state = 1
            print("PIR ALARM!")
            previousTime = int(round(time.time() * 1000))
            r = requests.get("http://home.tomasharkema.nl/pir/1/1/")
            time.sleep(1)
            r.connection.close()
    else:
        now = int(round(time.time() * 1000))
        
        if ((previousTime + (1000 * 60 * 10)) < now):
            print("PIR NO ENTER!")
            
            r = requests.get("http://home.tomasharkema.nl/pir/1/0/")
            time.sleep(1)
            r.connection.close()
        state = 0
                
    time.sleep(0.5)