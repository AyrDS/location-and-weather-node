const { inquirerMenu, pause, readInput, listPlaces } = require('./helpers/inquirer');
require('dotenv').config();
const Searches = require('./models/searches');


const main = async () => {
    const searches = new Searches();
    let opt;

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                //Show message
                const city = await readInput('City: ');

                //search for cities
                const places = await searches.city(city);

                //Select city
                const idSelected = await listPlaces(places);
                if (idSelected === '0') continue;

                const placeSelected = places.find(place => place.id === idSelected);

                //Save in DB
                searches.addHistory(placeSelected.name);

                //Weather
                const { desc, max, min, temp } = await searches.weather(placeSelected.lat, placeSelected.lng);


                //Show results
                console.clear();
                console.log('\nCity information\n'.green);
                console.log('City: ' + placeSelected.name.green);
                console.log('Lat: ' + placeSelected.lat.toString().green);
                console.log('Lng: ' + placeSelected.lng.toString().green);
                console.log('Temperature: ' + temp.toFixed(2).green);
                console.log('Min: ' + min.toString().green);
                console.log('Max: ' + max.toString().green);
                console.log('Description: ' + desc.green);

                break;


            case 2:
                searches.capitalizedHistory.forEach((place, i) => {
                    const idx = `${i + 1}.`.green;

                    console.log(`${idx} ${place}`);
                })

                break;
        }

        if (opt !== 0) await pause();

    } while (opt !== 0);
}

main();