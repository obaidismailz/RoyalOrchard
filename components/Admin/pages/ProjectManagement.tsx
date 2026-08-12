import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderGit2, FileSignature, HelpCircle, AlertCircle, FilePlus2,
  Send, CheckCircle2, XCircle, Clock, Plus, ChevronRight, MessageSquare, History, Key,
  Building2, MapPin, CalendarDays, HardHat, Coins, Edit3, UserMinus, Trash2, UserPlus,
  Flag, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { projectManagementService } from '../utils/services/projectManagementService';
import { userService } from '../utils/services/userService';
import { milestoneService } from '../utils/services/milestoneService';
import { getSecureImageUrl } from '../../../utils/imageUrl';

interface Project {
  id: string;
  name: string;
  location: string;
  generalContractor: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed';
}

interface RFI {
  id: string;
  title: string;
  assignedTo: string;
  status: 'Open' | 'Answered' | 'Closed';
  dateCreated: string;
  dueDate: string;
  question: string;
  answer?: string;
}

interface Submittal {
  id: string;
  title: string;
  specSection: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revision Required';
  dateSubmitted: string;
  contractor: string;
  file?: string;
}

interface COVersion {
  version: number;
  date: string;
  costImpact: number;
  timeImpactDays: number;
  comments: string;
  author: string;
}

interface ChangeOrder {
  id: string;
  title: string;
  costImpact: number;
  timeImpactDays: number;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Required';
  description: string;
  version: number;
  history: COVersion[];
  gcSignature?: {
    signer: string;
    timestamp: string;
    location: string;
    verificationType: 'PIN' | 'Stylus' | 'Password';
    documentHash: string;
  };
  pricingApproval?: {
    approvedBy: string;
    timestamp: string;
    verified: boolean;
  };
}

interface FieldIssue {
  id: string;
  title: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Resolved';
  reportedBy: string;
  description: string;
}

interface DailyFieldLog {
  id: string;
  project: string;
  date: string;
  foreman: string;
  workCompleted: string;
  photos: string[];
  reviewedByPM: boolean;
}

export const ProjectManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'rfi' | 'submittals' | 'changeorders' | 'issues' | 'daily-logs' | 'milestones'>('projects');

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Milestones states
  const [milestonesList, setMilestonesList] = useState<any[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [selectedProjectForMilestones, setSelectedProjectForMilestones] = useState<any>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneToDelete, setMilestoneToDelete] = useState<number | string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    code: '',
    name: '',
    description: '',
    phase_id: '1',
    status_id: '1',
    sequence: '1',
    planned_date: '',
    actual_date: '',
    predecessor_id: '',
    responsible_user_id: '',
    responsible_party_label: '',
    deliverable: '',
    is_payment_milestone: false,
    payment_amount: ''
  });
  const [milestoneValidationErrors, setMilestoneValidationErrors] = useState<any>({});

  // Project details & actions popup states
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<any>(null);
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<any[]>([]);

  const fetchTypesAndStatuses = async () => {
    try {
      const [typesRes, statusesRes, staffRes] = await Promise.all([
        projectManagementService.getProjectTypes(),
        projectManagementService.getProjectStatuses(),
        userService.getUsers(1).catch(() => null)
      ]);
      if (typesRes.success && Array.isArray(typesRes.data)) {
        setProjectTypes(typesRes.data);
      }
      if (statusesRes.success && Array.isArray(statusesRes.data)) {
        setProjectStatuses(statusesRes.data);
      }
      if (staffRes && staffRes.success && staffRes.data) {
        setAllStaffList(staffRes.data.items || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch project types/statuses:', err);
    }
  };

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [allStaffList, setAllStaffList] = useState<any[]>([]);
  const [selectedUserToAssign, setSelectedUserToAssign] = useState<string>('');
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [userToRemove, setUserToRemove] = useState<any | null>(null);
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const [sidecarMode, setSidecarMode] = useState<'assign' | 'view' | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    code: '',
    name: '',
    clientId: '',
    projectTypeId: '',
    projectStatusId: '',
    siteAddress: '',
    budget: '',
    startDate: '',
    endDate: ''
  });

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await projectManagementService.getProjects(page);
      if (data.success && data.data) {
        setProjects(data.data.items || []);
        if (data.data.pagination) {
          setCurrentPage(data.data.pagination.current_page || 1);
          setTotalPages(data.data.pagination.last_page || 1);
          setTotalItems(data.data.pagination.total || 0);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || 'Failed to load projects from the server.');
      toast.error(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === 'projects') {
      fetchProjects(currentPage);
      fetchTypesAndStatuses();
    }
  }, [activeSubTab, currentPage]);

  React.useEffect(() => {
    if (allStaffList.length > 0) {
      setProjectForm(prev => ({
        ...prev,
        clientId: prev.clientId && allStaffList.some(u => String(u.id) === prev.clientId) ? prev.clientId : String(allStaffList[0].id)
      }));
    }
  }, [allStaffList]);

  React.useEffect(() => {
    if (projectTypes.length > 0) {
      setProjectForm(prev => ({
        ...prev,
        projectTypeId: prev.projectTypeId && projectTypes.some(t => String(t.id) === prev.projectTypeId) ? prev.projectTypeId : String(projectTypes[0].id)
      }));
    }
  }, [projectTypes]);

  React.useEffect(() => {
    if (projectStatuses.length > 0) {
      setProjectForm(prev => ({
        ...prev,
        projectStatusId: prev.projectStatusId && projectStatuses.some(s => String(s.id) === prev.projectStatusId) ? prev.projectStatusId : String(projectStatuses[0].id)
      }));
    }
  }, [projectStatuses]);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    code: '',
    name: '',
    clientId: '',
    projectTypeId: '',
    projectStatusId: '',
    siteAddress: '',
    budget: '',
    startDate: '',
    endDate: ''
  });

  // RFIs state
  const [rfis, setRfis] = useState<RFI[]>([
    {
      id: "RFI-001",
      title: "Clubhouse Ballroom joist sizing discrepancy",
      assignedTo: "Hassan Mahmood (GC rep)",
      status: "Open",
      dateCreated: "2026-06-20",
      dueDate: "2026-06-27",
      question: "The structural drawings show 2x10 joists at 12 inch spacing, but architectural shows 2x8. Please clarify which sizing to procure."
    },
    {
      id: "RFI-002",
      title: "East wing drainage outlet alignment",
      assignedTo: "Sarah Jenkins (Senior Architect)",
      status: "Answered",
      dateCreated: "2026-06-15",
      dueDate: "2026-06-22",
      question: "Is the final drainage pipe outlet expected to dump into the lake directly or filter through the sand trap basin?",
      answer: "Direct connection to the main lake drainage basin. Silt fence is required during construction."
    }
  ]);

  // Submittals state
  const [submittals, setSubmittals] = useState<Submittal[]>([
    {
      id: "SUB-101",
      title: "Premium Latex Primer Specs",
      specSection: "09 90 00 - Painting",
      status: "Approved",
      dateSubmitted: "2026-06-18",
      contractor: "Cascade Painting Partners",
      file: "Sherwin_Williams_Primer_Specs.pdf"
    },
    {
      id: "SUB-102",
      title: "Porcelain Hexagonal Tile Samples",
      specSection: "09 30 00 - Tiling",
      status: "Pending",
      dateSubmitted: "2026-06-24",
      contractor: "Apex Flooring Inc"
    }
  ]);

  // Change Orders state with Version History (Workflow 3 & Handling Special Scenarios A)
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([
    {
      id: "CO-001",
      title: "Ballroom framing revision (add structural support column)",
      costImpact: 4250.00,
      timeImpactDays: 3,
      status: "Pending Review",
      description: "Additional double 2x10 structural post configuration required due to floor load revision requested by clubhouse staff.",
      version: 1,
      history: [
        { version: 1, date: "2026-06-22", costImpact: 4250.00, timeImpactDays: 3, comments: "Initial draft submitted by PM.", author: "Hassan Mahmood" }
      ]
    },
    {
      id: "CO-002",
      title: "West boundary grading extensions",
      costImpact: 2100.00,
      timeImpactDays: 1,
      status: "Approved",
      description: "Extend boundary by 12 feet to fit revised sprinkler radius. Includes grading, premium seed, and soil amendments.",
      version: 2,
      history: [
        { version: 2, date: "2026-06-19", costImpact: 2100.00, timeImpactDays: 1, comments: "Adjusted seed specification as requested by greenkeeper.", author: "Hassan Mahmood" },
        { version: 1, date: "2026-06-15", costImpact: 2600.00, timeImpactDays: 2, comments: "Original proposal including grading and irrigation extensions.", author: "Hassan Mahmood" }
      ],
      gcSignature: {
        signer: "David Miller (GC board)",
        timestamp: "2026-06-20 14:32:00",
        location: "Capital Hills Clubhouse Main Office",
        verificationType: "PIN",
        documentHash: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      pricingApproval: {
        approvedBy: "Ponos Admin Pricing Office",
        timestamp: "2026-06-21 09:15:00",
        verified: true
      }
    }
  ]);

  // Daily field logs state (Workflow 4)
  const [dailyLogs, setDailyLogs] = useState<DailyFieldLog[]>([
    {
      id: "LOG-301",
      project: "102 Oak Ridge Court (Backyard Reno)",
      date: "2026-06-24",
      foreman: "Foreman John",
      workCompleted: "Erected wall frame structures on concrete pad. Verified plumbing sleeve layouts.",
      photos: ["framing_north_view.jpg", "sleeve_layout.jpg"],
      reviewedByPM: false
    },
    {
      id: "LOG-300",
      project: "Main Clubhouse Ballroom Remodel",
      date: "2026-06-23",
      foreman: "Foreman John",
      workCompleted: "Demolished old central fireplace backing brick structure. Cleaned debris.",
      photos: ["fireplace_demolition.jpg"],
      reviewedByPM: true
    }
  ]);

  // Field Issues state
  const [issues, setIssues] = useState<FieldIssue[]>([
    {
      id: "ISS-001",
      title: "Clubhouse ballroom mold on drywall backing",
      location: "East wall behind ballroom fireplace",
      severity: "High",
      status: "Open",
      reportedBy: "Foreman John",
      description: "Moisture detected behind old plaster, drywall cannot be installed until wall cavity is treated and source of water leak sealed."
    }
  ]);

  // RFI Modal/Creation
  const [showRfiModal, setShowRfiModal] = useState(false);
  const [rfiTitle, setRfiTitle] = useState('');
  const [rfiAssignedTo, setRfiAssignedTo] = useState('Hassan Mahmood (GC rep)');
  const [rfiQuestion, setRfiQuestion] = useState('');

  // CO version comments input state
  const [coReviewComments, setCoReviewComments] = useState<Record<string, string>>({});
  const [selectedCoHistory, setSelectedCoHistory] = useState<string | null>(null);

  const submitRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiTitle || !rfiQuestion) {
      toast.error("Please fill in RFI title and question.");
      return;
    }
    const newRfi: RFI = {
      id: `RFI-${Math.floor(100 + Math.random() * 900)}`,
      title: rfiTitle,
      assignedTo: rfiAssignedTo,
      status: 'Open',
      dateCreated: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      question: rfiQuestion
    };
    setRfis([newRfi, ...rfis]);
    toast.success("RFI created and notification sent!");
    setShowRfiModal(false);
    setRfiTitle('');
    setRfiQuestion('');
  };

  const handleRfiAnswer = (id: string, answerText: string) => {
    setRfis(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Answered', answer: answerText };
      }
      return r;
    }));
    toast.success("Answer logged for RFI.");
  };

  const handleCoDecision = (id: string, status: 'Approved' | 'Rejected') => {
    setChangeOrders(prev => prev.map(co => {
      if (co.id === id) {
        return {
          ...co,
          status,
          gcSignature: status === 'Approved' ? {
            signer: "GC Board Representative",
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            location: "Site Office Desk",
            verificationType: "Password",
            documentHash: `sha256-mod-${Math.floor(10000 + Math.random() * 90000)}`
          } : undefined,
          pricingApproval: status === 'Approved' ? {
            approvedBy: "Ponos Admin Pricing Office",
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            verified: true
          } : undefined
        };
      }
      return co;
    }));
    toast.success(`Change Order ${id} has been ${status}. Budget and scope records updated!`);
  };

  // Back-and-forth cycle revision submit (Special Scenario A)
  const handleCoReturnForRevision = (id: string) => {
    const comments = coReviewComments[id];
    if (!comments) {
      toast.error("Please add revision request comments first");
      return;
    }

    setChangeOrders(prev => prev.map(co => {
      if (co.id === id) {
        const nextVersion = co.version + 1;
        const newHist: COVersion = {
          version: nextVersion,
          date: new Date().toISOString().split('T')[0],
          costImpact: co.costImpact,
          timeImpactDays: co.timeImpactDays,
          comments: comments,
          author: "Reviewing PM / Architect"
        };
        return {
          ...co,
          version: nextVersion,
          status: 'Revision Required',
          history: [newHist, ...co.history]
        };
      }
      return co;
    }));

    toast.success(`Change Order returned for revision. Version incremented to v${changeOrders.find(co => co.id === id)!.version + 1}`);
    setCoReviewComments(prev => ({ ...prev, [id]: '' }));
  };

  const handleApproveDailyLog = (id: string) => {
    setDailyLogs(prev => prev.map(log => log.id === id ? { ...log, reviewedByPM: true } : log));
    toast.success(`Daily log status updated. Appended to project history.`);
  };

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (projectForm.endDate < projectForm.startDate) {
      toast.error('Project end date must be after the start date.');
      return;
    }

    const formatDateToDMY = (dateStr: string) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${parseInt(day, 10)}-${parseInt(month, 10)}-${year}`;
    };

    try {
      const payload = {
        code: projectForm.code || `CP-${Math.floor(100 + Math.random() * 900)}`,
        name: projectForm.name,
        client_id: Number(projectForm.clientId) || (allStaffList[0]?.id ? Number(allStaffList[0].id) : 2),
        project_type_id: Number(projectForm.projectTypeId) || (projectTypes[0]?.id ? Number(projectTypes[0].id) : 2),
        project_status_id: Number(projectForm.projectStatusId) || (projectStatuses[0]?.id ? Number(projectStatuses[0].id) : 1),
        site_address: projectForm.siteAddress || 'Capital Smart City',
        budget: Number(projectForm.budget) || 755000,
        start_date: formatDateToDMY(projectForm.startDate),
        end_date: formatDateToDMY(projectForm.endDate)
      };

      const resData = await projectManagementService.createProject(payload);

      if (resData.success) {
        toast.success(resData.message || 'Project created successfully.');
        setShowProjectModal(false);
        setProjectForm({
          code: '',
          name: '',
          clientId: '',
          projectTypeId: '',
          projectStatusId: '',
          siteAddress: '',
          budget: '',
          startDate: '',
          endDate: ''
        });
        fetchProjects(1);
      } else {
        toast.error(resData.message || 'Failed to create project.');
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
      toast.error(err.message || 'Network error. Failed to create project.');
    }
  };

  const handleViewProjectDetails = async (id: number | string) => {
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setIsEditingProject(false);
    setSidecarMode(null);
    setSelectedProjectForDetails(null);
    setProjectUsers([]);

    try {
      const detailsRes = await projectManagementService.getProjectDetails(id);
      if (detailsRes.success && detailsRes.data) {
        const p = detailsRes.data;
        setSelectedProjectForDetails(p);

        setEditProjectForm({
          code: p.code || '',
          name: p.name || '',
          clientId: String(p.client?.id || (allStaffList[0]?.id ? String(allStaffList[0].id) : '2')),
          projectTypeId: String(p.type?.id || (projectTypes[0]?.id ? String(projectTypes[0].id) : '2')),
          projectStatusId: String(p.status?.id || (projectStatuses[0]?.id ? String(projectStatuses[0].id) : '1')),
          siteAddress: p.site_address || '',
          budget: p.budget ? String(parseInt(p.budget, 10)) : '',
          startDate: p.start_date || '',
          endDate: p.end_date || ''
        });
      } else {
        throw new Error(detailsRes.message || 'Failed to fetch details');
      }

      try {
        const usersRes = await projectManagementService.getProjectUsers(id);
        if (usersRes.success && usersRes.data) {
          setProjectUsers(usersRes.data);
        }
      } catch (userErr) {
        console.error('Failed to fetch project users:', userErr);
      }

      try {
        fetchMilestones(id);
      } catch (mErr) {
        console.error('Failed to fetch milestones:', mErr);
      }

      try {
        const staffRes = await userService.getUsers(1);
        if (staffRes.success && staffRes.data) {
          setAllStaffList(staffRes.data.items || []);
          if (staffRes.data.items && staffRes.data.items.length > 0) {
            setSelectedUserToAssign(String(staffRes.data.items[0].id));
          }
        }
      } catch (staffErr) {
        console.error('Failed to fetch all staff list:', staffErr);
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load project details.');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAssignUserToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForDetails || !selectedUserToAssign) return;
    setIsAssigningUser(true);
    try {
      const resData = await projectManagementService.assignUserToProject(selectedProjectForDetails.id, selectedUserToAssign);
      if (resData.success) {
        toast.success(resData.message || 'User assigned to project successfully.');
        const usersRes = await projectManagementService.getProjectUsers(selectedProjectForDetails.id);
        if (usersRes.success && usersRes.data) {
          setProjectUsers(usersRes.data);
        }
      } else {
        toast.error(resData.message || 'Failed to assign user to project.');
      }
    } catch (err: any) {
      console.error('Failed to assign user:', err);
      const msg = err?.response?.message || err?.message || 'Failed to assign user to project.';
      toast.error(msg);
    } finally {
      setIsAssigningUser(false);
    }
  };

  const handleQuickAssignUser = async (userId: number | string) => {
    if (!selectedProjectForDetails) return;
    try {
      const resData = await projectManagementService.assignUserToProject(selectedProjectForDetails.id, userId);
      if (resData.success) {
        toast.success(resData.message || 'User assigned to project successfully.');
        const usersRes = await projectManagementService.getProjectUsers(selectedProjectForDetails.id);
        if (usersRes.success && usersRes.data) {
          setProjectUsers(usersRes.data);
        }
      } else {
        toast.error(resData.message || 'Failed to assign user to project.');
      }
    } catch (err: any) {
      console.error('Failed to assign user:', err);
      const msg = err?.response?.message || err?.message || 'Failed to assign user to project.';
      toast.error(msg);
    }
  };

  const fetchMilestones = async (projectId: number | string) => {
    setLoadingMilestones(true);
    try {
      const res = await milestoneService.getMilestones(projectId);
      if (res.success && res.data) {
        setMilestonesList(res.data);
      } else {
        setMilestonesList([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch milestones:', err);
      toast.error('Failed to load project milestones.');
      setMilestonesList([]);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const handleOpenAddMilestone = () => {
    setEditingMilestone(null);
    setMilestoneForm({
      code: `M-00${milestonesList.length + 1}`,
      name: '',
      description: '',
      phase_id: '1',
      status_id: '1',
      sequence: String(milestonesList.length + 1),
      planned_date: new Date().toISOString().split('T')[0],
      actual_date: '',
      predecessor_id: '',
      responsible_user_id: allStaffList[0]?.id ? String(allStaffList[0].id) : '',
      responsible_party_label: '',
      deliverable: '',
      is_payment_milestone: false,
      payment_amount: ''
    });
    setMilestoneValidationErrors({});
    setShowMilestoneModal(true);
  };

  const handleOpenEditMilestone = (m: any) => {
    setEditingMilestone(m);
    setMilestoneForm({
      code: m.code || '',
      name: m.name || '',
      description: m.description || '',
      phase_id: String(m.phase?.id || '1'),
      status_id: String(m.status?.id || '1'),
      sequence: String(m.sequence || '1'),
      planned_date: m.planned_date || '',
      actual_date: m.actual_date || '',
      predecessor_id: m.predecessor?.id ? String(m.predecessor.id) : '',
      responsible_user_id: m.responsible?.user?.id ? String(m.responsible.user.id) : '',
      responsible_party_label: m.responsible?.label || '',
      deliverable: m.deliverable || '',
      is_payment_milestone: !!m.is_payment_milestone,
      payment_amount: m.payment_amount ? String(m.payment_amount) : ''
    });
    setMilestoneValidationErrors({});
    setShowMilestoneModal(true);
  };

  const handleDeleteMilestone = (milestoneId: number | string) => {
    setMilestoneToDelete(milestoneId);
  };

  const confirmDeleteMilestone = async () => {
    if (!milestoneToDelete) return;
    const activeProjId = selectedProjectForDetails?.id || selectedProjectForMilestones?.id;
    if (!activeProjId) return;

    try {
      const res = await milestoneService.deleteMilestone(activeProjId, milestoneToDelete);
      if (res.success) {
        toast.success(res.message || 'Milestone deleted successfully.');
        fetchMilestones(activeProjId);
      } else {
        toast.error(res.message || 'Failed to delete milestone.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete milestone.');
    } finally {
      setMilestoneToDelete(null);
    }
  };

  const handleSubmitMilestoneForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeProjId = selectedProjectForDetails?.id || selectedProjectForMilestones?.id;
    if (!activeProjId) {
      toast.error('No active project selected.');
      return;
    }

    if (!milestoneForm.code.trim() || !milestoneForm.name.trim()) {
      toast.error('Code and Name are required.');
      return;
    }

    setMilestoneValidationErrors({});

    const payload = {
      code: milestoneForm.code.trim(),
      name: milestoneForm.name.trim(),
      description: milestoneForm.description.trim(),
      phase_id: Number(milestoneForm.phase_id),
      status_id: Number(milestoneForm.status_id),
      sequence: Number(milestoneForm.sequence) || 1,
      planned_date: milestoneForm.planned_date,
      actual_date: milestoneForm.actual_date,
      predecessor_id: milestoneForm.predecessor_id ? Number(milestoneForm.predecessor_id) : null,
      responsible_user_id: Number(milestoneForm.responsible_user_id) || (allStaffList[0]?.id ? Number(allStaffList[0].id) : 1),
      responsible_party_label: milestoneForm.responsible_party_label,
      deliverable: milestoneForm.deliverable,
      is_payment_milestone: milestoneForm.is_payment_milestone ? 1 : 0,
      payment_amount: milestoneForm.is_payment_milestone ? Number(milestoneForm.payment_amount) || 0 : 0
    };

    try {
      let res;
      if (editingMilestone) {
        res = await milestoneService.updateMilestone(activeProjId, editingMilestone.id, payload);
      } else {
        res = await milestoneService.createMilestone(activeProjId, payload);
      }

      if (res.success) {
        toast.success(res.message || 'Milestone saved successfully.');
        setShowMilestoneModal(false);
        fetchMilestones(activeProjId);
      } else {
        if (res.errors) {
          setMilestoneValidationErrors(res.errors);
        }
        toast.error(res.message || 'Failed to save milestone.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save milestone.');
    }
  };

  // Load milestones when selectedProjectForDetails changes (for Sidecar view)
  React.useEffect(() => {
    if (selectedProjectForDetails && sidecarMode === 'milestones') {
      fetchMilestones(selectedProjectForDetails.id);
    }
  }, [selectedProjectForDetails?.id, sidecarMode]);

  // Load milestones when selectedProjectForMilestones changes (for Milestones subtab)
  React.useEffect(() => {
    if (activeSubTab === 'milestones') {
      // Set default selected project if none selected yet
      if (projects.length > 0 && !selectedProjectForMilestones) {
        setSelectedProjectForMilestones(projects[0]);
      } else if (selectedProjectForMilestones) {
        fetchMilestones(selectedProjectForMilestones.id);
      }
    }
  }, [selectedProjectForMilestones?.id, activeSubTab, projects]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForDetails) return;

    if (editProjectForm.endDate < editProjectForm.startDate) {
      toast.error('Project end date must be after the start date.');
      return;
    }

    const formatDateToDMY = (dateStr: string) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${parseInt(day, 10)}-${parseInt(month, 10)}-${year}`;
    };

    try {
      const payload = {
        code: editProjectForm.code,
        name: editProjectForm.name,
        client_id: Number(editProjectForm.clientId) || (allStaffList[0]?.id ? Number(allStaffList[0].id) : 2),
        project_type_id: Number(editProjectForm.projectTypeId) || (projectTypes[0]?.id ? Number(projectTypes[0].id) : 2),
        project_status_id: Number(editProjectForm.projectStatusId) || (projectStatuses[0]?.id ? Number(projectStatuses[0].id) : 1),
        site_address: editProjectForm.siteAddress,
        budget: Number(editProjectForm.budget) || 755000,
        start_date: formatDateToDMY(editProjectForm.startDate),
        end_date: formatDateToDMY(editProjectForm.endDate)
      };

      const resData = await projectManagementService.updateProject(selectedProjectForDetails.id, payload);

      if (resData.success) {
        toast.success(resData.message || 'Project updated successfully.');
        setIsEditingProject(false);
        handleViewProjectDetails(selectedProjectForDetails.id);
        fetchProjects(currentPage);
      } else {
        toast.error(resData.message || 'Failed to update project.');
      }
    } catch (err: any) {
      console.error('Failed to update project:', err);
      toast.error(err.message || 'Failed to update project.');
    }
  };

  const handleDeleteProject = (id: number | string) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-[#0f281e]/10 overflow-hidden font-sans text-left`}
      >
        <div className="p-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0f281e]">Delete Project?</p>
            <p className="text-xs text-[#0f281e]/60 mt-0.5">Are you sure you want to delete this project? This will permanently remove all logs and records.</p>
          </div>
        </div>
        <div className="bg-[#fbf7f0] px-4 py-3 flex justify-end gap-2 border-t border-[#0f281e]/5">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0f281e]/50 hover:bg-[#0f281e]/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const resData = await projectManagementService.deleteProject(id);
                if (resData.success) {
                  toast.success(resData.message || 'Project deleted successfully.');
                  setShowDetailsModal(false);
                  fetchProjects(currentPage);
                } else {
                  toast.error(resData.message || 'Failed to delete project.');
                }
              } catch (err: any) {
                console.error('Failed to delete project:', err);
                toast.error(err.message || 'Failed to delete project.');
              }
            }}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    ), {
      position: 'top-right',
      duration: 8000
    });
  };

  const handleRemoveUserFromProject = (u: any) => {
    setUserToRemove(u);
  };

  const confirmRemoveUser = async () => {
    if (!selectedProjectForDetails || !userToRemove) return;
    setIsRemovingUser(true);
    try {
      const resData = await projectManagementService.removeUserFromProject(selectedProjectForDetails.id, userToRemove.id);
      if (resData.success) {
        toast.success(resData.message || 'User removed from project successfully.');
        const usersRes = await projectManagementService.getProjectUsers(selectedProjectForDetails.id);
        if (usersRes.success && usersRes.data) {
          setProjectUsers(usersRes.data);
        }
        setUserToRemove(null);
      } else {
        toast.error(resData.message || 'Failed to remove user from project.');
      }
    } catch (err: any) {
      console.error('Failed to remove user:', err);
      const msg = err?.response?.message || err?.message || 'Failed to remove user from project.';
      toast.error(msg);
    } finally {
      setIsRemovingUser(false);
    }
  };

  const handleUpdateProjectStatus = async (statusId: number) => {
    if (!selectedProjectForDetails) return;
    try {
      const resData = await projectManagementService.updateProjectStatus(selectedProjectForDetails.id, statusId);
      if (resData.success) {
        toast.success(resData.message || 'Project status updated successfully.');
        handleViewProjectDetails(selectedProjectForDetails.id);
        fetchProjects(currentPage);
      } else {
        toast.error(resData.message || 'Failed to update project status.');
      }
    } catch (err: any) {
      console.error('Failed to update project status:', err);
      toast.error(err.message || 'Failed to update project status.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header and top tab selectors */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl text-[#0f281e]">Project Management Suite</h2>
          <p className="text-[#0f281e]/60 text-sm mt-1">Manage submittals, request clarifications via RFIs, approve change orders, and log field issues.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-[#0f281e]/5 p-1 rounded-xl border border-[#0f281e]/10 relative select-none">
            {[
              { id: 'projects', label: 'Projects', icon: <Building2 className="w-4 h-4 shrink-0" /> },
              { id: 'milestones', label: 'Milestones', icon: <Flag className="w-4 h-4 shrink-0" /> },
              { id: 'rfi', label: 'RFIs', icon: <HelpCircle className="w-4 h-4 shrink-0" /> },
              { id: 'submittals', label: 'Submittals', icon: <FileSignature className="w-4 h-4 shrink-0" /> },
              { id: 'changeorders', label: 'Change Orders', icon: <FolderGit2 className="w-4 h-4 shrink-0" /> },
              { id: 'daily-logs', label: 'Daily Field Logs', icon: <Clock className="w-4 h-4 shrink-0" /> },
              { id: 'issues', label: 'Field Issues', icon: <AlertCircle className="w-4 h-4 shrink-0" /> }
            ].map(tab => {
              const isActive = activeSubTab === tab.id;
              return (
                <motion.button
                  layout
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`relative flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase rounded-lg tracking-wider transition-colors duration-300 z-10 shrink-0 ${isActive ? 'text-white' : 'text-[#0f281e]/60 hover:text-[#0f281e]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="pmSubTabSlider"
                      className="absolute inset-0 bg-[#c4864b] rounded-lg z-[-1] shadow-sm shadow-[#c4864b]/20"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {tab.icon}
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                      animate={{ opacity: 1, width: 'auto', marginLeft: 6 }}
                      exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="whitespace-nowrap overflow-hidden font-bold"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {activeSubTab === 'projects' && (
        <div className="space-y-6">
          <div className="brand-banner relative overflow-hidden rounded-[2rem] border border-[#0f281e]/10 bg-[#0f281e] p-6 text-white shadow-xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#c4864b]/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dec099]/20 bg-white/5 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c4864b]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#dec099]">Project Registry</span>
                </div>
                <h3 className="font-serif text-3xl">Project creation & setup</h3>
                <p className="mt-2 max-w-xl text-sm text-white/50">
                  Create the project record first, then manage RFIs, submittals, change orders, daily logs, and field issues.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c4864b] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#d2975e]"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-[#dec099]/10 rounded-2xl">
              <div className="h-8 w-8 rounded-full border-4 border-[#dec099] border-t-transparent animate-spin" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#dec099]/60">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-sm font-bold text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => fetchProjects(currentPage)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#c4864b] hover:bg-[#b57a44] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-sm font-bold text-[#dec099]/50">No projects found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {projects.map(project => {
                  const projectId = project.code || String(project.id);
                  const projectStatus = typeof project.status === 'object' ? project.status.label : (project.status || 'Active');
                  const projectLocation = project.location || project.type || 'N/A';
                  const projectGC = project.generalContractor || project.client || 'N/A';
                  const projectStart = project.start_date || project.startDate || 'N/A';
                  const projectEnd = project.end_date || project.endDate || 'N/A';
                  const projectBudget = project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A';

                  return (
                    <motion.article
                      key={project.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleViewProjectDetails(project.id)}
                      className="rounded-2xl border border-[#0f281e]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c4864b]/35 hover:shadow-lg cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c4864b]/10 text-[#c4864b]">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0f281e]/35">{projectId}</p>
                            <h4 className="truncate font-serif text-xl text-[#0f281e]">{project.name}</h4>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${projectStatus === 'Active' || projectStatus === 'active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : projectStatus === 'Completed' || projectStatus === 'completed'
                              ? 'border-gray-200 bg-gray-100 text-gray-500'
                              : 'border-[#c4864b]/20 bg-[#c4864b]/10 text-[#c4864b]'
                          }`}>
                          {projectStatus}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-[#0f281e]/[0.035] p-4">
                          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[#0f281e]/35">
                            <MapPin className="h-3.5 w-3.5 text-[#c4864b]" /> Project Type
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-[#0f281e]/75">{projectLocation}</p>
                        </div>
                        <div className="rounded-xl bg-[#0f281e]/[0.035] p-4">
                          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[#0f281e]/35">
                            <HardHat className="h-3.5 w-3.5 text-[#c4864b]" /> Client / GC
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-[#0f281e]/75">{projectGC}</p>
                        </div>
                        <div className="rounded-xl bg-[#0f281e]/[0.035] p-4">
                          <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[#0f281e]/35">
                            <Coins className="h-3.5 w-3.5 text-[#c4864b]" /> Budget
                          </span>
                          <p className="mt-1.5 text-xs font-bold text-[#0f281e]/75 truncate" title={projectBudget}>{projectBudget}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#0f281e]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-[#0f281e]/35">
                          <CalendarDays className="h-3.5 w-3.5 text-[#c4864b]" /> Project Schedule
                        </span>
                        <span className="text-xs font-bold text-[#0f281e]/70">
                          {projectStart} <span className="mx-2 text-[#0f281e]/25">→</span> {projectEnd}
                        </span>
                      </div>
                    </motion.article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  <p className="text-xs text-[#dec099]/60 font-medium">
                    Showing page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span> (Total: {totalItems} projects)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1 || loading}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#dec099]/20 hover:border-[#dec099]/40 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#dec099] flex items-center justify-center cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages || loading}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#dec099]/20 hover:border-[#dec099]/40 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#dec099] flex items-center justify-center cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSubTab === 'rfi' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
            <div>
              <h3 className="font-serif text-xl text-[#0f281e]">Request for Information (RFI) Log</h3>
              <p className="text-xs text-[#0f281e]/55 mt-0.5">Submit architectural or engineering questions and track answers.</p>
            </div>
            <button
              onClick={() => setShowRfiModal(true)}
              className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create RFI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rfis.map((rfi) => (
              <div key={rfi.id} className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#c4864b]/30 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#0f281e]/40">{rfi.id}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${rfi.status === 'Open' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                        rfi.status === 'Answered' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                      {rfi.status}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg text-[#0f281e] font-semibold leading-snug">{rfi.title}</h4>
                  <div className="text-xs text-[#0f281e]/60 space-y-1">
                    <div>Assigned To: <span className="font-bold">{rfi.assignedTo}</span></div>
                    <div className="flex gap-4">
                      <span>Created: {rfi.dateCreated}</span>
                      <span className="text-red-500">Due: {rfi.dueDate}</span>
                    </div>
                  </div>

                  <div className="bg-[#0f281e]/5 p-3 rounded-lg border border-[#0f281e]/5 mt-2">
                    <span className="text-[9px] uppercase font-black tracking-wider text-[#0f281e]/40 block mb-1">RFI Question</span>
                    <p className="text-xs text-[#0f281e]/80 leading-relaxed font-semibold">{rfi.question}</p>
                  </div>

                  {rfi.answer ? (
                    <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 mt-2">
                      <span className="text-[9px] uppercase font-black tracking-wider text-emerald-600/70 block mb-1">Official Response</span>
                      <p className="text-xs text-emerald-800 leading-relaxed font-medium">{rfi.answer}</p>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-[#0f281e]/40 mb-1.5">Reply to RFI</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type response answer..."
                          id={`answer-input-${rfi.id}`}
                          className="flex-1 bg-[#0f281e]/5 rounded-lg px-3 py-2 text-xs text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30 font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const inputEl = document.getElementById(`answer-input-${rfi.id}`) as HTMLInputElement;
                              if (inputEl.value) {
                                handleRfiAnswer(rfi.id, inputEl.value);
                                inputEl.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const inputEl = document.getElementById(`answer-input-${rfi.id}`) as HTMLInputElement;
                            if (inputEl.value) {
                              handleRfiAnswer(rfi.id, inputEl.value);
                              inputEl.value = '';
                            }
                          }}
                          className="p-2 bg-[#0f281e] text-white hover:bg-[#0f281e]/90 rounded-lg transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'submittals' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Submittal Log Register</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Architectural submittals, product specification sheets, and approvals.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f281e]/5 font-bold uppercase text-[10px] tracking-wider text-[#0f281e]/60 border-b border-[#0f281e]/10">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Submittal Package / Section</th>
                  <th className="px-6 py-4">Submitting Contractor</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4">Document Attachment</th>
                  <th className="px-6 py-4">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0f281e]/5 text-[#0f281e]/80">
                {submittals.map(sub => (
                  <tr key={sub.id} className="hover:bg-[#0f281e]/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-xs">{sub.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold block text-xs">{sub.title}</span>
                      <span className="text-[10px] text-[#0f281e]/55 tracking-wider uppercase block mt-0.5">{sub.specSection}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{sub.contractor}</td>
                    <td className="px-6 py-4 text-xs font-medium">{sub.dateSubmitted}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 text-xs text-[#c4864b] hover:underline font-bold">
                        <FileSignature className="w-4 h-4" />
                        <span>{sub.file || "Attach Data Sheet"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${sub.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          sub.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                            'bg-red-50 text-red-600 border-red-200'
                        }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Orders with Versioning and digital signature validation (Workflow 3 & Special Scenario A) */}
      {activeSubTab === 'changeorders' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Contract Change Order Registry</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Workflow 3: Auto-generates versions and tracks GC digital signature logs for budget adjustments.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {changeOrders.map(co => (
              <div key={co.id} className="border border-[#0f281e]/10 p-5 rounded-2xl space-y-4 hover:border-[#c4864b]/30 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0f281e]">{co.id}</span>
                      <span className="bg-[#0f281e]/5 px-2.5 py-0.5 rounded text-[10px] font-black text-[#0f281e]">Version v{co.version}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${co.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        co.status === 'Pending Review' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          co.status === 'Revision Required' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            'bg-red-50 text-red-600 border-red-200'
                      }`}>
                      {co.status}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg text-[#0f281e] font-semibold">{co.title}</h4>
                  <p className="text-xs text-[#0f281e]/60 leading-relaxed font-semibold">{co.description}</p>

                  {/* Verification trail (Special Scenario C) */}
                  {co.gcSignature && (
                    <div className="bg-[#0f281e]/5 p-3 rounded-xl space-y-1.5 border border-[#0f281e]/10">
                      <div className="text-[9px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GC Digitally Signed</span>
                      </div>
                      <div className="text-[10px] text-[#0f281e]/75 font-semibold space-y-0.5">
                        <div>Signer: {co.gcSignature.signer}</div>
                        <div>Timestamp: {co.gcSignature.timestamp}</div>
                        <div>Method: Secure {co.gcSignature.verificationType} Authorization</div>
                        <div className="truncate text-white/50 text-[9px] font-mono select-all">Hash: {co.gcSignature.documentHash}</div>
                      </div>
                    </div>
                  )}

                  {/* Pricing team signature status */}
                  {co.pricingApproval && (
                    <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center justify-between">
                      <div className="text-[10px] text-emerald-800 font-bold">Pricing Cost Review: Verified</div>
                      <span className="text-[9px] text-[#0f281e]/40">{co.pricingApproval.timestamp}</span>
                    </div>
                  )}

                  {/* Version history dropdown (Special Scenario A) */}
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedCoHistory(selectedCoHistory === co.id ? null : co.id)}
                      className="text-xs text-[#c4864b] font-bold flex items-center gap-1 hover:underline"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{selectedCoHistory === co.id ? 'Hide revision history' : `View revision history (${co.history.length})`}</span>
                    </button>

                    {selectedCoHistory === co.id && (
                      <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                        {co.history.map((hist, idx) => (
                          <div key={idx} className="text-[10px] border-b border-gray-200 pb-1.5 last:border-0 last:pb-0 space-y-0.5">
                            <div className="flex justify-between font-bold">
                              <span className="text-[#0f281e]">Version v{hist.version}</span>
                              <span className="text-gray-400">{hist.date}</span>
                            </div>
                            <div className="text-gray-500">{hist.comments}</div>
                            <div className="text-[8px] uppercase tracking-wider text-gray-400 font-black">Logged by: {hist.author}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#0f281e]/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[9px] uppercase text-[#0f281e]/40 font-bold block">Cost Impact</span>
                        <span className="text-sm font-bold text-[#0f281e]">${co.costImpact.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#0f281e]/40 font-bold block">Time impact</span>
                        <span className="text-sm font-bold text-[#0f281e]">{co.timeImpactDays} Day(s)</span>
                      </div>
                    </div>

                    {co.status === 'Pending Review' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCoDecision(co.id, 'Approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleCoDecision(co.id, 'Rejected')}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm"
                          title="Reject Change Order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Return for revision inputs (Special Scenario A) */}
                  {co.status === 'Pending Review' && (
                    <div className="bg-[#0f281e]/5 p-3 rounded-xl space-y-2 border border-[#0f281e]/10">
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-[#0f281e]/40">Revision Request Comments</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="State what needs revision for v2..."
                          value={coReviewComments[co.id] || ''}
                          onChange={e => setCoReviewComments({ ...coReviewComments, [co.id]: e.target.value })}
                          className="flex-1 bg-white rounded-lg px-3 py-2 text-xs text-[#0f281e] outline-none border border-[#0f281e]/10 font-medium"
                        />
                        <button
                          onClick={() => handleCoReturnForRevision(co.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Field Logs Tab (Workflow 4) */}
      {activeSubTab === 'daily-logs' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Foreman Daily Site Logs</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Workflow 4: Site foremen submit daily reports. PMs review progress and commit details to project timeline.</p>
          </div>

          <div className="space-y-4">
            {dailyLogs.map(log => (
              <div key={log.id} className="border border-[#0f281e]/10 p-5 rounded-2xl hover:border-[#c4864b]/30 transition-all flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0f281e]">{log.id}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/50">{log.date}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${log.reviewedByPM ? 'bg-emerald-500/10 text-emerald-600' : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                      {log.reviewedByPM ? 'PM Reviewed' : 'Awaiting PM Review'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#0f281e]/60">Project: <span className="font-bold text-[#0f281e]/85">{log.project}</span></div>

                  <div className="bg-[#0f281e]/5 p-3 rounded-lg border border-[#0f281e]/5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#0f281e]/40 block mb-1">Work Completed Details</span>
                    <p className="text-xs text-[#0f281e]/80 leading-relaxed font-semibold">{log.workCompleted}</p>
                  </div>

                  {log.photos.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#0f281e]/40 block mb-1">Progress Snapshots ({log.photos.length})</span>
                      <div className="flex gap-2">
                        {log.photos.map((photo, i) => (
                          <div key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500 border border-gray-200">
                            {photo}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between items-end min-w-[150px]">
                  <span className="text-[9px] uppercase font-bold text-[#0f281e]/45">Submitted by: {log.foreman}</span>

                  {!log.reviewedByPM && (
                    <button
                      onClick={() => handleApproveDailyLog(log.id)}
                      className="px-4 py-2 bg-[#0f281e] text-white hover:bg-[#0f281e]/90 rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                    >
                      Approve Site Progress
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'issues' && (
        <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl text-[#0f281e]">Field Notices & Quality Defect Log</h3>
            <p className="text-xs text-[#0f281e]/55 mt-0.5">Record issues flagged in the field, safety notices, and resolution status.</p>
          </div>

          <div className="space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border border-[#0f281e]/10 rounded-2xl gap-4 hover:border-[#c4864b]/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#0f281e]">{issue.id}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${issue.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                        issue.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-gray-100 text-gray-500'
                      }`}>
                      {issue.severity} Severity
                    </span>
                  </div>
                  <h4 className="font-serif text-base text-[#0f281e] font-semibold">{issue.title}</h4>
                  <p className="text-xs text-[#0f281e]/60">{issue.description}</p>
                  <div className="text-[10px] text-[#0f281e]/50 font-bold uppercase pt-1">
                    Location: {issue.location} | Reported by: {issue.reportedBy}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${issue.status === 'Open' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                    {issue.status}
                  </span>
                  {issue.status === 'Open' && (
                    <button
                      onClick={() => {
                        setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: 'Resolved' } : i));
                        toast.success("Field notice status updated to Resolved");
                      }}
                      className="bg-[#0f281e] hover:bg-[#0f281e]/90 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'milestones' && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#0f281e]/5 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-serif text-xl text-[#0f281e]">Project Milestones Tracker</h3>
              <p className="text-xs text-[#0f281e]/55">Select a project to view, add, or manage critical path milestones and deliverables.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0f281e]/70 whitespace-nowrap">Project:</span>
                <select
                  value={selectedProjectForMilestones?.id || ''}
                  onChange={(e) => {
                    const proj = projects.find(p => String(p.id) === e.target.value);
                    if (proj) setSelectedProjectForMilestones(proj);
                  }}
                  className="rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0] px-3.5 py-2 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] cursor-pointer shadow-sm min-w-[200px]"
                >
                  <option value="" disabled>Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedProjectForMilestones && (
                <button
                  onClick={handleOpenAddMilestone}
                  className="bg-[#c4864b] hover:bg-[#b57a44] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer border-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>
          </div>

          {/* Timeline Content */}
          {!selectedProjectForMilestones ? (
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-12 text-center text-xs text-[#0f281e]/55">
              Please select a project from the dropdown above to view its milestones.
            </div>
          ) : loadingMilestones ? (
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-12 text-center">
              <div className="w-8 h-8 border-4 border-[#c4864b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#0f281e]/60 font-bold animate-pulse">Fetching project milestones...</p>
            </div>
          ) : milestonesList.length === 0 ? (
            <div className="bg-white border border-[#0f281e]/5 rounded-2xl p-12 text-center space-y-3">
              <Flag className="w-12 h-12 text-[#c4864b]/30 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-[#0f281e]/70">No milestones defined for this project.</p>
              <p className="text-xs text-[#0f281e]/50 max-w-sm mx-auto">Milestones represent major steps in the project timeline, such as phase handoffs, inspections, or payment claims.</p>
              <button
                onClick={handleOpenAddMilestone}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f281e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0f281e]/90 transition-all cursor-pointer border-0 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Define First Milestone
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-[#0f281e]/15 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-6 py-4">
              {milestonesList.map((m: any, idx: number) => {
                const isCompleted = m.status?.code === 'completed';
                const isInProgress = m.status?.code === 'in_progress';
                
                // Color configuration for node circles
                const nodeStyles = isCompleted
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : isInProgress
                    ? 'bg-amber-500 border-amber-600 text-white animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-[#fbf7f0] border-[#0f281e]/20 text-[#0f281e]/40';

                const statusBadgeStyles = isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isInProgress
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200';

                return (
                  <div key={m.id} className="relative group">
                    {/* Timeline Node Icon/Circle */}
                    <div className={`absolute -left-[39px] sm:-left-[53px] top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black z-10 transition-transform group-hover:scale-110 ${nodeStyles}`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{m.sequence || idx + 1}</span>
                      )}
                    </div>

                    {/* Milestone Card */}
                    <div className="bg-white border border-[#0f281e]/5 hover:border-[#c4864b]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-left">
                      <div className="space-y-3 flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono text-[#c4864b] bg-[#c4864b]/5 border border-[#c4864b]/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {m.code || 'MILESTONE'}
                          </span>
                          {m.phase?.label && (
                            <span className="text-[9px] font-bold text-[#0f281e]/55 bg-[#0f281e]/5 px-2 py-0.5 rounded-full">
                              Phase: {m.phase.label}
                            </span>
                          )}
                          {m.predecessor && (
                            <span className="text-[9px] font-mono text-[#0f281e]/45 border border-dashed border-[#0f281e]/15 px-2 py-0.5 rounded">
                              Predecessor: {m.predecessor.code}
                            </span>
                          )}
                        </div>

                        {/* Name & description */}
                        <div>
                          <h4 className="font-serif text-lg font-semibold text-[#0f281e] tracking-tight">{m.name}</h4>
                          {m.description && (
                            <p className="text-xs text-[#0f281e]/60 mt-1 max-w-2xl leading-relaxed">{m.description}</p>
                          )}
                        </div>

                        {/* Deliverables & dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 text-[11px] border-t border-[#0f281e]/5 mt-2">
                          <div>
                            <span className="text-[#0f281e]/40 font-black uppercase tracking-wider block">Planned / Actual Dates</span>
                            <span className="text-[#0f281e]/80 font-medium font-mono">
                              {m.planned_date || '-'} {m.actual_date ? ` / ${m.actual_date}` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#0f281e]/40 font-black uppercase tracking-wider block">Deliverable</span>
                            <span className="text-[#0f281e]/80 font-medium truncate block" title={m.deliverable}>
                              {m.deliverable || 'None specified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#0f281e]/40 font-black uppercase tracking-wider block">Responsible Party</span>
                            <span className="text-[#0f281e]/80 font-semibold">
                              {m.responsible?.user?.name || m.responsible_party_label || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section: Status, Payment, Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-[#0f281e]/5 pt-4 lg:pt-0">
                        <div className="space-y-2 flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${statusBadgeStyles}`}>
                            {m.status?.label || 'Not Started'}
                          </span>

                          {m.is_payment_milestone && (
                            <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/20 text-[#c4864b] px-3 py-1.5 rounded-xl font-bold">
                              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                              <span>Payment: ${Number(m.payment_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          )}
                        </div>

                        {/* CRUD action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMilestone(m)}
                            className="h-8 px-3 rounded-xl border border-[#0f281e]/10 text-[#0f281e]/75 hover:bg-[#0f281e] hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMilestone(m.id)}
                            className="h-8 px-3 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showMilestoneModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close milestone form"
            onClick={() => setShowMilestoneModal(false)}
            className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
          />
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={handleSubmitMilestoneForm}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl text-left"
          >
            <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">
                    {editingMilestone ? 'Modify Existing Record' : 'New Milestone Track'}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl">
                    {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
                  </h3>
                  <p className="mt-1 text-xs text-white/45">Define milestones to represent key achievements, gates, or phases in your project schedule.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Milestone Code *</label>
                  <input
                    type="text"
                    required
                    value={milestoneForm.code}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. M-001"
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                  />
                  {milestoneValidationErrors.code && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{milestoneValidationErrors.code[0]}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Sequence *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={milestoneForm.sequence}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, sequence: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                  />
                  {milestoneValidationErrors.sequence && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{milestoneValidationErrors.sequence[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Foundation Handover"
                  className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                />
                {milestoneValidationErrors.name && (
                  <p className="mt-1.5 text-[10px] font-bold text-red-500">{milestoneValidationErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Description</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detail the scope or criteria to declare this milestone complete..."
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white resize-none animate-none"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Phase *</label>
                  <select
                    value={milestoneForm.phase_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, phase_id: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  >
                    <option value="1">Pre-Construction</option>
                    <option value="2">Construction Phase</option>
                    <option value="3">Closeout</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Status *</label>
                  <select
                    value={milestoneForm.status_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, status_id: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  >
                    <option value="1">Not Started</option>
                    <option value="2">In Progress</option>
                    <option value="3">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Planned Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.planned_date}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, planned_date: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Actual Completion Date</label>
                  <input
                    type="date"
                    value={milestoneForm.actual_date}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, actual_date: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Responsible Crew Member *</label>
                  <select
                    value={milestoneForm.responsible_user_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, responsible_user_id: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  >
                    <option value="" disabled>Select responsible crew...</option>
                    {allStaffList.map(u => (
                      <option key={u.id} value={String(u.id)}>{u.first_name} {u.last_name}</option>
                    ))}
                  </select>
                  {milestoneValidationErrors.responsible_user_id && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{milestoneValidationErrors.responsible_user_id[0]}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Responsible Party Label</label>
                  <input
                    type="text"
                    value={milestoneForm.responsible_party_label}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, responsible_party_label: e.target.value }))}
                    placeholder="e.g. Subcontractor / Lead Inspector"
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Predecessor Milestone</label>
                  <select
                    value={milestoneForm.predecessor_id}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, predecessor_id: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white cursor-pointer"
                  >
                    <option value="">None (Starts immediately)</option>
                    {milestonesList
                      .filter(m => !editingMilestone || m.id !== editingMilestone.id)
                      .map(m => (
                        <option key={m.id} value={String(m.id)}>{m.code} - {m.name}</option>
                      ))}
                  </select>
                  {milestoneValidationErrors.predecessor_id && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">{milestoneValidationErrors.predecessor_id[0]}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Key Deliverable File/Doc</label>
                  <input
                    type="text"
                    value={milestoneForm.deliverable}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, deliverable: e.target.value }))}
                    placeholder="e.g. Approved Permit PDF"
                    className="mt-1.5 w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 px-4 py-2.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-[#0f281e]/5 pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_payment_milestone"
                    checked={milestoneForm.is_payment_milestone}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, is_payment_milestone: e.target.checked }))}
                    className="h-4.5 w-4.5 rounded border-[#0f281e]/20 text-[#c4864b] focus:ring-[#c4864b] cursor-pointer"
                  />
                  <label htmlFor="is_payment_milestone" className="text-xs font-bold text-[#0f281e] cursor-pointer select-none">
                    This milestone releases a client contract payment
                  </label>
                </div>

                {milestoneForm.is_payment_milestone && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-7"
                  >
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Payment Amount ($) *</label>
                    <div className="relative mt-1.5 rounded-xl shadow-sm max-w-[280px]">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-xs text-[#0f281e]/40 font-bold">$</span>
                      </div>
                      <input
                        type="number"
                        required={milestoneForm.is_payment_milestone}
                        min="0"
                        step="0.01"
                        value={milestoneForm.payment_amount}
                        onChange={(e) => setMilestoneForm(prev => ({ ...prev, payment_amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-[#0f281e]/15 bg-[#fbf7f0]/40 py-2.5 pl-7 pr-4 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] focus:bg-white"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#0f281e]/5 bg-[#fbf7f0]/25 p-6">
              <button
                type="button"
                onClick={() => setShowMilestoneModal(false)}
                className="rounded-xl border border-[#0f281e]/15 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/70 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0f281e] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#0f281e]/90 shadow-lg cursor-pointer"
              >
                {editingMilestone ? 'Save Changes' : 'Create Milestone'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close project setup"
            onClick={() => setShowProjectModal(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onSubmit={submitProject}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">New Project Record</p>
                  <h3 className="mt-2 font-serif text-3xl">Create project</h3>
                  <p className="mt-1 text-xs text-white/45">Enter the core setup details to initialize the project workspace.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-code" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Code</label>
                  <input
                    id="project-code"
                    type="text"
                    required
                    autoFocus
                    value={projectForm.code}
                    onChange={e => setProjectForm({ ...projectForm, code: e.target.value })}
                    placeholder="e.g. CP-102"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                  />
                </div>
                <div>
                  <label htmlFor="project-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project name</label>
                  <input
                    id="project-name"
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="e.g. Sky 47 Data Center"
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-address" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Site Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c4864b]" />
                    <input
                      id="project-address"
                      type="text"
                      required
                      value={projectForm.siteAddress}
                      onChange={e => setProjectForm({ ...projectForm, siteAddress: e.target.value })}
                      placeholder="e.g. Capital Smart City"
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] py-3 pl-11 pr-4 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="project-budget" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Budget ($)</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c4864b]" />
                    <input
                      id="project-budget"
                      type="number"
                      required
                      value={projectForm.budget}
                      onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })}
                      placeholder="e.g. 755000"
                      className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] py-3 pl-11 pr-4 text-sm font-semibold text-[#0f281e] outline-none transition-colors placeholder:text-[#0f281e]/25 focus:border-[#c4864b]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="project-client-id" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Client / Crew Member</label>
                  <select
                    id="project-client-id"
                    required
                    value={projectForm.clientId}
                    onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  >
                    {allStaffList.length === 0 ? (
                      <option value="2">Default Client (ID: 2)</option>
                    ) : (
                      allStaffList.map(u => {
                        const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed';
                        const roleInfo = u.roles && u.roles.length > 0 ? ` (${u.roles.join(', ')})` : '';
                        return (
                          <option key={u.id} value={String(u.id)}>
                            {name}{roleInfo}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                <div>
                  <label htmlFor="project-type-id" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Type</label>
                  <select
                    id="project-type-id"
                    required
                    value={projectForm.projectTypeId}
                    onChange={e => setProjectForm({ ...projectForm, projectTypeId: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  >
                    {projectTypes.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="project-status-id" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Status</label>
                  <select
                    id="project-status-id"
                    required
                    value={projectForm.projectStatusId}
                    onChange={e => setProjectForm({ ...projectForm, projectStatusId: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  >
                    {projectStatuses.map(s => (
                      <option key={s.id} value={String(s.id)}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-start" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Start date</label>
                  <input
                    id="project-start"
                    type="date"
                    required
                    value={projectForm.startDate}
                    onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                </div>
                <div>
                  <label htmlFor="project-end" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Target completion</label>
                  <input
                    id="project-end"
                    type="date"
                    required
                    min={projectForm.startDate || undefined}
                    value={projectForm.endDate}
                    onChange={e => setProjectForm({ ...projectForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#0f281e]/5 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 transition-colors hover:bg-[#0f281e]/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[1.35] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#b5773f]"
                >
                  Create Project
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      )}

      {/* RFI Modal Dialog */}
      {showRfiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <form onSubmit={submitRfi} className="bg-white rounded-[2rem] border border-[#0f281e]/10 shadow-2xl w-full max-w-lg p-8 space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-[#0f281e]">New Request for Information</h3>
              <p className="text-xs text-[#0f281e]/60 mt-1">Draft an engineering/design RFI to assign to a project representative.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">RFI Title</label>
                <input
                  type="text" value={rfiTitle} onChange={e => setRfiTitle(e.target.value)}
                  placeholder="e.g., Ballroom structural stud dimensions"
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Assign To</label>
                <select
                  value={rfiAssignedTo} onChange={e => setRfiAssignedTo(e.target.value)}
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs text-[#0f281e] font-semibold outline-none border border-transparent focus:border-[#c4864b]/30"
                >
                  <option value="Hassan Mahmood (GC rep)">Hassan Mahmood (GC rep)</option>
                  <option value="Sarah Jenkins (Senior Architect)">Sarah Jenkins (Senior Architect)</option>
                  <option value="D. O'Connor (Structural Engineer)">D. O'Connor (Structural Engineer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-[#0f281e]/40 mb-2">Question details</label>
                <textarea
                  value={rfiQuestion} onChange={e => setRfiQuestion(e.target.value)}
                  placeholder="Specify detail coordinates, sheet numbers, and description of clarification required."
                  className="w-full bg-[#0f281e]/5 rounded-xl px-4 py-3 text-xs text-[#0f281e] outline-none border border-transparent focus:border-[#c4864b]/30 h-28 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button" onClick={() => setShowRfiModal(false)}
                className="flex-1 py-3 rounded-xl uppercase tracking-widest text-[10px] font-black border border-[#0f281e]/10 text-[#0f281e]/60 hover:bg-[#fbf7f0] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl uppercase tracking-widest text-[10px] font-black bg-[#0f281e] text-white hover:bg-[#0f281e]/90 transition-all shadow-lg"
              >
                Send RFI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT DETAILS & ACTIONS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm overflow-y-auto">
          <button
            type="button"
            aria-label="Close project details"
            onClick={() => setShowDetailsModal(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
          />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-0 max-w-6xl w-full">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: sidecarMode ? -15 : 0 }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shrink-0"
            >
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white">
                <div className="h-8 w-8 rounded-full border-4 border-[#c4864b] border-t-transparent animate-spin" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#0f281e]/60">Loading project details...</p>
              </div>
            ) : selectedProjectForDetails ? (
              <div>
                {/* Header */}
                <div className="relative overflow-hidden bg-[#0f281e] px-6 py-7 text-white sm:px-8 border-b border-white/5">
                  <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-[#c4864b]/25 blur-3xl" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#dec099]">
                        Project Code: {selectedProjectForDetails.code || 'N/A'}
                      </p>
                      <h3 className="mt-2 font-serif text-3xl">{selectedProjectForDetails.name}</h3>
                      <p className="mt-1 text-xs text-white/45">
                        Created by {selectedProjectForDetails.created_by?.name || 'Admin'} on {new Date(selectedProjectForDetails.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(false)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Close"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4 text-left">
                  {isEditingProject ? (
                    /* Edit/Update Form */
                    <form onSubmit={handleUpdateProject} className="space-y-4 text-left">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-project-code" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Code</label>
                          <input
                            id="edit-project-code"
                            type="text"
                            required
                            value={editProjectForm.code}
                            onChange={e => setEditProjectForm({ ...editProjectForm, code: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-project-name" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project name</label>
                          <input
                            id="edit-project-name"
                            type="text"
                            required
                            value={editProjectForm.name}
                            onChange={e => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-project-address" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Site Address</label>
                          <input
                            id="edit-project-address"
                            type="text"
                            required
                            value={editProjectForm.siteAddress}
                            onChange={e => setEditProjectForm({ ...editProjectForm, siteAddress: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-project-budget" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Budget ($)</label>
                          <input
                            id="edit-project-budget"
                            type="number"
                            required
                            value={editProjectForm.budget}
                            onChange={e => setEditProjectForm({ ...editProjectForm, budget: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                          <label htmlFor="edit-project-client" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Client / Crew Member</label>
                          <select
                            id="edit-project-client"
                            required
                            value={editProjectForm.clientId}
                            onChange={e => setEditProjectForm({ ...editProjectForm, clientId: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          >
                            {allStaffList.length === 0 ? (
                              <option value="2">Default Client (ID: 2)</option>
                            ) : (
                              allStaffList.map(u => {
                                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed';
                                const roleInfo = u.roles && u.roles.length > 0 ? ` (${u.roles.join(', ')})` : '';
                                return (
                                  <option key={u.id} value={String(u.id)}>
                                    {name}{roleInfo}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="edit-project-type" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Type</label>
                          <select
                            id="edit-project-type"
                            required
                            value={editProjectForm.projectTypeId}
                            onChange={e => setEditProjectForm({ ...editProjectForm, projectTypeId: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          >
                            {projectTypes.map(t => (
                              <option key={t.id} value={String(t.id)}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="edit-project-status" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Status</label>
                          <select
                            id="edit-project-status"
                            required
                            value={editProjectForm.projectStatusId}
                            onChange={e => setEditProjectForm({ ...editProjectForm, projectStatusId: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          >
                            {projectStatuses.map(s => (
                              <option key={s.id} value={String(s.id)}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="edit-project-start" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Start date</label>
                          <input
                            id="edit-project-start"
                            type="date"
                            required
                            value={editProjectForm.startDate}
                            onChange={e => setEditProjectForm({ ...editProjectForm, startDate: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-project-end" className="mb-2 block text-[10px] font-black uppercase tracking-wider text-[#0f281e]/40">Target completion</label>
                          <input
                            id="edit-project-end"
                            type="date"
                            required
                            min={editProjectForm.startDate || undefined}
                            value={editProjectForm.endDate}
                            onChange={e => setEditProjectForm({ ...editProjectForm, endDate: e.target.value })}
                            className="w-full rounded-xl border border-[#0f281e]/10 bg-[#0f281e]/[0.035] px-4 py-3 text-sm font-semibold text-[#0f281e] outline-none transition-colors focus:border-[#c4864b]"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 border-t border-[#0f281e]/5 pt-5">
                        <button
                          type="button"
                          onClick={() => setIsEditingProject(false)}
                          className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/50 hover:bg-[#0f281e]/5 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-[1.5] rounded-xl bg-[#c4864b] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-[#b5773f] transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Read-Only Details & Users list */
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Site Address</span>
                          <p className="mt-1 text-sm font-bold text-[#0f281e] flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#c4864b]" />
                            {selectedProjectForDetails.site_address || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Budget</span>
                          <p className="mt-1 text-sm font-bold text-[#0f281e] flex items-center gap-1.5 font-mono">
                            <Coins className="h-4 w-4 text-[#c4864b]" />
                            $ {selectedProjectForDetails.budget ? Number(selectedProjectForDetails.budget).toLocaleString() : '0.00'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Client</span>
                          <p className="mt-1 text-sm font-semibold text-[#0f281e]/75">
                            {selectedProjectForDetails.client?.name || 'N/A'} (ID: {selectedProjectForDetails.client?.id || 'N/A'})
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Type</span>
                          <p className="mt-1 text-sm font-semibold text-[#0f281e]/75">
                            {selectedProjectForDetails.type?.label || 'N/A'} (ID: {selectedProjectForDetails.type?.id || 'N/A'})
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 border-b border-[#0f281e]/5 pb-3">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Project Status</span>
                          <div className="relative mt-1">
                            <select
                              value={selectedProjectForDetails.status?.id || '1'}
                              onChange={e => handleUpdateProjectStatus(Number(e.target.value))}
                              className="w-full max-w-[200px] rounded-lg border border-[#0f281e]/15 bg-[#fbf7f0] px-3 py-1.5 text-xs font-bold text-[#0f281e] outline-none transition-all focus:border-[#c4864b] cursor-pointer shadow-sm"
                            >
                              {projectStatuses.map(s => (
                                <option key={s.id} value={String(s.id)}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#0f281e]/40">Schedule</span>
                          <p className="mt-1 text-sm font-semibold text-[#0f281e]/75">
                            {selectedProjectForDetails.start_date} → {selectedProjectForDetails.end_date}
                          </p>
                        </div>
                      </div>
                      {/* Project Users Section headings */}
                      <div className="space-y-2.5 pt-3 border-t border-[#0f281e]/5 text-left">
                        {/* 1st Heading: Assign Users */}
                        <button
                          type="button"
                          onClick={() => setSidecarMode(sidecarMode === 'assign' ? null : 'assign')}
                          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-[#0f281e]/5 bg-[#fbf7f0]/40 hover:bg-[#fbf7f0]/80 transition-all text-left outline-none group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 text-[#0f281e]">
                            <UserPlus className="h-4.5 w-4.5 text-[#c4864b]" />
                            <span className="font-serif text-base font-semibold">Assign Users to Project</span>
                          </div>
                          <motion.span
                            animate={{ rotate: sidecarMode === 'assign' ? 90 : 0 }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                            className="text-[#c4864b]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.span>
                        </button>

                        {/* 2nd Heading: View Assigned Users */}
                        <button
                          type="button"
                          onClick={() => setSidecarMode(sidecarMode === 'view' ? null : 'view')}
                          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-[#0f281e]/5 bg-[#fbf7f0]/40 hover:bg-[#fbf7f0]/80 transition-all text-left outline-none group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 text-[#0f281e]">
                            <HardHat className="h-4.5 w-4.5 text-[#c4864b]" />
                            <span className="font-serif text-base font-semibold">View Assigned Crew</span>
                            <span className="bg-[#c4864b]/10 text-[#c4864b] px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                              {projectUsers.length > 0 ? projectUsers.length : (selectedProjectForDetails?.members_count ?? 0)}
                            </span>
                          </div>
                          <motion.span
                            animate={{ rotate: sidecarMode === 'view' ? 90 : 0 }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                            className="text-[#c4864b]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.span>
                        </button>

                        {/* 3rd Heading: Project Milestones */}
                        <button
                          type="button"
                          onClick={() => setSidecarMode(sidecarMode === 'milestones' ? null : 'milestones')}
                          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-[#0f281e]/5 bg-[#fbf7f0]/40 hover:bg-[#fbf7f0]/80 transition-all text-left outline-none group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 text-[#0f281e]">
                            <Flag className="h-4.5 w-4.5 text-[#c4864b]" />
                            <span className="font-serif text-base font-semibold">Project Milestones</span>
                            <span className="bg-[#c4864b]/10 text-[#c4864b] px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider">
                              {milestonesList.length > 0 ? milestonesList.length : (selectedProjectForDetails?.milestones_count ?? 0)}
                            </span>
                          </div>
                          <motion.span
                            animate={{ rotate: sidecarMode === 'milestones' ? 90 : 0 }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
                            className="text-[#c4864b]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.span>
                        </button>
                      </div>

                      {/* Read-Only Action Footer */}
                      <div className="flex flex-col gap-2.5 border-t border-[#0f281e]/5 pt-3.5 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(selectedProjectForDetails.id)}
                          className="flex-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Project
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProject(true)}
                          className="flex-[1.35] rounded-xl bg-[#0f281e] hover:bg-[#c4864b] text-[#dec099] hover:text-white py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#0f281e]/50">
                Failed to load project details. Please close and try again.
              </div>
            )}
          </motion.div>

          {/* THE BRIDGE */}
          <AnimatePresence>
            {sidecarMode && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                className="hidden lg:flex items-center justify-center w-12 shrink-0 relative z-0 origin-left"
              >
                <div className="h-0.5 bg-gradient-to-r from-[#c4864b] via-[#dec099] to-[#0f281e] w-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0f281e] border-2 border-[#c4864b] flex items-center justify-center shadow-lg">
                    <ChevronRight className="w-3.5 h-3.5 text-[#dec099] animate-pulse" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT SIDE CAR CARD - STAFF DIRECTORY & CREW VIEW */}
          <AnimatePresence mode="wait">
            {sidecarMode && (
              <motion.div
                key={sidecarMode}
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.97 }}
                transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                className="w-full lg:max-w-sm bg-[#0f281e] border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden text-left flex flex-col lg:self-stretch shrink-0"
              >
                {/* Header */}
                <div className="relative overflow-hidden bg-[var(--brand-gradient)] px-6 py-6 text-white border-b border-white/10 shadow-lg">
                  <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                  <h3 className="font-serif text-xl font-semibold text-white">
                    {sidecarMode === 'assign' ? 'Staff Roster' : sidecarMode === 'view' ? 'Assigned Crew' : 'Milestones'}
                  </h3>
                  <p className="text-[10px] text-[#dec099] mt-1 uppercase tracking-wider font-black">
                    {sidecarMode === 'assign' 
                      ? 'Assign new crew members' 
                      : sidecarMode === 'view' 
                        ? `Active Members (${projectUsers.length})` 
                        : `Project Milestones (${milestonesList.length})`}
                  </p>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-3 max-h-[50vh] lg:max-h-[60vh] custom-scrollbar">
                  {sidecarMode === 'milestones' && (
                    <button
                      type="button"
                      onClick={handleOpenAddMilestone}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#dec099]/30 bg-[#c4864b]/15 hover:bg-[#c4864b]/30 text-[#dec099] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all mb-2 cursor-pointer outline-none border-dashed"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Milestone
                    </button>
                  )}

                  {loadingMilestones ? (
                    <div className="text-center py-12 text-xs text-[#dec099] animate-pulse">
                      Loading milestones...
                    </div>
                  ) : sidecarMode === 'milestones' ? (
                    milestonesList.map((m: any) => {
                      const statusColor = m.status?.code === 'completed' 
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                        : m.status?.code === 'in_progress'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-white/10 bg-white/5 text-white/50';

                      return (
                        <div key={m.id} className="p-3.5 rounded-xl border border-white/5 bg-black/30 hover:bg-black/50 transition-all space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono text-[#dec099]/70 bg-white/5 px-1.5 py-0.5 rounded">
                                  {m.code}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
                                  {m.status?.label || 'Not Started'}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-white mt-1.5">{m.name}</h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditMilestone(m)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#c4864b] hover:text-white text-white/70 transition-all cursor-pointer border-0"
                                title="Edit Milestone"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-950/45 hover:bg-red-600 hover:text-white text-red-400 transition-all cursor-pointer border-0"
                                title="Delete Milestone"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          {m.description && (
                            <p className="text-[10px] text-white/55 leading-relaxed">{m.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/5 pt-2">
                            <div>
                              <span className="text-white/30 uppercase font-black tracking-wider block">Planned Date</span>
                              <span className="text-white/80 font-medium font-mono">{m.planned_date || '-'}</span>
                            </div>
                            <div>
                              <span className="text-white/30 uppercase font-black tracking-wider block">Phase</span>
                              <span className="text-[#dec099] font-medium">{m.phase?.label || '-'}</span>
                            </div>
                          </div>

                          {m.is_payment_milestone && (
                            <div className="flex items-center gap-1.5 text-[9px] bg-amber-500/10 border border-amber-500/20 text-[#dec099] px-2.5 py-1 rounded-lg w-fit font-bold">
                              <DollarSign className="w-3 w-3 text-amber-500" />
                              <span>Payment: ${Number(m.payment_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : sidecarMode === 'assign' ? (
                    allStaffList.map(u => {
                      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed';
                      const isAlreadyAssigned = projectUsers.some((pu: any) => pu.user?.id === u.id);

                      return (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/30 hover:bg-black/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10 flex items-center justify-center text-xs font-bold text-[#dec099]">
                              {u.picture_url || u.avatar ? (
                                <img
                                  src={getSecureImageUrl(u.picture_url || u.avatar)}
                                  alt={fullName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span>{fullName.substring(0, 1)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{fullName}</p>
                              <p className="text-[9px] text-[#dec099]/70 font-mono mt-0.5 truncate">{u.email}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(u.roles || []).map((r: string) => (
                                  <span key={r} className="rounded bg-white/10 text-white/70 px-1 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                      {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {isAlreadyAssigned ? (
                            <span className="flex h-7 px-2.5 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" />
                              Added
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickAssignUser(u.id)}
                              className="flex h-7 px-3 items-center gap-1.5 rounded-lg bg-[#c4864b] hover:bg-[#b5773f] text-white text-[9px] font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer border-0"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* View mode */
                    projectUsers.map((item: any) => {
                      const u = item.user;
                      const userRoles = item.roles?.map((r: any) => r.role?.name).join(', ') || 'No Role Assigned';

                      return (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/30 hover:bg-black/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10 flex items-center justify-center text-xs font-bold text-[#dec099]">
                              {u.picture_url || u.avatar ? (
                                <img
                                  src={getSecureImageUrl(u.picture_url || u.avatar)}
                                  alt={`${u.first_name || ''} ${u.last_name || ''}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span>{(u.first_name || 'U').substring(0, 1)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{u.first_name} {u.last_name}</p>
                              <p className="text-[9px] text-[#dec099]/70 font-mono mt-0.5 truncate">{u.email}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <span className="rounded bg-[#c4864b]/20 text-[#dec099] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                  {userRoles}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveUserFromProject(u)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-950 bg-red-950/45 text-red-400 hover:bg-red-900 hover:text-white transition-colors shrink-0 cursor-pointer"
                            title="Remove user from project"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {sidecarMode === 'assign' && allStaffList.length === 0 && (
                    <div className="text-center py-8 text-xs text-white/30 font-medium">
                      No available users found.
                    </div>
                  )}

                  {sidecarMode === 'view' && projectUsers.length === 0 && (
                    <div className="text-center py-8 text-xs text-white/30 font-medium">
                      No crew members assigned to this project.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )}

      {/* Amazing Deletion Confirmation Popup */}
      <AnimatePresence>
        {milestoneToDelete !== null && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Cancel deletion"
              onClick={() => setMilestoneToDelete(null)}
              className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-[#0f281e]/10 bg-white p-8 text-center shadow-2xl"
            >
              {/* Graphic Icon Header */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
                <Trash2 className="h-10 w-10 animate-bounce" />
              </div>

              {/* Title & Body */}
              <h3 className="font-serif text-3xl font-normal text-[#0f281e] tracking-tight">
                Delete Milestone?
              </h3>
              <p className="mt-3 text-sm text-[#0f281e]/60 leading-relaxed px-4">
                You are about to permanently remove this milestone. This action is irreversible and may affect dependent tasks.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setMilestoneToDelete(null)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3.5 text-xs font-black uppercase tracking-wider text-[#0f281e]/50 hover:bg-[#0f281e]/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMilestone}
                  className="flex-[1.2] rounded-xl bg-red-500 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REMOVE CREW MEMBER CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToRemove && (
          <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
            <button
              type="button"
              onClick={() => !isRemovingUser && setUserToRemove(null)}
              className="absolute inset-0 h-full w-full cursor-default bg-transparent border-0"
              aria-label="Close modal"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl p-6 sm:p-8 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200/70 text-red-500 shadow-md">
                <UserMinus className="h-8 w-8 text-red-600" />
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                  Revoke Access
                </span>
                <h3 className="mt-3 font-serif text-2xl font-bold text-[#0f281e]">Remove Crew Member?</h3>
                <p className="mt-2 text-xs text-[#0f281e]/60 leading-relaxed font-medium">
                  Are you sure you want to remove <span className="font-bold text-[#0f281e]">{userToRemove.first_name ? `${userToRemove.first_name} ${userToRemove.last_name || ''}`.trim() : (userToRemove.name || userToRemove.email)}</span> from <span className="font-bold text-[#0f281e]">{selectedProjectForDetails?.name || 'this project'}</span>?
                </p>
              </div>

              {/* User preview snippet */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#0f281e]/10 bg-[#fbf7f0] p-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f281e] text-[#dec099] font-bold text-xs uppercase overflow-hidden border border-[#c4864b]/30">
                  {userToRemove.avatar ? (
                    <img src={getSecureImageUrl(userToRemove.avatar)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{(userToRemove.first_name || userToRemove.name || 'U').substring(0, 1)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#0f281e] truncate">
                    {userToRemove.first_name ? `${userToRemove.first_name} ${userToRemove.last_name || ''}`.trim() : (userToRemove.name || 'Crew Member')}
                  </p>
                  <p className="text-[10px] text-[#0f281e]/60 font-mono truncate">{userToRemove.email || 'N/A'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isRemovingUser}
                  onClick={() => setUserToRemove(null)}
                  className="flex-1 rounded-xl border border-[#0f281e]/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#0f281e]/60 transition-colors hover:bg-[#0f281e]/5 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRemovingUser}
                  onClick={confirmRemoveUser}
                  className="flex-[1.4] rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isRemovingUser ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Removing...
                    </>
                  ) : (
                    'Remove Member'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
