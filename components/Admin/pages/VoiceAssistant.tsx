import React, { useState } from 'react';
import { 
  Mic, Sparkles, AlertCircle, Play, 
  Send, User, Bot, Check, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ParsedCommand {
  material: string;
  qty: number;
  project: string;
  urgency: string;
  trade: string;
}

export const VoiceAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parser' | 'chat'>('parser');
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Parsed outputs state
  const [parsed, setParsed] = useState<ParsedCommand | null>(null);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: "Hello! I am your Ponos AI assistant. You can speak to me or type questions. How can I help you with your projects today?" }
  ]);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Sample phrases to auto-fill dictation
  const sampleDictations = [
    "Order twenty 2x4 studs for the Clubhouse Ballroom as soon as possible.",
    "Show me if the hexagonal tiles for Townhomes Unit B have been delivered.",
    "Log a safety issue: water leak detected behind the ballroom fireplace."
  ];

  const handleSimulateVoiceInput = (text: string) => {
    setIsRecording(true);
    setInputText("Recording & transcribing audio using Whisper API...");
    setParsed(null);

    setTimeout(() => {
      setInputText(text);
      setIsRecording(false);
      
      // Perform mock AI structured parsing
      let parsedOutput: ParsedCommand = {
        material: "2x4 Lumber Studs (16ft)",
        qty: 20,
        project: "Main Clubhouse Ballroom Remodel",
        urgency: "Urgent",
        trade: "Framing"
      };

      if (text.includes("tiles")) {
        parsedOutput = {
          material: "Porcelain Hexagonal Floor Tiles",
          qty: 450,
          project: "Fairway Townhomes Unit B",
          urgency: "Standard",
          trade: "Tiling"
        };
      } else if (text.includes("leak")) {
        parsedOutput = {
          material: "Water damage inspection request",
          qty: 1,
          project: "Main Clubhouse Ballroom Remodel",
          urgency: "Critical",
          trade: "Demolition"
        };
      }

      setParsed(parsedOutput);
      toast.success("OpenAI Whisper parsed structured fields!");
    }, 2000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt.trim()) return;

    const userMessage = { sender: 'user', text: currentPrompt };
    setChatMessages(prev => [...prev, userMessage]);
    const promptText = currentPrompt;
    setCurrentPrompt('');

    setTimeout(() => {
      let botResponseText = "I parsed your query, but that action is pending API connection. I can help search submittal logs, verify material quantities, or check QuickBooks sync status.";
      
      const lower = promptText.toLowerCase();
      if (lower.includes("invoice") || lower.includes("billing")) {
        botResponseText = "Checking QuickBooks Online... I see 3 open vendor invoices. Total accounts payable outstanding is $165,200.00.";
      } else if (lower.includes("rfi")) {
        botResponseText = "We currently have 2 open RFIs. RFI-001 (Clubhouse joists) is assigned to Hassan Mahmood and is overdue by 2 days.";
      } else if (lower.includes("weather")) {
        botResponseText = "Weather forecast for jobsite (Capital Hills Resort): Sunny, 78°F. Wind 8mph. Perfect weather for concrete pouring today.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponseText }]);
    }, 1200);
  };

  const handleConfirmParsed = () => {
    toast.success("Structured material request successfully logged and sent to purchasing!");
    setParsed(null);
    setInputText('');
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Ponos AI Voice Assistant</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Dictate field entries, auto-parse materials lists via Whisper, and converse with our context-aware assistant.</p>
        </div>

        <div className="flex bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10">
          {[
            { id: 'parser', label: 'Whisper STT Parser', icon: <Mic className="w-4 h-4" /> },
            { id: 'chat', label: 'Ponos AI Chat', icon: <Sparkles className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#c4864b] text-white shadow-sm' 
                  : 'text-[#0f281e]/60 hover:text-[#0f281e]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'parser' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Audio dictation simulator */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-xl text-[#0f281e] pb-2 border-b border-[#0f281e]/5">Simulate Voice Dictation</h3>
              
              <p className="text-xs text-[#0f281e]/60 leading-relaxed font-semibold">
                Click one of the predefined speech phrases below to simulate speech dictation, or type directly into the input container.
              </p>

              <div className="space-y-2">
                {sampleDictations.map((dict, i) => (
                  <button
                    key={i}
                    disabled={isRecording}
                    onClick={() => handleSimulateVoiceInput(dict)}
                    className="w-full text-left bg-[#0f281e]/5 border border-[#0f281e]/10 hover:border-[#c4864b] p-3 rounded-xl text-xs text-[#0f281e] font-semibold transition-all flex items-center justify-between"
                  >
                    <span>"{dict}"</span>
                    <Play className="w-3.5 h-3.5 text-[#c4864b]" />
                  </button>
                ))}
              </div>

              {/* Dictation Box */}
              <div className="bg-[#0f281e]/5 p-5 rounded-2xl border border-[#0f281e]/10 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#0f281e]/40">
                  <span>Voice Input Transcription Feed</span>
                  {isRecording && <span className="text-red-500 animate-pulse">Whisper API actively parsing...</span>}
                </div>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="dictation text will appear here..."
                  className="w-full h-24 bg-white border border-[#0f281e]/10 rounded-xl p-3 text-xs font-medium outline-none focus:border-[#c4864b]"
                  disabled={isRecording}
                />
              </div>
            </div>
          </div>

          {/* AI Parser output summary */}
          <div className="space-y-6">
            {parsed ? (
              <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Structured Data Verified
                </div>
                
                <h3 className="font-serif text-lg text-[#0f281e] font-bold pb-2 border-b border-[#0f281e]/5">AI Confirmation Screen</h3>

                <div className="space-y-2 text-xs font-medium text-[#0f281e]/75">
                  <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                    <span className="text-[#0f281e]/40">Material</span>
                    <span className="font-bold">{parsed.material}</span>
                  </div>
                  <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                    <span className="text-[#0f281e]/40">Quantity</span>
                    <span className="font-bold">{parsed.qty}</span>
                  </div>
                  <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                    <span className="text-[#0f281e]/40">Job Site</span>
                    <span className="font-bold">{parsed.project}</span>
                  </div>
                  <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                    <span className="text-[#0f281e]/40">Urgency</span>
                    <span className="font-bold text-red-500">{parsed.urgency}</span>
                  </div>
                  <div className="flex justify-between bg-[#0f281e]/5 p-2 rounded-lg">
                    <span className="text-[#0f281e]/40">Trade category</span>
                    <span className="font-bold">{parsed.trade}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setParsed(null)}
                    className="flex-1 py-3 border border-[#0f281e]/15 text-[#0f281e]/60 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={handleConfirmParsed}
                    className="flex-1 py-3 bg-[#0f281e] hover:bg-[#0f281e]/90 text-white rounded-xl text-xs font-bold uppercase shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#0f281e]/5 rounded-3xl p-6 shadow-sm text-center py-12 space-y-4">
                <div className="w-12 h-12 bg-[#0f281e]/5 text-[#c4864b] rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0f281e] block">Structured output empty</span>
                  <span className="text-[10px] text-[#0f281e]/40 block mt-1">Dictate a voice phrase to analyze entity extractions.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          {/* Chat feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#0f281e] text-[#dec099] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed font-semibold shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#c4864b] text-white rounded-tr-none' 
                    : 'bg-white text-[#0f281e] border border-[#0f281e]/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#c4864b] text-white flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendChatMessage} className="border-t border-[#0f281e]/5 p-4 flex gap-3 bg-white">
            <input
              type="text"
              value={currentPrompt}
              onChange={e => setCurrentPrompt(e.target.value)}
              placeholder="Ask Ponos AI: 'check RFI status' or 'what is our outstanding QuickBooks invoice total?'..."
              className="flex-1 bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#c4864b] font-medium"
            />
            <button
              type="submit"
              className="bg-[#0f281e] text-white hover:bg-[#0f281e]/90 px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
