import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { 
  Sprout, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  ArrowLeft,
  MessageSquare,
  Calendar,
  Share2,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Package
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
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ENVIRONMENTS, MOCK_SPREADSHEETS, DEFAULT_ENVIRONMENT_INFO } from './data';
import { iconMap } from './icons';
import { useApp } from './context/AppContext';
import { FormativeEnvironment, Activity, Spreadsheet, Task } from './types';

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

const EnvironmentCard = ({ env }: { env: FormativeEnvironment; key?: string }) => {
  const Icon = (iconMap as any)[env.icon] || iconMap.HelpCircle;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/entorno/${env.id}`}>
        <Card className="h-full overflow-hidden border-2 hover:border-green-500 transition-colors">
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
        </Card>
      </Link>
    </motion.div>
  );
};

const ActivityItem = ({ activity }: { activity: Activity; key?: string }) => (
  <Card className="mb-4 overflow-hidden border-l-4 border-l-green-600">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
            {activity.environmentName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: es })}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
      <CardTitle className="text-lg mt-1">{activity.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {activity.content}
      </p>
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
);

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
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

const TaskNoticeItem = ({ task, environmentName }: { task: Task; environmentName: string; key?: string }) => (
  <Card className="mb-4 overflow-hidden border-l-4 border-l-orange-500">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
          {environmentName}
        </Badge>
        <Badge variant="outline" className={
          task.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
          task.priority === 'medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
          'text-blue-600 border-blue-200 bg-blue-50'
        }>
          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>
      </div>
      <CardTitle className="text-lg mt-2">{task.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Vence: {new Date(task.dueDate).toLocaleDateString()}
      </p>
    </CardContent>
  </Card>
);

// --- Pages ---

const Dashboard = () => {
  const { tasks, getEnvironmentName } = useApp();
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Right Column: Avisos - tareas pendientes */}
        <div className="w-full md:w-96 order-1 md:order-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Avisos</h2>
            <Badge variant="outline">{pendingTasks.length} pendientes</Badge>
          </div>
          
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <TaskNoticeItem
                  key={task.id}
                  task={task}
                  environmentName={getEnvironmentName(task.environmentId)}
                />
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                No hay tareas pendientes.
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Left Column: Environments - Second on Mobile */}
        <div className="flex-1 order-2 md:order-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Entornos Formativos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-700 hover:bg-green-800">
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
                    <Input id="name" placeholder="Ej: Apicultura" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Producción</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* ... existing select items ... */}
                        <SelectItem value="animal">Animal</SelectItem>
                        <SelectItem value="vegetal">Vegetal</SelectItem>
                        <SelectItem value="maquinaria">Maquinaria</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Descripción</Label>
                    <Textarea id="desc" placeholder="Breve descripción de las actividades..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-green-700 hover:bg-green-800">Crear Entorno</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MOCK_ENVIRONMENTS.filter(e => !e.parentId).map(env => (
              <EnvironmentCard key={env.id} env={env} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EnvironmentPage = () => {
  const { id } = useParams();
  const env = MOCK_ENVIRONMENTS.find(e => e.id === id);
  const Icon = env ? (iconMap as any)[env.icon] : iconMap.HelpCircle;

  const {
    tasks,
    activities,
    environmentInfo,
    addTask,
    completeTask,
    uncompleteTask,
    addActivity,
    updateEnvironmentInfo,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  } = useApp();

  const envTasks = tasks.filter((t) => t.environmentId === id);
  const localActivities = activities.filter((a) => a.environmentId === id);
  const info = environmentInfo[id!] ?? DEFAULT_ENVIRONMENT_INFO;

  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>(MOCK_SPREADSHEETS.filter(s => s.environmentId === id));
  const [subEnvironments, setSubEnvironments] = useState<FormativeEnvironment[]>(MOCK_ENVIRONMENTS.filter(e => e.parentId === id));
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);

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

  if (!env) return <div>Entorno no encontrado</div>;

  const handleAddActivityManual = () => {
    if (!newActivityTitle.trim() || !newActivityContent.trim()) return;
    addActivity({
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

  const handleAddActivity = (title: string, content: string) => {
    addActivity({
      environmentId: id!,
      environmentName: env.name,
      title,
      content,
      author: 'Usuario Actual',
    });
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    addTask({
      environmentId: id!,
      title: newTaskTitle,
      dueDate: new Date(newTaskDate).toISOString(),
      priority: newTaskPriority,
    });
    setNewTaskTitle('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreateSheet = () => {
    if (!newSheetTitle || !newSheetCols) return;
    const cols = ['Fila', ...newSheetCols.split(',').map(c => c.trim())];
    const rowNames = newSheetRows.split(',').map(r => r.trim()).filter(r => r !== '');
    
    const initialRows = rowNames.map(name => {
      const row: Record<string, any> = { Fila: name };
      cols.slice(1).forEach(col => row[col] = '');
      return row;
    });

    const sheet: Spreadsheet = {
      id: Math.random().toString(36).substr(2, 9),
      environmentId: id!,
      title: newSheetTitle,
      columns: cols,
      rows: initialRows,
      createdAt: new Date().toISOString(),
    };
    setSpreadsheets([...spreadsheets, sheet]);
    
    handleAddActivity(
      `Nueva Planilla: ${newSheetTitle}`,
      `Se ha creado una nueva planilla de registro con ${cols.length - 1} columnas.`
    );

    setNewSheetTitle('');
    setNewSheetCols('');
    setNewSheetRows('');
  };

  const updateCell = (sheetId: string, rowIndex: number, column: string, value: string) => {
    setSpreadsheets(spreadsheets.map(s => {
      if (s.id === sheetId) {
        const newRows = [...s.rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
        return { ...s, rows: newRows };
      }
      return s;
    }));
  };

  const addRowToSheet = (sheetId: string) => {
    setSpreadsheets(spreadsheets.map(s => {
      if (s.id === sheetId) {
        const newRow: Record<string, any> = { Fila: `Nueva Fila ${s.rows.length + 1}` };
        s.columns.slice(1).forEach(col => newRow[col] = '');
        return { ...s, rows: [...s.rows, newRow] };
      }
      return s;
    }));
  };

  const handleCreateSubEnv = () => {
    if (!newSubEnvName) return;
    const subEnv: FormativeEnvironment = {
      id: Math.random().toString(36).substr(2, 9),
      parentId: id,
      name: newSubEnvName,
      description: newSubEnvDesc,
      type: env.type,
      icon: env.icon,
      color: env.color.replace('100', '50').replace('700', '600').replace('200', '100'),
    };
    setSubEnvironments([...subEnvironments, subEnv]);
    
    handleAddActivity(
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
            Sub-entorno de {MOCK_ENVIRONMENTS.find(e => e.id === env.parentId)?.name}
          </Badge>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl ${env.color}`}>
              <Icon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{env.name}</h1>
              <p className="text-muted-foreground">{env.description}</p>
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
                  <ActivityItem key={a.id} activity={a} />
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
                    <EnvironmentCard key={sub.id} env={sub} />
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-700 hover:bg-green-800">
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
                          <Select onValueChange={(v: any) => setNewTaskPriority(v)}>
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
                        <Button onClick={handleAddTask} className="bg-green-700 hover:bg-green-800">Guardar Tarea</Button>
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
                {spreadsheets.map(s => (
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded text-green-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Vacunación Anual</p>
                  <p className="text-[10px] text-muted-foreground">Mañana, 09:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded text-blue-700">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Visita Técnica INTA</p>
                  <p className="text-[10px] text-muted-foreground">Jueves 15, 14:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PlanillasPage = () => {
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>(MOCK_SPREADSHEETS);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCols, setNewSheetCols] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');

  const handleCreateSheet = () => {
    if (!newSheetTitle || !newSheetCols || !selectedEnv) return;
    const cols = newSheetCols.split(',').map(c => c.trim());
    const sheet: Spreadsheet = {
      id: Math.random().toString(36).substr(2, 9),
      environmentId: selectedEnv,
      title: newSheetTitle,
      columns: cols,
      rows: [],
      createdAt: new Date().toISOString(),
    };
    setSpreadsheets([sheet, ...spreadsheets]);
    setNewSheetTitle('');
    setNewSheetCols('');
    setSelectedEnv('');
  };

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
                    {MOCK_ENVIRONMENTS.map(e => (
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
                  {MOCK_ENVIRONMENTS.map(e => (
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
                    Entorno: {MOCK_ENVIRONMENTS.find(e => e.id === s.environmentId)?.name}
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
  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased">
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
