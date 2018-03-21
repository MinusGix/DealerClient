let submitButtonElement = document.getElementById('submit');
let searchBarElement = document.getElementById('search-bar');

submitButtonElement.addEventListener('click', event => {
	let searchQuery = searchBarElement.value;

	location.search = '?query=' + encodeURIComponent(searchQuery);
});

searchBarElement.value = decodeURIComponent(location.search.replace(/^\?query\=/, ''));

searchBarElement.addEventListener('keyup', event => {
	if (event.keyCode === 13 && !event.shiftKey) {
		submitButtonElement.click();
	}
})