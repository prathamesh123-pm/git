"use client"

import { useState, useEffect, useMemo, Suspense, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem, SupplierType, Route } from "@/lib/types"
import { 
  Plus, Search, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2, Milk, Box, Wallet, 
  ShieldCheck, Printer, CheckCircle2, Clock, Layers, Users, TrendingDown, 
  IndianRupee, History, Briefcase, Info, FileText, MapPin, Lightbulb, PlusCircle, ListPlus, Sparkles, Building2,
  Activity, ClipboardCheck, ChevronUp, ChevronDown, Users2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

function RouteDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const currentRouteId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'suppliers')
  }, [db, user])

  const { data: allRoutes } = useCollection<Route>(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const route = useMemo(() => allRoutes?.find(r => r.id === currentRouteId), [allRoutes, currentRouteId])
  const suppliersList = useMemo(() => allSuppliers?.filter(s => s.routeId === currentRouteId) || [], [allSuppliers, currentRouteId])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<any>({
    supplierId: "", name: "", address: "", mobile: "", routeId: currentRouteId, 
    supplierType: "Center", competition: "", additionalInfo: "",
    iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "", cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [], operatorName: "", foundation_year: "", spaceOwnership: "Self", hygieneGrade: "A",
    chemicalsStock: "", batteryCondition: "", morning_collection_time: "", evening_collection_time: "",
    total_producers: "0", active_producers: "0", total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [], decreasingProducers: [], localGavliInfo: [], dairy_employees: [], lssFacilities: [],
    competitorFacilities: [], subRoutes: [], collectionAreas: [], internal_gothas: [], sub_gavali_info: [],
    gotha_total_area: "", gotha_fodder_area: "", gotha_milking_shift_morning: "", gotha_milking_shift_evening: "",
    gotha_breed_info: [], gotha_hygiene_checklist: {
      floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false, worker_hygiene: false, 
      proper_drainage: false, pest_control: false, clean_water_trough: false, health_records: false
    }
  })

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: currentRouteId, 
      supplierType: "Center", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      equipment: [], operatorName: "", foundation_year: "", spaceOwnership: "Self", hygieneGrade: "A",
      chemicalsStock: "", batteryCondition: "", morning_collection_time: "", evening_collection_time: "",
      total_producers: "0", active_producers: "0", total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], localGavliInfo: [], dairy_employees: [], lssFacilities: [],
      competitorFacilities: [], subRoutes: [], collectionAreas: [], internal_gothas: [], sub_gavali_info: [],
      gotha_total_area: "", gotha_fodder_area: "", gotha_milking_shift_morning: "", gotha_milking_shift_evening: "",
      gotha_breed_info: [], gotha_hygiene_checklist: {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false, worker_hygiene: false, 
        proper_drainage: false, pest_control: false, clean_water_trough: false, health_records: false
      }
    })
  }, [currentRouteId])

  const handleOpenAdd = () => {
    setDialogMode('add'); setEditingId(null);
    resetFormData();
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (supp: Supplier) => {
    setDialogMode('edit'); setEditingId(supp.id);
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
    setIsDialogOpen(true)
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

    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
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

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => (s.name || "").toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-2 max-w-6xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-2 no-print gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push('/routes')} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-xs font-black uppercase truncate">{route?.name || "रूट माहिती"}</h2>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="h-8 px-3 rounded-lg font-black uppercase text-[10px] w-full sm:w-auto shadow-md">
          <Plus className="h-3.5 w-3.5 mr-1" /> नवीन सप्लायर
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-xl overflow-hidden no-print">
          <div className="p-1.5 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border border-muted-foreground/20 rounded-lg font-bold uppercase outline-none focus:ring-1 focus:ring-primary" value={searchQuery || ""} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[150px] lg:h-[600px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={cn("p-2 cursor-pointer hover:bg-primary/5 transition-all", selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : '')}>
                  <h4 className="font-black text-[10px] uppercase truncate">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5"><Badge variant="outline" className="h-3 px-1 text-[7px] font-black border-none bg-muted/50">ID: {s.supplierId}</Badge><span className="text-[7px] text-muted-foreground font-bold truncate uppercase">{s.address}</span></div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden min-h-[300px] flex flex-col items-center">
          {selectedSupplier ? (
            <ScrollArea className="w-full h-full">
              <div className="p-3 sm:p-6 space-y-4 printable-report bg-white text-left max-w-[210mm] mx-auto border-[1.5px] border-black m-2">
                <div className="flex justify-between items-center no-print border-b pb-1 mb-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[7px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 text-[7px] font-black uppercase px-1.5" onClick={() => window.print()}><Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[7px] font-black uppercase px-1.5" onClick={() => handleOpenEdit(selectedSupplier)}><Edit className="h-3.5 w-3.5 mr-1" /> बदला</Button>
                  </div>
                </div>
                <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
                  <h3 className="text-[18pt] font-black uppercase text-primary">{selectedSupplier.name}</h3>
                  <p className="text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-0.5">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType} अहवाल</p>
                </div>
                <ProducerCenterReportView supplier={selectedSupplier} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center"><Users className="h-16 w-16 mb-4" /><h4 className="font-black uppercase tracking-[0.3em] text-sm">सप्लायर निवडा</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 bg-white"><div className="p-3 space-y-6 pb-20"><div className="max-w-[850px] space-y-4">
            <div><SectionTitle icon={User} title="१) प्राथमिक माहिती" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">सप्लायर प्रकार</Label><Select value={formData.supplierType || "Center"} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}><SelectTrigger className="h-8 border-2 border-black font-black text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Gavali">गवळी</SelectItem><SelectItem value="Gotha">गोठा</SelectItem><SelectItem value="Center">उत्पादक केंद्र</SelectItem></SelectContent></Select></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-[10px]" /></div>
              </div>
            </div>

            {formData.supplierType === 'Gavali' && (
              <div className="space-y-4">
                <CompactTable title="सब-गवळी माहिती (SUB-GAVALI)" data={formData.sub_gavali_info} columns={[{ key: 'name', label: 'नाव' }, { key: 'mobile', label: 'मोबाईल' }, { key: 'area', label: 'एरिया' }, { key: 'cow_milk', label: 'दूध', type: 'number' }]} onAdd={() => addRow('sub_gavali_info', { name: "", mobile: "", area: "", cow_milk: 0 })} onRemove={(id: string) => removeRow('sub_gavali_info', id)} onUpdate={(id: string, u: any) => updateRow('sub_gavali_info', id, u)} color="text-indigo-600" />
                <div className="space-y-1.5"><SectionTitle icon={Building2} title="अंतर्गत मोठे गोठे" color="text-amber-700" /><Button size="sm" onClick={() => addRow('internal_gothas', { owner_name: "", isOpen: true })} className="h-6 text-[8px] font-black bg-amber-600 text-white rounded-lg">गोठा जोडा</Button>
                  {formData.internal_gothas.map((g: any) => (
                    <div key={g.id} className="border border-amber-200 p-2 rounded-lg bg-amber-50/30">
                       <div className="grid grid-cols-2 gap-2"><Input placeholder="मालक नाव" value={g.owner_name || ""} onChange={e => updateRow('internal_gothas', g.id, { owner_name: e.target.value })} className="h-7 border-black text-[10px]" /><Button variant="ghost" onClick={() => removeRow('internal_gothas', g.id)} className="h-7 w-7 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.supplierType === 'Center' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || 0} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">सक्रिय</Label><Input type="number" value={formData.active_producers || 0} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-2 border-black text-center text-emerald-600" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई</Label><Input type="number" value={formData.cows || 0} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी</Label><Input type="number" value={formData.buffalo || 0} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black text-center" /></div>
                </div>
                <CompactTable title="२+ वर्ष जुने उत्पादक" data={formData.longTermProducers} columns={[{ key: 'producer_name', label: 'नाव' }, { key: 'previous_milk', label: 'जुने', type: 'number' }, { key: 'current_milk', label: 'नवे', type: 'number' }]} onAdd={() => addRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0 })} onRemove={(id: string) => removeRow('longTermProducers', id)} onUpdate={(id: string, u: any) => updateRow('longTermProducers', id, u)} />
                <CompactTable title="दूध घटलेले उत्पादक" data={formData.decreasingProducers} columns={[{ key: 'producer_name', label: 'नाव' }, { key: 'previous_milk', label: 'जुने', type: 'number' }, { key: 'current_milk', label: 'नवे', type: 'number' }, { key: 'reason', label: 'कारण' }]} onAdd={() => addRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, reason: "" })} onRemove={(id: string) => removeRow('decreasingProducers', id)} onUpdate={(id: string, u: any) => updateRow('decreasingProducers', id, u)} color="text-rose-600" />
                <CompactTable title="डेअरी कर्मचारी" data={formData.dairy_employees} columns={[{ key: 'name', label: 'नाव' }, { key: 'milk_ltr', label: 'दूध', type: 'number' }, { key: 'supply_where', label: 'कोठे' }]} onAdd={() => addRow('dairy_employees', { name: "", milk_ltr: 0, supply_where: "" })} onRemove={(id: string) => removeRow('dairy_employees', id)} onUpdate={(id: string, u: any) => updateRow('dairy_employees', id, u)} />
                <CompactTable title="स्पर्धक डेअरी" data={formData.competitorFacilities} columns={[{ key: 'dairy_name', label: 'नाव' }, { key: 'rate', label: 'दर', type: 'number' }, { key: 'facility', label: 'सुविधा' }]} onAdd={() => addRow('competitorFacilities', { dairy_name: "", rate: 0, facility: "" })} onRemove={(id: string) => removeRow('competitorFacilities', id)} onUpdate={(id: string, u: any) => updateRow('competitorFacilities', id, u)} color="text-amber-600" />
              </div>
            )}

            {formData.supplierType === 'Gotha' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण एरिया</Label><Input value={formData.gotha_total_area || ""} onChange={e => setFormData({...formData, gotha_total_area: e.target.value})} className="h-8 border-2 border-black" /></div>
                   <div className="space-y-0.5"><Label className="text-[8px] font-black">चारा एरिया</Label><Input value={formData.gotha_fodder_area || ""} onChange={e => setFormData({...formData, gotha_fodder_area: e.target.value})} className="h-8 border-2 border-black" /></div>
                </div>
                <CompactTable title="जनावरे & ब्रीड माहिती" data={formData.gotha_breed_info} columns={[{ key: 'breed', label: 'ब्रीड' }, { key: 'count', label: 'संख्या', type: 'number' }, { key: 'avg_milk', label: 'सरासरी', type: 'number' }]} onAdd={() => addRow('gotha_breed_info', { breed: "", count: 0, avg_milk: 0 })} onRemove={(id: string) => removeRow('gotha_breed_info', id)} onUpdate={(id: string, u: any) => updateRow('gotha_breed_info', id, u)} />
                <div className="space-y-1"><SectionTitle icon={ClipboardCheck} title="स्वच्छता चेकलिस्ट" color="text-emerald-700" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  {['floor_cleaned', 'animal_cleaned', 'worker_hygiene', 'health_records'].map(k => (
                    <div key={k} className="flex items-center space-x-1 bg-white p-1 rounded border border-emerald-100"><Checkbox checked={formData.gotha_hygiene_checklist?.[k] || false} onCheckedChange={v => setFormData({...formData, gotha_hygiene_checklist: {...formData.gotha_hygiene_checklist, [k]: !!v}})} className="h-3.5 w-3.5" /><Label className="text-[7px] font-bold uppercase">{k.replace('_', ' ')}</Label></div>
                  ))}
                </div></div>
              </div>
            )}

            <div><SectionTitle icon={ShieldCheck} title="तांत्रिक & दूध तपशील" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <div className="space-y-0.5"><Label className="text-[8px] font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black" /></div>
                <div className="space-y-0.5"><Label className="text-[8px] font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand || ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border-2 border-black" /></div>
                <div className="bg-blue-50/50 p-1.5 border border-blue-100 rounded-lg col-span-2">
                   <Label className="text-[8px] font-black text-blue-600 block mb-1">गाय (Q/F/S)</Label>
                   <div className="grid grid-cols-3 gap-1"><Input value={formData.cowQty || ""} onChange={e => setFormData({...formData, cowQty: e.target.value})} placeholder="L" className="h-7 text-center border-black" /><Input value={formData.cowFat || ""} onChange={e => setFormData({...formData, cowFat: e.target.value})} placeholder="F" className="h-7 text-center border-black" /><Input value={formData.cowSnf || ""} onChange={e => setFormData({...formData, cowSnf: e.target.value})} placeholder="S" className="h-7 text-center border-black" /></div>
                </div>
              </div>
            </div>

            <div><SectionTitle icon={Box} title="इन्व्हेन्टरी & स्टेटस" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Laptop className={cn("h-4 w-4", formData.computerAvailable ? 'text-primary' : 'text-slate-300')} /><Label className="text-[7px] font-black">POP: {formData.computerAvailable ? 'YES' : 'NO'}</Label></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Zap className={cn("h-4 w-4", formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-300')} /><Label className="text-[7px] font-black">UPS: {formData.upsInverterAvailable ? 'YES' : 'NO'}</Label></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5"><Label className="text-[7px] font-black">CANS</Label><Input type="number" value={formData.milkCansCount || 0} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-6 text-[10px] text-center" /></div>
                 <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5"><Label className="text-[7px] font-black">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks || 0} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-6 text-[10px] text-center" /></div>
              </div>
            </div>

            <div className="space-y-0.5 pt-2"><Label className="text-[8px] font-black uppercase opacity-60">विशेष शेरा</Label><Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-12 text-[10px] border-2 border-black p-2" /></div>
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

export default function Page() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><RouteDetailsContent /></Suspense>
}
