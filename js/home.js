let cleanup = null;

function setTopbarHeroMode(on) {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    topbar.classList.toggle('is-hero', on);
}

function setHomeMainOffsetDisabled(on) {
    const main = document.querySelector('.main');
    if (!main) return;
    main.classList.toggle('main--no-topbar-offset', on);
}

function mountHome() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        setTopbarHeroMode(false);
        setHomeMainOffsetDisabled(false);
        return () => {};
    }

    // kluczowe: home ma full-screen hero pod topbarem
    setHomeMainOffsetDisabled(true);

    // Start: na hero ma być transparent
    setTopbarHeroMode(true);

    const obs = new IntersectionObserver(
        ([entry]) => {
            setTopbarHeroMode(entry.isIntersecting);
        },
        { threshold: 0.12 }
    );

    obs.observe(hero);

    return () => {
        obs.disconnect();
        setTopbarHeroMode(false);
        setHomeMainOffsetDisabled(false);
    };
}

export function initHome() {
    document.addEventListener('route:change', (e) => {
        const key = e?.detail?.key;

        if (cleanup) {
            cleanup();
            cleanup = null;
        }

        if (key === 'home') {
            cleanup = mountHome();
        } else {
            setTopbarHeroMode(false);
            setHomeMainOffsetDisabled(false);
        }
    });
}