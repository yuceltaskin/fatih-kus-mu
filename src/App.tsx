import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Check, 
  Heart, 
  Info, 
  Copy, 
  Settings, 
  Sliders, 
  Smile, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle2
} from "lucide-react";

// Particle interface for floating animation effects
interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function App() {
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [sulkLevel, setSulkLevel] = useState(0); // 0 to 100
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    simulated: boolean;
    recipient?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [copied, setCopied] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean | null>(null);

  // Fetch SMTP configuration status on load
  useEffect(() => {
    fetch("/api/config-status")
      .then(res => res.json())
      .then(data => {
        setIsSmtpConfigured(data.configured);
      })
      .catch(() => {
        setIsSmtpConfigured(false);
      });
  }, []);

  // Format today's date in Turkish
  useEffect(() => {
    const today = new Date();
    
    // Turkish month names
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    
    // Turkish day names
    const days = [
      "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"
    ];

    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    const dayName = days[today.getDay()];

    setCurrentDateStr(`${day} ${month} ${year}, ${dayName}`);
  }, []);

  // Generate random flying particles (hearts/doves) when clicked
  const triggerParticles = () => {
    const emojis = ["❤️", "🕊️", "✨", "💕", "🌸"];
    const newParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100, // random offset
      y: 0,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Clean up particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);
  };

  const isAngry = sulkLevel > 80;

  const handleSendEmail = async () => {
    setIsSending(true);
    setSendResult(null);
    triggerParticles();

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: currentDateStr,
          customMessage: customMessage.trim() || undefined,
          isAngry: isAngry,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSendResult({
          success: true,
          simulated: data.simulated,
          recipient: data.recipient || "yuceltaskin@outlook.com.tr",
          message: data.message || (isAngry ? "fatih sana bugun kus" : "fatih sana bugun kus degil"),
        });
      } else {
        setSendResult({
          success: false,
          simulated: false,
          error: data.error || "E-posta gönderimi başarısız oldu.",
        });
      }
    } catch (err: any) {
      console.error(err);
      setSendResult({
        success: false,
        simulated: false,
        error: "Sunucuyla iletişim kurulurken bir hata oluştu.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(isAngry ? "fatih sana bugun kus" : "fatih sana bugun kus degil");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get funny status messages based on the sulkiness slider
  const getSulkStatus = () => {
    if (sulkLevel === 0) {
      return {
        label: "Sıfır Alınganlık!",
        desc: "Fatih bugün pamuk gibi, harika bir gün! 😇",
        color: "text-emerald-700 bg-emerald-50/50 border-emerald-100",
        barColor: "bg-emerald-500"
      };
    } else if (sulkLevel <= 30) {
      return {
        label: "Hafif Esinti",
        desc: "Belki ufak bir şeye takılmıştır ama küslük falan yok kafan rahat olsun. 🍃",
        color: "text-teal-700 bg-teal-50/50 border-teal-100",
        barColor: "bg-teal-500"
      };
    } else if (sulkLevel <= 80) {
      return {
        label: "Yarı Limonî",
        desc: "Yüzünde hafif bir asıklık seziliyor, acilen tatlı bir mesaj veya kahve takviyesi gerekebilir! 🤔",
        color: "text-amber-700 bg-amber-50/50 border-amber-100",
        barColor: "bg-amber-500"
      };
    } else {
      return {
        label: "Yoğun Trip Seviyesi!",
        desc: "Kırmızı alarm! Fatih fena küsmüş, durum ciddi! 🚨",
        color: "text-rose-700 bg-rose-50/50 border-rose-100",
        barColor: "bg-[#1A1A1A]"
      };
    }
  };

  const currentSulk = getSulkStatus();

  // Pre-filled mailto link as standard fallback
  const mailtoSubject = encodeURIComponent(
    isAngry ? "Fatih Bugün Sana Küs! 💔" : "Fatih Bugün Sana Küs Değil! 😊"
  );
  const mailtoBody = encodeURIComponent(
    `Merhaba,\n\nBugünün tarihi: ${currentDateStr}\n\n${
      isAngry ? "Fatih sana bugün küs! 💔" : "Fatih sana bugün küs değil! ✨"
    }\n\n${customMessage ? `Ekstra Mesaj: ${customMessage}\n\n` : ""}Sevgiler,\nFatih Bana Küstü mü?`
  );
  const mailtoUrl = `mailto:yuceltaskin@outlook.com.tr?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div id="app-root" className="min-h-screen bg-minimalist text-[#1A1A1A] font-sans antialiased py-16 px-6 md:px-16 flex flex-col justify-between">
      
      {/* Floating Particles Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: "100vh", x: `calc(50vw + ${p.x}px)` }}
            animate={{ 
              opacity: [1, 1, 0], 
              y: "-10vh",
              x: `calc(50vw + ${p.x + (Math.random() * 100 - 50)}px)`
            }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="absolute text-3xl"
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* Header (Matching layout & border lines) */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center border-b border-gray-100 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-1">
            İLİŞKİ DURUMU SORGULAMA
          </span>
          <h1 className="text-2xl font-light tracking-tight text-gray-900">
            Fatih Bana Küstü mü?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-0.5">
            Sistem Durumu
          </span>
          <span className="flex items-center justify-end gap-2 text-sm text-green-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Aktif
          </span>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center py-12">
        
        {/* Today's Date */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-gray-400 mb-3">
            BUGÜNÜN TARİHİ
          </p>
          <div className="text-4xl md:text-6xl font-serif italic text-gray-800">
            {currentDateStr || "Yükleniyor..."}
          </div>
        </motion.div>

        {/* Interaction Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-sm flex flex-col items-stretch gap-6 w-full max-w-xl text-left"
        >
          <p className="text-gray-500 text-center max-w-sm mx-auto text-base leading-relaxed mb-2">
            Fatih'in bugün sana olan tavrını belirle. Eğer her şey yolundaysa aşağıdan onaylayıp Yücel'e anında bildirebilirsin.
          </p>

          {/* Minimalist Sulkiness Slider */}
          <div className="space-y-4 bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-gray-400" />
                Küslük Seviyesi
              </span>
              <span className="text-xs font-mono font-medium text-gray-700">
                %{sulkLevel}
              </span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sulkLevel}
              onChange={(e) => setSulkLevel(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
            />
            
            <motion.div 
              key={sulkLevel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl border text-xs transition-colors duration-200 ${currentSulk.color}`}
            >
              <div className="font-semibold flex items-center gap-1 mb-0.5">
                <Smile className="w-3.5 h-3.5" />
                {currentSulk.label}
              </div>
              <p className="opacity-80 leading-relaxed">{currentSulk.desc}</p>
            </motion.div>
          </div>

          {/* Minimalist Custom Message Textarea */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Özel Barış Mesajı (İsteğe Bağlı)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="E-postaya eklenecek nazik bir not..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-gray-100 bg-gray-50/20 focus:bg-white focus:border-gray-800 focus:outline-none transition-all duration-200 resize-none h-20 placeholder:text-gray-400"
            />
          </div>

          {/* Primary Action Button (Sleek Dark button matching instructions) */}
          <div className="relative pt-2">
            <motion.button
              id="magic-button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSendEmail}
              disabled={isSending}
              className={`group relative w-full py-4.5 text-white rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                isAngry 
                  ? "bg-[#9B1C1C] hover:bg-[#801717]" 
                  : "bg-[#1A1A1A] hover:bg-gray-800"
              }`}
            >
              <div className="absolute -inset-1.5 border border-gray-200 rounded-full scale-102 group-hover:scale-105 transition-transform opacity-0 group-hover:opacity-100 duration-300 pointer-events-none"></div>
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  GÖNDERİLİYOR...
                </>
              ) : (
                <>
                  <Heart className={`w-4 h-4 text-white shrink-0 ${isAngry ? "" : "fill-white"}`} />
                  {isAngry ? "KÜSTÜ! 💔" : "KÜSMEDİ! ✨"}
                </>
              )}
            </motion.button>
          </div>

          {/* Response / Feedback Box */}
          <AnimatePresence mode="wait">
            {sendResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="border-t border-gray-100 pt-6 mt-2"
              >
                {sendResult.success ? (
                  <div className="space-y-4">
                    {sendResult.simulated ? (
                      /* Simulated Email */
                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-900">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-100/80 text-amber-700 p-1.5 rounded-lg shrink-0">
                            <Info className="w-4 h-4" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-amber-900 text-sm">
                              E-posta Hazırlandı! 🕊️
                            </h3>
                            <p className="text-xs text-amber-800/90 leading-relaxed">
                              Sistem başarıyla tetiklendi. Arka plan e-posta sistemi <b>yuceltaskin@outlook.com.tr</b> adresi için aşağıdaki mesajı oluşturdu:
                            </p>
                            
                            {/* Message Block */}
                            <div className="bg-white/80 border border-amber-200/50 p-3 rounded-xl flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-amber-950 select-all">
                                fatih sana bugun kus degil
                              </span>
                              <button
                                onClick={copyToClipboard}
                                className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-100/50 transition-colors flex items-center gap-1 text-xs font-semibold shrink-0"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    Kopyalandı
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Kopyala
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs text-amber-800/90 leading-relaxed">
                              Alıcıya anında, gerçek bir e-posta ulaştırmak için aşağıdaki hızlı e-posta bağlantısını kullanabilirsiniz:
                            </p>

                            <div className="flex flex-col gap-2 pt-1">
                              <a
                                href={mailtoUrl}
                                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                Mail İstemcisi İle Gönder (Outlook / Gmail)
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              
                              <button
                                onClick={() => setShowConfigHelp(!showConfigHelp)}
                                className="text-amber-800 hover:text-amber-950 text-xs font-medium flex items-center justify-center gap-1 mt-1 underline"
                              >
                                <Settings className="w-3 h-3" />
                                Otomatik Göndermek İçin SMTP Ayarları
                                <ChevronDown className={`w-3 h-3 transition-transform ${showConfigHelp ? "rotate-180" : ""}`} />
                              </button>
                            </div>

                            {/* SMTP instructions details */}
                            {showConfigHelp && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 border-t border-amber-200/40 pt-3 text-xs text-amber-800 space-y-2 leading-relaxed bg-amber-50/30 p-3 rounded-xl"
                              >
                                <p className="font-semibold text-amber-900">Arka plan gönderimi etkinleştirmek için:</p>
                                <ol className="list-decimal list-inside space-y-1 text-amber-800/80 text-[11px] pl-1">
                                  <li>AI Studio platformunda <b>Settings &gt; Secrets</b> sekmesini açın.</li>
                                  <li>Aşağıdaki anahtarları ekleyin:</li>
                                </ol>
                                <div className="bg-[#1A1A1A] text-gray-200 p-2.5 rounded-lg font-mono text-[10px] space-y-1 text-left">
                                  <div>SMTP_HOST="smtp-mail.outlook.com"</div>
                                  <div>SMTP_PORT="587"</div>
                                  <div>SMTP_USER="sizin-adresiniz@domain.com"</div>
                                  <div>SMTP_PASS="sifreniz"</div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* SMTP Successfully Send */
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-sm text-emerald-900">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-emerald-950">
                              Harika! E-posta Başarıyla Gönderildi 📬
                            </h3>
                            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                              E-posta doğrudan <b>{sendResult.recipient}</b> adresine iletildi. Barış sağlandı!
                            </p>
                            <p className="text-xs font-semibold text-emerald-950 mt-2">
                              Gönderilen: <span className="font-mono bg-emerald-100/50 px-1.5 py-0.5 rounded">"fatih sana bugun kus degil"</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Failed Mail */
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 text-sm text-rose-900">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-rose-950">
                          E-posta Gönderilemedi
                        </h3>
                        <p className="text-xs text-rose-800/95 mt-1 leading-relaxed">
                          {sendResult.error || "Arka plan SMTP sunucusuna bağlanılamadı. Bilgilerinizi kontrol ediniz."}
                        </p>
                        <p className="text-xs text-rose-800/90 mt-2">
                          Bunun yerine mail uygulamanızı açıp hızlıca kendiniz de gönderebilirsiniz:
                        </p>
                        <a
                          href={mailtoUrl}
                          className="mt-3 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Mail Uygulaması İle Gönder ✉️
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-t border-gray-100 pt-8 mt-12 gap-6 text-xs text-gray-400">
        <div className="text-left space-y-1">
          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">ALICI ADRESİ</p>
          <p className="text-gray-600 font-mono tracking-tight">yuceltaskin@outlook.com.tr</p>
        </div>
        <div className="max-w-[400px] text-left md:text-right">
          <p className="text-[10px] leading-relaxed text-gray-400 italic">
            * Butona basıldığında Fatih'e "Fatih sana bugün küs değil" konulu bilgilendirme mesajı anlık olarak iletilir.
          </p>
          <p className="mt-1 text-[10px] text-gray-300 font-mono">
            fatih-bana-kustu-mu v1.1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
