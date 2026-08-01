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

  // Refs (mutable values that don't trigger re-renders)
  const recognitionRef = useRef(null);

  // Initial load: fetch the first question from backend
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
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
  };

  // stopListening() — stops mic
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // submitAnswer() — sends transcript to backend
  const submitAnswer = async () => {
    if (!transcript.trim()) {
      return toast.error('Please record an answer first');
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/interview/${id}/answer`, {
        answer: transcript.trim(),
      });

      if (res.data.completed) {
        // All 7 done → go to report
        toast.success('Interview completed! Generating report...');
        navigate(`/report/${id}`);
      } else {
        // Move to next question
        setQuestion(res.data.question);
        setQN(res.data.questionNumber);
        setTranscript('');
        setTimeout(() => speak(res.data.question), 400);
      }
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
      toast.success('Interview ended. Generating report...');
      navigate(`/report/${id}`);
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
    };
  }, []);

  if (loading) {
    return <><Navbar /><div className="p-10 text-center text-slate-500">Loading interview...</div></>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Question {questionNumber}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round((questionNumber / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-800 leading-relaxed flex-1">
              {question}
            </h2>
            <button
              onClick={() => speak(question)}
              className="shrink-0 w-10 h-10 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-full flex items-center justify-center transition"
              title="Listen again"
            >
              🔊
            </button>
          </div>

          {isSpeaking && (
            <p className="text-xs text-brand-600 font-medium">🔊 Speaking...</p>
          )}
        </div>

        {/* Recording area */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-center justify-center mb-6">
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
          </div>

          <p className="text-center text-sm text-slate-500 mb-6">
            {isListening
              ? 'Listening... click the mic to stop'
              : 'Click the microphone to start recording'}
          </p>

          {/* Live transcript */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[100px]">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Your Answer
            </p>
            <p className="text-slate-700 leading-relaxed">
              {transcript || <span className="text-slate-400 italic">Your answer will appear here...</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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
  );
};

export default Interview;
