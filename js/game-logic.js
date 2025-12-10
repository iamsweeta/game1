// Модуль игровой логики
const GameLogic = {
    // Настроить события
    setupEvents() {
        // Выбор куклы
        document.querySelectorAll('.doll-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.doll-option').forEach(o => {
                    o.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                Game.selectedDoll = e.currentTarget.dataset.doll;
            });
        });
        
        // Кнопка рисования на кукле
        const drawButton = document.getElementById('draw-on-doll-btn');
        if (drawButton) {
            drawButton.addEventListener('click', () => {
                Drawing.showDrawingModal();
            });
        }
        // Выбор уровня в меню
        document.querySelectorAll('.level-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.target.dataset.level);
                if (level <= Game.unlockedLevels) {
                    document.querySelectorAll('.level-select-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    e.target.classList.add('active');
                    Game.currentLevel = level;
                }
            });
        });
        
         document.querySelectorAll('.difficulty-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-select-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                Game.selectedDifficulty = e.target.dataset.difficulty;
            });
        });

        // Имя игрока
        const nameInput = document.getElementById('player-name');
        nameInput.addEventListener('input', (e) => {
            const newName = e.target.value.trim();
            if (newName !== Game.playerName) {
                Game.playerName = newName;
                
                // Загружаем прогресс игрока
                Storage.loadPlayerProgress();
                
                // Очищаем всю пользовательскую одежду при смене имени
                Drawing.clearSessionClothes();
                
                Game.updateLevelButtons();
                Game.updateStartButtonState();
            }
        });
        
        // Кнопки
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('view-scores-btn').addEventListener('click', () => this.showScores());
        document.getElementById('play-again-btn').addEventListener('click', () => UI.showPage('start-page'));
        document.getElementById('back-menu-btn').addEventListener('click', () => UI.showPage('start-page'));
        document.getElementById('quit-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('check-btn').addEventListener('click', () => this.checkTask());
    },
    
    // Обновить кнопки уровней в меню
    updateLevelButtons() {
        document.querySelectorAll('.level-select-btn').forEach(btn => {
            const level = parseInt(btn.dataset.level);
            
            if (level > Game.unlockedLevels) {
                btn.disabled = true;
                btn.classList.remove('active');
            } else {
                btn.disabled = false;
                if (level === Game.currentLevel) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    },

    updateDifficultyButtons() {
        document.querySelectorAll('.difficulty-select-btn').forEach(btn => {
            const difficulty = btn.dataset.difficulty;
            
            if (difficulty === Game.selectedDifficulty) {
                btn.classList.add('active');
            } else {
                //btn.classList.remove('active');
            }
        });
    },
    
    // Проверить имя игрока
    validatePlayerName() {
        return Game.playerName && Game.playerName.trim().length > 1;
    },
    
    // Обновить состояние кнопки "Начать игру"
    updateStartButtonState() {
        const startBtn = document.getElementById('start-game-btn');
        const isValid = this.validatePlayerName();
        
        //startBtn.disabled = !isValid;
        
        if (!isValid) {
            startBtn.style.opacity = '0.6';
            //startBtn.style.cursor = 'not-allowed';
            startBtn.title = 'Введите имя игрока';
        } else {
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
            startBtn.title = '';
        }
    },
    
    // Начать игру
    startGame() {
        if (!this.validatePlayerName()) {
            UI.showAlert("введите ваш ник перед началом игры!");
            document.getElementById('player-name').focus();
            return;
        }
        
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        Game.score = 0;
        Game.clothesOnDoll = [];
        Game.timeLeft = Game.levelTimes[Game.selectedDifficulty][Game.currentLevel];
        
        document.getElementById('current-player').textContent = Game.playerName;
        document.getElementById('current-level').textContent = Game.currentLevel;
        document.getElementById('score').textContent = Game.score;
        document.getElementById('timer').textContent = this.formatTime(Game.timeLeft);
        
        document.getElementById('timer').style.color = '';
        document.getElementById('timer').style.fontWeight = '';
        document.getElementById('timer').style.animation = '';
        
        UI.showPage('game-page');
        this.initLevel();
        this.startTimer();
    },
    
    // Инициализировать уровень
    initLevel() {
        this.createDoll();
        this.clearDoll();
        this.loadWardrobe();
        this.setTask();
    },
    
    // Создать куклу
    createDoll() {
        const doll = document.getElementById('doll');
        doll.innerHTML = '';
        
        const dollBackground = document.createElement('div');
        dollBackground.className = 'doll-background';
        dollBackground.id = 'doll-b'
        
        const dollImg = document.createElement('img');
        const dollSettings = Game.imageSettings.dolls[Game.selectedDoll];
        dollImg.src = dollSettings.image;
        dollImg.alt = `Кукла ${Game.selectedDoll}`;
        dollImg.className = 'doll-bg-img';
        dollImg.style.width = dollSettings.width;
        dollImg.style.height = dollSettings.height;
        
        dollImg.onerror = function() {
            this.style.display = 'none';
            this.parentElement.style.background = '#f5f5f5';
            this.parentElement.innerHTML = '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:20px; color:#999;">Кукла</div>';
        };
        
        dollBackground.appendChild(dollImg);
        doll.appendChild(dollBackground);
        
        doll.addEventListener('dragover', (e) => e.preventDefault());
        doll.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text'));
            
            if (!data.fromDoll) {
                const clothing = Game.imageSettings.clothes[data.imageKey];
                if (clothing) {
                    this.addToDoll(clothing);
                }
            }
        });
    },
    // Загрузить гардероб
    loadWardrobe() {
        const container = document.getElementById('clothes-container');
        container.innerHTML = '';
        
        const allClothesTypes = Object.keys(Game.imageSettings.clothes);
        
        allClothesTypes.forEach(type => {
            const clothing = Game.imageSettings.clothes[type];
            const isOnDoll = Game.clothesOnDoll.some(item => item.type === type);
            
            const item = document.createElement('div');
            item.className = `clothing-item clothing-${clothing.type}`;
            item.draggable = !isOnDoll;
            item.dataset.type = clothing.type;
            item.dataset.category = clothing.category;
            item.dataset.imageKey = type;
            
            const wardrobeSize = clothing.wardrobeSize;
            
            item.style.position = 'absolute';
            if (wardrobeSize.top) item.style.top = wardrobeSize.top;
            if (wardrobeSize.left) item.style.left = wardrobeSize.left;
            if (wardrobeSize.right) item.style.right = wardrobeSize.right;
            if (wardrobeSize.bottom) item.style.bottom = wardrobeSize.bottom;
            item.style.width = wardrobeSize.width;
            item.style.height = wardrobeSize.height;
            item.style.zIndex = clothing.category === 'clothing' ? '15' : '5';
            
            if (isOnDoll) {
                item.style.opacity = '0';
                item.style.pointerEvents = 'none';
            } else {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
            }
            
            item.innerHTML = `
                <div class="clothing-img">
                    <img src="${clothing.image}" alt="${clothing.name}" 
                          object-fit:contain;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%; height:100%; display:flex; align-items:center; justify-content:center;\\'>${clothing.name}</div>'">
                </div>
                <div class="clothing-name" style="position:absolute; bottom:-25px; left:0; right:0; text-align:center; font-size:12px; color:#666;"></div>
            `;
                    
            if (!isOnDoll) {
                item.addEventListener('dragstart', (e) => {
                    e.target.style.opacity = '0';
                    
                    e.dataTransfer.setData('text', JSON.stringify({
                        type: clothing.type,
                        season: clothing.season,
                        category: clothing.category,
                        name: clothing.name,
                        imageKey: type
                    }));
                    
                    document.addEventListener('dragend', function restoreOpacity() {
                        e.target.style.opacity = '1';
                        document.removeEventListener('dragend', restoreOpacity);
                    });
                });
                
                item.addEventListener('dragend', (e) => {
                    e.target.style.opacity = '1';
                });
            }
            
            container.appendChild(item);
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text'));
            if (data.fromDoll) {
                this.removeFromDoll(data.type);
            }
        });
    },
    
    // Установить задание
    setTask() {
        const tasks = Game.tasks[Game.currentLevel];
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        Game.currentTask = randomTask;
        
        document.getElementById('task-text').textContent = randomTask.text;
    },
    
    // Добавить одежду на куклу
    addToDoll(clothing) {
        const hasSameCategory = Game.clothesOnDoll.some(item => {
            return item.category === clothing.category;
        });
        
        if (hasSameCategory) {
            const sameCategoryItem = Game.clothesOnDoll.find(item => item.category === clothing.category);
            if (sameCategoryItem) {
                this.removeFromDoll(sameCategoryItem.type);
            }
        }
        
        const hasSameType = Game.clothesOnDoll.some(item => item.type === clothing.type);
        if (hasSameType) {
            this.removeFromDoll(clothing.type);
        }
        
        Game.clothesOnDoll.push(clothing);
        
        const item = document.createElement('div');
        item.className = `clothing-on-doll clothing-${clothing.type}`;
        item.draggable = true;
        item.dataset.type = clothing.type;
        
        const dollSize = clothing.dollSize;
        const img = document.createElement('img');
        img.src = clothing.image;
        img.alt = clothing.name;
        img.style.width = dollSize.width || 'auto';
        img.style.height = dollSize.height || 'auto';
        img.style.objectFit = 'contain';
        
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.style.background = clothing.season === 'summer' ? '#81C784' : '#64B5F6';
            this.parentElement.style.borderRadius = '5px';
            this.parentElement.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">${clothing.name}</div>`;
        };
        item.appendChild(img);
        item.style.position = 'absolute';
        item.style.width = dollSize.width || 'auto';
        item.style.height = dollSize.height || 'auto';
        item.style.zIndex = clothing.zIndex;
        
        if (dollSize.bottom) {
            item.style.bottom = dollSize.bottom;
        }
        if (dollSize.top) {
            item.style.top = dollSize.top;
        }
        if (dollSize.left) {
            item.style.left = dollSize.left;
        }
        if (dollSize.right) {
            item.style.right = dollSize.right;
        }
        
        if (dollSize.left && !dollSize.right) {
            item.style.transform = 'translateX(-50%)';
        }
        
        item.addEventListener('dragstart', (e) => {
            e.target.style.opacity = '0';
            
            e.dataTransfer.setData('text', JSON.stringify({
                type: clothing.type,
                fromDoll: true,
                imageKey: Object.keys(Game.imageSettings.clothes).find(key => Game.imageSettings.clothes[key] === clothing)
            }));
            
            document.addEventListener('dragend', function restoreOpacity() {
                e.target.style.opacity = '1';
                document.removeEventListener('dragend', restoreOpacity);
            });
        });
        
        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });
        
        document.getElementById('doll').appendChild(item);
        
        setTimeout(() => {
            UI.createMagicStars(item);
        }, 100);
        
        this.loadWardrobe();
    },
    
    // Снять одежду с куклы
    removeFromDoll(type) {
        Game.clothesOnDoll = Game.clothesOnDoll.filter(item => item.type !== type);
        
        const element = document.querySelector(`.clothing-on-doll[data-type="${type}"]`);
        if (element) {
            element.remove();
        }
        
        this.loadWardrobe();
    },
    
    // Очистить куклу
    clearDoll() {
        Game.clothesOnDoll = [];
        const doll = document.getElementById('doll');
        const clothingElements = doll.querySelectorAll('.clothing-on-doll');
        clothingElements.forEach(el => el.remove());
    },
    
    // Проверить задание
checkTask() {
    const task = Game.currentTask;
    let isCorrect = false;
    
    if (Drawing.drawingMode) {
        Drawing.hideDrawingMode();
    }
    
    // Проверка задания в зависимости от ID
    switch(task.id) {
        case 1: // "любой наряд на ваш вкус" - любой сезон
            isCorrect = Game.clothesOnDoll.length > 0;
            break;
            
        case 2: // "образ с летней обувью"
            isCorrect = GameLogic.checkClothingOnDoll(["sandals", "goldboots"], "footwear", "summer");
            break;
            
        case 3: // "образ с платьем"
            isCorrect = GameLogic.checkClothingOnDoll(["dress", "reddress", "pinkdress"], "clothing", "summer");
            break;
            
        case 4: // "образ с зимней обувью"
            isCorrect = GameLogic.checkClothingOnDoll(["boots", "redboots"], "footwear", "winter");
            break;
            
        case 5: // "образ с зимним пальто"
            isCorrect = GameLogic.checkClothingOnDoll(["coat", "redcoat", "whitecoat"], "clothing", "winter");
            break;
            
        case 6: // "летне-зимний образ" - нужна одежда обоих сезонов
            const hasSummer = Game.clothesOnDoll.some(item => item.season === 'summer');
            const hasWinter = Game.clothesOnDoll.some(item => item.season === 'winter');
            isCorrect = hasSummer && hasWinter;
            break;
            
        case 7: // "летний образ с золотыми туфлями"
            const hasGoldBoots7 = GameLogic.checkClothingOnDoll(["goldboots"], "footwear", "summer");
            const hasSummerClothing7 = Game.clothesOnDoll.some(item => 
                item.season === "summer" && item.category === "clothing"
            );
            isCorrect = hasGoldBoots7 && hasSummerClothing7;
            break;
            
        case 8: // "зимний образ с красными сапогами"
            const hasRedBoots = GameLogic.checkClothingOnDoll(["redboots"], "footwear", "winter");
            const hasWinterClothing8 = Game.clothesOnDoll.some(item => 
                item.season === "winter" && item.category === "clothing"
            );
            isCorrect = hasRedBoots && hasWinterClothing8;
            break;
            
        case 9: // "зимний образ с красным пальто"
            const hasRedCoat = GameLogic.checkClothingOnDoll(["redcoat"], "clothing", "winter");
            isCorrect = hasRedCoat;
            break;
            
        case 10: // "летний образ с зелеными туфлями"
            const hasSandals = GameLogic.checkClothingOnDoll(["sandals"], "footwear", "summer");
            const hasSummerClothing10 = Game.clothesOnDoll.some(item => 
                item.season === "summer" && item.category === "clothing"
            );
            isCorrect = hasSandals && hasSummerClothing10;
            break;
            
        default:
            // Стандартная проверка
            if (task.correctTypes && task.correctTypes.length > 0) {
                isCorrect = Game.clothesOnDoll.some(item => 
                    task.correctTypes.includes(item.type)
                );
            }
            break;
    }
    
    if (isCorrect) {
        const basePointsPerLevel = {
            1: 50,   // Уровень 1: 50 очков 
            2: 100,  // Уровень 2: 100 очков
            3: 150   // Уровень 3: 150 очков
        };
        
        const levelBonus = basePointsPerLevel[Game.currentLevel];
        
        // БОНУС ЗА ВРЕМЯ ЗАВИСИТ ОТ СЛОЖНОСТИ
        let maxTimeBonus;
        
        switch(Game.selectedDifficulty) {
            case 'easy':
                maxTimeBonus = 10;
                break;
            case 'medium':
                maxTimeBonus = 30;
                break;
            case 'hard':
                maxTimeBonus = 100;
                break;
            default:
                maxTimeBonus = 10;
        }
        
        // Для задания "любой наряд" уменьшаем бонус за время
        if (task.id === 1) {
            maxTimeBonus = Math.floor(maxTimeBonus / 2); // Вдвое меньше бонуса
        }
        
        // БОНУС ЗА ОСТАВШЕЕСЯ ВРЕМЯ
        const maxTime = Game.levelTimes[Game.selectedDifficulty][Game.currentLevel];
        const timeBonus = Math.round((Game.timeLeft / maxTime) * maxTimeBonus);
        
        // ОБЩИЕ ОЧКИ
        const points = levelBonus + timeBonus;
        
        Game.score += points;
        document.getElementById('score').textContent = Game.score;
        
        if (Game.currentLevel === Game.unlockedLevels && Game.unlockedLevels < 3) {
            Game.unlockedLevels++;
            Storage.savePlayerProgress();
        }
        
        Storage.saveScore();
        
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        const message = Game.currentLevel < 3 
            ? `+${points} очков (${levelBonus} за уровень + ${timeBonus} за время)` 
            : `+${points} очков`;
        
        setTimeout(() => {
            UI.showLevelCompleteModal(true, message, levelBonus, timeBonus);
        }, 5);
        
    } else {
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        setTimeout(() => {
            UI.showLevelCompleteModal(false, "", 0, 0);
        }, 5);
    }
    
},
checkClothingOnDoll(standardTypes, category, season) {
    // Проверяем стандартную одежду
    const hasStandard = Game.clothesOnDoll.some(item => 
        standardTypes.includes(item.type)
    );
    
    // Проверяем пользовательскую одежду соответствующего типа и сезона
    const hasCustom = Game.clothesOnDoll.some(item => 
        item.isCustom && 
        item.category === category && 
        item.season === season
    );
    
    return hasStandard || hasCustom;
},


    // Запустить таймер
    startTimer() {
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
        }
        
        Game.timerInterval = setInterval(() => {
            Game.timeLeft--;
            document.getElementById('timer').textContent = this.formatTime(Game.timeLeft);
            
            if (Game.timeLeft <= 10) {
                document.getElementById('timer').style.color = '#ff3385';
                document.getElementById('timer').style.fontWeight = 'bold';
                document.getElementById('timer').style.animation = 'pulse 1s infinite';
            }
            
            if (Game.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },
    
    // Форматирование времени
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Конец игры по времени
    endGame() {
        this.checkTask();
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        Storage.saveScore();
    },
    
    // Перейти на следующий уровень
    nextLevel() {
        if (Game.currentLevel < 3) {
            Game.currentLevel++;
            Game.timeLeft = Game.levelTimes[Game.selectedDifficulty][Game.currentLevel];
            
            document.getElementById('current-level').textContent = Game.currentLevel;
            document.getElementById('timer').textContent = this.formatTime(Game.timeLeft);
            document.getElementById('score').textContent = Game.score;
            
            this.initLevel();
            this.startTimer();
        }
    },
    
    // Перезапустить текущий уровень
    restartLevel() {
        Game.timeLeft = Game.levelTimes[Game.selectedDifficulty][Game.currentLevel];
        document.getElementById('timer').textContent = this.formatTime(Game.timeLeft);
        
        document.getElementById('timer').style.color = '';
        document.getElementById('timer').style.fontWeight = '';
        document.getElementById('timer').style.animation = '';
        
        this.initLevel();
        
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
        }
        this.startTimer();
    },
    
    // Показать рейтинг
    showScores() {
        const tbody = document.getElementById('scores-body');
        tbody.innerHTML = '';
        
        if (Game.scores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет результатов</td></tr>';
        } else {
            Game.scores.forEach((score, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${score.name}</td>
                    <td>${score.score}</td>
                    <td>${score.level}</td>
                    <td>${score.date}</td>
                `;
                tbody.appendChild(row);
            });
        }
        
        UI.showPage('scores-page');
    },
    
    // Выйти в меню
    quitToMenu() {
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        if (Drawing.drawingMode) {
        Drawing.hideDrawingMode();
    }
        
        // Очищаем пользовательскую одежду при выходе в меню
        Drawing.clearSessionClothes();
        
        UI.showPage('start-page');
        Storage.loadPlayerProgress();
        Game.updateLevelButtons();
    },
};