import { Const } from "./TutanotaConstants.js"

export class DomainConfigProvider {
	/** Get domain config for the current domain (staticUrl or the one the app is running on). */
	getCurrentDomainConfig(): DomainConfig {
		// It is ambiguous what to do when we run website on one domain but have static URL for another
		// one but this actually shouldn't happen.
		const staticUrl = env.staticUrl?.trim()
		const fallbackUrl = this.getFallbackStaticUrl()
		const url = new URL(staticUrl || fallbackUrl || location.href)
		const port = url.port
		const hostname = url.hostname
		const protocol = url.protocol
		return this.getDomainConfigForHostname(hostname, protocol, port)
	}

	private getFallbackStaticUrl(): string | null {
		if (env.staticUrl != null || !env.dist) {
			return null
		}

		if (env.mode !== "Desktop" && env.mode !== "App") {
			return null
		}

		if (typeof location === "undefined") {
			return null
		}

		if (location.protocol === "http:" || location.protocol === "https:") {
			return null
		}

		const fallbackHost = this.getDefaultFirstPartyHostname()
		if (!fallbackHost) {
			return null
		}

		console.warn("[DomainConfigProvider] env.staticUrl missing for native client; falling back to", fallbackHost)
		return `https://${fallbackHost}`
	}

	private getDefaultFirstPartyHostname(): string | null {
		const entries = Object.entries(env.domainConfigs).filter(([hostname, config]) => hostname !== "{hostname}" && config.firstPartyDomain)
		if (entries.length === 0) {
			return null
		}

		const preferred = entries.find(([hostname]) => hostname === Const.DEFAULT_APP_DOMAIN)
		return (preferred ?? entries[0])[0]
	}

	getDomainConfigForHostname(hostname: string, protocol: string = "https:", port?: string): DomainConfig {
		const staticConfig = env.domainConfigs[hostname]
		if (staticConfig) {
			return staticConfig
		} else {
			const fullHostName = hostname + (port ? `:${port}` : "")
			const dynamicConfig = env.domainConfigs["{hostname}"]
			const entries = Object.entries(dynamicConfig).map(([key, value]) => {
				const replacedValue = typeof value === "string" ? value.replace("{hostname}", fullHostName).replace("{protocol}", protocol) : value
				return [key, replacedValue]
			})
			return Object.fromEntries(entries)
		}
	}
}
