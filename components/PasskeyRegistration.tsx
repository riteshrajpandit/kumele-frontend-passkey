"use client";

import { useState } from "react";
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from "@/lib/api";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  base64UrlToBuffer,
  bufferToBase64Url,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
} from "@/lib/passkeyUtils";
import { useToast } from "@/hooks/use-toast";

interface PasskeyRegistrationProps {
  email: string;
  userToken: string;
  onSuccess?: () => void;
}

export default function PasskeyRegistration({
  email,
  userToken,
  onSuccess,
}: PasskeyRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);
  const [authSupport, setAuthSupport] = useState<{
    webAuthnSupported: boolean;
    platformAuthenticatorAvailable: boolean | null;
  }>({
    webAuthnSupported: false,
    platformAuthenticatorAvailable: null,
  });
  const { toast } = useToast();

  // Check for WebAuthn and platform authenticator support on mount
  useState(() => {
    const checkSupport = async () => {
      const webAuthnSupported = isWebAuthnSupported();
      let platformAuth = null;

      if (webAuthnSupported) {
        platformAuth = await isPlatformAuthenticatorAvailable();
      }

      setAuthSupport({
        webAuthnSupported,
        platformAuthenticatorAvailable: platformAuth,
      });
    };

    checkSupport();
  });

  const handleRegisterPasskey = async () => {
    setIsRegistering(true);
    setError("");
    setSuccess("");
    setDebugInfo({});

    if (!authSupport.webAuthnSupported) {
      setError(
        "WebAuthn is not supported in this browser. Please use a modern browser."
      );
      setIsRegistering(false);
      return;
    }

    try {
      // Step 1: Get registration options from server
      const options = await getPasskeyRegistrationOptions(email);

      const debug = {
        serverChallenge: options.challenge,
      };

      // Step 2: Prepare WebAuthn options
      const publicKeyOptions = {
        challenge: base64UrlToBuffer(options.challenge),
        rp: options.rp,
        user: {
          ...options.user,
          id: base64UrlToBuffer(options.user.id),
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        excludeCredentials: (options.excludeCredentials || []).map(
          (cred: any) => ({
            ...cred,
            id: base64UrlToBuffer(cred.id),
          })
        ),
        authenticatorSelection: options.authenticatorSelection,
        attestation: options.attestation,
      };

      // Step 3: Create credential
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      // Get client data for debugging
      const clientDataJSON = new TextDecoder().decode(
        credential.response.clientDataJSON
      );
      const parsedClientData = JSON.parse(clientDataJSON);

      debug.clientDataJSON = parsedClientData;
      debug.clientChallenge = parsedClientData.challenge;
      setDebugInfo(debug);

      // Step 4: Prepare response for server
      const attestationResponse = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
          attestationObject: bufferToBase64Url(
            // @ts-ignore - TypeScript doesn't know about the attestationObject property
            credential.response.attestationObject
          ),
        },
        type: credential.type,
      };

      // Step 5: Send to server for verification
      const verificationResponse = await verifyPasskeyRegistration({
        email: email,
        attestation: attestationResponse,
        device_name: "My Device" || "Unknown device",
      });

      setSuccess("Passkey registered successfully!");
      toast({
        title: "Success",
        description:
          "Passkey registered successfully! You can now use it to log in.",
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Passkey registration error:", error);
      setError(error.message || "Failed to register passkey");
      toast({
        title: "Registration Failed",
        description:
          error.message || "Failed to register passkey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Register Passkey
      </h2>

      {!authSupport.webAuthnSupported ? (
        <div className="p-3 bg-orange-100 border border-orange-200 rounded-md mb-4 dark:bg-orange-900/30 dark:border-orange-800">
          <p className="text-orange-700 dark:text-orange-400">
            WebAuthn is not supported in this browser. Please use a modern
            browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      ) : authSupport.platformAuthenticatorAvailable === false ? (
        <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-md mb-4 dark:bg-yellow-900/30 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-400">
            Your device doesn't have a platform authenticator (biometric sensor
            or secure PIN). You can still use a security key.
          </p>
        </div>
      ) : null}

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Add a passkey to your account for a more secure and convenient way to
        log in without passwords.
      </p>

      <button
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          isRegistering || !authSupport.webAuthnSupported
            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
        }`}
        onClick={handleRegisterPasskey}
        disabled={isRegistering || !authSupport.webAuthnSupported}
      >
        {isRegistering ? "Registering..." : "Register Passkey"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md flex items-start dark:bg-red-900/30 dark:border-red-800">
          <AlertCircle
            size={20}
            className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
          />
          <div className="text-red-700 text-sm dark:text-red-400">{error}</div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-md flex items-start dark:bg-green-900/30 dark:border-green-800">
          <CheckCircle
            size={20}
            className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
          />
          <div className="text-green-700 text-sm dark:text-green-400">
            {success}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </button>

        {showDebug && Object.keys(debugInfo).length > 0 && (
          <div className="mt-2 p-3 bg-gray-100 border border-gray-200 rounded-md overflow-auto dark:bg-gray-800/50 dark:border-gray-700">
            <pre className="text-xs text-gray-800 dark:text-gray-300">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">What are passkeys?</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Passkeys are a more secure alternative to passwords</li>
          <li>They use biometrics (fingerprint, face) or device PIN</li>
          <li>Cannot be phished or stolen like passwords</li>
          <li>
            Work across your devices with the same platform (Apple, Google)
          </li>
        </ul>
      </div>
    </div>
  );
}
