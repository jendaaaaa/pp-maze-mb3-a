// GROUP MB-A
// gate G1, switch S1, infrared R1, display D1, neopixel N4
// radio to MB-C,D,E

// INIT
radio.setGroup(8)
basic.showString("A")

let PIN_SCL = DigitalPin.P19;
let PIN_SDA = DigitalPin.P20;
let PIN_SERVO = AnalogPin.P0;
let PIN_NEOPIXEL = DigitalPin.P1;
let PIN_BUTTON = DigitalPin.P8;
let PIN_INFRARED = DigitalPin.P9;

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

// COLORS
let COL_BLUE = 216;
let COL_PINK = -14;
let COL_GREEN = 150;
let COL_YELLOW = 20;
// let COL_ORANGE = 0;
let COL_NO_COLOR = 60;
let COL_EMPTY = -1000;
let ARR_COL = [COL_BLUE, COL_PINK, COL_GREEN, COL_YELLOW];
let NUM_COLORS = ARR_COL.length;

// CONSTANTS
let NUM_PRESS_TO_OPEN = 4
let SERVO_OPEN = 85
let SERVO_CLOSE = 10
let RADIO_RESET = 1
let ARR_COL_COUNT = [NeoPixelColors.Red, NeoPixelColors.Orange, NeoPixelColors.Yellow, NeoPixelColors.Green]

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
        value = 0;
        assignColors();
        displayNeopixel.clear()
        displayNeopixel.show()
    }
})

// MAIN
assignColors();
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

basic.forever(function() {
    if(infrared === PIN_PRESSED){
        assignColors();
    }
})

// DEBUG - DELETE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
input.onButtonPressed(Button.A, function() {
    assignColors();
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
        displayNeopixel.setPixelColor(i, ARR_COL_COUNT[value-1])
        displayNeopixel.show()
    }
}

function assignColors(){
    let c1 = randint(0, NUM_COLORS-1);
    let c2 = -1;
    let c3 = -1;
    while (c2 === c1 || c2 === c3 || c1 === c3){
        c2 = randint(0, NUM_COLORS-1);
        c3 = randint(0, NUM_COLORS-1);
    }
    for (let i = 0; i < 10; i++){
        radio.sendValue("COLOR1", ARR_COL[c1]);
    }
    for (let i = 0; i < 10; i++){
        radio.sendValue("COLOR2", ARR_COL[c2]);
    }
    for (let i = 0; i < 10; i++){
        radio.sendValue("COLOR3", ARR_COL[c3]);
    }
    pause(1010);
}