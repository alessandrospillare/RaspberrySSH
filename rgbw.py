from flask import Flask, request, jsonify
import RPi.GPIO as GPIO
import json


app = Flask(__name__)

GPIO.setmode(GPIO.BCM)
GPIO.setup(5, GPIO.OUT)
GPIO.setup(6, GPIO.OUT)
GPIO.setup(12, GPIO.OUT)
GPIO.setup(13, GPIO.OUT)
GPIO.setup(26, GPIO.OUT)

b = GPIO.PWM(5, 1000)
g = GPIO.PWM(6, 1000)
cW = GPIO.PWM(12, 1000)
r = GPIO.PWM(13, 1000)
wW = GPIO.PWM(26, 1000)

r.start(0)
b.start(0)
g.start(0)
cW.start(0)
wW.start(0)

# {{url}}/led?status=on
@app.route('/', methods=['GET'])
def led():

    red = round((int(request.args.get('red')))/2.55) if (request.args.get('red')) else 0
    green = round((int(request.args.get('green')))/2.55) if (request.args.get('green')) else 0
    blue = round((int(request.args.get('blue')))/2.55) if (request.args.get('blue')) else 0
    # white = int(request.args.get('white')) if (request.args.get('white')) else 0

    r.ChangeDutyCycle(red)
    g.ChangeDutyCycle(green)
    b.ChangeDutyCycle(blue)
    # pi.set_PWM_dutycycle(18, white)

    # return jsonify({"red": red, "green": green, "blue": blue, "white": white})
    with open('/var/www/html/rgbw/rgb.json', 'w') as f:
        json.dump({"red": red, "green": green, "blue": blue}, f)
    return jsonify({"red": red, "green": green, "blue": blue})


# Separated white button for now so it can be controlled separately
# Reading/writing to JSON file: https://stackabuse.com/reading-and-writing-json-to-a-file-in-python/
@app.route('/cWhite', methods=['GET'])
def cWhite():
    white = round((int(request.args.get('cWhite')))/2.55) if (request.args.get('cWhite')) else 0

    cW.ChangeDutyCycle(white)
    with open('/var/www/html/rgbw/cWhite.json', 'w') as f:
        json.dump({"cWhite": white}, f)
    return jsonify({"cWhite": white})

@app.route('/wWhite', methods=['GET'])
def wWhite():
    white = round((int(request.args.get('wWhite')))/2.55) if (request.args.get('wWhite')) else 0

    wW.ChangeDutyCycle(white)
    with open('/var/www/html/rgbw/wWhite.json', 'w') as f:
        json.dump({"wWhite": white}, f)
    return jsonify({"wWhite": white})


@app.route('/getStatus', methods=['GET'])
def get_status():
    colors = str(request.args.get('colors'))

    with open('/var/www/html/rgbw/' + colors + '.json', 'r') as f:
        return json.load(f)
