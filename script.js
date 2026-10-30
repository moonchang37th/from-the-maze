const startScreen = document.getElementById("start-screen");
const startText = document.getElementById("start-text");
const background = document.getElementById("background");
const nextBackground = document.getElementById("next-background");
const branchScreen = document.getElementById("branch-screen");
const branchChoices = document.getElementById("branch-choices");
const storyText = document.getElementById("story-text");
const continueButton = document.getElementById("continue-button");
const storyContainer = document.getElementById("story-container");
const choices = document.querySelectorAll(".branch-choice");
const typingSpeed = 70;
const choiceInterval = 800;
const backgroundTransitionTime = 2000;

let started = false;
let currentChapter = 1;
let currentChoice = 0;

let typingTimer = null;
let choiceTimer = null;
let isTyping = false;

// 배경 스토리 연결
const chapters = {
    1: {background: "image/bifurcation12.png",
        stories: chapter1Choices},

    2: {background: "image/Chapter2.png",
        bifurcation: "image/bifurcation12.png",
        stories: chapter2Choices},

    3: {background: "image/Chapter3.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter3Choices},

    4: {background: "image/Chapter4.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter4Choices},

    5: {background: "image/Chapter5.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter5Choices},

    6: {background: "image/Chapter6.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter6Choices},

    7: {background: "image/Chapter7.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter7Choices},

    8: {background: "image/Chapter8.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter8Choices},

    9: {background: "image/Chapter9.png",
        bifurcation: "image/bifurcation9.png",
        stories: chapter9Choices}
};

// 게임 시작
startScreen.addEventListener("click", async () => {
    if (started) return;

    started = true;

    // 전체 화면 전환
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (error) {
        console.log("전체 화면 전환이 취소되었거나 지원되지 않습니다.");}

    startText.classList.add("disappear");

    setTimeout(() => {
        startScreen.style.display = "none";
        nextBackground.style.opacity = "1";

        // Chapter 1 배경 표시 후 분기점 전환
        setTimeout(() => {
            background.style.backgroundImage =
            `url("${chapters[1].bifurcation || chapters[1].background}")`;

            background.style.opacity = "1";
            nextBackground.style.opacity = "0";

            showChapterChoices();
        }, 3000);

    }, 3000);
});

// 현재 챕터 선택지 표시
function showChapterChoices() {
    clearTimeout(choiceTimer);

    currentChoice = 0;

    // 현재 챕터의 선택지 문구 적용
    const storyKeys = Object.keys(chapters[currentChapter].stories);

    choices.forEach((choice, index) => {
        choice.classList.remove("show");

        if (storyKeys[index]) {
            choice.textContent = storyKeys[index];
            choice.style.display = "";
        } else {
            choice.style.display = "none";
        }
    });

    background.style.backgroundImage =
    `url("${chapters[currentChapter].bifurcation || chapters[currentChapter].background}")`;

    storyContainer.classList.add("hidden");
    continueButton.classList.add("hidden");

    branchChoices.classList.remove("hidden");
    branchScreen.classList.remove("hidden");

    requestAnimationFrame(() => {
        branchScreen.classList.add("visible");
    });

    choiceTimer = setTimeout(showNextChoice, 600);
}

function showNextChoice() {
    if (currentChoice >= choices.length) return;

    const choice = choices[currentChoice];

    if (choice.style.display === "none") {
        currentChoice++;
        choiceTimer = setTimeout(showNextChoice, choiceInterval);
        return;}

    choice.classList.add("show");
    currentChoice++;

    choiceTimer = setTimeout(showNextChoice, choiceInterval);
}

branchChoices.addEventListener("click", (event) => {
    const choice = event.target.closest(".branch-choice");

    if (!choice || !branchChoices.contains(choice)) return;
    if (choice.style.display === "none") return;

    const selectedText = choice.textContent.trim();
    const currentStories = chapters[currentChapter].stories;
    const story = currentStories[selectedText];

    if (!story) return;

    // 선택지 등장 타이머 정리
    clearTimeout(choiceTimer);

    // 기존 타이핑 정리
    clearInterval(typingTimer);
    isTyping = false;

    // 선택지 숨기기
    branchChoices.classList.add("hidden");

    // 이야기 영역 초기화 및 표시
    storyContainer.classList.remove("hidden");
    continueButton.classList.add("hidden");

    storyText.innerHTML = `
        <span id="story-heading"></span>
        <span id="story-body"></span>
    `;
    storyText.scrollTop = 0;

    const heading = storyText.querySelector("#story-heading");
    const body = storyText.querySelector("#story-body");

    const lines = story.split("\n");
    const firstLine = lines[0];
    const remainingText = lines.slice(1).join("\n");

    let index = 0;
    let target = heading;
    let text = firstLine;

    isTyping = true;

    // 타이핑 효과
    typingTimer = setInterval(() => {
        if (index < text.length) {
            target.textContent += text[index];
            index++;
            
            return;
        }

        // 제목을 다 출력하면 본문 출력
        if (target === heading) {
            target = body;
            text = remainingText;
            index = 0;

            if (text.length === 0) {
                clearInterval(typingTimer);
                isTyping = false;
                continueButton.classList.remove("hidden");
            }

            return;
        }

        // 본문까지 출력 완료
        clearInterval(typingTimer);
        isTyping = false;

        continueButton.classList.remove("hidden");

    }, typingSpeed);
});

continueButton.addEventListener("click", () => {
    if (isTyping) return;

    // Chapter 9 마지막
    if (currentChapter >= 9) {
        return;
    }

    goToNextChapter();
});

// 다음 챕터 전환
function goToNextChapter() {
    const nextChapterNumber = currentChapter + 1;
    const nextChapter = chapters[nextChapterNumber];

    if (!nextChapter) return;

    clearTimeout(choiceTimer);
    clearInterval(typingTimer);

    continueButton.classList.add("hidden");

// 컨테이너 사라지게
    storyContainer.style.transition = "opacity 1.5s ease";
    storyContainer.style.opacity = "0";

    setTimeout(() => {
        nextBackground.style.backgroundImage =
            `url("${nextChapter.background}")`;

        nextBackground.style.opacity = "0";

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                nextBackground.style.opacity = "1";
            });
        });

        setTimeout(() => {
            currentChapter = nextChapterNumber;

            background.style.backgroundImage =
            `url("${nextChapter.bifurcation || nextChapter.background}")`;

            background.style.opacity = "1";
            nextBackground.style.opacity = "0";

            // 컨테이너 초기화
            storyContainer.style.transition = "";
            storyContainer.style.opacity = "";

            showChapterChoices();
        }, backgroundTransitionTime);
    }, 1000);
}
