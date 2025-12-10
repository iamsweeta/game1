// Модуль рисования на кукле (сессионная версия)
const Drawing = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    currentColor: '#FF69B4',
    brushSize: 10,
    currentSeason: 'summer',
    currentClothingType: 'dress', // Автоматически зависит от сезона
    isEraser: false,
    drawingMode: false,
    sessionClothes: [], // Храним созданную одежду только в памяти
    
    // Инициализация рисования
    init() {
        this.createDrawingCanvas();
        this.createDrawingModal();
        this.createDrawingTools();
        this.setupDrawingEvents();
        this.setupModalEvents();
        this.setupToolsEvents();
        
        // Инициализируем пустой массив сессионной одежды
        this.sessionClothes = [];
    },
    
    // Создать canvas для рисования
    createDrawingCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'drawing-canvas';
        canvas.className = 'drawing-canvas';
        
        const doll = document.getElementById('dolly');
        if (!doll) {
            console.error('Не найден элемент doll!');
            return;
        }
        
        doll.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.clearCanvas();
    },
    
    // Очистить canvas
    clearCanvas() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'transparent';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    
    // Создать модальное окно выбора параметров рисования
    createDrawingModal() {
        const modal = document.createElement('div');
        modal.id = 'drawing-modal';
        
        modal.innerHTML = `
            <div id="select-draw">
                <h3 style="color: #ff3385; margin-bottom: 30px; font-size: 52px; font-weight: 400;">создание одежды</h3>
                    <div style="margin-bottom: 40px;">
                    <h4 style="color: #ff69b4; margin-bottom: 15px; font-size: 32px;">выберите тип одежды:</h4>
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button id="drawing-summer-btn" class="season-btn" >летнее платье</button>
                        <button id="drawing-winter-btn" class="season-btn">зимнее пальто</button>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="drawing-start-btn" disabled>рисовать</button>
                    <button id="drawing-cancel-btn"">отмена</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Создать панель инструментов
    createDrawingTools() {
        const tools = document.createElement('div');
        tools.id = 'drawing-tools';
        
        tools.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <!-- Выбор цвета -->
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="color: #ff3385; font-weight: 200; font-size: 20px;">цвет:</span>
                    <input type="color" id="drawing-color-picker" value="${this.currentColor}">
                </div>
                
                <!-- Размер кисти -->
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="color: #ff3385; font-weight: 300; font-size: 20px;">размер:</span>
                    <input type="range" id="drawing-brush-size" min="1" max="30" value="${this.brushSize}" style="width: 100px;">
                    <span id="drawing-brush-value" style="color: #ff3385; font-weight: 300; font-size: 20px; min-width: 40px;">${this.brushSize}px</span>
                </div>
                
                <!-- Ластик -->
                <button id="drawing-eraser-btn" style=" font-weight: 200; font-size: 20px;
                    background: ${this.isEraser ? '#333' : '#ff4757'};
                ">🧽 ластик</button>
                
                <!-- Сохранить -->
                <button id="save-drawing-btn">💾 cохранить</button>
                
                <!-- Очистить canvas -->
                <button id="clear-drawing-btn">🗑️ очистить</button>
                
                <!-- Отмена -->
                <button id="cancel-drawing-btn">✖️ отмена</button>
            </div>
        `;
        
        document.body.appendChild(tools);
    },

    // Генерация равномерного размещения для гардероба
generateRandomWardrobePosition() {
    const wardrobeWidth = 600;  // Ширина контейнера гардероба
    const wardrobeHeight = 400; // Высота контейнера гардероба
    const itemWidth = 200;       // Ширина предмета одежды
    const itemHeight = 320;      // Высота предмета одежды
    
    // Определяем grid для равномерного распределения
    const gridCols = Math.floor(wardrobeWidth / (itemWidth + 20)); // +20 для отступов
    const gridRows = Math.floor(wardrobeHeight / (itemHeight + 20));
    
    // Создаем массив занятых ячеек
    const occupiedCells = new Array(gridRows).fill(0).map(() => new Array(gridCols).fill(false));
    
    // Помечаем уже занятые ячейки
    this.sessionClothes.forEach(clothing => {
        if (clothing.wardrobeSize && clothing.wardrobeSize.left && clothing.wardrobeSize.top) {
            const left = parseInt(clothing.wardrobeSize.left);
            const top = parseInt(clothing.wardrobeSize.top);
            
            const col = Math.floor(left / (itemWidth + 20));
            const row = Math.floor(top / (itemHeight + 20));
            
            if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
                occupiedCells[row][col] = true;
            }
        }
    });
    
    // Ищем свободную ячейку (проходим по строкам и столбцам)
    let freeCell = null;
    for (let row = 0; row < gridRows && !freeCell; row++) {
        for (let col = 0; col < gridCols && !freeCell; col++) {
            if (!occupiedCells[row][col]) {
                freeCell = { row, col };
            }
        }
    }
    
    // Если нашли свободную ячейку
    if (freeCell) {
        const left = freeCell.col * (itemWidth + 20) + 10;
        const top = freeCell.row * (itemHeight + 20) + 10;
        
        return { 
            left: left + 'px', 
            top: top + 'px', 
            width: itemWidth + 'px', 
            height: itemHeight + 'px' 
        };
    }
    
    // Если все ячейки заняты, используем случайное размещение
    // но с учетом минимизации перекрытия
    let bestPosition = null;
    let bestDistance = 0;
    
    for (let attempt = 0; attempt < 50; attempt++) {
        const left = Math.floor(Math.random() * (wardrobeWidth - itemWidth));
        const top = Math.floor(Math.random() * (wardrobeHeight - itemHeight));
        
        // Вычисляем минимальное расстояние до существующей одежды
        let minDistance = Infinity;
        this.sessionClothes.forEach(clothing => {
            if (clothing.wardrobeSize && clothing.wardrobeSize.left && clothing.wardrobeSize.top) {
                const existingLeft = parseInt(clothing.wardrobeSize.left);
                const existingTop = parseInt(clothing.wardrobeSize.top);
                
                const distance = Math.sqrt(
                    Math.pow(left - existingLeft, 2) + 
                    Math.pow(top - existingTop, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
        });
        
        // Выбираем позицию с наибольшим расстоянием до других предметов
        if (minDistance > bestDistance) {
            bestDistance = minDistance;
            bestPosition = { left, top };
        }
    }
    
    if (bestPosition) {
        return { 
            left: bestPosition.left + 'px', 
            top: bestPosition.top + 'px', 
            width: itemWidth + 'px', 
            height: itemHeight + 'px' 
        };
    }
    
    // Если ничего не найдено, возвращаем позицию по умолчанию
    return { 
        left: '50px', 
        top: '50px', 
        width: itemWidth + 'px', 
        height: itemHeight + 'px' 
    };
},
    
    // Проверить перекрытие с существующей одеждой
    checkOverlap(newLeft, newTop) {
        const itemSize = 320; // Размер предмета одежды
        
        for (const clothing of this.sessionClothes) {
            if (clothing.wardrobeSize && clothing.wardrobeSize.left && clothing.wardrobeSize.top) {
                const existingLeft = parseInt(clothing.wardrobeSize.left);
                const existingTop = parseInt(clothing.wardrobeSize.top);
                
                // Проверяем перекрытие по осям X и Y
                const overlapX = Math.abs(newLeft - existingLeft) < itemSize;
                const overlapY = Math.abs(newTop - existingTop) < itemSize;
                
                if (overlapX && overlapY) {
                    return true; // Есть перекрытие
                }
            }
        }
        
        return false; // Нет перекрытия
    },
    
    // Настройка событий модального окна
    setupModalEvents() {
        const modal = document.getElementById('drawing-modal');
        if (!modal) return;
        
        // Кнопки выбора сезона (теперь они же определяют тип одежды)
        const summerBtn = document.getElementById('drawing-summer-btn');
        const winterBtn = document.getElementById('drawing-winter-btn');
        
        summerBtn.addEventListener('click', () => {
    this.currentSeason = 'summer';
    this.currentClothingType = 'dress';
    
    // Добавляем класс active к летней кнопке, удаляем с зимней
    summerBtn.classList.add('active');
    winterBtn.classList.remove('active');

    this.updateSelectionStatus();
});

winterBtn.addEventListener('click', () => {
    this.currentSeason = 'winter';
    this.currentClothingType = 'coat';
    
    // Добавляем класс active к зимней кнопке, удаляем с летней
    winterBtn.classList.add('active');
    summerBtn.classList.remove('active');
    
    this.updateSelectionStatus();
});
        
        // Кнопка начала рисования
        const startBtn = document.getElementById('drawing-start-btn');
        startBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.startDrawingMode();
        });
        
        // Кнопка отмены
        document.getElementById('drawing-cancel-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            this.drawingMode = false;

            if (Game.currentLevel && !Game.timerInterval) {
                GameLogic.startTimer();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.drawingMode = false;
            }
        });
    },
    
    // Обновить статус выбора
    updateSelectionStatus() {
        const startBtn = document.getElementById('drawing-start-btn');
        
        if (this.currentSeason) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
        } else {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.5';
            startBtn.style.cursor = 'not-allowed';
        }
    },
    
    // Настройка событий инструментов
    setupToolsEvents() {
        // Выбор цвета
        const colorPicker = document.getElementById('drawing-color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                if (!this.isEraser) {
                    this.currentColor = e.target.value;
                }
            });
        }
        
        // Размер кисти
        const brushSlider = document.getElementById('drawing-brush-size');
        const brushValue = document.getElementById('drawing-brush-value');
        if (brushSlider && brushValue) {
            brushSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                brushValue.textContent = this.brushSize + 'px';
            });
        }
        
        // Ластик
        const eraserBtn = document.getElementById('drawing-eraser-btn');
        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                this.isEraser = !this.isEraser;
                eraserBtn.style.background = this.isEraser 
                    ? 'linear-gradient(135deg, #333 0%, #000 100%)' 
                    : 'linear-gradient(135deg, #ff4757 0%, #ff0000 100%)';
                eraserBtn.textContent = this.isEraser ? '✏️ кисть' : '🧽 ластик';
            });
        }
        
        // Сохранить
        const saveBtn = document.getElementById('save-drawing-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveDrawing());
        }
        
        // Очистить canvas
        const clearBtn = document.getElementById('clear-drawing-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Очистить рисунок?')) {
                    this.clearCanvas();
                }
            });
        }
        
        // Отмена
        const cancelBtn = document.getElementById('cancel-drawing-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Отменить создание одежды?')) {
                    this.hideDrawingMode();
                }
            });
        }
    },
    
    // Начать режим рисования
    startDrawingMode() {
        if (!this.canvas) return;
        
        this.canvas.style.display = 'block';
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.clearCanvas();
        
        const tools = document.getElementById('drawing-tools');
        if (tools) {
            tools.style.display = 'flex';
        }
        this.drawingMode = true;
        
        // Останавливаем игровой таймер

    },
    
    // Скрыть режим рисования
    hideDrawingMode() {
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        
        const tools = document.getElementById('drawing-tools');
        if (tools) {
            tools.style.display = 'none';
        }
        
        this.drawingMode = false;
        this.isEraser = false;
        
        // Сбрасываем ластик
        const eraserBtn = document.getElementById('drawing-eraser-btn');
        if (eraserBtn) {
            eraserBtn.style.background = 'linear-gradient(135deg, #ff4757 0%, #ff0000 100%)';
            eraserBtn.textContent = '🧽 Ластик';
        }
        
        // Возобновляем игру
        if (Game.currentLevel && !Game.timerInterval) {
            GameLogic.startTimer();
        }
    },
    
    // Показать модальное окно рисования
    showDrawingModal() {
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        // Проверяем, есть ли имя игрока
        if (!Game.playerName || Game.playerName.trim() === '') {
            UI.showAlert('Введите ваше имя перед созданием одежды!');
            document.getElementById('player-name').focus();
            return;
        }
        
        // Проверяем лимит одежды (максимум 5 предметов за сессию)
        if (this.sessionClothes.length >= 5) {
            UI.showAlert('Вы уже создали 5 предметов одежды в этой сессии!');
            return;
        }
        
        const modal = document.getElementById('drawing-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Сбрасываем выбор к летнему платью по умолчанию
            this.currentSeason = 'summer';
            this.currentClothingType = 'dress';
            
            // Обновляем UI
            this.updateSelectionStatus();
            
            // Выделяем кнопку лета по умолчанию
            setTimeout(() => {
                document.getElementById('drawing-summer-btn').click();
            }, 10);
        }
    },
    
    // Методы рисования
    setupDrawingEvents() {
        const canvas = this.canvas;
        if (!canvas) return;
        
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('touchstart', (e) => this.startDrawingTouch(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('touchmove', (e) => this.drawTouch(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseleave', () => this.stopDrawing());
        canvas.addEventListener('touchend', () => this.stopDrawing());
    },
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        [this.lastX, this.lastY] = [e.clientX - rect.left, e.clientY - rect.top];
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    },
    
     draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isEraser) {
            // Используем clearRect для ластика
            this.clearRectLine(this.lastX, this.lastY, x, y);
        } else {
            // Рисуем линию
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }
        
        this.lastX = x;
        this.lastY = y;
    },

    // Очистить линию между двумя точками (для плавного стирания)
    clearRectLine(fromX, fromY, toX, toY) {
        const radius = this.brushSize / 2;
        const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const steps = Math.max(1, Math.floor(distance / (this.brushSize / 3)));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = fromX + (toX - fromX) * t;
            const y = fromY + (toY - fromY) * t;
            
            this.ctx.clearRect(
                x - radius,
                y - radius,
                this.brushSize,
                this.brushSize
            );
        }
    },
    
    startDrawingTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        [this.lastX, this.lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    },
    
    drawTouch(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.isEraser ? 'white' : this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    },
    
    stopDrawing() {
        this.isDrawing = false;
    },
    
    saveDrawing() {      
        if (!this.canvas) {
            alert('Canvas не найден!');
            return;
        }
        
        // Проверяем, есть ли что сохранять
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let hasContent = false;
        
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] > 10) {
                hasContent = true;
                break;
            }
        }
        
        if (!hasContent) {
            alert('Нарисуйте что-нибудь перед сохранением!');
            return;
        }
        
        // Проверяем лимит одежды
        if (this.sessionClothes.length >= 5) {
            alert('Вы уже создали 5 предметов одежды в этой сессии!');
            return;
        }
        
        // Размеры для одежды на кукле
        const TARGET_WIDTH = 200;
        const TARGET_HEIGHT = 320;
        
        // Создаем временный canvas для масштабирования
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = TARGET_WIDTH;
        tempCanvas.height = TARGET_HEIGHT;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Делаем фон прозрачным
        tempCtx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        
        // Масштабируем рисунок
        const scale = Math.min(
            TARGET_WIDTH / this.canvas.width,
            TARGET_HEIGHT / this.canvas.height
        );
        
        const scaledWidth = this.canvas.width * scale;
        const scaledHeight = this.canvas.height * scale;
        const offsetX = (TARGET_WIDTH - scaledWidth) / 2;
        const offsetY = (TARGET_HEIGHT - scaledHeight) / 2;
        
        tempCtx.drawImage(
            this.canvas,
            0, 0, this.canvas.width, this.canvas.height,
            offsetX, offsetY, scaledWidth, scaledHeight
        );
        
        // Получаем dataURL
        const dataURL = tempCanvas.toDataURL('image/png');
        const customId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                let clothingName;
        if (this.currentSeason === 'summer') {
            clothingName = 'Мое летнее платье';
        } else {
            clothingName = 'Мое зимнее пальто';
        }
        
        // Генерируем случайные координаты для гардероба
        const wardrobePosition = this.generateRandomWardrobePosition();
        
    const clothingData = {
        image: dataURL,
        name: clothingName,
        type: customId,
        category: 'clothing',
        season: this.currentSeason,
        clothingType: this.currentClothingType,
        createdBy: Game.playerName,
        createdAt: new Date().toISOString(),
        dollSize: { 
            width: TARGET_WIDTH + 'px',
            height: TARGET_HEIGHT + 'px',
            top: '60px',
            left: '145px'
        },
        wardrobeSize: wardrobePosition,
        zIndex: 15,
        isCustom: true,
        isSession: true
    };
    
    // Сохраняем в массив сессионной одежды
    this.sessionClothes.push(clothingData);
    // Добавляем в глобальные настройки одежды
    Game.imageSettings.clothes[customId] = clothingData;
    // Обновляем гардероб
    if (Game.currentLevel) {
        GameLogic.loadWardrobe();
    }
        alert(`Одежда создана!\n"${clothingName}" добавлено в гардероб. \nВы можете создать до 5 элементов одежды`);
    
    this.hideDrawingMode();
},
   updateTasksWithCustomClothing(clothingData) {
    // Просто добавляем метаданные о пользовательской одежде
    clothingData.isCustom = true;
    
    // Обновляем гардероб
    if (Game.currentLevel) {
        GameLogic.loadWardrobe();
    }
},
    
    // Очистить всю сессионную одежду
   clearSessionClothes() {
    // Удаляем сессионную одежду из глобальных настроек
    Object.keys(Game.imageSettings.clothes).forEach(key => {
        if (Game.imageSettings.clothes[key].isSession) {
            delete Game.imageSettings.clothes[key];
        }
    });
    
    // Очищаем массив сессионной одежды
    this.sessionClothes = [];
    if (Game.currentLevel) {
        GameLogic.loadWardrobe();
    }
    
    console.log('Сессионная одежда очищена');
},
    // Получить количество созданной одежды
    getSessionClothesCount() {
        return this.sessionClothes.length;
    },  
};