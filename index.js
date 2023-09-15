import 'dotenv/config'

import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/inquirer.js"
import { Busquedas } from "./models/busquedas.js";


const main = async() => {

    const busquedas = new Busquedas();
    let opt;
    
    while( opt !== 0 ){
        console.clear();
        opt = await inquirerMenu();
        const { historial } = busquedas.leerDB();
        if( historial ) {
            busquedas.historial = historial;
        }
        

        switch(opt){
            case 1:
                
                // Mostrar mensaje
                const termino = await leerInput('Ciudad:')
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino )
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares )
                if ( id === '0' ) continue;
                
                const { name, lat, lng } = lugares.find( lugar => lugar.id === id );
                
                // Guardar en DB
                busquedas.agergarHistorial( name )
                
                

                // Clima 
                const { desc, temp, temp_min, temp_max }  = await busquedas.climaLugar( lat, lng )
                
                // Mostrar resultados
                console.clear()
                console.log('\nInformación del la ciudad\n'.green)
                console.log('Ciudad:', name)
                console.log('Lat:', lat)
                console.log('Lng:', lng)
                console.log('Temperatura:', temp)
                console.log('Maxima:', temp_min)
                console.log('Minima:', temp_max)
                console.log('Como está el Clima:', desc)
            break;
            case 2:
                busquedas.historial.forEach( (elem, i) => {
                    console.log(`${ i + 1 }.`.green + ` ${ elem }`)
                })
            break;
        }
        await pausa()

    }
}
main()
