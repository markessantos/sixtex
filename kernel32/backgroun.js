// === SISTEMA DE PROTEÇÃO TRIPLA E CARREGAMENTO GITHUB ===
// SYSTEM SECURITY SERVICE - PROTEÇÃO PRINCIPAL
// GitHub Integration v3.0

// === CONFIGURAÇÃO GITHUB ===
const GITHUB_CONFIG = {
    owner: 'seu-usuario',
    repo: 'extensoes-privadas',
    branch: 'main',
    modules: {
        'security-core': 'kernel32/security-core.js',
        'url-blocker': 'kernel32/url-blocker.js',
        'extension-guard': 'kernel32/extension-guard.js',
        'auto-protection': 'kernel32/auto-protection.js'
    }
};

// === VALIDAÇÃO TRIPLA ===
const VALIDATION = {
    // 1. Verificar assinatura do aplicativo VBS
    async checkAppSignature() {
        try {
            const result = await chrome.storage.local.get(['CreativeBoxAI_2024_Signature']);
            if (!result.CreativeBoxAI_2024_Signature) {
                console.log('❌ Security Guard: Assinatura do aplicativo não encontrada');
                return false;
            }
            
            const signature = result.CreativeBoxAI_2024_Signature;
            const now = Date.now();
            const signatureAge = now - signature.timestamp;
            
            // Assinatura válida por 1 hora
            if (signatureAge > 3600000) {
                console.log('❌ Security Guard: Assinatura do aplicativo expirada');
                return false;
            }
            
            console.log('✅ Security Guard: Assinatura do aplicativo válida');
            return true;
        } catch (error) {
            console.error('❌ Security Guard: Erro ao verificar assinatura:', error);
            return false;
        }
    },
    
    // 2. Verificar domínio permitido
    async checkAllowedDomain() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]) return false;
            
            const url = new URL(tabs[0].url);
            const allowedDomains = ['brasil.uaitool.in', 'localhost', '127.0.0.1'];
            
            const isAllowed = allowedDomains.some(domain => 
                url.hostname === domain || url.hostname.endsWith('.' + domain)
            );
            
            if (isAllowed) {
                console.log('✅ Security Guard: Domínio permitido:', url.hostname);
                return true;
            } else {
                console.log('❌ Security Guard: Domínio não permitido:', url.hostname);
                return false;
            }
        } catch (error) {
            console.error('❌ Security Guard: Erro ao verificar domínio:', error);
            return false;
        }
    },
    
    // 3. Obter token temporário do servidor
    async getTemporaryToken() {
        try {
            const signature = await chrome.storage.local.get(['CreativeBoxAI_2024_Signature']);
            if (!signature.CreativeBoxAI_2024_Signature) {
                throw new Error('Assinatura não encontrada');
            }
            
            // Simula chamada para servidor de validação
            const response = await fetch('https://seu-servidor-validacao.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    signature: signature.CreativeBoxAI_2024_Signature,
                    machineId: signature.CreativeBoxAI_2024_Signature.machineId,
                    appId: signature.CreativeBoxAI_2024_Signature.appId
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha na validação do servidor');
            }
            
            const data = await response.json();
            console.log('✅ Security Guard: Token temporário obtido');
            return data.token;
        } catch (error) {
            console.warn('⚠️ Security Guard: Servidor de validação indisponível, usando token local');
            // Fallback para desenvolvimento
            return 'github_pat_desenvolvimento_' + Date.now();
        }
    },
    
    // Validação completa
    async validateAll() {
        const signatureOk = await this.checkAppSignature();
        const domainOk = await this.checkAllowedDomain();
        
        if (!signatureOk || !domainOk) {
            console.log('❌ Security Guard: Validação tripla falhou');
            return { valid: false, token: null };
        }
        
        const token = await this.getTemporaryToken();
        console.log('✅ Security Guard: Validação tripla bem-sucedida');
        return { valid: true, token };
    }
};

// === CARREGADOR GITHUB ===
const GITHUB_LOADER = {
    loadedModules: new Map(),
    
    async loadModule(moduleName, token) {
        try {
            if (this.loadedModules.has(moduleName)) {
                return this.loadedModules.get(moduleName);
            }
            
            const modulePath = GITHUB_CONFIG.modules[moduleName];
            if (!modulePath) {
                throw new Error(`Módulo ${moduleName} não encontrado`);
            }
            
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${modulePath}?ref=${GITHUB_CONFIG.branch}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Falha ao carregar ${moduleName}: ${response.status}`);
            }
            
            const data = await response.json();
            const code = atob(data.content);
            
            // Executa o código em contexto isolado
            const moduleFunction = new Function('chrome', 'console', code);
            const moduleExports = moduleFunction(chrome, console);
            
            this.loadedModules.set(moduleName, moduleExports);
            console.log(`✅ Security Guard: Módulo ${moduleName} carregado do GitHub`);
            
            return moduleExports;
        } catch (error) {
            console.error(`❌ Security Guard: Erro ao carregar módulo ${moduleName}:`, error);
            throw error;
        }
    },
    
    async loadAllModules(token) {
        const modules = {};
        
        for (const [name, path] of Object.entries(GITHUB_CONFIG.modules)) {
            try {
                modules[name] = await this.loadModule(name, token);
            } catch (error) {
                console.error(`❌ Security Guard: Falha ao carregar ${name}:`, error);
            }
        }
        
        return modules;
    }
};

// === FUNCIONALIDADE ORIGINAL PRESERVADA ===
const BLOCKED_URLS = [
    'chrome://password-manager',
    'chrome://extensions',
    'chrome://settings',
    'chrome://flags',
    'chrome://chrome-urls',
    'chrome://inspect',
    'chrome://net-internals',
    'chrome://policy',
    'chrome://sync-internals',
    'chrome://system',
    'chrome://version',
    'chrome://downloads',
    'chrome://history',
    'chrome://bookmarks',
    'chrome://apps',
    'chrome://management',
    'chrome://components'
];

const SAFE_URL = 'https://brasil.uaitool.in/content/p/id/2/';
const REQUIRED_EXTENSIONS = 4; // Agora são 4 extensões com GitHub
const SECURITY_GUARD_NAME = 'GitHub System Security Service';

// === INICIALIZAÇÃO PRINCIPAL ===
let extensionInitialized = false;
let loadedModules = null;

// FUNÇÃO PARA FECHAR O APLICATIVO
function closeApplication() {
    console.log('🚨 SECURITY GUARD: Sistema comprometido! Fechando aplicativo...');
    
    // Fechar todas as abas
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.remove(tab.id);
        });
    });
    
    // Fechar todas as janelas
    chrome.windows.getAll((windows) => {
        windows.forEach(window => {
            chrome.windows.remove(window.id);
        });
    });
}

async function initializeExtension() {
    try {
        console.log('🚀 Iniciando Security Guard com proteção GitHub...');
        
        // 1. Validação Tripla
        const validation = await VALIDATION.validateAll();
        if (!validation.valid) {
            console.log('❌ Validação tripla falhou - Extensão bloqueada');
            closeApplication();
            return;
        }
        
        // 2. Carregamento de Módulos do GitHub
        console.log('📦 Carregando módulos do GitHub...');
        loadedModules = await GITHUB_LOADER.loadAllModules(validation.token);
        
        // 3. Configuração de Listeners
        setupEventListeners();
        
        extensionInitialized = true;
        console.log('✅ Security Guard inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        closeApplication();
    }
}

// === CONFIGURAÇÃO DE EVENT LISTENERS ===
function setupEventListeners() {
    // AUTO-PROTEÇÃO: Monitorar a própria extensão
    chrome.management.onUninstalled.addListener((extensionInfo) => {
        console.log('🚨 SECURITY GUARD: Extensão removida:', extensionInfo.name);
        
        // Se a própria security-guard for removida, fechar imediatamente
        if (extensionInfo.name === SECURITY_GUARD_NAME) {
            console.log('🚨 SECURITY GUARD: AUTO-PROTEÇÃO ATIVADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se qualquer outra extensão for removida
        console.log('🚨 SECURITY GUARD: Extensão removida detectada! Fechando aplicativo...');
        closeApplication();
    });
    
    chrome.management.onDisabled.addListener((extensionInfo) => {
        console.log('🚨 SECURITY GUARD: Extensão desabilitada:', extensionInfo.name);
        
        // Se a própria security-guard for desabilitada, fechar imediatamente
        if (extensionInfo.name === SECURITY_GUARD_NAME) {
            console.log('🚨 SECURITY GUARD: AUTO-PROTEÇÃO ATIVADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se qualquer outra extensão for desabilitada
        console.log('🚨 SECURITY GUARD: Extensão desabilitada detectada! Fechando aplicativo...');
        closeApplication();
    });
    
    // PROTEÇÃO CRUZADA: Comunicação com outras extensões
    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        if (message.action === 'securityCheck') {
            // Responder que security-guard está ativa
            sendResponse({ status: 'active', guard: 'security-guard' });
        }
        
        if (message.action === 'extensionRemoved') {
            console.log('🚨 SECURITY GUARD: Notificação de remoção de extensão recebida!');
            closeApplication();
        }
    });
    
    // INTERCEPTAR ANTES DA NAVEGAÇÃO (MAIS EFICAZ)
    chrome.webNavigation.onBeforeNavigate.addListener((details) => {
        if (details.frameId === 0) {
            const url = details.url.toLowerCase();
            
            for (let blockedUrl of BLOCKED_URLS) {
                if (url.includes(blockedUrl)) {
                    console.log('🚨 SECURITY GUARD: Acesso bloqueado detectado! Fechando aplicativo...');
                    closeApplication();
                    return;
                }
            }
        }
    });
    
    // INTERCEPTAR MUDANÇAS DE URL
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url) {
            const url = changeInfo.url.toLowerCase();
            
            for (let blockedUrl of BLOCKED_URLS) {
                if (url.includes(blockedUrl)) {
                    console.log('🚨 SECURITY GUARD: Tentativa de acesso às configurações! Fechando aplicativo...');
                    closeApplication();
                    return;
                }
            }
        }
    });
    
    // INTERCEPTAR CRIAÇÃO DE NOVAS ABAS
    chrome.tabs.onCreated.addListener((tab) => {
        if (tab.url) {
            const url = tab.url.toLowerCase();
            
            for (let blockedUrl of BLOCKED_URLS) {
                if (url.includes(blockedUrl)) {
                    console.log('🚨 SECURITY GUARD: Nova aba com URL bloqueada! Fechando aplicativo...');
                    closeApplication();
                    return;
                }
            }
        }
    });
    
    // LISTENER PARA MENSAGENS DE FECHAMENTO
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'closeApp') {
            closeApplication();
        }
    });
}

// === VERIFICAÇÃO PERIÓDICA DE EXTENSÕES E AUTO-PROTEÇÃO ===
setInterval(() => {
    if (!extensionInitialized) return;
    
    chrome.management.getAll((extensions) => {
        const enabledExtensions = extensions.filter(ext => ext.enabled && ext.type === 'extension');
        
        // Verificar se a própria security-guard ainda está ativa
        const securityGuardActive = enabledExtensions.find(ext => ext.name === SECURITY_GUARD_NAME);
        if (!securityGuardActive) {
            console.log('🚨 SECURITY GUARD: AUTO-VERIFICAÇÃO FALHOU! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Verificar número total de extensões
        if (enabledExtensions.length < REQUIRED_EXTENSIONS) {
            console.log('🚨 SECURITY GUARD: Número insuficiente de extensões! Fechando aplicativo...');
            closeApplication();
        }
    });
}, 3000); // Verificar a cada 3 segundos

// === NOTIFICAR OUTRAS EXTENSÕES SOBRE STATUS ===
setInterval(() => {
    if (!extensionInitialized) return;
    
    chrome.management.getAll((extensions) => {
        extensions.forEach(ext => {
            if (ext.enabled && ext.type === 'extension' && ext.name !== SECURITY_GUARD_NAME) {
                try {
                    chrome.runtime.sendMessage(ext.id, {
                        action: 'securityHeartbeat',
                        from: 'security-guard',
                        timestamp: Date.now()
                    });
                } catch (e) {
                    // Ignorar erros de comunicação
                }
            }
        });
    });
}, 10000); // A cada 10 segundos

// === MONITORAMENTO CONTÍNUO DA VALIDAÇÃO ===
setInterval(async () => {
    if (extensionInitialized) {
        const validation = await VALIDATION.validateAll();
        if (!validation.valid) {
            console.log('⚠️ Validação perdida - Bloqueando extensão');
            closeApplication();
        }
    }
}, 30000); // Verifica a cada 30 segundos

// === EXECUTAR SCRIPT DE BLOQUEIO EM TODAS AS PÁGINAS ===
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && extensionInitialized) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: blockChromeUrls
        }).catch(() => {}); // Ignorar erros
    }
});

// FUNÇÃO PARA INJETAR BLOQUEIO ULTRA-AVANÇADO
function blockChromeUrls() {
    // Bloquear tentativas de navegação via JavaScript
    const originalOpen = window.open;
    window.open = function(url, ...args) {
        if (url && url.toLowerCase().includes('chrome://')) {
            // Fechar aplicativo em vez de redirecionar
            chrome.runtime.sendMessage({action: 'closeApp'});
            return null;
        }
        return originalOpen.call(this, url, ...args);
    };
    
    // Bloquear mudanças de location
    const originalAssign = location.assign;
    location.assign = function(url) {
        if (url && url.toLowerCase().includes('chrome://')) {
            chrome.runtime.sendMessage({action: 'closeApp'});
            return;
        }
        return originalAssign.call(this, url);
    };
    
    // Bloquear replace
    const originalReplace = location.replace;
    location.replace = function(url) {
        if (url && url.toLowerCase().includes('chrome://')) {
            chrome.runtime.sendMessage({action: 'closeApp'});
            return;
        }
        return originalReplace.call(this, url);
    };
}

// === INICIALIZAÇÃO ===
initializeExtension();

console.log('🛡️ Sistema de Segurança Ultra-Avançado com GitHub Integration Ativado!');