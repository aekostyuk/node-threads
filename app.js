const { Worker } = require("worker_threads");
const { fork } = require("child_process");
const { performance, PerformanceObserver } = require("perf_hooks");

const performanceObserver = new PerformanceObserver((items) => {
	items.getEntries().forEach((entry) => {
		console.log(`${entry.name}: ${entry.duration}`);
	});
});

performanceObserver.observe({ entryTypes: ["measure"] });

const workerFunction = (array) => {
	return new Promise((resolve, reject) => {
		performance.mark("worker started");
		const worker = new Worker("./worker.js", {
			workerData: { array },
		});

		worker.on("message", (message) => {
			performance.mark("worker end");
			performance.measure("worker", "worker start", "worker end");
			resolve(message);
		});
	});
};

const forkFunction = (array) => {
	return new Promise((resolve, reject) => {
		performance.mark("fork started");
		const forkProcess = fork("./fork.js");
		forkProcess.send({ array });
		forkProcess.on("message", (message) => {
			performance.mark("fork end");
			performance.measure("fork", "fork start", "fork end");
			resolve(message);
		});
	});
};

const main = async () => {
	await workerFunction([25, 50, 10, 30, 40]);
	await forkFunction([25, 50, 10, 30, 40]);
};

main();
