// BLOQUEADOR DE CONTEÚDO ULTRA-AVANÇADO
// PROTEÇÃO SEM FECHAMENTO AUTOMÁTICO

(function() {
    'use strict';
    
    const BLOCKED_URLS = [
        'chrome://password-manager',
        'chrome://extensions',
        'chrome://settings',
        'chrome://flags',
        'chrome://chrome-urls',
        'chrome://management',
        'chrome://components'
    ];
    
    // FUNÇÃO PARA FECHAR APLICATIVO (APENAS PARA URLs BLOQUEADAS)
    function closeApplication() {
        console.log('🚨 SECURITY GUARD CONTENT: URL bloqueada detectada!');
        
        // Enviar mensagem para background script
        try {
            chrome.runtime.sendMessage({action: 'closeApp'});
        } catch(e) {}
        
        // Tentar fechar a janela atual
        try {
            window.close();
        } catch(e) {}
        
        // Redirecionar como último recurso
        window.location.replace('about:blank');
    }
    
    // VERIFICAR URL ATUAL
    function checkCurrentUrl() {
        const currentUrl = window.location.href.toLowerCase();
        
        for (let blockedUrl of BLOCKED_URLS) {
            if (currentUrl.includes(blockedUrl.toLowerCase())) {
                console.log('🚨 SECURITY GUARD CONTENT: URL bloqueada detectada!');
                closeApplication();
                return;
            }
        }
    }
    
    // EXECUTAR VERIFICAÇÃO IMEDIATA
    checkCurrentUrl();
    
    // BLOQUEAR TECLAS PERIGOSAS (APENAS F12 E CTRL+SHIFT+I)
    document.addEventListener('keydown', function(e) {
        // F12 (DevTools)
        if (e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚨 SECURITY GUARD: F12 detectado! Fechando aplicativo...');
            closeApplication();
            return false;
        }
        
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚨 SECURITY GUARD: Ctrl+Shift+I detectado! Fechando aplicativo...');
            closeApplication();
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚨 SECURITY GUARD: Ctrl+Shift+J detectado! Fechando aplicativo...');
            closeApplication();
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚨 SECURITY GUARD: Ctrl+U detectado! Fechando aplicativo...');
            closeApplication();
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚨 SECURITY GUARD: Ctrl+Shift+C detectado! Fechando aplicativo...');
            closeApplication();
            return false;
        }
    }, true);
    
    // BLOQUEAR MENU DE CONTEXTO (SEM FECHAR APP)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        console.log('🛡️ SECURITY GUARD: Menu de contexto bloqueado (botão direito)');
        return false;
    });
    
    // MONITORAR MUDANÇAS DE URL
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            checkCurrentUrl();
        }
    }).observe(document, {subtree: true, childList: true});
    
    // INTERCEPTAR TENTATIVAS DE NAVEGAÇÃO
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(checkCurrentUrl, 0);
    };
    
    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(checkCurrentUrl, 0);
    };
    
    // VERIFICAÇÃO PERIÓDICA
    setInterval(checkCurrentUrl, 1500);
    
    console.log('🛡️ SECURITY GUARD: Bloqueador Simples Ativado!');
    
})();