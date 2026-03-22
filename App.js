console.log("welcome to the movie explorer")

let inputElem = document.getElementById("input")
let btnElem = document.getElementById("btn")
let detailElem = document.getElementById("details")
let mapElem = document.getElementById("map")
let map;
let popupElem = document.getElementById("popup")
let btn1 = document.getElementById("btn1")
let currentCountry = null;
let popup = document.getElementById("popup")
let popupDetails = document.getElementById("popupDetails")
let closePopup = document.getElementById("closePopup")
let showSavedBtn = document.getElementById("btn1")


// fetching api
async function movieExplorer(name){
    try{
        let response = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`)

        if(!response.ok) throw new Error("Server Error")

        let data = await response.json()
        let countryData = data[0]
        currentCountry = countryData 
        displayCountry(countryData)
        updateTimezones(countryData.timezones);
        drawMap(countryData.latlng, countryData.name.common);      
    } catch(error){
        console.error(error.message)
    }
}

// event listener
btnElem.addEventListener("click", function (){
    let countryName = inputElem.value.trim()

    if(!countryName){
        alert("Fill in the field")
        return
    } 
    movieExplorer(countryName)
    inputElem.value = ""
})

// display country
function displayCountry(countryData){
    detailElem.innerHTML = `
    <div class="p-4 border rounded shadow" id="country-details">
        <img src="${countryData.flags.svg}" width="200"/>
        <h2>${countryData.name.common}</h2>
        <p>Capital: ${countryData.capital}</p>
        <p>Population: ${countryData.population.toLocaleString()}</p>
        <p>Region: ${countryData.region}</p>

    </div>
    `
}

let saveBtn = document.getElementById("btn2")

saveBtn.addEventListener("click", function() {

    if (!currentCountry) {
        alert("Search for a country first");
        return;
    }

    // Get existing saved countries
    let saved = localStorage.getItem("savedCountries");
    let countries = saved ? JSON.parse(saved) : [];

    // Check if the country is already saved
    if (!countries.some(c => c.name.common === currentCountry.name.common)) {
        countries.push(currentCountry);
        localStorage.setItem("savedCountries", JSON.stringify(countries));
        alert(`${currentCountry.name.common} saved!`);
    } else {
        alert(`${currentCountry.name.common} is already saved`);
    }
});


showSavedBtn.addEventListener("click", function() {

    let saved = localStorage.getItem("savedCountries");
    if (!saved) {
        alert("No countries saved yet");
        return;
    }

    let countries = JSON.parse(saved);

    popupDetails.innerHTML = countries.map(country => `
        <div style="margin-bottom:15px;">
            <img src="${country.flags.svg}" width="100">
            <h3>${country.name.common}</h3>
            <p>Capital: ${country.capital}</p>
            <p>Population: ${country.population.toLocaleString()}</p>
            <p>Region: ${country.region}</p>
        </div>
    `).join('');

    popup.style.display = "flex";
});
closePopup.addEventListener("click", function(){
    popup.style.display = "none"
})

function updateTimezones(timezones) {
    const timezoneList = document.getElementById("timezoneList");
    timezoneList.innerHTML = "";

    timezones.forEach((tz) => {
        const li = document.createElement("li");
        const localTime = getTimeUsingIntl(tz);

        li.textContent = `${tz} - ${localTime}`;
        timezoneList.appendChild(li);
    });
}

function getTimeUsingIntl(tz) {
    try {
        const options = {
            timeZone: convertToIANA(tz),
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        };
        return Intl.DateTimeFormat("en-US", options).format(new Date());
    } catch (err) {
        console.warn(`Timezone ${tz} not supported, falling back.`);
        return "Unsupported timezone";
    }
}

function convertToIANA(utcString) {
    // Basic support for known UTC formats
    if (utcString === "UTC") return "Etc/UTC";

    const match = utcString.match(/^UTC([+-]\d{2}):(\d{2})$/);
    if (match) {
        const [, hour, min] = match;
        // Convert UTC offset to Etc/GMT format (note: reverse sign for IANA)
        const offset = parseInt(hour, 10);
        const sign = offset < 0 ? "+" : "-";
        return `Etc/GMT${sign}${Math.abs(offset)}`; // IANA flips signs
    }

    return "Etc/UTC"; // fallback
}

function drawMap(latlang, name) {
    const [lat, lng] = latlang;

    if (!map) {
        map = L.map("map").setView([lat, lng], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
            map
        );
    } else {
        map.setView([lat, lng], 5);
    }

    L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
}