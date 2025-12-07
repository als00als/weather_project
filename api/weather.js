// 파일 경로: /api/weather.js (Vercel용)

export default async function handler(req, res) {
    const API_KEY = process.env.WEATHER_API_KEY;
    
    // Vercel은 req.query에서 파라미터를 바로 꺼낼 수 있습니다.
    const { city, unit = 'metric' } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    const CURRENT_WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const apiUrl = `${CURRENT_WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            return res.status(fetchResponse.status).json(data);
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Weather function error:", error);
        return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
}