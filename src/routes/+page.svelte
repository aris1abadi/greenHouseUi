<script>
	import { Button, Modal } from "flowbite-svelte";
	import NumberSpinner from "svelte-number-spinner";

	import { onMount } from "svelte";

	import {
		dataTask,		
		kirimMsg,		
		flowAPersen,
		flowBPersen,
		flowCPersen,
		bleConnectionToggle,
		bleIsConnected,
		mqttConnectionToggle,
		mqttIsConnected,
		logDisplay,
	} from "$lib/stores";

	import { tes } from "$lib/stores";

	let defaultModal = false;
	let dataTaskNow = null;

	let batasBawahValue = 30;
	let batasAtasValue = 32;
	let minSpinner = 10;
	let maxSpinner = 100;
	let volume = 80;

	let aktuator1Select = 0;
	let aktuator2Select = 0;
	let aktuatorMixASelect = 0;
	let aktuatorMixBSelect = 0;
	let aktuatorMixCSelect = 0;
	let aktuatorAdukSelect = 0;
	let aktuatorMixOutSelect = 0;
	let targetAValue = 0;
	let targetBValue = 0;
	let targetCValue = 0;

	let sensorSelect = 0;
	let sensorList = [];
	let setupTitle = "Setup";
	// @ts-ignore
	let lastMsg = null;

	

	// @ts-ignore
	let header = "Temperature";

	// Gunakan onMount agar manipulasi DOM hanya terjadi di client-side
	onMount(() => {
		// Inisialisasi MQTT hanya jika belum ada koneksi
		/*
		mqttClient.subscribe((client) => {
			if (!client) {
				initMqtt(); // Koneksi pertama kali
			}
		});
		const unsubscribe = mqttData.subscribe((data) => {
			cekMqttMsg(data); // Panggil fungsi untuk memperbarui sensorData
		});
		openFullscreen();

		// Unsubscribe ketika komponen dibongkar
		return () => {
			unsubscribe();
		};
		*/
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
	function openFullscreen() {
		const element = document.documentElement;
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}
	// @ts-ignore
	function enableClick(idx) {
		const tp = "auto" + $dataTask[idx].nama;
		if ($dataTask[idx].enable == 0) {
			$dataTask[idx].enable = 1;

			$dataTask[idx].flowAValue = 0;
			$dataTask[idx].flowBValue = 0;
			$dataTask[idx].flowCValue = 0;
		} else {
			$dataTask[idx].enable = 0;
			$dataTask[idx].flowAValue = 0;
			$dataTask[idx].flowBValue = 0;
			$dataTask[idx].flowCValue = 0;
		}
		kirimMsg(tp, 1, "enable", String($dataTask[idx].enable));
	}

	// @ts-ignore
	function setupClick(idx) {
		defaultModal = true;
		setupIndex = idx;

		setupTitle = "Setup Auto" + $dataTask[idx].nama;

		//alert($dataTask[idx].nama)
		//set pilih aktuator sesai data
		aktuator1Select = $dataTask[idx].aktuatorUse1 - 1;
		aktuator2Select = $dataTask[idx].aktuatorUse2 - 1;

		aktuatorMixASelect = $dataTask[idx].aktuatorMixA - 1;
		aktuatorMixBSelect = $dataTask[idx].aktuatorMixB - 1;
		aktuatorMixCSelect = $dataTask[idx].aktuatorMixC - 1;
		aktuatorAdukSelect = $dataTask[idx].aktuatorAduk - 1;
		aktuatorMixOutSelect = $dataTask[idx].aktuatorMixOut - 1;

		targetAValue = $dataTask[idx].targetMixA * 100;
		targetBValue = $dataTask[idx].targetMixB * 100;
		targetCValue = $dataTask[idx].targetMixC * 100;

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

		//load batas
		if (nama == "Intermittent") {
			batasBawahValue = $dataTask[idx].targetBawah - 15;
			batasAtasValue = $dataTask[idx].targetAtas - 15;
			minSpinner = -15;
			maxSpinner = 15;
		} else {
			batasBawahValue = $dataTask[idx].targetBawah;
			batasAtasValue = $dataTask[idx].targetAtas;
			minSpinner = 10;
			maxSpinner = 100;
		}
	}

	function aktuatorSelect_click(num = 1) {
		const tp = "auto" + $dataTask[setupIndex].nama;

		if (num == 1) {
			//kirimMsg(type, num, cmd, msg)
			kirimMsg(tp, 1, "aktuatorUse1", String(aktuator1Select + 1));
			$dataTask[setupIndex].aktuatorUse1 = aktuator1Select + 1;
			alert("pilih aktuator1 " + (aktuator1Select + 1));
		} else if (num == 2) {
			kirimMsg(tp, 1, "aktuatorUse2", String(aktuator2Select + 1));
			$dataTask[setupIndex].aktuatorUse2 = aktuator2Select + 1;
			alert("pilih aktuator2 " + (aktuator2Select + 1));
		} else if (num == 3) {
			kirimMsg(tp, 1, "aktuatorMixA", String(aktuatorMixASelect + 1));
			$dataTask[setupIndex].aktuatorMixA = aktuatorMixASelect + 1;
			alert("pilih aktuatorMix A " + (aktuatorMixASelect + 1));
		} else if (num == 4) {
			kirimMsg(tp, 1, "aktuatorMixB", String(aktuatorMixBSelect + 1));
			$dataTask[setupIndex].aktuatorMixB = aktuatorMixBSelect + 1;
			alert("pilih aktuatorMix B " + (aktuatorMixBSelect + 1));
		} else if (num == 5) {
			kirimMsg(tp, 1, "aktuatorMixC", String(aktuatorMixCSelect + 1));
			$dataTask[setupIndex].aktuatorMixC = aktuatorMixCSelect + 1;
			alert("pilih aktuatorMix C " + (aktuatorMixCSelect + 1));
		}
	}
	function sensorSelect_click() {
		const tp = "auto" + $dataTask[setupIndex].nama;
		kirimMsg(tp, 1, "sensorUse1", String(sensorSelect + 1));
		$dataTask[setupIndex].sensorUse1 = sensorSelect + 1;

		alert("sensor temperture select: " + sensorSelect + 1);
	}

	function batasBawahChange(idx) {
		const tp = "auto" + $dataTask[setupIndex].nama;
		if (tp === "autoIntermittent") {
			kirimMsg(tp, 1, "targetBawah", String(batasBawahValue + 15));
			$dataTask[setupIndex].targetBawah = batasBawahValue + 15;
		} else {
			kirimMsg(tp, 1, "targetBawah", String(batasBawahValue));
			$dataTask[setupIndex].targetBawah = batasBawahValue;
		}

		alert("Target bawah: " + batasBawahValue);
	}

	function batasAtasChange(idx) {
		const tp = "auto" + $dataTask[setupIndex].nama;
		if (tp === "autoIntermittent") {
			kirimMsg(tp, 1, "targetAtas", String(batasAtasValue + 15));
			$dataTask[setupIndex].targetAtas = batasAtasValue + 15;
		} else {
			kirimMsg(tp, 1, "targetAtas", String(batasAtasValue));
			$dataTask[setupIndex].targetAtas = batasAtasValue;
		}

		alert("Target atas: " + batasAtasValue);
	}

	function targetAValue_change() {
		const tp = "auto" + $dataTask[setupIndex].nama;
		kirimMsg(tp, 1, "targetMixA", String(targetAValue / 100));
		$dataTask[setupIndex].targetMixA = targetAValue / 100;
		alert(
			"Target " +
				$dataTask[setupIndex].namaMixA +
				":" +
				targetAValue +
				"mL",
		);
	}

	function targetBValue_change() {
		const tp = "auto" + $dataTask[setupIndex].nama;
		kirimMsg(tp, 1, "targetMixB", String(targetBValue / 100));
		$dataTask[setupIndex].targetMixB = targetBValue / 100;
		alert(
			"Target " +
				$dataTask[setupIndex].namaMixB +
				":" +
				targetBValue +
				"mL",
		);
	}

	function targetCValue_change() {
		const tp = "auto" + $dataTask[setupIndex].nama;
		kirimMsg(tp, 1, "targetMixC", String(targetCValue / 100));
		$dataTask[setupIndex].targetMixC = targetCValue / 100;
		alert(
			"Target " +
				$dataTask[setupIndex].namaMixC +
				":" +
				targetCValue +
				"mL",
		);
	}

	function mixAClick() {
		alert("nama MixA click");
	}

	

	//update dataTask
	//$: dataTask
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="greenhouse kontrol" />
</svelte:head>

<section>
	<div class="grid grid-cols-2 w-full gap-8 no-select">
		{#each $dataTask as dataShow, idx}
			<div
				class="h-42 w-full p-0 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
			>
				<button
					class={dataShow.enable == 0
						? "h-8 w-full mt-0 bg-red-500  text-white text-sm text-center font-monospace font-bold"
						: "h-8 w-full mt-0 bg-green-500  text-white text-sm text-center font-monospace font-bold"}
					on:click={() => enableClick(idx)}
				>
					Auto{dataShow.nama}
				</button>
				<!--
				<div class="h-4 px-4 mt-2 text-center font-mono text-xm">
					{dataShow.nama}
				</div>

			-->

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="h-24 w-full justify-items-center"
					on:dblclick={() => setupClick(idx)}
				>
					{#if dataShow.inverseMode === 3}
						<div
							class="grid grid-cols-2 gap-2 place-items-center w-full h-24 mt-2"
						>
							<div class="w-full h-3/4 flex justify-center">
								<div
									class="w-6 bg-indigo-700 rounded-full h-full"
								>
									<div
										class="bg-gray-200 w-6 rounded-full rounded-b-none"
										style="height: {100 -
											(dataShow.sensorValue / 30) *
												100}%;"
									></div>
								</div>
							</div>

							<div>
								<div
									class=" text-center font-mono font-bold text-xl w-full content-center"
								>
									{dataShow.sensorValue - 15}<small
										><small> cm</small></small
									>
								</div>
								<div class="text-xs">
									{dataShow.targetBawah - 15} ~ {dataShow.targetAtas -
										15}
								</div>
							</div>
						</div>
					{:else if dataShow.inverseMode === 2}
						<div class="w-full h-full flex justify-center">
							<div class="h-full w-5/6 mt-2">
								<!-- Mix A-->
								<div class="text-xs">
									{dataShow.mixANama}({dataShow.targetMixA *
										100}mL) > {dataShow.flowAValue}
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-blue-600 rounded-full"
										style="width: {$flowAPersen}%;"
									></div>
								</div>

								<div class="text-xs">
									{dataShow.mixBNama}({dataShow.targetMixB *
										100}mL) > {dataShow.flowBValue}
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-blue-500 rounded-full"
										style="width: {$flowBPersen}%;"
									></div>
								</div>
								<!-- Mix C-->
								<div class="text-xs">
									{dataShow.mixCNama}({dataShow.targetMixC *
										100}mL) > {dataShow.flowCValue}
								</div>
								<div
									class="w-full bg-gray-200 rounded-full h-1.5"
								>
									<div
										class="h-1.5 bg-blue-600 rounded-full"
										style="width: {$flowCPersen}%;"
									></div>
								</div>

								<div class="text-xs">
									Aduk({dataShow.mixingTarget}detik) > {dataShow.mixingCount}
								</div>
							</div>
						</div>
					{:else}
						<div
							class="mt-4 text-center font-mono font-bold text-4xl"
						>
							{dataShow.sensorValue}
						</div>
						<div class="text-center font-mono text-xs h-4 mt-4">
							{#if dataShow.inverseMode === 1}
								ON:{dataShow.targetBawah} ~ OFF:{dataShow.targetAtas}
							{:else if dataShow.inverseMode === 0}
								OFF:{dataShow.targetBawah} ~ ON:{dataShow.targetAtas}
							{/if}
						</div>
					{/if}
				</div>

				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
			</div>
		{/each}
	</div>
	<div>
		<div class="w-full h-8 grid grid-cols-2 gap-2">
			<button
				on:click={() => bleConnectionToggle()}
				type="button"
				class={$bleIsConnected
					? "mt-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
					: "mt-8 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"}
			>
				{#if $bleIsConnected}
					Disconnect
				{:else}
					Connect Bluethooth
				{/if}
			</button>

			<button
				on:click={() => mqttConnectionToggle()}
				type="button"
				class={$mqttIsConnected
					? "mt-8 text-white bg-lime-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
					: "mt-8 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"}
			>
				{#if $mqttIsConnected}
					Disconnect
				{:else}
					Connect Server
				{/if}
			</button>
		</div>

		<div class="w-full h-full grid justify-items-center P-4 mt-8">
			<!-- bluethooth -->

			{#if $bleIsConnected}
				<button
					class="w-1/4 h-8 border border-black mt-8"
					on:click={() => tes()}>tes</button
				>
				<div
					class=" mt-4 w-11/12 h-64 container mx-auto overflow-auto border border-black"
				>
					{logDisplay}
				</div>
			{/if}
		</div>
	</div>

	<Modal class="w-6/10" title={setupTitle} bind:open={defaultModal} autoclose>
		<form class="max-w-sm mx-auto grid grid-cols-2 gap-2">
			{#if $dataTask[setupIndex].inverseMode === 2}
				<div>
					<label
						for="small3"
						class="block mb-1 text-xs dark:text-white"
						>Aktuator {$dataTask[setupIndex].mixANama}</label
					>
					<select
						bind:value={aktuatorMixASelect}
						on:change={() => aktuatorSelect_click(3)}
						id="small3"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
				<div class="ml-4">
					<label
						for="targetA"
						class="block mb-1 text-xs dark:text-white"
						>Target {$dataTask[setupIndex].mixANama}</label
					>
					<span>
						<NumberSpinner
							id="targetA"
							bind:value={targetAValue}
							min="100"
							max="5000"
							step="100"
							mainStyle="color:#aaa; width:80px; border-radius:20px"
							focusStyle="color:#06f"
							draggingStyle="border-color:#f00"
							editingStyle="color:#00f; background-color:#06f4"
							fastStyle="color:#f00"
							slowStyle="color:#0c0"
							cursor="pointer"
							on:dragend={() => targetAValue_change()}
						/>
					</span> mL
				</div>

				<div>
					<label
						for="small4"
						class="block mb-1 text-xs dark:text-white"
						>Aktuator {$dataTask[setupIndex].mixBNama}</label
					>
					<select
						bind:value={aktuatorMixBSelect}
						on:change={() => aktuatorSelect_click(4)}
						id="small4"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
				<div class="ml-4">
					<label
						for="targetB"
						class="block mb-1 text-xs dark:text-white"
						>Target {$dataTask[setupIndex].mixBNama}</label
					>
					<span>
						<NumberSpinner
							id="targetB"
							bind:value={targetBValue}
							min="100"
							max="5000"
							step="100"
							mainStyle="color:#aaa; width:80px; border-radius:20px"
							focusStyle="color:#06f"
							draggingStyle="border-color:#f00"
							editingStyle="color:#00f; background-color:#06f4"
							fastStyle="color:#f00"
							slowStyle="color:#0c0"
							cursor="pointer"
							on:dragend={() => targetBValue_change()}
						/>
					</span> mL
				</div>

				<div>
					<label
						for="small5"
						class="block mb-1 text-xs dark:text-white"
						>Aktuator {$dataTask[setupIndex].mixCNama}</label
					>
					<select
						bind:value={aktuatorMixCSelect}
						on:change={() => aktuatorSelect_click(5)}
						id="small5"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
				<div class="ml-4">
					<label
						for="targetC"
						class="block mb-1 text-xs dark:text-white"
						>Target {$dataTask[setupIndex].mixCNama}</label
					>
					<span>
						<NumberSpinner
							id="targetC"
							bind:value={targetCValue}
							min="100"
							max="30000"
							step="100"
							mainStyle="color:#aaa; width:80px; border-radius:20px"
							focusStyle="color:#06f"
							draggingStyle="border-color:#f00"
							editingStyle="color:#00f; background-color:#06f4"
							fastStyle="color:#f00"
							slowStyle="color:#0c0"
							cursor="pointer"
							on:dragend={() => targetCValue_change()}
						/>
					</span> mL
				</div>

				<div>
					<label
						for="small6"
						class="block mb-1 text-xs dark:text-white"
						>Aktuator Aduk</label
					>
					<select
						bind:value={aktuatorAdukSelect}
						on:change={() => aktuatorSelect_click(5)}
						id="small6"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="small7"
						class="block mb-1 text-xs dark:text-white"
						>Aktuator Mix Out</label
					>
					<select
						bind:value={aktuatorMixOutSelect}
						on:change={() => aktuatorSelect_click(6)}
						id="small7"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>

				<hr />
				<hr />

				<div>
					<label
						for="namaMixA"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixA</label
					>
					<input
						type="text"
						id="namaMixA"
						on:mouseenter={() => mixAClick()}
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder={$dataTask[setupIndex].mixANama}
						required
					/>
				</div>

				<div>
					<label
						for="namaMixB"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
						>Nama MixB</label
					>
					<input
						type="text"
						id="namaMixB"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder={$dataTask[setupIndex].mixBNama}
						required
					/>
				</div>

				<Button color="blue">Simpan Nama A</Button>
				<Button color="blue">Simpan Nama B</Button>
			{:else}
				<div>
					<label
						for="small1"
						class="block mb-1 text-xs dark:text-white"
						>Pilih Aktuator1</label
					>
					<select
						bind:value={aktuator1Select}
						on:change={() => aktuatorSelect_click(1)}
						id="small1"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="small2" class="block mb-1 text-xs"
						>Pilih Aktuator2</label
					>
					<select
						bind:value={aktuator2Select}
						on:change={() => aktuatorSelect_click(2)}
						id="small2"
						class="block w-full p-2 mb-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					>
						{#each aktuatorList as aktuator, idx}
							<option value={idx}>{aktuator}</option>
						{/each}
					</select>
				</div>
			{/if}
		</form>

		{#if $dataTask[setupIndex].inverseMode === 2}
			<div></div>
		{:else}
			<div class="my-0">
				<label
					for="pilihSensor"
					class="block mb-1 text-xs dark:text-white"
					>Pilih Sensor1</label
				>
				<select
					id="pilihSensor"
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
					min={minSpinner}
					max={batasAtasValue - 1}
					step="1"
					mainStyle="color:#aaa; width:80px; border-radius:20px"
					focusStyle="color:#06f"
					draggingStyle="border-color:#f00"
					editingStyle="color:#00f; background-color:#06f4"
					fastStyle="color:#f00"
					slowStyle="color:#0c0"
					cursor="pointer"
					on:dragend={() => batasBawahChange(setupIndex)}
				/>

				<NumberSpinner
					bind:value={batasAtasValue}
					min={batasBawahValue + 1}
					max={maxSpinner}
					step="1"
					mainStyle="color:#aaa; width:80px; border-radius:20px"
					focusStyle="color:#06f"
					draggingStyle="border-color:#f00"
					editingStyle="color:#00f; background-color:#06f4"
					fastStyle="color:#f00"
					slowStyle="color:#0c0"
					cursor="pointer"
					on:dragend={() => batasAtasChange(setupIndex)}
				/>
			</div>
		{/if}

		<svelte:fragment slot="footer">
			<Button color="red">Keluar</Button>
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
</style>
