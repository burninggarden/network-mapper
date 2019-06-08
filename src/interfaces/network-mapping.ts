import {ServerType} from '@burninggarden/enums';

export default interface NetworkMapping {
	serverType : ServerType;
	hostname   : string;
	httpPort   : number;
	tcpPort    : number;
}
