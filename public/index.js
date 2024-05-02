
//search accommodation by location on the map

const map = L.map("map1");
const attrib = "Map data copyright OpenStreetMap contributors, Open Database Licence";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: attrib
}).addTo(map);

const pos = [51.505, -0.09]; // GPS coordinates [latitude, longitude]
map.setView(pos, 13);

L.marker(pos).addTo(map);

let markers = [];

//clean markers on the map
function clearMarkers() {
    if (markers.length > 0) {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }
}

// search accommodation by location on the map
async function searchAccommodationByLocation() {
    const location = document.getElementById("inputLocation").value.trim(); //remove extra space
    console.log(`Location: ${location}`);

    fetch(`accommodation/${location}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            renderAccommodationInHTML(data);
        });

    //check if the location is empty
    if (location === "") {
        console.log("Location field is empty.");
        return;
    }

    try {
        const response = await fetch(`/accommodation/${location}`);
        const data = await response.json();
        
        clearMarkers(); //clean the markers

        //add marke for accommodation found
        data.forEach(accommodation => {
            const marker = L.marker([accommodation.latitude, accommodation.longitude]).addTo(map);
            marker.bindPopup(`<b>${accommodation.name}</b><br>${accommodation.description}`);
            markers.push(marker); // add markers on the list
        });

        //show on the map the first accommodation marker found
        if (data.length > 0) {
            const firstAccommodation = data[0];
            map.setView([firstAccommodation.latitude, firstAccommodation.longitude], 13);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
/*
//search by location
async function searchAccommodationByLocation() {
    const location = document.getElementById("inputLocation").value; 
    console.log(`Location: ${location}`);

    fetch(`accommodation/${location}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            renderAccommodationInHTML(data);
        });
           
}*/

/*
function renderAccommodationInHTML(data) {
    const resultsContainer = document.getElementById("searchAccommodationResults");
    resultsContainer.innerHTML = ''; //Clean the previous search

    const nbAccommodation = data.length;
    var html = `<p><b>${nbAccommodation}</b> Accommodation(s) found:</p>`;

    //data needs to be parsed
    if(nbAccommodation > 0) { //at least 1 accommodation
        html += '<ol>';
        data.forEach(accommodation => {
            html += `<li><b>${accommodation.name}</b> (${accommodation.type}) - ${accommodation.location}`;
            //add 'book' button for each result
            html += `<button class="btn btn-secondary" onclick="bookingAccommodation(${accommodation.accID}, ${accommodation.thedate}, ${accommodation.npeople}, ${accommodation.availability}) value="Booking Accommodation" id> Book </button></li>`;
        });
        html += '</ol>';
    }
    resultsContainer.innerHTML = html;
}*/


function renderAccommodationInHTML(data) {
    const resultsContainer = document.getElementById("searchAccommodationResults");
    resultsContainer.innerHTML = ''; 

    const nbAccommodation = data.length;
    var html = `<p><b>${nbAccommodation}</b> Accommodation(s) found:</p>`;

    if (nbAccommodation > 0) { // Whether at least one accommodation
        html += '<ol>';
        data.forEach(accommodation => {
            html += `<li><b>${accommodation.name}</b> (${accommodation.type}) - ${accommodation.location}`;
            //add buttom 'book'
            html += `<button class="btn btn-secondary book-btn" 
                      data-accid="${accommodation.accID}" 
                      data-thedate="${accommodation.thedate}" 
                      data-npeople="${accommodation.npeople}">Book</button></li>`;
        });
        html += '</ol>';
    }
    resultsContainer.innerHTML = html;

    //add function when click the buttom 'book'
    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const accID = this.dataset.accid;
            const thedate = this.dataset.thedate;
            const npeople = this.dataset.npeople;
            bookingAccommodation(accID, thedate, npeople);
        });
    });
}

/*
//Send request to AJAX POST for booking an accommodation
async function bookingAccommodation(accID, thedate, npeople) {
    const postData = {
        accID: 6,
        thedate: 220603,
        npeople: 1        
    };

    console.log(`Add new booking: ${JSON.stringify(postData)}`);

    fetch('/bookings/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if(!response.ok) {
            throw new Error('Failed to reserve accommodation. Please check your details and try again.');
        }
        return response.json();
    })
    //.then(alert(`Booked successfully: \n${JSON.stringify(postData)}`))
    .then(data => {
        console.log(data);
        alert(`Booked successfully: \n${JSON.stringify(postData)}`);
        updateAvailability(npeople, accID, thedate); //call the function to update the availability after booking
    })
   
    .catch((error) => alert(`Error to add new booking: ${error}`));
}

async function updateAvailability(npeople, accID, thedate) {
    const postData = {
        npeople: npeople, 
        accID: accID,
        thedate: thedate
    };

    fetch(`/accdates/${npeople}/${accID}/${thedate}/booking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update availability.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch((error) => console.error(`Error updating availability: ${error}`));
}*/

async function bookingAccommodation(accID, thedate, npeople) {
    const postData = {
        accID: 6,
        thedate: 220603,
        username: "Kate", // Assuming a default username for now
        npeople: 1
    };

    console.log(`Add new booking: ${JSON.stringify(postData)}`);

    fetch('/bookings/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to reserve accommodation. Please check your details and try again.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        alert(`Booked successfully: \n${JSON.stringify(postData)}`);
    })
    .catch((error) => alert(`Error to add new booking: ${error}`));
}

async function updateAvailability(npeople, accID, thedate) {
    const postData = {
        npeople: npeople,
        accID: accID,
        thedate: thedate
    };

    fetch(`/accdates/${npeople}/${accID}/${thedate}/booking`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update availability.');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch((error) => console.error(`Error updating availability: ${error}`));
}





