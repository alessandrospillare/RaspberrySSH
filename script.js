let config = {
    url: 'http://192.168.178.160',
};

let currentColors = {};
let rgbBrightnessChange = false;

$(document).ready(function() {
    // Cache buster added because caching was a big problem on mobile
    let cacheBuster = new Date().getTime();

    // btnStatus();
    getLEDStatus('rgb');
    getLEDStatus('cWhite');
    getLEDStatus('wWhite');

    // RGB Slider
    let slider = document.getElementById('slider');
    // Cool White Slider
    let cWSlider = document.getElementById('coolWhiteSlider');
    // Warm White Slider
    let wWSlider = document.getElementById('warmWhiteSlider');

    const pickr = Pickr.create({
        el: '.color-picker',
        theme: 'classic', // or 'monolith', or 'nano'
        lockOpacity: true,
        padding: 15,
        inline: true,

        swatches: [
            'rgba(255, 0, 0, 1)',
            'rgba(255, 82, 0, 1)',
            'rgba(0, 255, 0, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(27, 161, 17, 1)',
            'rgba(255, 255, 0, 1)',
            'rgba(255, 0, 255, 1)',
            'rgba(108, 16, 157, 1)',
            'rgba(0, 255, 255, 1)',
            'rgba(24, 139, 167, 1)',
            'rgba(255, 255, 255, 1)',
            'rgba(0, 0, 0, 1)',
        ],

        components: {

            // Main components
            preview: true,
            opacity: false,
            hue: true,

            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                // hsla: true,
                // hsva: true,
                // cmyk: true,
                input: true,
                // clear: true,
                save: true
            }
        }
    });

    pickr.off().on('swatchselect', e => {
        // sendData(e); // Swatchselect apparently triggers save so it triggers sendData() automatically
        pickr.setColor(e.toRGBA().toString(0));
    });

    pickr.on('save', e => {
        // If 'save' is being triggered by brightness changes instead
        if(rgbBrightnessChange == false) {
            let tempColors = pickr.getColor().toRGBA();
            currentColors.red = Math.floor(tempColors[0]);
            currentColors.green = Math.floor(tempColors[1]);
            currentColors.blue = Math.floor(tempColors[2]);
            slider.noUiSlider.set(100); // sets slider value to 100 if color is changed manually
            $('#slider .noUi-connect').css('background', `rgb(${currentColors.red}, ${currentColors.green}, ${currentColors.blue}`);
        } else {
            rgbBrightnessChange = false;
        }
        sendData(e);
    });

    noUiSlider.create(slider, {
        behavior: "tap",
        start: [100],
        connect: [true, false],
        // direction: 'rtl',
        step: 5,
        range: {
            'min': [0],
            'max': [100]
        },
        pips: {
            mode: 'values',
            values: [0, 25, 50, 75, 100],
            density: 5,
            format: wNumb({
                decimals: 0,
                postfix: "%"
            })
        }
    });

    slider.noUiSlider.on('set', function(e) {
       let sliderVal = (slider.noUiSlider.get()/100);
       let newRed = Math.floor(currentColors.red * sliderVal);
       let newGreen = Math.floor(currentColors.green * sliderVal);
       let newBlue = Math.floor(currentColors.blue * sliderVal);
       rgbBrightnessChange = true;
       pickr.setColor(`rgb(${newRed}, ${newGreen}, ${newBlue})`);
    });

    function sendData(e){
        let obj = e.toRGBA();
        let red = Math.floor(obj[0]);
        let green = Math.floor(obj[1]);
        let blue = Math.floor(obj[2]);
        let queryBuilder = `red=${red}&green=${green}&blue=${blue}`;

        $.ajax({
            url: `${config.url}/api/lr/?${queryBuilder}&${cacheBuster}`,
            method: 'GET',
            dataType: 'json',
            cache: false,
            success: function (result) {
                // console.log(result);
                // console.log(currentColors);
            }
        });
    }

    function changeCWhiteLed(frequency){
        $.ajax({
            url: `${config.url}/api/lr/cWhite?cWhite=${frequency}&${cacheBuster}`,
            method: 'GET',
            success: function(result) {
                // console.log(result);
            }
        });
    }

    function changeWWhiteLed(frequency){
        $.ajax({
            url: `${config.url}/api/lr/wWhite?wWhite=${frequency}&${cacheBuster}`,
            method: 'GET',
            success: function(result) {
                // console.log(result);
            }
        });
    }

    noUiSlider.create(cWSlider, {
        behavior: "tap",
        start: [100],
        connect: [false, true],
        step: 5,
        range: {
            'min': [0],
            'max': [100]
        },
        pips: {
            mode: 'values',
            values: [0, 25, 50, 75, 100],
            density: 5,
            format: wNumb({
                decimals: 0,
                postfix: "%"
            })
        }
    });

    noUiSlider.create(wWSlider, {
        behavior: "tap",
        start: [100],
        connect: [false, true],
        step: 5,
        range: {
            'min': [0],
            'max': [100]
        },
        pips: {
            mode: 'values',
            values: [0, 25, 50, 75, 100],
            density: 5,
            format: wNumb({
                decimals: 0,
                postfix: "%"
            })
        }
    });

    cWSlider.noUiSlider.on('change', function(e) {
       let sliderVal = (cWSlider.noUiSlider.get()/100);
       changeCWhiteLed(Math.floor(sliderVal * 255));
    });

    wWSlider.noUiSlider.on('change', function(e) {
        let sliderVal = (wWSlider.noUiSlider.get()/100);
        changeWWhiteLed(Math.floor(sliderVal * 255));
     });

    // Get RGB Status so Color Picker in UI is set to that color on page load
    function getLEDStatus(color) {
        $.ajax({
            url: `${config.url}/api/lr/getStatus?colors=${color}&${cacheBuster}`,
            method: 'GET',
            success: function(result) {
                if(color == 'rgb') {
                    let colors = `rgb(${result.red}, ${result.green}, ${result.blue})`;
                    currentColors.red = result.red;
                    currentColors.green = result.green;
                    currentColors.blue = result.blue;
                    pickr.setColor(colors);
                } else if(color == 'cWhite') {
                    cWSlider.noUiSlider.set(Math.floor((result.cWhite / 255) * 100));
                } else if(color == 'wWhite') {
                    wWSlider.noUiSlider.set(Math.floor((result.wWhite / 255) * 100));
                }
            },
        });
    }

});