import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Bell, 
  User, 
  ArrowLeft,
  MessageSquare,
  Calendar,
  Share2,
  Bird,
  Leaf,
  Milk,
  Settings,
  HelpCircle,
  CheckCircle2,
  Circle,
  Clock,
  Trash2
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
import { MOCK_ENVIRONMENTS, MOCK_ACTIVITIES, MOCK_SPREADSHEETS, MOCK_TASKS } from './data';
import { iconMap } from './icons';
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

const TaskItem = ({ task, onToggle }: { task: Task; onToggle: (id: string) => void; key?: string }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-slate-50 transition-colors mb-2">
    <div className="flex items-center gap-3">
      <button onClick={() => onToggle(task.id)} className="text-green-600">
        {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </button>
      <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
        <p className="text-sm font-medium">{task.title}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
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
);

// --- Pages ---

const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [newActivity, setNewActivity] = useState({ title: '', content: '', envId: '' });

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.content || !newActivity.envId) return;
    
    const env = MOCK_ENVIRONMENTS.find(e => e.id === newActivity.envId);
    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      environmentId: newActivity.envId,
      environmentName: env?.name || 'Otro',
      title: newActivity.title,
      content: newActivity.content,
      author: 'Usuario Actual',
      createdAt: new Date().toISOString(),
    };
    
    setActivities([activity, ...activities]);
    setNewActivity({ title: '', content: '', envId: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Right Column: Avisos Feed - First on Mobile */}
        <div className="w-full md:w-96 order-1 md:order-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Avisos</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Publicar Aviso</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Aviso</DialogTitle>
                  <DialogDescription>Publica un aviso importante para los demás entornos.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Entorno</Label>
                    <Select onValueChange={(v) => setNewActivity({...newActivity, envId: v})}>
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
                    <Label>Título del Aviso</Label>
                    <Input 
                      value={newActivity.title} 
                      onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                      placeholder="Ej: Reunión de profesores, Falta de insumos..." 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mensaje</Label>
                    <Textarea 
                      value={newActivity.content}
                      onChange={(e) => setNewActivity({...newActivity, content: e.target.value})}
                      placeholder="Escribe el contenido del aviso..." 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddActivity} className="bg-green-700 hover:bg-green-800">Publicar Aviso</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
            {activities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
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
  
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS.filter(t => t.environmentId === id));
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>(MOCK_SPREADSHEETS.filter(s => s.environmentId === id));
  const [localActivities, setLocalActivities] = useState<Activity[]>(MOCK_ACTIVITIES.filter(a => a.environmentId === id));
  const [subEnvironments, setSubEnvironments] = useState<FormativeEnvironment[]>(MOCK_ENVIRONMENTS.filter(e => e.parentId === id));
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);

  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCols, setNewSheetCols] = useState('');
  const [newSheetRows, setNewSheetRows] = useState('');

  const [newSubEnvName, setNewSubEnvName] = useState('');
  const [newSubEnvDesc, setNewSubEnvDesc] = useState('');

  if (!env) return <div>Entorno no encontrado</div>;

  const handleAddActivity = (title: string, content: string) => {
    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      environmentId: id!,
      environmentName: env.name,
      title,
      content,
      author: 'Usuario Actual',
      createdAt: new Date().toISOString(),
    };
    setLocalActivities([activity, ...localActivities]);
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      environmentId: id!,
      title: newTaskTitle,
      dueDate: new Date(newTaskDate).toISOString(),
      completed: false,
      priority: newTaskPriority,
    };
    setTasks([...tasks, task]);

    handleAddTaskActivity(newTaskTitle, newTaskDate, newTaskPriority);

    setNewTaskTitle('');
    setNewTaskDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddTaskActivity = (title: string, date: string, priority: string) => {
    handleAddActivity(
      `Nueva Tarea: ${title}`,
      `Se ha programado una nueva tarea para el día ${new Date(date).toLocaleDateString()}. Prioridad: ${priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}.`
    );
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
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
                  {tasks.length > 0 ? (
                    tasks.map(t => (
                      <TaskItem key={t.id} task={t} onToggle={toggleTask} />
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Responsable</p>
                      <p>Ing. Agr. Ricardo López</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                      <p>Sector Norte - Lote 4</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Horario de Actividad</p>
                      <p>Lunes a Viernes 08:00 - 12:00</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Stats */}
        <div className="w-full md:w-72 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estadísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Actividades este mes</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Alumnos asignados</span>
                <span className="font-bold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Planillas activas</span>
                <span className="font-bold">5</span>
              </div>
            </CardContent>
          </Card>
          
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
