import OS                from 'os';
import Tap               from 'tap';
import PortChecker       from '@burninggarden/port-checker';
import AddressFamily     from 'enums/address-family';
import NetworkMapper     from 'network-mapper';
import EnvironmentMocker from '@burninggarden/environment-mocker';
import {
	ServerType,
	EnvironmentType
} from '@burninggarden/enums';

Tap.test('.getHostname() returns expected hostname in development environment', test => {
	EnvironmentMocker.mock(EnvironmentType.DEVELOPMENT, () => {
		const networkMapper = new NetworkMapper();

		const interfaceGroups = OS.networkInterfaces();
		let interfaces = [];

		Object.values(interfaceGroups).forEach(group => {
			interfaces = interfaces.concat(group);
		});

		let expectedInterface = interfaces.find(networkInterface => {
			return (
				networkInterface.internal === false &&
				networkInterface.family   === AddressFamily.IPV4
			);
		});

		let expectedHostname = '127.0.0.1';

		if (expectedInterface !== undefined) {
			expectedHostname = expectedInterface.address;
		}

		const actualHostname = networkMapper.getHostname();

		test.equal(actualHostname, expectedHostname);
		test.end();
	});
});

Tap.test('.getHostname() returns expected hostname in production environment', test => {
	EnvironmentMocker.mock(EnvironmentType.PRODUCTION, () => {
		const networkMapper = new NetworkMapper();

		const interfaceGroups = OS.networkInterfaces();
		let interfaces = [];

		Object.values(interfaceGroups).forEach(group => {
			interfaces = interfaces.concat(group);
		});

		let expectedInterface = interfaces.find(networkInterface => {
			return (
				networkInterface.internal === false &&
				networkInterface.family   === AddressFamily.IPV4
			);
		});

		let expectedHostname = '127.0.0.1';

		if (expectedInterface !== undefined) {
			expectedHostname = expectedInterface.address;
		}

		const actualHostname = networkMapper.getHostname();

		test.equal(actualHostname, expectedHostname);
		test.end();
	});
});

Tap.test('.getHostname() returns expected hostname in test environment', test => {
	EnvironmentMocker.mock(EnvironmentType.TEST, () => {
		const networkMapper = new NetworkMapper();
		const hostname = networkMapper.getHostname();

		test.equal(hostname, '127.0.0.1');
		test.end();
	});
});

Tap.test('.createLocalMappingForServerType()', async suite => {
	await suite.test('returns a mapping with the expected hostname', async test => {
		const mapping = (new NetworkMapper())
			.createLocalMappingForServerType(ServerType.GAME);

		test.equal(mapping.hostname, '127.0.0.1');
		test.end();
	});

	await suite.test('returns a mapping with an open http port', async test => {
		const mapping = (new NetworkMapper())
			.createLocalMappingForServerType(ServerType.GAME);

		const portChecker = new PortChecker(mapping.httpPort);

		const portInUse = await portChecker.isPortInUse();

		test.notOk(portInUse);
		test.end();
	});

	await suite.test('returns a mapping with an open tcp port', async test => {
		const mapping = (new NetworkMapper())
			.createLocalMappingForServerType(ServerType.GAME);

		const portChecker = new PortChecker(mapping.tcpPort);

		const portInUse = await portChecker.isPortInUse();

		test.notOk(portInUse);
		test.end();
	});

	suite.end();
});

Tap.test('.getMappingForServerType()', suite => {
	suite.test('returns undefined if no mapping is found', test => {
		const mapping = (new NetworkMapper())
			.getMappingForServerType(ServerType.GAME);

		test.equal(mapping, undefined);
		test.end();
	});

	suite.test('returns expected mapping if one is set', test => {
		const networkMapper = new NetworkMapper();

		const originalMapping = networkMapper.createLocalMappingForServerType(
			ServerType.GAME
		);

		const retrievedMapping = networkMapper.getMappingForServerType(
			ServerType.GAME
		);

		test.equal(retrievedMapping, originalMapping);
		test.end();
	});

	suite.test('does not share mappings between discrete instances', test => {
		const mapperOne = new NetworkMapper();
		const mapperTwo = new NetworkMapper();

		mapperOne.createLocalMappingForServerType(ServerType.GAME);

		const retrievedMapping = mapperTwo.getMappingForServerType(
			ServerType.GAME
		);

		test.equal(retrievedMapping, undefined);
		test.end();
	});

	suite.test('returns latest mapping if mapping for server type is overwritten', test => {
		const mapper = new NetworkMapper();

		const mappingOne = mapper.createLocalMappingForServerType(
			ServerType.GAME
		);

		const mappingTwo = mapper.createLocalMappingForServerType(
			ServerType.GAME
		);

		const retrievedMapping = mapper.getMappingForServerType(
			ServerType.GAME
		);

		test.notEqual(retrievedMapping, mappingOne);
		test.equal(retrievedMapping, mappingTwo);
		test.end();
	});

	suite.end();
});

Tap.test('.getInstance() returns a memoized mapper instance', test => {
	const mapperOne = NetworkMapper.getInstance();
	const mapperTwo = NetworkMapper.getInstance();

	test.equal(mapperOne, mapperTwo);
	test.end();
});
