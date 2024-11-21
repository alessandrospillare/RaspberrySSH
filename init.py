import json
import pigpio

with open('/var/www/html/rgbw/rgb.json', 'r') as f:
    y = json.loads(f)
    red = y["red"]
    green = y["green"]
    blue = y["blue"]

pi.set_PWM_dutycycle(13, red)
pi.set_PWM_dutycycle(5, blue)
pi.set_PWM_dutycycle(6, green)

with open('/var/www/html/rgbw/cWhite.json', 'r') as f:
    y = json.loads(f)
    cWhite = y["cWhite"]

pi.set_PWM_dutycycle(12, cWhite)

with open('/var/www/html/rgbw/wWhite.json', 'r') as f:
    y = json.loads(f)
    wWhite = y["wWhite"]

pi.set_PWM_dutycycle(26, wWhite)