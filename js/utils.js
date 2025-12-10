// Утилиты и инициализация
const Utils = {
    // Инициализация при загрузке
    init() {
        // Экспортируем методы в глобальный объект Game для обратной совместимости
        Game.setupEvents = GameLogic.setupEvents;
        Game.updateLevelButtons = GameLogic.updateLevelButtons;
        Game.updateStartButtonState = GameLogic.updateStartButtonState;
        Game.startGame = GameLogic.startGame;
        Game.showScores = GameLogic.showScores;
        Game.clearSessionClothes = Drawing.clearSessionClothes;
        Game.getSessionClothesCount = Drawing.getSessionClothesCount;
        Game.quitToMenu = GameLogic.quitToMenu;
        Game.checkTask = GameLogic.checkTask;
        Game.startTimer = GameLogic.startTimer;
        Game.formatTime = GameLogic.formatTime;
        Game.endGame = GameLogic.endGame;
        Game.nextLevel = GameLogic.nextLevel;
        Game.restartLevel = GameLogic.restartLevel;
        Game.initLevel = GameLogic.initLevel;
        Game.createDoll = GameLogic.createDoll;
        Game.loadWardrobe = GameLogic.loadWardrobe;
        Game.setTask = GameLogic.setTask;
        Game.addToDoll = GameLogic.addToDoll;
        Game.removeFromDoll = GameLogic.removeFromDoll;
        Game.clearDoll = GameLogic.clearDoll;
        Game.validatePlayerName = GameLogic.validatePlayerName;
        Game.showPage = UI.showPage;
        Game.createMagicStars = UI.createMagicStars;
        Game.setupMagicEffects = UI.setupMagicEffects;
        Game.showAlert = UI.showAlert;
        Game.loadScores = Storage.loadScores;
        Game.loadPlayerProgress = Storage.loadPlayerProgress;
        Game.savePlayerProgress = Storage.savePlayerProgress;
        Game.saveScore = Storage.saveScore;
        
        // Инициализируем игру
        Game.init();
    }
};

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    Utils.init();
});