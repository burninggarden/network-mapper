import OS             from 'os';
import Config         from '@burninggarden/config';
import AddressFamily  from 'enums/address-family';
import {ServerType}   from '@burninggarden/enums';
import PortAllocator  from '@burninggarden/port-allocator';
import NetworkMapping from 'interfaces/network-mapping';

const LOCALHOST = 'localhost';
const LOCALHOST_IPV6_PREFIX = '::ffff:';

type MappingCache = {
	[key in ServerType]: NetworkMapping | undefined;
}

class NetworkMapper {

	private static cachedInstance : NetworkMapper;

	private hostname       : string;
	private cachedMappings : MappingCache;

	public static getInstance(): NetworkMapper {
		if (!this.cachedInstance) {
			this.cachedInstance = new this();
		}

		return this.cachedInstance;
	}

	public getHostname(): string {
		if (!this.hostname) {
			this.hostname = this.determineHostname();
		}

		return this.hostname;
	}

	public createLocalMappingForServerType(serverType: ServerType): NetworkMapping {
		const portAllocation = (new PortAllocator()).createPortAllocation();
		const hostname = this.determineHostname();

		const mapping = {
			serverType,
			hostname,
			...portAllocation,
		};

		this.setCachedMappingForServerType(mapping, mapping.serverType);

		return mapping;
	}

	public getMappingForServerType(
		serverType: ServerType
	): NetworkMapping | undefined {
		return this.getCachedMappings()[serverType];
	}

	private setCachedMappingForServerType(
		mapping: NetworkMapping,
		serverType: ServerType
	): this {
		this.getCachedMappings()[serverType] = mapping;
		return this;
	}

	private getCachedMappings(): MappingCache {
		if (!this.cachedMappings) {
			this.cachedMappings = {
				[ServerType.API]    : undefined,
				[ServerType.ASSETS] : undefined,
				[ServerType.LOGGER] : undefined,
				[ServerType.GAME]   : undefined,
				[ServerType.PROXY]  : undefined
			};
		}

		return this.cachedMappings;
	}

	private determineHostname(): string {
		if (Config.isTest()) {
			return this.getLocalhostAlias();
		}

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
