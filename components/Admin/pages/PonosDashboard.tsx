import React, { useState, useEffect } from 'react';
import { Building2, Plus, ArrowRight, Loader2, X, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { toast } from 'react-hot-toast';
import BorderGlow from '../../BorderGlow';

export const PonosDashboard: React.FC = () => {
  const { setActiveTab, setActiveProjectSlug } = useAdmin();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLogo, setNewProjectLogo] = useState('');
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{slug: string, name: string} | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.error('API returned non-array:', data);
        toast.error(data.error || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const slug = newProjectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setIsCreating(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName.trim(), 
          slug,
          heroTitle: newProjectTitle.trim() || newProjectName.trim(),
          heroDescription: newProjectDescription.trim() || 'Experience unparalleled living.',
          heroImageUrl: newProjectLogo || '/mul.jpeg'
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      toast.success('Project created successfully!');
      setNewProjectName('');
      setNewProjectTitle('');
      setNewProjectDescription('');
      setNewProjectLogo('');
      setShowCreatePopup(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (slug: string) => {
    if (setActiveProjectSlug) {
      setActiveProjectSlug(slug);
    }
    setActiveTab('multan-website'); 
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProjectLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, slug: string, name: string) => {
    e.stopPropagation();
    setProjectToDelete({ slug, name });
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      const res = await fetch(`/api/projects/${projectToDelete.slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setProjectToDelete(null);
    }
  };

  const openEditProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setProjectToEdit(project);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectToEdit({ ...projectToEdit, heroImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit?.name?.trim()) return;

    setIsEditing(true);
    try {
      const res = await fetch(`/api/projects/${projectToEdit.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectToEdit.name.trim(),
          heroTitle: projectToEdit.heroTitle?.trim(),
          heroDescription: projectToEdit.heroDescription?.trim(),
          heroImageUrl: projectToEdit.heroImageUrl,
          order: projectToEdit.order,
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      toast.success('Project updated successfully!');
      setProjectToEdit(null);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4864b]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="brand-banner relative overflow-hidden rounded-[2rem] border border-[#c4864b]/20 bg-[var(--brand-green,#0f281e)] p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(196,134,75,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none">
          <Building2 className="w-full h-full text-white" />
        </div>
        
        <div className="relative z-10 space-y-3 w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c4864b]/20 border border-[#c4864b]/30 text-[#dec099] text-xs font-black uppercase tracking-wider">
            Dashboard
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-white">
            Project Manager
          </h1>
          <p className="text-white/60 text-xs font-semibold">
            Manage your websites and content
          </p>
        </div>

          <button 
            onClick={() => setShowCreatePopup(true)}
            className="flex items-center gap-2 bg-[#c4864b] hover:bg-[#b57a41] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>

      {showCreatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-[#0f281e]/10">
            <button 
              onClick={() => setShowCreatePopup(false)}
              className="absolute top-4 right-4 text-[#0f281e]/40 hover:text-[var(--brand-green,#0f281e)] p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-3xl text-[var(--brand-green,#0f281e)] mb-6 border-b border-[#0f281e]/10 pb-4">New Project</h3>
            
            <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Lahore Smart City"
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Primary Title</label>
                <input 
                  type="text" 
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Experience Luxury Living"
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Short Description</label>
                <textarea 
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe the project..."
                  rows={3}
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors resize-none font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Project Logo / Hero Image</label>
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-[#0f281e]/20 hover:border-[#c4864b] transition-all bg-[#fbf7f0] h-[120px] flex flex-col items-center justify-center text-center cursor-pointer">
                  {newProjectLogo ? (
                    <>
                      <img src={newProjectLogo} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-white/90 backdrop-blur-sm text-[var(--brand-green,#0f281e)] px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Replace
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-[#0f281e]/50 flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 text-[#c4864b] mb-2" />
                      <p className="font-bold text-xs text-[var(--brand-green,#0f281e)]">Click to upload logo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#0f281e]/10">
                <button 
                  type="submit"
                  disabled={isCreating || !newProjectName.trim()}
                  className="w-full bg-[var(--brand-green,#0f281e)] hover:bg-[#c4864b] text-white font-bold py-4 px-6 rounded-xl transition-colors flex justify-center items-center gap-3 disabled:opacity-50 text-sm tracking-widest uppercase shadow-md hover:shadow-xl"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative border border-[#0f281e]/10 text-center">
            <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)] mb-4">Delete Project</h3>
            <p className="text-[#0f281e]/60 text-sm mb-8">
              Are you sure you want to delete the project <strong className="text-[#c4864b]">"{projectToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#0f281e]/10 text-[var(--brand-green,#0f281e)] font-bold hover:bg-[#0f281e]/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-[#0f281e]/10">
            <button 
              onClick={() => setProjectToEdit(null)}
              className="absolute top-4 right-4 text-[#0f281e]/40 hover:text-[var(--brand-green,#0f281e)] p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-3xl text-[var(--brand-green,#0f281e)] mb-6 border-b border-[#0f281e]/10 pb-4">Edit Project</h3>
            
            <form onSubmit={handleUpdateProject} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={projectToEdit.name}
                  onChange={(e) => setProjectToEdit({...projectToEdit, name: e.target.value})}
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Primary Title</label>
                <input 
                  type="text" 
                  value={projectToEdit.heroTitle || ''}
                  onChange={(e) => setProjectToEdit({...projectToEdit, heroTitle: e.target.value})}
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors font-medium"
                  placeholder="e.g. Experience Luxury Living"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Display Order (Lower shows first)</label>
                <input 
                  type="number" 
                  value={projectToEdit.order || 0}
                  onChange={(e) => setProjectToEdit({...projectToEdit, order: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Short Description</label>
                <textarea 
                  value={projectToEdit.heroDescription || ''}
                  onChange={(e) => setProjectToEdit({...projectToEdit, heroDescription: e.target.value})}
                  rows={3}
                  className="w-full bg-[#fbf7f0] text-[var(--brand-green,#0f281e)] border-2 border-[#0f281e]/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#c4864b] transition-colors resize-none font-medium"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Project Logo / Hero Image</label>
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-[#0f281e]/20 hover:border-[#c4864b] transition-all bg-[#fbf7f0] h-[120px] flex flex-col items-center justify-center text-center cursor-pointer">
                  {projectToEdit.heroImageUrl ? (
                    <>
                      <img src={projectToEdit.heroImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-white/90 backdrop-blur-sm text-[var(--brand-green,#0f281e)] px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Replace
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-[#0f281e]/50 flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 text-[#c4864b] mb-2" />
                      <p className="font-bold text-xs text-[var(--brand-green,#0f281e)]">Click to upload logo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleEditImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#0f281e]/10">
                <button 
                  type="submit"
                  disabled={isEditing || !projectToEdit.name?.trim()}
                  className="w-full bg-[var(--brand-green,#0f281e)] hover:bg-[#c4864b] text-white font-bold py-4 px-6 rounded-xl transition-colors flex justify-center items-center gap-3 disabled:opacity-50 text-sm tracking-widest uppercase shadow-md hover:shadow-xl"
                >
                  {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Edit2 className="w-5 h-5" /> Update Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <BorderGlow
            key={project.id}
            backgroundColor="var(--card-background)"
            borderRadius={16}
            glowColor="40 80 80"
            colors={['#c4864b', '#1f945f', '#dec099']}
            className="group cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div 
              onClick={() => handleOpenProject(project.slug)}
              className="p-6 h-full flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#0f281e]/5 text-[#c4864b] text-[10px] font-black uppercase tracking-wider">
                    {project.slug}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditProject(e, project)}
                      className="p-2 text-[#0f281e]/30 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.slug, project.name)}
                      className="p-2 text-[#0f281e]/30 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[var(--brand-green,#0f281e)] font-serif mb-2 leading-tight line-clamp-2">{project.heroTitle || project.name}</h3>
                <p className="text-[#0f281e]/60 text-xs line-clamp-2">{project.heroDescription}</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-[#c4864b] text-sm font-bold group-hover:text-[var(--brand-green,#0f281e)] transition-colors">
                <span>Manage Content</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </BorderGlow>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#0f281e]/40 border-2 border-dashed border-[#0f281e]/10 rounded-2xl">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-[#0f281e]/20" />
            <p className="font-medium">No projects found. Create one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
