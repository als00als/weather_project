export default async function handler(req, res) {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { city, lat, lon, unit = 'metric' } = req.query;

    const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";
    let apiUrl = "";

    // 도시 이름 vs 좌표 판단 로직
    if (city) {
        apiUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=kr`;
    } else if (lat && lon) {
        apiUrl = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=kr`;
    } else {
        return res.status(400).json({ error: 'City or Coordinates required' });
    }

    try {
        const fetchResponse = await fetch(apiUrl);
        if (!fetchResponse.ok) {
            const data = await fetchResponse.json();
            return res.status(fetchResponse.status).json(data);
        }
        const data = await fetchResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
}