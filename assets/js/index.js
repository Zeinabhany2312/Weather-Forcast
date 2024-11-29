let forecast;

function toggleVisibility(shown) {
  let hidden = shown === "main" ? ".contact-main" : "main";

  $(hidden).addClass("d-none");
  $(shown).removeClass("d-none");
}
function toggleActive(activated) {
  let inActive = activated === "#contact-nav" ? "#home-nav" : "#contact-nav";

  $(activated).addClass("active");
  $(inActive).removeClass("active");
}

function handleNavigation(targetVisibility, targetActive) {
  toggleVisibility(targetVisibility);
  toggleActive(targetActive);
}

$("#contact-nav").on("click", () => {
  handleNavigation(".contact-main", "#contact-nav");
});

$("#home-nav").on("click", () => {
  handleNavigation("main", "#home-nav");
});

$("#return-home").on("click", () => {
  handleNavigation("main", "#home-nav");
});

function getWindDir(wind_degree) {
  if (wind_degree > 337.5) return "Northerly";
  if (wind_degree > 292.5) return "North Westerly";
  if (wind_degree > 247.5) return "Westerly";
  if (wind_degree > 202.5) return "South Westerly";
  if (wind_degree > 157.5) return "Southerly";
  if (wind_degree > 122.5) return "South Easterly";
  if (wind_degree > 67.5) return "Easterly";
  if (wind_degree > 22.5) {
    return "North Easterly";
  }
  return "Northerly";
}

async function apiCall(place) {
  forecast = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=095f6f84e65b44ba9c735801242407&q=${place}&days=3`
  ).then((res) => res.json());

  forecast = getNeededValues();
  displayData();
}

function getDay(date) {
  const dateObj = new Date(date);
  return dateObj.getDay();
}

function getDayName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en", { weekday: "long" });
}

function getMonthName(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en", { month: "long" });
}

// Removes unwanted values from the JSON response
function getNeededValues() {
  let filteredValues = {};

  // Handeling Location Part of JSON Obj
  filteredValues.address = `${forecast.location.name}, ${forecast.location.region}, ${forecast.location.country}`;

  // Handeling Current Part of JSON Obj
  let current = {};
  current.temp = forecast.current.temp_c;
  current.condition = forecast.current.condition.text;
  current.icon = forecast.current.condition.icon;
  current.humidity = forecast.current.humidity;
  current.wind_dir = getWindDir(forecast.current.wind_deg);
  current.wind_speed = forecast.current.wind_kph;

  current.day = getDayName(forecast.forecast.forecastday[0].date);
  current.month = getMonthName(forecast.forecast.forecastday[0].date);
  current.dayNum = forecast.forecast.forecastday[0].date.split("-")[2];

  filteredValues.current = current;

  // Handeling Forecast Part of JSON Obj
  const days = forecast.forecast.forecastday.slice(1);
  let daysForecast = [];
  for (let i = 0; i < days.length; i++) {
    let myDay = {};
    myDay.max_temp = days[i].day.maxtemp_c;
    myDay.min_temp = days[i].day.mintemp_c;
    myDay.day = getDayName(days[i].date);
    myDay.condition = days[i].day.condition.text;
    myDay.icon = days[i].day.condition.icon;
    daysForecast.push(myDay);
  }

  filteredValues.forecast = daysForecast;
  return filteredValues;
}

function displayData() {
  let curr = forecast.current;
  let days = forecast.forecast;

  let currentDayHTML = `
  <div
    class="card-header border-0 light-dark-header d-flex justify-content-between">
    <span class="small">${curr.day}</span>
    <span class="small">${curr.dayNum} ${curr.month}</span>
  </div>
  <div class="card-body">
    <h5 class="card-title fs-6 text-body-secondary fw-normal">
      ${forecast.address}
    </h5>
    <h2 class="fw-bold">${curr.temp}&deg;C</h2>
    <img src="https:${curr.icon}" alt="" class="small-img" />
    <div class="my-2 blue-text">${curr.condition}</div>
    <div>
      <span class="me-2">
        <img
          src="assets/images/icon-umberella.png"
          alt="umbrella icon" />
        <small class="text-body-secondary"> ${curr.humidity}% </small>
      </span>
      <span class="me-2">
        <img src="assets/images/icon-wind.png" alt="wind icon" />
        <small class="text-body-secondary"> ${curr.wind_speed} Km/H </small>
      </span>
      <span class="me-2">
        <img
          src="assets/images/icon-compass.png"
          alt="compass icon" />
        <small class="text-body-secondary"> ${curr.wind_dir} </small>
      </span>
    </div>
  </div>
  `;

  let currentDay = $(".current-day");
  currentDay.html(currentDayHTML);
  let otherCards = $("main .card").not(".current-day");

  otherCards.each((i, card) => {
    let cardHTML = `
        <div class="card-header dark-header border-0 text-center">
          ${days[i].day}
        </div>
        <div
          class="card-body text-center d-flex align-items-center justify-content-center flex-column">
          <img src="https:${days[i].icon}" class="xsmall-img" />
          <h5 class="card-title fw-bold fs-3 mb-0">${days[i].max_temp}&deg;C</h5>
          <small class="text-body-secondary mb-3">${days[i].min_temp}&deg;</small>
          <small class="blue-text">${days[i].condition}</small>
        </div>
    `;

    card.innerHTML = cardHTML;
  });
}

$("#find-btn").on("click", () => {
  let place = $("#location").val();
  apiCall(place);
  $("#location").val("");
});

$("#location").on("keypress", (event) => {
  if (event.which === 13) {
    $("#find-btn").click();
  }
});

async function getLocation() {
  try {
    // Get exact location of user using GPS
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const latitude = await position.coords.latitude;
      const longitude = await position.coords.longitude;
      return `${latitude},${longitude}`;
    }
  } catch {
    // If user denies access to GPS, use user timezone
    let loc = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1];
    return loc;
  }
}

async function main() {
  let loc = await getLocation();
  await apiCall(loc);
}

main();
