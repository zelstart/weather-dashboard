
$(document).ready(function() {

var searchHistoryList = [];

// when search button is clicked, city name is saved as a variable and textarea is cleared
$('#search-button').click(function() {
    var searchBarText = $('#search-bar').val();
    $('#search-bar').val("")
    saveSearch(searchBarText)
})

// adds the latest search to searchHistoryList, storing the 9 most recent searches
function saveSearch(searchBarText) {
    if (searchHistoryList.length === 9) {
        searchHistoryList.pop();
        searchHistoryList.unshift(searchBarText);
    } else {
        searchHistoryList.unshift(searchBarText);
    }
    console.log(searchHistoryList)
}



})