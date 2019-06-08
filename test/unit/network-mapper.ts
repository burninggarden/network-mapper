import OS                from 'os';
import Tap               from 'tap';
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

Tap.test('.createLocalMapping()', suite => {
	suite.test('accepts expected values and returns the network mapper instance', test => {
		const networkMapper = new NetworkMapper();

		const result = networkMapper.createLocalMapping({
			serverType: ServerType.GAME,
			hostname:   'localhost',
			httpPort:   1234,
			tcpPort:    5678
		});

		test.equal(result, networkMapper);
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

		const originalMapping = {
			serverType: ServerType.GAME,
			hostname:   'localhost',
			httpPort:   1234,
			tcpPort:    5678
		};

		networkMapper.createLocalMapping(originalMapping);

		const retrievedMapping = networkMapper.getMappingForServerType(
			ServerType.GAME
		);

		test.equal(retrievedMapping, originalMapping);
		test.end();
	});

	suite.test('does not share mappings between discrete instances', test => {
		const mapperOne = new NetworkMapper();
		const mapperTwo = new NetworkMapper();

		mapperOne.createLocalMapping({
			serverType: ServerType.GAME,
			hostname:   'localhost',
			httpPort:   1234,
			tcpPort:    5678
		});

		const retrievedMapping = mapperTwo.getMappingForServerType(
			ServerType.GAME
		);

		test.equal(retrievedMapping, undefined);
		test.end();
	});

	suite.test('overwrites previous mappings if the same server type is supplied', test => {
		const mapper = new NetworkMapper();

		const mappingOne = {
			serverType: ServerType.GAME,
			hostname:   'localhost',
			httpPort:   1234,
			tcpPort:    5678
		};

		const mappingTwo = {
			serverType: ServerType.GAME,
			hostname:   'burninggarden.com',
			httpPort:   4321,
			tcpPort:    8765
		};

		mapper.createLocalMapping(mappingOne);
		mapper.createLocalMapping(mappingTwo);

		const retrievedMapping = mapper.getMappingForServerType(
			ServerType.GAME
		);

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
