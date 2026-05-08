
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Plus, Search, Thermometer, Edit, X, ChevronRight,
  Printer, Milk, ShieldCheck, Box, Truck, 
  Zap, Warehouse, User, MapPin, CheckCircle2,
  Trash2, Droplets, Sun, Waves, Wind, FlaskConical, Shirt, Clock, Calendar, Info, FileText,
  Users, TrendingUp, IndianRupee, Layers, ListPlus, Activity, ClipboardCheck, ChevronUp, ChevronDown, Building2, Users2, Sparkles, Briefcase, PlusCircle, Laptop,
  Flame, Scale, HeartPulse, ShieldAlert, ShoppingCart, Sprout, Hash
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ChillingCenter, Supplier, EquipmentItem, SupplierType, ChillingRouteItem, TankItem, TankerLogItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1.5 border-b pb-1 mb-2 mt-3", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
    <h3 className={cn("text-[10px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

export default function ChillingCentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'chillingCenters')
  }, [db, user])

  const { data: centers, isLoading } = useCollection<ChillingCenter>(centersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<ChillingCenter | null>(null)
  
  const [formData, setFormData] = useState<Partial<ChillingCenter>>({
    name: "", ownerName: "", code: "", address: "", mobile: "",
    cowMilk: { quantity: 0, fat: 0, snf: 0 },
    buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
    hasBmc: false, hasIbt: false,
    hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
    hasLab: false, staffUniform: false,
    tanks: [], tankerLogs: [],
    morningTime: "", eveningTime: "",
    supplierCount: "0", fatMachineBrand: "",
    otherDairySupply: "",
    fssaiNumber: "", fssaiExpiry: "",
    waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
    hasTransportLicenses: false, pestControlDone: false, 
    staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false,
    routes: [],
    gavaliSuppliers: [],
    gothaSuppliers: []
  })

  const [activeSubTab, setActiveSubTab] = useState<'main' | 'routes' | 'gavali' | 'gotha'>('main')

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add'); setEditingId(null); setActiveSubTab('main');
    setFormData({
      name: "", ownerName: "", code: "", address: "", mobile: "",
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      hasBmc: false, hasIbt: false,
      hasEtp: false, hasSolar: false, hasHotWater: false, hasDrainage: false,
      hasLab: false, staffUniform: false,
      tanks: [], tankerLogs: [],
      morningTime: "", eveningTime: "",
      supplierCount: "0", fatMachineBrand: "",
      otherDairySupply: "",
      fssaiNumber: "", fssaiExpiry: "",
      waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
      hasTransportLicenses: false, pestControlDone: false, 
      staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false,
      routes: [], gavaliSuppliers: [], gothaSuppliers: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: ChillingCenter) => {
    setDialogMode('edit'); setEditingId(center.id); setActiveSubTab('main');
    setFormData(center)
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.code || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड आवश्यक आहे.", variant: "destructive" })
      return
    }
    const data = { ...formData, updatedAt: new Date().toISOString() }
    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'chillingCenters'), data)
      toast({ title: "यशस्वी", description: "चिलिंग सेंटर जोडले गेले." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'chillingCenters', editingId), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!db || !user) return
    if (confirm("हे सेंटर हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'chillingCenters', id))
      setSelectedCenter(null)
      toast({ title: "यशस्वी", description: "सेंटर हटवण्यात आले." })
    }
  }

  const addTank = () => setFormData(prev => ({ ...prev, tanks: [...(prev.tanks || []), { id: crypto.randomUUID(), label: `टाकी ${(prev.tanks?.length || 0) + 1}`, capacity: "" }] }))
  const removeTank = (id: string) => setFormData(prev => ({ ...prev, tanks: prev.tanks?.filter(t => t.id !== id) }))
  const updateTank = (id: string, val: string) => setFormData(prev => ({ ...prev, tanks: prev.tanks?.map(t => t.id === id ? { ...t, capacity: val } : t) }))

  const addTankerLog = () => setFormData(prev => ({ ...prev, tankerLogs: [...(prev.tankerLogs || []), { id: crypto.randomUUID(), tankerNo: "", arrivalTime: "", departureTime: "", qtyFilled: "" }] }))
  const removeTankerLog = (id: string) => setFormData(prev => ({ ...prev, tankerLogs: prev.tankerLogs?.filter(t => t.id !== id) }))
  const updateTankerLog = (id: string, updates: Partial<TankerLogItem>) => setFormData(prev => ({ ...prev, tankerLogs: prev.tankerLogs?.map(t => t.id === id ? { ...t, ...updates } : t) }))

  const createInitialSupplier = (type: SupplierType): Supplier => ({
    id: crypto.randomUUID(),
    supplierId: "",
    name: "",
    address: "",
    mobile: "",
    routeId: "",
    supplierType: type,
    updatedAt: new Date().toISOString(),
    equipment: [],
    producer_center: {
      additional_details: {
        morning_collection_time: "", evening_collection_time: "", start_year: "",
        total_producers: 0, active_producers: 0, total_animals: 0, cows: 0, buffalo: 0, calves: 0,
        sub_gavali_info: [], internal_gothas: [], local_employees: [],
        milkman_gavali_details: [], lss_details: [], competitor_dairies: [], sub_routes: [],
        gotha_breed_info: [], gotha_worker_info: [],
        collection_areas: [],
        gotha_hygiene_checklist: {
          floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
          worker_hygiene: false, proper_drainage: false, clean_water_trough: false,
          pest_control: false, health_records: false
        }
      }
    }
  })

  const addSubEntity = (listKey: 'routes' | 'gavaliSuppliers' | 'gothaSuppliers') => {
    if (listKey === 'routes') {
      const newRoute: ChillingRouteItem = { id: crypto.randomUUID(), routeName: "", producerCount: "0", cows: "0", buffaloes: "0", distanceKm: "0", collectionArea: "", milkmanNames: "" }
      setFormData(prev => ({ ...prev, routes: [...(prev.routes || []), newRoute] }))
    } else {
      const type = listKey === 'gavaliSuppliers' ? 'Gavali' : 'Gotha'
      const newItem = createInitialSupplier(type)
      setFormData(prev => ({ 
        ...prev, 
        [listKey]: [
          ...(prev[listKey] as any[] || []).map(item => ({ ...item, isOpen: false })), 
          { ...newItem, isOpen: true }
        ] 
      }))
    }
  }

  const updateSubItem = (listKey: 'routes' | 'gavaliSuppliers' | 'gothaSuppliers', id: string, updates: any) => {
    setFormData(prev => {
      const list = (prev[listKey] as any[] || []);
      if (updates.isOpen === true) {
        return {
          ...prev,
          [listKey]: list.map(item => item.id === id ? { ...item, ...updates } : { ...item, isOpen: false })
        }
      }
      return {
        ...prev,
        [listKey]: list.map(item => item.id === id ? { ...item, ...updates } : item)
      }
    })
  }

  const updateSupplierDeep = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => {
        if (s.id === suppId) {
          const currentDetails = s.producer_center?.additional_details || {};
          return {
            ...s,
            producer_center: {
              ...s.producer_center,
              additional_details: { ...currentDetails, ...updates }
            }
          }
        }
        return s;
      })
    }))
  }

  const addSupplierTableRow = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, detailKey: string, initial: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => {
        if (s.id === suppId) {
          const currentDetails = s.producer_center?.additional_details || {};
          const currentList = (currentDetails as any)[detailKey] || [];
          return {
            ...s,
            producer_center: {
              ...s.producer_center,
              additional_details: { ...currentDetails, [detailKey]: [...currentList, { id: crypto.randomUUID(), ...initial }] }
            }
          }
        }
        return s;
      })
    }))
  }

  const removeSupplierTableRow = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, detailKey: string, rowId: string) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => {
        if (s.id === suppId) {
          const currentDetails = s.producer_center?.additional_details || {};
          const currentList = (currentDetails as any)[detailKey] || [];
          return {
            ...s,
            producer_center: {
              ...s.producer_center,
              additional_details: { ...currentDetails, [detailKey]: currentList.filter((r: any) => r.id !== rowId) }
            }
          }
        }
        return s;
      })
    }))
  }

  const updateSupplierTableRow = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, detailKey: string, rowId: string, rowUpdates: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => {
        if (s.id === suppId) {
          const currentDetails = s.producer_center?.additional_details || {};
          const currentList = (currentDetails as any)[detailKey] || [];
          return {
            ...s,
            producer_center: {
              ...s.producer_center,
              additional_details: { ...currentDetails, [detailKey]: currentList.map((r: any) => r.id === rowId ? { ...r, ...rowUpdates } : r) }
            }
          }
        }
        return s;
      })
    }))
  }

  const addSupplierEquipment = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => s.id === suppId ? { ...s, equipment: [...(s.equipment || []), { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }] } : s)
    }))
  }

  const updateSupplierEquipment = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, eqId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => s.id === suppId ? { ...s, equipment: (s.equipment || []).map(e => e.id === eqId ? { ...e, ...updates } : e) } : s)
    }))
  }

  const removeSupplierEquipment = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, eqId: string) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as Supplier[]).map(s => s.id === suppId ? { ...s, equipment: (s.equipment || []).filter(e => e.id !== eqId) } : s)
    }))
  }

  const addInternalGotha = (suppId: string) => {
    const newGotha = {
      id: crypto.randomUUID(), isOpen: true, owner_name: "", code: "", location: "", area: "", fodder_area: "",
      milking_morning: "", milking_evening: "", breeds: [], workers: [], hygiene_checklist: { floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false, worker_hygiene: false, proper_drainage: false, clean_water_trough: false, pest_control: false, health_records: false }
    }
    const currentGothas = (formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || []).map((g: any) => ({ ...g, isOpen: false }));
    updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: [...currentGothas, newGotha] })
  }

  const updateInternalGotha = (suppId: string, gothaId: string, updates: any) => {
    const currentGothas = formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || [];
    if (updates.isOpen === true) {
      updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.map((g: any) => g.id === gothaId ? { ...g, ...updates } : { ...g, isOpen: false }) })
    } else {
      updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.map((g: any) => g.id === gothaId ? { ...g, ...updates } : g) })
    }
  }

  const removeInternalGotha = (suppId: string, gothaId: string) => {
    const currentGothas = formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || [];
    updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.filter((g: any) => g.id !== gothaId) })
  }

  const addInternalGothaTableRow = (suppId: string, gothaId: string, listKey: 'breeds' | 'workers', initial: any) => {
    const currentGothas = formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || [];
    updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.map((g: any) => g.id === gothaId ? { ...g, [listKey]: [...g[listKey], { id: crypto.randomUUID(), ...initial }] } : g) })
  }

  const updateInternalGothaTableRow = (suppId: string, gothaId: string, listKey: 'breeds' | 'workers', rowId: string, rowUpdates: any) => {
    const currentGothas = formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || [];
    updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.map((g: any) => g.id === gothaId ? { ...g, [listKey]: g[listKey].map((r: any) => r.id === rowId ? { ...r, ...rowUpdates } : r) } : g) })
  }

  const removeInternalGothaTableRow = (suppId: string, gothaId: string, listKey: 'breeds' | 'workers', rowId: string) => {
    const currentGothas = formData.gavaliSuppliers?.find(s => s.id === suppId)?.producer_center?.additional_details?.internal_gothas || [];
    updateSupplierDeep('gavaliSuppliers', suppId, { internal_gothas: currentGothas.map((g: any) => g.id === gothaId ? { ...g, [listKey]: g[listKey].filter((r: any) => r.id !== rowId) } : g) })
  }

  const summaryStats = useMemo(() => {
    if (!selectedCenter) return { gavalis: 0, producers: 0, cows: 0, buffaloes: 0, totalAnimals: 0 };
    let totalGavalis = (selectedCenter.gavaliSuppliers?.length || 0);
    let totalProducers = (selectedCenter.routes?.reduce((acc, r) => acc + Number(r.producerCount || 0), 0) || 0);
    totalProducers += (selectedCenter.gavaliSuppliers?.reduce((acc, g) => acc + Number(g.producer_center?.additional_details?.total_producers || 0), 0) || 0);
    let totalCows = (selectedCenter.routes?.reduce((acc, r) => acc + Number(r.cows || 0), 0) || 0);
    totalCows += (selectedCenter.gothaSuppliers?.reduce((acc, go) => acc + Number(go.producer_center?.additional_details?.cows || 0), 0) || 0);
    totalCows += (selectedCenter.gavaliSuppliers?.reduce((acc, g) => acc + Number(g.producer_center?.additional_details?.cows || 0), 0) || 0);
    let totalBuffs = (selectedCenter.routes?.reduce((acc, r) => acc + Number(r.buffaloes || 0), 0) || 0);
    totalBuffs += (selectedCenter.gothaSuppliers?.reduce((acc, go) => acc + Number(go.producer_center?.additional_details?.buffalo || 0), 0) || 0);
    totalBuffs += (selectedCenter.gavaliSuppliers?.reduce((acc, g) => acc + Number(g.producer_center?.additional_details?.buffalo || 0), 0) || 0);
    return { gavalis: totalGavalis, producers: totalProducers, cows: totalCows, buffaloes: totalBuffs, totalAnimals: totalCows + totalBuffs };
  }, [selectedCenter]);

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toString().includes(searchQuery))
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print">
        <div className="min-w-0 text-left">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Thermometer className="h-6 w-6 text-primary" /> चिलिंग सेंटर (CHILLING)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logistics, Tanks & Audit Records</p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto font-black h-10 text-[10px] rounded-xl px-6 uppercase shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन चिलिंग सेंटर
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px] lg:h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-primary/5 transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase">{center.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md">ID: {center.code}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold uppercase"><MapPin className="h-3 w-3" /> {center.address || "---"}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-none bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center">
          {selectedCenter ? (
            <ScrollArea className="w-full h-full lg:max-h-[800px]">
              <div className="p-4 sm:p-8 space-y-6 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left bg-white">
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 no-print">
                   <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 text-center"><p className="text-[8px] font-black uppercase text-primary mb-1">एकूण गवळी</p><p className="text-xl font-black">{summaryStats.gavalis}</p></div>
                   <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center"><p className="text-[8px] font-black uppercase text-emerald-600 mb-1">एकूण उत्पादक</p><p className="text-xl font-black">{summaryStats.producers}</p></div>
                   <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center"><p className="text-[8px] font-black uppercase text-blue-600 mb-1">एकूण जनावरे</p><p className="text-xl font-black">{summaryStats.totalAnimals}</p></div>
                   <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center"><p className="text-[8px] font-black uppercase text-amber-600 mb-1">एकूण दूध</p><p className="text-xl font-black">{((selectedCenter.cowMilk?.quantity || 0) + (selectedCenter.buffaloMilk?.quantity || 0)).toFixed(1)}L</p></div>
                </div>
                <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">CHILLING CENTER PROFILE</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                  </div>
                </div>
                <div className="w-full border-b-[4px] border-black pb-3 mb-6 text-center">
                  <h3 className="text-[18pt] sm:text-[22pt] font-black uppercase text-primary tracking-[0.1em]">{selectedCenter.name}</h3>
                  <p className="text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {selectedCenter.code} | चिलिंग सेंटर सविस्तर अहवाल</p>
                </div>
                
                <div className="grid grid-cols-2 gap-10 w-full mb-6 text-[12px] font-bold">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-1 mb-2">१) प्राथमिक माहिती (PRIMARY)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मालक</span><span>{selectedCenter.ownerName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल</span><span>{selectedCenter.mobile || "-"}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पत्ता</span><span>{selectedCenter.address || "-"}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-1 mb-2">२) तांत्रिक & परवाना</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedCenter.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">पाणी स्रोत</span><span>{selectedCenter.waterSource || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">बॅकअप</span><span>{selectedCenter.powerBackup || "-"}</span></div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-6">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-widest border-b-2 border-black pb-1 mb-2">३) टाक्यांची माहिती (STORAGE TANKS)</h4>
                  <table className="w-full border-collapse border border-black text-[10px]">
                    <thead className="bg-slate-50"><tr><th className="p-2 border border-black text-left">टाकी लेबल</th><th className="p-2 border border-black text-right">क्षमता (L)</th></tr></thead>
                    <tbody>
                      {(selectedCenter.tanks || []).map((t, idx) => (
                        <tr key={idx}><td className="p-2 border border-black font-bold uppercase">{t.label}</td><td className="p-2 border border-black text-right font-black">{t.capacity} L</td></tr>
                      ))}
                      {(!selectedCenter.tanks || selectedCenter.tanks.length === 0) && (<tr><td colSpan={2} className="p-4 text-center opacity-30 italic">माहिती उपलब्ध नाही</td></tr>)}
                    </tbody>
                  </table>
                </div>

                <div className="w-full mt-10 pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[11pt] tracking-widest">
                  <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
                  <div className="border-t-2 border-black pt-3">सेंटर मालक</div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Warehouse className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">चिलिंग सेंटर निवडा</h4>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन चिलिंग सेंटर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">पायाभूत सुविधा, तांत्रिक आणि सविस्तर सब-सेशन्स.</DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 border-b flex overflow-x-auto no-print">
            {[
              { id: 'main', label: '१) मुख्य माहिती', icon: Warehouse },
              { id: 'routes', label: '२) रूट व्यवस्थापन', icon: Truck },
              { id: 'gavali', label: '३) गवळी माहिती', icon: Users },
              { id: 'gotha', label: '४) गोठा माहिती', icon: Building2 },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={cn("px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 border-r transition-all shrink-0", activeSubTab === tab.id ? "bg-white text-primary border-b-2 border-b-primary" : "text-slate-400 hover:bg-slate-100")}><tab.icon className="h-3.5 w-3.5" /> {tab.label}</button>
            ))}
          </div>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-4 space-y-8 pb-24">
              
              {activeSubTab === 'main' && (
                <div className="space-y-8 max-w-[700px]">
                  <div className="space-y-4">
                    <SectionTitle icon={Warehouse} title="१) प्राथमिक माहिती & परवाना" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरचे नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालकाचे नाव</Label><Input value={formData.ownerName || ""} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">कोड नंबर *</Label><Input value={formData.code || ""} onChange={e => setFormData({...formData, code: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI क्रमांक</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <SectionTitle icon={Box} title="२) टाक्यांची माहिती (TANKS)" />
                      <Button size="sm" variant="outline" onClick={addTank} className="h-6 text-[8px] font-black border-black">+ जोडा</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(formData.tanks || []).map((tank) => (
                        <div key={tank.id} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1"><Label className="text-[8px] font-black">{tank.label}</Label><Input value={tank.capacity || ""} onChange={e => updateTank(tank.id, e.target.value)} placeholder="क्षमता (L)" className="h-8 border-2 border-black font-black text-xs" /></div>
                          <Button size="icon" variant="ghost" onClick={() => removeTank(tank.id)} className="h-8 w-8 text-rose-500"><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <SectionTitle icon={Truck} title="३) टँकर लॉग (TANKER LOG)" />
                      <Button size="sm" variant="outline" onClick={addTankerLog} className="h-6 text-[8px] font-black border-black">+ जोडा</Button>
                    </div>
                    <div className="space-y-2">
                      {(formData.tankerLogs || []).map((log) => (
                        <div key={log.id} className="grid grid-cols-5 gap-2 items-end bg-slate-50 p-2 rounded-lg border-2 border-black">
                           <div className="space-y-1"><Label className="text-[8px] font-black">टँकर क्र.</Label><Input value={log.tankerNo || ""} onChange={e => updateTankerLog(log.id, { tankerNo: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                           <div className="space-y-1"><Label className="text-[8px] font-black">In</Label><Input type="time" value={log.arrivalTime || ""} onChange={e => updateTankerLog(log.id, { arrivalTime: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                           <div className="space-y-1"><Label className="text-[8px] font-black">Out</Label><Input type="time" value={log.departureTime || ""} onChange={e => updateTankerLog(log.id, { departureTime: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                           <div className="space-y-1"><Label className="text-[8px] font-black">दूध (L)</Label><Input type="number" value={log.qtyFilled || ""} onChange={e => updateTankerLog(log.id, { qtyFilled: e.target.value })} className="h-7 border-black text-[10px]" /></div>
                           <Button size="icon" variant="ghost" onClick={() => removeTankerLog(log.id)} className="h-7 w-7 text-rose-500"><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={ShieldCheck} title="४) तांत्रिक, स्वच्छता & ऑडिट" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border-2 border-black">
                       {[
                         { k: 'hasEtp', l: 'ETP उपलब्ध', i: Droplets },
                         { k: 'hasSolar', l: 'सोलर पॅनेल', i: Sun },
                         { k: 'hasHotWater', l: 'गरम पाण्याची सोय', i: Waves },
                         { k: 'hasDrainage', l: 'ड्रेनेज सिस्टीम', i: Wind },
                         { k: 'hasLab', l: 'प्रयोगशाळा (LAB)', i: FlaskConical },
                         { k: 'staffUniform', l: 'स्टाफ गणवेश', i: Shirt },
                         { k: 'hasTransportLicenses', l: 'वाहतूक परवाने', i: FileText },
                         { k: 'pestControlDone', l: 'पेस्ट कंट्रोल', i: ShieldAlert },
                         { k: 'staffHealthCheckDone', l: 'हेल्थ चेकअप', i: HeartPulse },
                         { k: 'calibrationDone', l: 'कॅलिब्रेशन (Weight)', i: Scale },
                         { k: 'fireSafetyOk', l: 'फायर सेफ्टी Ok', i: Flame },
                       ].map(item => (
                         <div key={item.k} className="flex items-center space-x-2 bg-white p-1.5 rounded border border-black/10">
                           <Checkbox checked={(formData as any)[item.k]} onCheckedChange={v => setFormData({...formData, [item.k]: !!v})} />
                           <Label className="text-[9px] font-black uppercase leading-none">{item.l}</Label>
                         </div>
                       ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase">पाणी स्रोत</Label><Input value={formData.waterSource || ""} onChange={e => setFormData({...formData, waterSource: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase">पॉवर बॅकअप</Label><Input value={formData.powerBackup || ""} onChange={e => setFormData({...formData, powerBackup: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase">स्वच्छता ग्रेड</Label>
                         <Select value={formData.hygieneGrade || "A"} onValueChange={v => setFormData({...formData, hygieneGrade: v})}>
                           <SelectTrigger className="h-8 border-2 border-black font-black text-xs"><SelectValue /></SelectTrigger>
                           <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem></SelectContent>
                         </Select>
                       </div>
                    </div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">फॅट मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                  </div>

                  <div className="space-y-4">
                    <SectionTitle icon={Milk} title="५) दूध सारांश & पुरवठा" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">इतर डेअरीला पुरवठा</Label><Input value={formData.otherDairySupply || ""} onChange={e => setFormData({...formData, otherDairySupply: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" placeholder="उदा. चितळे डेअरी" /></div>
                      <div className="space-y-1"><Label className="text-[9px] font-black uppercase">एकूण सप्लायर्स</Label><Input type="number" value={formData.supplierCount || "0"} onChange={e => setFormData({...formData, supplierCount: e.target.value})} className="h-8 border-2 border-black font-black text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <Label className="text-[9px] font-black uppercase text-blue-600 block mb-1.5">गाय (Cow Q/F/S)</Label>
                        <div className="grid grid-cols-3 gap-1">
                          <Input type="number" value={formData.cowMilk?.quantity || 0} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                          <Input type="number" value={formData.cowMilk?.fat || 0} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                          <Input type="number" value={formData.cowMilk?.snf || 0} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                        </div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                        <Label className="text-[9px] font-black uppercase text-amber-600 block mb-1.5">म्हेस (Buf Q/F/S)</Label>
                        <div className="grid grid-cols-3 gap-1">
                          <Input type="number" value={formData.buffaloMilk?.quantity || 0} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                          <Input type="number" value={formData.buffaloMilk?.fat || 0} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                          <Input type="number" value={formData.buffaloMilk?.snf || 0} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'routes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1"><SectionTitle icon={Truck} title="चिलिंग सेंटर रूट व्यवस्थापन" /><Button size="sm" onClick={() => addSubEntity('routes')} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg"><Plus className="h-3 w-3 mr-1" /> रूट जोडा</Button></div>
                  <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm max-w-[800px]">
                    <ScrollArea className="w-full">
                      <Table className="min-w-[700px] text-[10px] uppercase">
                        <TableHeader className="bg-slate-50 font-black h-8"><TableRow><TableHead className="px-2 text-center h-8">रूट नाव</TableHead><TableHead className="px-2 text-center h-8 w-16">उत्पादक</TableHead><TableHead className="px-2 text-center h-8 w-24">गा/म्हे संख्या</TableHead><TableHead className="px-2 text-center h-8 w-16">KM</TableHead><TableHead className="px-2 text-center h-8">एरिया / गवळी</TableHead><TableHead className="w-10 h-8"></TableHead></TableRow></TableHeader>
                        <TableBody>
                          {(formData.routes || []).map((row) => (
                            <TableRow key={row.id} className="h-10">
                              <TableCell className="p-0 border-r border-black/10"><Input value={row.routeName || ""} onChange={e => updateSubItem('routes', row.id, { routeName: e.target.value })} className="h-8 border-none text-[11px] p-2 bg-transparent font-bold" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.producerCount || "0"} onChange={e => updateSubItem('routes', row.id, { producerCount: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10 flex items-center h-10 px-1 gap-1"><Input type="number" value={row.cows || "0"} onChange={e => updateSubItem('routes', row.id, { cows: e.target.value })} className="h-7 border border-black/10 text-center text-[10px]" placeholder="G" /><Input type="number" value={row.buffaloes || "0"} onChange={e => updateSubItem('routes', row.id, { buffaloes: e.target.value })} className="h-7 border border-black/10 text-center text-[10px]" placeholder="M" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.distanceKm || "0"} onChange={e => updateSubItem('routes', row.id, { distanceKm: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input value={row.collectionArea || ""} onChange={e => updateSubItem('routes', row.id, { collectionArea: e.target.value })} className="h-8 border-none text-[10px] p-2 bg-transparent font-medium" placeholder="गवळी नावे" /></TableCell>
                              <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => setFormData(prev => ({...prev, routes: prev.routes?.filter(r => r.id !== row.id)}))} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              )}

              {activeSubTab === 'gavali' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Users} title="गवळी माहिती (सविस्तर १६+ कलमी फॉर्म)" />
                    <Button size="sm" onClick={() => addSubEntity('gavaliSuppliers')} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg"><Plus className="h-3 w-3 mr-1" /> गवळी जोडा</Button>
                  </div>
                  <div className="space-y-6 max-w-[800px]">
                    {(formData.gavaliSuppliers || []).map((g, gIdx) => {
                      const d = g.producer_center?.additional_details || {};
                      return (
                        <Card key={g.id} className="border-2 border-black overflow-hidden rounded-2xl shadow-md bg-white">
                          <div 
                            className={cn("p-2 flex justify-between items-center cursor-pointer transition-colors", g.isOpen ? "bg-primary text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-900")} 
                            onClick={() => updateSubItem('gavaliSuppliers', g.id, { isOpen: !g.isOpen })}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={cn("font-black text-[8px] h-5", g.isOpen ? "bg-white text-primary" : "bg-primary text-white")}>#{gIdx + 1}</Badge>
                              <span className="text-[10px] font-black uppercase">{g.name || 'गवळी तपशील भरा'}</span>
                              {!g.isOpen && g.supplierId && <span className="text-[8px] font-bold opacity-60">(ID: {g.supplierId})</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className={cn("h-6 w-6", g.isOpen ? "text-white/50 hover:text-white" : "text-rose-500")} onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, gavaliSuppliers: prev.gavaliSuppliers?.filter(item => item.id !== g.id)})); }}><Trash2 className="h-4 w-4" /></Button>
                              {g.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                          {g.isOpen && (
                            <div className="p-3 space-y-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="space-y-4">
                                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={g.name || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { name: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">गवळी कोड *</Label><Input value={g.supplierId || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { supplierId: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={g.operatorName || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { operatorName: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={g.mobile || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { mobile: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                    <div className="col-span-2 space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={g.address || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { address: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                  </div>
                               </div>

                               <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-1">
                                    <span className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5"/> सब-गवळी माहिती (SUB-GAVALI)</span>
                                    <Button size="sm" variant="outline" onClick={() => addSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', { name: "", mobile: "", area: "", producers: "0", animals: "0", collection_type: "Spot", cow_qty: "0", buf_qty: "0" })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button>
                                  </div>
                                  <div className="border border-black rounded-lg overflow-hidden shadow-sm">
                                    <ScrollArea className="w-full">
                                      <Table className="min-w-max text-[9px] uppercase">
                                        <TableHeader className="bg-slate-50 font-black h-7"><TableRow><TableHead className="h-7 px-2">नाव</TableHead><TableHead className="h-7 px-2">एरिया</TableHead><TableHead className="h-7 px-2 text-center">प्रकार</TableHead><TableHead className="h-7 px-2 text-center">दूध</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                          {(d.sub_gavali_info || []).map((sub: any) => (
                                            <TableRow key={sub.id} className="h-8 border-t border-black/10">
                                              <TableCell className="p-0 border-r"><Input value={sub.name || ""} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sub.id, { name: e.target.value })} className="h-7 border-none text-[10px] p-1 font-bold" /></TableCell>
                                              <TableCell className="p-0 border-r"><Input value={sub.area || ""} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sub.id, { area: e.target.value })} className="h-7 border-none text-[10px] p-1" /></TableCell>
                                              <TableCell className="p-0 border-r"><select value={sub.collection_type || "Spot"} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sub.id, { collection_type: e.target.value })} className="h-7 border-none text-[9px] font-black bg-transparent w-full text-center outline-none"><option value="Spot">Spot</option><option value="Route">Route</option></select></TableCell>
                                              <TableCell className="p-0 border-r"><Input type="number" value={sub.cow_qty || "0"} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sub.id, { cow_qty: e.target.value })} className="h-7 border-none text-center text-[10px] font-black w-16" /></TableCell>
                                              <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sub.id)} className="h-7 w-7 text-rose-400"><X className="h-3 w-3"/></Button></TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b-2 border-amber-200 pb-1">
                                    <SectionTitle icon={Building2} title="अंतर्गत मोठे गोठे (INTERNAL GOTHAS)" color="text-amber-700" />
                                    <Button size="sm" variant="outline" onClick={() => addInternalGotha(g.id)} className="h-7 text-[9px] font-black uppercase px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md border-none"><Plus className="h-3 w-3 mr-1" /> गोठा जोडा</Button>
                                  </div>
                                  <div className="space-y-3">
                                    {(d.internal_gothas || []).map((gotha: any, gIdx: number) => (
                                      <Card key={gotha.id} className="border-2 border-amber-100 overflow-hidden rounded-xl shadow-sm">
                                        <div className={cn("p-2 flex items-center justify-between cursor-pointer", gotha.isOpen ? "bg-amber-100" : "bg-amber-50")} onClick={() => updateInternalGotha(g.id, gotha.id, { isOpen: !gotha.isOpen })}>
                                          <div className="flex items-center gap-2">
                                            <Badge className="bg-amber-600 text-white font-black text-[8px] h-5">G-{gIdx + 1}</Badge>
                                            <span className="text-[9px] font-black uppercase text-amber-900">गोठा: {gotha.owner_name || '---'}</span>
                                          </div>
                                          <div className="flex gap-1.5"><Button size="icon" variant="ghost" className="h-6 w-6 text-rose-400" onClick={(e) => { e.stopPropagation(); removeInternalGotha(g.id, gotha.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>{gotha.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                                        </div>
                                        {gotha.isOpen && (
                                          <div className="p-3 bg-white space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-3 gap-2">
                                              <div className="space-y-0.5"><Label className="text-[8px] font-black">मालक</Label><Input value={gotha.owner_name || ""} onChange={e => updateInternalGotha(g.id, gotha.id, { owner_name: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                                              <div className="space-y-0.5"><Label className="text-[8px] font-black">कोड</Label><Input value={gotha.code || ""} onChange={e => updateInternalGotha(g.id, gotha.id, { code: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                                              <div className="space-y-0.5"><Label className="text-[8px] font-black">लोकेशन</Label><Input value={gotha.location || ""} onChange={e => updateInternalGotha(g.id, gotha.id, { location: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                                            </div>
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-600">जातीनुसार जनावरे</span><Button size="sm" variant="outline" onClick={() => addInternalGothaTableRow(g.id, gotha.id, 'breeds', { breed: "", count: 0, avg_milk: 0 })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                                              <div className="border border-black rounded-lg overflow-hidden"><Table className="text-[9px]"><TableHeader className="bg-slate-50 h-6"><TableRow><TableHead className="h-6 px-1">ब्रीड</TableHead><TableHead className="h-6 px-1 text-center">नग</TableHead><TableHead className="h-6 px-1 text-center">L</TableHead><TableHead className="h-6 w-8"></TableHead></TableRow></TableHeader><TableBody>
                                                {(gotha.breeds || []).map((b: any) => (
                                                  <TableRow key={b.id} className="h-8"><TableCell className="p-0 border-r"><Input value={b.breed || ""} onChange={e => updateInternalGothaTableRow(g.id, gotha.id, 'breeds', b.id, { breed: e.target.value })} className="h-7 border-none text-[10px] p-1 font-bold" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.count || 0} onChange={e => updateInternalGothaTableRow(g.id, gotha.id, 'breeds', b.id, { count: e.target.value })} className="h-7 border-none text-center text-[10px] font-black" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.avg_milk || 0} onChange={e => updateInternalGothaTableRow(g.id, gotha.id, 'breeds', b.id, { avg_milk: e.target.value })} className="h-7 border-none text-center text-[10px] font-black" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeInternalGothaTableRow(g.id, gotha.id, 'breeds', b.id)} className="h-6 w-6 text-rose-400"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                                                ))}</TableBody></Table></div>
                                            </div>
                                            <div className="space-y-1.5"><span className="text-[9px] font-black uppercase text-emerald-700">स्वच्छता चेकलिस्ट (SIDE-BY-SIDE)</span><div className="grid grid-cols-2 gap-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                                              {[
                                                { key: 'floor_cleaned', label: 'फरशी स्वच्छता' },
                                                { key: 'animal_cleaned', label: 'जनावरे स्वच्छता' },
                                                { key: 'utensils_sanitized', label: 'भांडी निर्जंतुक' },
                                                { key: 'worker_hygiene', label: 'कामगार स्वच्छता' },
                                                { key: 'proper_drainage', label: 'सांडपाणी निचरा' },
                                                { key: 'clean_water_trough', label: 'स्वच्छ पाणी/चारा' },
                                              ].map((item) => (
                                                <div key={item.key} className="flex items-center space-x-1.5 bg-white p-1 rounded border border-emerald-100 shadow-sm">
                                                  <Checkbox id={`hyg-${gotha.id}-${item.key}`} checked={gotha.hygiene_checklist?.[item.key]} onCheckedChange={(v) => updateInternalGotha(g.id, gotha.id, { hygiene_checklist: { ...gotha.hygiene_checklist, [item.key]: !!v } })} className="h-3 w-3 border-emerald-400" />
                                                  <Label htmlFor={`hyg-${gotha.id}-${item.key}`} className="text-[8px] font-bold text-slate-700">{item.label}</Label>
                                                </div>
                                              ))}
                                            </div></div>
                                          </div>
                                        )}
                                      </Card>
                                    ))}
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3 border-t pt-4">
                                  <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ संकलन वेळ</Label><Input type="time" value={d.morning_collection_time || ""} onChange={e => updateSupplierDeep('gavaliSuppliers', g.id, { morning_collection_time: e.target.value })} className="h-8 border-2 border-black" /></div>
                                  <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ वेळ</Label><Input type="time" value={d.evening_collection_time || ""} onChange={e => updateSupplierDeep('gavaliSuppliers', g.id, { evening_collection_time: e.target.value })} className="h-8 border-2 border-black" /></div>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                  <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <Label className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1"><Milk className="h-3 w-3"/> गाय (Q/F/S)</Label>
                                    <div className="grid grid-cols-3 gap-1 mt-1">
                                      <Input type="number" value={g.cowMilk?.quantity || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: {...g.cowMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={g.cowMilk?.fat || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: {...g.cowMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={g.cowMilk?.snf || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { cowMilk: {...g.cowMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <Label className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1"><Milk className="h-3 w-3"/> म्हैस (Q/F/S)</Label>
                                    <div className="grid grid-cols-3 gap-1 mt-1">
                                      <Input type="number" value={g.buffaloMilk?.quantity || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: {...g.buffaloMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={g.buffaloMilk?.fat || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: {...g.buffaloMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={g.buffaloMilk?.snf || 0} onChange={e => updateSubItem('gavaliSuppliers', g.id, { buffaloMilk: {...g.buffaloMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                    </div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b pb-1"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">साहित्य (INVENTORY)</span><Button size="sm" variant="outline" onClick={() => addSupplierEquipment('gavaliSuppliers', g.id)} className="h-6 text-[8px] font-black border-black">+ जोडा</Button></div>
                                  <div className="space-y-2">
                                    {(g.equipment || []).map(item => (
                                      <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-slate-50 p-1.5 rounded-lg border border-black/10">
                                        <div className="col-span-6"><Input value={item.name || ""} onChange={e => updateSupplierEquipment('gavaliSuppliers', g.id, item.id, { name: e.target.value })} className="h-7 border-2 border-black text-[10px] px-2 font-bold bg-white" placeholder="साहित्य" /></div>
                                        <div className="col-span-2"><Input type="number" value={item.quantity || 0} onChange={e => updateSupplierEquipment('gavaliSuppliers', g.id, item.id, { quantity: Number(e.target.value) })} className="h-7 border-2 border-black text-center font-black text-[10px] bg-white" /></div>
                                        <div className="col-span-3"><Select value={item.ownership || "Company"} onValueChange={v => updateSupplierEquipment('gavaliSuppliers', g.id, item.id, { ownership: v })}><SelectTrigger className="h-7 text-[9px] border-2 border-black font-black p-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent></Select></div>
                                        <div className="col-span-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierEquipment('gavaliSuppliers', g.id, item.id)} className="h-7 w-7 text-rose-400"><X className="h-3.5 w-3.5"/></Button></div>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={g.additionalInfo || ""} onChange={e => updateSubItem('gavaliSuppliers', g.id, { additionalInfo: e.target.value })} className="h-14 border-2 border-black text-[10px] p-2 rounded-xl" /></div>
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeSubTab === 'gotha' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b-2 border-amber-200 pb-1">
                    <SectionTitle icon={Building2} title="गोठा माहिती (सविस्तर १६+ कलमी फॉर्म)" color="text-amber-700" />
                    <Button size="sm" onClick={() => addSubEntity('gothaSuppliers')} className="h-7 text-[9px] font-black uppercase px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md border-none"><Plus className="h-3 w-3 mr-1" /> गोठा जोडा</Button>
                  </div>
                  <div className="space-y-6 max-w-[700px]">
                    {(formData.gothaSuppliers || []).map((go, goIdx) => {
                      const d = go.producer_center?.additional_details || {};
                      return (
                        <Card key={go.id} className="border-2 border-black overflow-hidden rounded-2xl shadow-md bg-white">
                          <div 
                            className={cn("p-2 flex justify-between items-center cursor-pointer transition-colors", go.isOpen ? "bg-amber-600 text-white" : "bg-amber-50 hover:bg-amber-100 text-amber-900")} 
                            onClick={() => updateSubItem('gothaSuppliers', go.id, { isOpen: !go.isOpen })}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={cn("font-black text-[8px] h-5", go.isOpen ? "bg-white text-amber-600" : "bg-amber-600 text-white")}>#{goIdx + 1}</Badge>
                              <span className="text-[10px] font-black uppercase">{go.name || 'गोठा तपशील भरा'}</span>
                              {!go.isOpen && go.supplierId && <span className="text-[8px] font-bold opacity-60">(ID: {go.supplierId})</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className={cn("h-6 w-6", go.isOpen ? "text-white/50 hover:text-white" : "text-rose-500")} onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, gothaSuppliers: prev.gothaSuppliers?.filter(item => item.id !== go.id)})); }}><Trash2 className="h-4 w-4" /></Button>
                              {go.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>
                          {go.isOpen && (
                            <div className="p-3 space-y-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="space-y-4">
                                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">गोठा नाव *</Label><Input value={go.name || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { name: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मालक नाव *</Label><Input value={go.operatorName || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { operatorName: e.target.value })} className="h-8 border-2 border-black text-xs font-bold" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={go.mobile || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { mobile: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={go.address || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { address: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <SectionTitle icon={MapPin} title="२) गोठा आकारमान & दूध वेळ" color="text-amber-700" />
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black">एकूण एरिया</Label><Input value={d.gotha_total_area || ""} onChange={e => updateSupplierDeep('gothaSuppliers', go.id, { gotha_total_area: e.target.value })} className="h-8 border-2 border-black text-xs" placeholder="उदा. १० गुंठे" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black">चारा एरिया</Label><Input value={d.gotha_fodder_area || ""} onChange={e => updateSupplierDeep('gothaSuppliers', go.id, { gotha_fodder_area: e.target.value })} className="h-8 border-2 border-black text-xs" placeholder="उदा. १ एकर" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ दूध वेळ</Label><Input type="time" value={d.gotha_milking_shift_morning || ""} onChange={e => updateSupplierDeep('gothaSuppliers', go.id, { gotha_milking_shift_morning: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                    <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ दूध वेळ</Label><Input type="time" value={d.gotha_milking_shift_evening || ""} onChange={e => updateSupplierDeep('gothaSuppliers', go.id, { gotha_milking_shift_evening: e.target.value })} className="h-8 border-2 border-black text-xs" /></div>
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-rose-600 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5"/> जातीनुसार जनावरे & दूध</span><Button size="sm" variant="outline" onClick={() => addSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', { breed: "", count: 0, avg_milk: 0 })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                                  <div className="border border-black rounded-lg overflow-hidden shadow-sm"><Table className="text-[10px]"><TableHeader className="bg-slate-50 h-7"><TableRow><TableHead className="h-7 px-2">ब्रीड</TableHead><TableHead className="h-7 px-2 text-center">नग</TableHead><TableHead className="h-7 px-2 text-right">Avg(L)</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader><TableBody>
                                    {(d.gotha_breed_info || []).map((b: any) => (
                                      <TableRow key={b.id} className="h-9 border-t border-black/10"><TableCell className="p-0 border-r"><Input value={b.breed || ""} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { breed: e.target.value })} className="h-8 border-none text-[11px] p-1 font-bold text-center" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.count || 0} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { count: e.target.value })} className="h-8 border-none text-[11px] text-center font-black" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.avg_milk || 0} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { avg_milk: e.target.value })} className="h-8 border-none text-[11px] text-center font-black" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id)} className="h-8 w-8 text-rose-400"><X className="h-3.5 w-3.5"/></Button></TableCell></TableRow>
                                    ))}</TableBody></Table></div>
                               </div>

                               <div className="space-y-2">
                                  <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1.5"><ClipboardCheck className="h-3.5 w-3.5"/> गोठा स्वच्छता चेकलिस्ट (Side-by-Side)</span>
                                  <div className="grid grid-cols-2 gap-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                    {[
                                      { key: 'floor_cleaned', label: 'फरशी स्वच्छता' },
                                      { key: 'animal_cleaned', label: 'जनावरे स्वच्छता' },
                                      { key: 'utensils_sanitized', label: 'भांडी निर्जंतुक' },
                                      { key: 'worker_hygiene', label: 'कामगार स्वच्छता' },
                                      { key: 'proper_drainage', label: 'सांडपाणी निचरा' },
                                      { key: 'pest_control', label: 'माश्या/डास नियंत्रण' },
                                      { key: 'clean_water_trough', label: 'स्वच्छ पाणी/चारा' },
                                      { key: 'health_records', label: 'आरोग्य रेकॉर्ड' },
                                    ].map((item) => (
                                      <div key={item.key} className="flex items-center space-x-1.5 bg-white p-1.5 rounded-lg border border-emerald-100 shadow-sm">
                                        <Checkbox id={`hyg-go-${go.id}-${item.key}`} checked={d.gotha_hygiene_checklist?.[item.key]} onCheckedChange={(v) => { const current = d.gotha_hygiene_checklist || {}; updateSupplierDeep('gothaSuppliers', go.id, { gotha_hygiene_checklist: { ...current, [item.key]: !!v } }) }} className="h-3.5 w-3.5 border-emerald-400" />
                                        <Label htmlFor={`hyg-go-${go.id}-${item.key}`} className="text-[9px] font-bold text-slate-700">{item.label}</Label>
                                      </div>
                                    ))}
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3 border-t pt-4">
                                  <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                    <Label className="text-[9px] font-black uppercase text-blue-600">गाय (Q/F/S)</Label>
                                    <div className="grid grid-cols-3 gap-1 mt-1">
                                      <Input type="number" value={go.cowMilk?.quantity || 0} onChange={e => updateSubItem('gothaSuppliers', go.id, { cowMilk: {...go.cowMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={go.cowMilk?.fat || 0} onChange={e => updateSubItem('gothaSuppliers', go.id, { cowMilk: {...go.cowMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={go.cowMilk?.snf || 0} onChange={e => updateSubItem('gothaSuppliers', go.id, { cowMilk: {...go.cowMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                    </div>
                                  </div>
                                  <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <Label className="text-[9px] font-black uppercase text-amber-600">म्हेस (Q/F/S)</Label>
                                    <div className="grid grid-cols-3 gap-1 mt-1">
                                      <Input type="number" value={go.buffaloMilk?.quantity || 0} onChange={e => updateSubItem('gothaSuppliers', go.id, { buffaloMilk: {...go.buffaloMilk, quantity: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={go.buffaloMilk?.fat || 0} onChange={e => updateSubItem('gavaliSuppliers', go.id, { buffaloMilk: {...go.buffaloMilk, fat: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                      <Input type="number" value={go.buffaloMilk?.snf || 0} onChange={e => updateSubItem('gavaliSuppliers', go.id, { buffaloMilk: {...go.buffaloMilk, snf: Number(e.target.value)}})} className="h-7 border-black text-center font-black text-[10px]" />
                                    </div>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <div className="flex items-center justify-between border-b pb-1"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">साहित्य (INVENTORY)</span><Button size="sm" variant="outline" onClick={() => addSupplierEquipment('gothaSuppliers', go.id)} className="h-6 text-[8px] font-black border-black">+ जोडा</Button></div>
                                  <div className="space-y-2">
                                    {(go.equipment || []).map(item => (
                                      <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-slate-50 p-1.5 rounded-lg border border-black/10">
                                        <div className="col-span-6"><Input value={item.name || ""} onChange={e => updateSupplierEquipment('gothaSuppliers', go.id, item.id, { name: e.target.value })} className="h-7 border-2 border-black text-[10px] px-2 font-bold bg-white" placeholder="साहित्य" /></div>
                                        <div className="col-span-2"><Input type="number" value={item.quantity || 0} onChange={e => updateSupplierEquipment('gothaSuppliers', go.id, item.id, { quantity: Number(e.target.value) })} className="h-7 border-2 border-black text-center font-black text-[10px] bg-white" /></div>
                                        <div className="col-span-3"><Select value={item.ownership || "Company"} onValueChange={v => updateSupplierEquipment('gothaSuppliers', go.id, item.id, { ownership: v })}><SelectTrigger className="h-7 text-[9px] border-2 border-black font-black p-1 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent></Select></div>
                                        <div className="col-span-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierEquipment('gothaSuppliers', go.id, item.id)} className="h-7 w-7 text-rose-400"><X className="h-3.5 w-3.5"/></Button></div>
                                      </div>
                                    ))}
                                  </div>
                               </div>
                               <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={go.additionalInfo || ""} onChange={e => updateSubItem('gothaSuppliers', go.id, { additionalInfo: e.target.value })} className="h-14 border-2 border-black text-[10px] p-2 rounded-xl" /></div>
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-10 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-primary text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
