import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

//!!!!!!!!!!!! ENV DATEI FÜR PASSWÖRTER BENUTZEN !!!!!!!!!!!!//
run();

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  try {
    // Retrieve data from the Event-Location-database
    const connection = await ConnectToDatabase(host, user, password, database);// hier
    const [rows, fields] = await connection.execute('SELECT url, titleSelector, dateSelector, name FROM eventsites');//nicht vergessen

    if (rows.length > 0) {
      // Log the retrieved data
      console.log('Retrieved data from Eventssites table:');
      for (const row of rows) {
        console.log(row);

        // Call ScrapData with the retrieved parameters
        const { eventnames, eventdates, location } = await ScrapData(page, row.url, row.titleSelector, row.dateSelector, row.name);

        // Log the results
        console.log('Eventname:', eventnames, 'Date:', eventdates, 'Location:', location);

        // Create EventTable and insert data
        await CreateEventTable(connection, eventnames, eventdates, location);
      }
    } else {
      // Handle the case where no data is retrieved from the database
      console.log('No data found in Eventssites table');
    }
  } catch (error) {
    console.error('Error in run:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// DataScraper
async function ScrapData(page, url, eventnamediv, eventdatediv, locationname) {
  // Navigate to the website you want to scrape
  await page.goto(url);

  // Define a selector for the elements you want to scrape
  const eventnameSelector = eventnamediv;
  const eventdateSelector = eventdatediv;
  const location = locationname;

  // Extract the data from the page
  const eventnames = await page.$$eval(eventnameSelector, eventnames => eventnames.map(eventname => eventname.textContent.trim()));
  const eventdates = await page.$$eval(eventdateSelector, eventdates => eventdates.map(eventdate => eventdate.textContent.trim()));

  return { eventnames, eventdates, location };
}

// Save the data to MySQL
async function ConnectToDatabase(host, user, pw, dbname) {
  // Save the data to MySQL
  const connection = await mysql.createConnection({
    host: host,
    user: user,
    password: pw,
    database: dbname,
  });
  return connection;
}

// Create EventTable and insert data
async function CreateEventTable(connection, eventnames, eventdates, location) {
  try {
    // Create a table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventname VARCHAR(255), eventdate VARCHAR(255), location VARCHAR(255)
      )
    `);

    // Insert data into the table
    for (let i = 0; i < eventnames.length; i++) {
      await connection.execute('INSERT INTO events (eventname, eventdate, location) VALUES (?, ?, ?)', [eventnames[i], eventdates[i], location]);
    }

    console.log('Data saved to MySQL.');
  } catch (error) {
    console.error('Error in CreateEventTable:', error);
  } 
}

