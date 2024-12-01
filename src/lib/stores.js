import { writable } from "svelte/store";
//import { persisted } from 'svelte-persisted-store'
import mqtt from "mqtt";
import { dev } from "$app/environment";
export const dataTask = writable([]);
export let flowAPersen = writable();
export let flowBPersen = writable();
export let flowCPersen = writable();

export const mqttClient = writable(null);
export const mqttData = writable({});

let bleConnected = false;
export let bleIsConnected = writable(false);
export let logDisplay = writable("log console\n");
export let mqttIsConnected = writable(false);

const subMqtt = "abadinet-out/KA51200/#";
const pubMqtt = "abadinet-in/KA51200/";
let clientId = "CL" + Math.random().toString(16).substr(2, 4).toUpperCase();
//const host = 'ws://abadinet.my.id:2020'
//const host = 'wss://node-red.balingtansmart.my.id/ws'
//const host =  'ws://'+ get(brokerUseStore) + '/mqtt:' + get(brokerPortUseStore);
const brokerUrl = "wss://mqtt.eclipseprojects.io/mqtt:443";
//const brokerUrl = "ws://mqtt.eclipseprojects.io/mqtt:80";

let lastMsg = null;
let dataTaskNow;
let mqttConnected = false



const options = {
  keepalive: 30,
  clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
  rejectUnauthorized: false,
};

const dtSub = dataTask.subscribe((data) => {
  dataTaskNow = data; // Panggil fungsi untuk memperbarui sensorData
});

const mqttSub = mqttIsConnected.subscribe((data) => {
  mqttConnected = data; // Panggil fungsi untuk memperbarui sensorData
});


// Fungsi untuk menginisialisasi MQTT Client (hanya sekali)
// @ts-ignore
export function initMqtt() {
  const client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    mqttConnected = true
    mqttIsConnected.set(true)
    console.log("Connected to MQTT broker");
    client.subscribe(subMqtt, { qos: 0 });
    let pubStatus = pubMqtt + "kontrol/0/status";
    console.log("mqtt conected");
    let getDataTask = pubMqtt + "kontrol/0/getAllTask";
    mqttClient.set(client); // Set mqttClient di dalam store

    //cekClientId();

    client.publish(pubStatus, clientId, { qos: 0, retain: false });
    client.publish(getDataTask, "1", { qos: 0, retain: false });
    //kirimMsg("kontrol", 0, "getAllTask", "1")
  });

  client.on("message", (topic, payload) => {
    cekMqttMsg(topic,payload.toString())
    mqttData.update((data) => ({
      ...data,
      topic,
      msg: payload.toString(), // Update data berdasarkan topik
    }));
  });

  client.on('close', () => {
    mqttConnected = false;
    mqttIsConnected.set(false)
    console.log('Disconnected from MQTT broker');
  });

  //mqttClient.set(client); // Simpan client MQTT di store
}

function mqttDisconnect() {
  if (mqttConnected && client) {
    client.end();
    mqttConnected = false;
  }
}

export function kirimMsg(type, num, cmd, msg) {
  const pubMqtt = "abadinet-in/KA51200/";                             
  let ms = pubMqtt + type + "/" + num + "/" + cmd;
  const bleMsg = ms + ";" + msg + ";";
  mqttClient.subscribe((client) => {
    if (client) {
      client.publish(ms, msg, { qos: 0, retain: false });
    } else {
      console.error("MQTT client is not connected");
    }
  });
  if(bleConnected){
    nusSendString(bleMsg)
  }
}

function cekMqttMsg(topic,msg_payload) {
  //console.log("Sensor Data updated:", data);

  //const splitMsg = data.split(": '")
  //const topic = data.topic;
  //const msg_payload = data.msg;
  //console.log(topic + '  >  ' + msg_payload)
  const topicMqtt = topic ? topic.split("/") : [];
  if (topicMqtt.length > 0) {
    const serverId = topicMqtt[1];
    const msg_type = topicMqtt[2];
    const msg_idx = topicMqtt[3];
    const msg_cmd = topicMqtt[4];

    if (msg_type === "kontrol") {
      if (msg_cmd === "getAllTask") {
        if (lastMsg != msg_payload) {
          lastMsg = msg_payload;
          let msgSplit = msg_payload.split(";");
          let newArray = []; // Array sementara untuk menampung data
           
          //dataTask.set([]); // Kosongkan store sebelum diisi ulang

          for (let i = 0; i < msgSplit.length; i++) {
            try {
              let jsonData = JSON.parse(msgSplit[i]); // Parse JSON
              jsonData.sensorValue = 0; // Tambahkan properti sensorValue
              let nm = jsonData.nama;
              jsonData.nama = nm.trim();
              newArray.push(jsonData); // Simpan data di array sementara
              //console.log(jsonData);  // Debug: Tampilkan objek JSON
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
          dataTask.set(newArray); // Update store sekali setelah loop selesai

          //console.log(dataTask)
        }
      }
    } else {
      //let dataTaskCopy = $dataTask
      //console.log($dataTask)
      for (let i = 0; i < dataTaskNow.length; i++) {
        let namaType = "auto" + dataTaskNow[i].nama;
        if (namaType == msg_type) {
          if (msg_cmd === "sensorValue") {
            dataTaskNow[i].sensorValue = parseFloat(msg_payload);
          } else if (msg_cmd === "enable") {
            dataTaskNow[i].enable = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorUse1") {
            dataTaskNow[i].aktuatorUse1 = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorUse2") {
            dataTaskNow[i].aktuatorUse2 = parseInt(msg_payload);
          } else if (msg_cmd === "jadwal") {
            //dataTaskNow[i].aktuatorUse2 = parseInt(msg_payload);
          } else if (msg_cmd === "sensorUse1") {
            dataTaskNow[i].sensorUse1 = parseInt(msg_payload);
          } else if (msg_cmd === "sensorUse2") {
            dataTaskNow[i].sensorUse2 = parseInt(msg_payload);
          } else if (msg_cmd === "targetBawah") {
            dataTaskNow[i].targetBawah = parseInt(msg_payload);
          } else if (msg_cmd === "targetAtas") {
            dataTaskNow[i].targetAtas = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorMixA") {
            dataTaskNow[i].aktuatorMixA = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorMixB") {
            dataTaskNow[i].aktuatorMixB = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorMixC") {
            dataTaskNow[i].aktuatorMixC = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorMixOut") {
            dataTaskNow[i].aktuatorMixOut = parseInt(msg_payload);
          } else if (msg_cmd === "aktuatorAduk") {
            dataTaskNow[i].aktuatorAduk = parseInt(msg_payload);
          } else if (msg_cmd === "targetmixA") {
            dataTaskNow[i].targetmixA = parseInt(msg_payload);
          } else if (msg_cmd === "targetMixB") {
            dataTaskNow[i].targetMixB = parseInt(msg_payload);
          } else if (msg_cmd === "targetMixC") {
            dataTaskNow[i].targetMixC = parseInt(msg_payload);
          } else if (msg_cmd === "sensorMixingCountValue") {
            dataTaskNow[i].mixingCount = parseInt(msg_payload);
          }else if (msg_cmd === "mixingTarget") {
            dataTaskNow[i].mixingTarget = parseInt(msg_payload);
          } else if (msg_cmd === "sensorFlowAValue") {
            dataTaskNow[i].flowAValue = parseInt(parseFloat(msg_payload) * 100);
            let fa = parseInt((dataTaskNow[i].flowAValue / dataTaskNow[i].targetmixA) * 100);
            
            flowAPersen.set(fa);
          } else if (msg_cmd === "sensorFlowBValue") {
            dataTaskNow[i].flowBValue = parseInt(parseFloat(msg_payload) * 100);
            let fb = parseInt((dataTaskNow[i].flowBValue / (dataTaskNow[i].targetmixB * 100)) * 100);
            if (fb > 100) {
              fb = 100;
            }
            flowBPersen.set(fb);
          } else if (msg_cmd === "sensorFlowCValue") {
            dataTaskNow[i].flowCValue = parseInt(parseFloat(msg_payload) * 100);
          } else if (msg_cmd === "sensorFlowMixOutValue") {
            dataTaskNow[i].sensorFlowMixOutValue = parseInt(parseFloat(msg_payload) * 100);
          }
          break;
        }
        dataTask.set(dataTaskNow);
      }
    }
  }
}

//bluethoot
const bleNusServiceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharRXUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const bleNusCharTXUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const MTU = 20;

var bleDevice;
var bleServer;
var nusService;
var rxCharacteristic;
var txCharacteristic;
let sendCount = 0;
let btBuff = "";



export function mqttConnectionToggle() {
  if (mqttConnected) {
    mqttDisconnect()
    console.log("disconect mqtt")
  } else {
    console.log("connect mqtt")
      initMqtt()
   
  }
}

export function bleConnectionToggle() {
  if (bleConnected) {
    disconnect();
  } else {
    connect();
  }
}

async function connect() {
  if (!navigator.bluetooth) {
    logDisplay += "WebBluetooth API is not available.\r\n";
    return;
  }
  logDisplay += "Requesting Bluetooth Device...\n";
  navigator.bluetooth
    .requestDevice({
      //filters: [{services: []}]
      optionalServices: [bleNusServiceUUID],
      acceptAllDevices: true,
    })
    .then((device) => {
      bleDevice = device;
      logDisplay += "Found " + device.name;
      logDisplay += "Connecting to GATT Server...\n";
      bleDevice.addEventListener(
        "gattserverdisconnected",
        onDisconnected,
      );
      return device.gatt.connect();
    })
    .then((server) => {
      logDisplay += "Locate NUS service\n";
      return server.getPrimaryService(bleNusServiceUUID);
    })
    .then((service) => {
      nusService = service;
      logDisplay += "Found NUS service: " + service.uuid;
    })
    .then(() => {
      logDisplay += "Locate RX characteristic\n";
      return nusService.getCharacteristic(bleNusCharRXUUID);
    })
    .then((characteristic) => {
      rxCharacteristic = characteristic;
      logDisplay += "Found RX characteristic\n";
    })
    .then(() => {
      logDisplay += "Locate TX characteristic\n";
      return nusService.getCharacteristic(bleNusCharTXUUID);
    })
    .then((characteristic) => {
      txCharacteristic = characteristic;
      logDisplay += "Found TX characteristic\n";
    })
    .then(() => {
      logDisplay += "Enable notifications\n";
      return txCharacteristic.startNotifications();
    })
    .then(() => {
      logDisplay += "Notifications started\n";
      txCharacteristic.addEventListener(
        "characteristicvaluechanged",
        handleNotifications,
      );
      bleConnected = true;
      bleIsConnected.set(true)
      ////window.term_.io.println('\r\n' + bleDevice.name + ' Connected.\n'
      tes();
      //setConnButtonState(true);
    })
    .catch((error) => {
      logDisplay += error;
      //window.term_.io.println('' + error);
      if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
      }
    });
}

function disconnect() {
  if (!bleDevice) {
    logDisplay += "No Bluetooth Device connected...\n";
    return;
  }
  logDisplay += "Disconnecting from Bluetooth Device...\n";
  if (bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
    bleConnected = false;
    bleIsConnected.set(false)
    //setConnButtonState(false);
    logDisplay +=
      "Bluetooth Device connected: " + bleDevice.gatt.connected;
  } else {
    logDisplay += "> Bluetooth Device is already disconnected\n";
  }
}

function onDisconnected() {
  bleConnected = false;
  bleIsConnected.set(false)
  logDisplay += "\r\n" + bleDevice.name + " Disconnected.";
}

function handleNotifications(event) {
  logDisplay += "btMsg:\n";
  let value = event.target.value;
  // Convert raw data bytes to character values and use these to
  // construct a string.
  let chr = "";
  let endMsg = false;
  for (let i = 0; i < value.byteLength; i++) {
    chr = String.fromCharCode(value.getUint8(i));
    btBuff += chr;
    if (chr == "\n") {
      endMsg = true;

      break;
    }
  }
  if (endMsg) {
    if (btBuff.length > 5) {
      logDisplay += btBuff;

      let btMsgSplit = btBuff.split('@')
      const topic = btMsgSplit[0]
      const msg = btMsgSplit[1]

      cekMqttMsg(topic,msg)
      
    }
    btBuff = "";
  }
}

function nusSendString(s) {
  if (bleDevice && bleDevice.gatt.connected) {
    //logDisplay += 'send: ' + s;
    s += "\n";
    let val_arr = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      let val = s[i].charCodeAt(0);
      val_arr[i] = val;
    }
    sendNextChunk(val_arr);
  } else {
    logDisplay += "Not connected to a device yet.";
  }
}

function sendNextChunk(a) {
  let chunk = a.slice(0, MTU);
  rxCharacteristic.writeValue(chunk).then(function () {
    if (a.length > MTU) {
      sendNextChunk(a.slice(MTU));
    }
  });
}

export function tes() {
  let st = "abadinet-in/AB5578/kontrol/0/getAllTask;1;";
  nusSendString(st);
  sendCount++;
}
/*

export function kirimMsg(type, num, cmd, msg) {
    let ms = pubMqtt + type + '/' + num + '/' + cmd
    const bleMsg = ms + ';' + msg + '\n'

    mqttClient.publish(ms, msg, { qos: 0, retain: false })

}
    */
