// 파일 경로: /api/weather.js

export default async function handler(request, response) {
    const API_KEY = process.env.WEATHER_API_KEY;

    // 2. 클라이언트 요청에서 'city'와 'unit' 파라미터 가져오기
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

    const CURRENT_WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const apiUrl = `${CURRENT_WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        // 3. OpenWeatherMap API에 (서버에서만) 실제 요청 보내기
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        // 4. OpenWeatherMap API 오류를 클라이언트에 전달
        if (!fetchResponse.ok) {
            return new Response(JSON.stringify(data), {
                status: fetchResponse.status, 
                headers: { "Content-Type": "application/json" },
            });
        }

        // 5. 성공 시, 클라이언트에 날씨 데이터 반환
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        // [수정 필요 2] 500 에러를 new Response 객체로 반환
        console.error("Weather function error:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}