import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Image as ImageIcon, Loader2, Plus, Trash2, LayoutTemplate, Settings, Users, Phone, MapPin } from 'lucide-react';

import { useAdmin } from '../AdminContext';

export const ProjectWebsite: React.FC = () => {
  const { activeProjectSlug } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'amenities' | 'media' | 'contact'>('hero');
  
  const [formData, setFormData] = useState<any>({
    heroTitle: '',
    heroDescription: '',
    heroImageUrl: '',
    sectionsData: {
      heroSubTitle: '',
      overviewTitle: '',
      overviewParagraph2: '',
      overviewImage: '',
      amenitiesSubtitle: '',
      amenities: [],
      masterPlansSubtitle: '',
      masterPlans: [],
      gallery: [],
      videos: [],
      partners: [],
      news: [],
      contact: {
        multanOffice: '',
        islamabadOffice: '',
        phones: ['', ''],
        uan: '',
        email: '',
        socials: { facebook: '', twitter: '', googlePlus: '', instagram: '', linkedin: '' }
      }
    }
  });

  useEffect(() => {
    if (activeProjectSlug) {
      fetchContent();
    }
  }, [activeProjectSlug]);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectSlug}`);
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.name || activeProjectSlug,
          heroTitle: data.heroTitle || '',
          heroDescription: data.heroDescription || '',
          heroImageUrl: data.heroImageUrl || '',
          sectionsData: data.sectionsData || {}
        });
      }
    } catch (err) {
      toast.error(`Failed to load ${activeProjectSlug} content`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${activeProjectSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Content updated successfully!');
      } else {
        toast.error('Failed to update content');
      }
    } catch (err) {
      toast.error('Network error while saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, path: string[]) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateField(path, result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to deep update nested state
  const updateField = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const getField = (path: string[]) => {
    let current = formData;
    for (let i = 0; i < path.length; i++) {
      if (current === undefined) return '';
      current = current[path[i]];
    }
    return current;
  };

  const ImageUploader = ({ path, label }: { path: string[], label: string }) => {
    const value = getField(path);
    return (
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">{label}</label>
        <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-[#0f281e]/20 hover:border-[#c4864b] transition-all bg-[#fbf7f0] h-[200px] flex flex-col items-center justify-center text-center cursor-pointer">
          {value ? (
            <>
              <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-white/90 backdrop-blur-sm text-[var(--brand-green,#0f281e)] px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Replace
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-[#0f281e]/50 flex flex-col items-center">
              <ImageIcon className="w-8 h-8 text-[#c4864b] mb-2" />
              <p className="font-semibold text-sm text-[var(--brand-green,#0f281e)]">Drop image</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, path)} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4864b]" />
      </div>
    );
  }

  const sections = formData.sectionsData || {};

  return (
    <div className="space-y-8 font-sans pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#0f281e]/5">
        <div>
          <h2 className="font-serif text-3xl text-[var(--brand-green,#0f281e)] capitalize">{formData.name || activeProjectSlug} Content Manager</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Design and publish dynamic content to the Royal Orchard {formData.name || activeProjectSlug} landing page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[var(--brand-green,#0f281e)] text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-3 hover:bg-[#0f281e]/90 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Publish Changes
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'hero', label: 'Hero & Overview', icon: LayoutTemplate },
          { id: 'amenities', label: 'Amenities & Plans', icon: Settings },
          { id: 'media', label: 'Media & News', icon: ImageIcon },
          { id: 'contact', label: 'Contact Info', icon: Phone }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-[#c4864b] text-white shadow-md' : 'bg-white text-[#0f281e]/60 hover:bg-[#fbf7f0] hover:text-[var(--brand-green,#0f281e)] border border-[#0f281e]/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0f281e]/5 p-8">
        
        {/* HERO & OVERVIEW */}
        {activeTab === 'hero' && (
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)] border-b pb-4 mb-6">Hero Section</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Primary Title (e.g. ROYAL ORCHARD)</label>
                  <input type="text" value={sections.innerHeroTitle !== undefined ? sections.innerHeroTitle : (formData.heroTitle || '')} onChange={(e) => updateField(['sectionsData', 'innerHeroTitle'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Secondary Title (e.g. MULTAN)</label>
                  <input type="text" value={sections.heroSubTitle || ''} onChange={(e) => updateField(['sectionsData', 'heroSubTitle'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none text-black" />
                </div>
              </div>
              <ImageUploader path={['heroImageUrl']} label="Hero Background Media" />
            </div>

            <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)] border-b pb-4 mb-6 mt-12">Overview Section</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Overview Title</label>
                  <input type="text" value={sections.overviewTitle || ''} onChange={(e) => updateField(['sectionsData', 'overviewTitle'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Description Paragraph 1</label>
                  <textarea value={formData.heroDescription} onChange={(e) => updateField(['heroDescription'], e.target.value)} rows={4} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none resize-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Description Paragraph 2</label>
                  <textarea value={sections.overviewParagraph2 || ''} onChange={(e) => updateField(['sectionsData', 'overviewParagraph2'], e.target.value)} rows={4} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none resize-none text-black" />
                </div>
              </div>
              <ImageUploader path={['sectionsData', 'overviewImage']} label="Overview Image" />
            </div>
          </div>
        )}

        {/* AMENITIES & PLANS */}
        {activeTab === 'amenities' && (
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)]">Amenities</h3>
                <button onClick={() => updateField(['sectionsData', 'amenities'], [...(sections.amenities || []), { name: 'New Amenity', icon: 'Home' }])} className="text-[#c4864b] flex items-center gap-1 font-bold text-sm uppercase"><Plus className="w-4 h-4"/> Add Amenity</button>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Amenities Subtitle</label>
                <input type="text" value={sections.amenitiesSubtitle || ''} onChange={(e) => updateField(['sectionsData', 'amenitiesSubtitle'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none text-black" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(sections.amenities || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center bg-[#fbf7f0] p-4 rounded-xl border border-[#0f281e]/5">
                    <input type="text" value={item.name} onChange={(e) => { const newArr = [...sections.amenities]; newArr[i].name = e.target.value; updateField(['sectionsData', 'amenities'], newArr); }} className="flex-1 bg-transparent font-medium outline-none text-black" placeholder="Amenity Name"/>
                    <input type="text" value={item.icon} onChange={(e) => { const newArr = [...sections.amenities]; newArr[i].icon = e.target.value; updateField(['sectionsData', 'amenities'], newArr); }} className="w-24 bg-white px-2 py-1 rounded text-sm outline-none text-black" placeholder="Icon Name"/>
                    <button onClick={() => { const newArr = [...sections.amenities]; newArr.splice(i, 1); updateField(['sectionsData', 'amenities'], newArr); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)]">Plans</h3>
                <button onClick={() => updateField(['sectionsData', 'masterPlans'], [...(sections.masterPlans || []), { title: 'New Plan', images: [{ image: '' }] }])} className="text-[#c4864b] flex items-center gap-1 font-bold text-sm uppercase"><Plus className="w-4 h-4"/> Add Plan</button>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Plans Subtitle</label>
                <input type="text" value={sections.masterPlansSubtitle || ''} onChange={(e) => updateField(['sectionsData', 'masterPlansSubtitle'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-base font-medium outline-none text-black" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(sections.masterPlans || []).map((item: any, i: number) => {
                  // Normalize data structure for older data
                  const images = item.images ? item.images : (item.image ? [{ image: item.image }] : []);
                  return (
                    <div key={i} className="bg-[#fbf7f0] p-6 rounded-xl border border-[#0f281e]/5 space-y-4 relative">
                      <button onClick={() => { const newArr = [...sections.masterPlans]; newArr.splice(i, 1); updateField(['sectionsData', 'masterPlans'], newArr); }} className="absolute top-4 right-4 z-10 text-red-500 bg-white p-2 rounded-full shadow hover:text-red-700 transition-colors"><Trash2 className="w-5 h-5"/></button>
                      <input type="text" value={item.title} onChange={(e) => { const newArr = [...sections.masterPlans]; newArr[i].title = e.target.value; updateField(['sectionsData', 'masterPlans'], newArr); }} className="w-full max-w-md bg-white rounded-lg px-4 py-3 font-bold outline-none text-black border border-[#0f281e]/10 focus:border-[#c4864b] transition-colors" placeholder="Plan Title (e.g. Block A & B)"/>
                      
                      <div className="mt-6 pt-4 border-t border-[#0f281e]/10">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60">Plan Images</label>
                          <button onClick={() => {
                            const newArr = [...sections.masterPlans];
                            if (!newArr[i].images && newArr[i].image) {
                               newArr[i].images = [{ image: newArr[i].image }];
                               delete newArr[i].image;
                            } else if (!newArr[i].images) {
                               newArr[i].images = [];
                            }
                            newArr[i].images.push({ image: '' });
                            updateField(['sectionsData', 'masterPlans'], newArr);
                          }} className="text-[#c4864b] flex items-center gap-1 font-bold text-xs uppercase bg-white px-3 py-1.5 rounded shadow-sm hover:shadow transition-shadow"><Plus className="w-3 h-3"/> Add Image</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {images.map((imgItem: any, j: number) => {
                            // Determine the path based on whether it's using old 'image' or new 'images' array.
                            // If we click add image, we will migrate it to 'images' array.
                            const pathBase = item.images ? ['sectionsData', 'masterPlans', i.toString(), 'images', j.toString(), 'image'] : ['sectionsData', 'masterPlans', i.toString(), 'image'];
                            return (
                              <div key={j} className="relative group">
                                <button onClick={() => { 
                                  const newArr = [...sections.masterPlans]; 
                                  if (newArr[i].images) {
                                    newArr[i].images.splice(j, 1); 
                                  } else {
                                    newArr[i].image = '';
                                  }
                                  updateField(['sectionsData', 'masterPlans'], newArr); 
                                }} className="absolute -top-2 -right-2 z-10 text-red-500 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                <ImageUploader path={pathBase} label="" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA & NEWS */}
        {activeTab === 'media' && (
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)]">Gallery</h3>
                <button onClick={() => updateField(['sectionsData', 'gallery'], [...(sections.gallery || []), { title: 'New Category', images: [{ image: '' }] }])} className="text-[#c4864b] flex items-center gap-1 font-bold text-sm uppercase"><Plus className="w-4 h-4"/> Add Category</button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(sections.gallery || []).map((item: any, i: number) => {
                  const images = item.images ? item.images : (item.image ? [{ image: item.image }] : []);
                  return (
                    <div key={i} className="bg-[#fbf7f0] p-6 rounded-xl border border-[#0f281e]/5 space-y-4 relative">
                      <button onClick={() => { const newArr = [...sections.gallery]; newArr.splice(i, 1); updateField(['sectionsData', 'gallery'], newArr); }} className="absolute top-4 right-4 z-10 text-red-500 bg-white p-2 rounded-full shadow hover:text-red-700 transition-colors"><Trash2 className="w-5 h-5"/></button>
                      <input type="text" value={item.title === undefined ? 'General' : item.title} onChange={(e) => { const newArr = [...sections.gallery]; newArr[i].title = e.target.value; updateField(['sectionsData', 'gallery'], newArr); }} className="w-full max-w-md bg-white rounded-lg px-4 py-3 font-bold outline-none text-black border border-[#0f281e]/10 focus:border-[#c4864b] transition-colors" placeholder="Category Title (e.g. Infrastructure)"/>
                      
                      <div className="mt-6 pt-4 border-t border-[#0f281e]/10">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60">Category Images</label>
                          <button onClick={() => {
                            const newArr = [...sections.gallery];
                            if (!newArr[i].images && newArr[i].image) {
                               newArr[i].images = [{ image: newArr[i].image }];
                               delete newArr[i].image;
                            } else if (!newArr[i].images) {
                               newArr[i].images = [];
                            }
                            newArr[i].images.push({ image: '' });
                            updateField(['sectionsData', 'gallery'], newArr);
                          }} className="text-[#c4864b] flex items-center gap-1 font-bold text-xs uppercase bg-white px-3 py-1.5 rounded shadow-sm hover:shadow transition-shadow"><Plus className="w-3 h-3"/> Add Image</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {images.map((imgItem: any, j: number) => {
                            const pathBase = item.images ? ['sectionsData', 'gallery', i.toString(), 'images', j.toString(), 'image'] : ['sectionsData', 'gallery', i.toString(), 'image'];
                            return (
                              <div key={j} className="relative group">
                                <button onClick={() => { 
                                  const newArr = [...sections.gallery]; 
                                  if (newArr[i].images) {
                                    newArr[i].images.splice(j, 1); 
                                  } else {
                                    newArr[i].image = '';
                                  }
                                  updateField(['sectionsData', 'gallery'], newArr); 
                                }} className="absolute -top-2 -right-2 z-10 text-red-500 bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                <ImageUploader path={pathBase} label="" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)]">News & Events</h3>
                <button onClick={() => updateField(['sectionsData', 'news'], [...(sections.news || []), { date: 'New Date', title: 'New Event' }])} className="text-[#c4864b] flex items-center gap-1 font-bold text-sm uppercase"><Plus className="w-4 h-4"/> Add News</button>
              </div>
              <div className="space-y-4">
                {(sections.news || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center bg-[#fbf7f0] p-4 rounded-xl border border-[#0f281e]/5">
                    <input type="text" value={item.date} onChange={(e) => { const newArr = [...sections.news]; newArr[i].date = e.target.value; updateField(['sectionsData', 'news'], newArr); }} className="w-32 bg-white rounded-lg px-4 py-2 font-bold outline-none text-sm text-[#c4864b]" placeholder="Date"/>
                    <input type="text" value={item.title} onChange={(e) => { const newArr = [...sections.news]; newArr[i].title = e.target.value; updateField(['sectionsData', 'news'], newArr); }} className="flex-1 bg-white rounded-lg px-4 py-2 font-medium outline-none text-black" placeholder="News Title"/>
                    <button onClick={() => { const newArr = [...sections.news]; newArr.splice(i, 1); updateField(['sectionsData', 'news'], newArr); }} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)]">Partners</h3>
                <button onClick={() => updateField(['sectionsData', 'partners'], [...(sections.partners || []), { name: 'Partner Name', image: '' }])} className="text-[#c4864b] flex items-center gap-1 font-bold text-sm uppercase"><Plus className="w-4 h-4"/> Add Partner</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(sections.partners || []).map((item: any, i: number) => (
                  <div key={i} className="bg-[#fbf7f0] p-4 rounded-xl border border-[#0f281e]/5 space-y-4 relative">
                    <button onClick={() => { const newArr = [...sections.partners]; newArr.splice(i, 1); updateField(['sectionsData', 'partners'], newArr); }} className="absolute -top-3 -right-3 z-10 text-red-500 bg-white p-2 rounded-full shadow-lg"><Trash2 className="w-4 h-4"/></button>
                    <input type="text" value={item.name} onChange={(e) => { const newArr = [...sections.partners]; newArr[i].name = e.target.value; updateField(['sectionsData', 'partners'], newArr); }} className="w-full bg-white rounded-lg px-4 py-2 font-bold outline-none text-center text-black" placeholder="Partner Name"/>
                    <ImageUploader path={['sectionsData', 'partners', i.toString(), 'image']} label="" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <h3 className="font-serif text-2xl text-[var(--brand-green,#0f281e)] border-b pb-4 mb-6">Contact & Locations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Multan Office Address</label>
                  <textarea value={sections.contact?.multanOffice || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'multanOffice'], e.target.value)} rows={3} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none resize-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Islamabad Office Address</label>
                  <textarea value={sections.contact?.islamabadOffice || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'islamabadOffice'], e.target.value)} rows={3} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none resize-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">General Email</label>
                  <input type="text" value={sections.contact?.email || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'email'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none text-black" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Primary Phones (Comma Separated)</label>
                  <input type="text" value={(sections.contact?.phones || []).join(', ')} onChange={(e) => updateField(['sectionsData', 'contact', 'phones'], e.target.value.split(',').map(s=>s.trim()))} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">UAN</label>
                  <input type="text" value={sections.contact?.uan || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'uan'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none text-[#c4864b]" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Facebook URL</label>
                  <input type="text" value={sections.contact?.socials?.facebook || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'socials', 'facebook'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none text-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0f281e]/60 mb-2">Instagram URL</label>
                  <input type="text" value={sections.contact?.socials?.instagram || ''} onChange={(e) => updateField(['sectionsData', 'contact', 'socials', 'instagram'], e.target.value)} className="w-full bg-[#fbf7f0] rounded-xl px-5 py-4 text-sm font-medium outline-none text-black" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
