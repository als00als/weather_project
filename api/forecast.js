// 파일 경로: /api/forecast.js

export default async function handler(request, response) {
    const API_KEY = process.env.WEATHER_API_KEY;

    const { searchParams } = new URL(request.url, `https://your-domain.com`);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'metric';

    if (!city) {
        return response.status(400).json({ error: 'City is required' });
    }

    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const apiUrl = `${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            return response.status(fetchResponse.status).json(data);
        }

        return response.status(200).json(data);

    } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch forecast data' });
    }
}