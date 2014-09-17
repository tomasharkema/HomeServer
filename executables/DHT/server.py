#!/usr/bin/python

#import logging
#logging.basicConfig(level=logging.DEBUG)

import lcddriver
#from time import *
import json
import time
from time import gmtime, strftime, localtime

import threading
from socketIO_client import SocketIO
import re
import requests
import RPi.GPIO as io
import atexit
import os
import sys
import subprocess
import datetime

pid = str(os.getpid())
pidfile = "/tmp/server.pid"

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

import logging
logging.basicConfig(filename='server.log',level=logging.DEBUG)

from datetime import tzinfo,timedelta

class Zone(tzinfo):
	def __init__(self,offset,isdst,name):
		self.offset = offset
		self.isdst = isdst
		self.name = name
	def utcoffset(self, dt):
		return timedelta(hours=self.offset) + self.dst(dt)
	def dst(self, dt):
			return timedelta(hours=1) if self.isdst else timedelta(0)
	def tzname(self,dt):
		 return self.name

lcd = lcddriver.lcd()

print 'HALLO'
logging.debug('HALLO')
tempratuur = "0"
lumen = "0"
trigger = "0"
pir = "0"

sleepRow = ""

bed = "0"

sleepStatus = "0"
sleepTime = 0

lastCommand = ""

lightNow = -1

state = 0

background = True
backgroundForceOff = False

socketIO = SocketIO('192.168.0.100', 4000)

def updateUI():
	global tempratuur
	global lumen
	global trigger
	global lastCommand
	global pir
	global background
	global backgroundForceOff
	global sleepRow
	global state

	GMT = Zone(1,False,'GMT')
	localtime = datetime.datetime.now(GMT).strftime("%H:%M:%S")
	
	if(background):
		lcd.lcd_backlight()
	else:
		lcd.lcd_noBacklight()

	if(backgroundForceOff):
		lcd.lcd_noBacklight()

	#lcd.lcd_clear()

	if(int(sleepStatus)>1):
		sleepRow = "sleeptime:"+  time.strftime('%H:%M:%S', time.gmtime(float(int(datetime.datetime.now().strftime("%s")) - int(int(sleepTime) / 1000))))

	if(int(sleepStatus) == 0):
		sleepRow = "                    "

	lcd.lcd_display_string("HOME APP    "+localtime, 1)
	lcd.lcd_display_string(tempratuur + "oC / "+lumen+"Lux / TrA: "+trigger, 2)
	lcd.lcd_display_string(lastCommand, 3)
	lcd.lcd_display_string(sleepRow, 4)



def temp(*args):
	global tempratuur
	logging.debug('on_aaa_response'+str(args[0]))
	print 'on_aaa_response', args, args[0], str(args[0])
	tempratuur = str(args[0]);
	
def lightsLume(*args):
	global lumen
	logging.debug('lumen' + str(args[0]))
	print 'lumen', args, args[0], str(args[0])
	lumen = str(args[0]);
	
def triggerArm(*args):
	global trigger
	logging.debug('trigger' + str(args[0]))
	print 'trigger', args, args[0], str(args[0])
	trigger = str(args[0]);
	

def switchedCallback(*args):
	global lastCommand
	logging.debug('switchedCallback' + str(args[0]['switcher']['name']))
	print "switchedCallback", args, args[0]['switcher']['name'], type(args[0])
	lastCommand = args[0]['switcher']['name'] + ":"+str(args[0]['switcher']['state']);
	

def sleepStatusCallback(*args):
	global sleepStatus
	global sleepTime
	logging.debug('sleepStatus' + str(args[0]['status']))
	print "sleepStatus", args, args[0]['status'], type(args[0])
	sleepStatus = str(args[0]['status'])
	sleepTime = args[0]['bedTime'];
	
def backgroundOverrule(*args):
	global backgroundForceOff
	backgroundForceOff = bool(args[0]);

class SocThread (threading.Thread):
	
	def __init__(self):
		
		threading.Thread.__init__(self)

	def run(self):

		socketIO.on('temp', temp)
		socketIO.on('lightsLume', lightsLume)
		socketIO.on('triggerArm', triggerArm)
		socketIO.on('switched', switchedCallback)
		socketIO.on('sleepStatus', sleepStatusCallback)
		socketIO.on('backgroundOverrule', backgroundOverrule)
		socketIO.emit('me', 'LCD')
		socketIO.wait_for_callbacks(seconds=1000)
		socketIO.wait()


def map (x, in_min, in_max, out_min, out_max):
	
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;


class timeThread (threading.Thread):

	def __init__(self):
		
		threading.Thread.__init__(self)

	def run(self):
		while True:
			threadLock.acquire()
			updateUI()
			threadLock.release()
			time.sleep(1)

class pirThread (threading.Thread):

	def __init__(self):
		threading.Thread.__init__(self)

	def run(self):
		
 
		pir_pin = 18
		bed_pin = 22
		RCpin = 23
		light_pin = 22



		avgLight = 0.0
		counterLight = 0

		previousTime = int(round(time.time() * 1000));

		requests.get("http://192.168.0.100:4000/pir/1/0/")

		initTime = int(round(time.time() * 1000));

		global bed
		global background
		global state

		pirNoSended = 0

		while True:
			io.setup(pir_pin, io.IN)

			io.setup(bed_pin, io.IN)

			if io.input(pir_pin):
				if (state == 0) :
					state = 1
					print("PIR ALARM!")
					global pir
					pir = "1"
					logging.debug('PIR')
					previousTime = int(round(time.time() * 1000))
					r = requests.get("http://192.168.0.100:4000/pir/1/1/")
					time.sleep(1)
					r.connection.close()
					pirNoSended = 0
			else:
				now = int(round(time.time() * 1000))
				
				if ((previousTime + (1000 * 60 * 10)) < now):
					if (pirNoSended == 0):
						print("PIR NO ENTER!")
						global pir
						pir = "0"
						logging.debug('NO PIR')
						r = requests.get("http://192.168.0.100:4000/pir/1/0/")
						time.sleep(1)
						r.connection.close()
						pirNoSended = 1
				state = 0
			
			
			reading = 0
			io.setup(RCpin, io.OUT)
			io.output(RCpin, False)
			time.sleep(0.1)
			io.setup(RCpin, io.IN)
			# This takes about 1 millisecond per loop cycle
			while ((io.input(RCpin) == False) and (reading < 10000)):
				reading = reading + 1
				
			#return reading
			global lightNow

			returnMap = map(reading, 0, 10000, 100, 0)
			print "light: "+str(returnMap)+""
			if(counterLight < 60):
				lightNow = returnMap
				avgLight = avgLight + returnMap
				counterLight = counterLight + 1
			else:
				avg = avgLight / counterLight
				print "light: "+str(avg)+""
				r = requests.get("http://192.168.0.100:4000/light/"+str(round(avg))+"/")
				avgLight = 0.0
				counterLight = 0



			if io.input(bed_pin):
				if (bed != "1"):
					print "JA"
					logging.debug('BED JA')
					bed = "1"
					requests.get("http://192.168.0.100:4000/bed/"+bed+"/")
					background = False
					
			else:
				if (bed != "0"):
					logging.debug('BED NEE WAIT 10 SEC')
					time.sleep(20)
					if (io.input(bed_pin) != True):
						print "NEE"
						logging.debug('BED NEE')
						bed = "0"
						requests.get("http://192.168.0.100:4000/bed/"+bed+"/")
						background = True
					
			io.cleanup()
			time.sleep(2)

class tempThread (threading.Thread):

	def __init__(self):
		threading.Thread.__init__(self)

	def run(self):
		# ===========================================================================
		# Google Account Details
		# ===========================================================================

		# Continuously append data
		logging.debug('temp')
		print "temp"

		while(True):
			# Run the DHT program to get the humidity and temperature readings!

			output = subprocess.check_output(["./Adafruit_DHT", "11", "4"]);
			print output
			logging.debug(output)
			matches = re.search("Temp =\s+([0-9.]+)", output)
			if (not matches):
				time.sleep(3)
				continue
			temp = float(matches.group(1))

			# search for humidity printout
			matches = re.search("Hum =\s+([0-9.]+)", output)
			if (not matches):
				time.sleep(3)
				continue
			humidity = float(matches.group(1))
			logging.debug("Temperature: %.1f C" % temp)
			print "Temperature: %.1f C" % temp
			#print "Humidity:    %.1f %%" % humidity

			# Append the data in the spreadsheet, including a timestamp

			#print "http://192.168.0.100:4000/temp/%.1f/" % temp
			r = requests.get("http://192.168.0.100:4000/temp/%.1f/" % temp)
			

			time.sleep(30)



threadLock = threading.Lock()


try:
	thread1 = SocThread()
	thread2 = timeThread()
	thread3 = pirThread()
	thread4 = tempThread()

	thread3.daemon=True
	thread2.daemon=True
	thread1.daemon=True
	thread4.daemon=True

	thread1.start()
	thread2.start()
	thread3.start()
	thread4.start()

	while True:
		if not thread3.isAlive():
			thread3 = pirThread()
			thread3.daemon=True
			thread3.start()

		if not thread4.isAlive():
			thread4 = tempThread()
			thread3.daemon=True
			thread3.start()

		time.sleep(30)

	#while True: time.sleep(100)
except (KeyboardInterrupt, SystemExit):
	print '\n! Received keyboard interrupt, quitting threads.\n'




