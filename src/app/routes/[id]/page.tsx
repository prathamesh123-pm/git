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

  const [formData, setFormData] = useState({
    name: "", supplierId: "", address: "", mobile: "", operatorName: "",
    routeId: currentRouteId,
    supplierType: "Center" as SupplierType, fssaiNumber: "", fssaiExpiry: "",
    scaleBrand: "", fatMachineBrand: "", chemicalsStock: "", batteryCondition: "",
    paymentCycle: "10 Days", spaceOwnership: "Self" as 'Self' | 'Rented', hygieneGrade: "A",
    competition: "", cattleFeedBrand: "None", iceBlocks: "0",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "", additionalNotes: "", equipment: [] as EquipmentItem[],
    morning_collection_time: "", evening_collection_time: "", start_year: "",
    total_producers: "0", active_producers: "0", inactive_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [] as any[],
    decreasingProducers: [] as any[],
    highCapacityProducers: [] as any[],
    highMilkProducers: [] as any[],
    localEmployees: [] as any[],
    localGavliInfo: [] as any[],
    lssFacilities: [] as any[],
    competitorFacilities: [] as any[],
    subRoutes: [] as any[],
    collectionAreas: [] as any[],
    milk_decrease_reasons: "",
    efforts_taken: "",
    required_actions: "",
    internal_gothas: [] as any[],
    sub_gavali_info: [] as any[],
    gotha_total_area: "",
    gotha_fodder_area: "",
    gotha_purchase_source: "",
    gotha_previous_dairy: "",
    gotha_breed_info: [] as any[],
    gotha_worker_info: [] as any[],
    gotha_fodder_management: "",
    gotha_milking_shift_morning: "",
    gotha_milking_shift_evening: "",
    gotha_hygiene_remark: "",
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
      internal_gothas: [],
      sub_gavali_info: [],
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
    const details = s.producer_center?.additional_details || {};
    setFormData({
      ...formData,
      name: s.name || "", supplierId: s.supplierId || "", address: s.address || "",
      mobile: s.mobile || "", operatorName: s.operatorName || "",
      routeId: s.routeId || currentRouteId,
      supplierType: s.supplierType || "Center", fssaiNumber: s.fssaiNumber || "",
      fssaiExpiry: s.fssaiExpiry || "", scaleBrand: s.scaleBrand || "",
      fatMachineBrand: s.fatMachineBrand || "", chemicalsStock: s.chemicalsStock || "",
      batteryCondition: s.batteryCondition || "", paymentCycle: s.paymentCycle || "10 Days",
      spaceOwnership: s.spaceOwnership || "Self", hygieneGrade: s.hygieneGrade || "A",
      competition: s.competition || "", cattleFeedBrand: s.cattleFeedBrand || "None",
      iceBlocks: String(s.iceBlocks || 0),
      cowQty: String(s.cowMilk?.quantity || 0), cowFat: String(s.cowMilk?.fat || 0), cowSnf: String(s.cowMilk?.snf || 0),
      bufQty: String(s.buffaloMilk?.quantity || 0), bufFat: String(s.buffaloMilk?.fat || 0), bufSnf: String(s.buffaloMilk?.snf || 0),
      milkCansCount: String(s.milkCansCount || 0), computerAvailable: s.computerAvailable || false,
      upsInverterAvailable: s.upsInverterAvailable || false, solarAvailable: s.solarAvailable || false,
      adulterationKitInfo: s.adulterationKitInfo || "", additionalNotes: s.additionalNotes || s.additionalInfo || "",
      equipment: s.equipment || [],
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
      highCapacityProducers: details.high_capacity_producer_list || [],
      highMilkProducers: details.high_milk_producer_list || [],
      localEmployees: details.local_employees || [],
      localGavliInfo: details.milkman_gavali_details || [],
      lssFacilities: details.lss_details || [],
      competitorFacilities: details.competitor_facilities || [],
      subRoutes: details.sub_routes || [],
      collectionAreas: details.collection_areas || [],
      milk_decrease_reasons: details.milk_decrease_reasons || "",
      efforts_taken: details.efforts_taken || "",
      required_actions: details.required_actions || "",
      internal_gothas: details.internal_gothas || [],
      sub_gavali_info: details.sub_gavali_info || [],
      gotha_total_area: details.gotha_total_area || "",
      gotha_fodder_area: details.gotha_fodder_area || "",
      gotha_purchase_source: details.gotha_purchase_source || "",
      gotha_previous_dairy: details.gotha_previous_dairy || "",
      gotha_breed_info: details.gotha_breed_info || [],
      gotha_worker_info: details.gotha_worker_info || [],
      gotha_fodder_management: details.gotha_fodder_management || "",
      gotha_milking_shift_morning: details.gotha_milking_shift_morning || "",
      gotha_milking_shift_evening: details.gotha_milking_shift_evening || "",
      gotha_hygiene_remark: details.gotha_hygiene_remark || "",
      gotha_hygiene_checklist: details.gotha_hygiene_checklist || {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
        worker_hygiene: false, proper_drainage: false, pest_control: false,
        clean_water_trough: false, health_records: false
      }
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
      inactive_producers: Number(formData.inactive_producers),
      total_animals: Number(formData.total_animals),
      cows: Number(formData.cows),
      buffalo: Number(formData.buffalo),
      calves: Number(formData.calves),
      long_term_producers: formData.longTermProducers,
      decreasing_producers: formData.decreasingProducers,
      high_capacity_producer_list: formData.highCapacityProducers,
      high_milk_producer_list: formData.highMilkProducers,
      local_employees: formData.localEmployees,
      milkman_gavali_details: formData.localGavliInfo,
      lss_details: formData.lssFacilities,
      competitor_facilities: formData.competitorFacilities,
      sub_routes: formData.subRoutes,
      collection_areas: formData.collectionAreas,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions,
      internal_gothas: formData.internal_gothas,
      sub_gavali_info: formData.sub_gavali_info,
      gotha_total_area: formData.gotha_total_area,
      gotha_fodder_area: formData.gotha_fodder_area,
      gotha_purchase_source: formData.gotha_purchase_source,
      gotha_previous_dairy: formData.gotha_previous_dairy,
      gotha_breed_info: formData.gotha_breed_info,
      gotha_worker_info: formData.gotha_worker_info,
      gotha_fodder_management: formData.gotha_fodder_management,
      gotha_milking_shift_morning: formData.gotha_milking_shift_morning,
      gotha_milking_shift_evening: formData.gotha_milking_shift_evening,
      gotha_hygiene_remark: formData.gotha_hygiene_remark,
      gotha_hygiene_checklist: formData.gotha_hygiene_checklist
    };

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks),
      milkCansCount: Number(formData.milkCansCount),
      producer_center: (formData.supplierType === 'Center' || formData.supplierType === 'Gavali' || formData.supplierType === 'Gotha') ? { additional_details } : null,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
    else if (editingId) updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), data)
    setIsDialogOpen(false); toast({ title: "यशस्वी", description: "माहिती जतन झाली." })
  }

  const handleSubGavaliAdd = () => {
    const newSub = {
      id: crypto.randomUUID(),
      isOpen: true,
      name: "",
      mobile: "",
      area: "",
      producers: "0",
      animals: "0",
      collection_type: "Spot",
      sub_route_info: "",
      cow_qty: "0",
      buf_qty: "0",
      other_info: ""
    }
    setFormData(prev => ({ ...prev, sub_gavali_info: [...prev.sub_gavali_info, newSub] }))
  }

  const handleSubGavaliUpdate = (id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      sub_gavali_info: prev.sub_gavali_info.map(s => s.id === id ? { ...s, ...updates } : s)
    }))
  }

  const handleSubGavaliRemove = (id: string) => {
    setFormData(prev => ({ ...prev, sub_gavali_info: prev.sub_gavali_info.filter(s => s.id !== id) }))
  }

  const handleInternalGothaAdd = () => {
    const newGotha = {
      id: crypto.randomUUID(),
      isOpen: true,
      owner_name: "",
      code: "",
      location: "",
      area: "",
      fodder_area: "",
      milking_morning: "",
      milking_evening: "",
      breeds: [],
      workers: [],
      fodder_mgmt: "",
      purchase_source: "",
      prev_dairy: "",
      hygiene_remark: "",
      hygiene_checklist: {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
        worker_hygiene: false, proper_drainage: false, pest_control: false,
        clean_water_trough: false, health_records: false
      }
    }
    setFormData(prev => ({ ...prev, internal_gothas: [...prev.internal_gothas, newGotha] }))
  }

  const handleInternalGothaUpdate = (id: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      internal_gothas: prev.internal_gothas.map(g => g.id === id ? { ...g, ...updates } : g)
    }))
  }

  const handleInternalGothaRemove = (id: string) => {
    setFormData(prev => ({ ...prev, internal_gothas: prev.internal_gothas.filter(g => g.id !== id) }))
  }

  const handleInternalGothaSubRowAdd = (gothaId: string, listKey: 'breeds' | 'workers', initial: any) => {
    setFormData(prev => ({
      ...prev,
      internal_gothas: prev.internal_gothas.map(g => g.id === gothaId ? {
        ...g,
        [listKey]: [...g[listKey], { id: crypto.randomUUID(), ...initial }]
      } : g)
    }))
  }

  const handleInternalGothaSubRowUpdate = (gothaId: string, listKey: 'breeds' | 'workers', rowId: string, updates: any) => {
    setFormData(prev => ({
      ...prev,
      internal_gothas: prev.internal_gothas.map(g => g.id === gothaId ? {
        ...g,
        [listKey]: g[listKey].map((r: any) => r.id === rowId ? { ...r, ...updates } : r)
      } : g)
    }))
  }

  const handleInternalGothaSubRowRemove = (gothaId: string, listKey: 'breeds' | 'workers', rowId: string) => {
    setFormData(prev => ({
      ...prev,
      internal_gothas: prev.internal_gothas.map(g => g.id === gothaId ? {
        ...g,
        [listKey]: g[listKey].filter((r: any) => r.id !== rowId)
      } : g)
    }))
  }

  const addRow = (key: string, initial: any) => {
    setFormData(prev => ({ ...prev, [key]: [...(prev[key as keyof typeof prev] as any[]), { id: crypto.randomUUID(), ...initial }] }))
  }

  const removeRow = (key: string, id: string) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).filter(r => r.id !== id) }))
  }

  const updateRow = (key: string, id: string, updates: any) => {
    setFormData(prev => ({ ...prev, [key]: (prev[key as keyof typeof prev] as any[]).map(r => r.id === id ? { ...r, ...updates } : r) }))
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
                    <Button variant="outline" size="sm" className="h-6 text-[7px] font-black uppercase px-1.5 text-rose-600 border-rose-200" onClick={() => { if(confirm('हटवायचे?')) deleteDocumentNonBlocking(doc(db, 'users', user!.uid, 'suppliers', selectedSupplier.id)) }}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
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
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span className="text-muted-foreground uppercase text-[10px]">मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
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
              <p className="text-[10px] font-bold uppercase mt-2">Select a supplier from the list to view professional report</p>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white flex flex-col h-[90vh] text-left">
          <DialogHeader className="p-3 bg-primary text-white shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">संपूर्ण सविस्तर फॉर्म (४-वे स्क्रोल उपलब्ध)</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-3 space-y-6 pb-20 min-w-max">
              <div className="max-w-[500px]">
                <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-8 text-[11px] border-[1.5px] border-black rounded-md font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  </div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year || ""} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                </div>
              </div>

              {formData.supplierType === 'Gavali' && (
                <div className="max-w-[600px] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-1">
                    <SectionTitle icon={Users2} title="सब-गवळी माहिती (SUB-GAVALI INFO)" color="text-indigo-700" />
                    <Button size="sm" onClick={handleSubGavaliAdd} className="h-7 text-[9px] font-black uppercase px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"><Plus className="h-3 w-3 mr-1" /> सब-गवळी जोडा</Button>
                  </div>
                  
                  {formData.sub_gavali_info.length === 0 && (
                    <p className="text-[9px] font-bold text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">सब-गवळी असल्यास येथे नोंद करा.</p>
                  )}

                  <div className="space-y-3">
                    {formData.sub_gavali_info.map((sub, sIndex) => (
                      <Card key={sub.id} className="border-2 border-indigo-100 overflow-hidden rounded-2xl shadow-sm">
                        <div 
                          className="p-2 bg-indigo-50 flex items-center justify-between cursor-pointer group"
                          onClick={() => handleSubGavaliUpdate(sub.id, { isOpen: !sub.isOpen })}
                        >
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-600 text-white font-black text-[8px] h-5">SG-{sIndex + 1}</Badge>
                            <span className="text-[10px] font-black uppercase text-indigo-900">सब-गवळी: {sub.name || 'तपशील भरा'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-500 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleSubGavaliRemove(sub.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            {sub.isOpen ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-indigo-400" />}
                          </div>
                        </div>

                        {sub.isOpen && (
                          <div className="p-3 bg-white space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सब-गवळी नाव</Label><Input value={sub.name || ""} onChange={e => handleSubGavaliUpdate(sub.id, { name: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">मोबाईल</Label><Input value={sub.mobile || ""} onChange={e => handleSubGavaliUpdate(sub.id, { mobile: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="col-span-2 space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">संकलन एरिया (Area)</Label><Input value={sub.area || ""} onChange={e => handleSubGavaliUpdate(sub.id, { area: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">संकलन पद्धत</Label>
                                <Select value={sub.collection_type || "Spot"} onValueChange={v => handleSubGavaliUpdate(sub.id, { collection_type: v })}>
                                  <SelectTrigger className="h-7 text-[9px] border-2 border-black font-black"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="Spot" className="font-bold">जागेवर (Spot)</SelectItem><SelectItem value="Route" className="font-bold">रूट (Route)</SelectItem><SelectItem value="Both" className="font-bold">दोन्ही (Both)</SelectItem></SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">एकूण उत्पादक</Label><Input type="number" value={sub.producers || "0"} onChange={e => handleSubGavaliUpdate(sub.id, { producers: e.target.value })} className="h-7 border-2 border-black text-[10px] text-center" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">एकूण जनावरे</Label><Input type="number" value={sub.animals || "0"} onChange={e => handleSubGavaliUpdate(sub.id, { animals: e.target.value })} className="h-7 border-2 border-black text-[10px] text-center" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">गाय दूध (L)</Label><Input type="number" value={sub.cow_qty || "0"} onChange={e => handleSubGavaliUpdate(sub.id, { cow_qty: e.target.value })} className="h-7 border-2 border-black text-[10px] text-center" /></div>
                            </div>

                            {sub.collection_type !== 'Spot' && (
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">नंतर्गत उप-रूट माहिती</Label><Input value={sub.sub_route_info || ""} onChange={e => handleSubGavaliUpdate(sub.id, { sub_route_info: e.target.value })} className="h-7 border-2 border-black text-[10px]" placeholder="रूटचे नाव, अंतर, वेळ इ." /></div>
                            )}

                            <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">इतर महत्त्वाची माहिती / शेरा</Label><Textarea value={sub.other_info || ""} onChange={e => handleSubGavaliUpdate(sub.id, { other_info: e.target.value })} className="h-10 text-[9px] border-2 border-black p-2 rounded-lg" placeholder="..." /></div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {(formData.supplierType === 'Center' || formData.supplierType === 'Gavali') && (
                <div className="max-w-[600px] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-amber-200 pb-1">
                    <SectionTitle icon={Building2} title="अंतर्गत मोठे गोठे (INTERNAL GOTHAS)" color="text-amber-700" />
                    <Button size="sm" onClick={handleInternalGothaAdd} className="h-7 text-[9px] font-black uppercase px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md"><Plus className="h-3 w-3 mr-1" /> गोठा जोडा</Button>
                  </div>
                  
                  {formData.internal_gothas.length === 0 && (
                    <p className="text-[9px] font-bold text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">अजून कोणताही अंतर्गत गोठा जोडलेला नाही.</p>
                  )}

                  <div className="space-y-3">
                    {formData.internal_gothas.map((gotha, gIndex) => (
                      <Card key={gotha.id} className="border-2 border-amber-100 overflow-hidden rounded-2xl shadow-sm">
                        <div 
                          className="p-2 bg-amber-50 flex items-center justify-between cursor-pointer group"
                          onClick={() => handleInternalGothaUpdate(gotha.id, { isOpen: !gotha.isOpen })}
                        >
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-600 text-white font-black text-[8px] h-5">G-{gIndex + 1}</Badge>
                            <span className="text-[10px] font-black uppercase text-amber-900">मोठा गोठा माहिती</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-rose-500 hover:bg-rose-50" onClick={(e) => { e.stopPropagation(); handleInternalGothaRemove(gotha.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            {gotha.isOpen ? <ChevronUp className="h-4 w-4 text-amber-400" /> : <ChevronDown className="h-4 w-4 text-amber-400" />}
                          </div>
                        </div>

                        {gotha.isOpen && (
                          <div className="p-3 bg-white space-y-5 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">मालकाचे नाव</Label><Input value={gotha.owner_name || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { owner_name: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">कोड नंबर</Label><Input value={gotha.code || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { code: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">लोकेशन</Label><Input value={gotha.location || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { location: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">गोठा एरिया</Label><Input value={gotha.area || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { area: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">चारा एरिया</Label><Input value={gotha.fodder_area || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { fodder_area: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सकाळ दूध वेळ</Label><Input type="time" value={gotha.milking_morning || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { milking_morning: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सायंकाळ वेळ</Label><Input type="time" value={gotha.milking_evening || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { milking_evening: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-600 flex items-center gap-1.5"><Activity className="h-3 w-3" /> जनावरे & ब्रीड</span><Button size="sm" variant="outline" onClick={() => handleInternalGothaSubRowAdd(gotha.id, 'breeds', { breed: "", count: 0, avg_milk: 0 })} className="h-6 text-[8px] font-black uppercase border-black px-2">जोडा</Button></div>
                              <div className="border border-black rounded-lg overflow-hidden">
                                <Table className="text-[10px]">
                                  <TableHeader className="bg-slate-50 h-7"><TableRow><TableHead className="h-7 px-2">ब्रीड</TableHead><TableHead className="h-7 px-2 text-center w-12">नग</TableHead><TableHead className="h-7 px-2 text-right w-16">Avg(L)</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader>
                                  <TableBody>
                                    {(gotha.breeds || []).map((row: any) => (
                                      <TableRow key={row.id} className="h-8">
                                        <TableCell className="p-0 border-r"><Input value={row.breed || ""} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { breed: e.target.value })} className="h-7 border-none text-center font-bold text-[10px] bg-transparent" /></TableCell>
                                        <TableCell className="p-0 border-r"><Input type="number" value={row.count || 0} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { count: e.target.value })} className="h-7 border-none text-center font-black text-[10px] bg-transparent" /></TableCell>
                                        <TableCell className="p-0 border-r"><Input type="number" value={row.avg_milk || 0} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { avg_milk: e.target.value })} className="h-7 border-none text-center font-black text-[10px] bg-transparent" /></TableCell>
                                        <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => handleInternalGothaSubRowRemove(gotha.id, 'breeds', row.id)} className="h-7 w-7 text-rose-400"><X className="h-3 w-3" /></Button></TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[9px] font-black uppercase text-emerald-700 flex items-center gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> गोठा स्वच्छता (HYGIENE)</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 bg-emerald-50/30 p-2 rounded-xl border border-emerald-100">
                                {[
                                  { key: 'floor_cleaned', label: 'फरशी स्वच्छता' },
                                  { key: 'animal_cleaned', label: 'जनावरे स्वच्छता' },
                                  { key: 'utensils_sanitized', label: 'भांडी निर्जंतुक' },
                                  { key: 'worker_hygiene', label: 'कामगार स्वच्छता' },
                                  { key: 'proper_drainage', label: 'सांडपाणी निचरा' },
                                  { key: 'clean_water_trough', label: 'स्वच्छ पाणी/चारा' },
                                ].map((item) => (
                                  <div key={item.key} className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-emerald-100">
                                    <Checkbox 
                                      id={`hygiene-${gotha.id}-${item.key}`} 
                                      checked={gotha.hygiene_checklist?.[item.key] || false} 
                                      onCheckedChange={(checked) => {
                                        const current = gotha.hygiene_checklist || {};
                                        const newChecklist = { ...current, [item.key]: !!checked };
                                        handleInternalGothaUpdate(gotha.id, { hygiene_checklist: newChecklist });
                                      }} 
                                      className="h-3 w-3 border-emerald-400"
                                    />
                                    <Label htmlFor={`hygiene-${gotha.id}-${item.key}`} className="text-[8px] font-bold text-slate-700 cursor-pointer">{item.label}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">स्वच्छता शेरा</Label><Textarea value={gotha.hygiene_remark || ""} onChange={e => handleInternalGothaUpdate(gotha.id, { hygiene_remark: e.target.value })} className="h-12 text-[10px] border-2 border-black p-2 rounded-lg" placeholder="..." /></div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {formData.supplierType === 'Gotha' && (
                <div className="space-y-6">
                  <div className="max-w-[500px] space-y-3">
                    <SectionTitle icon={Building2} title="२) गोठा आकारमान & दूध वेळ" color="text-amber-700" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">गोठा एकूण एरिया</Label><Input value={formData.gotha_total_area || ""} onChange={e => setFormData({...formData, gotha_total_area: e.target.value})} placeholder="उदा. १० गुंठे" className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">चारा एरिया</Label><Input value={formData.gotha_fodder_area || ""} onChange={e => setFormData({...formData, gotha_fodder_area: e.target.value})} placeholder="उदा. २ एकर" className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_morning || ""} onChange={e => setFormData({...formData, gotha_milking_shift_morning: e.target.value})} className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_evening || ""} onChange={e => setFormData({...formData, gotha_milking_shift_evening: e.target.value})} className="h-8 border-2 border-black" /></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between max-w-[500px]">
                      <SectionTitle icon={Activity} title="जनावरे & ब्रीड माहिती" color="text-rose-600" />
                      <Button size="sm" onClick={() => addRow('gotha_breed_info', { breed: "", count: 0, avg_milk: 0 })} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg border-2 border-black bg-slate-50"><PlusCircle className="h-3 w-3 mr-1"/> जोडा</Button>
                    </div>
                    <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm">
                      <ScrollArea className="w-full">
                        <Table className="min-w-[400px] text-[10px] uppercase">
                          <TableHeader className="bg-slate-100 font-black h-8">
                            <TableRow>
                              <TableHead className="px-2 text-center h-8">ब्रीड (जात)</TableHead>
                              <TableHead className="px-2 text-center h-8 w-20">संख्या</TableHead>
                              <TableHead className="px-2 text-center h-8 w-24">सरासरी दूध (L)</TableHead>
                              <TableHead className="w-10 h-8"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.gotha_breed_info.map((row: any) => (
                              <TableRow key={row.id} className="h-9 hover:bg-slate-50">
                                <TableCell className="p-0 border-r border-black/10"><Input value={row.breed || ""} onChange={e => updateRow('gotha_breed_info', row.id, { breed: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-bold focus-visible:ring-0" placeholder="HF / गिर" /></TableCell>
                                <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.count || 0} onChange={e => updateRow('gotha_breed_info', row.id, { count: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.avg_milk || 0} onChange={e => updateRow('gotha_breed_info', row.id, { avg_milk: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('gotha_breed_info', row.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="max-w-[500px] space-y-4">
                    <SectionTitle icon={ClipboardCheck} title="गोठा स्वच्छता चेकलिस्ट" color="text-emerald-700" />
                    <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-4 rounded-xl border-2 border-emerald-100">
                      {[
                        { key: 'floor_cleaned', label: 'फरशी स्वच्छता' },
                        { key: 'animal_cleaned', label: 'जनावरे स्वच्छता' },
                        { key: 'utensils_sanitized', label: 'भांडी निर्जंतुक' },
                        { key: 'worker_hygiene', label: 'कामगार स्वच्छता' },
                        { key: 'proper_drainage', label: 'सांडपाणी निचरा' },
                        { key: 'pest_control', label: 'माश्या/डासांचे नियंत्रण' },
                        { key: 'clean_water_trough', label: 'स्वच्छ पाणी/चारा' },
                        { key: 'health_records', label: 'आरोग्य रेकॉर्ड' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center space-x-2 bg-white p-1.5 rounded-lg border border-emerald-100 shadow-sm">
                          <Checkbox 
                            id={`hygiene-single-route-${item.key}`} 
                            checked={(formData.gotha_hygiene_checklist as any)?.[item.key] || false} 
                            onCheckedChange={(checked) => {
                              const current = formData.gotha_hygiene_checklist || {};
                              setFormData({...formData, gotha_hygiene_checklist: { ...current, [item.key]: !!checked }})
                            }} 
                            className="h-3.5 w-3.5 border-emerald-400"
                          />
                          <Label htmlFor={`hygiene-single-route-${item.key}`} className="text-[9px] font-bold text-slate-700 cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(formData.supplierType === 'Center' || formData.supplierType === 'Gavali') && (
                <div className="space-y-6">
                  <div className="max-w-[500px] space-y-3">
                    <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time || ""} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-[1.5px] border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time || ""} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-[1.5px] border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || "0"} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-[1.5px] border-black text-center font-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers || "0"} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-[1.5px] border-black text-center font-black text-emerald-600" /></div>
                    </div>
                  </div>

                  <div className="max-w-[500px] space-y-3">
                    <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण</Label><Input type="number" value={formData.total_animals || "0"} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई</Label><Input type="number" value={formData.cows || "0"} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी</Label><Input type="number" value={formData.buffalo || "0"} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves || "0"} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-[500px]">
                <SectionTitle icon={ShieldCheck} title="१३) परवाना & तांत्रिक" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">काटा ब्रँड</Label><Input value={formData.scaleBrand || ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                </div>
              </div>

              <div className="max-w-[500px]">
                <SectionTitle icon={Wallet} title="१४) व्यावसायिक & दूध तपशील" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <Label className="text-[9px] font-black uppercase text-blue-600 block mb-1.5">गाय (Qty/F/S)</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input type="number" value={formData.cowQty || "0"} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                      <Input type="number" value={formData.cowFat || "0"} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                      <Input type="number" value={formData.cowSnf || "0"} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <Label className="text-[9px] font-black uppercase text-amber-600 block mb-1.5">म्हेस (Qty/F/S)</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input type="number" value={formData.bufQty || "0"} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                      <Input type="number" value={formData.bufFat || "0"} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                      <Input type="number" value={formData.bufSnf || "0"} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-7 border-black text-center font-black text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-[500px] space-y-3">
                <SectionTitle icon={Box} title="१५) इन्व्हेंटरी & स्टेटस" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer hover:bg-muted/20" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                    <Laptop className={cn("h-4 w-4", formData.computerAvailable ? "text-primary" : "text-slate-400")} />
                    <Label className="text-[8px] font-black uppercase">POP: {formData.computerAvailable ? "YES" : "NO"}</Label>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer hover:bg-muted/20" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                    <Zap className={cn("h-4 w-4", formData.upsInverterAvailable ? "text-amber-500" : "text-slate-400")} />
                    <Label className="text-[8px] font-black uppercase">UPS: {formData.upsInverterAvailable ? "YES" : "NO"}</Label>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5 cursor-pointer hover:bg-muted/20" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                    <Sun className={cn("h-4 w-4", formData.solarAvailable ? "text-emerald-500" : "text-slate-400")} />
                    <Label className="text-[8px] font-black uppercase">SOLAR: {formData.solarAvailable ? "YES" : "NO"}</Label>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg border border-muted-foreground/5">
                    <Label className="text-[8px] font-black uppercase opacity-50">CANS</Label>
                    <Input type="number" value={formData.milkCansCount || "0"} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-5 text-[9px] border-none text-center bg-white rounded w-10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ICE (बर्फ)</Label><Input type="number" value={formData.iceBlocks || "0"} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-8 border-[1.5px] border-black text-center font-black" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">भेसळ तपासणी कीट</Label><Input value={formData.adulterationKitInfo || ""} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-8 border-[1.5px] border-black text-xs" /></div>
                </div>
              </div>

              <div className="max-w-[500px]">
                <SectionTitle icon={FileText} title="विशेष शेरा (REMARK)" />
                <Textarea value={formData.additionalNotes || ""} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="h-16 text-[10px] border-[1.5px] border-black p-2 rounded-md" placeholder="..." />
              </div>
            </div>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print z-[100] sticky bottom-0">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetFormData(); }} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-10 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-primary text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><RouteDetailsContent /></Suspense>
}
