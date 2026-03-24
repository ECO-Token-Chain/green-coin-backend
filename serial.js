require('dotenv').config();
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

const portPath = process.env.SERIAL_PORT || 'COM3';
const dustbinId = process.env.DUSTBIN_ID;
const apiUrl = `http://localhost:${process.env.PORT || 3000}/api/iot/deposit`;

if (!dustbinId) {
  console.error(" ERROR: DUSTBIN_ID is missing in .env");
  process.exit(1);
}

const port = new SerialPort({
  path: portPath,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

console.log(`Listening on ${portPath}...`);

parser.on('data', async (data) => {
  console.log(`Serial received: ${data}`);

  const [uid, weight] = data.split(',');

  if (uid && weight) {
    try {
      const grams = parseFloat(weight);
      const kilograms = grams / 1000;

      if (isNaN(grams)) {
        console.error(' ERROR: Weight is not a number:', weight);
        return;
      }

      console.log(` Translating: ${grams}g -> ${kilograms.toFixed(3)}kg`);
      console.log(` Sending to Backend: UID=${uid}, Weight=${kilograms.toFixed(3)}kg`);

      const response = await axios.post(apiUrl, {
        uid: uid,
        weight: kilograms,
        dustbinId: dustbinId
      });

      console.log('Backend Response:', response.data.message);
    } catch (error) {
      console.error('Backend Error:', error.response ? error.response.data : error.message);
    }
  } else {
    console.warn(' Invalid data format received. Expected: UID,Weight');
  }
});

port.on('error', (err) => {
  console.error(' Serial Port Error:', err.message);
});
