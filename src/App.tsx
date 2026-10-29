import { useEffect, useState, useMemo } from 'react';
import { BridgeModal, type BridgeStatus } from './components/BridgeModal';

interface HistoryItem {
  id: number;
  text: string;
  timestamp: number;
  is_pinned: number;
  source_app?: string;
}

const translations = {
  en: {
    title: "SourceClip",
    subtitle: "Clipboard manager",
    searchPlaceholder: "Search clipboard...",
    clearAll: "Clear",
    clearAllTooltip: "Clear unpinned items",
    confirmClear: "Are you sure you want to delete all unpinned items?",
    pinTitle: "Pin to top",
    unpinTitle: "Unpin",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    deleteTitle: "Delete item",
    emptySearch: "No matches found",
    emptySearchSub: "Try a different search keyword",
    emptyMsg: "Your clipboard is empty",
    emptySub: "Any text you copy will automatically appear here.",
    fullTextTitle: "Clipboard Snippet",
    closeBtn: "Close",
    allTab: "All",
    pinnedTab: "Pinned",
    chars: "chars",
    words: "words",
    itemsCount: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
    bridgeBtn: "Bridge",
    phoneBadge: "Phone",
    pairingRequestTitle: "Phone Pairing Request",
    pairingRequestPrompt: "An Android phone on your Wi-Fi is requesting to connect:",
    approve: "Approve Pairing",
    reject: "Reject",
    verificationPin: "PIN",
    receivedSnippet: "Received text snippet from Phone"
  },
  si: {
    title: "SourceClip",
    subtitle: "ක්ලිප්බෝඩ් මැනේජර්",
    searchPlaceholder: "සොයන්න...",
    clearAll: "මකන්න",
    clearAllTooltip: "Pin නොකළ සියල්ල මකන්න",
    confirmClear: "Pin නොකළ සියලු සටහන් මකා දැමිය යුතුද?",
    pinTitle: "Pin කරන්න",
    unpinTitle: "Unpin කරන්න",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    deleteTitle: "මකා දමන්න",
    emptySearch: "සොයාගත නොහැකි විය",
    emptySearchSub: "වෙනත් වචනයක් යොදා බලන්න",
    emptyMsg: "ක්ලිප්බෝඩ් එක හිස්ව ඇත",
    emptySub: "ඔබ කොපි කරන ඕනෑම පාඨයක් මෙහි දිස්වේ.",
    fullTextTitle: "සටහන විස්තරය",
    closeBtn: "වසන්න",
    allTab: "සියල්ල",
    pinnedTab: "Pinned",
    chars: "අකුරු",
    words: "වචන",
    itemsCount: (count: number) => `සටහන් ${count}`,
    bridgeBtn: "බ්‍රිජ්",
    phoneBadge: "දුරකථනය",
    pairingRequestTitle: "දුරකථන සම්බන්ධතා ඉල්ලීමක්",
    pairingRequestPrompt: "ඔබගේ Wi-Fi ජාලයේ ඇති දුරකථනයක් SourceClip සමඟ සම්බන්ධ වීමට ඉල්ලයි:",
    approve: "අනුමත කරන්න",
    reject: "ප්‍රතික්ෂේප කරන්න",
    verificationPin: "PIN අංකය",
    receivedSnippet: "දුරකථනයෙන් නව සටහනක් ලැබුණි"
  }
};

// SVG Icons
const Icons = {
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  X: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Copy: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  StarOutline: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  StarFilled: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  ClipboardApp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
  InboxEmpty: () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7z"></path>
      <path d="M5.45 5.11L2 12v0"></path>
      <path d="M18.55 5.11L22 12v0"></path>
      <path d="M5.45 5.11A2 2 0 0 1 7.37 4h9.26a2 2 0 0 1 1.92 1.11L22 12"></path>
    </svg>
  )
};

function formatRelativeTime(timestamp: number, lang: 'en' | 'si'): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  
  if (diffSec < 60) {
    return lang === 'si' ? 'දැන්' : 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return lang === 'si' ? `${diffMin}m පෙර` : `${diffMin}m ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return lang === 'si' ? `${diffHours}h පෙර` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return lang === 'si' ? `${diffDays}d පෙර` : `${diffDays}d ago`;
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lang, setLang] = useState<'en' | 'si'>('en');
  const [activeTab, setActiveTab] = useState<'all' | 'pinned'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [modalCopied, setModalCopied] = useState(false);

  // SourceClip Bridge states
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [pendingPairing, setPendingPairing] = useState<any | null>(null);
  const [bridgeToast, setBridgeToast] = useState<{ text: string } | null>(null);

  const t = translations[lang];

  const loadHistory = async (keyword = '') => {
    // @ts-ignore
    if (window.api?.searchHistory) {
      // @ts-ignore
      const data = await window.api.searchHistory(keyword);
      setHistory(data || []);
    }
  };

  useEffect(() => {
    loadHistory(searchTerm);
  }, [searchTerm]);

  // Load initial bridge status and subscribe to events
  useEffect(() => {
    // @ts-ignore
    if (window.api?.getBridgeStatus) {
      // @ts-ignore
      window.api.getBridgeStatus().then((status: BridgeStatus) => {
        setBridgeStatus(status);
      });
    }

    // @ts-ignore
    if (window.api?.onBridgeStatusChange) {
      // @ts-ignore
      window.api.onBridgeStatusChange((status: BridgeStatus) => {
        setBridgeStatus(status);
      });
    }

    // @ts-ignore
    if (window.api?.onBridgePairingRequest) {
      // @ts-ignore
      window.api.onBridgePairingRequest((req: any) => {
        setPendingPairing(req);
      });
    }

    // @ts-ignore
    if (window.api?.onBridgeContentReceived) {
      // @ts-ignore
      window.api.onBridgeContentReceived(() => {
        setBridgeToast({ text: t.receivedSnippet });
        loadHistory(searchTerm);
        setTimeout(() => setBridgeToast(null), 3500);
      });
    }
  }, [lang]);

  useEffect(() => {
    // @ts-ignore
    if (window.api?.onClipboardUpdate) {
      // @ts-ignore
      window.api.onClipboardUpdate(() => {
        loadHistory(searchTerm);
      });
    }
  }, [searchTerm]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingPairing) {
          setPendingPairing(null);
        } else if (isBridgeModalOpen) {
          setIsBridgeModalOpen(false);
        } else if (selectedItem) {
          setSelectedItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingPairing, isBridgeModalOpen, selectedItem]);

  const handleCopy = (id: number, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // @ts-ignore
    if (window.api?.copyToClipboard) {
      // @ts-ignore
      window.api.copyToClipboard(text);
    }
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1400);
  };

  const handleModalCopy = (text: string) => {
    // @ts-ignore
    if (window.api?.copyToClipboard) {
      // @ts-ignore
      window.api.copyToClipboard(text);
    }
    setModalCopied(true);
    setTimeout(() => {
      setModalCopied(false);
    }, 1400);
  };

  const handleDelete = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // @ts-ignore
    if (window.api?.deleteEntry) {
      // @ts-ignore
      window.api.deleteEntry(id);
      loadHistory(searchTerm);
    }
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleClearHistory = () => {
    if (window.confirm(t.confirmClear)) {
      // @ts-ignore
      if (window.api?.clearHistory) {
        // @ts-ignore
        window.api.clearHistory();
        loadHistory(searchTerm);
      }
    }
  };

  const handleTogglePin = (id: number, currentStatus: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = currentStatus === 1 ? 0 : 1;
    // @ts-ignore
    if (window.api?.togglePin) {
      // @ts-ignore
      window.api.togglePin(id, newStatus);
      loadHistory(searchTerm);
    }
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, is_pinned: newStatus });
    }
  };

  // Bridge control actions
  const handleStartBridge = async () => {
    // @ts-ignore
    if (window.api?.startBridge) {
      // @ts-ignore
      const res = await window.api.startBridge();
      setBridgeStatus(res);
    }
  };

  const handleStopBridge = async () => {
    // @ts-ignore
    if (window.api?.stopBridge) {
      // @ts-ignore
      await window.api.stopBridge();
      // @ts-ignore
      const res = await window.api.getBridgeStatus();
      setBridgeStatus(res);
    }
  };

  const handleSetBridgeIp = async (ip: string) => {
    // @ts-ignore
    if (window.api?.setBridgeIp) {
      // @ts-ignore
      await window.api.setBridgeIp(ip);
      // @ts-ignore
      const res = await window.api.getBridgeStatus();
      setBridgeStatus(res);
    }
  };

  const handleUnpairBridge = async () => {
    // @ts-ignore
    if (window.api?.unpairBridgeDevice) {
      // @ts-ignore
      await window.api.unpairBridgeDevice();
      // @ts-ignore
      const res = await window.api.getBridgeStatus();
      setBridgeStatus(res);
    }
  };

  const handleRegeneratePin = async () => {
    // @ts-ignore
    if (window.api?.regenerateBridgePin) {
      // @ts-ignore
      const res = await window.api.regenerateBridgePin();
      setBridgeStatus(res);
    }
  };

  const handleApprovePairing = async () => {
    if (pendingPairing) {
      // @ts-ignore
      await window.api.approveBridgePairing(pendingPairing.id);
      setPendingPairing(null);
    }
  };

  const handleRejectPairing = async () => {
    if (pendingPairing) {
      // @ts-ignore
      await window.api.rejectBridgePairing(pendingPairing.id);
      setPendingPairing(null);
    }
  };

  const pinnedCount = useMemo(() => history.filter((item) => item.is_pinned === 1).length, [history]);

  const displayedHistory = useMemo(() => {
    if (activeTab === 'pinned') {
      return history.filter((item) => item.is_pinned === 1);
    }
    return history;
  }, [history, activeTab]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 14px 10px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-main)'
    }}>
      
      {/* Toast Notification Banner for Bridge */}
      {bridgeToast && (
        <div style={{
          position: 'fixed',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '11.5px',
          fontWeight: 500,
          boxShadow: 'var(--shadow-modal)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>📱</span>
          <span>{bridgeToast.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        {/* Brand & Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)',
            flexShrink: 0
          }}>
            <Icons.ClipboardApp />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
                margin: 0,
                lineHeight: 1.2
              }}>
                {t.title}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                {history.length}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1 }}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Actions: Bridge Button, Language, & Clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Bridge Control Button */}
          <button
            onClick={() => setIsBridgeModalOpen(true)}
            title="SourceClip Bridge (Phone sharing)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              backgroundColor: bridgeStatus?.isRunning
                ? (bridgeStatus?.connectedDevice ? '#dcfce7' : '#fef3c7')
                : 'var(--bg-subtle)',
              color: bridgeStatus?.isRunning
                ? (bridgeStatus?.connectedDevice ? '#15803d' : '#b45309')
                : 'var(--text-secondary)',
              border: `1px solid ${
                bridgeStatus?.isRunning
                  ? (bridgeStatus?.connectedDevice ? '#bbf7d0' : '#fde68a')
                  : 'var(--border-light)'
              }`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: bridgeStatus?.isRunning
                ? (bridgeStatus?.connectedDevice ? '#16a34a' : '#d97706')
                : '#94a3b8'
            }} />
            <span>📱 {t.bridgeBtn}</span>
          </button>

          {/* Minimal Language Toggle Pill */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            border: '1px solid var(--border-light)'
          }}>
            <button
              onClick={() => setLang('en')}
              style={{
                border: 'none',
                background: lang === 'en' ? 'var(--bg-surface)' : 'transparent',
                color: lang === 'en' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: lang === 'en' ? 600 : 500,
                boxShadow: lang === 'en' ? 'var(--shadow-sm)' : 'none',
                padding: '3px 7px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('si')}
              style={{
                border: 'none',
                background: lang === 'si' ? 'var(--bg-surface)' : 'transparent',
                color: lang === 'si' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: lang === 'si' ? 600 : 500,
                boxShadow: lang === 'si' ? 'var(--shadow-sm)' : 'none',
                padding: '3px 7px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              සිං
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearHistory}
            title={t.clearAllTooltip}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 9px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'var(--danger-border)';
              e.currentTarget.style.backgroundColor = 'var(--danger-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }}
          >
            <Icons.Trash />
            <span>{t.clearAll}</span>
          </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '10px',
        flexShrink: 0
      }}>
        {/* Search Input Box */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            pointerEvents: 'none'
          }}>
            <Icons.Search />
          </div>

          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 28px 7px 32px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '12.5px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-focus)';
              e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px',
                borderRadius: '50%'
              }}
            >
              <Icons.X />
            </button>
          )}
        </div>

        {/* Minimal Tab Filter (All / Pinned) */}
        {pinnedCount > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                border: 'none',
                background: activeTab === 'all' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'all' ? '#ffffff' : 'var(--text-secondary)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t.allTab} ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: activeTab === 'pinned' ? 'var(--pinned-badge-bg)' : 'transparent',
                color: activeTab === 'pinned' ? 'var(--pinned-badge-text)' : 'var(--text-secondary)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icons.StarFilled />
              <span>{t.pinnedTab} ({pinnedCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Scrollable Items List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        paddingRight: '2px'
      }}>
        {displayedHistory.length > 0 ? (
          <div className="clip-grid">
            {displayedHistory.map((item) => {
              const isCopied = copiedId === item.id;
              const isPinned = item.is_pinned === 1;
              const isFromBridge = item.source_app === 'bridge';

              return (
                <div
                  key={item.id}
                  className={`clip-card ${isPinned ? 'pinned' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Top Text Preview */}
                  <div className="clip-card-text">
                    {item.text}
                  </div>

                  {/* Bottom Footer with Meta and Actions */}
                  <div className="clip-card-footer" onClick={(e) => e.stopPropagation()}>
                    {/* Timestamp & Meta */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '10.5px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.2
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{formatRelativeTime(item.timestamp, lang)}</span>
                        {isFromBridge && (
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: 600,
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            padding: '0 4px',
                            borderRadius: '3px',
                            border: '1px solid #dbeafe'
                          }}>
                            📱 {t.phoneBadge}
                          </span>
                        )}
                      </div>
                      <span style={{ opacity: 0.8 }}>
                        {item.text.length} {t.chars}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {/* Pin/Unpin */}
                      <button
                        onClick={(e) => handleTogglePin(item.id, item.is_pinned, e)}
                        className={`action-btn action-btn-icon action-btn-pin ${isPinned ? 'pinned' : ''}`}
                        title={isPinned ? t.unpinTitle : t.pinTitle}
                      >
                        {isPinned ? <Icons.StarFilled /> : <Icons.StarOutline />}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={(e) => handleCopy(item.id, item.text, e)}
                        className={`action-btn action-btn-copy ${isCopied ? 'copied' : ''}`}
                        title={t.copyBtn}
                      >
                        {isCopied ? (
                          <>
                            <Icons.Check />
                            <span>{t.copiedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Icons.Copy />
                            <span>{t.copyBtn}</span>
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="action-btn action-btn-icon action-btn-delete"
                        title={t.deleteTitle}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Minimal Empty State */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80%',
            textAlign: 'center',
            padding: '20px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ marginBottom: '12px', opacity: 0.7 }}>
              {searchTerm ? <Icons.Search /> : <Icons.InboxEmpty />}
            </div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              margin: '0 0 4px'
            }}>
              {searchTerm ? t.emptySearch : t.emptyMsg}
            </h3>
            <p style={{ fontSize: '12px', margin: 0, maxWidth: '240px', lineHeight: 1.4 }}>
              {searchTerm ? t.emptySearchSub : t.emptySub}
            </p>
          </div>
        )}
      </div>

      {/* Bridge Configuration Modal */}
      <BridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        status={bridgeStatus}
        onStart={handleStartBridge}
        onStop={handleStopBridge}
        onSetIp={handleSetBridgeIp}
        onUnpair={handleUnpairBridge}
        onRegeneratePin={handleRegeneratePin}
        lang={lang}
      />

      {/* Explicit Pairing Request Prompt Modal */}
      {pendingPairing && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '360px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>📱</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.pairingRequestTitle}
                </h3>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t.pairingRequestPrompt}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '12px',
              margin: '10px 0 14px'
            }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {pendingPairing.deviceInfo}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                IP: {pendingPairing.ip}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.verificationPin}:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: 'var(--primary)', letterSpacing: '2px' }}>
                  {pendingPairing.pin}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleApprovePairing}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {t.approve}
              </button>
              <button
                onClick={handleRejectPairing}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {t.reject}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Full Snippet View */}
      {selectedItem && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--text-primary)'
                }}>
                  {t.fullTextTitle}
                </h3>
                {selectedItem.source_app === 'bridge' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10.5px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #dbeafe'
                  }}>
                    📱 {t.phoneBadge}
                  </span>
                )}
                {selectedItem.is_pinned === 1 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '10.5px',
                    backgroundColor: 'var(--pinned-badge-bg)',
                    color: 'var(--pinned-badge-text)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    <Icons.StarFilled />
                    <span>{t.pinnedTab}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Body / Full Text */}
            <div style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1,
              userSelect: 'text',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              backgroundColor: 'var(--bg-main)'
            }}>
              {selectedItem.text}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedItem.text.length} {t.chars} • {selectedItem.text.trim().split(/\s+/).filter(Boolean).length} {t.words}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleModalCopy(selectedItem.text)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    backgroundColor: modalCopied ? 'var(--success)' : 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {modalCopied ? (
                    <>
                      <Icons.Check />
                      <span>{t.copiedBtn}</span>
                    </>
                  ) : (
                    <>
                      <Icons.Copy />
                      <span>{t.copyBtn}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.closeBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
