// === SISTEMA DE PROTEÇÃO TRIPLA E CARREGAMENTO GITHUB ===
// SECURITY SHIELD - CONTENT PROTECTION
// PROTEÇÃO SIMPLES SEM FECHAMENTO

(function() {
    'use strict';
    
    // === VALIDAÇÃO TRIPLA NO CONTENT SCRIPT ===
    let validationPassed = false;
    
    async function validateTriple() {
        try {
            // 1. Verificar assinatura do aplicativo
            const result = await chrome.storage.local.get(['appSignature']);
            if (!result.appSignature) {
                console.log('❌ Content: Assinatura não encontrada');
                return false;
            }
            
            const signature = result.appSignature;
            const now = Date.now();
            const signatureAge = now - signature.timestamp;
            
            // Assinatura válida por 1 hora
            if (signatureAge > 3600000) {
                console.log('❌ Content: Assinatura expirada');
                return false;
            }
            
            // 2. Verificar domínio permitido
            const allowedDomains = ['brasil.uaitool.in', 'localhost', '127.0.0.1'];
            const currentDomain = window.location.hostname;
            
            const isAllowed = allowedDomains.some(domain => 
                currentDomain === domain || currentDomain.endsWith('.' + domain)
            );
            
            if (!isAllowed) {
                console.log('❌ Content: Domínio não permitido:', currentDomain);
                return false;
            }
            
            console.log('✅ Content: Validação tripla bem-sucedida');
            return true;
        } catch (error) {
            console.error('❌ Content: Erro na validação:', error);
            return false;
        }
    }
    
    // === FUNCIONALIDADE ORIGINAL PRESERVADA ===
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
        console.log('🚨 SECURITY SHIELD CONTENT: URL bloqueada detectada!');
        
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
                console.log('🚨 SECURITY SHIELD CONTENT: URL bloqueada detectada!');
                closeApplication();
                return;
            }
        }
    }
    
    // === INICIALIZAÇÃO COM VALIDAÇÃO ===
    async function initializeContentShield() {
        // Validação tripla
        validationPassed = await validateTriple();
        
        if (!validationPassed) {
            console.log('❌ Content: Validação falhou - Bloqueando funcionalidades');
            return;
        }
        
        // EXECUTAR VERIFICAÇÃO IMEDIATA
        checkCurrentUrl();
        
        // BLOQUEAR APENAS TECLAS CRÍTICAS
        document.addEventListener('keydown', function(e) {
            if (!validationPassed) return;
            
            // F12 (DevTools)
            if (e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚨 SECURITY SHIELD: F12 detectado!');
                closeApplication();
                return false;
            }
            
            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚨 SECURITY SHIELD: Ctrl+Shift+I detectado!');
                closeApplication();
                return false;
            }
            
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚨 SECURITY SHIELD: Ctrl+Shift+J detectado!');
                closeApplication();
                return false;
            }
            
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚨 SECURITY SHIELD: Ctrl+U detectado!');
                closeApplication();
                return false;
            }
        }, true);
        
        // BLOQUEAR MENU DE CONTEXTO SIMPLES (SEM FECHAR APP)
        document.addEventListener('contextmenu', function(e) {
            if (!validationPassed) return;
            
            e.preventDefault();
            console.log('🛡️ SECURITY SHIELD: Menu de contexto bloqueado');
            return false;
        });
        
        // VERIFICAÇÃO PERIÓDICA
        setInterval(() => {
            if (validationPassed) {
                checkCurrentUrl();
            }
        }, 2000);
        
        console.log('🛡️ SECURITY SHIELD CONTENT: Proteção simples ativada!');
    }
    
    // === MONITORAMENTO CONTÍNUO DA VALIDAÇÃO ===
    setInterval(async () => {
        const newValidation = await validateTriple();
        if (validationPassed && !newValidation) {
            console.log('⚠️ Content: Validação perdida - Desativando proteções');
            validationPassed = false;
        } else if (!validationPassed && newValidation) {
            console.log('✅ Content: Validação recuperada - Ativando proteções');
            validationPassed = true;
        }
    }, 30000); // Verifica a cada 30 segundos
    
    // Inicializar
    initializeContentShield();
    
})();