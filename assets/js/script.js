
$(document).ready(function () {

    let searchHistoryList = [];

    // check localStorage for search history
    let storedHistory = localStorage.getItem('searchHistoryList');
    if (storedHistory) {
        searchHistoryList = JSON.parse(storedHistory);
    }
    updateSearchHistory() // run updateSearchHistory function to make buttons for searches stored in localStorage

    // adds the latest search to searchHistoryList, storing only the 9 most recent searches
    function saveSearch(searchBarText) {
        let cityName = searchBarText.toLowerCase().trim();
        if (searchHistoryList.length === 9) { // check for an array already the max length we want
            searchHistoryList.pop(); // remove last item in array
            searchHistoryList.unshift(cityName); // add new item to the front of the array
        } else {
            if (searchHistoryList.indexOf(cityName) === -1) { // checks for duplicate entries
                searchHistoryList.unshift(cityName); // add new item to the front of the array
            }
        }
        // console.log(searchHistoryList) // should only have 9 most recent searches
        let storeHistory = JSON.stringify(searchHistoryList); // save the list to localStorage
        localStorage.setItem('searchHistoryList', storeHistory);
        updateSearchHistory();
    }

    // create buttons for each item on the searchHistoryList
    function updateSearchHistory() {
        $('#search-history').empty(); // remove everything from search history so it doesn't duplicate the history buttons
        for (let i = 0; i < searchHistoryList.length; i++) {
            // i think i need to add something that will not let empty or invalid cities from being saved, as well as duplicates.
            let searchItem = searchHistoryList[i];
            let historyButton = $('<button>').text(searchItem).addClass('btn cstm-btn-2 history-button');
            $('#search-history').append(historyButton);
        }
    }

    // when search button is clicked, city name is saved as a variable and textarea is cleared
    $('#search-button').click(function () {
        // split search-bar text at comma
        let searchBarText = $('#search-bar').val().toLowerCase().split(',');
        let cityName = searchBarText[0].trim();
        // if a second item exists in searchBarText, trim whitespace on it
        if (searchBarText[1]) {
            let state = searchBarText[1].trim();
            fetchCityCoord(cityName, state); // passes the cityname and state as an argument to our fetchCityCoord function
        } else {
            fetchCityCoord(cityName)
        }
        $('#search-bar').val("");
        updateSearchHistory();

    })

    // add a keydown listener for search bar so that hitting the enter key has the same effect as hitting the submit button
    $('#search-bar').on('keydown', function (event) {
        if (event.keyCode === 13) {
            $('#search-button').click();
        }
    })

    $('#search-history').on('click', '.history-button', function (event) { // search history buttons should update weather data when clicked
        let historySearchTarget = event.target.textContent.split(',')// grabs the text from the button clicked
        let cityName = historySearchTarget[0].trim();
        if (historySearchTarget[1]) { // if a second item exists in this array, trim it
            let state = historySearchTarget[1].trim();
            fetchCityCoord(cityName, state) // pass our variables to the fetch function
        } else {
            fetchCityCoord(cityName)
        }
    });

    // grab coordinates for user-entered city to use in fetchForecast function
    function fetchCityCoord(cityName, state) {

        let cityQueryURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
        if (state) {
            cityQueryURL += `${cityName},${state},US`;
        } else {
            cityQueryURL += cityName;
        }
        cityQueryURL += "&appid=7a0c14487898bae146a1b3a3863031d0";


        // get coordinates
        $.ajax({
            url: cityQueryURL,
            method: "GET",
            success: function (coordResponse) { // if the call is successful, we need to save the coords 
                if (coordResponse.length > 0) { // ATTEMPT to make it give us an error if user didn't enter valid data.
                    let lat = coordResponse[0].lat;
                    let lon = coordResponse[0].lon;
                    let name = coordResponse[0].name;
                    let stateName = coordResponse[0].state;
                    console.log(coordResponse)
                    console.log(lat, lon, name, stateName) // checking to make sure variables are correct
                    let forecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=7a0c14487898bae146a1b3a3863031d0&units=imperial` // create the url that we'll use in fetchForecast, convert units to imperial 
                    fetchForecast(forecastQueryURL, name) // if the call has been successful, fetchForecast function will run. we're passing forecastQueryURL and name as an argument so we can access them in our called function
                    fetchCurrent(forecastQueryURL, name, stateName)
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

    // fetches current weather and prints it to the page
    function fetchCurrent(forecastQueryURL, name, stateName) {
        $.ajax({
            url: forecastQueryURL,
            method: "GET",
            success: function (weatherResponse) {
                console.log(weatherResponse)

                let timestamp = weatherResponse.list[0].dt;
                let date = formatDate(timestamp); // convert timestamp with function using dayjs
                let icon = weatherResponse.list[0].weather[0].icon; // weather icon
                let iconURL = "http://openweathermap.org/img/wn/" + icon + ".png" // need to make the img url for the icon
                let desc = weatherResponse.list[0].weather[0].description; // weather desc
                let temp = weatherResponse.list[0].main.temp; // temperature 
                let wind = weatherResponse.list[0].wind.speed // wind speed
                let humidity = weatherResponse.list[0].main.humidity; // humidity

                $('#right-side').removeClass("hidden"); // unhides the right-side div
                // prints current weather data into the "Current Forecast" card
                $('#current-city').text(name)
                $('#current-state').text(`, ${stateName}`)
                $('#current-date').text(` ━  ${date}  ━ `)
                $('#current-weather').attr("src", iconURL)
                $('#current-desc').text(desc)
                $('#current-temp').text(`${temp} °F`)
                $('#current-wind').text(`${wind} mph`)
                $('#current-humidity').text(`${humidity} %`)


            },
            error: function (error) {
                console.log("There was an error while fetching weather data, please try again.")
            }
        })
    }

    // fetches forecast of the next 5 days and prints it to the page
    function fetchForecast(forecastQueryURL, name) {
        $.ajax({
            url: forecastQueryURL,
            method: "GET",
            success: function (weatherResponse) {
                let fiveDayWeatherData = []; // an empty container to store the weather data for 5 days
                for (let i = 5; i < 40; i += 8) {

                    let timestamp = weatherResponse.list[i].dt;
                    let date = formatDate(timestamp); // convert timestamp with function using dayjs
                    let icon = weatherResponse.list[i].weather[0].icon; // weather icon
                    let iconURL = "http://openweathermap.org/img/wn/" + icon + ".png" // need to make the img url for the icon
                    let desc = weatherResponse.list[i].weather[0].description; // weather desc
                    let temp = weatherResponse.list[i].main.temp; // temperature 
                    let wind = weatherResponse.list[i].wind.speed // wind speed
                    let humidity = weatherResponse.list[i].main.humidity; // humidity

                    let dailyWeatherData = { // make a new object containing info for each day made in the loop. 
                        timestamp: timestamp,
                        date: date,
                        iconURL: iconURL,
                        description: desc,
                        temperature: temp,
                        wind: wind,
                        humidity: humidity,
                    }
                    fiveDayWeatherData.push(dailyWeatherData); // add the six objects to the variable we created above
                } // creates a new card containing each of the 5 days' data
                $('#five-day-forecast').empty(); // gets rid of old cards before appending new ones
                for (let i = 0; i < fiveDayWeatherData.length; i++) {
                    //create card div
                    let forecastCard = $('<div>').addClass('col-lg-2 col-8 cstm-card-bg p-3 card-shadow mx-3 mb-3 rounded')
                    // create card elements
                    let dateEl = $('<p>').addClass('forecast-item').text(fiveDayWeatherData[i].date);
                    // let iconEl = $('<img>').addClass('forecast-item').attr('id', 'icon-' + i);
                    let iconEl = $('<img>').addClass('forecast-item').attr('id', `icon-${i}`).attr('src', fiveDayWeatherData[i].iconURL);
                    let iconContainer = $('<p>').addClass('forecast-item').append(iconEl);
                    let tempEl = $('<p>').addClass('forecast-item').text('Temp: ').append($('<span>' + fiveDayWeatherData[i].temperature + '°F' + '</span>'));
                    let windEl = $('<p>').addClass('forecast-item').text('Wind: ').append($('<span>' + fiveDayWeatherData[i].wind + 'mph' + '</span>'));
                    let humidityEl = $('<p>').addClass('forecast-item').text('Humidity: ').append($('<span>' + fiveDayWeatherData[i].humidity + '%' + '</span>'));
                    // append the card to the page, and then append all of the card body's elements inside of it
                    $('#five-day-forecast').append(forecastCard);
                    forecastCard.append(dateEl).append($('<p>').append(iconContainer)).append(tempEl).append(windEl).append(humidityEl);
                }
            },
            error: function (error) {
                console.log("There was an error while fetching weather data, please try again.")
            }
        })
    }

    // use Day.js to convert the timestamp into a readable date
    function formatDate(timestamp) {
        return dayjs(timestamp * 1000).format('ddd, MM • DD • YYYY')
    }

})
