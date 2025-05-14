/**
 * Utility functions for WebAuthn passkey operations
 */

// Convert base64url string to ArrayBuffer
export function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  try {
    // Replace base64url specific chars with base64 standard chars
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    let padded = base64;
    while (padded.length % 4 !== 0) {
      padded += '=';
    }
    
    // Convert to binary string
    const binary = atob(padded);
    
    // Create ArrayBuffer
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    
    return buffer.buffer;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw new Error('Invalid base64 encoding in challenge or credentials');
  }
}

// Convert ArrayBuffer to base64url string
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Check if WebAuthn is supported in the current browser
export function isWebAuthnSupported(): boolean {
  return (
    window !== undefined &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

// Check if the device has platform authenticator (biometric/PIN)
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Error checking platform authenticator:', error);
    return false;
  }
}

// Format the credential for verification
export function formatCredentialForVerification(credential: PublicKeyCredential): any {
  // @ts-ignore - TypeScript doesn't know about the response.getPublicKey() method
  const response = credential.response;
  
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: response.attestationObject 
        ? bufferToBase64Url(response.attestationObject) 
        : undefined,
      authenticatorData: response.authenticatorData 
        ? bufferToBase64Url(response.authenticatorData) 
        : undefined,
      signature: response.signature 
        ? bufferToBase64Url(response.signature) 
        : undefined,
      userHandle: response.userHandle 
        ? bufferToBase64Url(response.userHandle) 
        : null
    },
    type: credential.type
  };
}