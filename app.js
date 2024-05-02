const express = require('express');
const Database = require('better-sqlite3');

//CONFIG SETTINGS
const PORT = 3000;
const DB = 'placesToStay.db'; //path to the SQLit database file

const app = express();
app.use(express.json());//to read JSON from the request body(POST requests)

app.use(express.static('public'));//access static content in 'public' folder(html, image, ect...)

//DB connection
const db = new Database(DB);
console.log(`Connected to the ${DB} database`);

//Routes
/*app.get('/', (req, res) =>{
    res.send('index');
});*/

//search accommodation by location (taks 1:1)
app.get('/accommodation/:location', (req, res) =>{
    try{
        const stmt = db.prepare("SELECT * FROM accommodation WHERE location=?"); //SQL query
        const results = stmt.all(req.params.location); //run the query
        console.log(`Accomodation by location ${req.params.location}: ${results.length} places found`);
        res.json(results);
    }catch(error) {
        res.status(500).json({error: error});
    }
});

//search accommodation by location and type (task 1:2)
app.get('/type/:type/location/:location', (req, res) =>{
    try{
        const stmt = db.prepare("SELECT * FROM accommodation WHERE type=? and location=?"); //SQL query
        const results = stmt.all(req.params.type, req.params.location); //run the query
        console.log(`Get type ${req.params.type} by location ${req.params.location}: ${results.length} places found`);
        res.json(results);
    }catch(error) {
        res.status(500).json({error: error});
    }
});

app.get('/accbookings/id/:id', (req, res) => {
    try{
        const stmt = db.prepare('SELECT * FROM acc_bookings WHERE id=?');
        const results = stmt.all(req.params.id);
        console.log(`ID ${req.params.id}: ${results.length} booking found.`);
        res.json(results);
    } catch (error) {
        res.status(500).json({error: error});
    }
});

app.get('/accdates/ID/:id', (req, res) => {
    try{
        const stmt = db.prepare("SELECT * FROM acc_dates WHERE id = ?");
        const results = stmt.all(req.params.id);
        console.log(`ID ${req.params.id}: ${results.length} booking found`);
        res.json(results);
    } catch (error) {
        res.status(500).json({error: error})
    }
});

/*
//add a booking on accommodation (updating the availability)
app.post('/accommodation/:accID/:npeople/:thedate', (req, res) =>{
    //debug
    console.log(JSON.stringify(req.body));

    try{
        db.transaction(() => {
                        
            const insertStmt = db.prepare("INSERT INTO acc_bookings (accID, npeople, username, thedate) VALUES(?, ?, ?, ?) ");
            const updateStmt = db.prepare("UPDATE acc_dates SET availability=availability -? WHERE accID = ? AND thedate = ?");
        
        
            const insertInfo = insertStmt.run(req.params.accID, req.params.npeople, req.params.username, req.params.thedate);
            const updateInfo = updateStmt.run(req.params.availabilityToSubtract, req.params.accID, req.params.thedate);

            console.log(`POST a Booking an accommodation of ID ${req.params.accID}, number of people ${req.params.npeople} and date ${req.params.thedate}: ${insertInfo.changes} booking made.`);
            console.log(`POST availability ID${req.params.accID} on the date ${req.params.thedate}: changes made, last inserted row ID ${updateInfo.lastInsertRowid}`);

            if(insertInfo.changes === 1 && updateInfo.changes === 1) {
                res.json({ sucess: true});
            } else {
                res.status(404).json({ error:"Failed to complet the booking and update availability"});
            }
        });
    }catch(error) {
        res.status(500).json({error: error});
        //console log error
        console.log(`POST BOOKING AN ACCOMMODATION ID ${req.params.accID}, number of people ${req.params.npeople} and date ${req.params.thedate}`);
    }
});
*/

/*
// booking an accomodation (task 1:3)
app.post('/bookings/add', (req, res) => {

    // error for blank value search
    if (!accID || !thedate || !username || !npeople) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // check if accID and npeople are integer number
    if (isNaN(accID) || isNaN(npeople) || !Number.isInteger(parseInt(accID)) || !Number.isInteger(parseInt(npeople))) {
        return res.status(400).json({ error: "Invalid data format for accID or npeople" });
    }

    try{
        //debug
        //console.log('/bookings/add', req.body);


        const stmt = db.prepare('INSERT INTO acc_bookings (accID, thedate, username, npeople) VALUES (?,?,?,?)');
        const info = stmt.run(req.body.accID, req.body.thedate, req.body.username, req.body.npeople);
        res.json({id: info.lastInsertRowid});
        console.log(`POST add ID ${req.body.accID} on the date ${req.body.thedate} by ${req.body.username} for number of people ${req.body.npeople}: ${info.changes} booking made, last inserted ID ${info.lastInsertRowid}`);
    } catch (error) {
        res.status(500).json({error: error});
        console.log(`POST add booking error: ${error}`)
    }
    
});

//updating availability
app.post('/accdates/:npeople/:accID/:thedate/booking', (req, res) => {
    try{
        const stmt = db.prepare('UPDATE acc_dates SET availability= availability - ? WHERE accID=? AND thedate = ?');
        const info = stmt.run(req.params.npeople, req.params.accID, req.params.thedate);
        if(info.changes === 1) {
            res.json({ success: 1});
            console.log(`POST REQUEST: booked accommodation of ID ${req.params.accID} on the date ${req.params.thedate}, ${info.changes} booking made.`);
        } else{
            res.status(404).json({error: 'No date with this ID'});
        }
    } catch (error) {
        res.status(500).json({error: error.message });
    }
});*/

/*
// Function to check availability
async function checkAvailability(accID, thedate, npeople) {
    try {
        const stmt = db.prepare("SELECT availability FROM acc_dates WHERE accID = ? AND thedate = ?");
        const row = stmt.get(accID, thedate);
        if (!row || row.availability < npeople) {
            return false; // Not enough availability
        } else {
            return true; // Enough availability
        }
    } catch (err) {
        throw new Error(err.message); // Throw error if encountered
    }
}

app.post('/bookings/add', async (req, res) => {
    const { accID, thedate, username, npeople } = req.body;

    if (!accID || !thedate || !username || !npeople) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedAccID = parseInt(accID);
    const parsedNpeople = parseInt(npeople);
    if (isNaN(parsedAccID) || isNaN(parsedNpeople)) {
        return res.status(400).json({ error: "Invalid data format for accID or npeople" });
    }

    try {
        const isAvailable = await checkAvailability(parsedAccID, thedate, parsedNpeople);
        if (!isAvailable) {
            return res.status(400).json({ error: "Not enough availability for this booking" });
        }
    
        db.run('INSERT INTO acc_bookings (accID, thedate, username, npeople) VALUES (?,?,?,?)',
            parsedAccID, thedate, username, parsedNpeople, async function (err) {
                if (err) {
                    console.error(`Error inserting booking: ${err.message}`);
                    return res.status(500).json({ error: "An error occurred while processing your request" });
                }
                
                const lastInsertId = await getLastInsertId();
                console.log(`Booking ID ${lastInsertId} created successfully.`);
                await updateAvailability(parsedNpeople, parsedAccID, thedate);
                res.json({ id: lastInsertId });
            });
    } catch (error) {
        console.error(`POST add booking error: ${error}`);
        res.status(500).json({ error: "An error occurred while processing your request" });
    }
});

/*
// Function to check availability
async function checkAvailability(accID, thedate, npeople) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare("SELECT availability FROM acc_dates WHERE accID = ? AND thedate = ?");
            const row = stmt.get(accID, thedate);
            if (!row || row.availability < npeople) {
                resolve(false); // Not enough availability
            } else {
                resolve(true); // Enough availability
            }
        } catch (err) {
            reject(err);
        }
    });
}
// Update availability
async function updateAvailability(npeople, accID, thedate) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
        stmt.run(npeople, accID, thedate, function (err) {
            if (err) {
                reject(err);
            } else if (this.changes !== 1) {
                reject(new Error('No date with this ID'));
            } else {
                resolve(true); // Availability updated successfully
            }
        });
    });
}

// Update availability
async function updateAvailability(npeople, accID, thedate) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
            stmt.run(npeople, accID, thedate, function (err) {
                if (err) {
                    reject(err); // Reject on error
                } else if (this.changes !== 1) {
                    reject(new Error('No date with this ID')); // Reject if no changes were made
                } else {
                    resolve(true); // Availability updated successfully
                }
            });
        } catch (err) {
            reject(err); // Reject on error
        }
    });
}*/

//function to get the last ID
function getLastInsertId() {
    return db.prepare('SELECT last_insert_rowid() as id').get().id;
}

//Checking the availability
async function checkAvailability(accID, thedate, npeople) {
    try {
        const stmt = db.prepare("SELECT availability FROM acc_dates WHERE accID = ? AND thedate = ?");
        const row = stmt.get(accID, thedate);
        if (!row || row.availability < npeople) {
            return false; //not enough availability
        } else {
            return true; //enough availability
        }
    } catch (err) {
        throw new Error(err.message); //error message
    }
}

//Updating the availability
async function updateAvailability(npeople, accID, thedate) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
            stmt.run(npeople, accID, thedate, function (err) {
                if (err) {
                    reject(err); //reject in case the error
                } else if (this.changes !== 1) {
                    reject(new Error('Not date found with this ID')); //reject if nothing was changed
                } else {
                    resolve(true); //Updated availability
                }
            });
        } catch (err) {
            reject(err); //reject error
        }
    });
}

//Add booking
app.post('/bookings/add', async (req, res) => {
    const { accID, thedate, username, npeople } = req.body;

    if (!accID || !thedate || !username || !npeople) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedAccID = parseInt(accID);
    const parsedNpeople = parseInt(npeople);
    if (isNaN(parsedAccID) || isNaN(parsedNpeople)) {
        return res.status(400).json({ error: "Datas format invalid" });
    }

    try {
        const isAvailable = await checkAvailability(parsedAccID, thedate, parsedNpeople);
        if (!isAvailable) {
            return res.status(400).json({ error: "There is not availability, Sorry." });
        }
    
        const stmtBookings = db.prepare('INSERT INTO acc_bookings (accID, thedate, username, npeople) VALUES (?, ?, ?, ?)');
        const infoBookings = stmtBookings.run(parsedAccID, thedate, username, parsedNpeople);
        const lastInsertId = infoBookings.lastInsertRowid;

        console.log(`Booking Id ${lastInsertId} made successfully.`);

        //Update the availability on table acc_dates
        const stmtAvailability = db.prepare('UPDATE acc_dates SET availability = availability - ? WHERE accID = ? AND thedate = ?');
        const infoAvailability = stmtAvailability.run(parsedNpeople, parsedAccID, thedate);

        if (infoAvailability.changes !== 1) {
            console.error("Error for trying to update the availability.");
        }

        res.json({ id: lastInsertId });
    } catch (error) {
        console.error(`No possible add your booking: ${error}`);
        res.status(500).json({ error: "An error occurred while processing your request" });
    }
});



app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));