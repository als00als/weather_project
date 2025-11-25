// 파일 경로: /api/forecast.js

export default async function handler(request, response) {
    const API_KEY = process.env.WEATHER_API_KEY;

    const { searchParams } = new URL(request.url, `https://your-domain.com`);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'metric';

    if (!city) {
        return new Response(JSON.stringify({ error: 'City is required' }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const apiUrl = `${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {

        // OpenWeatherMap API 오류 처리
        if (!fetchResponse.ok) {
            return new Response(JSON.stringify(data), {
                status: fetchResponse.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 성공 시, 클라이언트에 예보 데이터 반환
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        // 서버 내부 오류 처리
        console.error("Forecast function error:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch forecast data' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}