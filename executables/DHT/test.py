#!/usr/bin/python

import time


previousTime = int(round(time.time() * 1000))

while True:
	now = int(round(time.time() * 1000))
	print("Previous + 10 min")
	print((previousTime + (1000 * 60 * 1)))
	print("Now ")
	print(now)
	print("-------")
	if ((previousTime + (1000 * 60 * 1)) < now):
		print("doemaar")

	time.sleep(1)