// Модуль работы с хранилищем
const Storage = {
    // Загрузить прогресс игрока
    loadPlayerProgress() {
        const name = Game.playerName.trim();
        if (!name) {
            Game.unlockedLevels = 1;
            Game.currentLevel = 1;
            return;
        }

        if (name.toLowerCase() === "helen viktorovna") {
            Game.unlockedLevels = 3;
            Game.currentLevel = 1;         
            document.querySelectorAll('.level-select-btn').forEach(btn => {
                btn.disabled = false;
            });
            return;
        }
        
        const progressData = JSON.parse(localStorage.getItem('dressupPlayerProgress') || '{}');
        
        if (progressData[name]) {
            const playerProgress = progressData[name];
            Game.unlockedLevels = playerProgress.unlockedLevels || 1;
            
            if (Game.currentLevel > Game.unlockedLevels) {
                Game.currentLevel = Game.unlockedLevels;
            }
        } else {
            Game.unlockedLevels = 1;
            Game.currentLevel = 1;
            this.savePlayerProgress();
        }
    },
    
    // Сохранить прогресс игрока
    savePlayerProgress() {
        const name = Game.playerName.trim();
        if (!name) return;
        
        const progressData = JSON.parse(localStorage.getItem('dressupPlayerProgress') || '{}');
        
        progressData[name] = {
            unlockedLevels: Game.unlockedLevels,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem('dressupPlayerProgress', JSON.stringify(progressData));
        Game.updateLevelButtons();
    },
    
    // Загрузить рейтинг
    loadScores() {
        const savedScores = JSON.parse(localStorage.getItem('dressupScores') || '[]');
        
        // Удаляем дубликаты при загрузке (защита)
        const uniqueScores = [];
        const seenNames = new Set();
        
        savedScores.forEach(score => {
            if (!seenNames.has(score.name)) {
                seenNames.add(score.name);
                uniqueScores.push(score);
            }
        });
        
        Game.scores = uniqueScores;
    },
    
      saveScore() {
        // Загружаем текущие результаты
        const savedScores = JSON.parse(localStorage.getItem('dressupScores') || '[]');
        
        // Ищем существующий результат игрока
        const existingScoreIndex = savedScores.findIndex(s => s.name === Game.playerName);
        
        if (existingScoreIndex !== -1) {
            // Игрок уже есть в рейтинге - обновляем если новый результат лучше
            if (Game.score > savedScores[existingScoreIndex].score) {
                savedScores[existingScoreIndex] = {
                    name: Game.playerName,
                    score: Game.score,
                    level: Game.currentLevel,
                    date: new Date().toLocaleDateString('ru-RU')
                };
            }
        } else {
            // Добавляем нового игрока
            savedScores.push({
                name: Game.playerName,
                score: Game.score,
                level: Game.currentLevel,
                date: new Date().toLocaleDateString('ru-RU')
            });
        }
        
        // Сортируем по убыванию очков
        savedScores.sort((a, b) => b.score - a.score);
        
        // Оставляем только топ-10
        const topScores = savedScores.slice(0, 10);
        
        // Сохраняем в localStorage
        localStorage.setItem('dressupScores', JSON.stringify(topScores));
        
        // Обновляем глобальный массив
        Game.scores = topScores;
    }
};