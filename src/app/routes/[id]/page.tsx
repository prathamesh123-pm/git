
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
  <div className={cn("flex items-center gap-1.5 border-b pb-1 mb-2 mt-3", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3.5 w-3.5", color)} />}
    <h3 className={cn("text-[10px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const ProducerCenterReportView = ({ supplier }: { supplier: Supplier }) => {
  const details = supplier.producer_center?.additional_details || {};

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div className="space-y-4 text-left">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">३) संकलन वेळ & उत्पादक</h4>
          <div className="space-y-2 text-[12px] font-bold">
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सकाळ वेळ</span><span>{details.morning_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सायंकाळ वेळ</span><span>{details.evening_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>एकूण उत्पादक</span><span>{details.total_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>सक्रिय उत्पादक</span><span className="text-emerald-600">{details.active_producers || 0}</span></div>
          </div>
        </div>
        <div className="space-y-4 text-left">
          <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1 mb-2">४) जनावरांची गणना</h4>
          <div className="grid grid-cols-2 gap-3 text-center">
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black uppercase">गायी</p><p className="text-[12px] font-black">{details.cows || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black uppercase">म्हशी</p><p className="text-[12px] font-black">{details.buffalo || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-50"><p className="text-[8px] font-black uppercase">वासरे</p><p className="text-[12px] font-black">{details.calves || 0}</p></div>
             <div className="p-2 border border-black rounded bg-slate-900 text-white"><p className="text-[8px] font-black uppercase">एकूण</p><p className="text-[12px] font-black">{details.total_animals || 0}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-left">
         <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">५) २+ वर्ष जुने उत्पादक</h4>
         <div className="overflow-x-auto border-2 border-black rounded-lg">
           <table className="w-full border-collapse text-[10px] min-w-[500px]">
             <thead className="bg-slate-100 font-black">
               <tr className="border-b-2 border-black text-center">
                 <th className="p-2 border-r border-black text-left">नाव</th>
                 <th className="p-2 border-r border-black">जुने दूध</th>
                 <th className="p-2 border-r border-black">सध्याचे दूध</th>
                 <th className="p-2 border-r border-black">जुनी जनावरे</th>
                 <th className="p-2">नवी जनावरे</th>
               </tr>
             </thead>
             <tbody>
               {(details.long_term_producers || []).map((p: any, i: number) => (
                 <tr key={i} className="border-b border-black font-bold text-center">
                   <td className="p-2 border-r border-black text-left">{p.producer_name}</td>
                   <td className="p-2 border-r border-black">{p.previous_milk} L</td>
                   <td className="p-2 border-r border-black">{p.current_milk} L</td>
                   <td className="p-2 border-r border-black">{p.previous_animals}</td>
                   <td className="p-2">{p.current_animals}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-24 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
        <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
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
    name: "", supplierId: "", address: "", mobile: "", operatorName: "",
    routeId: currentRouteId,
    supplierType: "Center", fssaiNumber: "", fssaiExpiry: "",
    scaleBrand: "", fatMachineBrand: "", chemicalsStock: "", batteryCondition: "",
    paymentCycle: "10 Days", spaceOwnership: "Self", hygieneGrade: "A",
    competition: "", cattleFeedBrand: "None", iceBlocks: "0",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "", additionalNotes: "", equipment: [],
    morning_collection_time: "", evening_collection_time: "", start_year: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [], decreasingProducers: [], highCapacityProducers: [],
    highMilkProducers: [], localEmployees: [], localGavliInfo: [],
    lssFacilities: [], competitorFacilities: [], subRoutes: [],
    collectionAreas: [],
    milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
    internal_gothas: [], sub_gavali_info: [],
    gotha_total_area: "", gotha_fodder_area: "", gotha_purchase_source: "", gotha_previous_dairy: "",
    gotha_breed_info: [], gotha_worker_info: [], gotha_fodder_management: "",
    gotha_milking_shift_morning: "", gotha_milking_shift_evening: "", gotha_hygiene_remark: "",
    gotha_hygiene_checklist: {
      floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
      worker_hygiene: false, proper_drainage: false, pest_control: false,
      clean_water_trough: false, health_records: false
    }
  })

  const resetFormData = useCallback(() => {
    setFormData({
      name: "", supplierId: "", address: "", mobile: "", operatorName: "",
      routeId: currentRouteId,
      supplierType: "Center", fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", paymentCycle: "10 Days", spaceOwnership: "Self",
      hygieneGrade: "A", competition: "", cattleFeedBrand: "None", iceBlocks: "0",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", additionalNotes: "", equipment: [],
      morning_collection_time: "", evening_collection_time: "", start_year: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], highCapacityProducers: [],
      highMilkProducers: [], localEmployees: [], localGavliInfo: [],
      lssFacilities: [], competitorFacilities: [], subRoutes: [],
      collectionAreas: [],
      milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
      internal_gothas: [], sub_gavali_info: [],
      gotha_total_area: "", gotha_fodder_area: "", gotha_purchase_source: "", gotha_previous_dairy: "",
      gotha_breed_info: [], gotha_worker_info: [], gotha_fodder_management: "",
      gotha_milking_shift_morning: "", gotha_milking_shift_evening: "", gotha_hygiene_remark: "",
      gotha_hygiene_checklist: {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
        worker_hygiene: false, proper_drainage: false, pest_control: false,
        clean_water_trough: false, health_records: false
      }
    })
  }, [currentRouteId])

  const handleOpenAdd = () => {
    setDialogMode('add'); setEditingId(null);
    resetFormData();
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (s: Supplier) => {
    setDialogMode('edit'); setEditingId(s.id);
    const d = s.producer_center?.additional_details || {};
    setFormData({
      ...s,
      cowQty: String(s.cowMilk?.quantity || 0),
      cowFat: String(s.cowMilk?.fat || 0),
      cowSnf: String(s.cowMilk?.snf || 0),
      bufQty: String(s.buffaloMilk?.quantity || 0),
      bufFat: String(s.buffaloMilk?.fat || 0),
      bufSnf: String(s.buffaloMilk?.snf || 0),
      morning_collection_time: d.morning_collection_time || "",
      evening_collection_time: d.evening_collection_time || "",
      start_year: d.start_year || "",
      total_producers: String(d.total_producers || 0),
      active_producers: String(d.active_producers || 0),
      total_animals: String(d.total_animals || 0),
      cows: String(d.cows || 0),
      buffalo: String(d.buffalo || 0),
      calves: String(d.calves || 0),
      longTermProducers: d.long_term_producers || [],
      decreasingProducers: d.decreasing_producers || [],
      sub_gavali_info: d.sub_gavali_info || [],
      internal_gothas: d.internal_gothas || []
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" });
      return;
    }
    
    const additional_details = {
      morning_collection_time: formData.morning_collection_time,
      evening_collection_time: formData.evening_collection_time,
      start_year: formData.start_year,
      total_producers: Number(formData.total_producers),
      active_producers: Number(formData.active_producers),
      total_animals: Number(formData.total_animals),
      cows: Number(formData.cows),
      buffalo: Number(formData.buffalo),
      calves: Number(formData.calves),
      long_term_producers: formData.longTermProducers,
      decreasing_producers: formData.decreasingProducers,
      sub_gavali_info: formData.sub_gavali_info,
      internal_gothas: formData.internal_gothas
    };

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      producer_center: (formData.supplierType === 'Center' || formData.supplierType === 'Gavali' || formData.supplierType === 'Gotha') ? { additional_details } : null,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
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

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])

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
              <input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border border-muted-foreground/20 rounded-lg font-bold uppercase outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[150px] lg:h-[600px]">
            <div className="divide-y divide-muted-foreground/5">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={cn("p-2 cursor-pointer hover:bg-primary/5 transition-all", selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : '')}>
                  <h4 className="font-black text-[10px] uppercase truncate">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="h-3 px-1 text-[7px] font-black border-none bg-muted/50">ID: {s.supplierId}</Badge>
                    <span className="text-[7px] text-muted-foreground font-bold truncate uppercase">{s.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
          {selectedSupplier ? (
            <ScrollArea className="w-full h-full">
              <div className="p-3 sm:p-6 space-y-4 printable-report bg-white text-left max-w-[210mm] mx-auto border-[1.5px] border-black m-2">
                <div className="flex justify-between items-center no-print border-b pb-1 mb-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[7px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 text-[7px] font-black uppercase px-1.5" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> प्रिंट</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[7px] font-black uppercase px-1.5" onClick={() => handleOpenEdit(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदला</Button>
                  </div>
                </div>

                <div className="w-full border-b-4 border-black pb-3 mb-6 text-center">
                  <h3 className="text-[20pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
                  <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType === 'Center' ? 'संकलन केंद्र' : 'गवळी / सप्लायर'} अहवाल</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
                  <div className="space-y-4">
                    <SectionTitle icon={Info} title="१) प्राथमिक माहिती" />
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-muted-foreground uppercase text-[10px]">पत्ता</span><span className="leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionTitle icon={ShieldCheck} title="२) परवाना व तांत्रिक" />
                    <div className="space-y-2 text-[12px] font-bold">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[9px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[9px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                    </div>
                  </div>
                </div>
                {selectedSupplier.supplierType === 'Center' && <ProducerCenterReportView supplier={selectedSupplier} />}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Users className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">सप्लायर निवडा</h4>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-3 space-y-8 pb-20 min-w-max">
              <div className="max-w-[600px] space-y-6">
                <div>
                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType || "Center"} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                        <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Gavali">गवळी</SelectItem><SelectItem value="Gotha">गोठा</SelectItem><SelectItem value="Center">उत्पादक केंद्र</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 border-2 border-black font-bold text-xs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 border-2 border-black font-bold text-xs" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 border-2 border-black font-bold text-xs" /></div>
                    </div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 border-2 border-black font-bold text-xs" /></div>
                  </div>
                </div>

                {(formData.supplierType === 'Center' || formData.supplierType === 'Gavali') && (
                  <div className="space-y-6">
                    <div>
                      <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time || ""} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-9 border-2 border-black" /></div>
                        <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time || ""} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-9 border-2 border-black" /></div>
                        <div className="space-y-0.5"><Label className="text-[9px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || "0"} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-9 border-2 border-black text-center font-black" /></div>
                        <div className="space-y-0.5"><Label className="text-[9px] font-black">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers || "0"} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-9 border-2 border-black text-center font-black text-emerald-600" /></div>
                      </div>
                    </div>

                    <div>
                      <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण</Label><Input type="number" value={formData.total_animals || "0"} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-8 border-2 border-black text-center text-[10px]" /></div>
                        <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई</Label><Input type="number" value={formData.cows || "0"} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-8 border-2 border-black text-center text-[10px]" /></div>
                        <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी</Label><Input type="number" value={formData.buffalo || "0"} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-8 border-2 border-black text-center text-[10px]" /></div>
                        <div className="space-y-0.5"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves || "0"} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-8 border-2 border-black text-center text-[10px]" /></div>
                      </div>
                    </div>

                    {formData.supplierType === 'Center' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between"><SectionTitle icon={Layers} title="५) २+ वर्ष जुने उत्पादक" /><Button size="sm" variant="outline" onClick={() => addRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                          <div className="border-2 border-black rounded-lg overflow-hidden"><Table className="text-[9px]"><TableHeader className="bg-slate-50"><TableRow><TableHead className="h-7 px-2">नाव</TableHead><TableHead className="h-7 px-2 text-center">जुने L</TableHead><TableHead className="h-7 px-2 text-center">नवे L</TableHead><TableHead className="h-7 px-2 text-center">जुनी ज</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader><TableBody>
                            {(formData.longTermProducers || []).map((r: any) => (
                              <TableRow key={r.id} className="h-8"><TableCell className="p-0 border-r"><Input value={r.producer_name || ""} onChange={e => updateRow('longTermProducers', r.id, { producer_name: e.target.value })} className="h-7 border-none text-[9px] p-1 font-bold" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={r.previous_milk || 0} onChange={e => updateRow('longTermProducers', r.id, { previous_milk: e.target.value })} className="h-7 border-none text-center text-[9px]" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={r.current_milk || 0} onChange={e => updateRow('longTermProducers', r.id, { current_milk: e.target.value })} className="h-7 border-none text-center text-[9px]" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={r.previous_animals || 0} onChange={e => updateRow('longTermProducers', r.id, { previous_animals: e.target.value })} className="h-7 border-none text-center text-[9px]" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('longTermProducers', r.id)} className="h-6 w-6 text-rose-400"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                            ))}</TableBody></Table></div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between"><SectionTitle icon={TrendingDown} title="६) दूध घटलेले उत्पादक" color="text-rose-600" /><Button size="sm" variant="outline" onClick={() => addRow('decreasingProducers', { producer_name: "", previous_milk: 0, current_milk: 0, reason: "" })} className="h-6 text-[8px] font-black border-black px-2">+ जोडा</Button></div>
                          <div className="border-2 border-black rounded-lg overflow-hidden"><Table className="text-[9px]"><TableHeader className="bg-rose-50"><TableRow><TableHead className="h-7 px-2">नाव</TableHead><TableHead className="h-7 px-2 text-center">जुने</TableHead><TableHead className="h-7 px-2 text-center">नवे</TableHead><TableHead className="h-7 px-2">कारण</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader><TableBody>
                            {(formData.decreasingProducers || []).map((r: any) => (
                              <TableRow key={r.id} className="h-8"><TableCell className="p-0 border-r"><Input value={r.producer_name || ""} onChange={e => updateRow('decreasingProducers', r.id, { producer_name: e.target.value })} className="h-7 border-none text-[9px] p-1 font-bold" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={r.previous_milk || 0} onChange={e => updateRow('decreasingProducers', r.id, { previous_milk: e.target.value })} className="h-7 border-none text-center text-[9px]" /></TableCell><TableCell className="p-0 border-r"><Input type="number" value={r.current_milk || 0} onChange={e => updateRow('decreasingProducers', r.id, { current_milk: e.target.value })} className="h-7 border-none text-center text-[9px]" /></TableCell><TableCell className="p-0 border-r"><Input value={r.reason || ""} onChange={e => updateRow('decreasingProducers', r.id, { reason: e.target.value })} className="h-7 border-none text-[9px] p-1" /></TableCell><TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('decreasingProducers', r.id)} className="h-6 w-6 text-rose-400"><X className="h-3 w-3"/></Button></TableCell></TableRow>
                            ))}</TableBody></Table></div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">विशेष शेरा (REMARK)</Label><Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-20 text-[11px] bg-muted/10 border-2 border-black rounded-xl p-3 shadow-inner" /></div>
              </div>
            </div>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print z-[100] sticky bottom-0">
            <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); resetFormData(); }} className="flex-1 h-11 rounded-xl font-black uppercase text-[10px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-11 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-primary text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><RouteDetailsContent /></Suspense>
}
