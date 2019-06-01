import OS            from 'os';
import AddressFamily from 'enums/address-family';

const LOCALHOST = 'localhost';
const LOCALHOST_IPV6_PREFIX = '::ffff:';

class NetworkMapper {

	private hostname: string;

	public getHostname(): string {
		if (!this.hostname) {
			this.hostname = this.determineHostname();
		}

		return this.hostname;
	}

	private determineHostname(): string {
		const interfaces = OS.networkInterfaces();
		const resolvedAddresses = [];

		Object.keys(interfaces).forEach(key => {
			const currentInterface = interfaces[key];

			Object.keys(currentInterface).forEach(addressKey => {
				const address = currentInterface[addressKey];

				if (address.internal) {
					return;
				}

				if (address.family !== AddressFamily.IPV4) {
					return;
				}

				resolvedAddresses.push(address.address);
			});
		});

		const firstAddress = resolvedAddresses[0];

		if (firstAddress === undefined) {
			throw new Error('Unable to determine network hostname');
		}

		return this.standardizeHostname(firstAddress);
	}

	private standardizeHostname(hostname: string): string {
		if (!hostname || hostname === LOCALHOST) {
			hostname = this.getLocalhostAlias();
		}

		if (hostname.indexOf(LOCALHOST_IPV6_PREFIX) === 0) {
			hostname = hostname.slice(LOCALHOST_IPV6_PREFIX.length);
		}

		return hostname;
	}

	private getLocalhostAlias(): string {
		return '127.0.0.1';
	}

}

export default NetworkMapper;
