import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Sprout, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  ArrowLeft,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Package,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_ENVIRONMENT_INFO } from './data';
import { iconMap } from './icons';
import { useApp } from './context/AppContext';
import { FormativeEnvironment, Activity, Spreadsheet, Task, EnvironmentType, Notice, NoticeImportance, EnvironmentEvent } from './types';

const ENV_TYPE_STYLES: Record<EnvironmentType, { icon: string; color: string }> = {
  animal: { icon: 'Bird', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  vegetal: { icon: 'Leaf', color: 'bg-green-100 text-green-700 border-green-200' },
  maquinaria: { icon: 'Settings', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  otro: { icon: 'HelpCircle', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const EVENT_ICON_COLORS = [
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
];

const formatEventDateTime = (eventAt: string) => {
  const date = new Date(eventAt);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const time = format(date, 'HH:mm');
  if (isToday) return `Hoy, ${time}`;
  if (isTomorrow) return `Mañana, ${time}`;
  return format(date, "EEE d MMM, HH:mm", { locale: es });
};

const toLocalDateInput = (iso: string) => format(new Date(iso), 'yyyy-MM-dd');
const toLocalTimeInput = (iso: string) => format(new Date(iso), 'HH:mm');

// --- Components ---

const Navbar = () => (
  <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <Sprout className="h-6 w-6" />
          <span>AgrariaConnect</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="transition-colors hover:text-green-600">Inicio</Link>
        <Link to="/" className="transition-colors hover:text-green-600">Entornos</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-[200px] pl-8 md:w-[300px]"
          />
        </div>
      </div>
    </div>
  </nav>
);

const EnvironmentCard = ({
  env,
  onEdit,
  onDelete,
}: {
  env: FormativeEnvironment;
  onEdit?: (env: FormativeEnvironment) => void;
  onDelete?: (env: FormativeEnvironment) => void;
  key?: string;
}) => {
  const Icon = (iconMap as any)[env.icon] || iconMap.HelpCircle;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden border-2 hover:border-green-500 transition-colors relative group">
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 shadow-sm"
                onClick={() => onEdit(env)}
                aria-label="Editar entorno"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 shadow-sm text-red-600 hover:text-red-700"
                onClick={() => onDelete(env)}
                aria-label="Eliminar entorno"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <Link to={`/entorno/${env.id}`} className="block">
          <CardHeader className={`${env.color} border-b`}>
            <div className="flex items-center justify-between">
              <Icon className="h-8 w-8" />
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                {env.type === 'animal' ? 'Producción Animal' : env.type === 'vegetal' ? 'Producción Vegetal' : 'Maquinaria'}
              </Badge>
            </div>
            <CardTitle className="mt-4 text-2xl">{env.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-muted-foreground text-sm line-clamp-2">
              {env.description}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>12 Actividades</span>
            </div>
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              <span>3 Planillas</span>
            </div>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
};

const ActivityItem = ({
  activity,
  onUpdate,
  onDelete,
  onComplete,
  onUncomplete,
}: {
  activity: Activity;
  onUpdate: (
    id: string,
    updates: Pick<Activity, 'title' | 'content' | 'author'>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onComplete: (id: string, completedBy: string, durationMinutes: number) => void;
  onUncomplete: (id: string) => void;
  key?: string;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completedBy, setCompletedBy] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [editTitle, setEditTitle] = useState(activity.title);
  const [editContent, setEditContent] = useState(activity.content);
  const [editAuthor, setEditAuthor] = useState(activity.author);
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setEditTitle(activity.title);
    setEditContent(activity.content);
    setEditAuthor(activity.author);
    setEditOpen(true);
  };

  const handleCircleClick = () => {
    if (activity.completed) {
      onUncomplete(activity.id);
      return;
    }
    setCompletedBy('');
    setDurationMinutes('');
    setCompleteOpen(true);
  };

  const handleConfirmComplete = () => {
    const duration = parseInt(durationMinutes, 10);
    if (!completedBy.trim() || !duration || duration <= 0) return;
    onComplete(activity.id, completedBy.trim(), duration);
    setCompleteOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    try {
      await onUpdate(activity.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        author: editAuthor.trim() || 'Usuario Actual',
      });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete(activity.id);
      setDeleteOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className={`mb-4 overflow-hidden border-l-4 ${activity.completed ? 'border-l-slate-300 opacity-80' : 'border-l-green-600'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCircleClick}
                className="text-green-600 shrink-0"
                aria-label={activity.completed ? 'Marcar como pendiente' : 'Marcar como hecha'}
              >
                {activity.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                {activity.environmentName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!activity.completed && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openEdit} aria-label="Editar actividad">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Eliminar actividad"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardTitle className={`text-lg mt-1 ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
            {activity.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm whitespace-pre-wrap ${activity.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
            {activity.content}
          </p>
          {activity.completed && activity.completedBy && (
            <p className="text-xs text-muted-foreground mt-2">
              Realizada por {activity.completedBy}
              {activity.durationMinutes != null && ` · ${formatDuration(activity.durationMinutes)}`}
            </p>
          )}
          {activity.imageUrl && (
            <img 
              src={activity.imageUrl} 
              alt={activity.title} 
              className="mt-4 rounded-lg w-full h-48 object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </CardContent>
        <CardFooter className="pt-0 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">{activity.author.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{activity.author}</span>
        </CardFooter>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar actividad</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Realizada por</Label>
              <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editTitle.trim() || !editContent.trim()}
              className="bg-green-700 hover:bg-green-800"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar actividad como hecha</DialogTitle>
            <DialogDescription>
              Registra quién realizó la actividad y cuánto tiempo llevó.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Realizada por</Label>
              <Input
                value={completedBy}
                onChange={(e) => setCompletedBy(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tiempo empleado (minutos)</Label>
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ej: 45"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmComplete} className="bg-green-700 hover:bg-green-800">
              Marcar como hecha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar actividad</DialogTitle>
            <DialogDescription>
              ¿Eliminar &quot;{activity.title}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TaskItem = ({
  task,
  onComplete,
  onUncomplete,
}: {
  task: Task;
  onComplete: (id: string, completedBy: string, durationMinutes: number) => void;
  onUncomplete: (id: string) => void;
  key?: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedBy, setCompletedBy] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  const handleCircleClick = () => {
    if (task.completed) {
      onUncomplete(task.id);
      return;
    }
    setCompletedBy('');
    setDurationMinutes('');
    setDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    const duration = parseInt(durationMinutes, 10);
    if (!completedBy.trim() || !duration || duration <= 0) return;
    onComplete(task.id, completedBy.trim(), duration);
    setDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors mb-2">
        <div className="flex items-center gap-3">
          <button onClick={handleCircleClick} className="text-green-600 shrink-0">
            {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </button>
          <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
            <p className="text-sm font-medium">{task.title}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
              {task.completed && task.completedBy && (
                <span>Por: {task.completedBy}</span>
              )}
              {task.completed && task.durationMinutes != null && (
                <span>Tiempo: {formatDuration(task.durationMinutes)}</span>
              )}
            </div>
          </div>
        </div>
        <Badge variant="outline" className={
          task.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
          task.priority === 'medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
          'text-blue-600 border-blue-200 bg-blue-50'
        }>
          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar tarea</DialogTitle>
            <DialogDescription>
              Registra quién realizó la tarea y cuánto tiempo llevó.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Realizada por</Label>
              <Input
                value={completedBy}
                onChange={(e) => setCompletedBy(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tiempo empleado (minutos)</Label>
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ej: 45"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmComplete} className="bg-green-700 hover:bg-green-800">
              Marcar como terminada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const NoticeItem = ({
  notice,
  environmentName,
  onComplete,
}: {
  notice: Notice;
  environmentName: string;
  onComplete: (id: string) => void;
  key?: string;
}) => (
  <Card
    className={`mb-4 overflow-hidden border-l-4 ${
      notice.importance === 'important' ? 'border-l-red-500' : 'border-l-orange-400'
    }`}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {notice.environmentId && (
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
              {environmentName}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={
              notice.importance === 'important'
                ? 'text-red-600 border-red-200 bg-red-50'
                : 'text-slate-600 border-slate-200 bg-slate-50'
            }
          >
            {notice.importance === 'important' ? 'Importante' : 'Normal'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 shrink-0"
          onClick={() => onComplete(notice.id)}
          aria-label="Marcar aviso como cumplido"
        >
          <CheckCircle2 className="h-5 w-5" />
        </Button>
      </div>
      <CardTitle className="text-lg mt-2">{notice.title}</CardTitle>
    </CardHeader>
    {notice.content && (
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>
      </CardContent>
    )}
  </Card>
);

// --- Pages ---

const Dashboard = () => {
  const {
    notices,
    environments,
    getEnvironmentName,
    loading,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    addNotice,
    completeNotice,
  } = useApp();
  const pendingNotices = notices
    .filter((n) => !n.completed)
    .sort((a, b) => {
      if (a.importance === b.importance) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.importance === 'important' ? -1 : 1;
    });
  const rootEnvironments = environments.filter((e) => !e.parentId);

  const [createEnvOpen, setCreateEnvOpen] = useState(false);
  const [createNoticeOpen, setCreateNoticeOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImportance, setNewNoticeImportance] = useState<NoticeImportance>('normal');
  const [newNoticeEnv, setNewNoticeEnv] = useState<string>('general');
  const [savingNotice, setSavingNotice] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvDesc, setNewEnvDesc] = useState('');
  const [newEnvType, setNewEnvType] = useState<EnvironmentType>('animal');
  const [savingEnv, setSavingEnv] = useState(false);

  const [editEnv, setEditEnv] = useState<FormativeEnvironment | null>(null);
  const [deleteEnv, setDeleteEnv] = useState<FormativeEnvironment | null>(null);

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;
    setSavingEnv(true);
    try {
      const style = ENV_TYPE_STYLES[newEnvType];
      await addEnvironment({
        name: newEnvName.trim(),
        description: newEnvDesc.trim(),
        type: newEnvType,
        icon: style.icon,
        color: style.color,
      });
      setNewEnvName('');
      setNewEnvDesc('');
      setNewEnvType('animal');
      setCreateEnvOpen(false);
    } finally {
      setSavingEnv(false);
    }
  };

  const openEditEnvironment = (env: FormativeEnvironment) => {
    setEditEnv(env);
    setNewEnvName(env.name);
    setNewEnvDesc(env.description);
    setNewEnvType(env.type);
  };

  const handleUpdateEnvironment = async () => {
    if (!editEnv || !newEnvName.trim()) return;
    setSavingEnv(true);
    try {
      const style = ENV_TYPE_STYLES[newEnvType];
      await updateEnvironment(editEnv.id, {
        name: newEnvName.trim(),
        description: newEnvDesc.trim(),
        type: newEnvType,
        icon: style.icon,
        color: style.color,
      });
      setEditEnv(null);
      setNewEnvName('');
      setNewEnvDesc('');
      setNewEnvType('animal');
    } finally {
      setSavingEnv(false);
    }
  };

  const handleDeleteEnvironment = async () => {
    if (!deleteEnv) return;
    setSavingEnv(true);
    try {
      await removeEnvironment(deleteEnv.id);
      setDeleteEnv(null);
    } finally {
      setSavingEnv(false);
    }
  };

  const handlePublishNotice = async () => {
    if (!newNoticeTitle.trim()) return;
    setSavingNotice(true);
    try {
      await addNotice({
        title: newNoticeTitle.trim(),
        content: newNoticeContent.trim(),
        importance: newNoticeImportance,
        environmentId: newNoticeEnv === 'general' ? undefined : newNoticeEnv,
      });
      setNewNoticeTitle('');
      setNewNoticeContent('');
      setNewNoticeImportance('normal');
      setNewNoticeEnv('general');
      setCreateNoticeOpen(false);
    } finally {
      setSavingNotice(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Cargando entornos...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Right Column: Avisos - tareas pendientes */}
        <div className="w-full md:w-96 order-1 md:order-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Avisos</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{pendingNotices.length} pendientes</Badge>
              <Dialog open={createNoticeOpen} onOpenChange={setCreateNoticeOpen}>
                <DialogTrigger asChild>
                  <Button type="button" size="sm" className="bg-green-700 hover:bg-green-800">
                    <Plus className="h-4 w-4 mr-1" /> Publicar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publicar aviso</DialogTitle>
                    <DialogDescription>
                      Crea un aviso para toda la escuela o para un entorno específico.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Título</Label>
                      <Input
                        value={newNoticeTitle}
                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                        placeholder="Ej: Reunión de docentes"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={newNoticeContent}
                        onChange={(e) => setNewNoticeContent(e.target.value)}
                        placeholder="Detalle del aviso..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Prioridad</Label>
                      <Select
                        value={newNoticeImportance}
                        onValueChange={(v) => setNewNoticeImportance(v as NoticeImportance)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="important">Importante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Alcance</Label>
                      <Select value={newNoticeEnv} onValueChange={setNewNoticeEnv}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Toda la escuela</SelectItem>
                          {rootEnvironments.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handlePublishNotice}
                      disabled={savingNotice || !newNoticeTitle.trim()}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      {savingNotice ? 'Publicando...' : 'Publicar aviso'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            {pendingNotices.length > 0 ? (
              pendingNotices.map((notice) => (
                <NoticeItem
                  key={notice.id}
                  notice={notice}
                  environmentName={
                    notice.environmentId
                      ? getEnvironmentName(notice.environmentId)
                      : 'General'
                  }
                  onComplete={completeNotice}
                />
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                No hay avisos pendientes.
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Left Column: Environments - Second on Mobile */}
        <div className="flex-1 order-2 md:order-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Entornos Formativos</h2>
            <Dialog open={createEnvOpen} onOpenChange={setCreateEnvOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="bg-green-700 hover:bg-green-800">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Entorno
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Entorno</DialogTitle>
                  <DialogDescription>
                    Define un nuevo espacio de aprendizaje y producción.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Entorno</Label>
                    <Input
                      id="name"
                      value={newEnvName}
                      onChange={(e) => setNewEnvName(e.target.value)}
                      placeholder="Ej: Apicultura"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Producción</Label>
                    <Select value={newEnvType} onValueChange={(v) => setNewEnvType(v as EnvironmentType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="animal">Animal</SelectItem>
                        <SelectItem value="vegetal">Vegetal</SelectItem>
                        <SelectItem value="maquinaria">Maquinaria</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Descripción</Label>
                    <Textarea
                      id="desc"
                      value={newEnvDesc}
                      onChange={(e) => setNewEnvDesc(e.target.value)}
                      placeholder="Breve descripción de las actividades..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCreateEnvironment}
                    disabled={savingEnv || !newEnvName.trim()}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    {savingEnv ? 'Guardando...' : 'Crear Entorno'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rootEnvironments.map(env => (
              <EnvironmentCard
                key={env.id}
                env={env}
                onEdit={openEditEnvironment}
                onDelete={setDeleteEnv}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!editEnv} onOpenChange={(open) => !open && setEditEnv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar entorno</DialogTitle>
            <DialogDescription>Modifica los datos del entorno formativo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre del Entorno</Label>
              <Input value={newEnvName} onChange={(e) => setNewEnvName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Producción</Label>
              <Select value={newEnvType} onValueChange={(v) => setNewEnvType(v as EnvironmentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="vegetal">Vegetal</SelectItem>
                  <SelectItem value="maquinaria">Maquinaria</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea value={newEnvDesc} onChange={(e) => setNewEnvDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEnv(null)}>Cancelar</Button>
            <Button
              type="button"
              onClick={handleUpdateEnvironment}
              disabled={savingEnv || !newEnvName.trim()}
              className="bg-green-700 hover:bg-green-800"
            >
              {savingEnv ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteEnv} onOpenChange={(open) => !open && setDeleteEnv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar entorno</DialogTitle>
            <DialogDescription>
              ¿Eliminar &quot;{deleteEnv?.name}&quot; y todo su contenido (tareas, actividades, planillas, sub-entornos)?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEnv(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteEnvironment} disabled={savingEnv}>
              {savingEnv ? 'Eliminando...' : 'Eliminar entorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EnvironmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    environments,
    tasks,
    activities,
    spreadsheets,
    environmentInfo,
    loading,
    addTask,
    completeTask,
    uncompleteTask,
    addActivity,
    completeActivity,
    uncompleteActivity,
    updateActivity,
    removeActivity,
    updateEnvironmentInfo,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
    addSpreadsheet,
    updateSpreadsheet,
    events,
    addEnvironmentEvent,
    updateEnvironmentEvent,
    removeEnvironmentEvent,
    getEnvironmentName,
  } = useApp();

  const env = environments.find(e => e.id === id);
  const Icon = env ? (iconMap as any)[env.icon] : iconMap.HelpCircle;

  const envTasks = tasks.filter((t) => t.environmentId === id);
  const localActivities = activities
    .filter((a) => a.environmentId === id)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const envSpreadsheets = spreadsheets.filter((s) => s.environmentId === id);
  const envEvents = events
    .filter((e) => e.environmentId === id && !isPast(new Date(e.eventAt)))
    .sort((a, b) => new Date(a.eventAt).getTime() - new Date(b.eventAt).getTime());
  const subEnvironments = environments.filter((e) => e.parentId === id);
  const info = environmentInfo[id!] ?? DEFAULT_ENVIRONMENT_INFO;
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityContent, setNewActivityContent] = useState('');
  const [newActivityAuthor, setNewActivityAuthor] = useState('');

  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCols, setNewSheetCols] = useState('');
  const [newSheetRows, setNewSheetRows] = useState('');

  const [newSubEnvName, setNewSubEnvName] = useState('');
  const [newSubEnvDesc, setNewSubEnvDesc] = useState('');

  const [newInvName, setNewInvName] = useState('');
  const [newInvQuantity, setNewInvQuantity] = useState('');
  const [newInvUnit, setNewInvUnit] = useState('');
  const [newInvNotes, setNewInvNotes] = useState('');

  const [editEnvOpen, setEditEnvOpen] = useState(false);
  const [deleteEnvOpen, setDeleteEnvOpen] = useState(false);
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editEnvName, setEditEnvName] = useState('');
  const [editEnvDesc, setEditEnvDesc] = useState('');
  const [editEnvType, setEditEnvType] = useState<EnvironmentType>('animal');
  const [savingEnvAction, setSavingEnvAction] = useState(false);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EnvironmentEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [savingEvent, setSavingEvent] = useState(false);
  const [deleteEventTarget, setDeleteEventTarget] = useState<EnvironmentEvent | null>(null);

  if (loading) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Cargando entorno...</div>;
  if (!env) return <div>Entorno no encontrado</div>;

  const openEditEnvDialog = (target: FormativeEnvironment = env) => {
    setEditingEnvId(target.id);
    setEditEnvName(target.name);
    setEditEnvDesc(target.description);
    setEditEnvType(target.type);
    setEditEnvOpen(true);
  };

  const handleUpdateEnv = async () => {
    if (!editEnvName.trim()) return;
    setSavingEnvAction(true);
    try {
      const style = ENV_TYPE_STYLES[editEnvType];
      await updateEnvironment(editingEnvId ?? id!, {
        name: editEnvName.trim(),
        description: editEnvDesc.trim(),
        type: editEnvType,
        icon: style.icon,
        color: style.color,
      });
      setEditEnvOpen(false);
      setEditingEnvId(null);
    } finally {
      setSavingEnvAction(false);
    }
  };

  const handleDeleteEnv = async () => {
    setSavingEnvAction(true);
    try {
      await removeEnvironment(id!);
      navigate(env.parentId ? `/entorno/${env.parentId}` : '/');
    } finally {
      setSavingEnvAction(false);
    }
  };

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('09:00');
    setEventDialogOpen(true);
  };

  const openEditEvent = (event: EnvironmentEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDate(toLocalDateInput(event.eventAt));
    setEventTime(toLocalTimeInput(event.eventAt));
    setEventDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim() || !eventDate || !eventTime) return;
    setSavingEvent(true);
    try {
      const eventAt = new Date(`${eventDate}T${eventTime}`).toISOString();
      if (editingEvent) {
        await updateEnvironmentEvent(editingEvent.id, {
          title: eventTitle.trim(),
          eventAt,
        });
      } else {
        await addEnvironmentEvent({
          environmentId: id!,
          title: eventTitle.trim(),
          eventAt,
        });
      }
      setEventDialogOpen(false);
      setEditingEvent(null);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventTarget) return;
    setSavingEvent(true);
    try {
      await removeEnvironmentEvent(deleteEventTarget.id);
      setDeleteEventTarget(null);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleAddActivityManual = async () => {
    if (!newActivityTitle.trim() || !newActivityContent.trim()) return;
    await addActivity({
      environmentId: id!,
      environmentName: env.name,
      title: newActivityTitle.trim(),
      content: newActivityContent.trim(),
      author: newActivityAuthor.trim() || 'Usuario Actual',
    });
    setNewActivityTitle('');
    setNewActivityContent('');
    setNewActivityAuthor('');
  };

  const handleAddActivity = async (title: string, content: string) => {
    await addActivity({
      environmentId: id!,
      environmentName: env.name,
      title,
      content,
      author: 'Usuario Actual',
    });
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setSavingTask(true);
    try {
      await addTask({
        environmentId: id!,
        title: newTaskTitle.trim(),
        dueDate: new Date(`${newTaskDate}T12:00:00`).toISOString(),
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
      setNewTaskDate(new Date().toISOString().split('T')[0]);
      setNewTaskPriority('medium');
      setTaskDialogOpen(false);
    } finally {
      setSavingTask(false);
    }
  };

  const handleCreateSheet = async () => {
    if (!newSheetTitle || !newSheetCols) return;
    const cols = ['Fila', ...newSheetCols.split(',').map(c => c.trim())];
    const rowNames = newSheetRows.split(',').map(r => r.trim()).filter(r => r !== '');
    
    const initialRows = rowNames.map(name => {
      const row: Record<string, any> = { Fila: name };
      cols.slice(1).forEach(col => row[col] = '');
      return row;
    });

    await addSpreadsheet({
      environmentId: id!,
      title: newSheetTitle,
      columns: cols,
      rows: initialRows,
    });
    
    await handleAddActivity(
      `Nueva Planilla: ${newSheetTitle}`,
      `Se ha creado una nueva planilla de registro con ${cols.length - 1} columnas.`
    );

    setNewSheetTitle('');
    setNewSheetCols('');
    setNewSheetRows('');
  };

  const updateCell = async (sheetId: string, rowIndex: number, column: string, value: string) => {
    const sheet = envSpreadsheets.find((s) => s.id === sheetId);
    if (!sheet) return;
    const newRows = [...sheet.rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
    await updateSpreadsheet(sheetId, { rows: newRows });
  };

  const addRowToSheet = async (sheetId: string) => {
    const sheet = envSpreadsheets.find((s) => s.id === sheetId);
    if (!sheet) return;
    const newRow: Record<string, any> = { Fila: `Nueva Fila ${sheet.rows.length + 1}` };
    sheet.columns.slice(1).forEach(col => newRow[col] = '');
    await updateSpreadsheet(sheetId, { rows: [...sheet.rows, newRow] });
  };

  const handleCreateSubEnv = async () => {
    if (!newSubEnvName) return;
    await addEnvironment({
      parentId: id,
      name: newSubEnvName,
      description: newSubEnvDesc,
      type: env.type,
      icon: env.icon,
      color: env.color.replace('100', '50').replace('700', '600').replace('200', '100'),
    });
    
    await handleAddActivity(
      `Nuevo Sub-entorno: ${newSubEnvName}`,
      `Se ha creado un nuevo sub-espacio dentro de ${env.name}.`
    );

    setNewSubEnvName('');
    setNewSubEnvDesc('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to={env.parentId ? `/entorno/${env.parentId}` : "/"} className="flex items-center gap-2 text-muted-foreground hover:text-green-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver {env.parentId ? 'al Entorno Padre' : 'al Dashboard'}</span>
        </Link>
        {env.parentId && (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            Sub-entorno de {getEnvironmentName(env.parentId!)}
          </Badge>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl ${env.color}`}>
              <Icon className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{env.name}</h1>
              <p className="text-muted-foreground">{env.description}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => openEditEnvDialog()}>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteEnvOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="actividades" className="w-full">
            <TabsList className={`grid w-full mb-8 ${!env.parentId ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="actividades">Actividades</TabsTrigger>
              {!env.parentId && <TabsTrigger value="subentornos">Sub-entornos</TabsTrigger>}
              <TabsTrigger value="tareas">Tareas Diarias</TabsTrigger>
              <TabsTrigger value="planillas">Planillas</TabsTrigger>
              <TabsTrigger value="info">Información</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actividades">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Actividades del entorno</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="mr-2 h-4 w-4" /> Nueva Actividad
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar actividad</DialogTitle>
                      <DialogDescription>Documenta una actividad realizada en este entorno.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Título</Label>
                        <Input
                          value={newActivityTitle}
                          onChange={(e) => setNewActivityTitle(e.target.value)}
                          placeholder="Ej: Cosecha de hortalizas"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={newActivityContent}
                          onChange={(e) => setNewActivityContent(e.target.value)}
                          placeholder="Detalle de la actividad realizada..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Realizada por (opcional)</Label>
                        <Input
                          value={newActivityAuthor}
                          onChange={(e) => setNewActivityAuthor(e.target.value)}
                          placeholder="Ej: Alumno García"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddActivityManual} className="bg-green-700 hover:bg-green-800">
                        Guardar actividad
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {localActivities.map(a => (
                  <ActivityItem
                    key={a.id}
                    activity={a}
                    onUpdate={updateActivity}
                    onDelete={removeActivity}
                    onComplete={completeActivity}
                    onUncomplete={uncompleteActivity}
                  />
                ))}
                {localActivities.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                    No hay actividades registradas aún.
                  </div>
                )}
              </div>
            </TabsContent>

            {!env.parentId && (
              <TabsContent value="subentornos">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Sub-entornos de {env.name}</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Sub-entorno
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Sub-entorno</DialogTitle>
                        <DialogDescription>Divide el entorno en áreas más específicas.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Nombre del Sub-entorno</Label>
                          <Input 
                            value={newSubEnvName}
                            onChange={(e) => setNewSubEnvName(e.target.value)}
                            placeholder="Ej: Sector A, Galpón 1..." 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Descripción</Label>
                          <Textarea 
                            value={newSubEnvDesc}
                            onChange={(e) => setNewSubEnvDesc(e.target.value)}
                            placeholder="Breve descripción..." 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateSubEnv} className="bg-green-700 hover:bg-green-800">Crear</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subEnvironments.map(sub => (
                    <EnvironmentCard
                      key={sub.id}
                      env={sub}
                      onEdit={openEditEnvDialog}
                      onDelete={(subEnv) => {
                        if (window.confirm(`¿Eliminar "${subEnv.name}" y todo su contenido?`)) {
                          removeEnvironment(subEnv.id);
                        }
                      }}
                    />
                  ))}
                  {subEnvironments.length === 0 && (
                    <div className="col-span-2 text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                      No se han creado sub-entornos todavía.
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            <TabsContent value="tareas">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tareas del Día</CardTitle>
                    <CardDescription>Gestiona las labores diarias del entorno.</CardDescription>
                  </div>
                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" size="sm" className="bg-green-700 hover:bg-green-800">
                        <Plus className="h-4 w-4 mr-1" /> Nueva Tarea
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Tarea</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Descripción de la tarea</Label>
                          <Input 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Ej: Revisar niveles de agua" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Fecha de la tarea</Label>
                          <Input 
                            type="date"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Prioridad</Label>
                          <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as 'low' | 'medium' | 'high')}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          onClick={handleAddTask}
                          disabled={savingTask || !newTaskTitle.trim()}
                          className="bg-green-700 hover:bg-green-800"
                        >
                          {savingTask ? 'Guardando...' : 'Guardar Tarea'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {envTasks.length > 0 ? (
                    envTasks.map(t => (
                      <TaskItem
                        key={t.id}
                        task={t}
                        onComplete={completeTask}
                        onUncomplete={uncompleteTask}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic">
                      No hay tareas pendientes.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="planillas">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Planillas del Entorno</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="mr-2 h-4 w-4" /> Nueva Planilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Planilla de Datos</DialogTitle>
                      <DialogDescription>Configura las columnas y el título de tu planilla.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Título de la Planilla</Label>
                        <Input 
                          value={newSheetTitle}
                          onChange={(e) => setNewSheetTitle(e.target.value)}
                          placeholder="Ej: Registro de Pesaje" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Nombres de Columnas (separadas por coma)</Label>
                        <Input 
                          value={newSheetCols}
                          onChange={(e) => setNewSheetCols(e.target.value)}
                          placeholder="Ej: Cantidad, Estado, Observaciones" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Nombres de Filas (opcional, separadas por coma)</Label>
                        <Input 
                          value={newSheetRows}
                          onChange={(e) => setNewSheetRows(e.target.value)}
                          placeholder="Ej: Lote 1, Lote 2, Lote 3" 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateSheet} className="bg-green-700 hover:bg-green-800">Crear Planilla</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {envSpreadsheets.map(s => (
                  <Card key={s.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{s.title}</CardTitle>
                        <CardDescription>Creada el {new Date(s.createdAt).toLocaleDateString()}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => addRowToSheet(s.id)}>
                        <Plus className="h-3 w-3 mr-1" /> Fila
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {s.columns.map(col => (
                                <TableHead key={col} className={col === 'Fila' ? 'bg-slate-50 font-bold w-32' : ''}>
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {s.rows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {s.columns.map(col => (
                                  <TableCell key={col} className={col === 'Fila' ? 'bg-slate-50 font-semibold' : 'p-1'}>
                                    {col === 'Fila' ? (
                                      row[col]
                                    ) : (
                                      <Input 
                                        className="h-8 border-transparent hover:border-slate-200 focus:border-green-500 bg-transparent"
                                        value={row[col]}
                                        onChange={(e) => updateCell(s.id, rowIndex, col, e.target.value)}
                                        placeholder="..."
                                      />
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                            {s.rows.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={s.columns.length} className="text-center py-4 text-muted-foreground">
                                  Planilla vacía. Añada una fila para comenzar.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Exportar CSV</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Entorno</CardTitle>
                  <CardDescription>Edita la información general y el inventario.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Responsable</Label>
                      <Input
                        value={info.responsible}
                        onChange={(e) => updateEnvironmentInfo(id!, { responsible: e.target.value })}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ubicación</Label>
                      <Input
                        value={info.location}
                        onChange={(e) => updateEnvironmentInfo(id!, { location: e.target.value })}
                        placeholder="Ubicación del entorno"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Horario de actividad</Label>
                      <Input
                        value={info.schedule}
                        onChange={(e) => updateEnvironmentInfo(id!, { schedule: e.target.value })}
                        placeholder="Ej: Lunes a Viernes 08:00 - 12:00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Estado</Label>
                      <Select
                        value={info.status}
                        onValueChange={(v) => updateEnvironmentInfo(id!, { status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="En mantenimiento">En mantenimiento</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-700" />
                        <h3 className="text-lg font-semibold">Inventario</h3>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" /> Agregar ítem
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Nuevo ítem de inventario</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Nombre</Label>
                              <Input
                                value={newInvName}
                                onChange={(e) => setNewInvName(e.target.value)}
                                placeholder="Ej: Alimento balanceado"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label>Cantidad</Label>
                                <Input
                                  value={newInvQuantity}
                                  onChange={(e) => setNewInvQuantity(e.target.value)}
                                  placeholder="Ej: 120"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Unidad</Label>
                                <Input
                                  value={newInvUnit}
                                  onChange={(e) => setNewInvUnit(e.target.value)}
                                  placeholder="Ej: kg"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label>Notas (opcional)</Label>
                              <Input
                                value={newInvNotes}
                                onChange={(e) => setNewInvNotes(e.target.value)}
                                placeholder="Observaciones..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                if (!newInvName.trim() || !newInvQuantity.trim()) return;
                                addInventoryItem(id!, {
                                  name: newInvName.trim(),
                                  quantity: newInvQuantity.trim(),
                                  unit: newInvUnit.trim() || 'unidades',
                                  notes: newInvNotes.trim() || undefined,
                                });
                                setNewInvName('');
                                setNewInvQuantity('');
                                setNewInvUnit('');
                                setNewInvNotes('');
                              }}
                              className="bg-green-700 hover:bg-green-800"
                            >
                              Agregar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {info.inventory.length > 0 ? (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ítem</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Unidad</TableHead>
                              <TableHead>Notas</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {info.inventory.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="p-1">
                                  <Input
                                    className="h-8 border-transparent hover:border-slate-200 focus:border-green-500"
                                    value={item.name}
                                    onChange={(e) =>
                                      updateInventoryItem(id!, item.id, { name: e.target.value })
                                    }
                                  />
                                </TableCell>
                                <TableCell className="p-1">
                                  <Input
                                    className="h-8 border-transparent hover:border-slate-200 focus:border-green-500"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateInventoryItem(id!, item.id, { quantity: e.target.value })
                                    }
                                  />
                                </TableCell>
                                <TableCell className="p-1">
                                  <Input
                                    className="h-8 border-transparent hover:border-slate-200 focus:border-green-500"
                                    value={item.unit}
                                    onChange={(e) =>
                                      updateInventoryItem(id!, item.id, { unit: e.target.value })
                                    }
                                  />
                                </TableCell>
                                <TableCell className="p-1">
                                  <Input
                                    className="h-8 border-transparent hover:border-slate-200 focus:border-green-500"
                                    value={item.notes ?? ''}
                                    onChange={(e) =>
                                      updateInventoryItem(id!, item.id, { notes: e.target.value })
                                    }
                                    placeholder="..."
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                    onClick={() => removeInventoryItem(id!, item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
                        No hay ítems en el inventario. Agrega el primero.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={openCreateEvent} aria-label="Agregar evento">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {envEvents.length > 0 ? (
                envEvents.map((event, index) => {
                  const colors = EVENT_ICON_COLORS[index % EVENT_ICON_COLORS.length];
                  return (
                    <div key={event.id} className="flex items-start gap-3 group">
                      <div className={`${colors.bg} p-2 rounded ${colors.text} shrink-0`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground">{formatEventDateTime(event.eventAt)}</p>
                      </div>
                      <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditEvent(event)} aria-label="Editar evento">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => setDeleteEventTarget(event)} aria-label="Eliminar evento">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                  No hay eventos programados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
            <DialogDescription>
              Programa un evento para este entorno formativo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej: Vacunación anual"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fecha</Label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Hora</Label>
                <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveEvent}
              disabled={savingEvent || !eventTitle.trim() || !eventDate || !eventTime}
              className="bg-green-700 hover:bg-green-800"
            >
              {savingEvent ? 'Guardando...' : editingEvent ? 'Guardar cambios' : 'Agregar evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteEventTarget} onOpenChange={(open) => !open && setDeleteEventTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar evento</DialogTitle>
            <DialogDescription>
              ¿Eliminar &quot;{deleteEventTarget?.title}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEventTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={savingEvent}>
              {savingEvent ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editEnvOpen} onOpenChange={(open) => { setEditEnvOpen(open); if (!open) setEditingEnvId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar entorno</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={editEnvName} onChange={(e) => setEditEnvName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={editEnvType} onValueChange={(v) => setEditEnvType(v as EnvironmentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="vegetal">Vegetal</SelectItem>
                  <SelectItem value="maquinaria">Maquinaria</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Descripción</Label>
              <Textarea value={editEnvDesc} onChange={(e) => setEditEnvDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEnvOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleUpdateEnv}
              disabled={savingEnvAction || !editEnvName.trim()}
              className="bg-green-700 hover:bg-green-800"
            >
              {savingEnvAction ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteEnvOpen} onOpenChange={setDeleteEnvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar entorno</DialogTitle>
            <DialogDescription>
              ¿Eliminar &quot;{env.name}&quot; y todo su contenido? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEnvOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteEnv} disabled={savingEnvAction}>
              {savingEnvAction ? 'Eliminando...' : 'Eliminar entorno'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PlanillasPage = () => {
  const { spreadsheets, environments, addSpreadsheet, getEnvironmentName, loading } = useApp();
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCols, setNewSheetCols] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');

  const handleCreateSheet = async () => {
    if (!newSheetTitle || !newSheetCols || !selectedEnv) return;
    const cols = newSheetCols.split(',').map(c => c.trim());
    await addSpreadsheet({
      environmentId: selectedEnv,
      title: newSheetTitle,
      columns: cols,
      rows: [],
    });
    setNewSheetTitle('');
    setNewSheetCols('');
    setSelectedEnv('');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Cargando planillas...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Planillas</h1>
          <p className="text-muted-foreground">Administra todos los registros de datos de la escuela.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-700 hover:bg-green-800">
              <Plus className="mr-2 h-4 w-4" /> Crear Nueva Planilla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Planilla de Datos</DialogTitle>
              <DialogDescription>Configura las columnas y el entorno para tu planilla.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Entorno</Label>
                <Select onValueChange={setSelectedEnv}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar entorno" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Título de la Planilla</Label>
                <Input 
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  placeholder="Ej: Registro de Pesaje" 
                />
              </div>
              <div className="grid gap-2">
                <Label>Columnas (separadas por coma)</Label>
                <Input 
                  value={newSheetCols}
                  onChange={(e) => setNewSheetCols(e.target.value)}
                  placeholder="Ej: Fecha, Peso, Observaciones" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateSheet} className="bg-green-700 hover:bg-green-800">Crear Planilla</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Entorno</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los entornos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {environments.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {spreadsheets.map(s => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{s.title}</CardTitle>
                  <CardDescription>
                    Entorno: {getEnvironmentName(s.environmentId)}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {s.rows.length} Filas
                </Badge>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">Ver Detalles</Button>
                <Button variant="outline" size="sm">Editar</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { error, refresh } = useApp();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased">
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-4">
            <span>Error de conexión: {error}</span>
            <Button size="sm" variant="outline" onClick={() => refresh()}>Reintentar</Button>
          </div>
        )}
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard />
                </motion.div>
              } />
              <Route path="/entorno/:id" element={
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EnvironmentPage />
                </motion.div>
              } />
              <Route path="/planillas" element={
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlanillasPage />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="border-t bg-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2024 AgrariaConnect - Sistema de Gestión para Escuelas Agrarias</p>
            <p className="mt-2 italic">Impulsando la educación técnica y la producción sustentable.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
