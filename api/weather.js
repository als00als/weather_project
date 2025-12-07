export default async function handler(req, res) {
    const API_KEY = process.env.WEATHER_API_KEY;
    // city 뿐만 아니라 lat, lon도 받아옵니다.
    const { city, lat, lon, unit = 'metric' } = req.query;

    const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
    let apiUrl = "";

    // 1. 도시 이름이 있으면 도시로 검색
    if (city) {
        apiUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&lang=kr`;
    } 
    // 2. 도시가 없고 좌표가 있으면 좌표로 검색
    else if (lat && lon) {
        apiUrl = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=kr`;
    } 
    // 3. 둘 다 없으면 에러
    else {
        return res.status(400).json({ error: 'City or Coordinates required' });
    }

    try {
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        if (!fetchResponse.ok) {
            return res.status(fetchResponse.status).json(data);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
}