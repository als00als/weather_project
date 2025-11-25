// 파일 경로: /api/weather.js

export default async function handler(request, response) {
    // 1. Vercel 환경 변수에서 API Key 가져오기
    // (이 'WEATHER_API_KEY'는 3단계에서 Vercel 사이트에 설정할 이름)
    const API_KEY = process.env.WEATHER_API_KEY;

    // 2. 클라이언트 요청에서 'city'와 'unit' 파라미터 가져오기
    // 예: /api/weather?city=seoul&unit=metric
    const { searchParams } = new URL(request.url, `https://your-domain.com`);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'metric';

    if (!city) {
        // Netlify Functions 형식으로 응답 반환
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'City is required' }),
        };
    }

    const CURRENT_WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const apiUrl = `${CURRENT_WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=${unit}&lang=kr`;

    try {
        // 3. OpenWeatherMap API에 (서버에서만) 실제 요청 보내기
        const fetchResponse = await fetch(apiUrl);
        const data = await fetchResponse.json();

        // 4. API 오류를 클라이언트에 전달 (Netlify Functions 형식으로 변경)
        if (!fetchResponse.ok) {
            return {
                statusCode: fetchResponse.status, // 상태 코드 사용
                body: JSON.stringify(data),      // JSON 본문을 문자열로 변환
            };
        }

        // 5. 성공 시, 클라이언트에 날씨 데이터 반환 (Netlify Functions 형식으로 변경)
        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        };

    } catch (error) {
        // 서버 오류 처리
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch weather data' }),
        };
    }
}