import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Cloud, Clock4, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';

export const WebsiteTab: React.FC = () => {
  const {
    carouselImages,
    fetchCarouselImages
  } = useAdmin();

  const [isUploadingCarousel, setIsUploadingCarousel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingCarousel, setDeletingCarousel] = useState<string | null>(null);

  const handleUploadCarouselImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingCarousel(true);
    setUploadProgress(0);

    const files = Array.from(e.target.files) as File[];
    const total = files.length;
    let uploaded = 0;

    for (const file of files) {
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (event) => resolve(event.target?.result as string);
      });
      reader.readAsDataURL(file);
      const base64 = await promise;

      try {
        await fetch('/api/carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [{ name: file.name, data: base64 }] })
        });
        uploaded++;
        setUploadProgress(Math.round((uploaded / total) * 100));
        fetchCarouselImages();
      } catch (err) {
        console.error('Error uploading', file.name);
      }
    }

    toast.success('Upload complete');
    setIsUploadingCarousel(false);
    setUploadProgress(0);
  };

  const confirmDeleteCarousel = async () => {
    if (!deletingCarousel) return;
    try {
      const res = await fetch(`/api/carousel/${deletingCarousel}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Image deleted');
        fetchCarouselImages();
        setDeletingCarousel(null);
      } else {
        toast.error('Failed to delete image');
      }
    } catch (err) {
      toast.error('Error deleting image');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-3xl text-[#0f281e]">Website Management</h2>
        </div>
        <p className="text-[#0f281e]/60">Manage your website's dynamic content, such as the home page carousel images.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#0f281e]/5 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-2xl text-[#0f281e]">Carousel Images</h3>
          <div>
            <label className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-md flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              <span>Upload Images</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUploadCarouselImages} disabled={isUploadingCarousel} />
            </label>
          </div>
        </div>

        {isUploadingCarousel && (
          <div className="bg-[#0f281e]/5 rounded-xl p-4 flex items-center gap-4">
            <div className="animate-spin text-[#c4864b]">
              <Clock4 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1 text-[#0f281e]/70">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-[#c4864b] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {carouselImages.map((img, idx) => (
            <div key={idx} className="relative group aspect-video bg-gray-100 rounded-xl overflow-hidden border border-black/5 shadow-sm">
              <img src={img} alt={`Carousel ${idx}`} className="w-full h-full object-cover" />
              <button
                onClick={() => setDeletingCarousel(img.split('/').pop() || null)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {carouselImages.length === 0 && !isUploadingCarousel && (
            <div className="col-span-full py-12 text-center text-[#0f281e]/40 border-2 border-dashed border-[#0f281e]/10 rounded-xl">
              No images found. Upload some images to display on the home page carousel.
            </div>
          )}
        </div>
      </div>

      {deletingCarousel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border-t-4 border-red-500">
            <h3 className="font-serif text-2xl text-[#0f281e] mb-4">Delete Image</h3>
            <p className="text-sm text-[#0f281e]/60 mb-6">Are you sure you want to delete this carousel image?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingCarousel(null)}
                className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCarousel}
                className="flex-1 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
