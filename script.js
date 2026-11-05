const startScreen = document.getElementById("start-screen"); 
const startText = document.getElementById("start-text");
const background = document.getElementById("background");
const nextBackground = document.getElementById("next-background");
const branchScreen = document.getElementById("branch-screen");
const branchChoices = document.getElementById("branch-choices");
const storyHeading = document.getElementById("story-heading");
const storyBody = document.getElementById("story-body");
const storyContent = document.getElementById("story-content");
const storyText = document.getElementById("story-text");
const continueButton = document.getElementById("continue-button");
const restartButton = document.getElementById("restart-button");
const storyContainer = document.getElementById("story-container");
const choices = document.querySelectorAll(".branch-choice");

const typingSpeed = 70;
const choiceInterval = 800;
const backgroundTransitionTime = 2000;
const selectedChoices = [];

let started = false;
let currentChapter = 1;
let currentChoice = 0;

let typingTimer = null;
let choiceTimer = null;
let isTyping = false;

// 현재 출력 중인 이야기 저장
let currentFullStory = {
    heading: "",
    body: ""
};

// 배경 스토리 연결
const chapters = {
    1: {
        background: "image/bifurcation12.png",
        stories: chapter1Choices
    },

    2: {
        background: "image/Chapter2.png",
        bifurcation: "image/bifurcation12.png",
        stories: chapter2Choices
    },

    3: {
        background: "image/Chapter3.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter3Choices
    },

    4: {
        background: "image/Chapter4.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter4Choices
    },

    5: {
        background: "image/Chapter5.png",
        bifurcation: "image/bifurcation345.png",
        stories: chapter5Choices
    },

    6: {
        background: "image/Chapter6.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter6Choices
    },

    7: {
        background: "image/Chapter7.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter7Choices
    },

    8: {
        background: "image/Chapter8.png",
        bifurcation: "image/bifurcation678.png",
        stories: chapter8Choices
    },

    9: {
        background: "image/Chapter9.png",
        bifurcation: "image/bifurcation9.png",
        stories: chapter9Choices
    }
};

// 게임 시작
startScreen.addEventListener("click", async () => {
    if (started) return;

    started = true;

    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (error) {
        console.log("전체 화면 전환이 취소되었거나 지원되지 않습니다.");
    }

    startText.classList.add("disappear");

    setTimeout(() => {
        startScreen.style.display = "none";
        nextBackground.style.opacity = "1";

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
    restartButton.classList.add("hidden");

    storyHeading.textContent = "";
    storyText.textContent = "";

    branchChoices.style.display = "";
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
        return;
    }

    choice.classList.add("show");
    currentChoice++;

    choiceTimer = setTimeout(showNextChoice, choiceInterval);
}

// 선택지 클릭
branchChoices.addEventListener("click", (event) => {
    const choice = event.target.closest(".branch-choice");

    if (!choice || !branchChoices.contains(choice)) return;
    if (choice.style.display === "none") return;

    const selectedText = choice.textContent.trim();

    const currentStories = chapters[currentChapter].stories;
    const story = currentStories[selectedText];

    if (!story) return;

    // 선택 기록
    const lines = story.split("\n");

    selectedChoices.push({
    chapter: currentChapter,
    text: selectedText,
    heading: lines[0],
    body: lines.slice(1).join("\n")
    });

    clearTimeout(choiceTimer);
    clearInterval(typingTimer);
    isTyping = false;

    branchChoices.classList.add("hidden");

    storyContainer.classList.remove("hidden");
    continueButton.classList.add("hidden");
    restartButton.classList.add("hidden");

    storyHeading.textContent = "";
    storyText.textContent = "";
    storyBody.scrollTop = 0;

    const firstLine = lines[0];
    const remainingText = lines.slice(1).join("\n");

    currentFullStory.heading = firstLine;
    currentFullStory.body = remainingText;

    let index = 0;
    let target = storyHeading;
    let text = firstLine;

    isTyping = true;

    // 타이핑 효과
    typingTimer = setInterval(() => {
        if (index < text.length) {
            target.textContent += text[index];
            index++;
            return;
        }

        // 제목 출력 완료 후 본문 출력
        if (target === storyHeading) {
            target = storyText;
            text = remainingText;
            index = 0;

            if (text.length === 0) {
                clearInterval(typingTimer);
                isTyping = false;
                continueButton.classList.remove("hidden");
            }

            return;
        }

        // 본문 출력 완료
        clearInterval(typingTimer);
        isTyping = false;

        continueButton.classList.remove("hidden");

    }, typingSpeed);
});

// 이야기 영역 클릭 시 타이핑 즉시 완료
storyContainer.addEventListener("click", (event) => {
    if (!isTyping) return;
    if (event.target.closest("#continue-button")) return;
    if (event.target.closest("#restart-button")) return;

    clearInterval(typingTimer);

    storyHeading.textContent = currentFullStory.heading;
    storyText.textContent = currentFullStory.body;

    storyBody.scrollTop = 0;

    isTyping = false;
    continueButton.classList.remove("hidden");
});

// 계속하기
continueButton.addEventListener("click", () => {
    if (isTyping) return;

    if (currentChapter >= 9) {
        showEnding();
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

            storyContainer.style.transition = "";
            storyContainer.style.opacity = "";

            showChapterChoices();
        }, backgroundTransitionTime);

    }, 1000);
}

// 엔딩 화면 표시
function showEnding() {
    clearTimeout(choiceTimer);
    clearInterval(typingTimer);
    isTyping = false;

    branchChoices.style.display = "none";
    continueButton.classList.add("hidden");

    storyHeading.textContent = "END. 당신이 선택한 이야기";

    storyContent.replaceChildren();

    const endingList = document.createElement("div");
    endingList.id = "ending-list";

    selectedChoices.forEach((choice) => {
        const item = document.createElement("details");
        item.className = "ending-item";

        const summary = document.createElement("summary");
        summary.textContent =
            `Chapter ${choice.chapter}. ${choice.text}`;

        const content = document.createElement("div");
        content.className = "ending-story";

        const heading = document.createElement("p");
        heading.className = "ending-story-heading";
        heading.textContent = choice.heading;

        const body = document.createElement("p");
        body.className = "ending-story-body";
        body.textContent = choice.body;

        content.appendChild(heading);
        content.appendChild(body);

        item.appendChild(summary);
        item.appendChild(content);

        endingList.appendChild(item);
    });

    storyContent.appendChild(endingList);

    storyBody.scrollTop = 0;
    storyContainer.style.opacity = "1";

    restartButton.classList.remove("hidden");
}

// 다시 시작하기
restartButton.addEventListener("click", () => {
    location.reload();
});

/* 엔딩 선택지 목록 */
#ending-list {
    width: fit-content;
    max-width: 100%;
    text-align: left;
}

/* 접히는 항목 */
.ending-item {
    margin: 14px 0;
    color: white;
    font-family: "BookkLight";
    font-size: 20px;
    line-height: 1.8;
}

/* 화살표와 선택지 */
.ending-item summary {
    cursor: pointer;
    list-style: none;
    transition: color 0.2s ease;
}

.ending-item summary::-webkit-details-marker {
    display: none;
}

.ending-item summary::before {
    content: "›";
    display: inline-block;
    margin-right: 12px;
    transition: transform 0.2s ease;
}

.ending-item[open] summary::before {
    transform: rotate(90deg);
}

.ending-item summary:hover {
    color: #cbd9c2;
}

/* 펼쳐지는 본문 */
.ending-story {
    padding: 12px 0 8px 28px;
}

.ending-story-heading {
    margin: 0 0 12px;
    font-family: "Paperlogy";
    color: #cbd9c2;
}

.ending-story-body {
    margin: 0;
    white-space: pre-line;
    word-break: keep-all;
    overflow-wrap: break-word;
}
