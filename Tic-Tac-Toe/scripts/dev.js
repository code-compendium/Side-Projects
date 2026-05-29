import { spawn } from "node:child_process";

const processes = [];

function startProcess(command, name) {
	const child = spawn(command, {
		stdio: "inherit",
		shell: true,
		cwd: process.cwd(),
	});

	processes.push(child);

	child.on("exit", (code) => {
		if (code !== 0) {
			console.error(`${name} exited with code ${code}`);
		}

		processes.forEach((processChild) => {
			if (processChild !== child && !processChild.killed) {
				processChild.kill();
			}
		});
	});
}

startProcess("node server/index.js", "room server");
startProcess("npm run dev:client", "vite client");

process.on("SIGINT", () => {
	processes.forEach((child) => child.kill());
	process.exit(0);
});
