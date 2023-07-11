'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--temp');
const inputElevation = document.querySelector('.form__input--climb');

const succesCallback = function(position){
    const {latitude} = position.coords;
    const {longitude} = position.coords;

    const coords = [latitude, longitude];
    const map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('click', mapEvent => {
        const {lat, lng} = mapEvent.latlng; 
        L.marker([lat, lng]).addTo(map)
        .bindPopup(L.popup({
            autoClose: false,
            closeOnClick: false
        }))
        .setPopupContent("Traning")
        .openPopup();
    })
};

const ErroCallback = function(){
    alert('We can\'t find your location');
};

navigator.geolocation.getCurrentPosition(succesCallback, ErroCallback);
