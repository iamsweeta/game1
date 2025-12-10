// Основной игровой объект - конфигурация и инициализация
const Game = {
    // Конфигурация
    playerName: "",
    selectedDoll: "1",
    currentLevel: 1,
    unlockedLevels: 1,
    score: 0,
    timeLeft: 120,
    timerInterval: null,
    
    // Одежда на кукле
    clothesOnDoll: [],
    
    clothingTypes: {
            dress: {
                category: 'clothing',
                season: 'summer',
                nameTemplate: 'Летнее платье'
            },
            coat: {
                category: 'clothing',
                season: 'winter',
                nameTemplate: 'Зимнее пальто'
            }
        },

    // Категории одежды
    clothingCategories: {
        footwear: ['boots', 'sandals', 'redboots', 'goldboots'],
        clothing: ['dress', 'coat', 'reddress', 'redcoat','whitecoat', 'pinkdress']
    },
    
    // Настройки размеров для каждой картинки
    imageSettings: {
        dolls: {
            1: { image: "images/doll1.png", width: "100%", height: "100%" },
            2: { image: "images/doll2.png", width: "100%", height: "100%" },
            3: { image: "images/doll3.png", width: "100%", height: "100%" }
        },
        wardrobe: { image: "images/wardrobe.png", width: "100%", height: "100%" },
        clothes: {
            boots: { 
                image: "images/boots.png", 
                name: "Сапоги",
                type: "boots", 
                category: "footwear",
                season: "winter",
                dollSize: { width: "70px", height: "auto", bottom: "-1px", left: "120px" },
                wardrobeSize: { width: "70px", height: "auto", top: "150px", left: "50px" },
                zIndex: 5
            },
            sandals: { 
                image: "images/sandals.png", 
                name: "Сандали",
                type: "sandals", 
                category: "footwear",
                season: "summer",
                dollSize: { width: "50px", height: "auto", bottom: "-1px", left: "118px" },
                wardrobeSize: { width: "30px", height: "auto", top: "250px", left: "150px" },
                zIndex: 5
            },
            goldboots: { 
                image: "images/goldboots.png", 
                name: "Сандали",
                type: "goldboots", 
                category: "footwear",
                season: "summer",
                dollSize: { width: "41px", height: "auto", bottom: "-1px", left: "118px" },
                wardrobeSize: { width: "30px", height: "auto", top: "250px", left: "150px" },
                zIndex: 5
            },
            redboots: { 
                image: "images/redboots.png", 
                name: "Сапоги",
                type: "redboots", 
                category: "footwear",
                season: "winter",
                dollSize: { width: "62px", height: "auto", bottom: "-1px", left: "118px" },
                wardrobeSize: { width: "30px", height: "auto", top: "250px", left: "150px" },
                zIndex: 5
            },
            dress: { 
                image: "images/dress.png", 
                name: "Летнее платье",
                type: "dress", 
                category: "clothing",
                season: "summer",
                dollSize: { width: "205px", height: "auto", top: "75px", left: "120px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "50px" },
                zIndex: 15
            },
            pinkdress: { 
                image: "images/pinkdress.png", 
                name: "Летнее платье",
                type: "pinkdress", 
                category: "clothing",
                season: "summer",
                dollSize: { width: "275px", height: "auto", top: "75px", left: "120px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "50px" },
                zIndex: 15
            },
            reddress: { 
                image: "images/red.png", 
                name: "Красное платье",
                type: "reddress", 
                category: "clothing",
                season: "summer",
                dollSize: { width: "117px", height: "auto", top: "90px", left: "100px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "50px" },
                zIndex: 15
            },
            coat: { 
                image: "images/coat.png", 
                name: "Зимняя шуба",
                type: "coat", 
                category: "clothing",
                season: "winter",
                dollSize: { width: "200px", height: "auto", top: "50px", left: "120px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "150px" },
                zIndex: 15
            },
            redcoat: { 
                image: "images/redcoat.png", 
                name: "Зимняя шуба",
                type: "redcoat", 
                category: "clothing",
                season: "winter",
                dollSize: { width: "130px", height: "auto", top: "50px", left: "120px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "150px" },
                zIndex: 15
            },
            whitecoat:  { 
                image: "images/whitecoat.png", 
                name: "Зимняя шуба",
                type: "whitecoat", 
                category: "clothing",
                season: "winter",
                dollSize: { width: "130px", height: "auto", top: "50px", left: "120px" },
                wardrobeSize: { width: "80px", height: "80px", top: "50px", left: "150px" },
                zIndex: 15
            }
        }
    },
    
    selectedDifficulty: "easy", // easy, medium, hard
    
    levelTimes: {
        // Теперь время зависит от сложности
        easy: {
            1: 60,   // 1 минута
            2: 60,   // 1 минута
            3: 60    // 1 минута
        },
        medium: {
            1: 30,   // 30 секунд
            2: 30,   // 30 секунд
            3: 30    // 30 секунд
        },
        hard: {
            1: 10,   // 10 секунд
            2: 10,   // 10 секунд
            3: 10    // 10 секунд
        }
    },
    
    // Задания для уровней
    tasks: {
    1: [
        { 
            id: 1, 
            text: "любой наряд на ваш вкус", 
            correctTypes: ["summer", "winter"],
        }
    ],
    2: [
        { id: 2, text: "образ с летней обувью", correctTypes: ["sandals", "goldboots"] },
        { id: 3, text: "образ с платьем", correctTypes: ["dress", "reddress", "pinkdress"] },
        { id: 4, text: "образ с зимней обувью", correctTypes: ["boots", "redboots"] },
        { id: 5, text: "образ с зимним пальто", correctTypes: ["coat", "redcoat", "whitecoat"] }
    ],
    3: [
        { id: 6, text: "летне-зимний образ", correctTypes: ["summer", "winter"] },
        { id: 7, text: "летний образ с золотыми туфлями из базового гардероба", correctTypes: ["goldboots", "summer"] },
        { id: 8, text: "зимний образ с красными сапогами из базового гардероба", correctTypes: ["redboots", "winter"] },
        { id: 9, text: "зимний образ с красным пальто из базового гардероба", correctTypes: ["redcoat", "winter"] },
        { id: 10, text: "летний образ зелеными туфлями из базового гардероба", correctTypes: ["sandals", "summer"] },

    ]
    
},
    // Текущее задание
    currentTask: null,
    
    // Рейтинг
    scores: [],
    
    // Инициализация
    init() {
        Storage.loadScores();
        Storage.loadPlayerProgress();
        this.setupEvents();
        GameLogic.updateLevelButtons();
        GameLogic.updateDifficultyButtons(); 
        GameLogic.updateStartButtonState();
        UI.setupMagicEffects();
        Drawing.init();
        Storage.loadCustomClothes();
    }
};