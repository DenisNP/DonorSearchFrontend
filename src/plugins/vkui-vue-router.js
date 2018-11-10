let VKUIRouterStateVar = null;
let VKUIRouterRoot = null;
let VKUIRouterPath = {};

function RouterPathGet() {
	let currentPath = VKUIRouterRoot.$router.currentRoute.path.split('/');
	currentPath = currentPath[1].split('-');

	return VKUIRouterPath = RouterPathValidate({
		view: currentPath[0],
		panel: currentPath[1]
	});
}

function RouterPathValidate(path) {
	let views = VKUIRouterRoot.$slots.default

	if (path.view) {
		let invalidView = true;

		for(let i = 0; i < views.length; i++) {
			if (views[i].key == path.view) {
				invalidView = false;
				path.viewVNodeIndex = i;
			}
		}
		if (invalidView) {
			path.view = null;
		} else {
			VKUIRouterRoot.$parent[VKUIRouterStateVar] = path.view;
		}
	}

	return {view: path.view};
}

function RouterPathSet(path) {
	VKUIRouterPath = Object.assign(VKUIRouterPath, path)

	if (!VKUIRouterPath.panel) {
		let panelFounded = false;
		let childs = VKUIRouterRoot.$children;
		for(let i = 0; i < childs.length; i++) {
			if (childs[i].$attrs.id === VKUIRouterPath.view) {
				VKUIRouterPath.panel = childs[i].$children[0].activePanel
				panelFounded = true;
				i = childs.length;
			}
		}
		if (!panelFounded) {
			VKUIRouterPath.panel = '';
		}
	}

	if (!VKUIRouterRoot.$router) {
		// console && console.warn('[VKUIRouterRoot.$router] not founded');
		return;
	}

	if (!VKUIRouterPath.view) VKUIRouterRoot.$router.push('/');
	else if (!VKUIRouterPath.panel) VKUIRouterRoot.$router.push(VKUIRouterPath.view);
	else VKUIRouterRoot.$router.push(VKUIRouterPath.view + '-' + VKUIRouterPath.panel);
}

export default {
	RootMixin: {
		mounted() {
			VKUIRouterRoot = this;

			// Выбор переменной для хранения текущего View
				switch(VKUIRouterRoot.$options._componentTag) {
					case 'Epic': VKUIRouterStateVar = 'activeStory'; break;
					case 'Root': VKUIRouterStateVar = 'activeView'; break;
				}

			// Определение текущей ссылки
				RouterPathGet();

			// Переход к нужному адресу
				RouterPathSet();

			// Добавление слежения на изменение активного View
				if (VKUIRouterStateVar === null) {
					VKUIRouterRoot.$router.push('/')
				} else {
					VKUIRouterRoot.$watch(VKUIRouterStateVar, (val) => {
						RouterPathSet({
							view: val,
							panel: null
						});
					});
				}
		}
	},
	VKViewMixin: {
		watch: {
			activePanel: (val) => {
				RouterPathSet({
					panel: val
				});
			}
		}
	}
}
















/*
	function parseRouterPath(path) {
		let _path, __path;

		_path = path.split('/')
		if (_path.length < 2) return '';

		_path = _path[1].split('-');
		__path = {
			view: _path[0]
		};
		if (_path.length > 1) {
			__path.panel = _path[1];
		}

		return __path;
	}
	function parseViewRoute(View) {
		let path = '';
		let el = '';

		if (View.closest('.Epic') !== undefined) {
			el = 'activeStory';
			path += View.id;
		} else
		if (View.closest('.Root') !== undefined) {
			el = 'activeView'
			path += View.id;
		}

		if (!path.length) {
			return '';
		}
		
		let panels = View.getElementsByClassName('Panel');
		if (panels.length) {
			path += '-' + panels[0].id
		}

		return path;
	}
*/