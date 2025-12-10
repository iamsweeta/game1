// Модуль управления интерфейсом
const UI = {
    // Настройка эффектов волшебства
    setupMagicEffects() {
        const effectsContainer = document.createElement('div');
        effectsContainer.id = 'effects-container';
        effectsContainer.style.position = 'fixed';
        effectsContainer.style.top = '0';
        effectsContainer.style.left = '0';
        effectsContainer.style.width = '100%';
        effectsContainer.style.height = '100%';
        effectsContainer.style.pointerEvents = 'none';
        effectsContainer.style.zIndex = '9999';
        document.body.appendChild(effectsContainer);
    },
    
    // Эффект звездочек при надевании одежды
    createMagicStars(element) {
        const starsContainer = document.getElementById('effects-container');
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = '20px';
            star.style.height = '20px';
            star.style.background = 'radial-gradient(circle, #FFD700 30%, #FFEC8B 70%)';
            star.style.borderRadius = '50%';
            star.style.boxShadow = '0 0 10px #FFD700, 0 0 20px #FFEC8B';
            star.style.left = centerX + 'px';
            star.style.top = centerY + 'px';
            star.style.opacity = '0';
            star.style.transform = 'translate(-50%, -50%)';
            star.style.zIndex = '10000';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            const duration = 0.8 + Math.random() * 0.7;
            
            star.animate([
                { 
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(0)',
                    offset: 0
                },
                { 
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)',
                    offset: 0.2
                },
                { 
                    opacity: 1,
                    transform: `translate(
                        ${Math.cos(angle) * distance}px, 
                        ${Math.sin(angle) * distance}px
                    ) scale(0.5)`,
                    offset: 0.8
                },
                { 
                    opacity: 0,
                    transform: `translate(
                        ${Math.cos(angle) * distance * 1.2}px, 
                        ${Math.sin(angle) * distance * 1.2}px
                    ) scale(0)`,
                    offset: 1
                }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            starsContainer.appendChild(star);
            
            setTimeout(() => {
                star.remove();
            }, duration * 1000);
        }
        
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '80px';
        sparkle.style.height = '80px';
        sparkle.style.background = 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)';
        sparkle.style.borderRadius = '50%';
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        sparkle.style.transform = 'translate(-50%, -50%)';
        sparkle.style.zIndex = '9999';
        
        sparkle.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        });
        
        starsContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    },
    
    // Показать окно завершения уровня
    showLevelCompleteModal(isSuccess, message) {
        if (Game.timerInterval) {
            clearInterval(Game.timerInterval);
            Game.timerInterval = null;
        }
        
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'level-modal-overlay';
        
        const modalBox = document.createElement('div');
        modalBox.className = 'level-modal-box';
        
        const icon = isSuccess ? '🎉' : '😢';
        const title = isSuccess ? 'уровень пройден!' : 'уровень не пройден';
        const color = isSuccess ? '#ff69b4' : '#ff3385';
        
        modalBox.innerHTML = `
            <div class="level-modal-icon" style="font-size: 60px; margin-bottom: 20px;">${icon}</div>
            <div class="level-modal-title" style="color: ${color}; font-size: 36px; font-weight: bold; margin-bottom: 15px;">${title}</div>
            <div class="level-modal-message" style="font-size: 32px; color: #ff3385; margin-bottom: 20px;">${message}</div>
            <div class="level-modal-stats" style="margin-bottom: 30px; background: none; padding: 15px; border-radius: 15px;">
                <div style="margin-bottom: 10px; font-size: 22px; color: #ff5297ff;">уровень: <span style="font-weight: bold">${Game.currentLevel}</span></div>
                <div style="margin-bottom: 10px;font-size: 22px; color: #ff5297ff;">очки: <span style="font-weight: bold;">${Game.score}</span></div>
                <div style="margin-bottom: 10px;font-size: 22px; color: #ff5297ff;">время: <span style="font-weight: bold;">${GameLogic.formatTime(Game.timeLeft)}</span></div>
            </div>
            <div style="display: flex; gap: 15px; ">
                <button class="level-modal-btn continue-btn" style="flex: 1; background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);">
                    ${isSuccess ? (Game.currentLevel < 3 ? 'следующий уровень' : 'рейтинг') : 'играть снова'}
                </button>
                <button class="level-modal-btn quit-btn" style="flex: 1; background: linear-gradient(135deg, #ff91c1 0%, #ff69b4 100%);">выйти</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);
        
        modalBox.querySelector('.continue-btn').addEventListener('click', () => {
            modalOverlay.remove();
            if (isSuccess && Game.currentLevel < 3) {
                GameLogic.nextLevel();
            } else if (isSuccess && Game.currentLevel === 3) {
                GameLogic.showScores();
            } else {
                GameLogic.restartLevel();
            }
        });
        
        modalBox.querySelector('.quit-btn').addEventListener('click', () => {
            modalOverlay.remove();
            GameLogic.quitToMenu();
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
                if (isSuccess && Game.currentLevel < 3) {
                    GameLogic.nextLevel();
                } else if (!isSuccess) {
                    GameLogic.restartLevel();
                }
            }
        });
    },
    
    // Показать предупреждение
    showAlert(message) {
        const oldAlert = document.querySelector('.alert-overlay');
        if (oldAlert) oldAlert.remove();
        
        const alertOverlay = document.createElement('div');
        alertOverlay.className = 'alert-overlay';
        
        const alertBox = document.createElement('div');
        alertBox.className = 'alert-box';
        
        alertBox.innerHTML = `
            <div class="alert-title">ошибка</div>
            <div class="alert-message">${message}</div>
            <button class="alert-btn">OK</button>
        `;
        
        alertOverlay.appendChild(alertBox);
        document.body.appendChild(alertOverlay);
        
        alertBox.querySelector('.alert-btn').addEventListener('click', () => {
            alertOverlay.remove();
        });
        
        alertOverlay.addEventListener('click', (e) => {
            if (e.target === alertOverlay) {
                alertOverlay.remove();
            }
        });
    },
    
    // Показать страницу
    showPage(page) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');
        
        if (page === 'scores-page') {
            GameLogic.showScores();
        } else if (page === 'start-page') {
            Game.updateLevelButtons();
        }
    }
};