<script>
	import { Button, Modal } from "flowbite-svelte";
	import NumberSpinner from "svelte-number-spinner";

	import { onMount } from "svelte";

	import {
		dataTask,
		mqttClient,
		mqttData,
		initMqtt,
		kirimMsg,
		cekMqttMsg,
	} from "$lib/stores";

	let defaultModal = false;
	let dataTaskNow = null;

	let batasBawahValue = 30;
	let batasAtasValue = 32;
	let volume = 80;

	let aktuator1Select = 0;
	let aktuator2Select = 0;
	let sensorSelect = 0;
	let sensorList = [];

	// @ts-ignore
	let lastMsg = null;

	// @ts-ignore
	let header = "Temperature";

	// Gunakan onMount agar manipulasi DOM hanya terjadi di client-side
	onMount(() => {
		// Inisialisasi MQTT hanya jika belum ada koneksi
		mqttClient.subscribe((client) => {
			if (!client) {
				initMqtt(); // Koneksi pertama kali
			}
		});
		const unsubscribe = mqttData.subscribe((data) => {
			cekMqttMsg(data); // Panggil fungsi untuk memperbarui sensorData
		});

		// Unsubscribe ketika komponen dibongkar
		return () => {
			unsubscribe();
		};
	});

	// @ts-ignore
	let aktuatorList = [
		"Aktuator1",
		"Aktuator2",
		"Aktuator3",
		"Aktuator4",
		"Aktuator5",
		"Aktuator6",
		"Aktuator7",
		"Aktuator8",
		"Aktuator9",
		"Aktuator10",
		"Aktuator11",
		"Aktuator12",
		"Aktuator13",
		"Aktuator14",
		"Aktuator15",
		"Aktuator16",
		"Aktuator17",
		"Aktuator18",
		"Aktuator19",
		"Aktuator20",
		"Aktuator21",
		"Aktuator22",
		"Aktuator23",
		"Aktuator24",
	];

	let sensorLengasList = [
		"Sensor Lengas1",
		"Sensor Lengas2",
		"Sensor Lengas3",
		"Sensor Lengas4",
	];

	let sensorTemperatureList = [
		"Sensor Temperature1",
		"Sensor Temperature2",
		"Sensor Temperature3",
		"Sensor Temperature4",
	];
	let sensorHumidityList = [
		"Sensor Humidity1",
		"Sensor Humidity2",
		"Sensor Humidity3",
		"Sensor Humidity4",
	];

	let sensorIntermittentList = [
		"Sensor Intermittent1",
		"Sensor Intermittent2",
		"Sensor Intermittent3",
		"Sensor Intermittent4",
	];

	let setupIndex = 0;
	// @ts-ignore
	function enableClick(idx) {
		const tp = "auto" + $dataTask[idx].nama;
		if ($dataTask[idx].enable == 0) {
			$dataTask[idx].enable = 1;
		} else {
			$dataTask[idx].enable = 0;
		}
		kirimMsg(tp, 1, "enable", String($dataTask[idx].enable));
	}

	// @ts-ignore
	function setupClick(idx) {
		defaultModal = true;
		setupIndex = idx;

		//alert($dataTask[idx].nama)
		//set pilih aktuator sesai data
		aktuator1Select = $dataTask[idx].aktuatorUse1 - 1;
		aktuator2Select = $dataTask[idx].aktuatorUse2 - 1;

		const nm = $dataTask[idx].nama;
		const nama = nm.trim();
		// sensorList = sensorTemperatureList
		if (nama == "Temperature") {
			sensorList = sensorTemperatureList;
		} else if (nama == "Humidity") {
			sensorList = sensorHumidityList;
		} else if (nama == "Lengas") {
			sensorList = sensorLengasList;
		} else if (nama == "Genangan") {
			sensorList = sensorTemperatureList;
		} else if (nama == "Intermittent") {
			sensorList = sensorIntermittentList;
		}
	}

	function aktuatorSelect_click(num = 1) {
		if (num == 1) {
			alert("pilih aktuator1 " + aktuator1Select);
		} else if (num == 2) {
			alert("pilih aktuator2 " + aktuator2Select);
		}
	}
	function sensorSelect_click() {
		alert("sensor temperture select: " + sensorSelect);
	}

	//update dataTask
	//$: dataTask
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="greenhouse kontrol" />
</svelte:head>

<section>
	<div class="grid grid-cols-2 gap-8 no-select">
		{#each $dataTask as dataShow, idx}
			<div
				class="h-42 w-full px-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
			>
				<div class="h-4 px-4 mt-2 text-center font-mono text-xm">
					{dataShow.nama}
				</div>

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="h-24 w-full justify-items-center"
					on:dblclick={() => setupClick(idx)}
				>
					{#if dataShow.nama === "Intermittent"}
						<div
							class="grid grid-cols-2 gap-2 place-items-center w-full h-24 mt-2"
						>
							<div class="w-full h-3/4 flex justify-center">
								<div
									class="w-6 bg-orange-500 rounded-full h-full"
								>
									<div
										class="bg-gray-200 w-6 rounded-full rounded-b-none"
										style="height: 65%;"
									></div>
								</div>
							</div>

							<div
								class=" text-center font-mono font-bold text-xl w-full content-center"
							>
								{dataShow.sensorValue}
							</div>
						</div>
					{:else if dataShow.nama === "ABMix"}
						<div class="w-full h-full flex justify-center">
							<div class="h-full w-3/4 mt-2">
								<div class="text-xs">
									{dataShow.mixANama}({dataShow.targetMixA})
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-orange-500 rounded-full"
										style="width: 65%;"
									></div>
								</div>

								<div class="text-xs mt-1">
									{dataShow.mixBNama}({dataShow.targetMixB})
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-orange-500 rounded-full"
										style="width: 65%;"
									></div>
								</div>

								<div class="text-xs mt-1">
									{dataShow.mixCNama}({dataShow.targetMixC})
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-orange-500 rounded-full"
										style="width: 65%;"
									></div>
								</div>
							</div>
						</div>
					{:else}
						<div
							class="mt-4 text-center font-mono font-bold text-4xl"
						>
							{dataShow.sensorValue}
						</div>
					{/if}
					<div class="text-center font-mono text-xs h-4 mt-4">
						32 -- 34
					</div>
				</div>

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class={dataShow.enable == 0
						? "h-8 mt-0 bg-red-500 text-white text-sm text-center font-monospace"
						: "h-8 mt-0 bg-green-500 text-white text-sm text-center font-monospace"}
					on:click={() => enableClick(idx)}
				>
					Auto{dataShow.nama}
				</div>
			</div>
		{/each}
	</div>

	<Modal
		class="w-6/10"
		title={"Setup Auto"}
		bind:open={defaultModal}
		autoclose
	>
		<form class="max-w-sm mx-auto grid grid-cols-2 gap-2">
			<div>
				<label
					for="small"
					class="block mb-1 text-xs font-thin dark:text-white"
					>Pilih Aktuator1(pompa)</label
				>
				<select
					bind:value={aktuator1Select}
					on:change={() => aktuatorSelect_click(1)}
					id="small"
					class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				>
					{#each aktuatorList as aktuator, idx}
						<option value={idx}>{aktuator}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="small" class="block mb-1 text-xs font-thin"
					>Pilih Aktuator2(pompa)</label
				>
				<select
					bind:value={aktuator2Select}
					on:change={() => aktuatorSelect_click(2)}
					id="small"
					class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				>
					{#each aktuatorList as aktuator, idx}
						<option value={idx}>{aktuator}</option>
					{/each}
				</select>
			</div>
		</form>
		<div class="my-0">
			<label
				for="pilihSensorTemp"
				class="block mb-1 text-xs font-thin dark:text-white"
				>Pilih Sensor1</label
			>
			<select
				bind:value={sensorSelect}
				on:change={() => sensorSelect_click()}
				class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			>
				{#each sensorList as temp, idx}
					<option value={idx}>{temp}</option>
				{/each}
			</select>
		</div>

		<div class="grid grid-cols-2 justify-items-center">
			{#if $dataTask[setupIndex].inverseMode == 0}
				<div>ON</div>
				<div>OFF</div>
			{:else}
				<div>OFF</div>
				<div>ON</div>
			{/if}
			<NumberSpinner
				bind:value={batasBawahValue}
				min="10"
				max={batasAtasValue - 1}
				step="1"
				mainStyle="color:#aaa; width:80px; border-radius:20px"
				focusStyle="color:#06f"
				draggingStyle="border-color:#f00"
				editingStyle="color:#00f; background-color:#06f4"
				fastStyle="color:#f00"
				slowStyle="color:#0c0"
				cursor="pointer"
			/>

			<NumberSpinner
				bind:value={batasAtasValue}
				min={batasBawahValue + 1}
				max="100"
				step="1"
				mainStyle="color:#aaa; width:80px; border-radius:20px"
				focusStyle="color:#06f"
				draggingStyle="border-color:#f00"
				editingStyle="color:#00f; background-color:#06f4"
				fastStyle="color:#f00"
				slowStyle="color:#0c0"
				cursor="pointer"
			/>
		</div>

		<svelte:fragment slot="footer">
			<Button on:click={() => alert('Handle "success"')}>Simpan</Button>
			<Button color="alternative">Batal</Button>
		</svelte:fragment>
	</Modal>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.background {
		width: 100%; /* Lebar elemen 100% dari lebar kontainer */
		height: 100%; /* Tinggi elemen */
		background-image: url("awan.jpg"); /* URL gambar */
		background-size: cover; /* Sesuaikan gambar agar menutupi elemen */
		background-position: center; /* Pusatkan gambar */

		background-repeat: no-repeat; /* Jangan ulangi gambar */
	}

	.tk {
		position: relative;
		width: 40%;
		height: 90%;
		padding-top: 40px;
		margin: 0 auto;
		background: rgba(56, 56, 56, 0.8);
		border-radius: 100%/40px;
		border-bottom: 3px solid #000;
		text-align: center;
		z-index: 1;
		overflow: hidden;
	}

	.lq {
		position: absolute;
		background: rgba(187, 246, 250, 0.99);
		width: 100%;
		height: 0;
		bottom: 0;
		border-radius: 100%/40px;
		border-bottom: 3px solid #000;
	}

	.ring {
		position: absolute;
		border-radius: 100%;
		top: 0;
		width: 100%;
		height: 40%;
		content: "";
		border: 1px solid #000;
	}

	.text_cm {
		display: block;
		position: absolute;
		top: 45%;
		left: 45%;
		z-index: 1;
	}
</style>
