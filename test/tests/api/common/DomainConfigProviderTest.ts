import o from "@tutao/otest"
import { DomainConfigProvider } from "../../../../src/common/api/common/DomainConfigProvider.js"
import { domainConfigStub, withOverriddenEnv } from "../../TestUtils.js"

o.spec("DomainConfigProvider", function () {
	let originalLocation: Location | URL | undefined

	o.beforeEach(() => {
		originalLocation = globalThis.location
	})

	o.afterEach(() => {
		if (originalLocation) {
			Object.defineProperty(globalThis, "location", {
				value: originalLocation,
				configurable: true,
			})
		}
	})

	o("falls back to default first-party domain for native dist builds without staticUrl", async function () {
		const provider = new DomainConfigProvider()
		const domainConfigs: DomainConfigMap = {
			"app.tuta.com": {
				...domainConfigStub,
				firstPartyDomain: true,
				apiUrl: "https://app.tuta.com",
			},
			"{hostname}": {
				...domainConfigStub,
				firstPartyDomain: false,
				apiUrl: "{protocol}//{hostname}",
			},
		}

		Object.defineProperty(globalThis, "location", {
			value: new URL("asset://app/index-desktop.html"),
			configurable: true,
		})

		await withOverriddenEnv(
			{
				staticUrl: null,
				dist: true,
				mode: "Desktop",
				domainConfigs,
			},
			() => {
				const config = provider.getCurrentDomainConfig()
				o(config.apiUrl).equals("https://app.tuta.com")
			},
		)
	})
})
