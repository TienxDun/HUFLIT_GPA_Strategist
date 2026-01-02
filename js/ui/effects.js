export function initSnowEffect() {
    // Disabled
    /*
    const snowContainer = document.createElement('div');
    snowContainer.id = 'snow-container';
    document.body.appendChild(snowContainer);

    const maxSnowflakes = 50;
    const snowflakes = [];

    function createSnowflake() {
        if (snowflakes.length >= maxSnowflakes) return;

        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 3 + 2; // 2-5 seconds
        const size = Math.random() * 10 + 10; // 10-20px
        const opacity = Math.random() * 0.5 + 0.3;

        snowflake.style.left = `${startX}px`;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.fontSize = `${size}px`;
        snowflake.style.opacity = opacity;

        snowContainer.appendChild(snowflake);
        snowflakes.push(snowflake);

        // Remove snowflake after animation
        setTimeout(() => {
            snowflake.remove();
            const index = snowflakes.indexOf(snowflake);
            if (index > -1) {
                snowflakes.splice(index, 1);
            }
        }, duration * 1000);
    }

    setInterval(createSnowflake, 200);
    */
}

export function initChristmasTreeInteraction() {
    // Disabled
    /*
    const treeContainer = document.querySelector('.christmas-tree-container');
    const tree = document.querySelector('.christmas-tree');

    if (treeContainer && tree) {
        treeContainer.addEventListener('click', () => {
            // 1. Shake Effect
            // Remove class if it exists to restart animation
            tree.classList.remove('shake');
            
            // Trigger reflow
            void tree.offsetWidth;
            
            // Add class
            tree.classList.add('shake');

            // Remove class after animation ends to return to sway
            setTimeout(() => {
                tree.classList.remove('shake');
            }, 500); // Match animation duration

            // 2. Toggle Snow Effect
            const snowContainer = document.getElementById('snow-container');
            if (snowContainer) {
                if (snowContainer.style.display === 'none') {
                    snowContainer.style.display = 'block';
                } else {
                    snowContainer.style.display = 'none';
                }
            }
        });
    }
    */
}
