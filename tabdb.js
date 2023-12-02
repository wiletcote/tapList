let db;

//figure out how to move this to another file
// const defaultStyles = [
//     { name: 'Amber'},
//     { name: 'American Brown'},
//     { name: 'Cream Ale'},
//     { name: 'Dark Ale'},
//     { name: 'Dortmunder' },
//     { name: 'English Brown'},
//     { name: 'Hefeweizen'},
//     { name: 'IPA'},
//     { name: 'IPA - East Coast'},
//     { name: 'IPA - West Coast'},
//     { name: 'IPA - Hazy'},
//     { name: 'Lager'},
//     { name: 'NEIPA'},
//     { name: 'Pale Ale'},
//     { name: 'Pale Ale - Hazy'},
//     { name: 'Pumpkin Ale'},
//     { name: 'Red Ale'},
//     { name: 'Sour'},
//     { name: 'Stout'},
//     { name: 'Stout - Irish'},
//     { name: 'Stout - Milk'},
//     { name: 'Wheat'},
// ];

const openBeerDB = () => {
    return new Promise(
        function(resolve, reject) {
            console.log('opening db')
            let openRequest = indexedDB.open('BeerDepot', 1);
            openRequest.onupgradeneeded = (event) => {
                //initialize db - create tables and default data
                console.log('on upgrade needed');
                db = event.target.result;
                if (!db.objectStoreNames.contains('Breweries')) {
                    console.log('creating breweries');
                    db.createObjectStore('Breweries', {keyPath: 'name'});
                }
                if (!db.objectStoreNames.contains('BeerStyles')) {
                    let stylesStore = db.createObjectStore('BeerStyles', {keyPath: 'id', autoIncrement: true});
                    addStyles(stylesStore);
                    //add beer styles list
                }
                if (!db.objectStoreNames.contains('Beer')) {
                    let beers = db.createObjectStore('Beer', {keyPath: 'name'});
                    beers.createIndex('brewery_idx', 'brewery')
                }
                if (!db.objectStoreNames.contains('TapList')) {
                    db.createObjectStore('TapList', {keyPath: 'id', autoIncrement: true});
                }
                // resolve(true);
            }

            openRequest.onsuccess = () => {
                console.log('returning request');
                db = openRequest.result;
                if (db) resolve(true);
                reject(false);
            }

            openRequest.onerror = () => {
                console.log('error: ', openRequest.error);
                reject(Error('failed to open db'));
            }
        }    
    )
}

const getTapList = () => {
    return new Promise(
        function(resolve, reject) {
            let transaction = db.transaction('TapList', 'readonly');
            let tapList = transaction.objectStore('TapList');
            let request = tapList.getAll();
            request.onsuccess = () => {
                console.log('get results: ' + JSON.stringify(request.result));
                resolve(request.result);
            }
            request.onerror = () => {
                console.log('error:' + request.error);
            }
        }
    )       
}

//untested
const getBreweries = () => {
    return new Promise(
        function(resolve, reject) {
            let transaction = db.transaction('Breweries', 'readonly');
            let breweries = transaction.objectStore('Breweries');
            let request = breweries.getAll();
            request.onsuccess = () => {
                console.log('got breweries: ' + JSON.stringify(request.result));
                resolve(request.result);
            }
            request.onerror = () => {
                console.log('error:' + request.error);
                resolve([]);
            }
        }
    )       
}

//untested
const getBeerStyles = () => {
    let transaction = db.transaction('BeerStyles', 'readonly');
    let styles = transaction.objectStore('BeerStyles');
    let request = styles.getAll();
    request.onsuccess = () => {
        console.log('got styles: ' + JSON.stringify(request.result));
        resolve(request.result);
    }
    request.onerror = () => {
        console.log('error:' + request.error);
    }
}

//untested
const getBeers = (brewery) => {
    return new Promise(
        function(resolve, reject) {
            let transaction = db.transaction('Beer', 'readonly');
            let beers = transaction.objectStore('Beer');
            let breweryIndex = beers.index("brewery_idx");
            //need to get based on breweryName
            let request;
            if (brewery) {
                request = breweryIndex.getAll(brewery);
            } else {
                request = beers.getAll();
            }
            
            request.onsuccess = () => {
                console.log('got beers for ' + brewery  + ': ' + JSON.stringify(request.result));
                resolve(request.result);
            }
            request.onerror = () => {
                console.log('error:' + request.error);
                resolve([]);
            }
        }
    )        
}

//untested
const addBrewery = (newBrewery) => {
    let transaction = db.transaction('Breweries', 'readwrite');
    let breweries = transaction.objectStore('Breweries');
    
    let request = breweries.put(newBrewery);
    request.onsuccess = () => {
        console.log('added brewery');
    }
    request.onerror = () => {
        console.log('Error', request.error);
    }
}

const addBeerStyle = (newBeerStyle) => {
    let transaction = db.transaction('BeerStyles', 'readwrite');
    let styles = transaction.objectStore('BeerStyles');
    
    let request = styles.put(newBeerStyle);
    request.onsuccess = () => {
        console.log('added style');
    }
    request.onerror = () => {
        console.log('Error', request.error);
    }
}

const addBeer = (newBeer) => {
    let transaction = db.transaction('Beer', 'readwrite');
    let beer = transaction.objectStore('Beer');
    
    let request = beer.put(newBeer);
    request.onsuccess = () => {
        console.log('added beer');
    }
    request.onerror = () => {
        console.log('Error', request.error);
    }
}

const addTap = (newTap) => {
    return new Promise(
        function(resolve, reject) {
            let transaction = db.transaction('TapList', 'readwrite');
            let onTap = transaction.objectStore('TapList');
            const tapData = {
                brewery: newTap.brewery.value,
                city: newTap.breweryCity.value,
                state: newTap.breweryState.value,
                beer: newTap.beer.value,
                style: newTap.beerStyle.value,
                abv: newTap.beerABV.value,
                ibu: newTap.beerIBU.value,
                price: newTap.beerPrice.value
            }
            console.log('adding tap: ' + JSON.stringify(tapData));
            let request = onTap.put(tapData);
            request.onsuccess = () => {
                console.log('more beer!');
                resolve(true);
            }
            request.onerror = () => {
                console.log('spilled beer!', request.error);
                resolve(false);
            }
            //Save the brewery and beer separately so the user can select it again in the future.
            addBrewery({
                name: tapData.brewery,
                city: tapData.city,
                state: tapData.state
            });
            addBeer({
                brewery: tapData.brewery,
                name: tapData.beer,
                abv: tapData.abv,
                ibu: tapData.ibu,
            });
        }
    )        
}

const deleteTap = (id) => {
    return new Promise(
        function(resolve, reject) {
            console.log('deletetap ' + id)
            let transaction = db.transaction('TapList', 'readwrite');
            let tap = transaction.objectStore('TapList');
            tap.delete(id);
            tap.onsuccess = () => {
                console.log('deleted ' + id);
                resolve(true);
            }
            tap.onerror = () => {
                console.log('error deleting: ' + tap.error);
                resolve(false);
            }
            resolve(true);
        }
    )        
}

const addStyles = (stylesStore) => {
    defaultStyles.forEach((style) => {
        stylesStore.put(style);
    });    
}
// const addDefaultData = (someBreweries, someStyles, someBeers) => {
//     let transaction1 = db.transaction('Breweries', 'readwrite');
//     let breweries = transaction1.objectStore('Breweries');
//     someBreweries.forEach((brewery) => {
//         let request = breweries.put(brewery);
//         request.onsuccess = () => {
//             console.log('added brewery');
//         }
//         request.onerror = () => {
//             console.log('Error', request.error);
//         }
//     });
//     let transaction2 = db.transaction('BeerStyles', 'readwrite');
//     let styles = transaction2.objectStore('BeerStyles');
//     someStyles.forEach((style) => {
//         let request = styles.put(style);
//         request.onsuccess = () => {
//             console.log('added style');
//         }
//         request.onerror = () => {
//             console.log('Error', request.error);
//         }
//     });
//     let transaction3 = db.transaction('Beer', 'readwrite');
//     let beers = transaction3.objectStore('Beer');
//     someBeers.forEach((beer) => {
//         let request = beers.put(beer);
//         request.onsuccess = () => {
//             console.log('added beer');
//         }
//         request.onerror = () => {
//             console.log('Error', request.error);
//         }
//     });
// }