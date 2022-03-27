const fs = require('fs');
const axios = require('axios');

class Searches {
    history = [];
    dbPath = './db/db.json';

    constructor() {
        //TODO: if exists, read db

        this.readDB();
    }

    get capitalizedHistory() {
        //Capitalize on every word
        return this.history.map(place => {
            let words = place.split(' ');
            words = words.map(w => w[0].toUpperCase() + w.substring(1));

            return words.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    async city(city = '') {
        try {
            // Request HTTP
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json`,
                params: this.paramsMapbox
            })
            const resp = await instance.get();
            return resp.data.features.map(place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1]
            }))

        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async weather(lat, lng) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}`,
                params: {
                    appid: process.env.OPENWEATHER_KEY,
                    lang: 'es',
                    units: 'metric'
                }
            });

            const resp = await instance.get();
            return {
                desc: resp.data.weather[0].description,
                min: resp.data.main.temp_min,
                max: resp.data.main.temp_max,
                temp: resp.data.main.temp
            }


        } catch (error) {
            console.log(error);
        }
    }

    addHistory(city = '') {
        if (this.history.includes(city.toLowerCase())) return;

        this.history = this.history.splice(0, 5);

        this.history.unshift(city.toLowerCase());

        //Save in DB
        this.saveDB();
    }

    saveDB() {
        const payload = {
            history: this.history
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    readDB() {
        if (!fs.existsSync(this.dbPath)) return;
        const data = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const dataParse = JSON.parse(data);

        this.history = dataParse.history;
    }
}


module.exports = Searches;