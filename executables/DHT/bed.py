import RPi.GPIO as io
import time

io.setmode(io.BCM)
 
bed_pin = 22
io.setup(bed_pin, io.IN)
while True:
    if io.input(bed_pin):
        print "JA"
    else:
        print "NEE"
    time.sleep(2)
