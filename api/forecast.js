// 파일 경로: /api/forecast.js (Vercel용)

export default async function handler(req, res) {
    const API_KEY = process.env.WEATHER_API_KEY;
    const { city, unit = 'metric' } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'City is required' });
    }

    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const apiUrl = `${FORECAST_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        const fetchResponse = await fetch(apiUrl);
        
        // 오류 처리
        if (!fetchResponse.ok) {
            const data = await fetchResponse.json();
            return res.status(fetchResponse.status).json(data);
        }
        
        const data = await fetchResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Forecast function error:", error);
        return res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
}