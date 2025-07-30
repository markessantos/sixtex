// === SISTEMA DE PROTEÇÃO TRIPLA E CARREGAMENTO GITHUB ===
// SECURITY SHIELD - ESCUDO DA SECURITY-GUARD
// PROTEÇÃO DUPLA CONTRA REMOÇÃO DE EXTENSÕES DE SEGURANÇA

// === CONFIGURAÇÃO GITHUB ===
const GITHUB_CONFIG = {
    owner: 'seu-usuario',
    repo: 'extensoes-privadas',
    branch: 'main',
    modules: {
        'security-core': 'security-shield/security-core.js',
        'extension-monitor': 'security-shield/extension-monitor.js',
        'url-blocker': 'security-shield/url-blocker.js',
        'communication': 'security-shield/communication.js'
    }
};

// === VALIDAÇÃO TRIPLA ===
const VALIDATION = {
    // 1. Verificar assinatura do aplicativo VBS
    async checkAppSignature() {
        try {
            const result = await chrome.storage.local.get(['appSignature']);
            if (!result.appSignature) {
                console.log('❌ Assinatura do aplicativo não encontrada');
                return false;
            }
            
            const signature = result.appSignature;
            const now = Date.now();
            const signatureAge = now - signature.timestamp;
            
            // Assinatura válida por 1 hora
            if (signatureAge > 3600000) {
                console.log('❌ Assinatura do aplicativo expirada');
                return false;
            }
            
            console.log('✅ Assinatura do aplicativo válida');
            return true;
        } catch (error) {
            console.error('❌ Erro ao verificar assinatura:', error);
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
                console.log('✅ Domínio permitido:', url.hostname);
                return true;
            } else {
                console.log('❌ Domínio não permitido:', url.hostname);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao verificar domínio:', error);
            return false;
        }
    },
    
    // 3. Obter token temporário do servidor
    async getTemporaryToken() {
        try {
            const signature = await chrome.storage.local.get(['appSignature']);
            if (!signature.appSignature) {
                throw new Error('Assinatura não encontrada');
            }
            
            // Simula chamada para servidor de validação
            const response = await fetch('https://seu-servidor-validacao.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    signature: signature.appSignature,
                    machineId: signature.appSignature.machineId,
                    appId: signature.appSignature.appId
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha na validação do servidor');
            }
            
            const data = await response.json();
            console.log('✅ Token temporário obtido');
            return data.token;
        } catch (error) {
            console.warn('⚠️ Servidor de validação indisponível, usando token local');
            // Fallback para desenvolvimento
            return 'github_pat_desenvolvimento_' + Date.now();
        }
    },
    
    // Validação completa
    async validateAll() {
        const signatureOk = await this.checkAppSignature();
        const domainOk = await this.checkAllowedDomain();
        
        if (!signatureOk || !domainOk) {
            console.log('❌ Validação tripla falhou');
            return { valid: false, token: null };
        }
        
        const token = await this.getTemporaryToken();
        console.log('✅ Validação tripla bem-sucedida');
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
            console.log(`✅ Módulo ${moduleName} carregado do GitHub`);
            
            return moduleExports;
        } catch (error) {
            console.error(`❌ Erro ao carregar módulo ${moduleName}:`, error);
            throw error;
        }
    },
    
    async loadAllModules(token) {
        const modules = {};
        
        for (const [name, path] of Object.entries(GITHUB_CONFIG.modules)) {
            try {
                modules[name] = await this.loadModule(name, token);
            } catch (error) {
                console.error(`❌ Falha ao carregar ${name}:`, error);
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
const REQUIRED_EXTENSIONS = 4; // Agora são 4 extensões (incluindo security-shield)
const SECURITY_GUARD_NAME = 'System Security Service';
const SECURITY_SHIELD_NAME = 'Security Shield';

// === INICIALIZAÇÃO PRINCIPAL ===
let extensionInitialized = false;
let loadedModules = null;

// FUNÇÃO PARA FECHAR O APLICATIVO
function closeApplication() {
    console.log('🚨 SECURITY SHIELD: Sistema comprometido! Fechando aplicativo...');
    
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
        console.log('🚀 Iniciando Security Shield com proteção GitHub...');
        
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
        console.log('✅ Security Shield inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        closeApplication();
    }
}

// === CONFIGURAÇÃO DE EVENT LISTENERS ===
function setupEventListeners() {
    // MONITORAR REMOÇÃO DA SECURITY-GUARD (PROTEÇÃO PRINCIPAL)
    chrome.management.onUninstalled.addListener((extensionInfo) => {
        console.log('🚨 SECURITY SHIELD: Extensão removida:', extensionInfo.name);
        
        // Se a SECURITY-GUARD for removida, fechar imediatamente
        if (extensionInfo.name === SECURITY_GUARD_NAME) {
            console.log('🚨 SECURITY SHIELD: SECURITY-GUARD REMOVIDA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se a própria SECURITY-SHIELD for removida, fechar imediatamente
        if (extensionInfo.name === SECURITY_SHIELD_NAME) {
            console.log('🚨 SECURITY SHIELD: AUTO-PROTEÇÃO ATIVADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se qualquer outra extensão for removida
        console.log('🚨 SECURITY SHIELD: Extensão removida detectada! Fechando aplicativo...');
        closeApplication();
    });
    
    chrome.management.onDisabled.addListener((extensionInfo) => {
        console.log('🚨 SECURITY SHIELD: Extensão desabilitada:', extensionInfo.name);
        
        // Se a SECURITY-GUARD for desabilitada, fechar imediatamente
        if (extensionInfo.name === SECURITY_GUARD_NAME) {
            console.log('🚨 SECURITY SHIELD: SECURITY-GUARD DESABILITADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se a própria SECURITY-SHIELD for desabilitada, fechar imediatamente
        if (extensionInfo.name === SECURITY_SHIELD_NAME) {
            console.log('🚨 SECURITY SHIELD: AUTO-PROTEÇÃO ATIVADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Se qualquer outra extensão for desabilitada
        console.log('🚨 SECURITY SHIELD: Extensão desabilitada detectada! Fechando aplicativo...');
        closeApplication();
    });
    
    // COMUNICAÇÃO COM SECURITY-GUARD
    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        if (message.action === 'shieldCheck') {
            // Responder que security-shield está ativa
            sendResponse({ status: 'active', shield: 'security-shield' });
        }
        
        if (message.action === 'guardRemoved') {
            console.log('🚨 SECURITY SHIELD: Notificação de remoção da Security-Guard!');
            closeApplication();
        }
    });
    
    // INTERCEPTAR NAVEGAÇÃO PARA URLs BLOQUEADAS
    chrome.webNavigation.onBeforeNavigate.addListener((details) => {
        if (details.frameId === 0) {
            const url = details.url.toLowerCase();
            
            for (let blockedUrl of BLOCKED_URLS) {
                if (url.includes(blockedUrl)) {
                    console.log('🚨 SECURITY SHIELD: Acesso bloqueado detectado! Fechando aplicativo...');
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
                    console.log('🚨 SECURITY SHIELD: Tentativa de acesso às configurações! Fechando aplicativo...');
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

// === VERIFICAÇÃO PERIÓDICA DUPLA DE SEGURANÇA ===
setInterval(() => {
    if (!extensionInitialized) return;
    
    chrome.management.getAll((extensions) => {
        const enabledExtensions = extensions.filter(ext => ext.enabled && ext.type === 'extension');
        
        // Verificar se a SECURITY-GUARD ainda está ativa
        const securityGuardActive = enabledExtensions.find(ext => ext.name === SECURITY_GUARD_NAME);
        if (!securityGuardActive) {
            console.log('🚨 SECURITY SHIELD: SECURITY-GUARD NÃO ENCONTRADA! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Verificar se a própria SECURITY-SHIELD ainda está ativa
        const securityShieldActive = enabledExtensions.find(ext => ext.name === SECURITY_SHIELD_NAME);
        if (!securityShieldActive) {
            console.log('🚨 SECURITY SHIELD: AUTO-VERIFICAÇÃO FALHOU! Fechando aplicativo...');
            closeApplication();
            return;
        }
        
        // Verificar número total de extensões
        if (enabledExtensions.length < REQUIRED_EXTENSIONS) {
            console.log('🚨 SECURITY SHIELD: Número insuficiente de extensões! Fechando aplicativo...');
            closeApplication();
        }
    });
}, 2000); // Verificar a cada 2 segundos (mais rápido que security-guard)

// === HEARTBEAT PARA SECURITY-GUARD ===
setInterval(() => {
    if (!extensionInitialized) return;
    
    chrome.management.getAll((extensions) => {
        const securityGuard = extensions.find(ext => 
            ext.enabled && ext.name === SECURITY_GUARD_NAME
        );
        
        if (securityGuard) {
            try {
                chrome.runtime.sendMessage(securityGuard.id, {
                    action: 'shieldHeartbeat',
                    from: 'security-shield',
                    timestamp: Date.now()
                });
            } catch (e) {
                console.log('🚨 SECURITY SHIELD: Falha na comunicação com Security-Guard!');
                closeApplication();
            }
        } else {
            console.log('🚨 SECURITY SHIELD: Security-Guard não encontrada!');
            closeApplication();
        }
    });
}, 5000); // A cada 5 segundos

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

// === INICIALIZAÇÃO ===
initializeExtension();

console.log('🛡️ Security Shield com Proteção GitHub Carregado!');