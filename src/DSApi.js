import { httpRequest } from './globals'

export const DS_API_URL = 'http://ht.denisnp.net/api'

export default {
	send(address = '', params = {}, onComplete = () => {}, onError = () => {}, method = 'GET') {
		httpRequest(
			DS_API_URL + '/' + address,
			params,
			onComplete,
			onError,
			method
		);
	}
}