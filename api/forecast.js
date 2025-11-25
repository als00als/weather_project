// 파일 경로: /api/forecast.js

export default async function handler(request, context) {
    const API_KEY = process.env.WEATHER_API_KEY;

    const { searchParams } = new URL(request.url, `https://your-domain.com`);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'metric';

    if (!city) {
        // [수정 필요 1] 400 에러를 new Response 객체로 반환
        return new Response(JSON.stringify({ error: 'City is required' }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const apiUrl = `${FORECAST_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        const fetchResponse = await fetch(apiUrl);
        // fetchResponse를 먼저 확인하고 JSON 파싱을 시도합니다.
        
        // OpenWeatherMap API 오류 처리 (401, 404 등)
        if (!fetchResponse.ok) {
            const data = await fetchResponse.json(); 
            // API 오류 응답 본문을 클라이언트에 전달
            return new Response(JSON.stringify(data), {
                status: fetchResponse.status,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const data = await fetchResponse.json();

        // 성공 시, 클라이언트에 예보 데이터 반환
        return new Response(JSON.stringify(data), {
            status: 200,
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        // [수정 필요 2] 서버 내부 오류 500 에러를 new Response 객체로 반환
        console.error("Forecast function error:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch forecast data' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}