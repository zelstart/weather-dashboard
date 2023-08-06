
$(document).ready(function () {

    var searchHistoryList = [];

    // check localStorage for search history
    var storedHistory = localStorage.getItem('searchHistoryList');
    if (storedHistory) {
        searchHistoryList = JSON.parse(storedHistory);
    }
    updateSearchHistory() // run updateSearchHistory function to make buttons for searches stored in localStorage

    // adds the latest search to searchHistoryList, storing only the 9 most recent searches
    function saveSearch(searchBarText) {
        if (searchHistoryList.length === 9) { // check for an array already the max length we want
            searchHistoryList.pop(); // remove last item in array
            searchHistoryList.unshift(searchBarText); // add new item to the front of the array
        } else {
            searchHistoryList.unshift(searchBarText); // add new item to the front of the array
        }
        // console.log(searchHistoryList) // should only have 9 most recent searches
        var storeHistory = JSON.stringify(searchHistoryList); // save the list to localStorage
        localStorage.setItem('searchHistoryList', storeHistory);
        updateSearchHistory();
    }

    // create buttons for each item on the searchHistoryList
    function updateSearchHistory() {
        $('#search-history').empty(); // remove everything from search history so it doesn't duplicate the history buttons
        for (var i = 0; i < searchHistoryList.length; i++) {
            // i think i need to add something that will not let empty or invalid cities from being saved, as well as duplicates.
            var searchItem = searchHistoryList[i];
            var historyButton = $('<button>').text(searchItem).addClass('btn cstm-btn-2 history-button');
            $('#search-history').append(historyButton);
        }
    }

    // when search button is clicked, city name is saved as a variable and textarea is cleared
    $('#search-button').click(function () {
        // split search-bar text at comma
        var searchBarText = $('#search-bar').val().toLowerCase().split(',');
        var cityName = searchBarText[0].trim();
        // if a second item exists in searchBarText, trim whitespace on it
        if (searchBarText[1]) {
            var state = searchBarText[1].trim();
        }

        $('#search-bar').val("");
        updateSearchHistory();
        fetchCityCoord(cityName, state); // passes the cityname and zipcode as an argument to our fetchCityCoord function

    })

    // add a keydown listener for search bar so that hitting the enter key has the same effect as hitting the submit button
    $('#search-bar').on('keydown', function (event) {
        if (event.keyCode === 13) {
            $('#search-button').click();
        }
    })

    $('#search-history').on('click', '.history-button', function (event) { // search history buttons should update weather data when clicked
        var historySearchTarget = event.target.textContent.split(',')// grabs the text from the button clicked
        var cityName = historySearchTarget[0].trim();
        if (historySearchTarget[1]) { // if a second item exists in this array, trim it
            var state = historySearchTarget[1].trim();
        }
        fetchCityCoord(cityName, state) // pass our variables to the fetch function
    });

    // grab coordinates for user-entered city to use in fetchWeather function
    function fetchCityCoord(cityName, state) {
        var cityQueryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName;
        // if the user included a state in their entry, it will be used in the query URL
        if (state) {
            cityQueryURL += "," + state + ",US"
        }
        cityQueryURL += "&appid=7a0c14487898bae146a1b3a3863031d0"

        console.log(cityQueryURL) // checking to make sure it's grabbing the right name
        $.ajax({
            url: cityQueryURL,
            method: "GET",
            success: function (coordResponse) { // if the call is successful, we need to save the coords 
                var lat = coordResponse[0].lat;
                var lon = coordResponse[0].lon;
                var name = coordResponse[0].name;
                console.log(lat, lon, name) // checking to make sure variables are correct
                if (coordResponse.length > 0) { // ATTEMPT to make it give us an error if user didn't enter valid data.
                    var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=7a0c14487898bae146a1b3a3863031d0&units=imperial" // create the url that we'll use in fetchWeather, convert units to imperial 
                    fetchWeather(forecastQueryURL, name) // if the call has been successful, fetchWeather function will run. we're passing forecastQueryURL and name as an argument so we can access them in our called function
                    saveSearch(cityName + (state ? (", " + state) : ""));
                    updateSearchHistory();
                } else {
                    console.log("Could not fetch coordinates for city -- please try again", error);
                    alert("Could not fetch coordinates for city -- please try again");
                }
            },
            error: function (error) {
                console.log("Could not fetch coordinates for city -- please try again", error);
            }
        });
    }

    // grab weather data
    function fetchWeather(forecastQueryURL, name) {
        $.ajax({
            url: forecastQueryURL,
            method: "GET",
            success: function (weatherResponse) {
                var sixDayWeatherData = []; // an empty container to store the weather data for six days
                for (var i = 0; i < 6; i++) { // BUG: I only need 6 days worth of data.
                    // but because the timestamps are every three hours and not daily, it's giving
                    // me the same day multiple times instead of a new day in each obj
                    // solutions? but not sure of the syntax to implement
                        // tell it to check for duplicate days - keep looping until we get 6 unique dates
                        // only save the results that have a timestamp that contains 12pm 
                            // would rather it be based on the current time rather than a static noon, but i can't think of how that would be written
                        // give in and purchase a dang subscription for the opencall api instead
                    var timestamp = weatherResponse.list[i].dt; // date timestamp -- will need to convert to mm/dd/yyyy format with dayjs
                    var date = formatDate(timestamp); // convert timestamp with function using dayjs
                    var icon = weatherResponse.list[i].weather[0].icon; // weather icon
                    var iconURL = "http://openweathermap.org/img/wn/" + icon + ".png" // need to make the img url for the icon
                    var desc = weatherResponse.list[i].weather[0].description; // weather desc
                    var temp = weatherResponse.list[i].main.temp; // temperature 
                    var wind = weatherResponse.list[i].wind.speed // wind speed
                    var humidity = weatherResponse.list[i].main.humidity; // humidity

                    var dailyWeatherData = { // make a new object containing info for each day made in the loop. 
                        // BUG: currently does not make a new object for each day, but for every 3 hours. 
                        timestamp: timestamp,
                        date: date,
                        iconURL: iconURL,
                        description: desc,
                        temperature: temp,
                        wind: wind,
                        humidity: humidity,
                    }
                    sixDayWeatherData.push(dailyWeatherData); // add the six objects to the variable we created above
                }
                printWeather(sixDayWeatherData, name); // pass our weather data to printWeather function and run it
                console.log(sixDayWeatherData) // to check if we're getting the dates we want
            },
            error: function (error) {
                console.log("There was an error while fetching weather data, please try again.")
            }
        })
    }

    // use Day.js to convert the timestamp into a readable date
    function formatDate(timestamp) {
        return dayjs(timestamp * 1000).format('dddd, MM • DD • YYYY')
    }

    // prints data on the page with weather data
    function printWeather(sixDayWeatherData, name) {
        console.log(sixDayWeatherData)
        $('#right-side').removeClass("hidden"); // unhides the right-side div
        // prints current weather data into the "Current Forecast" card
        $('#current-city').text(name)
        $('#current-date').text(' ━ ' + sixDayWeatherData[0].date + ' ━ ')
        $('#current-weather').attr("src", sixDayWeatherData[0].iconURL)
        $('#current-desc').text(sixDayWeatherData[0].description)
        $('#current-temp').text(sixDayWeatherData[0].temperature + '°F')
        $('#current-wind').text(sixDayWeatherData[0].wind + 'mph')
        $('#current-humidity').text(sixDayWeatherData[0].humidity + '%')

        // for each item after 0 (current day), add a card to the 5-day forecast
        for (var i = 1; i < sixDayWeatherData.length; i++) {
            //create card div
            var forecastCard = $('<div>').addClass('col-lg-2 col-8 cstm-card-bg p-3 card-shadow mx-3 mb-3 rounded')
            // create card elements
            var dateEl = $('<p>').addClass('forecast-item').text(sixDayWeatherData[i].date);
            var iconEl = $('<img>').addClass('forecast-item').attr('id','icon-' + i);
            var iconContainer = $('<p>').addClass('forecast-item').append(iconEl);
            var tempEl = $('<p>').addClass('forecast-item').text('Temp: ').append($('<span>'+ sixDayWeatherData[i].temperature + '°F' + '</span>'));
            var windEl = $('<p>').addClass('forecast-item').text('Wind: ').append($('<span>'+ sixDayWeatherData[i].wind + 'mph' + '</span>'));
            var humidityEl = $('<p>').addClass('forecast-item').text('Humidity: ').append($('<span>'+ sixDayWeatherData[i].humidity + '%' + '</span>'));
           
            // append the card to the page, and then append all of the card body's elements inside of it
            $('#five-day-forecast').append(forecastCard);
            forecastCard.append(dateEl).append($('<p>').append(iconContainer)).append(tempEl).append(windEl).append(humidityEl);
        }
    // the only way I could get the icons to load properly 
        $('#icon-1').attr('src', sixDayWeatherData[1].iconURL)
        $('#icon-2').attr('src', sixDayWeatherData[2].iconURL)
        $('#icon-3').attr('src', sixDayWeatherData[3].iconURL)
        $('#icon-4').attr('src', sixDayWeatherData[4].iconURL)
        $('#icon-5').attr('src', sixDayWeatherData[5].iconURL)
    }

})