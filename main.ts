// GROUP MB3-A
// gate G1, switch S1, infrared R1, display D1, neopixel N1

// INIT
radio.setGroup(8)
led.enable(false)

let PIN_SCL = DigitalPin.P19;
let PIN_SDA = DigitalPin.P20;
let PIN_SERVO = AnalogPin.P0;
let PIN_BUTTON = DigitalPin.P1;
let PIN_INFRARED = DigitalPin.P8;
let PIN_NEOPIXEL = DigitalPin.P9;

let displaySegment = TM1637.create(PIN_SCL, PIN_SDA, 10, 4)
let displayNeopixel = neopixel.create(PIN_NEOPIXEL, 8, NeoPixelMode.RGB)
displayNeopixel.setBrightness(255)

// DEBOUNCING
let buttonState = 1
let lastDebounceTime = 0
let lastButtonState = 0
let firstEntry = true
let TIME_DEBOUNCE = 30
let PIN_PRESSED = 0
let PIN_RELEASED = 1

// CONSTANTS
let NUM_PRESS_TO_OPEN = 4
let SERVO_OPEN = 85
let SERVO_CLOSE = 10
let RADIO_RESET = 1
let ARR_COLORS = [NeoPixelColors.Red, NeoPixelColors.Orange, NeoPixelColors.Yellow, NeoPixelColors.Green]

// VARIABLES
let value = 0
let infrared = 0
let servo = SERVO_CLOSE

// INIT
pins.setPull(PIN_BUTTON, PinPullMode.PullUp);
pins.setPull(PIN_INFRARED, PinPullMode.PullUp);
displayNeopixel.clear()
displayNeopixel.show()

// INTERRUPT
radio.onReceivedNumber(function(receivedNumber: number) {
    if (receivedNumber === RADIO_RESET){
        value = 0
        displayNeopixel.clear()
        displayNeopixel.show()
    }
})
// MAIN
basic.forever(function() {
    debounceButton()
    infrared = pins.digitalReadPin(PIN_INFRARED)
    if (value >= NUM_PRESS_TO_OPEN || infrared === PIN_PRESSED){
        servo = SERVO_OPEN
    } else {
        servo = SERVO_CLOSE
    }
    pins.servoWritePin(PIN_SERVO, servo)
    displaySegment.showNumber(value)
})

// FUNCTIONS
function debounceButton() {
    let currentTime = input.runningTime()

    let buttonRead = pins.digitalReadPin(PIN_BUTTON)
    if (buttonRead !== lastButtonState) {
        lastDebounceTime = currentTime
    }
    if (input.runningTime() - lastDebounceTime > TIME_DEBOUNCE) {
        if (buttonRead !== buttonState) {
            buttonState = buttonRead
            if (buttonState === PIN_PRESSED) {
                value++
                if (value <= NUM_PRESS_TO_OPEN){
                    drawNeopixel()
                }
            } else {
            }
        }
    }
    lastButtonState = buttonRead
}

function drawNeopixel(){
    for (let i = 0; i < 2*value; i++){
        displayNeopixel.setPixelColor(i, ARR_COLORS[value-1])
        displayNeopixel.show()
    }
}