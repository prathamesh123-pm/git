
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { 
  Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, 
  History, Edit, CheckCircle2, Box, UserCheck, Wallet, User, Printer, Truck, 
  ShieldCheck, Clock, Layers, TrendingDown, IndianRupee, Hash, ListPlus, 
  Lightbulb, Info, FileText, PlusCircle, Briefcase, Users
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className={cn("flex items-center gap-1 border-b pb-0.5 mb-2 mt-3", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-3 w-3", color)} />}
    <h3 className={cn("text-[9px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const ProducerCenterReportView = ({ supplier }: { supplier: Supplier }) => {
  const details = supplier.producer_center?.additional_details || {};

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 text-left">
          <h4 className="text-[10px] font-black uppercase text-primary border-b border-black pb-0.5">३) संकलन वेळ & उत्पादक</h4>
          <div className="space-y-1 text-[11px] font-bold">
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>सकाळ वेळ</span><span>{details.morning_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>सायंकाळ वेळ</span><span>{details.evening_collection_time || "-"}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>एकूण उत्पादक</span><span>{details.total_producers || 0}</span></div>
            <div className="flex justify-between border-b border-dashed border-black/10 pb-0.5"><span>सक्रिय उत्पादक</span><span className="text-emerald-600">{details.active_producers || 0}</span></div>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <h4 className="text-[10px] font-black uppercase text-primary border-b border-black pb-0.5">४) जनावरांची गणना</h4>
          <div className="grid grid-cols-2 gap-1.5 text-center">
             <div className="p-1 border border-black rounded bg-slate-50"><p className="text-[7px] font-black">COWS</p><p className="text-[10px] font-black">{details.cows || 0}</p></div>
             <div className="p-1 border border-black rounded bg-slate-50"><p className="text-[7px] font-black">BUF</p><p className="text-[10px] font-black">{details.buffalo || 0}</p></div>
             <div className="p-1 border border-black rounded bg-slate-50"><p className="text-[7px] font-black">CALF</p><p className="text-[10px] font-black">{details.calves || 0}</p></div>
             <div className="p-1 border border-black rounded bg-slate-900 text-white"><p className="text-[7px] font-black">TOTAL</p><p className="text-[10px] font-black">{details.total_animals || 0}</p></div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-left">
         <h4 className="text-[10px] font-black uppercase text-primary border-b border-black pb-0.5">५) २+ वर्ष जुने उत्पादक</h4>
         <div className="overflow-x-auto border border-black rounded-md">
           <table className="w-full border-collapse text-[9px] min-w-[400px]">
             <thead className="bg-slate-100 font-black">
               <tr className="border-b border-black text-center">
                 <th className="p-1 border-r border-black text-left">नाव</th>
                 <th className="p-1 border-r border-black">जुने</th>
                 <th className="p-1 border-r border-black">सध्याचे</th>
                 <th className="p-1">जनावरे</th>
               </tr>
             </thead>
             <tbody>
               {(details.long_term_producers || []).map((p: any, i: number) => (
                 <tr key={i} className="border-b border-black font-bold text-center last:border-0">
                   <td className="p-1 border-r border-black text-left">{p.producer_name}</td>
                   <td className="p-1 border-r border-black">{p.previous_milk} L</td>
                   <td className="p-1 border-r border-black font-black">{p.current_milk} L</td>
                   <td className="p-1">{p.current_animals}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="w-full mt-8 pt-8 grid grid-cols-2 gap-8 text-center uppercase font-black text-[8pt] tracking-widest border-t border-black/10">
        <div>अधिकारी स्वाक्षरी</div>
        <div>सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  );
};

function SuppliersContent() {
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
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
    supplierType: "Gavali" as SupplierType, competition: "", additionalInfo: "",
    iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [] as EquipmentItem[],
    operatorName: "",
    spaceOwnership: "Self" as 'Self' | 'Rented',
    hygieneGrade: "A",
    chemicalsStock: "",
    batteryCondition: "",
    morning_collection_time: "", evening_collection_time: "",
    start_year: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [] as any[],
    decreasingProducers: [] as any[],
    can_expand_8_10_cows: false,
    highCapacityProducers: [] as any[],
    has_100_plus_milk: false,
    highMilkProducers: [] as any[],
    localEmployees: [] as any[],
    localGavali: [] as any[],
    lssFacilities: [] as any[],
    competitorFacilities: [] as any[],
    subRoutes: [] as any[],
    milk_decrease_reasons: "",
    efforts_taken: "",
    required_actions: ""
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = () => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Gavali", competition: "", additionalInfo: "",
      iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
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
      morning_collection_time: "", evening_collection_time: "",
      start_year: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], can_expand_8_10_cows: false,
      highCapacityProducers: [], has_100_plus_milk: false, highMilkProducers: [],
      localEmployees: [], localGavali: [], lssFacilities: [], competitorFacilities: [], subRoutes: [],
      milk_decrease_reasons: "",
      efforts_taken: "", required_actions: ""
    })
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
      inactive_producers: Number(formData.inactive_producers),
      total_animals: Number(formData.total_animals),
      cows: Number(formData.cows),
      buffalo: Number(formData.buffalo),
      calves: Number(formData.calves),
      long_term_producers: formData.longTermProducers,
      decreasing_producers: formData.decreasingProducers,
      can_expand_8_10_cows: formData.can_expand_8_10_cows,
      high_capacity_producer_list: formData.highCapacityProducers,
      has_100_plus_milk: formData.has_100_plus_milk,
      high_milk_producer_list: formData.highMilkProducers,
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavali,
      lss_details: formData.lssFacilities,
      competitor_dairies: formData.competitorFacilities,
      sub_routes: formData.subRoutes,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions
    };

    const supplierData = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      iceBlocks: Number(formData.iceBlocks),
      milkCansCount: Number(formData.milkCansCount),
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      producer_center: formData.supplierType === 'Center' ? { additional_details } : null,
      village: formData.address,
      updatedAt: new Date().toISOString()
    }

    if (isAdding) {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), supplierData)
      toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })
      setIsAdding(false)
    } else if (isEditing && selectedSupplier) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', selectedSupplier.id), supplierData)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
      setIsEditing(false)
    }
    resetFormData()
  }

  const addDynamicRow = (key: string, initialData: any) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key as keyof typeof prev] as any[]), { id: crypto.randomUUID(), ...initialData }] }))
  }

  const removeDynamicRow = (key: string, id: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).filter(r => r.id !== id) }))
  }

  const updateDynamicRow = (key: string, id: string, updates: any) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).map(r => r.id === id ? { ...r, ...updates } : r) }))
  }

  const prepareEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    const details = supp.producer_center?.additional_details || {};
    setFormData({
      supplierId: supp.supplierId || "", name: supp.name || "", address: supp.address || "",
      mobile: supp.mobile || "", routeId: supp.routeId || "none", supplierType: supp.supplierType || "Gavali",
      competition: supp.competition || "", additionalInfo: supp.additionalInfo || supp.additionalNotes || "",
      iceBlocks: String(supp.iceBlocks || 0), scaleBrand: supp.scaleBrand || "",
      fatMachineBrand: supp.fatMachineBrand || "", cattleFeedBrand: supp.cattleFeedBrand || "None",
      fssaiNumber: supp.fssaiNumber || "", fssaiExpiry: supp.fssaiExpiry || "",
      milkCansCount: String(supp.milkCansCount || 0), computerAvailable: supp.computerAvailable || false,
      upsInverterAvailable: supp.upsInverterAvailable || false, solarAvailable: supp.solarAvailable || false,
      adulterationKitInfo: supp.adulterationKitInfo || "",
      cowQty: String(supp.cowMilk?.quantity || 0), cowFat: String(supp.cowMilk?.fat || 0), cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0), bufFat: String(supp.buffaloMilk?.fat || 0), bufSnf: String(supp.buffaloMilk?.snf || 0),
      equipment: supp.equipment || [],
      operatorName: supp.operatorName || "",
      spaceOwnership: supp.spaceOwnership || "Self",
      hygieneGrade: supp.hygieneGrade || "A",
      chemicalsStock: supp.chemicalsStock || "",
      batteryCondition: supp.batteryCondition || "",
      morning_collection_time: details.morning_collection_time || "",
      evening_collection_time: details.evening_collection_time || "",
      start_year: details.start_year || "",
      total_producers: String(details.total_producers || 0),
      active_producers: String(details.active_producers || 0),
      inactive_producers: String(details.inactive_producers || 0),
      total_animals: String(details.total_animals || 0),
      cows: String(details.cows || 0),
      buffalo: String(details.buffalo || 0),
      calves: String(details.calves || 0),
      longTermProducers: details.long_term_producers || [],
      decreasingProducers: details.decreasing_producers || [],
      can_expand_8_10_cows: details.can_expand_8_10_cows || false,
      highCapacityProducers: details.high_capacity_producer_list || [],
      has_100_plus_milk: details.has_100_plus_milk || false,
      highMilkProducers: details.high_milk_producer_list || [],
      localEmployees: details.local_employees || [],
      localGavali: details.milkman_gavali_details || [],
      lssFacilities: details.lss_details || [],
      competitorFacilities: details.competitor_dairies || [],
      subRoutes: details.sub_routes || [],
      milk_decrease_reasons: details.milk_decrease_reasons || "",
      efforts_taken: details.efforts_taken || "",
      required_actions: details.required_actions || ""
    })
    setIsEditing(true)
  }

  const deleteSupplierRecord = (id: string) => {
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
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

  const getRouteName = (rid: string) => {
    if (!rid || rid === "none") return "Unassigned";
    return routes?.find(r => r.id === rid)?.name || "Unknown"
  }

  if (!mounted) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-full mx-auto w-full pb-10 px-1 animate-in fade-in duration-500 overflow-x-hidden text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 no-print">
        <div>
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> सप्लायर
          </h2>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Master Profiles</p>
        </div>
        <Button onClick={() => { resetFormData(); setIsAdding(true); }} className="gap-1.5 shadow-md h-9 px-4 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन सप्लायर
        </Button>
      </div>

      <Card className="border shadow-none rounded-xl overflow-hidden bg-white border-muted-foreground/10 p-1.5 no-print w-full">
        <div className="flex flex-col sm:flex-row gap-1.5 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
            <Input placeholder="शोधा..." className="pl-8 h-8 rounded-lg bg-muted/10 border-none font-bold text-[11px] shadow-inner w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 rounded-lg bg-muted/10 border-none font-black text-[9px] uppercase">
              <Filter className="h-3 w-3 mr-1.5" /><SelectValue placeholder="रूट" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[9px] font-bold uppercase">सर्व रूट</SelectItem>
              {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[9px] font-bold uppercase">{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="w-full flex flex-col items-center">
        {selectedSupplier ? (
          <div className="w-full max-w-full overflow-x-auto">
            <div className="bg-white border-2 border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 sm:p-6 flex flex-col items-center animate-in slide-in-from-right-2 duration-300 relative">
              <div className="w-full flex items-center justify-between no-print mb-4 border-b pb-2 flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-none uppercase text-[8px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> प्रिंट</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2" onClick={() => prepareEdit(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदला</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2 text-destructive border-destructive/20" onClick={() => deleteSupplierRecord(selectedSupplier.id)}><Trash2 className="h-3 w-3 mr-1" /> हटवा</Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="h-7 w-7 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="w-full border-b-2 border-black pb-2 mb-4 text-center">
                <h3 className="text-[14pt] sm:text-[18pt] font-black uppercase text-primary leading-tight">{selectedSupplier.name}</h3>
                <p className="text-[8pt] sm:text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-1">ID: {selectedSupplier.supplierId} | {selectedSupplier.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-4 text-left text-[11px] font-bold">
                 <div className="space-y-0.5"><p className="text-[8px] uppercase text-muted-foreground">मोबाईल</p><p>{selectedSupplier.mobile || "-"}</p></div>
                 <div className="space-y-0.5"><p className="text-[8px] uppercase text-muted-foreground">ऑपरेटर</p><p>{selectedSupplier.operatorName || "-"}</p></div>
                 <div className="space-y-0.5"><p className="text-[8px] uppercase text-muted-foreground">रूट</p><p>{getRouteName(selectedSupplier.routeId)}</p></div>
                 <div className="space-y-0.5"><p className="text-[8px] uppercase text-muted-foreground">प्रकार</p><p className="uppercase">{selectedSupplier.supplierType}</p></div>
              </div>

              {selectedSupplier.supplierType === 'Center' && <ProducerCenterReportView supplier={selectedSupplier} />}
              
              {!selectedSupplier.producer_center && (
                <div className="w-full py-10 text-center opacity-30 italic text-[10px] font-black uppercase">
                  No additional data for this supplier type.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-muted-foreground/10 shadow-sm overflow-hidden no-print w-full">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-black text-[9px] uppercase px-3 h-8">सप्लायर</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-center h-8">रूट</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-right px-3 h-8">क्रिया</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supp) => (
                    <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => setSelectedSupplier(supp)}>
                      <TableCell className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="font-black text-[11px] uppercase truncate max-w-[120px]">{supp.name}</span>
                          <span className="text-[8px] text-muted-foreground font-bold">ID: {supp.supplierId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase border-none bg-muted/50 max-w-[60px] truncate">
                          {getRouteName(supp.routeId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-2 px-3">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSupplierRecord(supp.id); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={3} className="p-10 text-center text-[9px] font-black opacity-30 uppercase italic">नोंदी सापडल्या नाहीत.</td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isAdding || isEditing} onOpenChange={(open) => { if(!open) { setIsAdding(false); setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white flex flex-col h-[92vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-xs font-black uppercase tracking-widest">{isAdding ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/60 uppercase">तपशील भरा (मोबाईल ऑप्टिमाइझ्ड)</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-3 space-y-6 pb-20">
              <div className="space-y-3">
                <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-8 text-[11px] border-2 border-black font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-2 border-black font-bold text-sm" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-2 border-black font-bold text-sm" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-8 border-2 border-black font-bold text-sm" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-2 border-black font-bold text-sm" /></div>
                  <div className="sm:col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-2 border-black font-bold text-sm" /></div>
                </div>
              </div>

              {formData.supplierType === 'Center' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सकाळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-7 border-2 border-black text-[10px]" /></div>
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सायंकाळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-7 border-2 border-black text-[10px]" /></div>
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase">एकूण</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-7 border-2 border-black text-center" /></div>
                      <div className="space-y-1"><Label className="text-[8px] font-black uppercase">सक्रिय</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-7 border-2 border-black text-center" /></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SectionTitle icon={Milk} title="३) जनावरांची गणना" />
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="space-y-0.5"><Label className="text-[7px] font-black">एकूण</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-7 border border-black text-center" /></div>
                      <div className="space-y-0.5"><Label className="text-[7px] font-black">गाई</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-7 border border-black text-center" /></div>
                      <div className="space-y-0.5"><Label className="text-[7px] font-black">म्हशी</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-7 border border-black text-center" /></div>
                      <div className="space-y-0.5"><Label className="text-[7px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-7 border border-black text-center" /></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><SectionTitle icon={Layers} title="४) २+ वर्ष जुने उत्पादक" /><Button size="sm" onClick={() => addDynamicRow('longTermProducers', { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 })} className="h-6 text-[8px] uppercase px-2">जोडा</Button></div>
                    <div className="border border-black rounded-lg overflow-hidden">
                      <ScrollArea className="w-full">
                        <table className="w-full text-left border-collapse text-[9px] min-w-[500px]">
                          <thead className="bg-slate-50 font-black uppercase border-b border-black">
                            <tr><th className="p-1">नाव</th><th className="p-1 text-center">जुने</th><th className="p-1 text-center">सध्याचे</th><th className="p-1 text-center">जुनी जनावरे</th><th className="p-1 text-center">X</th></tr>
                          </thead>
                          <tbody>
                            {formData.longTermProducers.map(p => (
                              <tr key={p.id} className="border-b border-black last:border-0 bg-white">
                                <td className="p-0.5"><Input value={p.producer_name} onChange={e => updateDynamicRow('longTermProducers', p.id, { producer_name: e.target.value })} className="h-6 text-[9px] border-none" /></td>
                                <td className="p-0.5"><Input type="number" value={p.previous_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_milk: e.target.value })} className="h-6 text-[9px] border-none text-center" /></td>
                                <td className="p-0.5"><Input type="number" value={p.current_milk} onChange={e => updateDynamicRow('longTermProducers', p.id, { current_milk: e.target.value })} className="h-6 text-[9px] border-none text-center font-black" /></td>
                                <td className="p-0.5"><Input type="number" value={p.previous_animals} onChange={e => updateDynamicRow('longTermProducers', p.id, { previous_animals: e.target.value })} className="h-6 text-[9px] border-none text-center" /></td>
                                <td className="p-0.5 text-center"><Button variant="ghost" size="icon" onClick={() => removeDynamicRow('longTermProducers', p.id)} className="h-5 w-5 text-rose-500"><X className="h-3 w-3"/></Button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table><ScrollBar orientation="horizontal" /></ScrollArea>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SectionTitle icon={Lightbulb} title="१३) विश्लेषण & उपाय" />
                    <div className="space-y-2">
                       <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">घटण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="min-h-[50px] border border-black text-[11px] p-1.5" /></div>
                       <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase">उपाययोजना</Label><Textarea value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="min-h-[50px] border border-black text-[11px] p-1.5" /></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <SectionTitle icon={ShieldCheck} title="१४) परवाना & तांत्रिक" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5"><Label className="text-[8px] font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border border-black font-bold" /></div>
                  <div className="space-y-0.5"><Label className="text-[8px] font-black">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border border-black" /></div>
                  <div className="space-y-0.5"><Label className="text-[8px] font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border border-black" /></div>
                  <div className="space-y-0.5"><Label className="text-[8px] font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border border-black" /></div>
                </div>
              </div>

              <div className="space-y-3">
                <SectionTitle icon={Wallet} title="१५) दूध तपशील (Q/F/S)" />
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-[8px] font-black uppercase text-blue-600 block mb-1">गाय दूध</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Qty" />
                      <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Fat" />
                      <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Snf" />
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Label className="text-[8px] font-black uppercase text-amber-600 block mb-1">म्हेस दूध</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Qty" />
                      <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Fat" />
                      <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-7 border border-black text-center text-[10px]" placeholder="Snf" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <SectionTitle icon={Box} title="१६) इन्व्हेंटरी" />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})} className={cn("h-8 border-2 border-black font-black text-[9px] uppercase", formData.computerAvailable ? "bg-primary text-white" : "")}>POP: {formData.computerAvailable ? 'YES' : 'NO'}</Button>
                  <Button variant="outline" size="sm" type="button" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})} className={cn("h-8 border-2 border-black font-black text-[9px] uppercase", formData.upsInverterAvailable ? "bg-amber-500 text-white" : "")}>UPS: {formData.upsInverterAvailable ? 'YES' : 'NO'}</Button>
                  <div className="flex flex-col"><Label className="text-[7px] font-black ml-1 uppercase">CANS</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-8 border border-black text-center font-black" /></div>
                  <div className="flex flex-col"><Label className="text-[7px] font-black ml-1 uppercase">ICE</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-8 border border-black text-center font-black" /></div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-2 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print z-50">
            <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); resetFormData(); }} className="flex-1 h-9 rounded-xl font-black uppercase text-[10px] border-2 border-black">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-9 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"><CheckCircle2 className="h-4 w-4 mr-1.5" /> जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
