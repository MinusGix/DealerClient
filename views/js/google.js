document.getElementById('submit').addEventListener('click', event => {
	let searchQuery = document.getElementById('search-bar').value;

	location.search = '?query=' + encodeURIComponent(searchQuery);
});

document.getElementById('search-bar').value = location.search.replace(/^\?query\=/, '');