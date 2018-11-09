import { httpRequest } from './globals'

export const DS_API_URL = 'http://ht.denisnp.net/api'

export default {
	send(address = '', params = {}, callback = () => {}, method = 'GET') {
		httpRequest(
			DS_API_URL + '/' + address,
			params,
			callback,
			method
		);
	}
}