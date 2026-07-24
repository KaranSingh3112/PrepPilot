import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar";
import { formatBytes, fileToBase64 } from "../utils/fileToBase64";
import toast from "react-hot-toast";
import api from "../api/axios";


const JOB_ROLES = [
  'Frontend Developer',
  'Full Stack Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Mobile App Developer',
  'UI/UX Designer',
  'Product Manager',
  'Software Engineer',
]

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null);

  //File Validation
  const validateFile = (f) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowed.includes(f.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return false;
    }

    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return false;
    }
    return true;
  };


  //When user select a file
  const handleFile = (f) => {
    if (f && validateFile(f)) setFile(f)
  };

  //Submit: convert to base64, send to backend, redirect
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload your resume');
    if (!jobRole) return toast.error('Please select a target role');
    setLoading(true)

    try {
      // Convert file to base64 string
      const base64 = await fileToBase64(file);

      // Call backend to start interview
      const res = await api.post('/interview/start', {
        resumeBase64: base64,
        resumeName: file.name,
        mimeType: file.type,
        jobRole,
      });
      toast.success('Interview starting!');
      // Redirect to the interview page using the ID backend returned
      navigate(`/interview/${res.data.interviewId}`);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-800">Start a new Interview</h1>
        <p className="text-slate-500 mt-2 mb-8">
          Upload your resume and select a target role. We'll generate
          personalized questions based on your skills.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`bg-white border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400'
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {
              file ? (
                <div>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    ✓
                  </div>
                  <p className="font-semibold text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{formatBytes(file.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm text-rose-600 hover:underline mt-3"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">⬆</div>
                  <p className="font-semibold text-slate-800">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    PDF or DOCX · Max 5 MB
                  </p>
                </div>
              )
            }
          </div>
          {/* job Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white transition">
              <option value="">Select a role...</option>
              {JOB_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold rounded-lg transition"
            >
            {loading ? 'Starting interview...' : 'Start Interview'}
          </button>

          <p className="text-center text-xs text-slate-500">
            The interview consists of multiple
            questions. Make sure your microphone is enabled.
          </p>
        </form>
      </div>
    </div>
  )
}

export default Upload;
