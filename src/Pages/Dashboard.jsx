import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://localhost:3000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  // --- User State ---
  const [user, setUser] = useState({
    id: '',
    email: '',
    name: '',
    rollNumber: '',
    photoDataUrl: '',
    skills: [],
    appliedJobs: [],
    semesters: {},
    resumeDataUrl: '',
    githubUsername: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    hackerrankUrl: '',
    codechefUrl: '',
    codeforcesUrl: '',
    codingStats: {
      leetcode: null,
      codeforces: null,
      hackerrank: null,
      codechef: null
    },
    leetcodeData: null,
  });

  // --- Projects State (DB + GitHub) ---
  const [manualProjects, setManualProjects] = useState([]);
  const [githubProjects, setGithubProjects] = useState([]);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // --- Form States ---
  const [semesterForm, setSemesterForm] = useState({ name: '', grade: '' });
  const [skillForm, setSkillForm] = useState({ name: '', level: '', tags: '' });
  const [projectForm, setProjectForm] = useState({ title: '', link: '', desc: '', tags: '' });

  // --- Profile Update State ---
  const [profileUpdateForm, setProfileUpdateForm] = useState({
    githubUsername: '',
    linkedinUrl: '',
    mobileNumber: '',
    leetcodeUrl: '',
    hackerrankUrl: '',
    codechefUrl: '',
    codeforcesUrl: ''
  });

  // --- UI State for Saving Feedback ---
  const [saveStatus, setSaveStatus] = useState({});

  // --- Search & Job States ---
  const [skillSearch, setSkillSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [isJobLoading, setIsJobLoading] = useState(false);

  // --- Resume Parsing States (Analyzer) ---
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedSkills, setParsedSkills] = useState(null); // { category: [skills] }
  const [resumeError, setResumeError] = useState('');
  const [showJsonView, setShowJsonView] = useState(false);

  // --- New: Resume Update State (Update Profile tab) ---
  const [isUpdatingResume, setIsUpdatingResume] = useState(false);

  const profileUploadRef = useRef(null);
  const resumeUploadRef = useRef(null); // Analyzer tab
  const resumeUpdateRef = useRef(null); // Update Profile tab

  const books = [
    'Learn JavaScript.pdf',
    'HTML_CSS_Guide.pdf',
    'DS_Python.pdf',
    'React_Fundamentals.pdf'
  ];

  // -------------------------------------------------------------------------
  // 1. FETCH USER DATA & MANUAL PROJECTS ON LOAD
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem('userId');

      if (!storedUserId) {
        navigate('/login');
        return;
      }

      try {
        // A. Fetch User Profile
        const res = await fetch(`${API_BASE}/api/signup/${storedUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();

        // Map Semesters
        const fetchedSemesters = {};
        if (data.gpa_sem_1) fetchedSemesters['Semester 1'] = data.gpa_sem_1;
        if (data.gpa_sem_2) fetchedSemesters['Semester 2'] = data.gpa_sem_2;
        if (data.gpa_sem_3) fetchedSemesters['Semester 3'] = data.gpa_sem_3;
        if (data.gpa_sem_4) fetchedSemesters['Semester 4'] = data.gpa_sem_4;
        if (data.gpa_sem_5) fetchedSemesters['Semester 5'] = data.gpa_sem_5;
        if (data.gpa_sem_6) fetchedSemesters['Semester 6'] = data.gpa_sem_6;
        if (data.gpa_sem_7) fetchedSemesters['Semester 7'] = data.gpa_sem_7;
        if (data.gpa_sem_8) fetchedSemesters['Semester 8'] = data.gpa_sem_8;

        const userData = {
          id: data.id,
          name: data.full_name,
          email: data.email,
          rollNumber: data.roll_number || '',
          photoDataUrl: data.profile_image_url || '',
          resumeDataUrl: data.resume_url || '',
          semesters: fetchedSemesters,
          mobileNumber: data.mobile_number || '',

          // Socials
          githubUsername: data.github_username || '',
          linkedinUrl: data.linkedin_url || '',
          leetcodeUrl: data.leetcode_url || '',
          hackerrankUrl: data.hackerrank_url || '',
          codechefUrl: data.codechef_url || '',
          codeforcesUrl: data.codeforces_url || '',

          skills: [],
          appliedJobs: [],
          codingStats: {
            leetcode: null,
            codeforces: null,
            hackerrank: null,
            codechef: null
          },
          leetcodeData: null
        };

        setUser(userData);

        // Initialize separate form state
        setProfileUpdateForm({
          githubUsername: userData.githubUsername,
          linkedinUrl: userData.linkedinUrl,
          mobileNumber: userData.mobileNumber,
          leetcodeUrl: userData.leetcodeUrl,
          hackerrankUrl: userData.hackerrankUrl,
          codechefUrl: userData.codechefUrl,
          codeforcesUrl: userData.codeforcesUrl
        });

        // B. Fetch Manual Projects from DB
        const projRes = await fetch(`${API_BASE}/api/projects/${storedUserId}`);
        if (projRes.ok) {
          const projData = await projRes.json();
          const taggedProjects = projData.map(p => ({ ...p, source: 'manual' }));
          setManualProjects(taggedProjects);
        }

      } catch (err) {
        console.error(err);
        alert("Session expired or error fetching data");
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getUsernameFromUrl = (url) => {
    if (!url) return null;
    try {
      const cleanUrl = url.replace(/\/$/, "");
      const parts = cleanUrl.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return null;
    }
  };

  // -------------------------------------------------------------------------
  // 2. FETCH CODING STATS (LeetCode basic, Codeforces, HR, CC)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      let newStats = { ...user.codingStats };

      // 1. LeetCode basic stats (via public proxy)
      if (user.leetcodeUrl && !newStats.leetcode) {
        const username = getUsernameFromUrl(user.leetcodeUrl);
        if (username) {
          try {
            const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
            const data = await res.json();
            if (data.status === 'success') {
              newStats.leetcode = {
                solved: data.totalSolved,
                ranking: data.ranking,
                acceptance: data.acceptanceRate
              };
            }
          } catch (e) { console.error("LeetCode Fetch Error", e); }
        }
      }

      // 2. CodeForces (Official API)
      if (user.codeforcesUrl && !newStats.codeforces) {
        const username = getUsernameFromUrl(user.codeforcesUrl);
        if (username) {
          try {
            const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
            const data = await res.json();
            if (data.status === 'OK') {
              const info = data.result[0];
              newStats.codeforces = {
                rating: info.rating,
                rank: info.rank,
                maxRating: info.maxRating
              };
            }
          } catch (e) { console.error("CodeForces Fetch Error", e); }
        }
      }

      // 3. HackerRank & CodeChef placeholders
      if (user.hackerrankUrl && !newStats.hackerrank) {
        newStats.hackerrank = {
          status: 'Linked',
          username: getUsernameFromUrl(user.hackerrankUrl)
        };
      }
      if (user.codechefUrl && !newStats.codechef) {
        newStats.codechef = {
          status: 'Linked',
          username: getUsernameFromUrl(user.codechefUrl)
        };
      }

      setUser(prev => ({ ...prev, codingStats: newStats }));
    };

    fetchStats();
    // only monitor profile links
  }, [user.leetcodeUrl, user.codeforcesUrl, user.hackerrankUrl, user.codechefUrl]);

  // -------------------------------------------------------------------------
  // 3. FETCH LEETCODE DETAILED STATS (Languages & Skills via BACKEND)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchLeetCodeData = async () => {
      if (!user.leetcodeUrl) return;
      const username = getUsernameFromUrl(user.leetcodeUrl);
      if (!username) return;

      try {
        const res = await fetch(`${API_BASE}/api/leetcode/${username}`);
        if (res.ok) {
          const data = await res.json();
          setUser(prev => ({ ...prev, leetcodeData: data }));
        }
      } catch (e) {
        console.error("LeetCode detailed fetch error", e);
      }
    };

    fetchLeetCodeData();
  }, [user.leetcodeUrl]);

  // -------------------------------------------------------------------------
  // 4. FETCH GITHUB PROJECTS
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchGithubRepos = async () => {
      if (!user.githubUsername) {
        setGithubProjects([]);
        return;
      }

      setIsGithubLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=5`
        );
        if (!res.ok) throw new Error("GitHub User not found");

        const repos = await res.json();
        const describedRepos = repos.filter(
          (repo) => typeof repo.description === 'string' && repo.description.trim().length > 0
        );

        const mappedRepos = describedRepos.map((repo) => ({
          source: 'github',
          id: repo.id,
          title: repo.name,
          link: repo.html_url,
          desc: repo.description.trim(),
          tags: repo.language || "Code",
        }));

        setGithubProjects(mappedRepos);
      } catch (err) {
        console.error("GitHub Fetch Error:", err);
        setGithubProjects([]);
      } finally {
        setIsGithubLoading(false);
      }
    };

    fetchGithubRepos();
  }, [user.githubUsername]);

  // -------------------------------------------------------------------------
  // 5. FETCH LINKEDIN JOBS
  // -------------------------------------------------------------------------
  const fetchJobs = async (query = 'Software Engineer') => {
    setIsJobLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobsList(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching jobs from LinkedIn API");
    } finally {
      setIsJobLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'jobs' && jobsList.length === 0) {
      fetchJobs();
    }
  }, [activeSection, jobsList.length]);

  // -------------------------------------------------------------------------
  // 6. HANDLERS
  // -------------------------------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem('userId');
    alert('Logged out successfully');
    navigate('/login');
  };

  const computeCgpa = () => {
    const vals = Object.values(user.semesters || {})
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));
    if (!vals.length) return 'N/A';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  // --- Generic Profile Field Save ---
  const handleIndividualSave = useCallback(
    async (fieldName) => {
      if (!user.id || saveStatus[fieldName] === 'saving') return;

      const formValue = profileUpdateForm[fieldName];
      const userValue = user[fieldName];

      if (formValue === userValue) {
        setSaveStatus(prev => ({ ...prev, [fieldName]: 'nochange' }));
        setTimeout(
          () => setSaveStatus(prev => ({ ...prev, [fieldName]: null })),
          1500
        );
        return;
      }

      setSaveStatus(prev => ({ ...prev, [fieldName]: 'saving' }));

      // convert to snake_case for backend
      const payload = { [fieldName]: formValue };
      const backendPayload = {};
      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          backendPayload[snakeCaseKey] = payload[key];
        }
      }

      try {
        const res = await fetch(`${API_BASE}/api/signup/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendPayload),
        });

        if (!res.ok) throw new Error("Failed to update profile data");

        setUser(prev => ({ ...prev, [fieldName]: formValue }));
        setSaveStatus(prev => ({ ...prev, [fieldName]: 'saved' }));
      } catch (err) {
        console.error(err);
        setSaveStatus(prev => ({ ...prev, [fieldName]: 'error' }));
        alert(`Error saving ${fieldName}.`);
      } finally {
        setTimeout(
          () => setSaveStatus(prev => ({ ...prev, [fieldName]: null })),
          2000
        );
      }
    },
    [user, profileUpdateForm, saveStatus]
  );

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUser(prev => ({ ...prev, photoDataUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSemesterSubmit = (e) => {
    e.preventDefault();
    if (!semesterForm.name || !semesterForm.grade) return;
    const newSemesters = {
      ...user.semesters,
      [semesterForm.name]: parseFloat(semesterForm.grade)
    };
    setUser({ ...user, semesters: newSemesters });
    setSemesterForm({ name: '', grade: '' });
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    if (!skillForm.name || !skillForm.level) return;
    const newSkills = [
      ...user.skills,
      { name: skillForm.name, level: skillForm.level, tags: skillForm.tags }
    ];
    setUser({ ...user, skills: newSkills });
    setSkillForm({ name: '', level: '', tags: '' });
  };

  const deleteSkill = (index) => {
    const newSkills = user.skills.filter((_, i) => i !== index);
    setUser({ ...user, skills: newSkills });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.desc) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          title: projectForm.title,
          link: projectForm.link,
          tags: projectForm.tags,
          description: projectForm.desc
        })
      });

      if (!res.ok) throw new Error("Failed to save project");
      const newProjectData = await res.json();

      const addedProj = Array.isArray(newProjectData) ? newProjectData[0] : newProjectData;
      const projectWithSource = { ...addedProj, source: 'manual' };

      setManualProjects([projectWithSource, ...manualProjects]);
      setProjectForm({ title: '', link: '', desc: '', tags: '' });
      alert("Project added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding project");
    }
  };

  const deleteManualProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      setManualProjects(manualProjects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error(err);
      alert("Error deleting project");
    }
  };

  const handleSaveJob = (jobUrl) => {
    if (!user.appliedJobs.includes(jobUrl)) {
      setUser({ ...user, appliedJobs: [...user.appliedJobs, jobUrl] });
      alert('Job saved to "Applied Jobs"!');
    } else {
      alert('Job already saved');
    }
  };

  // --- RESUME: UPLOAD + PARSE (Analyzer tab)
  const handleResumeCheck = async () => {
    const file = resumeUploadRef.current?.files?.[0];
    if (!file) {
      alert('Please upload a PDF resume');
      return;
    }

    setIsParsingResume(true);
    setParsedSkills(null);
    setResumeError('');
    setShowJsonView(false);

    // Local preview for download
    const reader = new FileReader();
    reader.onload = () => {
      setUser(prev => ({ ...prev, resumeDataUrl: reader.result }));
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/resume/extract`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      if (data.success && data.skills && Object.keys(data.skills).length > 0) {
        setParsedSkills(data.skills);
      } else {
        setResumeError(
          data.rawText ||
          "Could not identify a clear 'Skills' section. Make sure your resume has a 'Technical Skills' or 'Skills' header."
        );
      }
    } catch (err) {
      console.error("Resume Parse Error:", err);
      setResumeError("Error processing resume. Please try again with a standard PDF.");
    } finally {
      setIsParsingResume(false);
    }
  };

  // --- Resume Update (Update Profile tab) ---
  const handleResumeUpdateSubmit = async () => {
    const file = resumeUpdateRef.current?.files?.[0];
    if (!file) {
      alert('Please select a file to update.');
      return;
    }

    setIsUpdatingResume(true);
    const formData = new FormData();
    // backend expects named field; adjust if needed
    formData.append('resume', file);

    try {
      const res = await fetch(`${API_BASE}/api/signup/${user.id}/resume`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update resume");

      // Expecting backend to return updated resume URL (e.g. { resumeUrl: '...' })
      setUser(prev => ({ ...prev, resumeDataUrl: data.resumeUrl || data.resume_url || prev.resumeDataUrl }));
      alert("Resume updated successfully!");
      if (resumeUpdateRef.current) resumeUpdateRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Error updating resume: " + (err.message || err));
    } finally {
      setIsUpdatingResume(false);
    }
  };

  const applyExtractedSkills = () => {
    if (!parsedSkills) return;

    const newSkills = [];
    Object.entries(parsedSkills).forEach(([category, skillsArray]) => {
      skillsArray.forEach(skillName => {
        let level = 'Intermediate';
        const cat = category.toLowerCase();
        if (cat.includes('fundamental') || cat.includes('basic')) level = 'Beginner';
        if (cat.includes('advanced') || cat.includes('expert')) level = 'Expert';

        if (!user.skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
          newSkills.push({ name: skillName, level, tags: category });
        }
      });
    });

    if (newSkills.length === 0) {
      alert('All extracted skills are already in your profile.');
      return;
    }

    setUser(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
    alert(`Added ${newSkills.length} new skills to your profile!`);
  };

  const handleResumeDownload = () => {
    if (!user.resumeDataUrl) {
      alert('No resume uploaded');
      return;
    }
    const a = document.createElement('a');
    a.href = user.resumeDataUrl;
    a.download = 'resume.pdf';
    a.click();
  };

  const filteredSkills = user.skills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const skillLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-amber-500';
      case 'Intermediate': return 'bg-blue-600';
      case 'Expert': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };

  const SaveFeedback = ({ fieldName }) => {
    const status = saveStatus[fieldName];
    if (!status) return null;

    let icon, color, text;
    switch (status) {
      case 'saving': icon = '🔄'; color = 'text-amber-500'; text = 'Saving...'; break;
      case 'saved': icon = '✅'; color = 'text-emerald-500'; text = 'Saved!'; break;
      case 'error': icon = '❌'; color = 'text-red-500'; text = 'Error!'; break;
      case 'nochange': icon = 'ℹ️'; color = 'text-gray-500'; text = 'No change.'; break;
      default: return null;
    }
    return (
      <span className={`text-sm font-medium ml-3 ${color} flex items-center gap-1`}>
        {icon} {text}
      </span>
    );
  };

  const allProjects = [...manualProjects, ...githubProjects];
  const displayedProjects = allProjects.filter((project) => {
    if (project.source !== 'github') return true;
    const rawDesc = (project.desc ?? project.description ?? '').trim();
    if (!rawDesc) return false;
    if (rawDesc === 'No description available on GitHub.') return false;
    return true;
  });

  const flattenedParsedSkills = parsedSkills
    ? Object.entries(parsedSkills).flatMap(([category, arr]) =>
        arr.map(skill => ({ category, skill }))
      )
    : [];

  // -------------------------------------------------------------------------
  // RENDER UI
  // -------------------------------------------------------------------------
  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-[255px] bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] text-white p-6 flex flex-col items-center">
        <div className="text-center mb-6 w-full">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white mx-auto mb-3 bg-white">
            <img
              src={user.photoDataUrl || 'https://via.placeholder.com/120'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="file"
            ref={profileUploadRef}
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => profileUploadRef.current?.click()}
            className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md font-medium"
          >
            Change Photo
          </button>
          <div className="font-bold text-base mt-3">{user.name}</div>
          <div className="text-sm opacity-90 mt-1">{user.email}</div>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white/90 text-gray-800 placeholder-gray-500 outline-none mb-4"
        />

        <nav className="w-full flex flex-col gap-2 mb-auto">
          {[
            'home',
            'jobs',
            'applied',
            'books',
            'recommendation',
            'resume',
            'analytics',
            'update-profile'
          ].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
                activeSection === section ? 'bg-blue-700' : 'bg-blue-800/50 hover:bg-blue-700'
              }`}
            >
              {section
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </button>
          ))}
        </nav>

        <div className="w-full flex flex-col gap-2 mt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-md font-semibold"
          >
            Logout
          </button>
          <button
            onClick={() => document.body.classList.toggle('dark')}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white px-4 py-2.5 rounded-md font-semibold"
          >
            Dark Mode
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {/* --- HOME SECTION --- */}
        {activeSection === 'home' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Profile</h2>

            {/* Profile Header */}
            <div className="flex gap-6 items-start mb-8">
              <div className="w-[200px] flex-shrink-0">
                <img
                  src={user.photoDataUrl || 'https://via.placeholder.com/200'}
                  alt="Profile"
                  className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex gap-4 flex-1">
                <div className="bg-white p-5 rounded-lg shadow-sm flex-1 border border-gray-200">
                  <label className="text-gray-500 text-sm block mb-2">Name</label>
                  <div className="text-xl font-bold text-gray-900">{user.name}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm flex-1 border border-gray-200">
                  <label className="text-gray-500 text-sm block mb-2">Hall Ticket No.</label>
                  <div className="text-xl font-bold text-gray-900">{user.rollNumber || "-"}</div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm flex-1 border border-gray-200">
                  <label className="text-gray-500 text-sm block mb-2">CGPA</label>
                  <div className="text-xl font-bold text-gray-900">{computeCgpa()}</div>
                </div>
              </div>
            </div>

            {/* Contact & Links */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Contact & Links</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-gray-600">Mobile:</strong>{' '}
                  {user.mobileNumber || 'N/A'}
                </div>
                <div>
                  <strong className="text-gray-600">LinkedIn:</strong>{' '}
                  {user.linkedinUrl ? (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Link
                    </a>
                  ) : 'N/A'}
                </div>
                <div>
                  <strong className="text-gray-600">GitHub:</strong>{' '}
                  {user.githubUsername ? (
                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {user.githubUsername}
                    </a>
                  ) : 'N/A'}
                </div>
              </div>
            </div>

            {/* CODING PROFILES (basic stats) */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Coding Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* LeetCode */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-yellow-600">LeetCode</span>
                    {user.leetcodeUrl && (
                      <a
                        href={user.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                  {user.codingStats.leetcode ? (
                    <div className="text-sm">
                      <div>
                        Solved: <strong>{user.codingStats.leetcode.solved}</strong>
                      </div>
                      <div>Acceptance: {user.codingStats.leetcode.acceptance}%</div>
                      <div>Ranking: {user.codingStats.leetcode.ranking}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {user.leetcodeUrl ? "Loading stats..." : "Not Linked"}
                    </div>
                  )}
                </div>

                {/* CodeForces */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-800">CodeForces</span>
                    {user.codeforcesUrl && (
                      <a
                        href={user.codeforcesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                  {user.codingStats.codeforces ? (
                    <div className="text-sm">
                      <div>
                        Rating:{' '}
                        <strong>{user.codingStats.codeforces.rating}</strong>{' '}
                        ({user.codingStats.codeforces.rank})
                      </div>
                      <div>Max Rating: {user.codingStats.codeforces.maxRating}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {user.codeforcesUrl ? "Loading stats..." : "Not Linked"}
                    </div>
                  )}
                </div>

                {/* HackerRank */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-green-600">HackerRank</span>
                    {user.hackerrankUrl && (
                      <a
                        href={user.hackerrankUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.hackerrankUrl
                      ? `✅ Account Linked: ${user.codingStats.hackerrank?.username || ''}`
                      : "Not Linked"}
                  </div>
                </div>

                {/* CodeChef */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-amber-800">CodeChef</span>
                    {user.codechefUrl && (
                      <a
                        href={user.codechefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.codechefUrl
                      ? `✅ Account Linked: ${user.codingStats.codechef?.username || ''}`
                      : "Not Linked"}
                  </div>
                </div>
              </div>
            </div>

            {/* LEETCODE DETAILED INSIGHTS (languages + skills from backend) */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">LeetCode Detailed Insights</h3>
              {user.leetcodeData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Languages */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">
                      Languages Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.leetcodeData.languages.map((lang, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md text-sm flex justify-between items-center min-w-[120px]"
                        >
                          <span className="font-medium text-gray-800">
                            {lang.languageName}
                          </span>
                          <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                            {lang.problemsSolved}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills / Tags */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">
                      Top Skills (Fundamental)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.leetcodeData.skills.fundamental
                        .slice(0, 10)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded text-xs font-medium"
                          >
                            {tag.tagName} ({tag.problemsSolved})
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  {user.leetcodeUrl
                    ? "Loading detailed LeetCode stats..."
                    : "Link your LeetCode profile in the 'Update Profile' tab to see detailed stats here."}
                </div>
              )}
            </div>

            {/* Semester Grades */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-900">Semester Grades</h3>
              <form onSubmit={handleSemesterSubmit} className="flex gap-3 flex-wrap mb-4">
                <input
                  type="text"
                  placeholder="Semester Name e.g. Semester 1"
                  value={semesterForm.name}
                  onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                  className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="CGPA"
                  value={semesterForm.grade}
                  onChange={(e) => setSemesterForm({ ...semesterForm, grade: e.target.value })}
                  className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[120px] outline-blue-600"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  Add
                </button>
              </form>
              <ul className="list-none space-y-2">
                {Object.entries(user.semesters || {}).map(([sem, grade]) => (
                  <li
                    key={sem}
                    className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200"
                  >
                    <span className="text-gray-800">
                      {sem}: {grade}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2 text-gray-900">Skills</h3>
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 outline-blue-600"
                />
              </div>
              <form onSubmit={handleSkillSubmit} className="flex gap-3 flex-wrap mb-4">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600"
                  required
                />
                <select
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                  className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[160px] outline-blue-600"
                  required
                >
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={skillForm.tags}
                  onChange={(e) => setSkillForm({ ...skillForm, tags: e.target.value })}
                  className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  Add
                </button>
              </form>
              <ul className="list-none space-y-2">
                {filteredSkills.map((skill, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${skillLevelColor(skill.level)}`}></span>
                      <span className="font-semibold text-gray-800">{skill.name}</span>
                      <span className="text-gray-600 text-sm">({skill.level})</span>
                      {skill.tags && (
                        <span className="text-xs text-gray-500 ml-2">{skill.tags}</span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSkill(idx)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-900">Projects</h3>
                {user.githubUsername ? (
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-300">
                    ✓ GitHub Linked: <strong>{user.githubUsername}</strong>
                  </span>
                ) : (
                  <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-300">
                    GitHub not linked
                  </span>
                )}
              </div>

              {/* Form for Manual Projects */}
              <form
                onSubmit={handleProjectSubmit}
                className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h4 className="text-sm font-bold text-gray-500 uppercase">Add Manual Project</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Project title"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={projectForm.tags}
                    onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300"
                  />
                </div>
                <input
                  type="url"
                  placeholder="Project Link (Optional)"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                />
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={projectForm.desc}
                  onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300"
                  required
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold self-start text-sm"
                >
                  Add Project
                </button>
              </form>

              {/* Projects List */}
              <div className="flex flex-col gap-3">
                {isGithubLoading && (
                  <div className="text-center text-gray-500 py-2">Loading GitHub repos...</div>
                )}
                {displayedProjects.length === 0 && !isGithubLoading && (
                  <div className="text-center text-gray-400 py-4">
                    No projects found. Add one manually or link GitHub.
                  </div>
                )}
                {displayedProjects.map((project, idx) => {
                  const projectDescription = (project.desc ?? project.description ?? '').trim();
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-md border ${
                        project.source === 'github'
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-gray-900 text-lg">{project.title}</div>
                            {project.source === 'github' ? (
                              <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full tracking-wider font-bold">
                                GITHUB
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full tracking-wider font-bold">
                                MANUAL
                              </span>
                            )}
                          </div>
                          {projectDescription && (
                            <div className="text-sm text-gray-700 mt-1">{projectDescription}</div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
                            >
                              View
                            </a>
                          )}
                          {project.source !== 'github' && (
                            <button
                              onClick={() => deleteManualProject(project.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      {project.tags && (
                        <small className="text-gray-500 block mt-2 font-mono text-xs">
                          {project.tags}
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- JOBS SECTION --- */}
        {activeSection === 'jobs' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Available Jobs (LinkedIn)</h2>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search LinkedIn jobs (e.g. React Developer)"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
              />
              <button
                onClick={() => fetchJobs(jobSearch)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
              >
                Search
              </button>
            </div>
            {isJobLoading ? (
              <div className="text-center py-10 text-gray-600">Loading jobs...</div>
            ) : (
              <div className="space-y-4">
                {jobsList.length > 0 ? (
                  jobsList.map((job, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                      <strong className="text-xl text-gray-900 block">{job.position}</strong>
                      <div className="text-gray-600 mt-1 font-semibold">{job.company}</div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span>📍 {job.location}</span>
                        <span>📅 {job.date}</span>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold inline-block"
                        >
                          Apply on LinkedIn
                        </a>
                        <button
                          onClick={() => handleSaveJob(job.jobUrl)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold"
                        >
                          Save Job
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">
                    No jobs found. Try searching for something else.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- APPLIED JOBS --- */}
        {activeSection === 'applied' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Applied/Saved Jobs</h2>
            <div className="space-y-4">
              {user.appliedJobs.length > 0 ? (
                user.appliedJobs.map((jobUrl, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
                  >
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap mr-4 text-blue-600 font-medium">
                      <a href={jobUrl} target="_blank" rel="noopener noreferrer">
                        {jobUrl}
                      </a>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Saved
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No jobs saved yet.</p>
              )}
            </div>
          </div>
        )}

        {/* --- BOOKS --- */}
        {activeSection === 'books' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Books</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <ul className="list-disc pl-5 space-y-2">
                {books.map((book, idx) => (
                  <li key={idx} className="text-gray-800">
                    {book}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- RECOMMENDATIONS --- */}
        {activeSection === 'recommendation' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Recommendations</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-800 mb-4">
                Based on your profile: consider internships in Web Development / Data Analysis
                fields.
              </p>
              {user.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-3 text-gray-900">Your Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- RESUME CHECKER / ANALYZER (MERGED) --- */}
        {activeSection === 'resume' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Resume Analyzer</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Upload + Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-4 text-gray-900">Upload Resume</h3>
                <input
                  ref={resumeUploadRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="mb-4 block w-full text-sm text-gray-800 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer file:font-semibold hover:file:bg-blue-700"
                />
                <div className="flex gap-3 mb-4 flex-wrap">
                  <button
                    onClick={handleResumeCheck}
                    disabled={isParsingResume}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 text-sm"
                  >
                    {isParsingResume ? 'Scanning...' : '⚡ Scan & Extract Skills'}
                  </button>
                  <button
                    onClick={handleResumeDownload}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm"
                  >
                    Download Uploaded
                  </button>
                </div>

                {resumeError && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {resumeError}
                  </div>
                )}

                {user.resumeDataUrl && !resumeError && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    Resume uploaded successfully! You can refine it by adding more achievements,
                    internships, and a strong summary section.
                  </div>
                )}
              </div>

              {/* RIGHT: Extracted skills + JSON view */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  Extracted Skills (Detailed)
                </h3>

                {parsedSkills && Object.keys(parsedSkills).length > 0 ? (
                  <>
                    {/* By category */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                      {Object.entries(parsedSkills).map(([category, items]) => (
                        <div
                          key={category}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900">{category}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {items.length} skill{items.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Flat table */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        All Skills (Skill + Category)
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-auto max-h-52">
                        <table className="min-w-full text-xs text-left">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-2 font-semibold text-gray-700 w-10">#</th>
                              <th className="px-3 py-2 font-semibold text-gray-700">Skill</th>
                              <th className="px-3 py-2 font-semibold text-gray-700">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {flattenedParsedSkills.map((row, idx) => (
                              <tr
                                key={`${row.category}-${row.skill}-${idx}`}
                                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                              >
                                <td className="px-3 py-1.5 text-gray-600">{idx + 1}</td>
                                <td className="px-3 py-1.5 text-gray-900 font-medium">
                                  {row.skill}
                                </td>
                                <td className="px-3 py-1.5 text-gray-700">
                                  {row.category}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* JSON view toggle */}
                    <div className="mt-4">
                      <button
                        onClick={() => setShowJsonView(prev => !prev)}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100"
                      >
                        {showJsonView ? 'Hide Raw JSON View' : 'Show Raw JSON View'}
                      </button>
                      {showJsonView && (
                        <div className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-64">
                          <pre className="font-mono whitespace-pre">
{`"skills": ${JSON.stringify(parsedSkills, null, 4)}`}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Add to profile */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={applyExtractedSkills}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm"
                      >
                        Add Skills to Profile
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-md">
                    // Upload and scan a resume to see extracted skills here.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- ANALYTICS --- */}
        {activeSection === 'analytics' && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Analytics</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-600">
                Analytics charts would be displayed here using Chart.js library (Skills, CGPA,
                Job Stats).
              </p>
            </div>
          </div>
        )}

        {/* --- UPDATE PROFILE --- */}
        {activeSection === 'update-profile' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">🔗 Update Contact & Links</h2>
            <div className="flex flex-col gap-5">
              {/* 1. Update Resume (NEW) */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">📄 Update Resume</h3>
                <div className="flex gap-3 items-center">
                  <input
                    ref={resumeUpdateRef}
                    type="file"
                    accept=".pdf"
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={handleResumeUpdateSubmit}
                    disabled={isUpdatingResume}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold"
                  >
                    {isUpdatingResume ? 'Updating...' : 'Upload New Resume'}
                  </button>
                </div>
                {user.resumeDataUrl && <p className="text-xs mt-2 text-emerald-600">✓ Current resume available on file</p>}
              </div>

              {/* GitHub Username */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  GitHub Username <SaveFeedback fieldName="githubUsername" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. yourusername"
                    value={profileUpdateForm.githubUsername}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        githubUsername: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('githubUsername')}
                    disabled={saveStatus.githubUsername === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  LinkedIn Profile URL <SaveFeedback fieldName="linkedinUrl" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://linkedin.com/in/..."
                    value={profileUpdateForm.linkedinUrl}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        linkedinUrl: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('linkedinUrl')}
                    disabled={saveStatus.linkedinUrl === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  Mobile Number <SaveFeedback fieldName="mobileNumber" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={profileUpdateForm.mobileNumber}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        mobileNumber: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('mobileNumber')}
                    disabled={saveStatus.mobileNumber === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              <hr className="my-4 border-gray-200" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Coding Profiles</h3>

              {/* LeetCode URL */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  LeetCode URL <SaveFeedback fieldName="leetcodeUrl" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://leetcode.com/username"
                    value={profileUpdateForm.leetcodeUrl}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        leetcodeUrl: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('leetcodeUrl')}
                    disabled={saveStatus.leetcodeUrl === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* HackerRank URL */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  HackerRank URL <SaveFeedback fieldName="hackerrankUrl" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://hackerrank.com/username"
                    value={profileUpdateForm.hackerrankUrl}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        hackerrankUrl: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('hackerrankUrl')}
                    disabled={saveStatus.hackerrankUrl === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* CodeChef URL */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  CodeChef URL <SaveFeedback fieldName="codechefUrl" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://www.codechef.com/users/username"
                    value={profileUpdateForm.codechefUrl}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        codechefUrl: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('codechefUrl')}
                    disabled={saveStatus.codechefUrl === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* CodeForces URL */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-semibold mb-2 flex items-center">
                  CodeForces URL <SaveFeedback fieldName="codeforcesUrl" />
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="e.g. https://codeforces.com/profile/username"
                    value={profileUpdateForm.codeforcesUrl}
                    onChange={(e) =>
                      setProfileUpdateForm({
                        ...profileUpdateForm,
                        codeforcesUrl: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleIndividualSave('codeforcesUrl')}
                    disabled={saveStatus.codeforcesUrl === 'saving'}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
