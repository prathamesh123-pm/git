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
  Building2, Activity, ClipboardCheck, ChevronDown, ChevronUp, Users2, PlusCircle
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

      <div className="w-full mt-12 pt-12 grid grid-cols-2 gap-10 text-center uppercase font-black text-[9pt] tracking-[0.2em]">
        <div className="border-t border-black pt-2">अधिकृत स्वाक्षरी</div>
        <div className="border-t border-black pt-2">सुपरवायझर स्वाक्षरी</div>
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
    adulterationKitInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [],
    operatorName: "",
    spaceOwnership: "Self",
    hygieneGrade: "A",
    chemicalsStock: "",
    batteryCondition: "",
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

  useEffect(() => setMounted(true), [])

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Center", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      equipment: [],
      operatorName: "",
      spaceOwnership: "Self",
      hygieneGrade: "A",
      chemicalsStock: "",
      batteryCondition: "",
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
  }, [])

  const handleOpenEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    const details = supp.producer_center?.additional_details || {};
    setFormData({
      ...supp,
      cowQty: String(supp.cowMilk?.quantity || 0),
      cowFat: String(supp.cowMilk?.fat || 0),
      cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0),
      bufFat: String(supp.buffaloMilk?.fat || 0),
      bufSnf: String(supp.buffaloMilk?.snf || 0),
      morning_collection_time: details.morning_collection_time || "",
      evening_collection_time: details.evening_collection_time || "",
      start_year: details.start_year || "",
      total_producers: String(details.total_producers || 0),
      active_producers: String(details.active_producers || 0),
      total_animals: String(details.total_animals || 0),
      cows: String(details.cows || 0),
      buffalo: String(details.buffalo || 0),
      calves: String(details.calves || 0),
      longTermProducers: details.long_term_producers || [],
      decreasingProducers: details.decreasing_producers || [],
      sub_gavali_info: details.sub_gavali_info || [],
      internal_gothas: details.internal_gothas || []
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
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
    }

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      producer_center: (formData.supplierType === 'Center' || formData.supplierType === 'Gavali' || formData.supplierType === 'Gotha') ? { additional_details } : null,
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

  const deleteSupplierRecord = (id: string) => {
    if (!db || !user) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', id))
      setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.name?.toLowerCase().includes(q) || s.mobile?.includes(q) || s.supplierId?.toString().includes(q);
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
            <UserCheck className="h-5 w-5 text-primary" /> सप्लायर मास्टर (MASTER LIST)
          </h2>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile Management</p>
        </div>
        <Button onClick={() => { resetFormData(); setIsAdding(true); }} className="gap-1.5 shadow-md h-9 px-4 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन सप्लायर जोडा
        </Button>
      </div>

      <Card className="border shadow-none rounded-xl overflow-hidden bg-white border-muted-foreground/10 p-1.5 no-print w-full">
        <div className="flex flex-col sm:flex-row gap-1.5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <Input placeholder="नाव किंवा कोड शोधा..." className="pl-8 h-8 rounded-lg bg-muted/10 border-2 border-black font-bold text-[11px] shadow-inner w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 rounded-lg bg-muted/10 border-2 border-black font-black text-[9px] uppercase">
              <Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="रूट निवडा" />
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
          <div className="w-full max-w-full overflow-x-auto">
            <div className="bg-white border-2 border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 sm:p-6 flex flex-col items-center animate-in slide-in-from-right-2 duration-300 relative">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2 flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[8px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2" onClick={() => handleOpenEdit(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदला</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2 text-destructive border-destructive/20" onClick={() => deleteSupplierRecord(selectedSupplier.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="w-full border-b-4 border-black pb-3 mb-6 text-center">
                <h3 className="text-[18pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
                <p className="text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | {selectedSupplier.supplierType === 'Center' ? 'संकलन केंद्र' : 'गवळी / सप्लायर'} अहवाल</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full mb-6 text-left">
                <div className="space-y-4">
                  <SectionTitle icon={Info} title="१) प्राथमिक माहिती" />
                  <div className="space-y-2 text-[12px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                    <div className="flex flex-col gap-1"><span>पत्ता</span><span className="leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <SectionTitle icon={ShieldCheck} title="२) परवाना व तांत्रिक" />
                  <div className="space-y-2 text-[12px] font-bold">
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                    <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                  </div>
                </div>
              </div>

              {selectedSupplier.supplierType === 'Center' && <ProducerCenterReportView supplier={selectedSupplier} />}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-black shadow-sm overflow-hidden no-print w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[9px] uppercase px-3 h-8">सप्लायर तपशील</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-center h-8">रूट</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-right px-3 h-8">क्रिया</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supp) => (
                  <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => setSelectedSupplier(supp)}>
                    <TableCell className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-black text-[11px] uppercase truncate max-w-[150px]">{supp.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="h-3.5 px-1 text-[7px] border-none bg-primary/5 text-primary">ID: {supp.supplierId}</Badge>
                          <span className="text-[8px] text-muted-foreground font-black uppercase flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {supp.mobile}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase border-none bg-muted/50 max-w-[80px] truncate">
                        {supp.routeId ? routes?.find(r => r.id === supp.routeId)?.name || '...' : 'Unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-3">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={(e) => { e.stopPropagation(); handleOpenEdit(supp); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSupplierRecord(supp.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isAdding || isEditing} onOpenChange={(open) => { if(!open) { setIsAdding(false); setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{isAdding ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-3 space-y-6 pb-20 min-w-max">
              <div className="max-w-[500px]">
                <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-10 border-2 border-black rounded-xl font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali">गवळी</SelectItem><SelectItem value="Gotha">गोठा</SelectItem><SelectItem value="Center">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-11 border-2 border-black font-bold text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-11 border-2 border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-11 border-2 border-black font-bold text-xs" /></div>
                  </div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-11 border-2 border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">रूट निवडा</Label>
                    <Select value={formData.routeId} onValueChange={v => setFormData({...formData, routeId: v})}>
                      <SelectTrigger className="h-11 border-2 border-black rounded-xl font-black"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">रूट नाही</SelectItem>
                        {routes?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersListPage /></Suspense>
}
