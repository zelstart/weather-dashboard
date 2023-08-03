// $(function () {
// })
var searchButton = document.getElementById("search-button")
var searchBar = document.getElementById("search-bar")

var searchHistoryList = [];


// searchButton.addEventListener('click', function() {
//     if (searchHistoryList.length < 9) {
//         searchHistoryList.pop();
//         searchHistoryList.unshift(searchBar.val);
//     } else {
//         searchHistoryList.unshift(searchBar.val);
//         searchBar.val("");
//     }
//     console.log(searchHistoryList)
// })


$('.search-button').click(function() {
    var searchBar = $('.search-bar').val;
    searchBar.trim();
    searchBar.toUpperCase();
    if (searchHistoryList.length < 9) {
        searchHistoryList.pop();
        searchHistoryList.unshift(searchBar.val);
    } else {
        searchHistoryList.unshift(searchBar.val);
        searchBar.val("");
    }
    console.log(searchHistoryList)
})
