import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { 
  Lock, LogOut, Save, Eye, Upload, RefreshCw,
  User, Briefcase, Code, Mail,
  CheckCircle, AlertCircle, Search,
  Image, Calendar, Plus, Edit, Trash2, ExternalLink, Github,
  X, GripVertical, ArrowUp, ArrowDown,
  Reply, Copy, Download, Filter, SortAsc, SortDesc,
  CheckSquare, Square, MoreVertical, Archive, Star
} from "lucide-react";

interface PortfolioContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  aboutText: string;
  skillsList: string;
  projectsList: string;
  profileImage: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>({
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    aboutText: "",
    skillsList: "",
    projectsList: "",
    profileImage: "",
  });
  const [activeTab, setActiveTab] = useState("content");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Project management state
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    image: "",
    technologies: "",
    githubUrl: "",
    demoUrl: ""
  });
  const [imageUploadMode, setImageUploadMode] = useState<"url" | "upload">("url");
  const [editImageUploadMode, setEditImageUploadMode] = useState<"url" | "upload">("url");
  
  // Skills management state
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  // Messages management state
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [messageFilter, setMessageFilter] = useState<"all" | "recent" | "unread">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin status
  const { data: adminStatus } = useQuery({
    queryKey: ["/api/admin/status"],
    retry: false,
  });

  // Get portfolio content
  const { data: portfolioContent, isLoading: contentLoading } = useQuery({
  queryKey: ["/api/portfolio-content"],
    enabled: isLoggedIn,
  });

  // Get contact messages
  const { data: contactMessages, isLoading: contactsLoading } = useQuery({
  queryKey: ["/api/contacts"],
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if ((adminStatus as any)?.isAdmin) {
      setIsLoggedIn(true);
    }
  }, [adminStatus]);

  useEffect(() => {
    if (portfolioContent && isLoggedIn) {
      const newContent = {
        heroTitle: (portfolioContent as any).heroTitle || "",
        heroSubtitle: (portfolioContent as any).heroSubtitle || "",
        heroDescription: (portfolioContent as any).heroDescription || "",
        aboutText: (portfolioContent as any).aboutText || "",
        skillsList: (portfolioContent as any).skillsList || "",
        projectsList: (portfolioContent as any).projectsList || "",
        profileImage: (portfolioContent as any).profileImage || "",
      };
      setContent(newContent);
      
      // Parse projects from JSON
      try {
        const parsedProjects = JSON.parse((portfolioContent as any).projectsList || "[]");
        setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
      } catch (error) {
        setProjects([]);
      }
      
      // Parse skills from JSON
      try {
        const parsedSkills = JSON.parse((portfolioContent as any).skillsList || "[]");
        setSkills(Array.isArray(parsedSkills) ? parsedSkills : []);
      } catch (error) {
        setSkills([]);
      }
      
      setHasUnsavedChanges(false);
    }
  }, [portfolioContent, isLoggedIn]);



  // Admin login
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/admin/login", { password });
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-content"] });
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid admin password",
        variant: "destructive",
      });
    },
  });

  // Admin logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout", {});
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(false);
      setPassword("");
      toast({
        title: "Logged out",
        description: "Successfully logged out of admin panel",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
    },
  });

  // Update portfolio content
  const updateMutation = useMutation({
    mutationFn: async (updatedContent: PortfolioContent) => {
      const response = await apiRequest("POST", "/api/admin/portfolio-content", updatedContent);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "Portfolio content has been updated successfully",
      });
      // Force refresh all portfolio content queries
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio-content"] });
      queryClient.refetchQueries({ queryKey: ["/api/portfolio-content"] });
      
      // Also trigger a window focus event to refresh other tabs/windows
      setTimeout(() => {
        window.dispatchEvent(new Event('focus'));
      }, 100);
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update portfolio content",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSave = () => {
    enhancedSave();
  };

  const handleInputChange = (field: keyof PortfolioContent, value: string) => {
  setContent(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Enhanced save functionality
  const enhancedSave = () => {
    // Validate JSON fields before saving
    let projectsToSave = content.projectsList;
    let skillsToSave = content.skillsList;
    
    // Try to fix and validate projects JSON
    try {
      const parsedProjects = JSON.parse(projectsToSave);
      // Ensure it's an array
      if (!Array.isArray(parsedProjects)) {
        projectsToSave = JSON.stringify([parsedProjects]);
      } else {
        projectsToSave = JSON.stringify(parsedProjects);
      }
    } catch (error) {
      toast({
        title: "Invalid Projects JSON",
        description: `Projects JSON error: ${(error as Error).message}. Please check your JSON format.`,
        variant: "destructive",
      });
      return;
    }
    
    // Try to fix and validate skills JSON
    try {
      const parsedSkills = JSON.parse(skillsToSave);
      // Ensure it's an array
      if (!Array.isArray(parsedSkills)) {
        skillsToSave = JSON.stringify([parsedSkills]);
      } else {
        skillsToSave = JSON.stringify(parsedSkills);
      }
    } catch (error) {
      toast({
        title: "Invalid Skills JSON", 
        description: `Skills JSON error: ${(error as Error).message}. Please check your JSON format.`,
        variant: "destructive",
      });
      return;
    }

    // Create updated content with validated JSON
    const updatedContent = {
      ...content,
      projectsList: projectsToSave,
      skillsList: skillsToSave,
    };
    
    updateMutation.mutate(updatedContent);
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  };



  // Project management functions
  const addProject = () => {
    if (!newProject.title || !newProject.description) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title and description",
        variant: "destructive",
      });
      return;
    }

    const projectToAdd = {
      ...newProject,
      technologies: newProject.technologies ? newProject.technologies.split(',').map(t => t.trim()) : [],
    };

    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);
    updateProjectsList(updatedProjects);
    
    setNewProject({
      title: "",
      description: "",
      image: "",
      technologies: "",
      githubUrl: "",
      demoUrl: ""
    });
    setIsAddingProject(false);
    
    toast({
      title: "Project added",
      description: "New project has been added successfully",
    });
  };

  const editProject = (index: number) => {
    const project = projects[index];
    setEditingProject({
      ...project,
      index,
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || ""
    });
  };

  const saveProject = () => {
    if (!editingProject.title || !editingProject.description) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the title and description",
        variant: "destructive",
      });
      return;
    }

    const updatedProject = {
      ...editingProject,
      technologies: editingProject.technologies ? editingProject.technologies.split(',').map((t: string) => t.trim()) : [],
    };

    const updatedProjects = [...projects];
    updatedProjects[editingProject.index] = updatedProject;
    setProjects(updatedProjects);
    updateProjectsList(updatedProjects);
    setEditingProject(null);
    
    toast({
      title: "Project updated",
      description: "Project has been updated successfully",
    });
  };

  const deleteProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    updateProjectsList(updatedProjects);
    
    toast({
      title: "Project deleted",
      description: "Project has been removed successfully",
    });
  };

  const updateProjectsList = (updatedProjects: any[]) => {
    const projectsJSON = JSON.stringify(updatedProjects);
    setContent(prev => ({ ...prev, projectsList: projectsJSON }));
    setHasUnsavedChanges(true);
  }

  // Skills management functions
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      updateSkillsList(updatedSkills);
      setNewSkill("");
      toast({
        title: "Skill added",
        description: `${newSkill.trim()} has been added to your skills`,
      });
    } else if (skills.includes(newSkill.trim())) {
      toast({
        title: "Duplicate skill",
        description: "This skill already exists",
        variant: "destructive",
      });
    }
  };

  const removeSkill = (index: number) => {
    const skillToRemove = skills[index];
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    updateSkillsList(updatedSkills);
    toast({
      title: "Skill removed",
      description: `${skillToRemove} has been removed from your skills`,
    });
  };

  const moveSkill = (fromIndex: number, toIndex: number) => {
    const updatedSkills = [...skills];
    const [movedSkill] = updatedSkills.splice(fromIndex, 1);
    updatedSkills.splice(toIndex, 0, movedSkill);
    setSkills(updatedSkills);
    updateSkillsList(updatedSkills);
  };

  const updateSkillsList = (updatedSkills: string[]) => {
    const skillsJson = JSON.stringify(updatedSkills);
    setContent(prev => ({ ...prev, skillsList: skillsJson }));
    setHasUnsavedChanges(true);
  };

  // Message management functions
  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    if (filteredMessages.length === 0) return;
    const allIds = new Set(filteredMessages.map((msg: any) => msg.id));
    setSelectedMessages(allIds);
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
  };

  const copyMessageToClipboard = (message: any) => {
    const text = `Name: ${message.name}\nEmail: ${message.email}\nDate: ${new Date(message.createdAt).toLocaleString()}\nMessage: ${message.message}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Message details have been copied",
    });
  };

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Email copied",
      description: `${email} has been copied to clipboard`,
    });
  };

  const exportMessages = () => {
    if (!contactMessages || !Array.isArray(contactMessages)) return;
    
    const csvContent = [
      "Name,Email,Message,Date",
      ...contactMessages.map((msg: any) => 
        `"${msg.name}","${msg.email}","${msg.message.replace(/"/g, '""')}","${new Date(msg.createdAt).toLocaleString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Messages have been exported to CSV",
    });
  };

  // Project image handling functions
  const handleProjectImageUpload = (file: File, isEdit: boolean = false) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      if (isEdit && editingProject) {
        setEditingProject((prev: any) => ({ ...prev, image: base64String }));
      } else {
        setNewProject((prev: any) => ({ ...prev, image: base64String }));
      }
      
      toast({
        title: "Image uploaded",
        description: "Image has been successfully uploaded",
      });
    };
    reader.readAsDataURL(file);
  };

  // Enhanced search and filter functionality
  const filteredMessages = contactMessages && Array.isArray(contactMessages) 
    ? contactMessages
        .filter((message: any) => {
          // Search filter
          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            return (
              message.name.toLowerCase().includes(searchLower) ||
              message.email.toLowerCase().includes(searchLower) ||
              message.message.toLowerCase().includes(searchLower)
            );
          }
          return true;
        })
        .filter((message: any) => {
          // Date filter
          if (messageFilter === "recent") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(message.createdAt) > weekAgo;
          }
          return true;
        })
        .sort((a: any, b: any) => {
          // Sort by date
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        })
    : [];



  const goToPortfolio = () => {
    window.location.href = "/";
  };

  // Handle file upload for profile image
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setContent((prev: any) => ({ ...prev, profileImage: base64String }));
        setHasUnsavedChanges(true);
        toast({
          title: "Image uploaded",
          description: "Profile image has been updated. Click Save to apply changes.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setContent(prev => ({ ...prev, profileImage: "" }));
    setHasUnsavedChanges(true);
    toast({
      title: "Image removed",
      description: "Profile image has been removed. Click Save to apply changes.",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Panel</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter admin password to manage portfolio content
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Admin Panel</h1>
            <div className="flex items-center gap-4 mt-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved Changes
                </Badge>
              )}
              {lastSaved && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={goToPortfolio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Portfolio
            </Button>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>



        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Messages
              {Array.isArray(contactMessages) && contactMessages.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {contactMessages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {contentLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading content...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hero Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Hero Section
                    </CardTitle>
                    <CardDescription>Main introduction content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="heroTitle">Name/Title</Label>
                      <Input
                        id="heroTitle"
                        value={content.heroTitle}
                        onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                        placeholder="Your name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroSubtitle">Subtitle</Label>
                      <Input
                        id="heroSubtitle"
                        value={content.heroSubtitle}
                        onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                        placeholder="Your role/profession"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroDescription">Description</Label>
                      <Textarea
                        id="heroDescription"
                        value={content.heroDescription}
                        onChange={(e) => handleInputChange("heroDescription", e.target.value)}
                        placeholder="Brief introduction about yourself"
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* About & Skills Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Skills & About
                    </CardTitle>
                    <CardDescription>Skills section content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="aboutText">About Text</Label>
                      <Textarea
                        id="aboutText"
                        value={content.aboutText}
                        onChange={(e) => handleInputChange("aboutText", e.target.value)}
                        placeholder="Description for your skills section"
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skillsManagement">Skills Management</Label>
                      <div className="mt-2 space-y-4">
                        {/* Add new skill */}
                        <div className="flex gap-2">
                          <Input
                            id="newSkill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Enter a new skill (e.g., React)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button 
                            onClick={addSkill}
                            disabled={!newSkill.trim()}
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </Button>
                        </div>

                        {/* Skills list */}
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 mb-2">
                            Current Skills ({skills.length}):
                          </div>
                          {skills.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                              {skills.map((skill, index) => (
                                <div
                                  key={`${skill}-${index}`}
                                  className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 group hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSkill(index, Math.max(0, index - 1))}
                                        disabled={index === 0}
                                        className="h-4 w-6 p-0 opacity-50 hover:opacity-100"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSkill(index, Math.min(skills.length - 1, index + 1))}
                                        disabled={index === skills.length - 1}
                                        className="h-4 w-6 p-0 opacity-50 hover:opacity-100"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {skill}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSkill(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Code className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No skills added yet</p>
                              <p className="text-xs mt-1">Add your first skill above</p>
                            </div>
                          )}
                        </div>

                        {/* JSON preview (collapsible) */}
                        <details className="mt-4">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View JSON Format
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 border rounded text-xs font-mono text-gray-600">
                            {JSON.stringify(skills)}
                          </div>
                        </details>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Image Section */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Profile Image
                    </CardTitle>
                    <CardDescription>Upload and manage your profile picture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Current Image Preview */}
                      <div className="flex-1">
                        <Label>Current Profile Image</Label>
                        <div className="mt-2 flex justify-center">
                          {content.profileImage ? (
                            <div className="relative">
                              <img
                                src={content.profileImage}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={removeProfileImage}
                                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                                title="Remove image"
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1">
                        <Label>Upload New Image</Label>
                        <div className="mt-2 space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              className="hidden"
                              id="profileImageUpload"
                            />
                            <label
                              htmlFor="profileImageUpload"
                              className="cursor-pointer"
                            >
                              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload an image
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </label>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('profileImageUpload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Project List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Portfolio Projects
                      <Badge variant="secondary">{projects.length} total</Badge>
                    </CardTitle>
                    <CardDescription>Manage your portfolio projects with an easy interface</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsAddingProject(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contentLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading projects...
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project, index) => (
                      <Card key={index} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          {project.image && (
                            <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                              <img 
                                src={project.image} 
                                alt={project.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                          
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map((tech: string, techIndex: number) => (
                                <Badge key={techIndex} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {project.githubUrl && project.githubUrl !== "#" && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                    <Github className="w-3 h-3 mr-1" />
                                    Code
                                  </a>
                                </Button>
                              )}
                              {project.demoUrl && project.demoUrl !== "#" && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => editProject(index)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteProject(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Start building your portfolio by adding your first project</p>
                    <Button onClick={() => setIsAddingProject(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Project Form */}
            {isAddingProject && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Project</CardTitle>
                  <CardDescription>Fill in the project details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newProjectTitle">Project Title *</Label>
                      <Input
                        id="newProjectTitle"
                        value={newProject.title}
                        onChange={(e) => setNewProject((prev: any) => ({ ...prev, title: e.target.value }))}
                        placeholder="My Awesome Project"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Project Image</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={imageUploadMode === "url" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setImageUploadMode("url")}
                          >
                            Image URL
                          </Button>
                          <Button
                            type="button"
                            variant={imageUploadMode === "upload" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setImageUploadMode("upload")}
                          >
                            Upload File
                          </Button>
                        </div>
                        
                        {imageUploadMode === "url" ? (
                          <Input
                            id="newProjectImage"
                            value={newProject.image}
                            onChange={(e) => setNewProject((prev: any) => ({ ...prev, image: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                          />
                        ) : (
                          <div>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleProjectImageUpload(file, false);
                                }
                              }}
                              className="mb-2"
                            />
                            {newProject.image && (
                              <div className="mt-2">
                                <img 
                                  src={newProject.image} 
                                  alt="Preview" 
                                  className="w-32 h-20 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="newProjectDescription">Description *</Label>
                    <Textarea
                      id="newProjectDescription"
                      value={newProject.description}
                      onChange={(e) => setNewProject((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your project..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newProjectTech">Technologies</Label>
                    <Input
                      id="newProjectTech"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject((prev: any) => ({ ...prev, technologies: e.target.value }))}
                      placeholder="React, Node.js, MongoDB (separate with commas)"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newProjectGithub">GitHub URL</Label>
                      <Input
                        id="newProjectGithub"
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject((prev: any) => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/repo"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newProjectDemo">Demo URL</Label>
                      <Input
                        id="newProjectDemo"
                        value={newProject.demoUrl}
                        onChange={(e) => setNewProject((prev: any) => ({ ...prev, demoUrl: e.target.value }))}
                        placeholder="https://myproject.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingProject(false);
                        setNewProject({
                          title: "",
                          description: "",
                          image: "",
                          technologies: "",
                          githubUrl: "",
                          demoUrl: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Project Form */}
            {editingProject && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Project</CardTitle>
                  <CardDescription>Update project details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editProjectTitle">Project Title *</Label>
                      <Input
                        id="editProjectTitle"
                        value={editingProject.title}
                        onChange={(e) => setEditingProject((prev: any) => ({ ...prev, title: e.target.value }))}
                        placeholder="My Awesome Project"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Project Image</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={editImageUploadMode === "url" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditImageUploadMode("url")}
                          >
                            Image URL
                          </Button>
                          <Button
                            type="button"
                            variant={editImageUploadMode === "upload" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditImageUploadMode("upload")}
                          >
                            Upload File
                          </Button>
                        </div>
                        
                        {editImageUploadMode === "url" ? (
                          <Input
                            id="editProjectImage"
                            value={editingProject.image}
                            onChange={(e) => setEditingProject((prev: any) => ({ ...prev, image: e.target.value }))}
                            placeholder="https://example.com/image.jpg"
                          />
                        ) : (
                          <div>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleProjectImageUpload(file, true);
                                }
                              }}
                              className="mb-2"
                            />
                            {editingProject.image && (
                              <div className="mt-2">
                                <img 
                                  src={editingProject.image} 
                                  alt="Preview" 
                                  className="w-32 h-20 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="editProjectDescription">Description *</Label>
                    <Textarea
                      id="editProjectDescription"
                      value={editingProject.description}
                      onChange={(e) => setEditingProject((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your project..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editProjectTech">Technologies</Label>
                    <Input
                      id="editProjectTech"
                      value={editingProject.technologies}
                      onChange={(e) => setEditingProject((prev: any) => ({ ...prev, technologies: e.target.value }))}
                      placeholder="React, Node.js, MongoDB (separate with commas)"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editProjectGithub">GitHub URL</Label>
                      <Input
                        id="editProjectGithub"
                        value={editingProject.githubUrl}
                        onChange={(e) => setEditingProject((prev: any) => ({ ...prev, githubUrl: e.target.value }))}
                        placeholder="https://github.com/username/repo"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editProjectDemo">Demo URL</Label>
                      <Input
                        id="editProjectDemo"
                        value={editingProject.demoUrl}
                        onChange={(e) => setEditingProject((prev: any) => ({ ...prev, demoUrl: e.target.value }))}
                        placeholder="https://myproject.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProject(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveProject}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Messages
                      {Array.isArray(contactMessages) && (
                        <Badge variant="secondary">{contactMessages.length} total</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Messages received through your portfolio contact form</CardDescription>
                  </div>
                  
                  {Array.isArray(contactMessages) && contactMessages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportMessages}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </Button>
                      {selectedMessages.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Clear ({selectedMessages.size})
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Enhanced Controls */}
                {Array.isArray(contactMessages) && contactMessages.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search messages by name, email, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filters and Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <select
                            aria-label="Filter messages"
                            value={messageFilter}
                            onChange={(e) => setMessageFilter(e.target.value as any)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="all">All Messages</option>
                            <option value="recent">Recent (7 days)</option>
                          </select>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                          className="flex items-center gap-1"
                        >
                          {sortOrder === "newest" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                        </Button>
                      </div>

                      {filteredMessages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectedMessages.size === filteredMessages.length ? clearSelection : selectAllMessages}
                            className="flex items-center gap-1"
                          >
                            {selectedMessages.size === filteredMessages.length ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                            {selectedMessages.size === filteredMessages.length ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Results Summary */}
                    <div className="text-sm text-gray-600">
                      Showing {filteredMessages.length} of {(contactMessages as any[]).length} messages
                      {searchQuery && ` for "${searchQuery}"`}
                      {messageFilter !== "all" && ` (${messageFilter})`}
                    </div>
                  </div>
                )}

                {contactsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading messages...
                  </div>
                ) : filteredMessages.length > 0 ? (
                  <div className="space-y-4">
                    {filteredMessages.map((message: any, index: number) => (
                      <Card 
                        key={message.id} 
                        className={`border-l-4 border-l-blue-500 hover:shadow-md transition-all ${
                          selectedMessages.has(message.id) ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-start gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMessageSelection(message.id)}
                                className="mt-1 p-1 h-auto"
                              >
                                {selectedMessages.has(message.id) ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                              <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  {message.name}
                                  <Badge variant="outline" className="text-xs">
                                    #{(contactMessages as any[]).length - (contactMessages as any[]).findIndex((m: any) => m.id === message.id)}
                                  </Badge>
                                </h4>
                                <button
                                  onClick={() => copyEmailToClipboard(message.email)}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 mt-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  {message.email}
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(message.createdAt).toLocaleDateString()}
                              </Badge>
                              
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyMessageToClipboard(message)}
                                  className="flex items-center gap-1"
                                  title="Copy message details"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-10">
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border-l-2 border-gray-200">
                              {message.message}
                            </p>
                            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                              <span>Received {new Date(message.createdAt).toLocaleString()}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => window.open(`mailto:${message.email}?subject=Re: Portfolio Contact&body=Hi ${message.name},%0A%0A`)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Reply className="w-3 h-3" />
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : contactMessages && Array.isArray(contactMessages) && contactMessages.length > 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search query or filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        setMessageFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-4">Contact form submissions will appear here</p>
                    <p className="text-sm text-gray-500">Users can reach you through the contact form on your portfolio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>






        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || (!hasUnsavedChanges && !updateMutation.isPending)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "All Changes Saved"}
          </Button>
        </div>
      </div>
    </div>
  );
}