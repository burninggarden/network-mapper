import OS                from 'os';
import Tap               from 'tap';
import AddressFamily     from 'enums/address-family';
import NetworkMapper     from 'network-mapper';
import EnvironmentMocker from '@burninggarden/environment-mocker';
import {EnvironmentType} from '@burninggarden/enums';

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
