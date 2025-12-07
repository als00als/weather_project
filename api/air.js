export default async function handler(req, res) {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Coordinates (lat, lon) required' });
    }

    const AIR_POLLUTION_URL = "http://api.openweathermap.org/data/2.5/air_pollution";
    const apiUrl = `${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            return res.status(fetchResponse.status).json(data);
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Air quality function error:", error);
        return res.status(500).json({ error: 'Failed to fetch air quality data' });
    }
}