import { writable } from 'svelte/store';
//import { persisted } from 'svelte-persisted-store'
import mqtt from 'mqtt';


export const dataTask = writable([])

export const mqttClient = writable(null);
export const mqttData = writable({});

const subMqtt = "abadinet-out/AB5578/#"
const pubMqtt = "abadinet-in/AB5578/"
let clientId = 'CL' + Math.random().toString(16).substr(2, 4).toUpperCase()
//const host = 'ws://abadinet.my.id:2020'
//const host = 'wss://node-red.balingtansmart.my.id/ws'    
//const host =  'ws://'+ get(brokerUseStore) + '/mqtt:' + get(brokerPortUseStore); 
const brokerUrl = 'ws://mqtt.eclipseprojects.io/mqtt:80'

let lastMsg = null
let dataTaskNow 

const options = {
    keepalive: 30,
    clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false
    },
    rejectUnauthorized: false
  }

  const dtSub = dataTask.subscribe((data) => {
    dataTaskNow = data; // Panggil fungsi untuk memperbarui sensorData
});
  

// Fungsi untuk menginisialisasi MQTT Client (hanya sekali)
// @ts-ignore
export function initMqtt() {
    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe(subMqtt, { qos: 0 })
        let pubStatus = pubMqtt + "kontrol/0/status"
        console.log("mqtt conected")
        let getDataTask = pubMqtt + "kontrol/0/getAllTask"
        mqttClient.set(client); // Set mqttClient di dalam store

        //cekClientId();

        client.publish(pubStatus, clientId, { qos: 0, retain: false })
        client.publish(getDataTask,'1',{ qos: 0, retain: false })
        //kirimMsg("kontrol", 0, "getAllTask", "1")
    });



    client.on('message', (topic, payload) => {
        mqttData.update(data => ({
            ...data,topic,
            msg: payload.toString()  // Update data berdasarkan topik
        }));
    });

    //mqttClient.set(client); // Simpan client MQTT di store
}

export function kirimMsg(type, num, cmd, msg) {
    const pubMqtt = "abadinet-in/AB5578/";
    let ms = pubMqtt + type + "/" + num + "/" + cmd;
    const bleMsg = ms + ";" + msg + "\n";
    mqttClient.subscribe((client) => {
        if (client) {
            client.publish(ms, msg, { qos: 0, retain: false });
        } else {
            console.error("MQTT client is not connected");
        }
    });
}

export function cekMqttMsg(data) {
    //console.log("Sensor Data updated:", data);

    //const splitMsg = data.split(": '")
    const topic = data.topic;
    const msg_payload = data.msg;
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
                    console.log(msg_payload)
                    //dataTask.set([]); // Kosongkan store sebelum diisi ulang

                    for (let i = 0; i < msgSplit.length; i++) {
                        try {
                            let jsonData = JSON.parse(msgSplit[i]); // Parse JSON
                            jsonData.sensorValue = 0; // Tambahkan properti sensorValue
                            let nm = jsonData.nama
                            jsonData.nama = nm.trim()
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
               
                let namaType = "auto" + dataTaskNow[i].nama                
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
                    } else if (msg_cmd === "flowSensorA") {
                        dataTaskNow[i].flowSensorA = parseInt(msg_payload);
                    } else if (msg_cmd === "flowSensorB") {
                        dataTaskNow[i].flowSensorB = parseInt(msg_payload);
                    } else if (msg_cmd === "flowSensorC") {
                        dataTaskNow[i].flowSensorC = parseInt(msg_payload);
                    } else if (msg_cmd === "flowMixOut") {
                        dataTaskNow[i].flowMixOut = parseInt(msg_payload);
                    } else if (msg_cmd === "targetmixA") {
                        dataTaskNow[i].targetmixA = parseInt(msg_payload);
                    } else if (msg_cmd === "targetMixB") {
                        dataTaskNow[i].targetMixB = parseInt(msg_payload);
                    } else if (msg_cmd === "targetMixC") {
                        dataTaskNow[i].targetMixC = parseInt(msg_payload);
                    } else if (msg_cmd === "mixingTarget") {
                        dataTaskNow[i].mixingTarget = parseInt(msg_payload);
                    }
                    break;
                }
                dataTask.set(dataTaskNow)
            }
        }
    }
}
/*

export function kirimMsg(type, num, cmd, msg) {
    let ms = pubMqtt + type + '/' + num + '/' + cmd
    const bleMsg = ms + ';' + msg + '\n'

    mqttClient.publish(ms, msg, { qos: 0, retain: false })

}
    */
