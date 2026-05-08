
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
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
  UsersRound, Sprout, ShoppingCart, Activity, ClipboardCheck, ChevronUp, ChevronDown
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

function SuppliersContent() {
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
    morning_collection_time: "", evening_collection_time: "",
    start_year: "",
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
    // Multiple Internal Gothas
    internal_gothas: [] as any[],
    // Gotha Specific Fields
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

  const resetFormData = () => {
    setFormData({
      name: "", supplierId: "", address: "", mobile: "", operatorName: "",
      routeId: currentRouteId,
      supplierType: "Center", fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", paymentCycle: "10 Days", spaceOwnership: "Self",
      hygieneGrade: "A", competition: "", cattleFeedBrand: "None", iceBlocks: "0",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "", additionalNotes: "", equipment: [],
      morning_collection_time: "", evening_collection_time: "",
      start_year: "",
      total_producers: "0", active_producers: "0", inactive_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], highCapacityProducers: [],
      highMilkProducers: [], localEmployees: [], localGavliInfo: [],
      lssFacilities: [], competitorFacilities: [], subRoutes: [],
      collectionAreas: [],
      milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
      internal_gothas: [],
      gotha_total_area: "", gotha_fodder_area: "", gotha_purchase_source: "", gotha_previous_dairy: "",
      gotha_breed_info: [], gotha_worker_info: [], gotha_fodder_management: "",
      gotha_milking_shift_morning: "", gotha_milking_shift_evening: "", gotha_hygiene_remark: "",
      gotha_hygiene_checklist: {
        floor_cleaned: false, animal_cleaned: false, utensils_sanitized: false,
        worker_hygiene: false, proper_drainage: false, pest_control: false,
        clean_water_trough: false, health_records: false
      }
    })
  }

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
      competitorFacilities: details.competitor_dairies || [],
      subRoutes: details.sub_routes || [],
      collectionAreas: details.collection_areas || [],
      milk_decrease_reasons: details.milk_decrease_reasons || "",
      efforts_taken: details.efforts_taken || "",
      required_actions: details.required_actions || "",
      internal_gothas: details.internal_gothas || [],
      // Dedicated Gotha fields
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
      competitor_dairies: formData.competitorFacilities,
      sub_routes: formData.subRoutes,
      collection_areas: formData.collectionAreas,
      milk_decrease_reasons: formData.milk_decrease_reasons,
      efforts_taken: formData.efforts_taken,
      required_actions: formData.required_actions,
      internal_gothas: formData.internal_gothas,
      // Dedicated Gotha Specific
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
                <div className="text-center border-b-[1.5px] border-black pb-2 mb-3">
                  <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight">{selectedSupplier.name}</h3>
                  <p className="text-[8px] font-black text-muted-foreground uppercase mt-0.5">ID: {selectedSupplier.supplierId} | {selectedSupplier.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                   <div className="space-y-0.5"><p className="text-[7px] uppercase text-muted-foreground">मोबाईल</p><p>{selectedSupplier.mobile || "-"}</p></div>
                   <div className="space-y-0.5"><p className="text-[7px] uppercase text-muted-foreground">ऑपरेटर</p><p>{selectedSupplier.operatorName || "-"}</p></div>
                </div>
                {(selectedSupplier.supplierType === 'Center' || selectedSupplier.supplierType === 'Gavali' || selectedSupplier.supplierType === 'Gotha') && selectedSupplier.producer_center && (
                  <div className="w-full space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                      <div>सकाळ वेळ: {selectedSupplier.producer_center.additional_details?.morning_collection_time}</div>
                      <div>सायंकाळ वेळ: {selectedSupplier.producer_center.additional_details?.evening_collection_time}</div>
                      <div>एकूण उत्पादक/जनावरे: {selectedSupplier.producer_center.additional_details?.total_producers || selectedSupplier.producer_center.additional_details?.total_animals}</div>
                      <div>सक्रिय: {selectedSupplier.producer_center.additional_details?.active_producers}</div>
                    </div>
                  </div>
                )}
                <p className="text-center italic text-[9px] py-6 opacity-40 uppercase font-black tracking-widest">सविस्तर तपशील पाहण्यासाठी बदला बटन दाबा.</p>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-10 p-10 text-center uppercase font-black">
              <User className="h-10 w-10 mb-2" />
              <p className="text-[9px]">सप्लायर निवडा</p>
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
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  </div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">स्थापना वर्ष</Label><Input value={formData.start_year} placeholder="YYYY" onChange={e => setFormData({...formData, start_year: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                </div>
              </div>

              {/* Multiple Internal Gothas for Center/Gavali */}
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
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">मालकाचे नाव</Label><Input value={gotha.owner_name} onChange={e => handleInternalGothaUpdate(gotha.id, { owner_name: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">कोड नंबर</Label><Input value={gotha.code} onChange={e => handleInternalGothaUpdate(gotha.id, { code: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">लोकेशन</Label><Input value={gotha.location} onChange={e => handleInternalGothaUpdate(gotha.id, { location: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">गोठा एरिया</Label><Input value={gotha.area} onChange={e => handleInternalGothaUpdate(gotha.id, { area: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">चारा एरिया</Label><Input value={gotha.fodder_area} onChange={e => handleInternalGothaUpdate(gotha.id, { fodder_area: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सकाळ दूध वेळ</Label><Input type="time" value={gotha.milking_morning} onChange={e => handleInternalGothaUpdate(gotha.id, { milking_morning: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                              <div className="space-y-0.5"><Label className="text-[8px] font-black uppercase opacity-60">सायंकाळ वेळ</Label><Input type="time" value={gotha.milking_evening} onChange={e => handleInternalGothaUpdate(gotha.id, { milking_evening: e.target.value })} className="h-7 border-2 border-black text-[10px]" /></div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase text-rose-600 flex items-center gap-1.5"><Activity className="h-3 w-3" /> जनावरे & ब्रीड</span><Button size="sm" variant="outline" onClick={() => handleInternalGothaSubRowAdd(gotha.id, 'breeds', { breed: "", count: 0, avg_milk: 0 })} className="h-6 text-[8px] font-black uppercase border-black px-2">जोडा</Button></div>
                              <div className="border border-black rounded-lg overflow-hidden">
                                <Table className="text-[10px]">
                                  <TableHeader className="bg-slate-50 h-7"><TableRow><TableHead className="h-7 px-2">ब्रीड</TableHead><TableHead className="h-7 px-2 text-center w-12">नग</TableHead><TableHead className="h-7 px-2 text-right w-16">Avg(L)</TableHead><TableHead className="h-7 w-8"></TableHead></TableRow></TableHeader>
                                  <TableBody>
                                    {gotha.breeds.map((row: any) => (
                                      <TableRow key={row.id} className="h-8">
                                        <TableCell className="p-0 border-r"><Input value={row.breed} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { breed: e.target.value })} className="h-7 border-none text-center font-bold text-[10px] bg-transparent" /></TableCell>
                                        <TableCell className="p-0 border-r"><Input type="number" value={row.count} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { count: e.target.value })} className="h-7 border-none text-center font-black text-[10px] bg-transparent" /></TableCell>
                                        <TableCell className="p-0 border-r"><Input type="number" value={row.avg_milk} onChange={e => handleInternalGothaSubRowUpdate(gotha.id, 'breeds', row.id, { avg_milk: e.target.value })} className="h-7 border-none text-center font-black text-[10px] bg-transparent" /></TableCell>
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
                                      checked={gotha.hygiene_checklist[item.key]} 
                                      onCheckedChange={(checked) => {
                                        const newChecklist = { ...gotha.hygiene_checklist, [item.key]: !!checked };
                                        handleInternalGothaUpdate(gotha.id, { hygiene_checklist: newChecklist });
                                      }} 
                                      className="h-3 w-3 border-emerald-400"
                                    />
                                    <Label htmlFor={`hygiene-${gotha.id}-${item.key}`} className="text-[8px] font-bold text-slate-700 cursor-pointer">{item.label}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">स्वच्छता शेरा</Label><Textarea value={gotha.hygiene_remark} onChange={e => handleInternalGothaUpdate(gotha.id, { hygiene_remark: e.target.value })} className="h-12 text-[10px] border-2 border-black p-2 rounded-lg" placeholder="..." /></div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Gotha case */}
              {formData.supplierType === 'Gotha' && (
                <div className="space-y-6">
                  <div className="max-w-[500px] space-y-3">
                    <SectionTitle icon={Building2} title="२) गोठा आकारमान & दूध वेळ" color="text-amber-700" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">गोठा एकूण एरिया</Label><Input value={formData.gotha_total_area} onChange={e => setFormData({...formData, gotha_total_area: e.target.value})} placeholder="उदा. १० गुंठे" className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">चारा एरिया</Label><Input value={formData.gotha_fodder_area} onChange={e => setFormData({...formData, gotha_fodder_area: e.target.value})} placeholder="उदा. २ एकर" className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_morning} onChange={e => setFormData({...formData, gotha_milking_shift_morning: e.target.value})} className="h-8 border-2 border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ दूध वेळ</Label><Input type="time" value={formData.gotha_milking_shift_evening} onChange={e => setFormData({...formData, gotha_milking_shift_evening: e.target.value})} className="h-8 border-2 border-black" /></div>
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
                                <TableCell className="p-0 border-r border-black/10"><Input value={row.breed} onChange={e => updateRow('gotha_breed_info', row.id, { breed: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-bold focus-visible:ring-0" placeholder="HF / गिर" /></TableCell>
                                <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.count} onChange={e => updateRow('gotha_breed_info', row.id, { count: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 border-r border-black/10"><Input type="number" value={row.avg_milk} onChange={e => updateRow('gotha_breed_info', row.id, { avg_milk: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-black focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('gotha_breed_info', row.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between max-w-[500px]">
                      <SectionTitle icon={UsersRound} title="कामगार माहिती" color="text-indigo-600" />
                      <Button size="sm" onClick={() => addRow('gotha_worker_info', { name: "", mobile: "" })} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg border-2 border-black bg-slate-50"><PlusCircle className="h-3 w-3 mr-1"/> जोडा</Button>
                    </div>
                    <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm">
                      <ScrollArea className="w-full">
                        <Table className="min-w-[400px] text-[10px] uppercase">
                          <TableHeader className="bg-slate-100 font-black h-8">
                            <TableRow>
                              <TableHead className="px-2 text-center h-8">कामगाराचे नाव</TableHead>
                              <TableHead className="px-2 text-center h-8 w-40">मोबाईल</TableHead>
                              <TableHead className="w-10 h-8"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.gotha_worker_info.map((row: any) => (
                              <TableRow key={row.id} className="h-9 hover:bg-slate-50">
                                <TableCell className="p-0 border-r border-black/10"><Input value={row.name} onChange={e => updateRow('gotha_worker_info', row.id, { name: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-bold focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 border-r border-black/10"><Input value={row.mobile} onChange={e => updateRow('gotha_worker_info', row.id, { mobile: e.target.value })} className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-bold focus-visible:ring-0" /></TableCell>
                                <TableCell className="p-0 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('gotha_worker_info', row.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button></TableCell>
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-emerald-50/50 p-4 rounded-xl border-2 border-emerald-100">
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
                            id={`hygiene-single-${item.key}`} 
                            checked={(formData.gotha_hygiene_checklist as any)[item.key]} 
                            onCheckedChange={(checked) => setFormData({...formData, gotha_hygiene_checklist: { ...formData.gotha_hygiene_checklist, [item.key]: !!checked }})} 
                            className="h-3.5 w-3.5 border-emerald-400"
                          />
                          <Label htmlFor={`hygiene-single-${item.key}`} className="text-[9px] font-bold text-slate-700 cursor-pointer">{item.label}</Label>
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
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-8 border-[1.5px] border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-8 border-[1.5px] border-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-8 border-[1.5px] border-black text-center font-black" /></div>
                      <div className="space-y-0.5"><Label className="text-[9px] font-black">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-8 border-[1.5px] border-black text-center font-black text-emerald-600" /></div>
                    </div>
                  </div>

                  <div className="max-w-[500px] space-y-3">
                    <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">एकूण</Label><Input type="number" value={formData.total_animals} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">गाई</Label><Input type="number" value={formData.cows} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">म्हशी</Label><Input type="number" value={formData.buffalo} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                      <div className="space-y-0.5"><Label className="text-[8px] font-black">वासरे</Label><Input type="number" value={formData.calves} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-7 border border-black text-center text-[10px]" /></div>
                    </div>
                  </div>

                  {/* Professional Dynamic Tables */}
                  {[
                    { id: 'collectionAreas', title: '४) संकलन एरिया & गावे', icon: MapPin, fields: [{n:'गाव नाव',k:'village',w:'140px'}, {n:'उत्पादक',k:'producers',w:'70px'}, {n:'दूध(L)',k:'milkQty',w:'70px'}], initial: { village: "", producers: 0, milkQty: 0 }, visible: formData.supplierType === 'Gavali' },
                    { id: 'longTermProducers', title: '५) २+ वर्ष जुने उत्पादक', icon: Layers, fields: [{n:'नाव',k:'producer_name',w:'140px'}, {n:'जुने दूध',k:'previous_milk',w:'70px'}, {n:'सध्याचे',k:'current_milk',w:'70px'}, {n:'जुनी जनावरे',k:'previous_animals',w:'80px'}, {n:'नवी',k:'current_animals',w:'80px'}], initial: { producer_name: "", previous_milk: 0, current_milk: 0, previous_animals: 0, current_animals: 0 }, visible: formData.supplierType === 'Center' },
                    { id: 'decreasingProducers', title: '६) दूध घटलेले उत्पादक', icon: TrendingDown, fields: [{n:'नाव',k:'producer_name',w:'140px'}, {n:'जुने दूध',k:'previous_milk',w:'70px'}, {n:'नवे दूध',k:'current_milk',w:'70px'}, {n:'कारण',k:'reason',w:'180px'}], initial: { producer_name: "", previous_milk: 0, current_milk: 0, reason: "" }, color: 'text-rose-600', visible: formData.supplierType === 'Center' },
                    { id: 'localEmployees', title: '७) डेअरी कर्मचारी माहिती', icon: Briefcase, fields: [{n:'नाव',k:'name',w:'140px'}, {n:'शेती',k:'land',w:'100px'}, {n:'गाई',k:'cows_count',w:'60px'}, {n:'म्हशी',k:'buffalo_count',w:'60px'}, {n:'दूध(L)',k:'total_supply',w:'70px'}, {n:'पुरवठा कोठे',k:'supply_location',w:'140px'}], initial: { name: "", land: "", cows_count: 0, buffalo_count: 0, total_supply: 0, supply_location: "" }, color: 'text-indigo-600', visible: true },
                    { id: 'localGavliInfo', title: '८) स्थानिक गवळी माहिती', icon: Users, fields: [{n:'नाव',k:'name',w:'140px'}, {n:'कोड',k:'code',w:'70px'}, {n:'गाय',k:'gay_dudh',w:'60px'}, {n:'म्हेस',k:'mhais_dudh',w:'60px'}, {n:'उत्पादक',k:'producers',w:'70px'}], initial: { name: "", code: "", gay_dudh: 0, mhais_dudh: 0, producers: 0 }, color: 'text-emerald-600', visible: true },
                    { id: 'lssFacilities', title: '९) LSS & डेअरी सुविधा माहिती', icon: Sparkles, fields: [{n:'सुविधा नाव',k:'item',w:'160px'}, {n:'स्थिती',k:'availability',w:'100px'}, {n:'शेरा',k:'remark',w:'180px'}], initial: { item: "", availability: "हो", remark: "" }, color: 'text-blue-600', visible: true },
                    { id: 'competitorFacilities', title: '१०) स्पर्धक डेअरी माहिती', icon: Building2, fields: [{n:'डेअरी नाव',k:'dairyName',w:'140px'}, {n:'दर (₹)',k:'rate',w:'80px'}, {n:'सुविधा',k:'facility',w:'180px'}], initial: { dairyName: "", rate: "", facility: "" }, color: 'text-amber-600', visible: true },
                    { id: 'subRoutes', title: '११) अंतर्गत उप-रूट माहिती', icon: Truck, fields: [{n:'गाडी',k:'vehicleType',w:'120px'}, {n:'किमी',k:'km',w:'60px'}, {n:'परिसर',k:'area',w:'120px'}, {n:'उत्पादक',k:'producers',w:'70px'}, {n:'दूध(L)',k:'milkQty',w:'70px'}], initial: { vehicleType: "", km: "", area: "", producers: 0, milkQty: 0 }, color: 'text-amber-600', visible: true }
                  ].map(sec => sec.visible && (
                    <div key={sec.id} className="space-y-2">
                      <div className="flex items-center justify-between max-w-[500px]">
                        <SectionTitle icon={sec.icon} title={sec.title} color={sec.color || 'text-primary'} />
                        <Button size="sm" onClick={() => addRow(sec.id, sec.initial)} className="h-7 text-[9px] font-black uppercase px-3 rounded-lg border-2 border-black bg-slate-50"><PlusCircle className="h-3 w-3 mr-1"/> जोडा</Button>
                      </div>
                      <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm">
                        <ScrollArea className="w-full">
                          <Table className="min-w-max text-[10px] uppercase">
                            <TableHeader className="bg-slate-100 font-black h-8">
                              <TableRow>
                                {sec.fields.map(f => <TableHead key={f.k} style={{width: f.w}} className="px-2 text-center h-8 border-r border-black/10 last:border-0">{f.n}</TableHead>)}
                                <TableHead className="w-10 h-8"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(formData as any)[sec.id].map((row: any) => (
                                <TableRow key={row.id} className="h-9 hover:bg-slate-50 transition-colors">
                                  {sec.fields.map(f => (
                                    <TableCell key={f.k} className="p-0 border-r border-black/10 last:border-0">
                                      <Input 
                                        value={row[f.k]} 
                                        onChange={e => updateRow(sec.id, row.id, { [f.k]: e.target.value })} 
                                        className="h-8 border-none text-[11px] text-center p-1 bg-transparent font-bold focus-visible:ring-0" 
                                      />
                                    </TableCell>
                                  ))}
                                  <TableCell className="p-0 text-center">
                                    <Button variant="ghost" size="icon" onClick={() => removeRow(sec.id, row.id)} className="h-8 w-8 text-rose-500"><Trash2 className="h-3.5 w-3.5"/></Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                  ))}

                  <div className="max-w-[500px] space-y-4">
                    <SectionTitle icon={Lightbulb} title="१२) विशेष विश्लेषण & उपाययोजना" />
                    <div className="space-y-3">
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-rose-600">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="min-h-[60px] border-2 border-black text-[11px] font-medium p-2 rounded-xl" /></div>
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-indigo-600">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="min-h-[60px] border-2 border-black text-[11px] font-medium p-2 rounded-xl" /></div>
                       <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-emerald-600">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="min-h-[60px] border-2 border-black text-[11px] font-medium p-2 rounded-xl" /></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-[500px] space-y-3">
                <SectionTitle icon={ShieldCheck} title="१३) परवाना & तांत्रिक" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[9px] font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 border-2 border-black font-bold" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 border-2 border-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 border-2 border-black font-bold" /></div>
                  <div className="space-y-1"><Label className="text-[9px] font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 border-2 border-black font-bold" /></div>
                </div>
              </div>

              <div className="max-w-[500px] space-y-3">
                <SectionTitle icon={Wallet} title="१४) व्यावसायिक & दूध तपशील" />
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <Label className="text-[9px] font-black uppercase text-blue-600 block mb-1.5 flex items-center gap-1.5"><Milk className="h-3 w-3"/> गाय दूध (Q/F/S)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="Q" />
                      <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="F" />
                      <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="S" />
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <Label className="text-[9px] font-black uppercase text-amber-600 block mb-1.5 flex items-center gap-1.5"><Milk className="h-3 w-3"/> म्हेस दूध (Q/F/S)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="Q" />
                      <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="F" />
                      <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 border-black text-center font-black text-[12px]" placeholder="S" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-[500px] space-y-4">
                <SectionTitle icon={Box} title="१५) इन्व्हेंटरी & स्टेटस" />
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" type="button" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})} className={cn("h-9 border-2 border-black font-black text-[10px] uppercase shadow-sm transition-all active:scale-95", formData.computerAvailable ? "bg-primary text-white border-primary" : "bg-white")}>
                    <Laptop className={cn("h-3.5 w-3.5 mr-1.5", formData.computerAvailable ? "text-white" : "text-slate-400")} /> POP: {formData.computerAvailable ? 'YES' : 'NO'}
                  </Button>
                  <Button variant="outline" size="sm" type="button" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})} className={cn("h-9 border-2 border-black font-black text-[10px] uppercase shadow-sm transition-all active:scale-95", formData.upsInverterAvailable ? "bg-amber-500 text-white border-amber-500" : "bg-white")}>
                    <Zap className={cn("h-3.5 w-3.5 mr-1.5", formData.upsInverterAvailable ? "text-white" : "text-slate-400")} /> UPS: {formData.upsInverterAvailable ? 'YES' : 'NO'}
                  </Button>
                  <div className="flex flex-col"><Label className="text-[8px] font-black ml-1 uppercase opacity-60">CANS</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-8 border-2 border-black text-center font-black text-[12px]" /></div>
                  <div className="flex flex-col"><Label className="text-[8px] font-black ml-1 uppercase opacity-60">ICE (बर्फ)</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-8 border-2 border-black text-center font-black text-[12px]" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-slate-500">भेसळ तपासणी कीट</Label><Input value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-8 border-2 border-black font-bold text-xs" /></div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label className="text-[10px] font-black uppercase tracking-wider">साहित्याची यादी (ASSETS)</Label><Button size="sm" variant="outline" onClick={() => addRow('equipment', { name: "", quantity: 1, ownership: 'Company' })} className="h-7 text-[9px] font-black px-3 rounded-lg border-2 border-black bg-slate-50">जोडा</Button></div>
                  <div className="space-y-1.5">
                    {formData.equipment.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-black/10 items-center">
                        <div className="col-span-6"><Input value={item.name} onChange={e => updateRow('equipment', item.id, {name: e.target.value})} className="h-8 border-2 border-black bg-white w-full px-2 font-bold text-[11px]" placeholder="साहित्य नाव" /></div>
                        <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateRow('equipment', item.id, {quantity: Number(e.target.value)})} className="h-8 border-2 border-black text-center bg-white w-full p-0 font-black" /></div>
                        <div className="col-span-3">
                          <Select value={item.ownership} onValueChange={v => updateRow('equipment', item.id, {ownership: v as any})}>
                            <SelectTrigger className="h-8 text-[9px] bg-white border-2 border-black font-black p-1"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Self" className="font-bold">स्वतः</SelectItem><SelectItem value="Company" className="font-bold">डेअरी</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 text-center"><Button variant="ghost" size="icon" onClick={() => removeRow('equipment', item.id)} className="h-7 w-7 text-rose-500"><X className="h-4 w-4"/></Button></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">विशेष शेरा (REMARK)</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-16 border-2 border-black font-medium text-[11px] p-2 rounded-xl" /></div>
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

export default function RouteSuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black text-[10px] opacity-30">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
