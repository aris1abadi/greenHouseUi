
<script>
  let volume = 80
  let device;
  let server;
  let status = "Disconnected";
  let beefValue = "N/A";
  let foodValue = "N/A";

  async function connectBLE() {
    try {
      status = "Connecting...";
      device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["DEAD", "BAAD"] }],
      });
      server = await device.gatt.connect();
      status = "Connected";

      // Membaca karakteristik BEEF dari service DEAD
      const deadService = await server.getPrimaryService("DEAD");
      const beefCharacteristic = await deadService.getCharacteristic("beef");

      const beefData = await beefCharacteristic.readValue();
      beefValue = new TextDecoder().decode(beefData);

      // Membaca karakteristik F00D dari service BAAD
      const baadService = await server.getPrimaryService("BAAD");
      const foodCharacteristic = await baadService.getCharacteristic("f00d");

      const foodData = await foodCharacteristic.readValue();
      foodValue = new TextDecoder().decode(foodData);

      // Memulai notifikasi untuk karakteristik F00D
      foodCharacteristic.startNotifications();
      foodCharacteristic.addEventListener("characteristicvaluechanged", event => {
        const value = new TextDecoder().decode(event.target.value);
        foodValue = value;
      });

    } catch (error) {
      status = "Failed to connect: " + error;
    }
  }

  function disconnectBLE() {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
      status = "Disconnected";
      beefValue = "N/A";
      foodValue = "N/A";
    }
  }

  async function writeToBeef() {
    if (server) {
      const deadService = await server.getPrimaryService("DEAD");
      const beefCharacteristic = await deadService.getCharacteristic("beef");
      const data = new TextEncoder().encode("New Burger Value");
      await beefCharacteristic.writeValue(data);
      beefValue = "New Burger Value";
    }
  }
</script>
<div class="h-24 w-36">
<div class="tk">
  <h3 class="text_cm">{volume}</h3>
    <div class="lq" data-amount="69" style="height: {volume}%;">
      <div class="ring" style="height: {100 - volume + 10}%;"></div>
    </div>
  </div>

</div>
<div>
  <p>Status: {status}</p>
<p>Characteristic BEEF: {beefValue}</p>
<p>Characteristic F00D: {foodValue}</p>

<button on:click={connectBLE}>Connect to BLE Device</button>
<button on:click={disconnectBLE} disabled={status === "Disconnected"}>
  Disconnect
</button>
<button on:click={writeToBeef} disabled={status !== "Connected"}>
  Write to BEEF
</button>
</div>

<style>
.tk {
  position:relative;
    width:40%; 
    height:100px;
    padding-top:40px;
    margin: 0 auto;
    background:rgba(56,56,56,0.8);
    border-radius: 100%/40px;
    border-bottom:3px solid #000;
    text-align:center;
    z-index:1;
    overflow:hidden;
}

.lq {
  position: absolute;
   background:rgba(187, 246, 250, 0.99);
   width: 100%;
    height:0;
    bottom: 0;
    border-radius:100%/40px;
    border-bottom:3px solid #000;
}

.ring {
  position: absolute;
  border-radius:100%;
  top: 0;
  width: 100%;
  height:40%;
  content: '';
  border:1px solid #000;
}

.text_cm {
  display: block;
  position:absolute;
  top: 45%;
  left: 45%;
  z-index: 1;
}
</style>