import React, { useState, useRef, useEffect } from 'react';
import { 
  Smartphone, Signal, WifiOff, Mic, Camera, 
  MapPin, CheckCircle2, RefreshCw, PenTool, Check, FileText, Lock, ShieldCheck, Home
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const FieldMobile: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [mobileScreen, setMobileScreen] = useState<'home' | 'request' | 'photo' | 'signature' | 'daily-log'>('home');
  const [isRecording, setIsRecording] = useState(false);
  
  // Voice Request State
  const [voiceText, setVoiceText] = useState('');
  const [selectedJob, setSelectedJob] = useState('Clubhouse Ballroom');
  const [selectedUrgency, setSelectedUrgency] = useState('Standard');
  const [isEmergencyRepair, setIsEmergencyRepair] = useState(false);
  
  // Daily Field Log State
  const [completedWorkText, setCompletedWorkText] = useState('');
  const [logPhotoName, setLogPhotoName] = useState('');

  // Signature / Approval State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [approvalMethod, setApprovalMethod] = useState<'Stylus' | 'PIN' | 'Password'>('Stylus');
  const [securityPin, setSecurityPin] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [loggedMetadata, setLoggedMetadata] = useState<any | null>(null);

  // Sync Queue State
  const [pendingSyncItems, setPendingSyncItems] = useState<string[]>([]);

  // Signature canvas handlers
  useEffect(() => {
    if (mobileScreen === 'signature' && approvalMethod === 'Stylus' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f281e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [mobileScreen, approvalMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsSigned(true);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setIsSigned(false);
    }
  };

  // Simulate Voice input Speech-to-Text
  const simulateVoiceToText = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    setIsRecording(true);
    setVoiceText("Transcribing...");
    
    setTimeout(() => {
      setVoiceText("Need 40 pieces of two by four studs for the ballroom fireplace framing, make it critical urgency.");
      setSelectedUrgency("Critical");
      setIsRecording(false);
      toast.success("AI voice parsed successfully!");
    }, 2800);
  };

  const handleMobileSubmitRequest = () => {
    if (!voiceText || voiceText === "Transcribing...") {
      toast.error("Please record/enter material specs");
      return;
    }

    const typeStr = isEmergencyRepair ? "[EMERGENCY]" : "[Standard]";

    if (isOffline) {
      const newSyncQueue = [...pendingSyncItems, `${typeStr} Order: 40x studs - ${selectedJob}`];
      setPendingSyncItems(newSyncQueue);
      toast.success("Offline: material request saved locally to mobile database (SQLite)");
    } else {
      if (isEmergencyRepair) {
        toast.success("Emergency repair logged! Status: Emergency Post-Approval Pending.");
      } else {
        toast.success("Online: material request transmitted to PM review queue!");
      }
    }

    // Reset Form
    setVoiceText('');
    setIsEmergencyRepair(false);
    setMobileScreen('home');
  };

  const handleTriggerSync = () => {
    if (isOffline) {
      toast.error("Reconnect mobile network before synchronizing data.");
      return;
    }
    if (pendingSyncItems.length === 0) {
      toast.success("Local mobile cache database is fully synchronized.");
      return;
    }

    toast.loading("Uploading SQLite cached items to main cloud server...", { duration: 1500 });
    setTimeout(() => {
      setPendingSyncItems([]);
      toast.success("SQLite sync complete. All cached field requests integrated!");
    }, 1500);
  };

  const handleCaptureFieldPhoto = () => {
    if (isOffline) {
      setPendingSyncItems([...pendingSyncItems, "Photo: Ballroom Framing - GPS: 34.0522 N, -118.2437 W"]);
      toast.success("Offline: photo saved with GPS geotag (34.0522° N, 118.2437° W)");
    } else {
      toast.success("Online: snapshot uploaded successfully with location metadata tag.");
    }
    setMobileScreen('home');
  };

  const handleMobileSubmitDailyLog = () => {
    if (!completedWorkText) {
      toast.error("Please enter today's completed work text.");
      return;
    }

    if (isOffline) {
      setPendingSyncItems([...pendingSyncItems, `Daily Log: ${completedWorkText.substring(0, 20)}...`]);
      toast.success("Offline: daily log saved to local SQLite database.");
    } else {
      toast.success("Online: daily field log submitted for PM review.");
    }

    setCompletedWorkText('');
    setLogPhotoName('');
    setMobileScreen('home');
  };

  // Secure Signoff Approval (Special Scenario C)
  const handleMobileSubmitApproval = () => {
    if (approvalMethod === 'Stylus' && !isSigned) {
      toast.error("Please sign the canvas pad first.");
      return;
    }
    if (approvalMethod === 'PIN' && securityPin.length < 4) {
      toast.error("Please enter your secure 4-digit verification PIN.");
      return;
    }
    if (approvalMethod === 'Password' && !securityPassword) {
      toast.error("Please enter password confirmation key.");
      return;
    }

    // Set secure metadata payload
    const metadata = {
      signer: "GC Board Representative (David Miller)",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      gpsLocation: "34.0522° N, 118.2437° W (Clubhouse Site)",
      deviceId: "iPad_Foreman_04",
      documentHash: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      method: approvalMethod
    };

    setLoggedMetadata(metadata);
    toast.success("Secure approval verified. Signature hash logged!");
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Field Mobile Simulator</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Simulate the React Native mobile app used by foremen on job sites. Test voice commands, signature panels, and offline caching.</p>
        </div>

        {/* Caching status panel */}
        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-xl border border-[#0f281e]/10 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0f281e]/60">Mobile Network Status:</span>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isOffline 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'Offline' : 'Online'}</span>
            </button>
          </div>

          <div className="h-6 w-px bg-[#0f281e]/10" />

          <button
            onClick={handleTriggerSync}
            className="text-xs text-[#c4864b] font-bold flex items-center gap-1.5 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Mobile Cache ({pendingSyncItems.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Mobile Device Mock Frame */}
        <div className="flex justify-center">
          <div className="w-[340px] h-[680px] bg-black rounded-[3rem] p-3 shadow-2xl relative border-4 border-gray-800 flex flex-col">
            {/* Speaker bar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
              <div className="w-2 h-2 bg-gray-800 rounded-full ml-2" />
            </div>

            {/* Inner screen content */}
            <div className="flex-1 bg-[#fbf7f0] rounded-[2.5rem] overflow-hidden flex flex-col justify-between p-5 pt-8 text-[#0f281e] select-none">
              {/* Screen Top Status bar */}
              <div className="flex justify-between items-center text-[10px] font-bold text-[#0f281e]/60 px-1">
                <span>11:45 AM</span>
                <div className="flex items-center gap-1">
                  <span>GPS On</span>
                  {isOffline ? <WifiOff className="w-3 h-3 text-red-500" /> : <Signal className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>

              {/* Dynamic Screen contents */}
              <div className="flex-1 my-4 flex flex-col justify-start overflow-y-auto pr-1">
                {mobileScreen === 'home' && (
                  <div className="space-y-4">
                    <div className="border-b border-[#0f281e]/10 pb-3">
                      <div className="text-[10px] uppercase tracking-wider text-[#0f281e]/40 font-bold">Ponos Field Connect</div>
                      <h4 className="font-serif text-lg font-bold">Foreman Dashboard</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'request', label: 'Voice Material Request', icon: <Mic className="w-5 h-5" />, desc: 'Speech-to-text ordering' },
                        { id: 'photo', label: 'GPS Photo Upload', icon: <Camera className="w-5 h-5" />, desc: 'Geotagged site issues' },
                        { id: 'signature', label: 'Change Order Sign-Off', icon: <PenTool className="w-5 h-5" />, desc: 'On-the-spot secure approvals' },
                        { id: 'daily-log', label: 'Foreman Daily Log', icon: <FileText className="w-5 h-5" />, desc: 'Submit daily work logs' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setMobileScreen(item.id as any)}
                          className="bg-white border border-[#0f281e]/10 p-4 rounded-2xl text-left hover:border-[#c4864b] transition-all flex flex-col justify-between h-32 shadow-sm"
                        >
                          <div className="p-2 bg-[#0f281e]/5 rounded-xl w-fit text-[#c4864b]">{item.icon}</div>
                          <div>
                            <span className="text-[10px] font-bold block leading-snug">{item.label}</span>
                            <span className="text-[8px] text-[#0f281e]/50 block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Sync alert in app */}
                    {pendingSyncItems.length > 0 && (
                      <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 text-[10px] p-3 rounded-xl flex items-center justify-between">
                        <span>{pendingSyncItems.length} items queued locally</span>
                        <div className="h-2 w-2 bg-orange-500 rounded-full animate-ping" />
                      </div>
                    )}
                  </div>
                )}

                {mobileScreen === 'request' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-base font-bold">Material Request</h4>
                      <button onClick={() => setMobileScreen('home')} className="text-xs font-bold text-[#c4864b]">Back</button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Select Active Jobsite</label>
                        <select 
                          value={selectedJob} 
                          onChange={e => setSelectedJob(e.target.value)}
                          className="w-full bg-white border border-[#0f281e]/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                        >
                          <option value="Clubhouse Ballroom">Clubhouse Ballroom</option>
                          <option value="Backyard Patio">Backyard Patio</option>
                          <option value="Fairway Townhomes">Fairway Townhomes</option>
                        </select>
                      </div>

                      <div className="bg-[#0f281e]/5 p-4 rounded-xl border border-dashed border-[#0f281e]/10 text-center space-y-3">
                        <button
                          onClick={simulateVoiceToText}
                          className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-all ${
                            isRecording ? 'bg-red-50 animate-pulse text-white' : 'bg-[#c4864b] hover:bg-[#b57a44] text-white shadow-md'
                          }`}
                        >
                          <Mic className="w-6 h-6" />
                        </button>
                        <span className="text-[10px] text-[#0f281e]/60 font-semibold block">
                          {isRecording ? 'Listening... Speak now' : 'Tap to simulate voice transcription'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Parsed Transcription text</label>
                        <textarea
                          value={voiceText}
                          onChange={e => setVoiceText(e.target.value)}
                          placeholder="Hold mic to dictate, or type here manually..."
                          className="w-full h-20 bg-white border border-[#0f281e]/10 rounded-xl p-3 text-xs outline-none focus:border-[#c4864b] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Urgency</label>
                        <div className="flex gap-2">
                          {['Standard', 'Urgent', 'Critical'].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setSelectedUrgency(level)}
                              className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                selectedUrgency === level
                                  ? 'bg-[#c4864b] border-[#c4864b] text-white'
                                  : 'bg-white border-[#0f281e]/10 text-[#0f281e]/60'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Workflow 5 Emergency checkbox in app */}
                      <div className="flex items-center gap-2 bg-red-500/5 p-2 rounded border border-red-500/10">
                        <input 
                          type="checkbox" 
                          id="appEmergency"
                          checked={isEmergencyRepair}
                          onChange={e => setIsEmergencyRepair(e.target.checked)}
                          className="rounded border-[#0f281e]/20 text-red-600 focus:ring-red-500 text-xs"
                        />
                        <label htmlFor="appEmergency" className="text-[9px] font-bold text-red-700">Flag as Emergency Repair Work</label>
                      </div>
                    </div>

                    <button
                      onClick={handleMobileSubmitRequest}
                      className="w-full bg-[#0f281e] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all shadow-md mt-2"
                    >
                      Submit Request Form
                    </button>
                  </div>
                )}

                {mobileScreen === 'photo' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-base font-bold">GPS Geotag Photo</h4>
                      <button onClick={() => setMobileScreen('home')} className="text-xs font-bold text-[#c4864b]">Back</button>
                    </div>

                    <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-white/50 relative overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80" 
                        alt="Jobsite framing"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2.5 py-1 text-[8px] font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Lat 34.0522° | Long -118.2437°</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-medium text-[#0f281e]/60 leading-relaxed">
                      <div className="font-bold text-[#0f281e]">Photo Metadata:</div>
                      <div>• Timestamp: {new Date().toLocaleString()}</div>
                      <div>• Location: Main Clubhouse Ballroom</div>
                      <div>• Storage path: /sqlite/local_cache/img_293.jpg</div>
                    </div>

                    <button
                      onClick={handleCaptureFieldPhoto}
                      className="w-full bg-[#0f281e] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all shadow-md"
                    >
                      Geotag & Upload Photo
                    </button>
                  </div>
                )}

                {/* Workflow 4: Daily Field Log Screen inside Mobile */}
                {mobileScreen === 'daily-log' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-base font-bold">Foreman Daily Log</h4>
                      <button onClick={() => setMobileScreen('home')} className="text-xs font-bold text-[#c4864b]">Back</button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Select Project</label>
                        <select
                          className="w-full bg-white border border-[#0f281e]/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                        >
                          <option>102 Oak Ridge Court (Backyard Reno)</option>
                          <option>Main Clubhouse Ballroom Remodel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Describe Work Completed Today</label>
                        <textarea
                          value={completedWorkText}
                          onChange={e => setCompletedWorkText(e.target.value)}
                          placeholder="What did the crew accomplish today?"
                          className="w-full h-24 bg-white border border-[#0f281e]/10 rounded-xl p-3 text-xs outline-none focus:border-[#c4864b] font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Add Progress Photo</label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white border border-[#0f281e]/10 rounded-xl px-3 py-2 text-xs text-[#0f281e]/60 truncate font-semibold">
                            {logPhotoName || 'No photo attached'}
                          </div>
                          <button
                            type="button"
                            onClick={() => setLogPhotoName("progress_studs_" + Date.now() + ".jpg")}
                            className="bg-[#0f281e]/5 border border-[#0f281e]/10 hover:bg-[#0f281e]/10 px-3 py-2 rounded-xl text-xs font-bold text-[#0f281e]"
                          >
                            Snap Photo
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleMobileSubmitDailyLog}
                      className="w-full bg-[#0f281e] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all shadow-md mt-2"
                    >
                      Submit Daily Log
                    </button>
                  </div>
                )}

                {/* Change Order signoff with stylus/PIN/password (Special Scenario C) */}
                {mobileScreen === 'signature' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-base font-bold">Sign Change Order</h4>
                      <button onClick={() => setMobileScreen('home')} className="text-xs font-bold text-[#c4864b]">Back</button>
                    </div>

                    <div className="bg-[#0f281e]/5 p-3 rounded-xl text-[10px] text-[#0f281e]/75 font-semibold space-y-1">
                      <div>Change Order: CO-001</div>
                      <div>Ballroom Column Support Upgrade</div>
                      <div>Impact cost: <span className="font-bold text-red-500">$4,250.00</span></div>
                    </div>

                    {/* Verification Method switcher */}
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Verification Method</label>
                      <div className="flex gap-1 bg-[#0f281e]/5 p-0.5 rounded-lg border border-[#0f281e]/10">
                        {(['Stylus', 'PIN', 'Password'] as const).map(method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setApprovalMethod(method)}
                            className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
                              approvalMethod === method
                                ? 'bg-[#c4864b] text-white shadow-xs'
                                : 'text-[#0f281e]/60'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rendering inputs depending on method selected */}
                    {approvalMethod === 'Stylus' && (
                      <div>
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1 flex justify-between">
                          <span>Draw Client / Rep Signature</span>
                          <button onClick={clearSignature} className="text-red-500 lowercase">clear</button>
                        </label>
                        
                        <div className="border-2 border-dashed border-[#0f281e]/20 bg-white rounded-xl overflow-hidden cursor-crosshair">
                          <canvas
                            ref={canvasRef}
                            width={290}
                            height={140}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {approvalMethod === 'PIN' && (
                      <div className="space-y-2">
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Enter 4-Digit Security PIN</label>
                        <input
                          type="password" maxLength={4} placeholder="••••"
                          value={securityPin} onChange={e => setSecurityPin(e.target.value.replace(/\D/g,''))}
                          className="w-full text-center bg-white border border-[#0f281e]/10 rounded-xl py-3 text-lg font-mono outline-none tracking-widest focus:border-[#c4864b]"
                        />
                      </div>
                    )}

                    {approvalMethod === 'Password' && (
                      <div className="space-y-2">
                        <label className="block text-[8px] font-bold uppercase tracking-wider text-[#0f281e]/40 mb-1">Enter Client Password Confirmation</label>
                        <input
                          type="password" placeholder="Enter password passphrase..."
                          value={securityPassword} onChange={e => setSecurityPassword(e.target.value)}
                          className="w-full bg-white border border-[#0f281e]/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#c4864b] font-medium"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleMobileSubmitApproval}
                      className="w-full bg-[#0f281e] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all shadow-md"
                    >
                      Verify & Submit Sign-Off
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    setMobileScreen('home');
                    setLoggedMetadata(null);
                  }}
                  className="w-28 h-1.5 bg-[#0f281e]/20 rounded-full hover:bg-[#0f281e]/45 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Simulator info explanation and control features */}
        <div className="space-y-6">
          {/* Metadata output log for legal trace */}
          {loggedMetadata ? (
            <div className="bg-white border border-[#0f281e]/5 p-6 rounded-3xl shadow-sm space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                Legal Metadata Trail Captured
              </div>

              <div className="space-y-2 text-xs font-medium text-[#0f281e]/75">
                <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                  <span className="text-[#0f281e]/40">Signer Identity</span>
                  <span className="font-bold">{loggedMetadata.signer}</span>
                </div>
                <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                  <span className="text-[#0f281e]/40">Timestamp</span>
                  <span className="font-bold">{loggedMetadata.timestamp}</span>
                </div>
                <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                  <span className="text-[#0f281e]/40">Geotag Location</span>
                  <span className="font-bold">{loggedMetadata.gpsLocation}</span>
                </div>
                <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                  <span className="text-[#0f281e]/40">Hardware Device ID</span>
                  <span className="font-bold">{loggedMetadata.deviceId}</span>
                </div>
                <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                  <span className="text-[#0f281e]/40">Authorization Method</span>
                  <span className="font-bold text-[#c4864b]">{loggedMetadata.method}</span>
                </div>
                <div className="bg-[#0f281e]/5 p-2.5 rounded-lg border border-[#0f281e]/10">
                  <span className="text-[9px] uppercase font-bold text-[#0f281e]/40 block mb-1">Document Cryptographic Hash</span>
                  <span className="font-mono text-[9px] text-[#0f281e]/65 block select-all truncate">{loggedMetadata.documentHash}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileScreen('home');
                  setLoggedMetadata(null);
                  toast.success("Change order approved and transmitted to office budget ledger.");
                }}
                className="w-full bg-[#0f281e] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all shadow-sm"
              >
                Transmit to Main Ledger
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl text-[#0f281e]">Interactive Mobile Features Info</h3>

              <div className="space-y-4 text-sm text-[#0f281e]/75 font-medium leading-relaxed">
                <p>
                  In the React Native mobile codebase, this simulator replicates the screens and logic designed for Phase 1 (MVP) and Phase 3 (Advanced Field Features):
                </p>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#c4864b]/15 text-[#c4864b] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#0f281e] block text-xs">Emergency Bypass Toggles (Workflow 5)</span>
                      <span>Foremen trigger emergency repair requests directly. The system automatically marks requests as "emergency post-approval pending" bypassing normal workflow gates.</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#c4864b]/15 text-[#c4864b] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#0f281e] block text-xs">Secure Traceability Audits (Special Scenario C)</span>
                      <span>Offers GC stylus vectors, secure 4-digit numeric PIN confirmations, or secure password overrides. Logs GPS location, time logs, and hardware device identifiers to comply with legal compliance frameworks.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
