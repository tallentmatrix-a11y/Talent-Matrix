import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    addSkill, deleteSkill, updateSemester, addManualProject, removeManualProject, fetchGithubRepos 
} from '../redux/userSlice';

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const githubStatus = useSelector((state) => state.user.githubStatus);

  // Local Inputs
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [skillTags, setSkillTags] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [semInput, setSemInput] = useState({ name: '', grade: '' });
  const [projInput, setProjInput] = useState({ title: '', desc: '', link: '', tags: '' });

  // Fetch GitHub Projects on load if username exists
  useEffect(() => {
    if (user.githubUsername && user.githubProjects?.length === 0) {
        dispatch(fetchGithubRepos(user.githubUsername));
    }
  }, [user.githubUsername, dispatch]);

  const computeCgpa = () => {
    const vals = Object.values(user.semesters || {}).map(v => parseFloat(v)).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 'N/A';
  };

  const skillLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-amber-500';
      case 'Intermediate': return 'bg-blue-600';
      case 'Expert': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };

  const handleAddSkill = (e) => {
      e.preventDefault();
      if(!skillInput) return;
      dispatch(addSkill({ name: skillInput, level: skillLevel, tags: skillTags }));
      setSkillInput(''); setSkillTags('');
  };

  const filteredSkills = user.skills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()));

  const handleAddProject = (e) => {
      e.preventDefault();
      dispatch(addManualProject({ 
          id: Date.now(), 
          title: projInput.title, 
          description: projInput.desc, 
          link: projInput.link, 
          tags: projInput.tags 
      }));
      setProjInput({ title: '', desc: '', link: '', tags: '' });
  };

  // Combine Projects
  const allProjects = [
      ...(user.manualProjects || []), 
      ...(user.githubProjects || [])
  ];

  return (
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
          <div><strong className="text-gray-600">Mobile:</strong> {user.mobileNumber || 'N/A'}</div>
          <div><strong className="text-gray-600">LinkedIn:</strong> {user.linkedinUrl ? <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : 'N/A'}</div>
          <div><strong className="text-gray-600">GitHub:</strong> {user.githubUsername ? <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{user.githubUsername}</a> : 'N/A'}</div>
        </div>
      </div>

      {/* CODING PROFILES */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <h3 className="font-bold text-xl mb-4 text-gray-900">Coding Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-yellow-600">LeetCode</span>
              {user.leetcodeUrl && <a href={user.leetcodeUrl} target="_blank" className="text-xs text-blue-500 hover:underline">View</a>}
            </div>
            <div className="text-xs text-gray-500">{user.leetcodeUrl ? "Linked" : "Not Linked"}</div>
          </div>
           <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-800">CodeForces</span>
              {user.codeforcesUrl && <a href={user.codeforcesUrl} target="_blank" className="text-xs text-blue-500 hover:underline">View</a>}
            </div>
            <div className="text-xs text-gray-500">{user.codeforcesUrl ? "Linked" : "Not Linked"}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center mb-2"><span className="font-bold text-green-600">HackerRank</span></div>
             <div className="text-xs text-gray-500">{user.hackerrankUrl ? "✅ Account Linked" : "Not Linked"}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-center mb-2"><span className="font-bold text-amber-800">CodeChef</span></div>
             <div className="text-xs text-gray-500">{user.codechefUrl ? "✅ Account Linked" : "Not Linked"}</div>
          </div>
        </div>
      </div>

      {/* Semester Grades */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <h3 className="font-bold text-xl mb-4 text-gray-900">Semester Grades</h3>
        <div className="flex gap-3 flex-wrap mb-4">
          <input type="text" placeholder="Semester Name" value={semInput.name} onChange={(e) => setSemInput({ ...semInput, name: e.target.value })} className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600" />
          <input type="number" step="0.01" placeholder="CGPA" value={semInput.grade} onChange={(e) => setSemInput({ ...semInput, grade: e.target.value })} className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[120px] outline-blue-600" />
          <button onClick={() => {dispatch(updateSemester(semInput)); setSemInput({name:'', grade:''})}} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold">Add</button>
        </div>
        <ul className="list-none space-y-2">
          {Object.entries(user.semesters || {}).map(([sem, grade]) => (
            <li key={sem} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200">
              <span className="text-gray-800">{sem}: {grade}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skills Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <div className="mb-4">
          <h3 className="font-bold text-xl mb-2 text-gray-900">Skills</h3>
          <input type="text" placeholder="Search skills..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 outline-blue-600" />
        </div>
        <form onSubmit={handleAddSkill} className="flex gap-3 flex-wrap mb-4">
          <input type="text" placeholder="Skill name" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600" required />
          <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[160px] outline-blue-600">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <input type="text" placeholder="Tags" value={skillTags} onChange={(e) => setSkillTags(e.target.value)} className="px-3 py-2.5 rounded-md border border-gray-300 bg-white min-w-[180px] outline-blue-600" />
          <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold">Add</button>
        </form>
        <ul className="list-none space-y-2">
          {filteredSkills.map((skill, idx) => (
            <li key={idx} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${skillLevelColor(skill.level)}`}></span>
                <span className="font-semibold text-gray-800">{skill.name}</span>
                <span className="text-gray-600 text-sm">({skill.level})</span>
                {skill.tags && <span className="text-xs text-gray-500 ml-2">{skill.tags}</span>}
              </div>
              <button onClick={() => dispatch(deleteSkill(idx))} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium">Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Projects Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-900">Projects</h3>
          {user.githubUsername ? (
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-300">✓ GitHub Linked: <strong>{user.githubUsername}</strong></span>
          ) : (
            <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full border border-gray-300">GitHub not linked</span>
          )}
        </div>

        <form onSubmit={handleAddProject} className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-bold text-gray-500 uppercase">Add Manual Project</h4>
          <div className="flex gap-3">
            <input type="text" placeholder="Project title" value={projInput.title} onChange={(e) => setProjInput({ ...projInput, title: e.target.value })} className="flex-1 px-3 py-2 rounded-md border border-gray-300" required />
            <input type="text" placeholder="Tags" value={projInput.tags} onChange={(e) => setProjInput({ ...projInput, tags: e.target.value })} className="flex-1 px-3 py-2 rounded-md border border-gray-300" />
          </div>
          <input type="url" placeholder="Link" value={projInput.link} onChange={(e) => setProjInput({ ...projInput, link: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" />
          <textarea rows={2} placeholder="Description" value={projInput.desc} onChange={(e) => setProjInput({ ...projInput, desc: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300" required></textarea>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold self-start text-sm">Add Project</button>
        </form>

        <div className="flex flex-col gap-3">
          {githubStatus === 'loading' && <div className="text-center py-2">Loading GitHub Repos...</div>}
          {allProjects.length === 0 && <div className="text-center text-gray-400 py-4">No projects found. Add one manually or link GitHub.</div>}
          
          {allProjects.map((project, idx) => (
            <div key={idx} className={`p-4 rounded-md border ${project.source === 'github' ? 'bg-slate-50 border-slate-300' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-gray-900 text-lg">{project.title}</div>
                      {project.source === 'github' ? (
                          <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full tracking-wider font-bold">GITHUB</span>
                      ) : (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full tracking-wider font-bold">MANUAL</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{project.description}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">View</a>}
                    {project.source === 'manual' && <button onClick={() => dispatch(removeManualProject(project.id))} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>}
                  </div>
                </div>
                {project.tags && <small className="text-gray-500 block mt-2 font-mono text-xs">{project.tags}</small>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;