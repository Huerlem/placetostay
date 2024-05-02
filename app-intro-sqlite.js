const Database = require('better-sqlite3');

const db = new Database('spaceToStay.db');
console.log('Connected to the DB');

//all accomodation
try{
    const stmt = db.prepare("SELECT * FROM spaceToStay");
    const results = stmt.all();
    console.log(`ALL ACCOMMODATION: ${results.length} places found.`);
} catch (error){
    console.log(error);
}