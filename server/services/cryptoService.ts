import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class CryptoService {
    private privateKey: string | null = null;
    private publicKey: string | null = null;
    private readonly KEY_PATH = path.join(process.cwd(), 'server/secure');

    constructor() {
        this.ensureKeyDir();
    }

    private async ensureKeyDir() {
        try {
            await fs.mkdir(this.KEY_PATH, { recursive: true });
        } catch (error) {
            console.error('Failed to create secure key directory:', error);
        }
    }

    /**
     * Initialize or load local keypair for Community License signing
     */
    async initLocalKeys() {
        const privateKeyPath = path.join(this.KEY_PATH, 'local_private.pem');
        const publicKeyPath = path.join(this.KEY_PATH, 'local_public.pem');

        try {
            // Try to load existing keys
            this.privateKey = await fs.readFile(privateKeyPath, 'utf8');
            this.publicKey = await fs.readFile(publicKeyPath, 'utf8');
        } catch (error) {
            // Generate new Ed25519 keypair if not found
            const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519', {
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            });

            this.privateKey = privateKey;
            this.publicKey = publicKey;

            // Save to disk
            await fs.writeFile(privateKeyPath, privateKey);
            await fs.writeFile(publicKeyPath, publicKey);

            console.log('🔐 Generated new local signing keys for Community Licenses');
        }
    }

    /**
     * Sign a payload (e.g., license data)
     */
    sign(data: string): string {
        if (!this.privateKey) {
            throw new Error('Private key not initialized');
        }

        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.end();
        return sign.sign(this.privateKey, 'base64');
    }

    /**
     * Verify a payload signature
     * @param data The original data
     * @param signature The signature to verify
     * @param publicKey Optional public key (defaults to local if not provided)
     */
    verify(data: string, signature: string, publicKey?: string): boolean {
        const keyToUse = publicKey || this.publicKey;
        if (!keyToUse) {
            throw new Error('Public key not available');
        }

        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();
        return verify.verify(keyToUse, signature, 'base64');
    }

    /**
     * Get the local public key
     */
    getPublicKey(): string | null {
        return this.publicKey;
    }
}

export const cryptoService = new CryptoService();
