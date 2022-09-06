// Created by @Explosion-Scratch on GitHub -> https://gist.github.com/Explosion-Scratch/67722d1a16129a2d6f5354cff2aefc4c
(async ({
	interval = 500,
	method = "fetch",
	useIframe = false,
	resources = [],
	autoDetect = true,
	resourceTypes = ["navigation", "script", "resource", "link", "img", "other"],
}) => {
	if (autoDetect) {
		resources = performance
			.getEntries()
			.filter((i) => resourceTypes.includes(i.initiatorType))
			.map((i) => i.name);
	} else if (!resources.length) {
		resources = [location.href];
	}
	console.log({ interval, method, useIframe, resources });
	if (useIframe) {
		document.documentElement.innerHTML = "";
		window.stop();
	}
	let text = await getText(resources, method);
	if (useIframe) {
		let ifr = document.createElement("iframe");
		ifr.id = "hotreload";
		(document.body || document.documentElement).appendChild(ifr);
		document
			.querySelector("iframe#hotreload")
			.setAttribute(
				"style",
				`position: fixed; top: 0; right: 0; left: 0; bottom: 0; display: block;`
			);
		document.querySelector(
			"iframe#hotreload"
		).style.width = `${window.innerWidth}px`;
		document.querySelector(
			"iframe#hotreload"
		).style.height = `${window.innerHeight}px`;
		update({ old: "", newText: text });
	}
	let int = setInterval(async () => {
		let newText = await getText(resources, method);
		if (newText !== text) {
			update({ old: text, newText });
		}
	}, interval);

	function update({ old, newText }) {
		if (useIframe) {
			let ifr = document.querySelector("iframe#hotreload");
			if (!ifr) {
				throw new Error("[hotreload] iframe#hotreload nonexistant");
			}
			let dataURL = `data:text/html,${encodeURIComponent(newText)}`;
			ifr.src = dataURL;
			text = newText;
		} else {
			clearInterval(int);
			location.reload();
		}
	}

	async function getText(resources, method = "fetch") {
		return JSON.stringify(
			await Promise.all(resources.map((i) => f(i, method)))
		);
		async function f(url, method) {
			method = method.toLowerCase();
			if (method === "fetch") {
				return await fetch(url).then((res) => res.text());
			} else if (method === "xmlhttprequest") {
				return await new Promise((resolve) => {
					let req = new XMLHttpRequest();
					req.addEventListener("load", (r) => resolve(r.responseText));
					req.open(url);
					req.send();
				});
			}
		}
	}
})(window.HOTRELOAD_OPTIONS || {});