document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.querySelector(".toggle");
    const themeIcon = themeToggle.querySelector("i");
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === "light") {
            body.classList.remove("dark-mode"); 
            themeIcon.classList.replace("fa-moon", "fa-sun");
            localStorage.setItem("theme", "light");
        } else {
            body.classList.add("dark-mode"); 
            themeIcon.classList.replace("fa-sun", "fa-moon");
            localStorage.setItem("theme", "dark");
        }
    };

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const isDark = body.classList.contains("dark-mode"); 
        applyTheme(isDark ? "light" : "dark");
    });
});

async function getCityName() {
    try {
        const response = await fetch('https://ipinfo.io/json?token=bba951ecbf68d8')

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.city;
        
    } catch (error) {
        return error.message;
    }
}

let searchInput = document.getElementById('searchInput');

let searchValue = '';

function search() {
    searchInput.addEventListener("input", function () {
        searchValue = searchInput.value;
        displayData();
    })
}

search()

async function getData() {
    try {
        let city = '';

        if (searchValue.length >= 3) {
            const searchResponse = await fetch(`https://api.weatherapi.com/v1/search.json?key=cce765fe8a954b6abbb175629252506&q=${searchValue}`);
            const cityData = await searchResponse.json();

            if (cityData.length > 0) {
                city = cityData[0].name;
            } else {
                console.error('City not found');
                return null;
            }

        } else {
            city = await getCityName();
        }

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=cce765fe8a954b6abbb175629252506&q=${city}&days=6`);

        if (!response.ok) {
            throw new Error('Weather API response was not ok');
        }

        const weatherData = await response.json();

        const today = weatherData.current;
        const todayData = {
            temp: today.temp_c,
            conditionText: today.condition.text,
            humidity: today.humidity,
            windSpeed: today.wind_kph,
            icon: today.condition.icon
        };

        const forecast = weatherData.forecast.forecastday;
        let nextDays = [];

        for (let i = 1; i < forecast.length; i++) {
            const dateObj = new Date(forecast[i].date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            nextDays.push({
                day: dayName,
                date: forecast[i].date,
                maxTemp: forecast[i].day.maxtemp_c,
                minTemp: forecast[i].day.mintemp_c,
                icon: forecast[i].day.condition.icon
            });
        }

        let allData = {
            city: city,
            today: todayData,
            forecast: nextDays
        };

        return allData;

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

let cityName = document.getElementById('cityName');
let tempNumber = document.getElementById('tempNumber');
let conditionText = document.getElementById('conditionText');
let mainIcon = document.getElementById('mainIcon');
let humidityNumber = document.getElementById('humidityNumber');
let WindNumber = document.getElementById('WindNumber');
let days = document.querySelectorAll('#day');
let dayImg = document.querySelectorAll('#dayImg');
let dayTempNum = document.querySelectorAll('#dayTempNum');

async function displayData() {
    let allData = await getData();
    let today = allData.today;

    cityName.textContent = allData.city;
    tempNumber.textContent = today.temp;
    conditionText.textContent = today.conditionText;

    mainIcon.src = `https:${today.icon}`;
    humidityNumber.textContent = `${today.humidity}%`;
    WindNumber.textContent = `${today.windSpeed} km/h`;

    for (let i = 0; i < allData.forecast.length; i++) {
        let data = allData.forecast[i];
        if (i == 0) {
            days[i].textContent = "Tomorrow";
        }else {
            days[i].textContent = data.day;
        }
        dayImg[i].src = `https:${data.icon}`

        dayTempNum[i].textContent= `${data.maxTemp}/${data.minTemp}`

    }
}

displayData()