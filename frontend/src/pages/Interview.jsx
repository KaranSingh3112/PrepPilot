import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';

// Check browser support for Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ---- State ----
  const [question, setQuestion]         = useState('');
  const [questionNumber, setQN]         = useState(1);
  const [totalQuestions, setTQ]         = useState(5);
  const [transcript, setTranscript]     = useState('');
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [ending, setEnding]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [interviewData, setInterviewData] = useState(null);

  // Refs (mutable values that don't trigger re-renders)
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraRecorderRef = useRef(null);
  const cameraChunksRef = useRef([]);
  const cameraBlobRef = useRef(null);

  // Camera state
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isRecordingCamera, setIsRecordingCamera] = useState(false);

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.split(',')[1] || null);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startCameraRecording = () => {
    if (!cameraStreamRef.current || !window.MediaRecorder) {
      return;
    }
    try {
      const recorder = new MediaRecorder(cameraStreamRef.current, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 200000,
      });
      cameraChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          cameraChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(cameraChunksRef.current, { type: 'video/webm' });
        cameraBlobRef.current = await blobToBase64(blob);
      };
      recorder.start();
      cameraRecorderRef.current = recorder;
      setIsRecordingCamera(true);
    } catch (err) {
      console.error('Camera recorder failed', err);
    }
  };

  const stopCameraRecording = () =>
    new Promise((resolve) => {
      const recorder = cameraRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecordingCamera(false);
        return resolve(cameraBlobRef.current);
      }
      recorder.onstop = async () => {
        const blob = new Blob(cameraChunksRef.current, { type: 'video/webm' });
        cameraBlobRef.current = await blobToBase64(blob);
        setIsRecordingCamera(false);
        resolve(cameraBlobRef.current);
      };
      recorder.stop();
      cameraRecorderRef.current = null;
    });

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch (err) {
      console.warn('Camera access denied:', err);
      setCameraError('Camera access is required for cheating prevention. Please allow camera permission.');
      setCameraReady(false);
    }
  };

  // Initial load: fetch the first question from backend
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterviewData(res.data);
        if (res.data.completed) {
          return;
        }
        const lastQA = res.data.qaList[res.data.qaList.length - 1];
        setQuestion(lastQA.question);
        setQN(res.data.qaList.length);
        setTQ(7);
        // Auto-speak the question after a short delay
        setTimeout(() => speak(lastQA.question), 600);
      } catch (err) {
        toast.error('Failed to load interview');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
    initCamera();
    // eslint-disable-next-line
  }, [id]);
  // speak(text) — uses browser's SpeechSynthesis
  const speak = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }
    window.speechSynthesis.cancel();   // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate   = 0.95;
    utterance.pitch  = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // startListening() — activates the microphone
  const startListening = () => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    // If currently speaking, stop first
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;   // Keep listening until we stop
    recognition.interimResults = true;   // Show partial transcript
    recognition.lang           = 'en-US';

    recognition.onresult = (e) => {
      // Combine all results into one string
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        final += e.results[i][0].transcript;
      }
      setTranscript(final);
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      toast.error('Microphone error: ' + e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    if (cameraReady) {
      startCameraRecording();
    }
  };

  // stopListening() — stops mic
  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    await stopCameraRecording();
    setIsListening(false);
  };

  // submitAnswer() — sends transcript to backend
  const submitAnswer = async () => {
    if (!transcript.trim()) {
      return toast.error('Please record an answer first');
    }
    setSubmitting(true);
    try {
      await stopCameraRecording();
      const res = await api.post(`/interview/${id}/answer`, {
        answer: transcript.trim(),
        cameraEvidence: cameraBlobRef.current,
      });
      cameraBlobRef.current = null;

      if (res.data.completed) {
        const interviewRes = await api.get(`/interview/${id}`);
        setInterviewData(interviewRes.data);
        toast.success('Interview completed! Here is your report.');
        return;
      }

      // Move to next question
      setQuestion(res.data.question);
      setQN(res.data.questionNumber);
      setTranscript('');
      setTimeout(() => speak(res.data.question), 400);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const endInterview = async () => {
    if (!window.confirm('End the interview now? You will be taken to the report page for the answered questions.') ) {
      return;
    }
    setEnding(true);
    try {
      await api.post(`/interview/${id}/end`);
      const interviewRes = await api.get(`/interview/${id}`);
      setInterviewData(interviewRes.data);
      toast.success('Interview ended. Here is your report.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end interview');
    } finally {
      setEnding(false);
    }
  };
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (cameraRecorderRef.current && cameraRecorderRef.current.state !== 'inactive') {
        cameraRecorderRef.current.stop();
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (loading) {
    return <><Navbar /><div className="p-10 text-center text-slate-500">Loading interview...</div></>;
  }

  if (interviewData?.completed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Interview Report</h1>
              <p className="text-slate-500 mt-1">
                {interviewData.jobRole} · {new Date(interviewData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Score</p>
              <p className="text-5xl font-extrabold text-slate-800">{interviewData.totalScore ?? 'N/A'}</p>
              <p className="text-slate-500">out of 10</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommendation</p>
              <span className={`inline-block px-5 py-2 rounded-full text-base font-bold ${
                interviewData.recommendation === 'Strong Hire' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  interviewData.recommendation === 'Hire' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                  interviewData.recommendation === 'Maybe' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                {interviewData.recommendation || 'No recommendation'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ReportBlock title="💪 Strengths" items={interviewData.strengths} color="emerald" />
            <ReportBlock title="⚠️ Weaknesses" items={interviewData.weakness} color="rose" />
            <ReportBlock title="💡 Suggestions" items={interviewData.suggestions} color="sky" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Detailed Feedback</h2>
            <p className="text-slate-700 leading-relaxed">{interviewData.detailedFeedback}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Question-wise Performance</h2>
            <div className="space-y-3">
              {interviewData.qaList.map((qa, idx) => (
                <details key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate pr-4">Q{idx + 1}: {qa.question}</span>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${qa.score >= 8 ? 'bg-emerald-100 text-emerald-700' : qa.score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {qa.score ?? 'N/A'}/10
                    </span>
                  </summary>
                  <div className="p-4 space-y-3 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-800">Your Answer:</span> {qa.answer || 'No answer recorded.'}</p>
                    <p><span className="font-semibold text-slate-800">Feedback:</span> {qa.feedback || 'No feedback available.'}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden">
      <Navbar />

      <div className="h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">Question {questionNumber}</p>
            <p className="text-xs text-slate-500">{Math.round((questionNumber / totalQuestions) * 100)}%</p>
          </div>
          <div className="w-full max-w-md h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden md:flex-row">
          <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 max-h-[170px] overflow-auto pr-2">
                  <h2 className="text-xl font-semibold text-slate-800 leading-relaxed break-words">
                    {question}
                  </h2>
                </div>
                <button
                  onClick={() => speak(question)}
                  className="shrink-0 w-10 h-10 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-full flex items-center justify-center transition"
                  title="Listen again"
                >
                  🔊
                </button>
              </div>

              {isSpeaking && (
                <p className="text-xs text-brand-600 font-medium mb-3">🔊 Speaking...</p>
              )}

              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1 min-h-0 overflow-hidden">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Your Answer
                </p>
                <div className="text-slate-700 leading-relaxed overflow-auto min-h-0 h-full">
                  {transcript || <span className="text-slate-400 italic">Your answer will appear here...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[420px] flex flex-col gap-4 overflow-hidden">
            <div className="bg-white border border-slate-200 rounded-2xl p-0 shadow-sm h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Cheating prevention</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cameraReady ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {cameraReady ? 'Camera active' : 'Camera disabled'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-full p-3 shadow-sm flex flex-col gap-3 items-center justify-center sm:flex-row sm:gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={submitting}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition shadow-md ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 animate-pulse text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              🎤
            </button>
            <div className="text-left">
              <p className="font-semibold text-slate-800">{isListening ? 'Recording your answer' : 'Click the mic to start recording'}</p>
              <p className="text-sm text-slate-500">Speak clearly and keep your camera visible.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={submitAnswer}
              disabled={submitting || !transcript.trim()}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {submitting
                ? 'Evaluating...'
                : questionNumber === totalQuestions
                  ? 'Finish Interview'
                  : 'Next Question →'}
            </button>
            <button
              onClick={endInterview}
              disabled={ending}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              {ending ? 'Ending Interview...' : 'End Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportBlock = ({ title, items, color }) => {
  const colorMap = {
    emerald: 'border-emerald-200 bg-emerald-50/50',
    rose: 'border-rose-200 bg-rose-50/50',
    sky: 'border-sky-200 bg-sky-50/50',
  };

  return (
    <div className={`border ${colorMap[color]} rounded-xl p-5`}>
      <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-700">
        {items?.length ? (
          items.map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span>•</span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li>No data available</li>
        )}
      </ul>
    </div>
  );
};

export default Interview;
