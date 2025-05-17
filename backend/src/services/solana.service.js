import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { decode, encode } from 'bs58';
import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { solana, jwt } from '../config';
import AppError from '../utils/appError';
import { warn, error as _error } from '../utils/logger';

// Initialize Solana connection
const connection = new Connection(
  solana.clusterEndpoint,
  solana.commitment
);

// Initialize fee payer
let feePayer;
if (solana.feePayer) {
  const secretKey = decode(solana.feePayer);
  feePayer = Keypair.fromSecretKey(secretKey);
} else {
  warn('Solana fee payer not configured. Some operations will fail.');
}

// Generate a new Solana keypair
export async function generateKeypair() {
  // Generate new keypair
  const keypair = Keypair.generate();
  
  // Encrypt private key with server-side encryption key
  const encryptionKey = scryptSync(jwt.secret, 'salt', 32);
  const iv = randomBytes(16);
  
  const cipher = createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encryptedPrivateKey = cipher.update(
    Buffer.from(keypair.secretKey).toString('hex'),
    'utf8',
    'hex'
  );
  
  encryptedPrivateKey += cipher.final('hex');
  encryptedPrivateKey = `${iv.toString('hex')}:${encryptedPrivateKey}`;
  
  return {
    publicKey: keypair.publicKey,
    encryptedPrivateKey
  };
}

// Decrypt a private key
const decryptPrivateKey = (encryptedPrivateKey) => {
  const [ivHex, encryptedHex] = encryptedPrivateKey.split(':');
  
  const encryptionKey = scryptSync(jwt.secret, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return Buffer.from(decrypted, 'hex');
};

// Get keypair from wallet
const getKeypairFromWallet = (wallet) => {
  if (!wallet.encryptedPrivateKey) {
    throw new AppError('Wallet does not have a private key', 400);
  }
  
  const privateKeyBuffer = decryptPrivateKey(wallet.encryptedPrivateKey);
  return Keypair.fromSecretKey(privateKeyBuffer);
};

// Verify a token on Solana
export async function verifyToken(tokenAddress) {
  try {
    const tokenPublicKey = new PublicKey(tokenAddress);
    const tokenInfo = await connection.getTokenSupply(tokenPublicKey);
    
    return {
      address: tokenAddress,
      decimals: tokenInfo.value.decimals,
      supply: tokenInfo.value.amount
    };
  } catch (error) {
    throw new AppError(`Failed to verify token: ${error.message}`, 400);
  }
}

// Verify a transaction
export async function verifyTransaction(txHash, walletAddress, tokenAddress, amount) {
  try {
    const transaction = await connection.getTransaction(txHash, {
      commitment: 'confirmed'
    });
    
    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }
    
    // Perform verification logic here...
    // For simplicity, we're returning success
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Send tokens
export async function sendTokens(wallet, tokenAddress, destinationAddress, amount, decimals) {
  try {
    // Get keypair
    const keypair = getKeypairFromWallet(wallet);
    
    // Create token instance
    const tokenPublicKey = new PublicKey(tokenAddress);
    const destinationPublicKey = new PublicKey(destinationAddress);
    
    // Get source token account
    const sourceTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenPublicKey,
      keypair.publicKey
    );
    
    // Get destination token account (or create if it doesn't exist)
    const destinationTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenPublicKey,
      destinationPublicKey
    );
    
    // Check if destination token account exists
    const destinationAccountInfo = await connection.getAccountInfo(destinationTokenAccount);
    
    // Create transaction
    const transaction = new Transaction();
    
    // If destination token account doesn't exist, create it
    if (!destinationAccountInfo) {
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          tokenPublicKey,
          destinationTokenAccount,
          destinationPublicKey,
          keypair.publicKey
        )
      );
    }
    
    // Add transfer instruction
    transaction.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        sourceTokenAccount,
        destinationTokenAccount,
        keypair.publicKey,
        [],
        parseInt(amount * (10 ** decimals))
      )
    );
    
    // Send transaction
    const signature = await connection.sendTransaction(
      transaction,
      [keypair],
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error) {
    _error('Error sending tokens:', error);
    throw new AppError(`Failed to send tokens: ${error.message}`, 500);
  }
}

// Get swap quote
export async function getSwapQuote(fromTokenAddress, toTokenAddress, amount, slippageTolerance) {
  // In a real app, this would call to a DEX or aggregator like Jupiter
  // For simplicity, we're returning a mock quote
  const fromTokenPublicKey = new PublicKey(fromTokenAddress);
  const toTokenPublicKey = new PublicKey(toTokenAddress);
  
  // Get token information
  const fromTokenInfo = await connection.getTokenSupply(fromTokenPublicKey);
  const toTokenInfo = await connection.getTokenSupply(toTokenPublicKey);
  
  // Mock exchange rate based on token addresses (in a real app, you'd get this from a price oracle)
  const mockRate = fromTokenAddress.charCodeAt(0) / toTokenAddress.charCodeAt(0);
  
  const expectedAmountOut = amount * mockRate;
  const minAmountOut = expectedAmountOut * (1 - slippageTolerance / 100);
  
  return {
    fromToken: fromTokenAddress,
    toToken: toTokenAddress,
    amount,
    expectedAmountOut: expectedAmountOut.toFixed(toTokenInfo.value.decimals),
    minAmountOut: minAmountOut.toFixed(toTokenInfo.value.decimals),
    price: mockRate.toFixed(8),
    priceImpact: "0.5", // Mock value
    fee: (amount * 0.003).toFixed(fromTokenInfo.value.decimals) // 0.3% fee
  };
}

// Execute swap
export async function executeSwap(wallet, fromTokenAddress, toTokenAddress, amount, minAmountOut, slippageTolerance) {
  // In a real app, this would execute a swap on a DEX like Raydium, Orca, or Jupiter
  // For now, we'll just simulate it with a mock response
  
  // Wait for a bit to simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a mock transaction hash
  const mockTxHash = encode(randomBytes(32));
  
  return mockTxHash;
}