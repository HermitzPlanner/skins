function themeChange() {
    document.documentElement.style.setProperty('--header-background', 'hsl(0, 0%, 100%)');
    document.documentElement.style.setProperty('--text-light', 'hsl(0, 0%, 0%)');
    document.documentElement.style.setProperty('--background-events-dark', 'hsl(0, 0%, 80%)');
    document.documentElement.style.setProperty('--background-events-body-dark', 'hsl(0, 0%, 100%)');
    document.documentElement.style.setProperty('--background-events-content-dark', 'hsl(0, 0%, 99%)');
    document.documentElement.style.setProperty('--highlight-dark', 'hsl(0, 0%, 85%)');
    document.querySelectorAll(".svg").forEach(svg => {
        svg.style.filter = "none"
    });
    document.querySelectorAll(".svg-light").forEach(svg => {
        svg.style.filter = "invert()"
    });
}