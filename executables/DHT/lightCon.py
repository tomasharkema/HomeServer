#!/usr/bin/env python
 
# Example for RC timing reading for Raspberry Pi
# Must be used with GPIO 0.3.1a or later - earlier verions
# are not fast enough!
 
import RPi.GPIO as GPIO, time, os      
 
DEBUG = 1
GPIO.setmode(GPIO.BCM)
def map (x, in_min, in_max, out_min, out_max):
	
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
 
def RCtime (RCpin):
        reading = 0
        GPIO.setup(RCpin, GPIO.OUT)
        GPIO.output(RCpin, GPIO.LOW)
        time.sleep(0.1)
 
        GPIO.setup(RCpin, GPIO.IN)
        # This takes about 1 millisecond per loop cycle
        while ((GPIO.input(RCpin) == GPIO.LOW) and (reading < 10000)):
                reading = reading + 1
        
	#return reading
	
	returnMap = map(reading, 0, 10000, 100, 0)

	return  str(reading) + ", " + str(returnMap)
 
while True:                                     
        print RCtime(23)
