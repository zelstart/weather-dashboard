
$(document).ready(function () {

    var searchHistoryList = [];

    // when search button is clicked, city name is saved as a variable and textarea is cleared
    $('#search-button').click(function () {
        var searchBarText = $('#search-bar').val().toLowerCase().trim();

        $('#search-bar').val("");
        saveSearch(searchBarText);
        updateSearchHistory();
        cityCoord(searchHistoryList)
    })

    function cityCoord(cityName) {
        var cityQueryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=7a0c14487898bae146a1b3a3863031d0";
        console.log(cityQueryURL) // checking to make sure it's grabbing the right name
        $.ajax({
            url: cityQueryURL,
            method: "GET",
            success: function (coordResponse) { // if the call is successful, we need to save the coords 
                var lat = coordResponse[0].lat;
                var lon = coordResponse[0].lon;
                console.log(lat, lon) // checking to make sure coords are correct
                var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=7a0c14487898bae146a1b3a3863031d0&units=imperial" // create the url that we'll use in fetchWeather, convert units to imperial 
                fetchWeather(forecastQueryURL) // if the call has been successful, fetchWeather function will run. we're passing forecastQueryURL as an argument so we can access it in our called function
            },
            error: function (error) { // can't seem to get this to work, if the url is bad it isn't giving me the "could not fetch..." text in the console log, or as an alert
                console.log("Could not fetch coordinates for city -- please try again", error);
                alert("Could not fetch coordinates for city -- please try again");
            }
        });

    }


    function fetchWeather(forecastQueryURL) {
        $.ajax({
            url: forecastQueryURL,
            method: "GET",
            success: function (weatherResponse) {
                var weatherData = []; // an empty container to store the weather data
                for (var i = 0; i < 6; i++) { // I only need 6 days worth of data.
                    //but because the timestamps are every three hours and not daily, it's giving me the same day multiple times instead of a new day in each obj
                    var timestamp = weatherResponse.list[i].dt; // date timestamp -- will need to convert to mm/dd/yyyy format with dayjs
                    var date = formatDate(timestamp); // convert timestamp with function using dayjs
                    var icon = weatherResponse.list[i].weather[0].icon; // weather icon
                    var iconURL = "http://openweathermap.org/img/wn/" + icon + ".png" // need to make the img url for the icon
                    var desc = weatherResponse.list[i].weather[0].description; // weather desc
                    var temp = weatherResponse.list[i].main.temp; // temperature
                    var humidity = weatherResponse.list[i].main.humidity; // humidity
                    
                    var dailyWeatherData = { // make a new object containing info for each day made in the loop
                        timestamp: timestamp,
                        date: date,
                        iconURL: iconURL,
                        description: desc,
                        temperature: temp,
                        humidity: humidity,
                    }
                    weatherData.push(dailyWeatherData)
                }
                console.log(weatherData)
            },
            error: function (error) {
                console.log("There was an error while fetching weather data, please try again.")
            }

        })
    }

    // use Day.js to convert the timestamp into a readable date
    function formatDate(timestamp) {
        return dayjs(timestamp * 1000).format('MM/DD/YYYY')
    }


    // add a keydown listener for search bar so that hitting the enter key has the same effect as hitting the submit button

    // adds the latest search to searchHistoryList, storing only the 9 most recent searches
    function saveSearch(searchBarText) {
        if (searchHistoryList.length === 9) {
            searchHistoryList.pop();
            searchHistoryList.unshift(searchBarText);
        } else {
            searchHistoryList.unshift(searchBarText);
        }
        console.log(searchHistoryList) // should only have 9 most recent searches
    }

    // create buttons for each item on the searchHistoryList
    function updateSearchHistory() {
        $('#search-history').empty();
        for (var i = 0; i < searchHistoryList.length; i++) {
            var searchItem = searchHistoryList[i];
            var historyButton = $('<button>').text(searchItem).addClass('btn cstm-btn-2');
            $('#search-history').append(historyButton);
        }
    }




})