// Define the main function for fetching data from the Ticketmaster API
/*
async function fetchEventData() {
    let page = 3;
    let classificationName = 'music';
    let countryCode = 'DE';
    let city = 'Cologne';
    let apikey = process.env.API_KEY; //missing in .env
    let size = 4;

    let apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=${encodeURIComponent(classificationName)}&countryCode=${encodeURIComponent(countryCode)}&city=${encodeURIComponent(city)}&apikey=${encodeURIComponent(apikey)}&size=${size}&page=${page}`;

    try {
        let response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching events from Ticketmaster API:', error);
        throw error;
    }
}

// API endpoint to get events from the Ticketmaster API
app.get('/api/events', async (req, res) => {
    try {
        let eventData = await fetchEventData();
        res.json(eventData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
*/  
