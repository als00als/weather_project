// 앱의 현재 상태를 저장할 변수
let currentUnit = "metric"; // 'metric' = 섭씨, 'imperial' = 화씨
let currentCity = ""; // 현재 검색된 도시
let recentSearches = []; // 최근 검색어를 담을 배열


/* --- 2. DOM 요소 가져오기 --- */
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const errorMessage = document.querySelector("#error-message");
const diaryInput = document.querySelector("#diary-input");
const saveDiaryButton = document.querySelector("#save-diary-button");
const diaryDateElement = document.querySelector("#diary-date");
const viewDiaryButton = document.querySelector("#view-diary-button");
const diaryModal = document.querySelector("#diary-modal");
const closeModalButton = document.querySelector(".close-modal");
const diaryListContainer = document.querySelector("#diary-list-container");

// 현재 날씨
const currentWeatherSection = document.querySelector("#current-weather");
const currentCityElement = document.querySelector("#current-weather h2");
const weatherIcon = document.querySelector("#weather-icon");
const temperature = document.querySelector("#temperature");
const weatherDescription = document.querySelector("#weather-description");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");

// 5일 예보
const forecastCardsContainer = document.querySelector("#forecast-cards");

// 단위 전환 버튼
const unitToggleButton = document.querySelector("#unit-toggle-button");

// 최근 검색어
const recentSearchList = document.querySelector("#recent-search-list");


/* --- 3. 이벤트 리스너 설정 --- */
searchButton.addEventListener("click", () => {
    handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// 1. '일기 모아보기' 버튼 클릭 시 모달 열기
viewDiaryButton.addEventListener("click", () => {
    renderDiaryList(); // 목록 그리기 함수 호출
    diaryModal.style.display = "block"; // 모달 보이기
});

// 2. 'X' 버튼 클릭 시 모달 닫기
closeModalButton.addEventListener("click", () => {
    diaryModal.style.display = "none";
});

// 3. 모달 바깥 배경 클릭 시 닫기
window.addEventListener("click", (event) => {
    if (event.target === diaryModal) {
        diaryModal.style.display = "none";
    }
});

// 과제 4 (필수 기능): 단위 전환
unitToggleButton.addEventListener("click", () => {
    // 단위 토글
    currentUnit = currentUnit === "metric" ? "imperial" : "metric";
    
    // 버튼 텍스트 변경
    unitToggleButton.textContent = currentUnit === "metric" 
        ? "화씨(°F)로 변경" 
        : "섭씨(°C)로 변경";

    // 현재 도시 날씨 정보가 있으면, 해당 도시의 날씨를 새 단위로 다시 불러오기
    if (currentCity) {
        fetchWeatherData(currentCity);
    }
});

saveDiaryButton.addEventListener("click", () => {
    saveDiary();
    alert("일기가 저장되었습니다!"); // 저장 확인 알림
});

// 페이지 로드 시 최근 검색어 불러오기
document.addEventListener("DOMContentLoaded", () => {
    loadRecentSearches();
    renderRecentSearches();

    loadDiary();
});


/* --- 4. 함수 정의 --- */

/**
 * 검색 버튼 클릭 또는 Enter 시 호출되는 함수
 */
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
        cityInput.value = ""; // 검색 후 입력창 비우기
    } else {
        showError("도시 이름을 입력하세요.");
    }
}

/**
 * 주 기능: 도시 이름으로 현재 날씨와 예보 데이터를 가져옵니다.
 */
async function fetchWeatherData(city) {
    hideError();
    
    // API URL에 현재 단위(currentUnit) 적용
    const currentWeatherUrl = `/api/weather?city=${city}&unit=${currentUnit}`;

    try {
        const response = await fetch(currentWeatherUrl);
        if (!response.ok) {
            throw new Error("도시를 찾을 수 없습니다. (예: seoul)");
        }
        const data = await response.json();

        // 1. 현재 날씨 표시
        displayWeather(data);

        // 2. 5일 예보 데이터 가져오기 (단위 포함)
        await fetchForecastData(city, currentUnit);

        // 3. (중요) 성공적으로 검색된 도시 이름을 'currentCity'에 저장
        currentCity = data.name; 

        // 4. (중요) 성공 시 최근 검색어에 저장
        saveSearch(data.name);

    } catch (error) {
        handleError(error);
    }
}

/**
 * 5일 예보 데이터를 가져옵니다.
 */
async function fetchForecastData(city, unit) {
    const forecastUrl = `/api/forecast?city=${city}&unit=${unit}`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) {
            throw new Error("예보 데이터를 가져오는 데 실패했습니다.");
        }
        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        handleError(error); // 예보 오류는 개별적으로 처리
        console.error("예보 오류:", error);
    }
}

/**
 * 받아온 현재 날씨 데이터를 DOM에 표시합니다.
 */
function displayWeather(data) {
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    const windUnit = currentUnit === "metric" ? "m/s" : "mph";
    
    // (수정) 날씨 메인 상태 (Clear, Clouds 등)
    const weatherMain = data.weather[0].main;

    currentCityElement.textContent = `현재 날씨 (${data.name})`;
    temperature.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
    weatherDescription.textContent = refineDescription(data.weather[0].description);
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;

    const windSpeedSpan = windSpeed.nextElementSibling;
    if (!windSpeedSpan) {
        windSpeed.insertAdjacentHTML('afterend', `<span id="wind-unit"> ${windUnit}</span>`);
    } else {
        windSpeedSpan.textContent = ` ${windUnit}`;
    }

    // (수정) OpenWeatherMap 아이콘 대신 로컬 아이콘 경로 사용
    // const iconCode = data.weather[0].icon; (기존 코드)
    // weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; (기존 코드)
    weatherIcon.src = getWeatherIconPath(weatherMain); // (새 코드)
    weatherIcon.alt = data.weather[0].description;

    currentWeatherSection.style.display = "block";
    
}

/**
 * 5일 예보 데이터를 DOM에 표시합니다.
 */
function displayForecast(forecastList) {
    forecastCardsContainer.innerHTML = "";
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";

    const dailyForecasts = forecastList.filter(item => 
        item.dt_txt.includes("12:00:00")
    );

    let forecastsToShow = dailyForecasts;
    if (dailyForecasts.length === 0) {
        forecastsToShow = forecastList.filter((_, index) => index % 8 === 0);
    }
    
    forecastsToShow = forecastsToShow.slice(0, 5);

    forecastsToShow.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const formattedDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
        const temp = Math.round(forecast.main.temp);
        
        // (수정) 날씨 메인 상태 (Clear, Clouds 등)
        const weatherMain = forecast.weather[0].main;
        // (수정) 로컬 아이콘 경로 가져오기
        const iconPath = getWeatherIconPath(weatherMain);

        // const iconCode = forecast.weather[0].icon; (기존 코드)

        const cardHTML = `
            <div class="forecast-card-item">
                <div class="date">${formattedDate}</div>
                
                <img src="${iconPath}" alt="${forecast.weather[0].description}">
                
                <div class="temp">${temp}${unitSymbol}</div>
                <div class="desc">${refineDescription(forecast.weather[0].description)}</div>
            </div>
        `;
        forecastCardsContainer.innerHTML += cardHTML;
    });
}

/* --- 5. localStorage 관련 함수 --- */

/**
 * 과제 4 (필수 기능): 최근 검색어 저장 (localStorage)
 */
function saveSearch(city) {
    // 중복 제거 (대소문자 무시)
    const lowerCaseCity = city.toLowerCase();
    recentSearches = recentSearches.filter(c => c.toLowerCase() !== lowerCaseCity);

    // 맨 앞에 추가
    recentSearches.unshift(city);

    // 과제 4: 최대 5개
    if (recentSearches.length > 5) {
        recentSearches = recentSearches.slice(0, 5);
    }

    // localStorage에 저장
    localStorage.setItem("weatherRecentSearches", JSON.stringify(recentSearches));

    // 화면 렌더링
    renderRecentSearches();
}

/**
 * localStorage에서 최근 검색어 불러오기
 */
function loadRecentSearches() {
    const savedSearches = localStorage.getItem("weatherRecentSearches");
    if (savedSearches) {
        recentSearches = JSON.parse(savedSearches);
    }
}

/**
 * 최근 검색어 배열을 기반으로 버튼 리스트 생성
 * 과제 4 (필수 기능): 페이지 로드 시 버튼 리스트 생성
 */
function renderRecentSearches() {
    recentSearchList.innerHTML = ""; // 기존 버튼 삭제
    recentSearches.forEach(city => {
        const button = document.createElement("button");
        button.textContent = city;
        
        // 최근 검색어 버튼 클릭 시 해당 도시 날씨 검색
        button.addEventListener("click", () => {
            fetchWeatherData(city);
        });
        
        recentSearchList.appendChild(button);
    });
}


/* --- 6. 오류 처리 함수 --- */

function handleError(error) {
    console.error("오류 발생:", error);
    showError(error.message);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    currentWeatherSection.style.display = "none";
    forecastCardsContainer.innerHTML = "";
}

function hideError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

/* --- 7. (추가) 날씨 상태를 로컬 아이콘 경로로 변환하는 함수 --- */

/**
 * 날씨 상태(weatherMain)를 기반으로
 * 사용할 로컬 이미지 아이콘의 경로를 반환합니다.
 */
function getWeatherIconPath(weatherMain) {
    // 기본 아이콘 (경로가 없는 경우 대비)
    let iconPath = "./image/cloudy.png"; 

    switch (weatherMain) {
        case "Clear":
            iconPath = "./image/sunny.png";
            break;
        case "Clouds":
            iconPath = "./image/cloudy.png";
            break;
        case "Rain":
        case "Drizzle":
            iconPath = "./image/rainy.png";
            break;
        case "Snow":
            iconPath = "./image/snowy.png";
            break;
        case "Mist":
        case "Fog":
        case "Haze":
            iconPath = "./image/misty.png";
            break;
        default:
            // 기타 (기본값인 cloudy.png 사용)
            break;
    }
    return iconPath;
}

function refineDescription(description) {
    const dictionary = {
        "실 비": "가랑비",
        "박무": "옅은 안개",
        "온흐림": "흐림",
        "튼구름": "구름 많음",  // (추천) 자주 나오는 어색한 표현 추가
        "약한 비": "비 조금",    // (추천) 자주 나오는 어색한 표현 추가
        "약간의 구름이 낀 하늘": "구름 조금"
    };

    // 사전에 있는 단어면 교체하고, 없으면 원래 단어 그대로 반환
    return dictionary[description] || description;
}


/**
 * 오늘의 날짜를 키(Key)로 사용하여 일기를 저장합니다.
 */
function saveDiary() {
    const todayKey = getTodayKey(); // 오늘 날짜 키 생성 (예: diary-2023-10-25)
    const content = diaryInput.value;
    
    // 내용이 있으면 저장, 비었으면 삭제
    if (content.trim()) {
        localStorage.setItem(todayKey, content);
    } else {
        localStorage.removeItem(todayKey);
    }
}

/**
 * 저장된 일기가 있다면 불러와서 화면에 보여줍니다.
 */
function loadDiary() {
    const todayKey = getTodayKey();
    const savedContent = localStorage.getItem(todayKey);
    
    // 날짜 표시
    const today = new Date();
    diaryDateElement.textContent = `${today.getMonth() + 1}월 ${today.getDate()}일의 기록`;

    // 저장된 내용이 있으면 입력창에 채워넣기
    if (savedContent) {
        diaryInput.value = savedContent;
    }
}

/**
 * 오늘 날짜를 "diary-YYYY-MM-DD" 형태의 문자열로 반환하는 도우미 함수
 * 날짜별로 일기를 따로 저장하기 위해 필요합니다.
 */
function getTodayKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `diary-${year}-${month}-${day}`;
}

/**
 * 저장된 모든 일기를 불러와 모달창 목록에 표시합니다.
 */
function renderDiaryList() {
    diaryListContainer.innerHTML = ""; // 목록 초기화

    // localStorage의 모든 키를 가져옴
    const keys = Object.keys(localStorage);
    
    // 'diary-'로 시작하는 키만 필터링하고, 날짜 내림차순(최신순) 정렬
    const diaryKeys = keys.filter(key => key.startsWith("diary-")).sort().reverse();

    if (diaryKeys.length === 0) {
        diaryListContainer.innerHTML = "<div class='no-diary'>저장된 일기가 없습니다.</div>";
        return;
    }

    // 각 일기를 HTML로 만들어서 추가
    diaryKeys.forEach(key => {
        const content = localStorage.getItem(key);
        const dateStr = key.replace("diary-", ""); // 'diary-2023-12-07' -> '2023-12-07'
        
        const entryDiv = document.createElement("div");
        entryDiv.className = "diary-entry";
        entryDiv.innerHTML = `
            <h4>📅 ${dateStr}</h4>
            <p>${content}</p>
        `;
        diaryListContainer.appendChild(entryDiv);
    });
}
