import Popup from './Popup.svelte';

const popup = new Popup({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default popup;
