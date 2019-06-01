import Tap           from 'tap';
import NetworkMapper from 'network-mapper';

Tap.test('.getHostname() returns expected hostname', test => {
	const networkMapper = new NetworkMapper();
	const hostname = networkMapper.getHostname();

	test.equal(hostname, '127.0.0.1');
});
