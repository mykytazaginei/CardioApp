'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputDistance = document.querySelector('.form__input--distance');
const inputType = document.querySelector('.form__input--type');
const inputTemp = document.querySelector('.form__input--temp');
const inputDuration = document.querySelector('.form__input--duration');
const inputClimb = document.querySelector('.form__input--climb');

class WorkOut{

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription(){
        this.type === 'running' ? this.description = 
        `Пробежка ${new Intl.DateTimeFormat('en-US').format(this.date)}` : this.description = `Велотренеровка ${this.date}`;
    }
};

class Running extends WorkOut{
    type = 'running';

    constructor(coords, distance, duration, temp){
        super(coords, distance, duration);
        this.temp = temp;
        this.calculatePace();
        this._setDescription();
    }

    calculatePace(){
        this.pace = this.duration / this.distance;
    }
};

class Cycling extends WorkOut{
    type = 'cycling';

    constructor(coords, distance, duration, climb){
        super(coords, distance, duration);
        this.climb = climb;
        this.calculateSpeed();
        this._setDescription();
    }

    calculateSpeed(){
        this.speed = this.distance / this.duration / 60 ;
    }
}

class App{

    #map;
    #mapEvent;
    #workouts =[];
    

    constructor(){
        this._getPosition();
        this._getLocalStorageData();
        form.addEventListener('submit',this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleClimbField);
        containerWorkouts.addEventListener('click', this._moveToWorkOut.bind(this));

    }

    _getPosition(){

        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), this._erroCallback);

    }

    _loadMap(position){

        const {latitude} = position.coords;
        const {longitude} = position.coords;

        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));

        this.#workouts.forEach(workout => {
            this._displayMarker(workout)
        });
           
    }

    _erroCallback(){

        alert('We can\'t find your location');

    };

    _showForm(e){

        this.#mapEvent = e;
        form.classList.remove('hidden');
        inputDistance.focus();
        
    }

    _hideForm(){
        inputClimb.value = 
        inputDuration.value = 
        inputTemp.value = 
        inputDistance.value = '';
        form.classList.add('hidden');
    }

    _toggleClimbField(){

        inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
        inputTemp.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkout(e){

        const areNumbers = (...numbers) => 
            numbers.every(num => Number.isFinite(num));
        const areNumbersPositive = (...numbers) => 
            numbers.every(num => num > 0);    

        e.preventDefault();
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
        const type = inputType.value;
        const distance =+ inputDistance.value;
        const duration =+ inputDuration.value;
        
        if(type === 'running'){
            const temp =+ inputTemp.value
            if(!areNumbers(distance, duration, temp) || !areNumbersPositive(distance, duration, temp)) 
                return alert ('enter a positive number');

            workout = new Running([lat, lng], distance, duration, temp);
            
        }

        if(type === 'cycling'){
            const climb =+ inputClimb.value;
            if(!areNumbers(distance, duration, climb) || !areNumbersPositive(distance, duration)) 
            return alert ('enter a positive number');
            
            workout = new Cycling([lat, lng], distance, duration, climb);
            
        }

        this._displayOnSidebar(workout);

        this.#workouts.push(workout);
        console.log(workout)
        
        this._displayMarker(workout);

        this._hideForm();

        this._addWorkoutToLocalStorage();
    
    }

    _displayMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.description}`)
            .openPopup();
    }

    _displayOnSidebar(workout){

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚵‍♂️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">км</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">мин</span>
        </div>
      `
      if(workout.type === 'running'){
        html += `
            <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.temp}</span>
            <span class="workout__unit">м/мин</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">👟⏱</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">шаг/мин</span>
          </div>
          </li>
        ` 
      }

      if(workout.type === 'cycling'){
        html += `
        <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.temp}</span>
            <span class="workout__unit">км/ч</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🏔</span>
            <span class="workout__value">${workout.climb}</span>
            <span class="workout__unit">м</span>
          </div>
          </li>
        `
      }
      form.insertAdjacentHTML('afterend', html);
    }

    _moveToWorkOut(e){
        const workoutElement = e.target.closest('.workout');
        console.log(workoutElement);

        if(!workoutElement) return;

        const workout = this.#workouts.find(item => item.id === workoutElement.dataset.id);

        this.#map.setView(workout.coords, 13, { 
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    _addWorkoutToLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorageData(){
        const data = JSON.parse(localStorage.getItem('workouts'));
        if(!data) return;

        this.#workouts = data;

        this.#workouts.forEach(workout => {
            this._displayOnSidebar(workout)
        });
    }

    reset(){
        localStorage.removeItem('workouts');
        location.reload;
    }

};

const app = new App();
