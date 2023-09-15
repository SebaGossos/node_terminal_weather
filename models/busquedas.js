import fs from 'node:fs';

import axios from 'axios' ;


export class Busquedas {
    historial = [];
    dbPath = './db/database.json';
    
    constructor() {
        //TODO: LEER DB SI EXISTE
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY, 
            'language': 'es',
            'limit': 5
        }
    }

    get paramsOpenWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric', 
            'lang': 'es'
        }
    }

    set historial( hist = [] ) {
        this.historial = hist;
    }

    async ciudad( lugar= '' ) {
        try{
            
            // petición http 
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            })

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                name: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }))

        }catch( err ) {
            return [];
        }
    }

    async climaLugar( lat, lon ) {
        try{
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            })
            const resp = await instance.get()
            
            const { weather, main } = resp.data
            const { description: desc } = weather[0];
            const { temp, temp_min, temp_max } = main;

            return { desc, temp, temp_min, temp_max } 

        }catch( err ) {
            console.log( err )
        }
    }

    agergarHistorial( lugar = '') {
        if (!this.historial.includes( lugar.toLocaleLowerCase() )) {
            this.historial.unshift( lugar.toLocaleLowerCase() );
        }
        // grabar en DB
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync( this.dbPath, JSON.stringify( payload, null, 2 ) )
    }

    leerDB(){
        const existsFile = fs.existsSync( this.dbPath );
        if ( !existsFile ) return [];
        
        const resp = fs.readFileSync( this.dbPath,{ encoding: 'utf-8' })
        const data = JSON.parse( resp );

        return data;
    }
    
}