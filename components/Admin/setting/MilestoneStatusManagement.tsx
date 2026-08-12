import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  Plus, Settings, Trash2, X, Lock, ChevronUp, ChevronDown, GripVertical
} from 'lucide-react';
import { milestoneStatusService, MilestoneStatusPayload } from '../utils/services/milestoneStatusService';

export const MilestoneStatusManagement: React.FC = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [tempList, setTempList] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...tempList];
    const item = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, item);
    
    setDraggedIndex(index);
    setTempList(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      for (let i = 0; i < tempList.length; i++) {
        const item = tempList[i];
        const newSortOrder = i + 1;
        if (Number(item.sort_order) !== newSortOrder) {
          await milestoneStatusService.updateMilestoneStatus(item.id, {
            code: item.code,
            label: item.label,
            sort_order: newSortOrder
          });
        }
      }
      toast.success('Arrangement saved successfully.');
      setIsReorderOpen(false);
      fetchStatuses();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save arrangement.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const res = await milestoneStatusService.getMilestoneStatuses();
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
        setStatuses(sorted);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch statuses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatus) return;
    setIsSubmitLoading(true);
    setValidationErrors({});

    const payload: MilestoneStatusPayload = {
      code: editingStatus.code || '',
      label: editingStatus.label || '',
      sort_order: Number(editingStatus.sort_order) || 0
    };

    try {
      let res;
      if (editingStatus.id) {
        res = await milestoneStatusService.updateMilestoneStatus(editingStatus.id, payload);
      } else {
        res = await milestoneStatusService.createMilestoneStatus(payload);
      }

      if (res.success) {
        toast.success(res.message || 'Milestone status saved successfully.');
        setEditingStatus(null);
        fetchStatuses();
      } else {
        if (res.errors) {
          setValidationErrors(res.errors);
        }
        throw new Error(res.message || 'Failed to save milestone status.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number | string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete "${label}"?`)) return;

    try {
      const res = await milestoneStatusService.deleteMilestoneStatus(id);
      if (res.success) {
        toast.success(res.message || 'Milestone status deleted successfully.');
        fetchStatuses();
      } else {
        toast.error(res.message || 'Failed to delete status.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete status.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= statuses.length) return;

    const newStatuses = [...statuses];
    
    const tempOrder = newStatuses[index].sort_order;
    newStatuses[index].sort_order = newStatuses[targetIndex].sort_order;
    newStatuses[targetIndex].sort_order = tempOrder;

    const tempItem = newStatuses[index];
    newStatuses[index] = newStatuses[targetIndex];
    newStatuses[targetIndex] = tempItem;
    setStatuses(newStatuses);

    try {
      await milestoneStatusService.updateMilestoneStatus(newStatuses[index].id, {
        code: newStatuses[index].code,
        label: newStatuses[index].label,
        sort_order: Number(newStatuses[index].sort_order)
      });
      await milestoneStatusService.updateMilestoneStatus(newStatuses[targetIndex].id, {
        code: newStatuses[targetIndex].code,
        label: newStatuses[targetIndex].label,
        sort_order: Number(newStatuses[targetIndex].sort_order)
      });
      fetchStatuses();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update sort order.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-2xl text-[#0f281e]">Milestone Status Options</h3>
          <p className="text-[#0f281e]/60 text-xs mt-1">Configure milestone statuses managing task deliverables and payment checkpoints.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTempList([...statuses]);
              setIsReorderOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#0f281e]/15 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0f281e] hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
          >
            <GripVertical className="h-4 w-4 text-[#c4864b]" />
            Rearrange
          </button>
          <button
            onClick={() => {
              setValidationErrors({});
              setEditingStatus({
                code: '',
                label: '',
                sort_order: statuses.length ? Math.max(...statuses.map(s => Number(s.sort_order))) + 1 : 1
              });
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c4864b] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b57a44] transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        </div>
      </div>

      {isLoading && statuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-[#0f281e]/5">
          <div className="h-8 w-8 rounded-full border-4 border-[#c4864b] border-t-transparent animate-spin" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#0f281e]/60">Loading options...</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#0f281e]/5 rounded-[2rem] overflow-hidden">
          <div className="p-5 border-b border-[#0f281e]/5 bg-[#fbf7f0] grid grid-cols-12 text-[10px] font-bold text-[#0f281e]/40 uppercase tracking-widest">
            <div className="col-span-2 text-center">Sort</div>
            <div className="col-span-3">Label</div>
            <div className="col-span-3">Code</div>
            <div className="col-span-2">System</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-[#0f281e]/5">
            <AnimatePresence initial={false}>
              {statuses.map((s, idx) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="p-5 grid grid-cols-12 items-center hover:bg-[#fbf7f0]/40 transition-colors"
                >
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-[#0f281e]/30 hover:text-[#c4864b] disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-semibold text-[#0f281e]/50 min-w-[20px] text-center">
                      {s.sort_order}
                    </span>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === statuses.length - 1}
                      className="p-1 rounded-md text-[#0f281e]/30 hover:text-[#c4864b] disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="col-span-3 font-bold text-[#0f281e]">
                    {s.label}
                  </div>

                  <div className="col-span-3 text-xs font-mono text-[#0f281e]/60">
                    {s.code}
                  </div>

                  <div className="col-span-2">
                    {s.is_system ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0f281e]/5 border border-[#0f281e]/10 px-2 py-0.5 text-[9px] font-bold text-[#0f281e]/60 uppercase">
                        <Lock className="w-2.5 h-2.5" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[9px] font-bold text-gray-400 uppercase">
                        No
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setValidationErrors({});
                        setEditingStatus(s);
                      }}
                      className="p-2 text-[#0f281e]/40 hover:text-[#c4864b] transition-colors cursor-pointer"
                      title="Edit Option"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.label)}
                      disabled={!!s.is_system}
                      className={`p-2 transition-colors ${s.is_system ? 'text-gray-200 cursor-not-allowed' : 'text-[#0f281e]/40 hover:text-red-500 cursor-pointer'}`}
                      title={s.is_system ? "System locked" : "Delete Option"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingStatus && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm bg-black/55">
            <button
              type="button"
              onClick={() => setEditingStatus(null)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
            >
              <div className="relative overflow-hidden bg-[#0f281e] px-6 py-6 text-white">
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">
                      {editingStatus.id ? 'Edit Milestone Status' : 'Create Milestone Status'}
                    </h3>
                    <p className="mt-1 text-xs text-white/45">
                      Configure code identifier, descriptive label and sorting priority.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingStatus(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4 p-6 sm:p-8">
                <div>
                  <label htmlFor="label" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Descriptive Label</label>
                  <input
                    id="label"
                    type="text"
                    required
                    value={editingStatus.label}
                    onChange={e => setEditingStatus({ ...editingStatus, label: e.target.value })}
                    placeholder="e.g. In Progress"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.label && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.label[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="code" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Code Identifier</label>
                  <input
                    id="code"
                    type="text"
                    required
                    value={editingStatus.code}
                    onChange={e => setEditingStatus({ ...editingStatus, code: e.target.value })}
                    placeholder="e.g. in_progress"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.code && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.code[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="sort_order" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Sort Order</label>
                  <input
                    id="sort_order"
                    type="number"
                    required
                    value={editingStatus.sort_order}
                    onChange={e => setEditingStatus({ ...editingStatus, sort_order: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                  {validationErrors.sort_order && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{validationErrors.sort_order[0]}</p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setEditingStatus(null)}
                    className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitLoading ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REORDER MODAL */}
      <AnimatePresence>
        {isReorderOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 backdrop-blur-sm bg-black/55">
            <button
              type="button"
              onClick={() => setIsReorderOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
            >
              <div className="relative overflow-hidden bg-[#0f281e] px-6 py-6 text-white">
                <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">Rearrange Arrangement</h3>
                    <p className="mt-1 text-xs text-white/45">
                      Drag and drop options to reorder their visual priority sorting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReorderOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4 max-h-[50vh] overflow-y-auto bg-[#fbf7f0]/30 select-none">
                <div className="space-y-2">
                  {tempList.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border bg-white shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                        draggedIndex === index 
                          ? 'opacity-40 border-dashed border-[#c4864b] bg-gray-50 scale-[0.98]' 
                          : 'border-[#0f281e]/5 hover:border-[#c4864b]/30'
                      }`}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f281e]/5 text-[#0f281e]/30">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0f281e]">{item.label}</p>
                        <p className="text-[10px] text-[#0f281e]/40 font-mono">Code: {item.code}</p>
                      </div>
                      <div className="rounded bg-[#dec099]/20 px-2 py-1 text-[9px] font-mono font-black text-[#c4864b]">
                        Sort: {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 p-6 sm:p-8 sm:flex-row bg-white">
                <button
                  type="button"
                  onClick={() => setIsReorderOpen(false)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOrder}
                  disabled={isSavingOrder}
                  className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSavingOrder ? 'Saving...' : 'Save Arrangement'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
