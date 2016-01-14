/* 
SocialGardening

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.
*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console

var clientio = require('socket.io-client')('http://192.168.2.2:3000');
var client    = clientio.connect('http://192.168.2.2:3000'); 

client.on('connect', function(){
    console.log('connected to backend');
    //client.emit("sensor:waterlevel", {"test": "test"});
});


// Test LED blink
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led


// inititialize sensors
var soilSensorD = new mraa.Gpio(7);
soilSensorD.dir(mraa.DIR_IN);
var waterSensorA = new mraa.Aio(0);
var waterLevel = waterSensorA.read();
var waterLevelNormalized = 0;
var soilSensorA = new mraa.Aio(1);
var soilLevel = soilSensorA.read();
var soilLevelNormalized = 0;

//initialize actors
var relayD = new mraa.Gpio(8);
relayD.dir(mraa.DIR_OUT);


periodicActivity(); //call the periodicActivity function

function periodicActivity()
{
    //relayD.write(1);
    myOnboardLed.write(ledState?1:0);
    ledState = !ledState;
    
    readSensorValues();
    printSerial();
    checkToWater();
    
    setTimeout(periodicActivity,3000);
}

function checkToWater()
{
    if (soilLevel > 600 && waterLevel > 220) {
        relayD.write(0);
        console.log('soilLevel > 600 && waterLevel < 1000  -> ON');
    } else {
        relayD.write(1);
    }
}

function readSensorValues()
{
    readSoilMoisture();
    readWaterLevel();
    clientEmit()
}

function readSoilMoisture()
{
    soilLevel = soilSensorA.read();
}

function readWaterLevel()
{
    waterLevel = waterSensorA.read();
}

function clientEmit()
{
    waterLevelNormalized = 0.15 * waterLevel;
    soilLevelNormalized = 1 * soilLevel;
    client.emit('sensor:waterlevel', {value: waterLevelNormalized});
    client.emit('sensor:moisture', {value: soilLevelNormalized});
}

function printSerial()
{
    console.log('soil level = ' + soilLevel);
    console.log('water level = ' + waterLevel);
}