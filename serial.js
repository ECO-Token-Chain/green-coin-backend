require('dotenv').config();
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

const portPath = process.env.SERIAL_PORT || 'COM3';
const dustbinId = process.env.DUSTBIN_ID;
const depositUrl = `http://localhost:${process.env.PORT || 3000}/api/iot/deposit`;
const reduceUrl = `http://localhost:${process.env.PORT || 3000}/api/iot/dustbin/reduce`;

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

      if (isNaN(grams)) {
        console.error(' ERROR: Weight is not a number:', weight);
        return;
      }

      console.log(` Translating: ${grams}g`);
      console.log(` Sending to Backend: UID=${uid}, Weight=${grams.toFixed(2)}g`); 

      if (grams > 0) {
        const response = await axios.post(depositUrl, {
          uid: uid,
          weight: grams, 
          dustbinId: dustbinId
        });
        console.log('Backend Response:', response.data.message);
      } else if (grams < 0) {
        const moduleWeight = Math.abs(grams); // Mode / Absolute Value
        const response = await axios.patch(reduceUrl, {
          uid: uid,
          weight: moduleWeight,
          dustbinId: dustbinId
        });
        console.log('Backend Response:', response.data.message || response.data);
      }

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
