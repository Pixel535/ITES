(function () {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        console.log('[DEBUG pushState]', args, new Error().stack);
        return originalPushState.apply(this, args);
    };

    history.replaceState = function (...args) {
        console.log('[DEBUG replaceState]', args, new Error().stack);
        return originalReplaceState.apply(this, args);
    };

    let lastHref = location.href;
    let lastHash = location.hash;

    function logState(label) {
        console.log(label, {
            href: location.href,
            pathname: location.pathname,
            hash: location.hash
        });
    }

    window.addEventListener('hashchange', () => {
        console.log('[DEBUG hashchange]', {
            fromHref: lastHref,
            toHref: location.href,
            fromHash: lastHash,
            toHash: location.hash,
            stack: new Error().stack
        });

        lastHref = location.href;
        lastHash = location.hash;
    });

    document.addEventListener(
        'click',
        (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            console.log('[DEBUG click link]', {
                outerHTML: link.outerHTML,
                hrefAttr: link.getAttribute('href'),
                resolvedHref: link.href,
                datasetRoute: link.dataset.route || null
            });
        },
        true
    );

    window.addEventListener('DOMContentLoaded', () => {
        logState('[DEBUG DOMContentLoaded]');
        document.querySelectorAll('a').forEach((link) => {
            const href = link.getAttribute('href') || '';
            if (href.includes('#')) {
                console.log('[DEBUG anchor with hash]', link.outerHTML);
            }
        });
    });

    window.addEventListener('load', () => {
        logState('[DEBUG load]');
    });

    setInterval(() => {
        if (location.href !== lastHref || location.hash !== lastHash) {
            console.log('[DEBUG poll detected change]', {
                fromHref: lastHref,
                toHref: location.href,
                fromHash: lastHash,
                toHash: location.hash,
                stack: new Error().stack
            });

            lastHref = location.href;
            lastHash = location.hash;
        }
    }, 200);

    console.log('[DEBUG router] debug attached');
})();