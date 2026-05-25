// Shared Navigation Component
// This ensures consistent navigation across all pages

function createBurgerMenu() {
    return `
    <div class="burger-menu" id="burgerMenu">
        <div class="burger-btn" onclick="toggleMenu()">
            <div class="burger-line"></div>
            <div class="burger-line"></div>
            <div class="burger-line"></div>
        </div>
        <div class="menu-dropdown">
            <div class="menu-item">
                <a href="data-flagging-results.html">📊 Main Results</a>
            </div>
            <div class="menu-item">
                <a href="data-flagging-readme.html">📖 Documentation</a>
            </div>
            <div class="menu-item">
                <a href="data-flagging-downloads.html">📥 Downloads & Resources</a>
            </div>
            <div class="menu-item">
                <a href="obfcm-quality-checker.html">🔍 Quality Checker Tool</a>
            </div>
            <div class="menu-item">
                            <div class="menu-item">
                <a href="paper-a-figures-models.html">📊 Figures & Models</a>
            </div>
            <div class="menu-item">
                <a href="figures_portfolio.html">🎨 Figures Portfolio</a>
            </div>
            <div class="menu-item">
                <a href="tables_portfolio.html">📋 Tables Portfolio</a>
            </div>
            <a href="index.html">🏠 Home</a>
            </div>
        </div>
    </div>
    `;
}

function toggleMenu() {
    const menu = document.getElementById('burgerMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Auto-inject navigation if burgerMenu element exists but is empty
document.addEventListener('DOMContentLoaded', function() {
    const existingMenu = document.getElementById('burgerMenu');
    if (existingMenu && existingMenu.innerHTML.trim() === '') {
        existingMenu.outerHTML = createBurgerMenu();
    }
});

