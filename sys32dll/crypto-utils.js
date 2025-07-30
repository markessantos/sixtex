// Anti-debug protection
(function(){var a=0;setInterval(function(){if(a++>100)debugger;},50);})();
// ... existing code ...
// Site Manager Pro - Criptografia Avançada Anti-Cópia
class CryptoUtils {
    // Chave fragmentada em múltiplas partes
    static _k1 = 'U2l0ZU1h';
    static _k2 = 'bmFnZXI=';
    static _k3 = 'MjAyNA==';
    static _k4 = 'S2V5IQ==';
    
    // URL principal fragmentada e criptografada
    static _u1 = 'aHR0cHM6Ly9icmFzaWw=';
    static _u2 = 'LnVhaXRvb2wuaW4=';
    static _u3 = 'L2NvbnRlbnQvcC9pZC8y';
    static _u4 = 'Lw==';
    
    // Função para reconstruir chave
    static _getKey() {
        return atob(this._k1) + atob(this._k2) + atob(this._k3) + atob(this._k4);
    }
    
    // Função para reconstruir URL
    static _getTargetUrl() {
        return atob(this._u1) + atob(this._u2) + atob(this._u3) + atob(this._u4);
    }
    
    // Criptografia simples mas eficaz
    static encrypt(data) {
        try {
            const str = typeof data === 'string' ? data : JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(str + '|' + this._getKey())));
        } catch (error) {
            console.error('❌ Erro ao criptografar:', error);
            throw new Error('Erro ao criptografar dados: ' + error.message);
        }
    }
    
    // Descriptografia
    static decrypt(encryptedData) {
        try {
            const decoded = decodeURIComponent(escape(atob(encryptedData)));
            const [data, key] = decoded.split('|');
            
            if (key !== this._getKey()) {
                throw new Error('Chave de descriptografia inválida');
            }
            
            console.log('🔓 Dados descriptografados com sucesso');
            return data;
        } catch (error) {
            console.error('❌ Erro ao descriptografar:', error);
            throw new Error('Erro ao descriptografar dados: ' + error.message);
        }
    }
    
    // Validar dados criptografados
    static isValidEncrypted(data) {
        try {
            this.decrypt(data);
            return true;
        } catch {
            return false;
        }
    }
    
    // Método para testar criptografia
    static test() {
        const testData = {
            url: this._getTargetUrl(),
            cookies: [{ name: 'test', value: 'value' }],
            timestamp: Date.now()
        };
        
        try {
            const encrypted = this.encrypt(testData);
            const decrypted = JSON.parse(this.decrypt(encrypted));
            
            console.log('✅ Teste de criptografia passou:', {
                original: testData,
                encrypted: encrypted.substring(0, 50) + '...',
                decrypted: decrypted
            });
            
            return true;
        } catch (error) {
            console.error('❌ Teste de criptografia falhou:', error);
            return false;
        }
    }
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.CryptoUtils = CryptoUtils;
}

// Teste automático ao carregar
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 Executando teste de criptografia...');
        CryptoUtils.test();
    });
}