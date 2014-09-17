import lcddriver
from time import *

lcd = lcddriver.lcd()

lcd.lcd_display_string("HOME APP     C:I T:0", 1)
lcd.lcd_display_string("16oC / 16Lux", 2)
lcd.lcd_display_string("", 3)
lcd.lcd_display_string("Status: All fine!", 4)
