import { useState, useMemo } from 'react';
import { QRCode } from '../utils/qrcode';

export interface NetworkInterfaceInfo {
  name: string;
  address: string;
  family: string;
}

export interface BridgeStatus {
  isRunning: boolean;
  port: number;
  selectedIp: string;
  availableIps: NetworkInterfaceInfo[];
  pairingUrl: string;
  pin: string;
  connectedDevice: {
    ip: string;
    deviceInfo: string;
    pairedAt: number;
  } | null;
  pendingRequest: any | null;
}

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BridgeStatus | null;
  onStart: () => void;
  onStop: () => void;
  onSetIp: (ip: string) => void;
  onUnpair: () => void;
  onRegeneratePin: () => void;
  lang: 'en' | 'si';
}

const translations = {
  en: {
    title: "SourceClip Bridge",
    subtitle: "Share text and links from Android phone to PC over local Wi-Fi",
    enableBridge: "Enable Bridge",
    runningStatus: "Bridge is active",
    stoppedStatus: "Bridge is off",
    networkInterface: "Network Interface / IP",
    scanInstruction: "1. Connect your phone to this Wi-Fi network.",
    scanInstruction2: "2. Scan this QR code with your phone camera or browser:",
    orCopyUrl: "Or open in phone browser:",
    copyUrlBtn: "Copy Link",
    copied: "Copied!",
    verificationPin: "Pairing Verification PIN",
    regenerateQr: "Regenerate QR",
    connectedDevice: "Connected Phone",
    disconnectBtn: "Disconnect Phone",
    noDeviceConnected: "No device connected yet. Waiting for scan...",
    helpTitle: "Wi-Fi Connection Tips & Troubleshooting",
    help1: "Both your PC and phone must be on the same local Wi-Fi router.",
    help2: "Ensure 'AP Client Isolation' is disabled in your router settings.",
    help3: "Allow SourceClip through Windows Firewall on Private Networks if prompted.",
    help4: "If you have multiple network cards (Wi-Fi, Ethernet, VPN), select the active Wi-Fi IP above.",
    close: "Close"
  },
  si: {
    title: "SourceClip බ්‍රිජ් (Bridge)",
    subtitle: "දුරකථනයේ සිට PC එකට Wi-Fi හරහා සටහන් සහ links එවන්න",
    enableBridge: "බ්‍රිජ් සක්‍රිය කරන්න",
    runningStatus: "බ්‍රිජ් ක්‍රියාත්මකයි",
    stoppedStatus: "බ්‍රිජ් අක්‍රියයි",
    networkInterface: "Wi-Fi ජාල අතුරුමුහුණත / IP",
    scanInstruction: "1. දුරකථනය පරිගණකය ඇති Wi-Fi ජාලයටම සම්බන්ධ කරන්න.",
    scanInstruction2: "2. දුරකථන කැමරාවෙන් හෝ බ්‍රවුසරයෙන් මෙම QR කේතය ස්කෑන් කරන්න:",
    orCopyUrl: "නැතහොත් බ්‍රවුසරයේ ලින්ක් එක open කරන්න:",
    copyUrlBtn: "ලින්ක් එක Copy",
    copied: "Copied!",
    verificationPin: "තහවුරු කිරීමේ PIN අංකය",
    regenerateQr: "අලුත් QR එකක්",
    connectedDevice: "සම්බන්ධිත දුරකථනය",
    disconnectBtn: "දුරකථනය විසන්ධි කරන්න",
    noDeviceConnected: "තවමත් දුරකථනයක් සම්බන්ධ වී නැත. ස්කෑන් කරන තෙක් රැඳී සිටින්න...",
    helpTitle: "Wi-Fi සම්බන්ධතා උපදෙස් සහ ගැටළු නිරාකරණය",
    help1: "පරිගණකය සහ දුරකථනය එකම Wi-Fi රවුටරයට සම්බන්ධ වී තිබිය යුතුය.",
    help2: "රවුටර සැකසුම්වල 'AP Client Isolation' අක්‍රිය කර ඇත්දැයි බලන්න.",
    help3: "Windows Firewall වෙතින් SourceClip වෙත අවසර ලබා දෙන්න.",
    help4: "ජාල කිහිපයක් තිබේ නම්, ඉහතින් ඔබගේ සක්‍රිය Wi-Fi IP ලිපිනය තෝරන්න.",
    close: "වසන්න"
  }
};

export function BridgeModal({
  isOpen,
  onClose,
  status,
  onStart,
  onStop,
  onSetIp,
  onUnpair,
  onRegeneratePin,
  lang
}: BridgeModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const t = translations[lang];
  const isRunning = status?.isRunning ?? false;

  const qrSvg = useMemo(() => {
    if (!status?.pairingUrl) return '';
    try {
      const qr = new QRCode(status.pairingUrl, 'M');
      return qr.toSvg(210, 4, '#000000', '#ffffff');
    } catch (e) {
      console.error('Failed to generate QR code:', e);
      return '';
    }
  }, [status?.pairingUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (status?.pairingUrl) {
      navigator.clipboard.writeText(status.pairingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '480px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📱</span>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                {t.title}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {/* Main Toggle Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: isRunning ? 'var(--pinned-card-bg)' : 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${isRunning ? 'var(--pinned-card-border)' : 'var(--border-light)'}`,
            marginBottom: '14px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                {t.enableBridge}
              </div>
              <div style={{ fontSize: '11px', color: isRunning ? '#b45309' : 'var(--text-muted)' }}>
                {isRunning ? `🟢 ${t.runningStatus}` : `⚪ ${t.stoppedStatus}`}
              </div>
            </div>

            <button
              onClick={isRunning ? onStop : onStart}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: isRunning ? 'var(--danger-light)' : 'var(--primary)',
                color: isRunning ? 'var(--danger)' : '#ffffff',
                transition: 'all 0.15s ease'
              }}
            >
              {isRunning ? 'Turn Off' : 'Turn On'}
            </button>
          </div>

          {isRunning && (
            <>
              {/* Network Interface Selector */}
              {status && status.availableIps.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {t.networkInterface}
                  </label>
                  <select
                    value={status.selectedIp}
                    onChange={(e) => onSetIp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    {status.availableIps.map((net) => (
                      <option key={net.address} value={net.address}>
                        {net.name} ({net.address})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* QR Code & Pairing Instructions */}
              <div style={{
                textAlign: 'center',
                padding: '14px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t.scanInstruction}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  {t.scanInstruction2}
                </div>

                {qrSvg ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Generating QR...</div>
                )}

                {/* Verification PIN */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.verificationPin}</div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    color: 'var(--primary)',
                    marginTop: '2px'
                  }}>
                    {status?.pin}
                  </div>
                </div>

                {/* Actions: Copy Link & Regenerate */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                  <button
                    onClick={handleCopyUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span>{copiedUrl ? '✓ ' + t.copied : '🔗 ' + t.copyUrlBtn}</span>
                  </button>

                  <button
                    onClick={onRegeneratePin}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span>🔄 {t.regenerateQr}</span>
                  </button>
                </div>
              </div>

              {/* Connected Device Status */}
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: status?.connectedDevice ? 'var(--success-light)' : 'var(--bg-subtle)',
                border: `1px solid ${status?.connectedDevice ? '#bbf7d0' : 'var(--border-light)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>
                  {status?.connectedDevice ? (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                        ✓ {status.connectedDevice.deviceInfo}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        IP: {status.connectedDevice.ip}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>{t.noDeviceConnected}</span>
                  )}
                </div>

                {status?.connectedDevice && (
                  <button
                    onClick={onUnpair}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      backgroundColor: 'var(--danger-light)',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {t.disconnectBtn}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Troubleshooting Accordion */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
            <button
              onClick={() => setShowHelp(!showHelp)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <span>{showHelp ? '▾' : '▸'} {t.helpTitle}</span>
            </button>

            {showHelp && (
              <ul style={{
                marginTop: '8px',
                paddingLeft: '18px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <li>{t.help1}</li>
                <li>{t.help2}</li>
                <li>{t.help3}</li>
                <li>{t.help4}</li>
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

