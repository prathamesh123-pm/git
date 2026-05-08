"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Search, Thermometer, Edit, X, ChevronRight,
  Printer, Milk, ShieldCheck, Box, Truck, 
  Zap, Warehouse, User, MapPin, CheckCircle2,
  Trash2, Droplets, Sun, Waves, Wind, FlaskConical, Shirt, Clock, Calendar, Info, FileText,
  Users, TrendingUp, IndianRupee, Layers, ListPlus, Activity, ClipboardCheck, ChevronUp, ChevronDown, Building2, Users2, Sparkles, Briefcase, PlusCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ChillingCenter, TankItem, TankerLogItem, ChillingRouteItem, Supplier, EquipmentItem, SupplierType } from "@/lib/types"
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
    tanks: [] as TankItem[],
    tankerLogs: [] as TankerLogItem[],
    morningTime: "", eveningTime: "",
    supplierCount: "0", fatMachineBrand: "",
    otherDairySupply: "",
    fssaiNumber: "", fssaiExpiry: "",
    waterSource: "Borewell", powerBackup: "Generator", hygieneGrade: "A",
    hasTransportLicenses: false, pestControlDone: false, 
    staffHealthCheckDone: false, calibrationDone: false, fireSafetyOk: false,
    routes: [] as ChillingRouteItem[],
    gavaliSuppliers: [] as Supplier[],
    gothaSuppliers: [] as Supplier[]
  })

  // State for Sub-Entity forms within the dialog
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

    const data = {
      ...formData,
      updatedAt: new Date().toISOString()
    }

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

  // --- Sub-Entity Form Logic ---

  const addRouteRow = () => {
    const newRoute: ChillingRouteItem = { id: crypto.randomUUID(), routeName: "", producerCount: "0", cows: "0", buffaloes: "0", distanceKm: "0", collectionArea: "", milkmanNames: "" }
    setFormData(prev => ({ ...prev, routes: [...(prev.routes || []), newRoute] }))
  }

  const addGavaliRow = () => {
    const newGavali: Supplier = {
      id: crypto.randomUUID(), supplierId: "", name: "", address: "", mobile: "", routeId: "", supplierType: 'Gavali', 
      updatedAt: new Date().toISOString(), equipment: [], 
      producer_center: { additional_details: { sub_gavali_info: [], internal_gothas: [], lss_details: [], competitor_dairies: [], local_employees: [], milkman_gavali_details: [], sub_routes: [] } }
    }
    setFormData(prev => ({ ...prev, gavaliSuppliers: [...(prev.gavaliSuppliers || []), newGavali] }))
  }

  const addGothaRow = () => {
    const newGotha: Supplier = {
      id: crypto.randomUUID(), supplierId: "", name: "", address: "", mobile: "", routeId: "", supplierType: 'Gotha', 
      updatedAt: new Date().toISOString(), equipment: [], 
      producer_center: { additional_details: { gotha_breed_info: [], gotha_worker_info: [], gotha_hygiene_checklist: {} } }
    }
    setFormData(prev => ({ ...prev, gothaSuppliers: [...(prev.gothaSuppliers || []), newGotha] }))
  }

  const updateSubEntity = (listKey: 'routes' | 'gavaliSuppliers' | 'gothaSuppliers', id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as any[]).map(item => item.id === id ? { ...item, ...updates } : item)
    }))
  }

  const removeSubEntity = (listKey: 'routes' | 'gavaliSuppliers' | 'gothaSuppliers', id: string) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as any[]).filter(item => item.id !== id)
    }))
  }

  // Helper for Gavali/Gotha deep fields
  const updateSupplierDetails = (listKey: 'gavaliSuppliers' | 'gothaSuppliers', suppId: string, updates: any) => {
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

  // --- Summary Dashboard Stats ---
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

    return {
      gavalis: totalGavalis,
      producers: totalProducers,
      cows: totalCows,
      buffaloes: totalBuffs,
      totalAnimals: totalCows + totalBuffs
    };
  }, [selectedCenter]);

  const filteredCenters = useMemo(() => {
    return (centers || []).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toString().includes(searchQuery)
    )
  }, [centers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 no-print">
        <div className="min-w-0">
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
        <Card className="lg:col-span-4 border shadow-2xl bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-3 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border border-muted-foreground/10 rounded-xl font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px] lg:h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-primary/5 transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase">{center.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md">ID: {center.code}</Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold">
                      <MapPin className="h-3 w-3" /> {center.address || "---"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center">
          {selectedCenter ? (
            <ScrollArea className="w-full h-full lg:max-h-[800px]">
              <div className="p-4 sm:p-8 space-y-6 animate-in slide-in-from-right-2 duration-300 printable-report flex flex-col items-center shadow-none w-full max-w-[210mm] mx-auto text-left bg-white origin-top transform-gpu">
                
                {/* Summary Dashboard at Top */}
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
                    <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] text-destructive border-destructive/20" onClick={() => handleDelete(selectedCenter.id)}><Trash2 className="h-4 w-4 mr-1.5" /> हटवा</Button>
                  </div>
                </div>

                <div className="w-full border-b-[4px] border-black pb-3 mb-6 text-center">
                  <h3 className="text-[18pt] sm:text-[22pt] font-black uppercase text-primary tracking-[0.1em]">{selectedCenter.name}</h3>
                  <p className="text-[10pt] sm:text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {selectedCenter.code} | चिलिंग सेंटर सविस्तर अहवाल</p>
                </div>
                
                {/* Main Chilling Info Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">१) प्राथमिक माहिती (PRIMARY)</h4>
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मालक नाव</span><span>{selectedCenter.ownerName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मोबाईल</span><span>{selectedCenter.mobile || "-"}</span></div>
                      <div className="flex flex-col gap-1"><span>पत्ता</span><span className="leading-tight">{selectedCenter.address || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>FSSAI क्र.</span><span>{selectedCenter.fssaiNumber || "-"}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">२) तांत्रिक सुविधा (TECHNICAL)</h4>
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>BMC | IBT</span><span>{selectedCenter.hasBmc ? "YES" : "NO"} | {selectedCenter.hasIbt ? "YES" : "NO"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>स्वच्छता ग्रेड</span><span className="text-emerald-600 font-black">{selectedCenter.hygieneGrade} GRADE</span></div>
                    </div>
                  </div>
                </div>

                {/* Chilling Routes Table */}
                <div className="w-full space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">३) रूट माहिती (ROUTES)</h4>
                  <table className="w-full border-2 border-black text-[9pt]">
                    <thead className="bg-slate-50">
                      <tr className="border-b-2 border-black font-black uppercase text-center">
                        <th className="p-2 border-r-2 border-black">रूट नाव</th>
                        <th className="p-2 border-r-2 border-black">उत्पादक</th>
                        <th className="p-2 border-r-2 border-black">गा/म्हे</th>
                        <th className="p-2 border-r-2 border-black">KM</th>
                        <th className="p-2">एरिया / गवळी</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCenter.routes || []).map((r, i) => (
                        <tr key={i} className="border-b border-black font-bold text-center">
                          <td className="p-2 border-r border-black text-left">{r.routeName}</td>
                          <td className="p-2 border-r border-black">{r.producerCount}</td>
                          <td className="p-2 border-r border-black">{r.cows}/{r.buffaloes}</td>
                          <td className="p-2 border-r border-black">{r.distanceKm}</td>
                          <td className="p-2 text-left">{r.collectionArea}<br/><span className="text-[7pt] opacity-60">गवळी: {r.milkmanNames}</span></td>
                        </tr>
                      ))}
                      {(!selectedCenter.routes || selectedCenter.routes.length === 0) && (
                        <tr><td colSpan={5} className="p-4 text-center italic opacity-30">रूट माहिती उपलब्ध नाही.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Chilling Gavali Table */}
                <div className="w-full space-y-4 mt-6">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">४) गवळी माहिती (GAVALI)</h4>
                  <table className="w-full border-2 border-black text-[9pt]">
                    <thead className="bg-slate-50">
                      <tr className="border-b-2 border-black font-black uppercase text-center">
                        <th className="p-2 border-r-2 border-black">नाव (ID)</th>
                        <th className="p-2 border-r-2 border-black">उत्पादक</th>
                        <th className="p-2 border-r-2 border-black">गाय (L)</th>
                        <th className="p-2 border-r-2 border-black">म्हेस (L)</th>
                        <th className="p-2">सब-गवळी</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCenter.gavaliSuppliers || []).map((g, i) => (
                        <tr key={i} className="border-b border-black font-bold text-center">
                          <td className="p-2 border-r border-black text-left">{g.name} ({g.supplierId})</td>
                          <td className="p-2 border-r border-black">{g.producer_center?.additional_details?.total_producers || 0}</td>
                          <td className="p-2 border-r border-black">{g.cowMilk?.quantity || 0}</td>
                          <td className="p-2 border-r border-black">{g.buffaloMilk?.quantity || 0}</td>
                          <td className="p-2 text-left">{(g.producer_center?.additional_details?.sub_gavali_info || []).length} नग</td>
                        </tr>
                      ))}
                      {(!selectedCenter.gavaliSuppliers || selectedCenter.gavaliSuppliers.length === 0) && (
                        <tr><td colSpan={5} className="p-4 text-center italic opacity-30">गवळी माहिती उपलब्ध नाही.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Chilling Gotha Table */}
                <div className="w-full space-y-4 mt-6">
                  <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em] border-b-2 border-black pb-1 mb-2">५) गोठा माहिती (GOTHA)</h4>
                  <table className="w-full border-2 border-black text-[9pt]">
                    <thead className="bg-slate-50">
                      <tr className="border-b-2 border-black font-black uppercase text-center">
                        <th className="p-2 border-r-2 border-black">गोठा नाव</th>
                        <th className="p-2 border-r-2 border-black">गा/म्हे</th>
                        <th className="p-2 border-r-2 border-black">एकूण दूध</th>
                        <th className="p-2">स्वच्छता</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCenter.gothaSuppliers || []).map((go, i) => (
                        <tr key={i} className="border-b border-black font-bold text-center">
                          <td className="p-2 border-r border-black text-left">{go.name}</td>
                          <td className="p-2 border-r border-black">{go.producer_center?.additional_details?.cows}/{go.producer_center?.additional_details?.buffalo}</td>
                          <td className="p-2 border-r border-black">{((go.cowMilk?.quantity || 0) + (go.buffaloMilk?.quantity || 0)).toFixed(1)} L</td>
                          <td className="p-2 uppercase">{go.hygieneGrade || 'A'} Grade</td>
                        </tr>
                      ))}
                      {(!selectedCenter.gothaSuppliers || selectedCenter.gothaSuppliers.length === 0) && (
                        <tr><td colSpan={4} className="p-4 text-center italic opacity-30">गोठा माहिती उपलब्ध नाही.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="w-full mt-auto pt-20 grid grid-cols-2 gap-20 text-center uppercase font-black text-[11pt] tracking-widest">
                  <div className="border-t-2 border-black pt-3">प्रादेशिक अधिकारी</div>
                  <div className="border-t-2 border-black pt-3">सेंटर इंचार्ज / मालक</div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Warehouse className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">चिलिंग सेंटर निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a chilling unit to view professional report</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh]">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन चिलिंग सेंटर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">पायाभूत सुविधा, तांत्रिक आणि सविस्तर सब-सेशन्स.</DialogDescription>
          </DialogHeader>

          {/* Sub-Section Navigation Tabs */}
          <div className="bg-slate-50 border-b flex overflow-x-auto no-print">
            {[
              { id: 'main', label: '१) मुख्य माहिती', icon: Warehouse },
              { id: 'routes', label: '२) रूट व्यवस्थापन', icon: Truck },
              { id: 'gavali', label: '३) गवळी माहिती', icon: Users },
              { id: 'gotha', label: '४) गोठा माहिती', icon: Building2 },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveSubTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 border-r transition-all",
                  activeSubTab === tab.id ? "bg-white text-primary border-b-2 border-b-primary" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-4 space-y-6 pb-20">
              
              {activeSubTab === 'main' && (
                <div className="space-y-6 max-w-[600px]">
                  <SectionTitle icon={Warehouse} title="१.१) प्राथमिक माहिती & परवाना" />
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">सेंटरचे नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालकाचे नाव</Label><Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">कोड नंबर *</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI क्रमांक</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">FSSAI मुदत</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black" /></div>
                  </div>

                  <SectionTitle icon={Droplets} title="१.२) तांत्रिक, स्वच्छता & दूध" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border-2 border-black"><Checkbox checked={formData.hasBmc} onCheckedChange={v => setFormData({...formData, hasBmc: !!v})} /><Label className="text-[9px] font-black">BMC उपलब्ध</Label></div>
                    <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border-2 border-black"><Checkbox checked={formData.hasIbt} onCheckedChange={v => setFormData({...formData, hasIbt: !!v})} /><Label className="text-[9px] font-black">IBT उपलब्ध</Label></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase">स्वच्छता ग्रेड</Label>
                      <Select value={formData.hygieneGrade} onValueChange={v => setFormData({...formData, hygieneGrade: v})}>
                        <SelectTrigger className="h-8 border-2 border-black font-black text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="A" className="font-bold">A Grade</SelectItem><SelectItem value="B" className="font-bold">B Grade</SelectItem><SelectItem value="C" className="font-bold">C Grade</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <Label className="text-[9px] font-black uppercase text-blue-600 block mb-1.5">गाय (Q/F/S)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={formData.cowMilk?.quantity} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, quantity: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                        <Input type="number" value={formData.cowMilk?.fat} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, fat: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                        <Input type="number" value={formData.cowMilk?.snf} onChange={e => setFormData({...formData, cowMilk: {...formData.cowMilk, snf: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                      <Label className="text-[9px] font-black uppercase text-amber-600 block mb-1.5">म्हेस (Q/F/S)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={formData.buffaloMilk?.quantity} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, quantity: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                        <Input type="number" value={formData.buffaloMilk?.fat} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, fat: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                        <Input type="number" value={formData.buffaloMilk?.snf} onChange={e => setFormData({...formData, buffaloMilk: {...formData.buffaloMilk, snf: Number(e.target.value)}})} className="h-8 border-black text-center font-black" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'routes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Truck} title="चिलिंग सेंटर रूट व्यवस्थापन" />
                    <Button size="sm" onClick={addRouteRow} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg"><Plus className="h-3 w-3 mr-1" /> रूट जोडा</Button>
                  </div>
                  <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm max-w-[800px]">
                    <ScrollArea className="w-full">
                      <Table className="min-w-[700px] text-[10px] uppercase">
                        <TableHeader className="bg-slate-50 font-black h-8">
                          <TableRow>
                            <TableHead className="px-2 text-center h-8">रूट नाव</TableHead>
                            <TableHead className="px-2 text-center h-8 w-16">उत्पादक</TableHead>
                            <TableHead className="px-2 text-center h-8 w-24">गा/म्हे संख्या</TableHead>
                            <TableHead className="px-2 text-center h-8 w-16">KM</TableHead>
                            <TableHead className="px-2 text-center h-8">एरिया / गवळी</TableHead>
                            <TableHead className="w-10 h-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(formData.routes || []).map((row) => (
                            <TableRow key={row.id} className="h-10">
                              <TableCell className="p-0 border-r border-black/10"><Input value={row.routeName} onChange={e => updateSubEntity('routes', row.id, { routeName: e.target.value })} className="h-8 border-none text-[11px] text-left p-2 bg-transparent font-bold" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.producerCount} onChange={e => updateSubEntity('routes', row.id, { producerCount: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10 flex items-center h-10 px-1 gap-1"><Input type="number" value={row.cows} onChange={e => updateSubEntity('routes', row.id, { cows: e.target.value })} className="h-7 border border-black/10 text-center text-[10px]" placeholder="G" /><Input type="number" value={row.buffaloes} onChange={e => updateSubEntity('routes', row.id, { buffaloes: e.target.value })} className="h-7 border border-black/10 text-center text-[10px]" placeholder="M" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.distanceKm} onChange={e => updateSubEntity('routes', row.id, { distanceKm: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black" /></TableCell>
                              <TableCell className="p-0 border-r border-black/10"><Input value={row.collectionArea} onChange={e => updateSubEntity('routes', row.id, { collectionArea: e.target.value })} className="h-8 border-none text-[10px] text-left p-2 bg-transparent font-medium" placeholder="एरिया / गवळी नावे" /></TableCell>
                              <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeSubEntity('routes', row.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></TableCell>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Users} title="गवळी माहिती (१६+ कलमी फॉर्म)" />
                    <Button size="sm" onClick={addGavaliRow} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg"><Plus className="h-3 w-3 mr-1" /> गवळी जोडा</Button>
                  </div>
                  <div className="space-y-6">
                    {(formData.gavaliSuppliers || []).map((g, gIndex) => (
                      <Card key={g.id} className="border-2 border-black overflow-hidden rounded-xl shadow-md max-w-[650px]">
                        <div className="p-2 bg-primary text-white flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase">गवळी #{gIndex + 1}: {g.name || '---'}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-white/50 hover:text-white" onClick={() => removeSubEntity('gavaliSuppliers', g.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="p-3 space-y-4 text-left">
                          <div className="grid grid-cols-2 gap-2">
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">नाव *</Label><Input value={g.name} onChange={e => updateSubEntity('gavaliSuppliers', g.id, { name: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">गवळी कोड</Label><Input value={g.supplierId} onChange={e => updateSubEntity('gavaliSuppliers', g.id, { supplierId: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">मोबाईल</Label><Input value={g.mobile} onChange={e => updateSubEntity('gavaliSuppliers', g.id, { mobile: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">पत्ता</Label><Input value={g.address} onChange={e => updateSubEntity('gavaliSuppliers', g.id, { address: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण उत्पादक</Label><Input type="number" value={g.producer_center?.additional_details?.total_producers || 0} onChange={e => updateSupplierDetails('gavaliSuppliers', g.id, { total_producers: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">सक्रिय</Label><Input type="number" value={g.producer_center?.additional_details?.active_producers || 0} onChange={e => updateSupplierDetails('gavaliSuppliers', g.id, { active_producers: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={g.producer_center?.additional_details?.cows || 0} onChange={e => updateSupplierDetails('gavaliSuppliers', g.id, { cows: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                             <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={g.producer_center?.additional_details?.buffalo || 0} onChange={e => updateSupplierDetails('gavaliSuppliers', g.id, { buffalo: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                          </div>
                          
                          {/* Sub-Gavali within Chilling-Gavali */}
                          <div className="space-y-2 border-t pt-2">
                             <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-indigo-700">सब-गवळी (SUB-GAVALI)</span><Button size="sm" variant="outline" onClick={() => addSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', { name: "", mobile: "", area: "", producers: 0, cow_qty: 0 })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                             <div className="border border-black rounded-lg overflow-hidden"><Table className="text-[9px]"><TableHeader className="bg-slate-50 h-6"><TableRow><TableHead className="h-6 px-1">नाव</TableHead><TableHead className="h-6 px-1">एरिया</TableHead><TableHead className="h-6 px-1 text-center">दूध</TableHead><TableHead className="h-6 w-8"></TableHead></TableRow></TableHeader><TableBody>
                                {(g.producer_center?.additional_details?.sub_gavali_info || []).map((sg: any) => (
                                  <TableRow key={sg.id} className="h-8"><TableCell className="p-0 border-r"><Input value={sg.name} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sg.id, { name: e.target.value })} className="h-7 border-none text-[10px] p-1 font-bold" /></TableCell><TableCell className="p-0 border-r"><Input value={sg.area} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sg.id, { area: e.target.value })} className="h-7 border-none text-[10px] p-1" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={sg.cow_qty} onChange={e => updateSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sg.id, { cow_qty: e.target.value })} className="h-7 border-none text-center text-[10px] font-black" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierTableRow('gavaliSuppliers', g.id, 'sub_gavali_info', sg.id)} className="h-6 w-6 text-rose-400"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                                ))}
                             </TableBody></Table></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'gotha' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <SectionTitle icon={Building2} title="गोठा माहिती (सविस्तर फॉर्म)" />
                    <Button size="sm" onClick={addGothaRow} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg"><Plus className="h-3 w-3 mr-1" /> गोठा जोडा</Button>
                  </div>
                  <div className="space-y-6">
                    {(formData.gothaSuppliers || []).map((go, goIndex) => (
                      <Card key={go.id} className="border-2 border-black overflow-hidden rounded-xl shadow-md max-w-[650px]">
                         <div className="p-2 bg-amber-600 text-white flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase">गोठा #{goIndex + 1}: {go.name || '---'}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-white/50 hover:text-white" onClick={() => removeSubEntity('gothaSuppliers', go.id)}><Trash2 className="h-4 w-4" /></Button>
                         </div>
                         <div className="p-3 space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-2">
                               <div className="space-y-0.5"><Label className="text-[8px] font-black">गोठा नाव *</Label><Input value={go.name} onChange={e => updateSubEntity('gothaSuppliers', go.id, { name: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black">मालक नाव</Label><Input value={go.operatorName} onChange={e => updateSubEntity('gothaSuppliers', go.id, { operatorName: e.target.value })} className="h-7 border border-black text-[10px] font-bold" /></div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                               <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई संख्या</Label><Input type="number" value={go.producer_center?.additional_details?.cows || 0} onChange={e => updateSupplierDetails('gothaSuppliers', go.id, { cows: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                               <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी संख्या</Label><Input type="number" value={go.producer_center?.additional_details?.buffalo || 0} onChange={e => updateSupplierDetails('gothaSuppliers', go.id, { buffalo: e.target.value })} className="h-7 border border-black text-center font-black" /></div>
                               <div className="col-span-2 space-y-0.5"><Label className="text-[8px] font-black">गोठा एरिया</Label><Input value={go.producer_center?.additional_details?.gotha_total_area || ""} onChange={e => updateSupplierDetails('gothaSuppliers', go.id, { gotha_total_area: e.target.value })} className="h-7 border border-black text-[10px]" /></div>
                            </div>

                            {/* Gotha Breed Table within Chilling-Gotha */}
                            <div className="space-y-2 border-t pt-2">
                               <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-700">जनावरे & ब्रीड (BREEDS)</span><Button size="sm" variant="outline" onClick={() => addSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', { breed: "", count: 0, avg_milk: 0 })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                               <div className="border border-black rounded-lg overflow-hidden"><Table className="text-[9px]"><TableHeader className="bg-slate-50 h-6"><TableRow><TableHead className="h-6 px-1">ब्रीड</TableHead><TableHead className="h-6 px-1 text-center">नग</TableHead><TableHead className="h-6 px-1 text-center">Avg(L)</TableHead><TableHead className="h-6 w-8"></TableHead></TableRow></TableHeader><TableBody>
                                  {(go.producer_center?.additional_details?.gotha_breed_info || []).map((b: any) => (
                                    <TableRow key={b.id} className="h-8"><TableCell className="p-0 border-r"><Input value={b.breed} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { breed: e.target.value })} className="h-7 border-none text-[10px] p-1 font-bold text-center" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.count} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { count: e.target.value })} className="h-7 border-none text-[10px] text-center font-black" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={b.avg_milk} onChange={e => updateSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id, { avg_milk: e.target.value })} className="h-7 border-none text-[10px] text-center font-black" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeSupplierTableRow('gothaSuppliers', go.id, 'gotha_breed_info', b.id)} className="h-6 w-6 text-rose-400"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                                  ))}
                               </TableBody></Table></div>
                            </div>
                         </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black tracking-widest bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-10 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-primary text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
