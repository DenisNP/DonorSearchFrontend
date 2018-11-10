import Vue from 'vue'

import { httpRequest } from './globals'
import DSApi from './DSApi'

export default {
	data: {
		avatar: 			null,
		vk_id: 				null,
		second_name:  		null,
		maiden_name: 		null,
		bdate: 				null,
		gender: 			null,
		city_id: 			null,
		city_title: 		null,
		region_title: 		null,
		about_self: 		null,
		blood_type: 		null,
		blood_class_ids: 	null,
		bone_marrow: 		null,
		cant_to_be_donor: 	null,
		donor_pause_to: 	null,
		has_registration: 	null,
		first_name: 		null,
		last_name: 			null
	},

	_loaded: false,

	// Is VK_id stored
		_has_vk() {
			return !isNaN(this.vk_id);
		},

	// Load data from DB
		load(vk_id = '', onSuccess = () => {}, onError = () => {}) {
			let DSProfile = this;

			if (!vk_id && !DSProfile._has_vk()) {
				console && console.warn('Users are unavailable without VK_id');
				return;
			}

			if (vk_id && !DSProfile._has_vk()) {
				DSProfile.set({vk_id});
			}

			DSApi.send('users/' + vk_id, {}, (data) => {
				DSProfile._loaded = true;

				onSuccess(DSProfile.set(data));
			}, onError);
		},

	// Get stored data
		get(key = '') { 

			return key ? this.data[key] : Object.assign({}, this.data);
		},

	// Set new data to stored object and maybe save to DB
		set(data = {}, save = false, onSuccess = () => {}, onError = () => {}) {
			if (typeof data !== 'object') return;

			for(let key in data) {
				if (key in this.data) {
					this.data[key] = data[key]
				} else {
					delete data[key];
				}
			}

			if (save) {
				data.vk_id = this.data.vk_id;
				DSApi.send('users', data, onSuccess, onError, 'POST');
			}

			return data;
		},

	// Set data from VK
		setVK(data = {}, save = false, onSuccess = () => {}, onError = () => {}) {
			if (typeof data !== 'object') return;

			let DSProfile = this;

			if (!DSProfile._loaded) {
				console && console.warn('Load object from DB before set VK Data. Or using "set" method');
				return;
			}

			let _data = {};

			for(let key in data) {
				if (!!data[key]) switch(key) {
					case 'id':
						_data.vk_id = data[key];
						break;

					case 'photo_100':
						_data.avatar = data[key];
						break;
					
					case 'bdate':
						let bdate = data[key].split('.');
						if (bdate.length == 3) {
							bdate = new Date(bdate[2], bdate[1] - 1, bdate[0])
							bdate = bdate.getTime();
							if (!isNaN(bdate)) {
								_data.bdate = bdate
							}
						}
						break;

					case 'sex':
						if (!isNaN(data[key])) {
							_data.gender = data[key];
						}
						break;

					case 'city':
						if ('title' in data[key]) {
							_data.city_title = data[key].title
						}
						break;

					case 'first_name':
					case 'last_name':
						_data[key] = data[key];
						break;
				}
			}
			for(let key in _data) {
				if (!!DSProfile.data[key]) {
					delete _data[key];
				}
			}

			DSProfile.set(_data, save, onSuccess, onError);

			return _data;
		}
}