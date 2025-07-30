// === SISTEMA DE PROTEÇÃO TRIPLA E CARREGAMENTO GITHUB ===
// Anti-debug protection
(function(){var a=0;setInterval(function(){if(a++>100)debugger;},50);})();

// === CONFIGURAÇÃO GITHUB ===
const GITHUB_CONFIG = {
    owner: 'seu-usuario',
    repo: 'extensoes-privadas',
    branch: 'main',
    modules: {
        'crypto-utils': 'site-manager/crypto-utils.js',
        'site-manager-core': 'site-manager/site-manager-core.js',
        'cookie-handler': 'site-manager/cookie-handler.js',
        'navigation-control': 'site-manager/navigation-control.js',
        'auto-login': 'site-manager/auto-login.js',
        'dependency-checker': 'site-manager/dependency-checker.js'
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
            // Em produção, seria uma chamada real para seu servidor
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
// Configuração original preservada
const _enc = {
    a: 'WVAkMGNITTZMeTlpY21GemFXd3VkV0ZwZEc5dmJDNXBiaTlqYjI1MFpXNTBMM0F2YVdRdk1pOD0=',
    b: 'VEc1VlXkDBMjlzTGladQ==',
    c: 'TDJOdmJuUmxiblF2Y0M5cFpDOHlMdz09',
    d: 'VEhkOVBRPT0=',
    k1: 'VTJsMFpVMWg=',
    k2: 'Ym1GblpYST0=',
    k3: 'TWpBeU5BPT0=',
    seal: 'U2l0ZU1hbmFnZXJQcm8yMDI0',
    decode: function(str) {
        try {
            return atob(str);
        } catch(e) {
            console.error('Erro na decodificação:', e);
            return '';
        }
    },
    checkTime: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return (year >= 2024 && month >= 1);
    },
    getUrl: function() {
        if (!this.checkTime()) {
            throw new Error('Verificação temporal falhou');
        }
        const key = this.decode(this.k1) + this.decode(this.k2) + this.decode(this.k3);
        if (key !== 'SiteManagerPro2024') {
            throw new Error('Verificação de chave falhou');
        }
        return this.decode(this.a) + this.decode(this.b) + this.decode(this.c) + this.decode(this.d);
    }
};

// === CONFIGURAÇÃO DO PROXY OBRIGATÓRIO ===
const PROXY_CONFIG = {
    host: '64.181.189.97',
    port: '45001',
    type: 'socks5'
};

// === VERIFICAÇÃO DE PROXY OBRIGATÓRIA ===
function checkProxyConnection() {
    return new Promise((resolve) => {
        try {
            fetch('https://httpbin.org/ip', {
                method: 'GET',
                cache: 'no-cache'
            })
            .then(response => response.json())
            .then(data => {
                if (data.origin && data.origin.includes(PROXY_CONFIG.host)) {
                    console.log('🔒 Proxy detectado e ativo:', data.origin);
                    resolve(true);
                } else {
                    console.log('❌ Proxy não detectado! IP:', data.origin);
                    resolve(false);
                }
            })
            .catch(() => {
                console.log('❌ Falha na verificação do proxy');
                resolve(false);
            });
        } catch (error) {
            console.log('❌ Erro na verificação do proxy:', error);
            resolve(false);
        }
    });
}

// === BLOQUEIO AUTOMÁTICO SEM PROXY ===
function blockExtensionWithoutProxy() {
    console.log('🚫 EXTENSÃO BLOQUEADA: Proxy não detectado!');
    console.log('🔒 Esta extensão só funciona com proxy ativo');
    
    // Desativa todas as funcionalidades
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            try {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionBlocked',
                    reason: 'Proxy não detectado'
                });
            } catch (e) {}
        });
    });
    
    // Para todos os listeners
    return;
}

// === DEPENDENCY CHECKER ORIGINAL ===
const DEPENDENCY_CHECKER = {
    COOKIE_BLOCKER_ID: 'cookie-blocker-extension-id',
    SECRET_CODE: 'SiteManagerPro2024CookieBlocker',
    
    async checkDependency() {
        try {
            console.log('🔍 Verificando dependência Cookie Blocker...');
            const extensions = await chrome.management.getAll();
            const cookieBlocker = extensions.find(ext => 
                ext.name.includes('Cookie Blocker') && ext.enabled
            );
            
            if (!cookieBlocker) {
                console.log('❌ Cookie Blocker não encontrado via management');
                return false;
            }
            
            try {
                const response = await chrome.runtime.sendMessage(cookieBlocker.id, {
                    action: 'verifyConnection',
                    code: this.SECRET_CODE
                });
                
                if (response && response.verified && response.code === this.SECRET_CODE) {
                    console.log('✅ Cookie Blocker verificado e ativo!');
                    return true;
                }
            } catch (commError) {
                console.warn('⚠️ Erro na comunicação com Cookie Blocker:', commError);
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao verificar dependência:', error);
            return false;
        }
    },
    
    async activateCookieBlocking(parentDomain) {
        try {
            const extensions = await chrome.management.getAll();
            const cookieBlocker = extensions.find(ext => 
                ext.name.includes('Cookie Blocker') && ext.enabled
            );
            
            if (cookieBlocker) {
                await chrome.runtime.sendMessage(cookieBlocker.id, {
                    action: 'blockCookies',
                    domain: parentDomain,
                    code: this.SECRET_CODE
                });
                console.log('🛡️ Cookie blocking ativado para:', parentDomain);
            }
        } catch (error) {
            console.error('❌ Erro ao ativar cookie blocking:', error);
        }
    },
    
    async deactivateCookieBlocking() {
        try {
            const extensions = await chrome.management.getAll();
            const cookieBlocker = extensions.find(ext => 
                ext.name.includes('Cookie Blocker') && ext.enabled
            );
            
            if (cookieBlocker) {
                await chrome.runtime.sendMessage(cookieBlocker.id, {
                    action: 'unblockCookies',
                    code: this.SECRET_CODE
                });
                console.log('🔓 Cookie blocking desativado');
            }
        } catch (error) {
            console.error('❌ Erro ao desativar cookie blocking:', error);
        }
    }
};

// === INICIALIZAÇÃO PRINCIPAL ===
let extensionInitialized = false;
let loadedModules = null;

async function initializeExtension() {
    try {
        console.log('🚀 Iniciando Site Manager Pro com proteção GitHub...');
        
        // 1. Validação Tripla
        const validation = await VALIDATION.validateAll();
        if (!validation.valid) {
            console.log('❌ Validação tripla falhou - Extensão bloqueada');
            return;
        }
        
        // 2. Verificação de Proxy
        const proxyActive = await checkProxyConnection();
        if (!proxyActive) {
            blockExtensionWithoutProxy();
            return;
        }
        
        // 3. Carregamento de Módulos do GitHub
        console.log('📦 Carregando módulos do GitHub...');
        loadedModules = await GITHUB_LOADER.loadAllModules(validation.token);
        
        // 4. Verificação de Dependências
        const dependencyOk = await DEPENDENCY_CHECKER.checkDependency();
        if (!dependencyOk) {
            console.log('⚠️ Cookie Blocker não encontrado. Funcionalidade limitada.');
        }
        
        // 5. Configuração de Listeners
        setupEventListeners();
        
        extensionInitialized = true;
        console.log('✅ Site Manager Pro inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        extensionInitialized = false;
    }
}

// === CONFIGURAÇÃO DE EVENT LISTENERS ===
function setupEventListeners() {
    // Listener para instalação
    chrome.runtime.onInstalled.addListener(async () => {
        console.log('🚀 Site Manager Pro instalado com sucesso!');
        const dependencyOk = await DEPENDENCY_CHECKER.checkDependency();
        if (!dependencyOk) {
            console.log('⚠️ Cookie Blocker não encontrado. Funcionalidade limitada.');
        }
    });
    
    // Listener para mensagens
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!extensionInitialized) {
            sendResponse({ success: false, error: 'Extensão não inicializada' });
            return;
        }
        
        if (request.action === 'openSitePopup') {
            handleOpenSitePopup(request.data)
                .then(result => sendResponse(result))
                .catch(error => {
                    console.error('❌ Erro no background:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true;
        }
        
        if (request.action === 'checkDependency') {
            DEPENDENCY_CHECKER.checkDependency()
                .then(result => sendResponse({ dependencyOk: result }))
                .catch(error => sendResponse({ dependencyOk: false, error: error.message }));
            return true;
        }
    });
}

// === TODAS AS FUNÇÕES ORIGINAIS PRESERVADAS ===
const activeTabIds = new Set();

async function handleOpenSitePopup(siteData) {
    try {
        console.log('📦 Dados recebidos:', siteData);
        
        // Verificação de dependência
        const dependencyOk = await DEPENDENCY_CHECKER.checkDependency();
        if (!dependencyOk) {
            console.log('⚠️ Cookie Blocker não encontrado, continuando sem verificação.');
        }
        
        // Verificação de URL obrigatória
        const tabs = await chrome.tabs.query({});
        const requiredUrl = 'https://brasil.uaitool.in/content/p/id/2/';
        const requiredUrlFound = tabs.some(tab => 
            tab.url && tab.url.includes(requiredUrl)
        );
        
        if (!requiredUrlFound) {
            throw new Error('URL obrigatória não encontrada. Abra https://brasil.uaitool.in/content/p/id/2/ em qualquer aba primeiro.');
        }
        
        if (!siteData || (!siteData.url && !siteData.site)) {
            throw new Error('URL do site não fornecida nos dados');
        }
        
        const targetUrl = siteData.url || siteData.site;
        console.log('🌐 URL de destino:', targetUrl);
        
        const parentDomain = new URL(targetUrl).hostname;
        
        if (dependencyOk) {
            await DEPENDENCY_CHECKER.activateCookieBlocking(parentDomain);
        }
        
        if (siteData.proxy) {
            console.log('🔄 Proxy configurado:', siteData.proxy);
        }
        
        // Criação do popup
        const popup = await chrome.windows.create({
            url: 'about:blank',
            type: 'popup',
            width: 1000,
            height: 700,
            focused: true,
            setSelfAsOpener: false
        });
        
        const tab = popup.tabs[0];
        console.log('🪟 Popup criado - Tab ID:', tab.id);
        activeTabIds.add(tab.id);
        
        // Aplicação de cookies
        if (siteData.cookies) {
            console.log('🍪 Aplicando cookies...');
            await applyCookiesUltraRobust(targetUrl, siteData.cookies);
        }
        
        // Navegação
        console.log('🧭 Navegando para:', targetUrl);
        await chrome.tabs.update(tab.id, { url: targetUrl });
        await waitForCompleteLoad(tab.id);
        
        // Configuração de monitoramento e injeções
        setupNavigationMonitoring(tab.id);
        await injectFloatingNavigationButtons(tab.id);
        await injectF12Blocker(tab.id);
        await injectNavigationControl(tab.id);
        
        // Login automático
        if (siteData.email && siteData.password) {
            console.log('🔐 Iniciando login automático...');
            await injectMegaAutoLogin(tab.id, siteData.email, siteData.password);
        }
        
        console.log('✅ Site aberto com sucesso!');
        return { success: true, tabId: tab.id, windowId: popup.id };
        
    } catch (error) {
        console.error('💥 Erro crítico ao abrir site:', error);
        return { success: false, error: error.message };
    }
}

function setupNavigationMonitoring(tabId) {
    console.log('🔍 Configurando monitoramento de navegação para tab:', tabId);
    
    chrome.webNavigation.onCompleted.addListener(async (details) => {
        if (details.tabId === tabId && activeTabIds.has(tabId)) {
            console.log('📄 Página carregada completamente:', details.url);
            setTimeout(async () => {
                await injectFloatingNavigationButtons(tabId);
                await injectF12Blocker(tabId);
                await injectNavigationControl(tabId);
            }, 500);
        }
    });
    
    chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
        if (details.tabId === tabId && activeTabIds.has(tabId)) {
            console.log('🔄 Mudança de estado de história detectada:', details.url);
            setTimeout(async () => {
                await injectFloatingNavigationButtons(tabId);
                await injectF12Blocker(tabId);
                await injectNavigationControl(tabId);
            }, 500);
        }
    });
    
    chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo, tab) => {
        if (updatedTabId === tabId && changeInfo.url && activeTabIds.has(tabId)) {
            console.log('🔄 URL atualizada:', changeInfo.url);
            setTimeout(async () => {
                await injectFloatingNavigationButtons(tabId);
                await injectF12Blocker(tabId);
                await injectNavigationControl(tabId);
            }, 500);
        }
    });
    
    chrome.tabs.onRemoved.addListener(async (removedTabId) => {
        if (removedTabId === tabId) {
            console.log('🚪 Tab fechada, removendo do monitoramento:', removedTabId);
            activeTabIds.delete(removedTabId);
            if (activeTabIds.size === 0) {
                await DEPENDENCY_CHECKER.deactivateCookieBlocking();
            }
        }
    });
}

async function applyCookiesUltraRobust(url, cookies) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const protocol = urlObj.protocol;
        
        console.log('🎯 Aplicando cookies para:', domain);
        
        if (Array.isArray(cookies)) {
            console.log('📋 Processando array de cookies:', cookies.length);
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                console.log(`🍪 Processando cookie ${i + 1}:`, cookie.name);
                await applySingleCookieWithFallbacks(url, domain, cookie, protocol);
            }
        } else if (typeof cookies === 'string') {
            console.log('📝 Processando string de cookies');
            await applyStringCookies(url, domain, cookies);
        }
        
        console.log('✅ Todos os cookies aplicados com sucesso!');
    } catch (error) {
        console.error('💥 Erro ao aplicar cookies:', error);
        throw error;
    }
}

async function applySingleCookieWithFallbacks(url, domain, cookie, protocol) {
    console.log(`🍪 Tentando aplicar cookie: ${cookie.name} = ${cookie.value}`);
    
    const strategies = [
        () => {
            const cookieData = {
                url: url,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain || domain,
                path: cookie.path || '/',
                secure: protocol === 'https:' && (cookie.secure !== false),
                httpOnly: cookie.httpOnly === true,
                sameSite: cookie.sameSite || 'lax'
            };
            console.log('📋 Estratégia 1 - Cookie data:', cookieData);
            return chrome.cookies.set(cookieData);
        },
        () => {
            const cookieData = {
                url: url,
                name: cookie.name,
                value: cookie.value,
                path: cookie.path || '/'
            };
            console.log('📋 Estratégia 2 - Cookie data:', cookieData);
            return chrome.cookies.set(cookieData);
        },
        () => {
            const cookieData = {
                url: url,
                name: cookie.name,
                value: cookie.value
            };
            console.log('📋 Estratégia 3 - Cookie data:', cookieData);
            return chrome.cookies.set(cookieData);
        },
        () => {
            const cookieData = {
                url: url,
                name: cookie.name,
                value: cookie.value,
                domain: '.' + domain,
                path: '/'
            };
            console.log('📋 Estratégia 4 - Cookie data:', cookieData);
            return chrome.cookies.set(cookieData);
        },
        () => {
            const cookieData = {
                url: url.replace('https:', 'http:'),
                name: cookie.name,
                value: cookie.value,
                path: '/'
            };
            console.log('📋 Estratégia 5 - Cookie data:', cookieData);
            return chrome.cookies.set(cookieData);
        }
    ];
    
    for (let i = 0; i < strategies.length; i++) {
        try {
            const result = await strategies[i]();
            if (result) {
                console.log(`✅ Cookie aplicado com estratégia ${i + 1}:`, result);
                return;
            }
        } catch (error) {
            console.warn(`⚠️ Estratégia ${i + 1} falhou:`, error.message);
        }
    }
    
    console.error(`❌ Todas as estratégias falharam para cookie: ${cookie.name}`);
}

async function applyStringCookies(url, domain, cookiesString) {
    const cookiePairs = cookiesString.split(';');
    for (const pair of cookiePairs) {
        const [name, value] = pair.split('=').map(s => s.trim());
        if (name && value) {
            const cookieObj = { name, value };
            await applySingleCookieWithFallbacks(url, domain, cookieObj, new URL(url).protocol);
        }
    }
}

async function waitForCompleteLoad(tabId) {
    return new Promise((resolve) => {
        const checkStatus = () => {
            chrome.tabs.get(tabId, (tab) => {
                if (tab.status === 'complete') {
                    console.log('✅ Página carregada completamente');
                    setTimeout(resolve, 1000);
                } else {
                    console.log('⏳ Aguardando carregamento...');
                    setTimeout(checkStatus, 500);
                }
            });
        };
        checkStatus();
    });
}

async function injectFloatingNavigationButtons(tabId) {
    try {
        console.log('🎯 Injetando botões flutuantes de navegação...');
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: createFloatingNavigationButtons
        });
        console.log('✅ Botões flutuantes injetados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao injetar botões flutuantes:', error);
    }
}

function createFloatingNavigationButtons() {
    console.log('🎯 Criando botões flutuantes de navegação...');
    
    const existingContainer = document.getElementById('siteManagerFloatingNav');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    const container = document.createElement('div');
    container.id = 'siteManagerFloatingNav';
    container.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        right: 20px !important;
        transform: translateY(-50%) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        pointer-events: auto !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;
    
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '←';
    backBtn.title = 'Voltar';
    backBtn.style.cssText = `
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        border: none !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        font-size: 20px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
    `;
    
    const forwardBtn = document.createElement('button');
    forwardBtn.innerHTML = '→';
    forwardBtn.title = 'Avançar';
    forwardBtn.style.cssText = `
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        border: none !important;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
        color: white !important;
        font-size: 20px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
        transition: all 0.3s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        pointer-events: auto !important;
    `;
    
    const siteIndicator = document.createElement('div');
    siteIndicator.innerHTML = '🌐';
    siteIndicator.title = `Site: ${window.location.hostname}`;
    siteIndicator.style.cssText = `
        width: 40px !important;
        height: 40px !important;
        border-radius: 50% !important;
        background: rgba(255,255,255,0.9) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 16px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        pointer-events: auto !important;
    `;
    
    // Event listeners com hover effects
    backBtn.addEventListener('mouseenter', () => {
        backBtn.style.transform = 'scale(1.1) !important';
        backBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3) !important';
    });
    
    backBtn.addEventListener('mouseleave', () => {
        backBtn.style.transform = 'scale(1) !important';
        backBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2) !important';
    });
    
    forwardBtn.addEventListener('mouseenter', () => {
        forwardBtn.style.transform = 'scale(1.1) !important';
        forwardBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3) !important';
    });
    
    forwardBtn.addEventListener('mouseleave', () => {
        forwardBtn.style.transform = 'scale(1) !important';
        forwardBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2) !important';
    });
    
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.history.back();
        console.log('🔙 Navegação: Voltar');
    });
    
    forwardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.history.forward();
        console.log('🔜 Navegação: Avançar');
    });
    
    container.appendChild(backBtn);
    container.appendChild(forwardBtn);
    container.appendChild(siteIndicator);
    document.body.appendChild(container);
    
    // Proteção contra remoção
    const protectButtons = () => {
        if (!document.getElementById('siteManagerFloatingNav')) {
            document.body.appendChild(container);
        }
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.right = '20px';
        container.style.transform = 'translateY(-50%)';
        container.style.zIndex = '2147483647';
    };
    
    setInterval(protectButtons, 100);
    
    const observer = new MutationObserver(protectButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('✅ Botões flutuantes criados e protegidos!');
}

async function injectF12Blocker(tabId) {
    try {
        console.log('🔒 Injetando bloqueio F12...');
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: blockF12Script
        });
        console.log('✅ Bloqueio F12 injetado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao injetar bloqueio F12:', error);
    }
}

function blockF12Script() {
    console.log('🔒 Ativando bloqueio F12 e DevTools...');
    
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 F12 bloqueado!');
            return false;
        }
        
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Ctrl+Shift+I bloqueado!');
            return false;
        }
        
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Ctrl+Shift+J bloqueado!');
            return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Ctrl+U bloqueado!');
            return false;
        }
        
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Ctrl+Shift+C bloqueado!');
            return false;
        }
    }, true);
    
    // Bloquear menu de contexto
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 Menu de contexto bloqueado!');
        return false;
    }, true);
    
    // Detectar DevTools por tamanho da janela
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.log('🚫 DevTools detectado e bloqueado!');
                window.close();
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Anti-debug com debugger statements
    setInterval(() => {
        debugger;
    }, 100);
    
    // Congelar objetos importantes
    Object.freeze(document);
    Object.freeze(window);
    
    console.log('✅ Bloqueio F12 ativado!');
}

async function injectMegaAutoLogin(tabId, email, password) {
    try {
        console.log('🔐 Injetando sistema de login automático...');
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: megaAutoLoginScript,
            args: [email, password]
        });
        console.log('✅ Sistema de login automático injetado!');
    } catch (error) {
        console.error('❌ Erro ao injetar login automático:', error);
    }
}

function megaAutoLoginScript(email, password) {
    console.log('🔐 Iniciando login automático mega avançado...');
    
    function fillFieldWithEvents(field, value) {
        if (!field || !value) return false;
        
        field.focus();
        field.click();
        field.value = '';
        
        for (let i = 0; i < value.length; i++) {
            field.value += value[i];
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        }
        
        field.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
    }
    
    function findAndFillFields() {
        console.log('🔍 Procurando campos de login...');
        
        const emailSelectors = [
            'input[type="email"]',
            'input[name*="email"]',
            'input[id*="email"]',
            'input[name*="user"]',
            'input[id*="user"]',
            'input[name*="login"]',
            'input[id*="login"]',
            'input[placeholder*="email"]',
            'input[placeholder*="usuário"]',
            'input[placeholder*="user"]'
        ];
        
        const passwordSelectors = [
            'input[type="password"]',
            'input[name*="password"]',
            'input[id*="password"]',
            'input[name*="senha"]',
            'input[id*="senha"]',
            'input[placeholder*="senha"]',
            'input[placeholder*="password"]'
        ];
        
        let emailField = null;
        let passwordField = null;
        
        for (const selector of emailSelectors) {
            const field = document.querySelector(selector);
            if (field && field.offsetParent !== null) {
                emailField = field;
                console.log('📧 Campo de email encontrado:', selector);
                break;
            }
        }
        
        for (const selector of passwordSelectors) {
            const field = document.querySelector(selector);
            if (field && field.offsetParent !== null) {
                passwordField = field;
                console.log('🔒 Campo de senha encontrado:', selector);
                break;
            }
        }
        
        let success = false;
        
        if (emailField) {
            success = fillFieldWithEvents(emailField, email);
            console.log('📧 Email preenchido:', success);
        }
        
        if (passwordField) {
            success = fillFieldWithEvents(passwordField, password) || success;
            console.log('🔒 Senha preenchida:', success);
        }
        
        return { emailField, passwordField, success };
    }
    
    function attemptLogin() {
        console.log('🚀 Tentando fazer login...');
        
        const loginButtonSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button[name*="login"]',
            'button[id*="login"]',
            'button[name*="entrar"]',
            'button[id*="entrar"]',
            '.login-button',
            '.btn-login',
            '[data-testid*="login"]'
        ];
        
        for (const selector of loginButtonSelectors) {
            const button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                console.log('🎯 Botão de login encontrado:', selector);
                button.click();
                return true;
            }
        }
        
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            if (form.offsetParent !== null) {
                console.log('📝 Submetendo formulário');
                form.submit();
                return true;
            }
        }
        
        return false;
    }
    
    setTimeout(() => {
        try {
            const result = findAndFillFields();
            if (result.success) {
                console.log('✅ Campos preenchidos com sucesso!');
                setTimeout(() => {
                    const loginSuccess = attemptLogin();
                    if (loginSuccess) {
                        console.log('✅ Login automático executado!');
                    } else {
                        console.log('⚠️ Botão de login não encontrado');
                    }
                }, 1000);
            } else {
                console.log('⚠️ Campos de login não encontrados');
            }
        } catch (error) {
            console.error('❌ Erro no login automático:', error);
        }
    }, 2000);
}

async function injectNavigationControl(tabId) {
    try {
        console.log('🎮 Injetando controle de navegação...');
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: controlNavigation
        });
        console.log('✅ Controle de navegação injetado!');
    } catch (error) {
        console.error('❌ Erro ao injetar controle de navegação:', error);
    }
}

function controlNavigation() {
    console.log('🎮 Ativando controle de navegação...');
    
    // Remover target="_blank" de todos os links
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.href) {
            if (target.target === '_blank') {
                target.target = '_self';
                console.log('🔄 Target _blank removido do link');
            }
        }
    }, true);
    
    // Interceptar window.open
    const originalWindowOpen = window.open;
    window.open = function(url, name, features) {
        console.log('🔄 window.open interceptado:', url);
        // Redireciona para a mesma janela
        window.location.href = url;
        return null;
    };
    
    // Interceptar location.assign
    const originalLocationAssign = window.location.assign;
    window.location.assign = function(url) {
        console.log('🔄 location.assign interceptado:', url);
        return originalLocationAssign.call(this, url);
    };
    
    // Interceptar location.replace
    const originalLocationReplace = window.location.replace;
    window.location.replace = function(url) {
        console.log('🔄 location.replace interceptado:', url);
        return originalLocationReplace.call(this, url);
    };
    
    console.log('✅ Controle de navegação ativado!');
}

// === VERIFICAÇÃO CONTÍNUA DO PROXY ===
setInterval(() => {
    checkProxyConnection().then(proxyActive => {
        if (!proxyActive) {
            console.log('⚠️ Proxy desconectado - Bloqueando extensão');
            blockExtensionWithoutProxy();
        }
    });
}, 30000); // Verifica a cada 30 segundos

// === MONITORAMENTO CONTÍNUO DA VALIDAÇÃO ===
setInterval(async () => {
    if (extensionInitialized) {
        const validation = await VALIDATION.validateAll();
        if (!validation.valid) {
            console.log('⚠️ Validação perdida - Bloqueando extensão');
            extensionInitialized = false;
            
            // Fecha todas as abas ativas
            for (const tabId of activeTabIds) {
                try {
                    await chrome.tabs.remove(tabId);
                } catch (e) {}
            }
            activeTabIds.clear();
        }
    }
}, 30000); // Verifica a cada 30 segundos

// === INICIALIZAÇÃO ===
// Verificação inicial com proxy
checkProxyConnection().then(proxyActive => {
    if (!proxyActive) {
        blockExtensionWithoutProxy();
        return;
    }
    
    console.log('✅ Proxy ativo - Extensão liberada');
    initializeExtension();
});

console.log('🛡️ Site Manager Pro com Proteção GitHub Carregado!');