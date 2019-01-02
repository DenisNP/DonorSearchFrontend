import Vue from 'vue'

import { httpRequest } from './globals'
import DSApi from './DSApi'

export default {
	data: {
		avatar: 					null,
		vk_id: 						null,
		second_name:  		null,
		maiden_name: 			null,
		bdate: 						null,
		gender: 					null,
		city_id: 					null,
		city_title: 			null,
		region_title: 		null,
		about_self: 			null,
		blood_type: 			null,
		blood_class_ids: 	null,
		bone_marrow: 			null,
		cant_to_be_donor: null,
		donor_pause_to: 	null,
		has_registration: null,
		first_name: 			null,
		last_name: 				null,
		is_first_donor: 	null
	},
	keys: [
		'avatar', 'vk_id', 'second_name', 'maiden_name', 'bdate', 'gender',
		'city_id', 'city_title', 'region_title', 'about_self', 'blood_type',
		'blood_class_ids', 'bone_marrow', 'cant_to_be_donor', 'donor_pause_to',
		'has_registration', 'first_name', 'last_name', 'is_first_donor'
	],

	timeline: {
		"id": 0,
		"ds_Id": null,
		"vk_id": 0,
		"previous_donation_date": null,
		"appointment_date_from": null,
		"appointment_date_to": null,
		"donation_date": null,
		"donation_success": null,
		"blood_class_ids": 0,
		"img": null,
		"station_id": 0,
		"station_title": null,
		"station_address": null,
		"recomendation_timestamp": null,
		"finished": false,
		"confirm_visit": {
			"id": 0,
			"date_from": null,
			"date_to": null,
			"visit_date": null,
			"success": null,
			"without_donation": null
		}
	},

	_loaded: false,

	_LoadedQueue: [],
	onLoaded(callback = () => {}) {
		if (!this._loaded) this._LoadedQueue.push(callback);
		else if (typeof callback == 'function') callback();
	},

	// Is VK_id stored
		_has_vk() {
			return !isNaN(this.vk_id);
		},

	// Load data from DB
		load(vk_data, onSuccess = () => {}, onError = () => {}) {
			let DSProfile = this;
			let vk_id = vk_data.vk_id;
			let city_title = vk_data.city_title;

			if (!vk_id && !DSProfile._has_vk()) {
				console && console.warn('Users are unavailable without VK_id');
				return;
			}

			if (vk_id && !DSProfile._has_vk()) {
				DSProfile.set({vk_id});
			}

			DSApi.send('users?type=init', {
				vk_id: vk_id,
				city_title: city_title
			}, (data) => {
				DSProfile._loaded = true;

				for(let k in this._LoadedQueue) {
					if (typeof this._LoadedQueue[k] == 'function') {
						this._LoadedQueue[k].apply();
					}
				}

				onSuccess(DSProfile.set(data));
			}, onError, 'POST');
		},

	// Get stored data
		get(key = '') {

			return key ? this.data[key] : Object.assign({}, this.data);
		},

	// Set new data to stored object and maybe save to DB
		set(newData = {}, save = false, onSuccess = () => {}, onError = () => {}) {
			if (typeof newData !== 'object') newData = {};

			let data = Object.assign(this.get(), newData);

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
								_data.bdate = new Date(bdate).toJSON()
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
