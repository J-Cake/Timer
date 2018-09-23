const { ipcRenderer } = require('electron');

let fullscreen = false;
let timerStarted = false;
let timer;

(async function () {
	setInterval(e => {
		let d = new Date;
		document.querySelector('.current-time').innerHTML = formatTime({h: d.getHours(), m: d.getMinutes(), s: d.getSeconds()})
	}, 100)
})()

let time = {
	h: 0,
	m: 0,
	s: 0
}
let startTime = {
	h: 0,
	m: 0,
	s: 0
}
let endTime = {
	h: 0,
	m: 5,
	s: 0
}

let cycles = 1;

let options = {
	loop: false,
	paused: true,
	loop_counter: "Loops: ",
}

// if (!window.localStorage.options) window.localStorage.options = JSON.stringify(options);
// options = JSON.parse(window.localStorage.options);
// endTime.h = Number(options.hours)
// endTime.m = Number(options.mins)
// endTime.s = Number(options.secs)
// document.querySelector('.note').innerHTML = options.loop_counter;

Mousetrap.bind("space", toggleTimer);
Mousetrap.bind("esc", e => showOptions());
Mousetrap.bind("f11", e => ipcRenderer.send('fullscreen', (fullscreen ^= 1) == true));

function toggleTimer () {
	options.paused = (options.paused ^= 1) == true

	if (!timerStarted) {
		let tmp = new Date;
		startTime.h = tmp.getHours();
		startTime.m = tmp.getMinutes();
		startTime.s = tmp.getSeconds();

		timerStarted = true;
	}
	resumeTimer();

}

async function resumeTimer () {
	timer = setInterval(e => {
		let d = new Date;

		if (!options.paused) {
			time.h = d.getHours() - startTime.h;
			time.m = d.getMinutes() - startTime.m;
			time.s = d.getSeconds() - startTime.s;

			let displayTime = formatTime(subtractTimes(endTime, time));

			if (options.loop) {
				if (displayTime == "-1:-1:-1") {
					let tmp = new Date;
					startTime.h = tmp.getHours();
					startTime.m = tmp.getMinutes();
					startTime.s = tmp.getSeconds();

					new Audio("loop.mp3").play();

					document.querySelector('.amount').innerHTML = ++cycles;
				} else document.querySelector('.time').innerHTML = displayTime;
			} else {
				if (displayTime == "-1:-1:-1") {
					clearInterval (timer);
					new Audio("loop.mp3").play();
					timerStarted = false;
				} else document.querySelector('.time').innerHTML = displayTime;
			}
		} else {
			clearInterval(timer);
		}


	}, 100);

}

function formatTime (_time) {
	return `${padString(_time.h)}:${padString(_time.m)}:${padString(_time.s)}`
}

function padString (str) {
	let newStr = str.toString();

	while (newStr.length < 2) {
		newStr = '0' + newStr;
	}
	return newStr;
}

function subtractTimes (time1, time2) {

	let h = time1.h - time2.h,
		m = time1.m - time2.m,
		s = time1.s - time2.s;

	let totalSeconds = s + (m * 60) + (h * (60*60));

	h = Math.floor(totalSeconds / 3600)
	m = Math.floor(totalSeconds % 3600 / 60)
	s = Math.floor(totalSeconds % 3600 % 60);

	return {h,m,s}
}

async function showOptions() {
	let content = `
		<div class="options">
			<div class="option"><label for="loop">Loop Timer</label><span class="checkbox value-output" name="loop" value=${options.loop}></span></div>
			<hr>
			<div class="option"><label for="hours">Hours</label><input name="hours" id="hours" type="number" value=${endTime.h} min=0 max=24 class="value-output"></div>
			<div class="option"><label for="mins">Minutes</label><input name="mins" id="mins" type="number" value=${endTime.m} min=0 max=59 class="value-output"></div>
			<div class="option"><label for="secs">Seconds</label><input name="secs" id="secs" type="number" value=${endTime.s} min=0 max=59 class="value-output"></div>
			<div class="option"><label for="loop_counter">Loop Counter</label><input class="value-output" id="loop_counter" name="loop_counter" placeholder="Loop Counter Message" value=${options.loop_counter}></div>
		</div>
	`
	options = await new UIbox(new template({ content, buttons: [new button("Ok", "ok"), new button("Cancel", "cancel"), new button("Reset Timer", e => {
		timerStarted = false;
		time = {h: 0, m: 0, s: 0};
		options.paused = true;

		document.querySelector('.time').innerHTML = formatTime(endTime);

	}, true)]}), "Options", e => {
		[...document.querySelectorAll('.checkbox.value-output')].forEach(checkbox => {
			checkbox.value = options[checkbox.getAttribute('name')];
			checkbox.style.background = checkbox.value ? "#09b73d" : "#b72d2d";
			checkbox.addEventListener('click', e => {
				checkbox.value = (checkbox.value ^= 1) == true;
				checkbox.style.background = checkbox.value ? "#09b73d" : "#b72d2d";
			})
		})
	}).get();

	endTime.h = Number(options.hours)
	endTime.m = Number(options.mins)
	endTime.s = Number(options.secs)

	document.querySelector('.note').innerHTML = options.loop_counter;

	window.localStorage.options = JSON.stringify(options);

	console.log(options, endTime)
}
