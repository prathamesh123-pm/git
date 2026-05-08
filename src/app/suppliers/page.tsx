"use client"

import { useState, useEffect, useMemo, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, Filter, Phone, Trash2, Milk, X, 
  Edit, CheckCircle2, Box, UserCheck, Wallet, User, Printer, ShieldCheck, Clock, Layers, TrendingDown,
  Building2, Activity, ClipboardCheck, ChevronDown, ChevronUp, Users2, PlusCircle, Briefcase, Info, ListPlus, MapPin, Sparkles, Laptop, Zap, Sun
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1 border-b pb-0.5 mb-1.5 mt-2", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3 w-3", color)} />}
    <h3 className={cn("text-[9px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const CompactTable = ({ title, data, columns, onAdd, onRemove, onUpdate, color = "text-primary" }: any) => (
  <div className="space-y-1.5 mb-3">
    <div className="flex items-center justify-between">
      <SectionTitle title={title} color={color} />
      <Button variant="outline" size="sm" onClick={onAdd} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button>
    </div>
    <div className="border border-black rounded-lg overflow-hidden shadow-sm">
      <ScrollArea className="w-full">
        <Table className="text-[9px] min-w-max">
          <TableHeader className="bg-slate-50 h-6">
            <TableRow>
              {columns.map((col: any) => (
                <TableHead key={col.key} className={cn("h-6 px-1 text-center font-black uppercase", col.className)}>{col.label}</TableHead>
              ))}
              <TableHead className="w-6 h-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((row: any) => (
              <TableRow key={row.id} className="h-8 border-t border-black/10">
                {columns.map((col: any) => (
                  <TableCell key={col.key} className="p-0 border-r border-black/5">
                    {col.type === 'number' ? (
                      <Input type="number" value={row[col.key] || 0} onChange={e => onUpdate(row.id, { [col.key]: e.target.value })} className="h-7 border-none text-center text-[10px] font-black bg-transparent" />
                    ) : (
                      <Input value={row[col.key] || ""} onChange={e => onUpdate(row.id, { [col.key]: e.target.value })} className="h-7 border-none text-[10px] px-1 bg-transparent font-medium" />
                    )}
                  </TableCell>
                ))}
                <TableCell className="p-0 text-center">
                  <Button variant="ghost" size="icon" onClick={() => onRemove(row.id)} className="h-6 w-6 text-rose-400 p-0"><X className="h-3 w-3"/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </div>
)

const ProducerCenterReportView = ({ supplier }: { supplier: Supplier }) => {
  const details = supplier.producer_center?.additional_details || {};

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2 text-left">
          <h4 className="text-[10px] font-black uppercase text-primary border-b border-black pb-0.5">३) संकलन वेळ & उत्पादक</h4>
          <div className="space-y-1 text-[11px] font-bold">
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>सकाळ वेळ</span><span>{details.morning_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>सायंकाळ वेळ</span><span>{details.evening_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>एकूण उत्पादक</span><span>{details.total_producers || 0}</span></div>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <h4 className="text-[10px] font-black uppercase text-primary border-b border-black pb-0.5">४) जनावरांची गणना</h4>
          <div className="grid grid-cols-2 gap-2 text-center">
             <div className="p-1.5 border border-black rounded bg-slate-50"><p className="text-[7px] font-black uppercase">गायी</p><p className="text-[11px] font-black">{details.cows || 0}</p></div>
             <div className="p-1.5 border border-black rounded bg-slate-50"><p className="text-[7px] font-black uppercase">म्हशी</p><p className="text-[11px] font-black">{details.buffalo || 0}</p></div>
             <div className="p-1.5 border border-black rounded bg-slate-900 text-white col-span-2 flex justify-between px-3"><span className="text-[7px] font-black uppercase">एकूण</span><span className="text-[11px] font-black">{details.total_animals || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

function SuppliersListPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: routes } = useCollection<Route>(routesQuery)
  const { data: suppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState<any>({
    supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
    supplierType: "Center", competition: "", additionalInfo: "",
    iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "", cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [], operatorName: "", foundation_year: "", spaceOwnership: "Self", hygieneGrade: "A",
    chemicalsStock: "", batteryCondition: "", morning_collection_time: "", evening_collection_time: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0", total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [], decreasingProducers: [], localGavliInfo: [], dairy_employees: [], lssFacilities: [],
    competitorFacilities: [], subRoutes: [], collectionAreas: [], internal_gothas: [], sub_gavali_info: [],
    gotha_total_area: "", gotha_fodder_area: "", gotha_milking_shift_morning: "", gotha_milking_shift_evening: "",
    gotha_breed_info: [], gotha_hygiene_checklist: {
      floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false, worker_hygiene: false, 
      proper_drainage: false, pest_control: false, clean_water_trough: false, health_records: false
    }
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Center", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      equipment: [], operatorName: "", foundation_year: "", spaceOwnership: "Self", hygieneGrade: "A",
      chemicalsStock: "", batteryCondition: "", morning_collection_time: "", evening_collection_time: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0", total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], localGavliInfo: [], dairy_employees: [], lssFacilities: [],
      competitorFacilities: [], subRoutes: [], collectionAreas: [], internal_gothas: [], sub_gavali_info: [],
      gotha_total_area: "", gotha_fodder_area: "", gotha_milking_shift_morning: "", gotha_milking_shift_evening: "",
      gotha_breed_info: [], gotha_hygiene_checklist: {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false, worker_hygiene: false, 
        proper_drainage: false, pest_control: false, clean_water_trough: false, health_records: false
      }
    })
  }, [])

  const handleOpenEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    const d = supp.producer_center?.additional_details || {};
    setFormData({
      ...supp,
      cowQty: String(supp.cowMilk?.quantity || 0),
      cowFat: String(supp.cowMilk?.fat || 0),
      cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0),
      bufFat: String(supp.buffaloMilk?.fat || 0),
      bufSnf: String(supp.buffaloMilk?.snf || 0),
      morning_collection_time: d.morning_collection_time || "",
      evening_collection_time: d.evening_collection_time || "",
      total_producers: String(d.total_producers || 0),
      active_producers: String(d.active_producers || 0),
      total_animals: String(d.total_animals || 0),
      cows: String(d.cows || 0),
      buffalo: String(d.buffalo || 0),
      calves: String(d.calves || 0),
      longTermProducers: d.long_term_producers || [],
      decreasingProducers: d.decreasing_producers || [],
      dairy_employees: d.dairy_employees || [],
      localGavliInfo: d.local_gavali || [],
      lssFacilities: d.lss_details || [],
      competitorFacilities: d.competitor_facilities || [],
      subRoutes: d.sub_routes || [],
      collectionAreas: d.collection_areas || [],
      sub_gavali_info: d.sub_gavali_info || [],
      internal_gothas: d.internal_gothas || [],
      gotha_breed_info: d.gotha_breed_info || []
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const additional_details = {
      morning_collection_time: formData.morning_collection_time || "",
      evening_collection_time: formData.evening_collection_time || "",
      total_producers: Number(formData.total_producers) || 0,
      active_producers: Number(formData.active_producers) || 0,
      total_animals: Number(formData.total_animals) || 0,
      cows: Number(formData.cows) || 0,
      buffalo: Number(formData.buffalo) || 0,
      calves: Number(formData.calves) || 0,
      long_term_producers: formData.longTermProducers || [],
      decreasing_producers: formData.decreasingProducers || [],
      dairy_employees: formData.dairy_employees || [],
      local_gavali: formData.localGavliInfo || [],
      lss_details: formData.lssFacilities || [],
      competitor_facilities: formData.competitorFacilities || [],
      sub_routes: formData.subRoutes || [],
      collection_areas: formData.collectionAreas || [],
      sub_gavali_info: formData.sub_gavali_info || [],
      internal_gothas: formData.internal_gothas || [],
      gotha_total_area: formData.gotha_total_area || "",
      gotha_fodder_area: formData.gotha_fodder_area || "",
      gotha_milking_shift_morning: formData.gotha_milking_shift_morning || "",
      gotha_milking_shift_evening: formData.gotha_milking_shift_evening || "",
      gotha_breed_info: formData.gotha_breed_info || [],
      gotha_hygiene_checklist: formData.gotha_hygiene_checklist || {}
    }

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty) || 0, fat: Number(formData.cowFat) || 0, snf: Number(formData.cowSnf) || 0 },
      buffaloMilk: { quantity: Number(formData.bufQty) || 0, fat: Number(formData.bufFat) || 0, snf: Number(formData.bufSnf) || 0 },
      producer_center: { additional_details },
      updatedAt: new Date().toISOString()
    }

    if (isAdding) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
      toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })
      setIsAdding(false)
    } else if (isEditing && selectedSupplier) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
      setIsEditing(false)
    }
    resetFormData()
  }

  const addRow = (key: string, initial: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: [...(prev[key] || []), { id: crypto.randomUUID(), ...initial }] }))
  }
  const removeRow = (key: string, id: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: (prev[key] || []).filter((r: any) => r.id !== id) }))
  }
  const updateRow = (key: string, id: string, updates: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: (prev[key] || []).map((r: any) => r.id === id ? { ...r, ...updates } : r) }))
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (s.name || "").toLowerCase().includes(q) || (s.mobile || "").includes(q) || (s.supplierId || "").toString().includes(q);
      const matchesRoute = routeFilter === 'all' || (routeFilter === 'none' ? !s.routeId : s.routeId === routeFilter);
      return matchesSearch && matchesRoute;
    })
  }, [suppliers, searchQuery, routeFilter])

  if (!mounted) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-full mx-auto w-full pb-10 px-1 animate-in fade-in duration-500 overflow-x-hidden text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 no-print">
        <div className="text-left">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> सप्लायर मास्टर (MASTER)
          </h2>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile Management</p>
        </div>
        <Button onClick={() => { resetFormData(); setIsAdding(true); }} className="gap-1 shadow-md h-9 px-4 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन सप्लायर
        </Button>
      </div>

      <Card className="border shadow-none rounded-xl overflow-hidden bg-white border-muted-foreground/10 p-1 no-print w-full">
        <div className="flex flex-col sm:flex-row gap-1.5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <Input placeholder="नाव किंवा कोड शोधा..." className="pl-8 h-8 rounded-lg bg-muted/10 border-2 border-black font-bold text-[10px] shadow-inner w-full" value={searchQuery || ""} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 rounded-lg bg-muted/10 border-2 border-black font-black text-[9px] uppercase">
              <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="रूट निवडा" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[9px] font-bold uppercase">सर्व रूट</SelectItem>
              {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[9px] font-bold uppercase">{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="w-full">
        {selectedSupplier ? (
          <div className="bg-white border-2 border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 flex flex-col items-center animate-in slide-in-from-right-2 duration-300 relative">
            <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2 flex-wrap gap-1">
              <Badge className="bg-primary/10 text-primary border-none uppercase text-[7px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[8px] px-2" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट</Button>
                <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[8px] px-2" onClick={() => handleOpenEdit(selectedSupplier)}><Edit className="h-3.5 w-3.5 mr-1" /> बदला</Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
              <h3 className="text-[16pt] font-black uppercase text-primary">{selectedSupplier.name}</h3>
              <p className="text-[9pt] font-black text-muted-foreground uppercase tracking-widest mt-0.5">ID: {selectedSupplier.supplierId} | {selectedSupplier.supplierType} अहवाल</p>
            </div>
            <ProducerCenterReportView supplier={selectedSupplier} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-black shadow-sm overflow-hidden no-print w-full">
            <Table className="min-w-full">
              <TableHeader><TableRow className="bg-muted/30 h-8"><TableHead className="font-black text-[9px] uppercase px-3 h-8">सप्लायर तपशील</TableHead><TableHead className="font-black text-[9px] uppercase text-center h-8">रूट</TableHead><TableHead className="font-black text-[9px] uppercase text-right px-3 h-8">क्रिया</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredSuppliers.map((supp) => (
                  <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 h-10" onClick={() => setSelectedSupplier(supp)}>
                    <TableCell className="py-1 px-3"><span className="font-black text-[11px] uppercase block">{supp.name || ""}</span><span className="text-[7px] font-black text-muted-foreground">ID: {supp.supplierId} | {supp.mobile}</span></TableCell>
                    <TableCell className="text-center"><Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase border-none bg-muted/50">{supp.routeId ? routes?.find(r => r.id === supp.routeId)?.name || '...' : 'Unassigned'}</Badge></TableCell>
                    <TableCell className="text-right px-3"><div className="flex gap-1 justify-end"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenEdit(supp); }}><Edit className="h-3.5 w-3.5" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isAdding || isEditing} onOpenChange={(open) => { if(!open) { setIsAdding(false); setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{isAdding ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 bg-white"><div className="p-3 space-y-6 pb-20"><div className="max-w-[850px] space-y-4">
            <div><SectionTitle icon={User} title="१) प्राथमिक माहिती" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">सप्लायर प्रकार</Label><Select value={formData.supplierType || "Center"} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}><SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Gavali">गवळी</SelectItem><SelectItem value="Gotha">गोठा</SelectItem><SelectItem value="Center">उत्पादक केंद्र</SelectItem></SelectContent></Select></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">स्थापना वर्ष (YYYY)</Label><Input value={formData.foundation_year || ""} onChange={e => setFormData({...formData, foundation_year: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
              </div>
            </div>

            {formData.supplierType === 'Gavali' && (
              <div className="space-y-4">
                <SectionTitle icon={Users2} title="सब-गवळी माहिती (SUB-GAVALI INFO)" color="text-indigo-600" />
                <Button size="sm" onClick={() => addRow('sub_gavali_info', { name: "", mobile: "", area: "", collection_type: "Spot", producers: 0, animals: 0, cow_qty: 0, remark: "" })} className="h-6 text-[8px] font-black bg-indigo-600 text-white rounded-lg">सब-गवळी जोडा</Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.sub_gavali_info.map((sg: any, idx: number) => (
                    <Card key={sg.id} className="border-2 border-indigo-100 p-2 space-y-2 bg-indigo-50/20">
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-1">
                        <Badge className="bg-indigo-600 h-4 text-[8px]">SG-{idx+1}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeRow('sub_gavali_info', sg.id)} className="h-6 w-6 text-rose-400"><Trash2 className="h-3.5 w-3.5"/></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input placeholder="नाव" value={sg.name} onChange={e => updateRow('sub_gavali_info', sg.id, { name: e.target.value })} className="h-7 text-[10px] border-black" />
                        <Input placeholder="मोबाईल" value={sg.mobile} onChange={e => updateRow('sub_gavali_info', sg.id, { mobile: e.target.value })} className="h-7 text-[10px] border-black" />
                        <Input placeholder="एरिया" value={sg.area} onChange={e => updateRow('sub_gavali_info', sg.id, { area: e.target.value })} className="h-7 text-[10px] border-black" />
                        <Select value={sg.collection_type} onValueChange={v => updateRow('sub_gavali_info', sg.id, { collection_type: v })}><SelectTrigger className="h-7 text-[9px] border-black"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Spot">Spot</SelectItem><SelectItem value="Route">Route</SelectItem></SelectContent></Select>
                        <Input placeholder="उत्पादक" type="number" value={sg.producers} onChange={e => updateRow('sub_gavali_info', sg.id, { producers: e.target.value })} className="h-7 text-[10px] border-black" />
                        <Input placeholder="गाय दूध" type="number" value={sg.cow_qty} onChange={e => updateRow('sub_gavali_info', sg.id, { cow_qty: e.target.value })} className="h-7 text-[10px] border-black" />
                      </div>
                    </Card>
                  ))}
                </div>
                <SectionTitle icon={Building2} title="अंतर्गत मोठे गोठे (INTERNAL GOTHAS)" color="text-amber-700" />
                <Button size="sm" onClick={() => addRow('internal_gothas', { owner_name: "", breeds: [], hygiene_checklist: {} })} className="h-6 text-[8px] font-black bg-amber-600 text-white rounded-lg">गोठा जोडा</Button>
                {formData.internal_gothas.map((g: any, idx: number) => (
                  <Card key={g.id} className="border-2 border-amber-100 p-2 space-y-2 bg-amber-50/10">
                    <div className="flex justify-between items-center border-b border-amber-100 pb-1">
                      <Badge className="bg-amber-600 h-4 text-[8px]">G-{idx+1}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeRow('internal_gothas', g.id)} className="h-6 w-6 text-rose-400"><Trash2 className="h-3.5 w-3.5"/></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                      <Input placeholder="मालक" value={g.owner_name} onChange={e => updateRow('internal_gothas', g.id, { owner_name: e.target.value })} className="h-7 text-[10px] border-black" />
                      <Input placeholder="कोड" value={g.code} onChange={e => updateRow('internal_gothas', g.id, { code: e.target.value })} className="h-7 text-[10px] border-black" />
                      <Input placeholder="लोकेशन" value={g.location} onChange={e => updateRow('internal_gothas', g.id, { location: e.target.value })} className="h-7 text-[10px] border-black" />
                    </div>
                    <div className="grid grid-cols-2 gap-2"><div className="space-y-1.5"><Label className="text-[7px] font-black">स्वच्छता चेकलिस्ट</Label><div className="grid grid-cols-2 gap-1 bg-white p-1 rounded border border-amber-100">{['floor_cleaned', 'animal_cleaned', 'utensils_sanitized', 'worker_hygiene'].map(k => (
                      <div key={k} className="flex items-center space-x-1"><Checkbox checked={g.hygiene_checklist?.[k] || false} onCheckedChange={v => { const current = g.hygiene_checklist || {}; updateRow('internal_gothas', g.id, { hygiene_checklist: { ...current, [k]: !!v } }) }} className="h-3 w-3" /><Label className="text-[6px]">{k.split('_')[0]}</Label></div>
                    ))}</div></div></div>
                  </Card>
                ))}
              </div>
            )}

            {formData.supplierType === 'Center' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सकाळ संकलन वेळ</Label><Input type="time" value={formData.morning_collection_time || ""} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time || ""} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || 0} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers || 0} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-2 border-black text-center text-emerald-600" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">एकूण जनावरे</Label><Input type="number" value={formData.total_animals || 0} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">गाई</Label><Input type="number" value={formData.cows || 0} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">म्हशी</Label><Input type="number" value={formData.buffalo || 0} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-50">वासरे</Label><Input type="number" value={formData.calves || 0} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                </div>
                <CompactTable title="२+ वर्ष जुने उत्पादक" data={formData.longTermProducers} columns={[{ key: 'producer_name', label: 'नाव' }, { key: 'previous_milk', label: 'जुने दूध', type: 'number' }, { key: 'current_milk', label: 'सध्याचे', type: 'number' }, { key: 'previous_animals', label: 'जुनी जनावरे', type: 'number' }, { key: 'current_animals', label: 'नवी', type: 'number' }]} onAdd={() => addRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} onRemove={(id: string) => removeRow('longTermProducers', id)} onUpdate={(id: string, u: any) => updateRow('longTermProducers', id, u)} />
                <CompactTable title="दूध घटलेले उत्पादक" data={formData.decreasingProducers} columns={[{ key: 'producer_name', label: 'नाव' }, { key: 'previous_milk', label: 'जुने दूध', type: 'number' }, { key: 'current_milk', label: 'नवे दूध', type: 'number' }, { key: 'reason', label: 'कारण' }]} onAdd={() => addRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, reason: "" })} onRemove={(id: string) => removeRow('decreasingProducers', id)} onUpdate={(id: string, u: any) => updateRow('decreasingProducers', id, u)} color="text-rose-600" />
                <CompactTable title="डेअरी कर्मचारी माहिती" data={formData.dairy_employees} columns={[{ key: 'name', label: 'नाव' }, { key: 'farming', label: 'शेती' }, { key: 'cow_count', label: 'गाई', type: 'number' }, { key: 'buf_count', label: 'म्हशी', type: 'number' }, { key: 'milk_ltr', label: 'दूध(L)', type: 'number' }, { key: 'supply_where', label: 'पुरवठा कोठे' }]} onAdd={() => addRow('dairy_employees', { name: "", farming: "", cow_count: 0, buf_count: 0, milk_ltr: 0, supply_where: "" })} onRemove={(id: string) => removeRow('dairy_employees', id)} onUpdate={(id: string, u: any) => updateRow('dairy_employees', id, u)} />
                <CompactTable title="स्थानिक गवळी माहिती" data={formData.localGavliInfo} columns={[{ key: 'name', label: 'नाव' }, { key: 'code', label: 'कोड' }, { key: 'cow_qty', label: 'गाय', type: 'number' }, { key: 'buf_qty', label: 'म्हेस', type: 'number' }, { key: 'producer_count', label: 'उत्पादक', type: 'number' }]} onAdd={() => addRow('localGavliInfo', { name: "", code: "", cow_qty: 0, buf_qty: 0, producer_count: 0 })} onRemove={(id: string) => removeRow('localGavliInfo', id)} onUpdate={(id: string, u: any) => updateRow('localGavliInfo', id, u)} />
                <CompactTable title="LSS & डेअरी सुविधा" data={formData.lssFacilities} columns={[{ key: 'facility_name', label: 'सुविधा नाव' }, { key: 'status', label: 'स्थिती' }, { key: 'remark', label: 'शेरा' }]} onAdd={() => addRow('lssFacilities', { facility_name: "", status: "", remark: "" })} onRemove={(id: string) => removeRow('lssFacilities', id)} onUpdate={(id: string, u: any) => updateRow('lssFacilities', id, u)} />
                <CompactTable title="स्पर्धक डेअरी माहिती" data={formData.competitorFacilities} columns={[{ key: 'dairy_name', label: 'डेअरी नाव' }, { key: 'cow_rate', label: 'गाय दूध' }, { key: 'buf_rate', label: 'म्हेस दूध' }, { key: 'rate', label: 'दर (₹)', type: 'number' }, { key: 'facility', label: 'सुविधा' }]} onAdd={() => addRow('competitorFacilities', { dairy_name: "", cow_rate: "", buf_rate: "", rate: 0, facility: "" })} onRemove={(id: string) => removeRow('competitorFacilities', id)} onUpdate={(id: string, u: any) => updateRow('competitorFacilities', id, u)} color="text-amber-600" />
                <CompactTable title="अंतर्गत उप-रूट माहिती" data={formData.subRoutes} columns={[{ key: 'vehicle', label: 'गाडी' }, { key: 'km', label: 'किमी', type: 'number' }, { key: 'area', label: 'परिसर' }, { key: 'producers', label: 'उत्पादक', type: 'number' }, { key: 'milk_ltr', label: 'दूध(L)', type: 'number' }]} onAdd={() => addRow('subRoutes', { vehicle: "", km: 0, area: "", producers: 0, milk_ltr: 0 })} onRemove={(id: string) => removeRow('subRoutes', id)} onUpdate={(id: string, u: any) => updateRow('subRoutes', id, u)} />
                <div className="grid grid-cols-1 gap-2"><Textarea placeholder="दूध कमी होण्याची कारणे" value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="h-10 text-[9px] border-2 border-black" /><Textarea placeholder="सेंटरने केलेले प्रयत्न" value={formData.efforts_taken} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="h-10 text-[9px] border-2 border-black" /><Textarea placeholder="दूध वाढवण्यासाठी उपाय" value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="h-10 text-[9px] border-2 border-black" /></div>
              </div>
            )}

            {formData.supplierType === 'Gotha' && (
              <div className="space-y-4">
                <SectionTitle icon={MapPin} title="२) गोठा आकारमान & दूध वेळ" color="text-amber-700" />
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण एरिया</Label><Input placeholder="उदा. १० गुंठे" value={formData.gotha_total_area || ""} onChange={e => setFormData({...formData, gotha_total_area: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">चारा एरिया</Label><Input placeholder="उदा. २ एकर" value={formData.gotha_fodder_area || ""} onChange={e => setFormData({...formData, gotha_fodder_area: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_morning || ""} onChange={e => setFormData({...formData, gotha_milking_shift_morning: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सायंकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_evening || ""} onChange={e => setFormData({...formData, gotha_milking_shift_evening: e.target.value})} className="h-8 border-2 border-black" /></div>
                </div>
                <CompactTable title="जनावरे & ब्रीड माहिती" data={formData.gotha_breed_info} columns={[{ key: 'breed', label: 'ब्रीड (जात)' }, { key: 'count', label: 'संख्या', type: 'number' }, { key: 'avg_milk', label: 'सरासरी दूध (L)', type: 'number' }]} onAdd={() => addRow('gotha_breed_info', { breed: "", count: 0, avg_milk: 0 })} onRemove={(id: string) => removeRow('gotha_breed_info', id)} onUpdate={(id: string, u: any) => updateRow('gotha_breed_info', id, u)} />
                <div className="space-y-1.5"><SectionTitle icon={ClipboardCheck} title="गोठा स्वच्छता चेकलिस्ट" color="text-emerald-700" /><div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  {['floor_cleaned', 'animal_cleaned', 'utensils_sanitized', 'worker_hygiene', 'proper_drainage', 'pest_control', 'clean_water_trough', 'health_records'].map(k => (
                    <div key={k} className="flex items-center space-x-1.5 bg-white p-1 rounded border border-emerald-100"><Checkbox checked={formData.gotha_hygiene_checklist?.[k] || false} onCheckedChange={v => setFormData({...formData, gotha_hygiene_checklist: {...formData.gotha_hygiene_checklist, [k]: !!v}})} className="h-3.5 w-3.5" /><Label className="text-[7px] font-bold uppercase">{k.replace('_', ' ')}</Label></div>
                  ))}
                </div></div>
              </div>
            )}

            <div><SectionTitle icon={ShieldCheck} title="परवाना & तांत्रिक" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="space-y-0.5"><Label className="text-[8px] font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand || ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border-2 border-black" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-2 border-black" /></div>
              </div>
            </div>

            <div><SectionTitle icon={Wallet} title="व्यावसायिक & दूध तपशील" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50/50 p-1.5 border border-blue-100 rounded-lg">
                   <Label className="text-[8px] font-black text-blue-600 block mb-1">गाय दूध (Q/F/S)</Label>
                   <div className="grid grid-cols-3 gap-1"><Input type="number" value={formData.cowQty || 0} onChange={e => setFormData({...formData, cowQty: e.target.value})} placeholder="Qty" className="h-7 text-center border-black" /><Input type="number" value={formData.cowFat || 0} onChange={e => setFormData({...formData, cowFat: e.target.value})} placeholder="Fat" className="h-7 text-center border-black" /><Input type="number" value={formData.cowSnf || 0} onChange={e => setFormData({...formData, cowSnf: e.target.value})} placeholder="SNF" className="h-7 text-center border-black" /></div>
                </div>
                <div className="bg-amber-50/50 p-1.5 border border-amber-100 rounded-lg">
                   <Label className="text-[8px] font-black text-amber-600 block mb-1">म्हेस दूध (Q/F/S)</Label>
                   <div className="grid grid-cols-3 gap-1"><Input type="number" value={formData.bufQty || 0} onChange={e => setFormData({...formData, bufQty: e.target.value})} placeholder="Qty" className="h-7 text-center border-black" /><Input type="number" value={formData.bufFat || 0} onChange={e => setFormData({...formData, bufFat: e.target.value})} placeholder="Fat" className="h-7 text-center border-black" /><Input type="number" value={formData.bufSnf || 0} onChange={e => setFormData({...formData, bufSnf: e.target.value})} placeholder="SNF" className="h-7 text-center border-black" /></div>
                </div>
              </div>
            </div>

            <div><SectionTitle icon={Box} title="इन्व्हेन्टरी & स्टेटस" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Laptop className={cn("h-4 w-4", formData.computerAvailable ? 'text-primary' : 'text-slate-300')} /><Label className="text-[7px] font-black">POP: {formData.computerAvailable ? 'YES' : 'NO'}</Label></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Zap className={cn("h-4 w-4", formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-300')} /><Label className="text-[7px] font-black">UPS: {formData.upsInverterAvailable ? 'YES' : 'NO'}</Label></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5"><Label className="text-[7px] font-black">CANS</Label><Input type="number" value={formData.milkCansCount || 0} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 text-[10px] text-center" /></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5"><Label className="text-[7px] font-black">ICE (बर्फ)</Label><Input type="number" value={formData.iceBlocks || 0} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-6 text-[10px] text-center" /></div>
              </div>
              <div className="mt-2"><Label className="text-[8px] font-black uppercase opacity-60">भेसळ तपासणी कीट</Label><Input value={formData.adulterationKitInfo || ""} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-7 text-[10px] border-2 border-black" /></div>
              <CompactTable title="साहित्याची यादी (ASSETS)" data={formData.equipment} columns={[{ key: 'name', label: 'साहित्य' }, { key: 'quantity', label: 'नग', type: 'number' }, { key: 'ownership', label: 'मालकी' }]} onAdd={() => addRow('equipment', { name: "", quantity: 1, ownership: "Company" })} onRemove={(id: string) => removeRow('equipment', id)} onUpdate={(id: string, u: any) => updateRow('equipment', id, u)} />
            </div>

            <div className="space-y-0.5 pt-2"><Label className="text-[8px] font-black uppercase opacity-60">विशेष शेरा (REMARK)</Label><Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-12 text-[10px] border-2 border-black p-2" /></div>
          </div></div><ScrollBar orientation="horizontal" /></ScrollArea>
          <DialogFooter className="p-2 border-t bg-muted/10 flex flex-row gap-2 shrink-0">
            <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); resetFormData(); }} className="flex-1 h-9 rounded-xl font-black uppercase text-[10px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-9 rounded-xl shadow-lg shadow-primary/20 font-black uppercase text-[10px] bg-primary text-white">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersListPage /></Suspense>
}
