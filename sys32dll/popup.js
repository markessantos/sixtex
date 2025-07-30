// Anti-debug protection  
(function(){var a=0;setInterval(function(){if(a++>100)debugger;},50);})();
// ... existing code ...
class SiteManagerPro {
    constructor() {
        this.statusElement = document.getElementById('status');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');
        this.activateBtn = document.getElementById('activateBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        
        this.init();
    }
    
    init() {
        console.log('🚀 Site Manager Pro inicializado');
        
        // Aguarda carregamento do CryptoUtils
        setTimeout(() => {
            this.checkRequiredUrl();
        }, 100);
        
        // Event listener para botão de ativação
        this.activateBtn.addEventListener('click', () => this.activateSite());
    }
    
    async checkRequiredUrl() {
        try {
            // Busca em todas as abas por uma que contenha a URL obrigatória
            const tabs = await chrome.tabs.query({});
            
            // URL obrigatória - CORRIGIDO
            const requiredUrl = 'brasil.uaitool.in/content/p/id/2/';
            const requiredUrlFound = tabs.some(tab => 
                tab.url && tab.url.includes(requiredUrl)
            );
            
            if (requiredUrlFound) {
                this.setStatus('ready', 'Pronto para ativar site');
                this.activateBtn.disabled = false;
                console.log('✅ URL obrigatória encontrada em uma das abas');
            } else {
                this.setStatus('error', 'Abra a URL necessária em qualquer aba');
                this.activateBtn.disabled = true;
                console.log('❌ URL obrigatória não encontrada em nenhuma aba');
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar URLs das abas:', error);
            this.setStatus('error', 'Erro ao verificar abas do navegador');
            this.activateBtn.disabled = true;
        }
    }
    
    async activateSite() {
        try {
            this.setStatus('processing', 'Lendo dados da área de transferência...');
            this.hideMessages();
            
            // Lê dados da área de transferência
            const clipboardData = await navigator.clipboard.readText();
            
            if (!clipboardData || clipboardData.trim().length === 0) {
                throw new Error('Área de transferência está vazia. Copie os dados do gerador primeiro.');
            }
            
            console.log('📋 Dados da área de transferência obtidos:', clipboardData.substring(0, 50) + '...');
            
            // Descriptografa os dados com sistema melhorado
            this.setStatus('processing', 'Descriptografando dados...');
            const decryptedData = this.decryptDataImproved(clipboardData.trim());
            
            if (!decryptedData) {
                throw new Error('Falha ao descriptografar dados. Verifique se copiou corretamente do gerador.');
            }
            
            console.log('🔓 Dados descriptografados:', decryptedData);
            
            // Valida estrutura dos dados
            this.validateSiteData(decryptedData);
            
            // Envia para background script
            this.setStatus('processing', 'Abrindo site em popup...');
            
            const response = await chrome.runtime.sendMessage({
                action: 'openSitePopup',
                data: decryptedData
            });
            
            if (response && response.success) {
                this.setStatus('ready', 'Site ativado com sucesso!');
                this.showSuccess('✅ Site aberto em popup com cookies aplicados!');
                console.log('✅ Sucesso:', response);
            } else {
                throw new Error(response?.error || 'Erro desconhecido ao abrir site');
            }
            
        } catch (error) {
            console.error('💥 Erro na ativação:', error);
            this.setStatus('error', 'Erro na ativação');
            this.showError(error.message);
        }
    }
    
    decryptDataImproved(encryptedData) {
        try {
            console.log('🔓 Tentando descriptografar dados com sistema melhorado...');
            
            // Estratégia 1: Usa o CryptoUtils se disponível
            if (typeof CryptoUtils !== 'undefined') {
                try {
                    const decryptedString = CryptoUtils.decrypt(encryptedData);
                    const data = JSON.parse(decryptedString);
                    console.log('✅ Descriptografia padrão bem-sucedida');
                    return data;
                } catch (error1) {
                    console.warn('⚠️ Descriptografia padrão falhou:', error1.message);
                }
            }
            
            // Estratégia 2: Tenta decodificar diretamente (para dados antigos)
            try {
                const decoded = atob(encryptedData);
                const data = JSON.parse(decoded);
                console.log('✅ Descriptografia direta bem-sucedida');
                return data;
            } catch (error2) {
                console.warn('⚠️ Descriptografia direta falhou:', error2.message);
            }
            
            // Estratégia 3: Tenta com decodificação URI
            try {
                const decoded = decodeURIComponent(escape(atob(encryptedData)));
                const data = JSON.parse(decoded);
                console.log('✅ Descriptografia com URI bem-sucedida');
                return data;
            } catch (error3) {
                console.warn('⚠️ Descriptografia com URI falhou:', error3.message);
            }
            
            // Estratégia 4: Tenta remover chave manualmente
            try {
                const decoded = decodeURIComponent(escape(atob(encryptedData)));
                const parts = decoded.split('|');
                if (parts.length >= 2) {
                    const dataString = parts.slice(0, -1).join('|'); // Remove última parte (chave)
                    const data = JSON.parse(dataString);
                    console.log('✅ Descriptografia manual bem-sucedida');
                    return data;
                }
            } catch (error4) {
                console.warn('⚠️ Descriptografia manual falhou:', error4.message);
            }
            
            console.error('❌ Todas as estratégias de descriptografia falharam');
            return null;
            
        } catch (error) {
            console.error('❌ Erro geral na descriptografia:', error);
            return null;
        }
    }
    
    validateSiteData(data) {
        console.log('🔍 Validando dados:', data);
        
        // Verifica URL
        if (!data.url) {
            throw new Error('URL do site não encontrada nos dados');
        }
        
        // Verifica se tem cookies ou credenciais
        const hasCookies = (data.cookies && Array.isArray(data.cookies) && data.cookies.length > 0) ||
                          (typeof data.cookies === 'string' && data.cookies.trim().length > 0);
        
        const hasCredentials = data.email && data.password;
        
        if (!hasCookies && !hasCredentials) {
            throw new Error('Dados devem conter cookies ou credenciais de login');
        }
        
        // Log de validação
        if (hasCookies) {
            const cookieCount = Array.isArray(data.cookies) ? data.cookies.length : 'string';
            console.log(`✅ Cookies válidos encontrados: ${cookieCount}`);
        }
        
        if (hasCredentials) {
            console.log('✅ Credenciais válidas encontradas');
        }
        
        if (data.proxy) {
            console.log('🔄 Proxy configurado:', data.proxy);
        }
        
        if (data.timestamp) {
            console.log('⏰ Timestamp:', new Date(data.timestamp).toLocaleString());
        }
    }
    
    setStatus(type, message) {
        // Remove classes anteriores
        this.statusElement.className = 'status';
        
        // Adiciona nova classe
        this.statusElement.classList.add(`status-${type}`);
        
        // Define ícone e texto
        const icons = {
            waiting: '⏳',
            ready: '✅',
            error: '❌',
            processing: '🔄'
        };
        
        this.statusIcon.textContent = icons[type] || '❓';
        this.statusText.textContent = message;
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }
    
    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
    
    hideMessages() {
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new SiteManagerPro();
});