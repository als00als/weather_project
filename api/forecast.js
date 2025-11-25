// 파일 경로: /api/forecast.js

export default async function handler(request, response) {
    const API_KEY = process.env.WEATHER_API_KEY;

    const { searchParams } = new URL(request.url, `https://your-domain.com`);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'metric';

    if (!city) {
        // Netlify Functions 형식으로 400 에러 응답 반환
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'City is required' }),
        };
    }

    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const apiUrl = `${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        
        // OpenWeatherMap API 오류 처리
        if (!fetchResponse.ok) {
            // Netlify Functions 형식으로 API 응답 상태 코드 및 본문 전달
            return {
                statusCode: fetchResponse.status,
                body: JSON.stringify(data),
            };
        }

        // 성공 시, 클라이언트에 예보 데이터 반환
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        };

    } catch (error) {
        // 서버 내부 오류 처리
        console.error("Forecast function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch forecast data' }),
        };
    }
}