
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
  <div className={cn("flex items-center gap-1.5 border-b-2 pb-1 mb-2 mt-4", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[11px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const DynamicTable = ({ title, data, columns, onAdd, onRemove, onUpdate, color = "text-primary" }: any) => (
  <div className="space-y-2 mb-4">
    <div className="flex items-center justify-between">
      <h3 className={cn("text-[11px] font-black uppercase tracking-wider", color)}>{title}</h3>
      <Button variant="outline" size="sm" onClick={onAdd} className="h-7 text-[9px] font-black border-black px-3 rounded-xl">+ जोडा</Button>
    </div>
    <div className="border-[1.5px] border-black rounded-xl overflow-hidden shadow-sm bg-white">
      <ScrollArea className="w-full">
        <Table className="text-[10px] min-w-max uppercase">
          <TableHeader className="bg-slate-100 h-8">
            <TableRow>
              {columns.map((col: any) => (
                <TableHead key={col.key} className={cn("h-8 px-2 text-center font-black border-r border-black last:border-0", col.className)}>{col.label}</TableHead>
              ))}
              <TableHead className="w-8 h-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data || []).map((row: any) => (
              <TableRow key={row.id} className="h-10 border-t border-black/10">
                {columns.map((col: any) => (
                  <TableCell key={col.key} className="p-0 border-r border-black/10">
                    <Input 
                      type={col.type || "text"}
                      value={row[col.key] || ""} 
                      onChange={e => onUpdate(row.id, { [col.key]: e.target.value })} 
                      className="h-9 border-none text-[11px] text-center font-bold bg-transparent outline-none focus-visible:ring-0" 
                    />
                  </TableCell>
                ))}
                <TableCell className="p-0 text-center">
                  <Button variant="ghost" size="icon" onClick={() => onRemove(row.id)} className="h-8 w-8 text-rose-500 p-0"><Trash2 className="h-4 w-4"/></Button>
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
    supplierType: "Center", operatorName: "", foundation_year: "",
    internal_gothas: [],
    sub_gavali_info: [],
    collection_villages: [],
    morning_collection_time: "", evening_collection_time: "", total_producers: "0", active_producers: "0",
    total_animals: "0", cows: "0", buffalo: "0", calves: "0",
    longTermProducers: [],
    decreasingProducers: [],
    dairy_employees: [],
    local_gavali: [],
    lss_details: [],
    competitor_facilities: [],
    sub_routes: [],
    milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
    fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    milkCansCount: "0", iceBlocks: "0", adulterationKitInfo: "",
    equipment: [],
    additionalInfo: ""
  })

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: currentRouteId, 
      supplierType: "Center", operatorName: "", foundation_year: "",
      internal_gothas: [], sub_gavali_info: [], collection_villages: [],
      morning_collection_time: "", evening_collection_time: "", total_producers: "0", active_producers: "0",
      total_animals: "0", cows: "0", buffalo: "0", calves: "0",
      longTermProducers: [], decreasingProducers: [], dairy_employees: [], local_gavali: [], lss_details: [],
      competitor_facilities: [], sub_routes: [],
      milk_decrease_reasons: "", efforts_taken: "", required_actions: "",
      fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      milkCansCount: "0", iceBlocks: "0", adulterationKitInfo: "",
      equipment: [], additionalInfo: ""
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
      internal_gothas: d.internal_gothas || [],
      sub_gavali_info: d.sub_gavali_info || [],
      collection_villages: d.collection_areas || [],
      longTermProducers: d.long_term_producers || [],
      decreasingProducers: d.decreasing_producers || [],
      dairy_employees: d.dairy_employees || [],
      local_gavali: d.local_gavali || [],
      lss_details: d.lss_details || [],
      competitor_facilities: d.competitor_facilities || [],
      sub_routes: d.sub_routes || [],
      milk_decrease_reasons: d.milk_decrease_reasons || "",
      efforts_taken: d.efforts_taken || "",
      required_actions: d.required_actions || "",
      foundation_year: d.foundation_year || ""
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      routeId: currentRouteId,
      cowMilk: { quantity: Number(formData.cowQty) || 0, fat: Number(formData.cowFat) || 0, snf: Number(formData.cowSnf) || 0 },
      buffaloMilk: { quantity: Number(formData.bufQty) || 0, fat: Number(formData.bufFat) || 0, snf: Number(formData.bufSnf) || 0 },
      producer_center: {
        additional_details: {
          morning_collection_time: formData.morning_collection_time,
          evening_collection_time: formData.evening_collection_time,
          total_producers: Number(formData.total_producers) || 0,
          active_producers: Number(formData.active_producers) || 0,
          total_animals: Number(formData.total_animals) || 0,
          cows: Number(formData.cows) || 0,
          buffalo: Number(formData.buffalo) || 0,
          calves: Number(formData.calves) || 0,
          internal_gothas: formData.internal_gothas,
          sub_gavali_info: formData.sub_gavali_info,
          collection_areas: formData.collection_villages,
          long_term_producers: formData.longTermProducers,
          decreasing_producers: formData.decreasingProducers,
          dairy_employees: formData.dairy_employees,
          local_gavali: formData.local_gavali,
          lss_details: formData.lss_details,
          competitor_facilities: formData.competitor_facilities,
          sub_routes: formData.sub_routes,
          milk_decrease_reasons: formData.milk_decrease_reasons,
          efforts_taken: formData.efforts_taken,
          required_actions: formData.required_actions,
          foundation_year: formData.foundation_year
        }
      },
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'suppliers'), data)
      toast({ title: "यशस्वी", description: "सप्लायर जतन झाला." })
    } else if (editingId) {
      updateDocumentNonBlocking(doc(db, 'users', user.uid, 'suppliers', editingId), data)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
    }
    setIsDialogOpen(false)
    resetFormData()
  }

  const addRow = (key: string, initial: any) => setFormData((p: any) => ({ ...p, [key]: [...(p[key] || []), { id: crypto.randomUUID(), ...initial }] }))
  const removeRow = (key: string, id: string) => setFormData((p: any) => ({ ...p, [key]: (p[key] || []).filter((r: any) => r.id !== id) }))
  const updateRow = (key: string, id: string, u: any) => setFormData((p: any) => ({ ...p, [key]: (p[key] || []).map((r: any) => r.id === id ? { ...r, ...u } : r) }))

  const filteredSuppliers = useMemo(() => suppliersList.filter(s => (s.name || "").toLowerCase().includes(searchQuery.toLowerCase())), [suppliersList, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 no-print gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/routes')} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-black uppercase truncate">{route?.name || "रूट माहिती"}</h2>
        </div>
        <Button onClick={handleOpenAdd} className="h-10 px-6 rounded-xl font-black uppercase text-[10px] shadow-lg">
          <Plus className="h-4 w-4 mr-1.5" /> नवीन सप्लायर जोडा
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-2xl overflow-hidden no-print">
          <div className="p-2 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-9 h-10 text-[12px] bg-white border-2 border-black rounded-xl font-bold uppercase outline-none focus:ring-1" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[200px] lg:h-[600px]">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={cn("p-3 cursor-pointer hover:bg-primary/5 transition-all", selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : '')}>
                  <h4 className="font-black text-[12px] uppercase truncate">{s.name}</h4>
                  <div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="h-4 px-1 text-[8px] font-black border-none bg-muted/50">ID: {s.supplierId}</Badge><span className="text-[9px] text-muted-foreground font-bold uppercase">{s.address}</span></div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 border shadow-none bg-white rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center">
          {selectedSupplier ? (
            <ScrollArea className="w-full h-full">
              <div className="p-8 printable-report bg-white text-left max-w-[210mm] mx-auto border-[1.5px] border-black m-4 shadow-xl rounded-sm">
                <div className="flex justify-between items-center no-print border-b pb-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-black">{selectedSupplier.supplierType} PROFILE</Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase px-3 border-2 border-black" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase px-3 border-2 border-black" onClick={() => handleOpenEdit(selectedSupplier)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
                  </div>
                </div>
                <div className="w-full border-b-[4px] border-black pb-3 mb-6 text-center">
                  <h3 className="text-[20pt] font-black uppercase text-primary">{selectedSupplier.name}</h3>
                  <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest">ID: {selectedSupplier.supplierId} | सविस्तर अहवाल</p>
                </div>
                
                <div className="grid grid-cols-2 gap-10 text-[12px] font-bold">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">१) प्राथमिक माहिती</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>ऑपरेटर नाव</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मोबाईल नंबर</span><span>{selectedSupplier.mobile || "-"}</span></div>
                      <div className="flex flex-col"><span>पत्ता</span><span className="font-medium text-slate-600">{selectedSupplier.address || "-"}</span></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">२) तांत्रिक तपशील</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                      <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center"><Building2 className="h-16 w-16 mb-4" /><h4 className="font-black uppercase tracking-[0.3em] text-sm">सप्लायर निवडा</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white flex flex-col h-[92vh] text-left">
          <DialogHeader className="p-4 bg-primary text-white shrink-0">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर फॉर्म' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[10px] text-white/70 uppercase">संपूर्ण १६+ कलमी सविस्तर फॉर्म (४-वे स्क्रोल उपलब्ध)</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-4 space-y-8 pb-32">
              <div className="max-w-[900px] mx-auto space-y-8">
                
                <div className="space-y-4">
                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">सप्लायर प्रकार</Label>
                      <Select value={formData.supplierType} onValueChange={(v: SupplierType) => setFormData({...formData, supplierType: v})}>
                        <SelectTrigger className="h-10 border-2 border-black font-black"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">ऑपरेटर</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">स्थापना वर्ष</Label><Input placeholder="YYYY" value={formData.foundation_year || ""} onChange={e => setFormData({...formData, foundation_year: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 border-2 border-black" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Gavali' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-1">
                        <h3 className="text-[11px] font-black uppercase text-indigo-700 flex items-center gap-1.5"><Users2 className="h-4 w-4"/> सब-गवळी माहिती (SUB-GAVALI INFO)</h3>
                        <Button size="sm" onClick={() => addRow('sub_gavali_info', { name: "", mobile: "", area: "", method: "Spot", producers: "0", animals: "0", cow_qty: "0", note: "" })} className="h-8 text-[10px] font-black bg-indigo-600 text-white rounded-xl shadow-lg">+ सब-गवळी जोडा</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.sub_gavali_info.map((sg: any, idx: number) => (
                          <Card key={sg.id} className="border-2 border-indigo-100 overflow-hidden rounded-2xl shadow-md bg-white">
                            <div className="p-2 bg-indigo-50 flex justify-between items-center border-b-2 border-indigo-100">
                              <Badge className="bg-indigo-600 font-black h-5 uppercase">SG-{idx + 1} सब-गवळी</Badge>
                              <Button variant="ghost" size="icon" onClick={() => removeRow('sub_gavali_info', sg.id)} className="h-7 w-7 text-rose-500"><X className="h-4 w-4" /></Button>
                            </div>
                            <div className="p-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव</Label><Input value={sg.name} onChange={e => updateRow('sub_gavali_info', sg.id, { name: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={sg.mobile} onChange={e => updateRow('sub_gavali_info', sg.id, { mobile: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">एरिया</Label><Input value={sg.area} onChange={e => updateRow('sub_gavali_info', sg.id, { area: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">पद्धत</Label>
                                  <Select value={sg.method} onValueChange={v => updateRow('sub_gavali_info', sg.id, { method: v })}>
                                    <SelectTrigger className="h-8 text-[10px] border-black"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Spot">Spot</SelectItem><SelectItem value="Route">Route</SelectItem></SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">उत्पादक</Label><Input value={sg.producers} onChange={e => updateRow('sub_gavali_info', sg.id, { producers: e.target.value })} className="h-8 text-[11px] border-black text-center" /></div>
                                <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">गाय दूध</Label><Input value={sg.cow_qty} onChange={e => updateRow('sub_gavali_info', sg.id, { cow_qty: e.target.value })} className="h-8 text-[11px] border-black text-center font-black" /></div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {(formData.supplierType === 'Center' || formData.supplierType === 'Gavali') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                      <h3 className="text-[11px] font-black uppercase text-primary flex items-center gap-1.5"><Building2 className="h-4 w-4"/> अंतर्गत मोठे गोठे (INTERNAL GOTHAS)</h3>
                      <Button size="sm" onClick={() => addRow('internal_gothas', { owner: "", location: "", breeds: [], hygiene: {} })} className="h-8 text-[10px] font-black bg-primary text-white rounded-xl shadow-lg">+ गोठा जोडा</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.internal_gothas.map((gotha: any, idx: number) => (
                        <Card key={gotha.id} className="border-2 border-primary/10 overflow-hidden rounded-2xl shadow-md bg-white">
                          <div className="p-2 bg-primary/5 flex justify-between items-center border-b-2 border-primary/10">
                            <Badge className="bg-primary font-black h-5 uppercase">G-{idx + 1} गोठा</Badge>
                            <Button variant="ghost" size="icon" onClick={() => removeRow('internal_gothas', gotha.id)} className="h-7 w-7 text-rose-500"><X className="h-4 w-4" /></Button>
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-2">
                             <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालक नाव</Label><Input value={gotha.owner} onChange={e => updateRow('internal_gothas', gotha.id, { owner: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                             <div className="space-y-1"><Label className="text-[9px] font-black uppercase">लोकेशन</Label><Input value={gotha.location} onChange={e => updateRow('internal_gothas', gotha.id, { location: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {formData.supplierType === 'Gotha' && (
                  <div className="space-y-4">
                    <SectionTitle icon={Building2} title="२) गोठा आकारमान & दूध वेळ" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">गोठा एकूण एरिया</Label><Input placeholder="उदा. १० गुंठे" value={formData.gotha_area || ""} onChange={e => setFormData({...formData, gotha_area: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">चारा एरिया</Label><Input placeholder="उदा. २ एकर" value={formData.fodder_area || ""} onChange={e => setFormData({...formData, fodder_area: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">सकाळ दूध वेळ</Label><Input type="time" value={formData.morning_milking_time || ""} onChange={e => setFormData({...formData, morning_milking_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">सायंकाळ दूध वेळ</Label><Input type="time" value={formData.evening_milking_time || ""} onChange={e => setFormData({...formData, evening_milking_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                    </div>
                    
                    <DynamicTable 
                      title="जनावरे & ब्रीड माहिती" 
                      data={formData.gotha_breeds || []} 
                      columns={[{ key: 'breed', label: 'ब्रीड (जात)' }, { key: 'count', label: 'संख्या', type: 'number' }, { key: 'avg_milk', label: 'सरासरी दूध (L)', type: 'number' }]} 
                      onAdd={() => addRow('gotha_breeds', { breed: "", count: "0", avg_milk: "0" })} 
                      onRemove={(id: string) => removeRow('gotha_breeds', id)} 
                      onUpdate={(id: string, u: any) => updateRow('gotha_breeds', id, u)} 
                    />

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4"/> गोठा स्वच्छता चेकलिस्ट</span>
                      <div className="grid grid-cols-2 gap-2 bg-emerald-50/50 p-3 rounded-2xl border-2 border-emerald-100">
                        {[
                          { key: 'floor', label: 'फरशी स्वच्छता' },
                          { key: 'animal', label: 'जनावरे स्वच्छता' },
                          { key: 'utensils', label: 'भांडी निर्जंतुक' },
                          { key: 'worker', label: 'कामगार स्वच्छता' },
                          { key: 'drainage', label: 'सांडपाणी निचरा' },
                          { key: 'pest', label: 'माश्या/डासांचे नियंत्रण' },
                          { key: 'water', label: 'स्वच्छ पाणी/चारा' },
                          { key: 'health', label: 'आरोग्य रेकॉर्ड' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-emerald-100 shadow-sm">
                            <Checkbox 
                              checked={formData.hygiene?.[item.key] || false} 
                              onCheckedChange={(v) => setFormData({...formData, hygiene: { ...(formData.hygiene || {}), [item.key]: !!v }})} 
                              className="h-4 w-4 border-emerald-400" 
                            />
                            <Label className="text-[10px] font-bold text-slate-700">{item.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <SectionTitle icon={Clock} title="२) संकलन वेळ & उत्पादक सारांश" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-black">सकाळ वेळ</Label><Input type="time" value={formData.morning_collection_time || ""} onChange={e => setFormData({...formData, morning_collection_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">सायंकाळ वेळ</Label><Input type="time" value={formData.evening_collection_time || ""} onChange={e => setFormData({...formData, evening_collection_time: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">एकूण उत्पादक</Label><Input type="number" value={formData.total_producers || "0"} onChange={e => setFormData({...formData, total_producers: e.target.value})} className="h-10 border-2 border-black text-center font-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">सक्रिय उत्पादक</Label><Input type="number" value={formData.active_producers || "0"} onChange={e => setFormData({...formData, active_producers: e.target.value})} className="h-10 border-2 border-black text-center font-black text-emerald-600" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Milk} title="३) जनावरांची माहिती" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-60">एकूण</Label><Input type="number" value={formData.total_animals || "0"} onChange={e => setFormData({...formData, total_animals: e.target.value})} className="h-10 border-2 border-black text-center font-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-60">गाई</Label><Input type="number" value={formData.cows || "0"} onChange={e => setFormData({...formData, cows: e.target.value})} className="h-10 border-2 border-black text-center" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-60">म्हशी</Label><Input type="number" value={formData.buffalo || "0"} onChange={e => setFormData({...formData, buffalo: e.target.value})} className="h-10 border-2 border-black text-center" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-60">वासरे</Label><Input type="number" value={formData.calves || "0"} onChange={e => setFormData({...formData, calves: e.target.value})} className="h-10 border-2 border-black text-center" /></div>
                  </div>
                </div>

                {formData.supplierType === 'Center' && (
                  <>
                    <DynamicTable title="५) २+ वर्ष जुने उत्पादक" data={formData.longTermProducers} columns={[{ key: 'name', label: 'नाव' }, { key: 'old_milk', label: 'जुने दूध', type: 'number' }, { key: 'curr_milk', label: 'सध्याचे', type: 'number' }]} onAdd={() => addRow('longTermProducers', { name: "", old_milk: "0", curr_milk: "0" })} onRemove={(id: string) => removeRow('longTermProducers', id)} onUpdate={(id: string, u: any) => updateRow('longTermProducers', id, u)} />
                    <DynamicTable title="६) दूध घटलेले उत्पादक" data={formData.decreasingProducers} columns={[{ key: 'name', label: 'नाव' }, { key: 'old_milk', label: 'जुने दूध', type: 'number' }, { key: 'new_milk', label: 'नवे दूध', type: 'number' }, { key: 'reason', label: 'कारण' }]} onAdd={() => addRow('decreasingProducers', { name: "", old_milk: "0", new_milk: "0", reason: "" })} onRemove={(id: string) => removeRow('decreasingProducers', id)} onUpdate={(id: string, u: any) => updateRow('decreasingProducers', id, u)} color="text-rose-600" />
                  </>
                )}

                <DynamicTable title="७) डेअरी कर्मचारी माहिती" data={formData.dairy_employees} columns={[{ key: 'name', label: 'नाव' }, { key: 'cow', label: 'गाई', type: 'number' }, { key: 'buf', label: 'म्हशी', type: 'number' }, { key: 'milk', label: 'दूध(L)', type: 'number' }]} onAdd={() => addRow('dairy_employees', { name: "", farm: "", cow: "0", buf: "0", milk: "0", supply: "" })} onRemove={(id: string) => removeRow('dairy_employees', id)} onUpdate={(id: string, u: any) => updateRow('dairy_employees', id, u)} />
                <DynamicTable title="८) स्थानिक गवळी माहिती" data={formData.local_gavali} columns={[{ key: 'name', label: 'नाव' }, { key: 'code', label: 'कोड' }, { key: 'cow', label: 'गाय', type: 'number' }, { key: 'buf', label: 'म्हेस', type: 'number' }]} onAdd={() => addRow('local_gavali', { name: "", code: "", cow: "0", buf: "0", qty: "0" })} onRemove={(id: string) => removeRow('local_gavali', id)} onUpdate={(id: string, u: any) => updateRow('local_gavali', id, u)} />
                <DynamicTable title="१०) स्पर्धक डेअरी माहिती" data={formData.competitor_facilities} columns={[{ key: 'name', label: 'डेअरी नाव' }, { key: 'rate', label: 'दर (₹)', type: 'number' }, { key: 'fac', label: 'सुविधा' }]} onAdd={() => addRow('competitor_facilities', { name: "", c_rate: "", b_rate: "", rate: "0", fac: "" })} onRemove={(id: string) => removeRow('competitor_facilities', id)} onUpdate={(id: string, u: any) => updateRow('competitor_facilities', id, u)} color="text-amber-600" />

                <div className="space-y-4">
                  <SectionTitle icon={ShieldCheck} title="१३) परवाना & तांत्रिक" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber || ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry || ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand || ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand || ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 border-2 border-black" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Wallet} title="१४) व्यावसायिक & दूध तपशील" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-2">
                       <Label className="text-[11px] font-black text-blue-600 flex items-center gap-1.5"><Milk className="h-4 w-4"/> गाय दूध (Qty/Fat/Snf)</Label>
                       <div className="grid grid-cols-3 gap-2">
                         <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} placeholder="Q" className="h-9 border-blue-600 text-center font-black" />
                         <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} placeholder="F" className="h-9 border-blue-600 text-center font-black" />
                         <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} placeholder="S" className="h-9 border-blue-600 text-center font-black" />
                       </div>
                    </div>
                    <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl space-y-2">
                       <Label className="text-[11px] font-black text-amber-600 flex items-center gap-1.5"><Milk className="h-4 w-4"/> म्हेस दूध (Qty/Fat/Snf)</Label>
                       <div className="grid grid-cols-3 gap-2">
                         <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} placeholder="Q" className="h-9 border-amber-600 text-center font-black" />
                         <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} placeholder="F" className="h-9 border-amber-600 text-center font-black" />
                         <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} placeholder="S" className="h-9 border-amber-600 text-center font-black" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle icon={Box} title="१५) इन्व्हेंटरी & स्टेटस" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                     <div className="flex flex-col items-center gap-2 p-3 bg-slate-100 rounded-2xl border-2 border-black cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Laptop className={cn("h-6 w-6", formData.computerAvailable ? 'text-primary' : 'text-slate-400')} /><Label className="text-[10px] font-black uppercase">POP: {formData.computerAvailable ? 'हो' : 'नाही'}</Label></div>
                     <div className="flex flex-col items-center gap-2 p-3 bg-slate-100 rounded-2xl border-2 border-black cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Zap className={cn("h-6 w-6", formData.upsInverterAvailable ? 'text-amber-500' : 'text-slate-400')} /><Label className="text-[10px] font-black uppercase">UPS: {formData.upsInverterAvailable ? 'हो' : 'नाही'}</Label></div>
                     <div className="flex flex-col items-center gap-1 p-2 bg-slate-100 rounded-2xl border-2 border-black"><Label className="text-[8px] font-black uppercase opacity-50">CANS</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-8 border-none text-center bg-transparent font-black" /></div>
                  </div>
                  <DynamicTable title="साहित्याची यादी (ASSETS)" data={formData.equipment} columns={[{ key: 'name', label: 'साहित्य नाव' }, { key: 'quantity', label: 'प्रमाण', type: 'number' }]} onAdd={() => addRow('equipment', { name: "", quantity: "1", status: "OK" })} onRemove={(id: string) => removeRow('equipment', id)} onUpdate={(id: string, u: any) => updateRow('equipment', id, u)} />
                </div>

                <div className="space-y-2">
                  <SectionTitle icon={Info} title="विशेष शेरा (REMARK)" color="text-slate-500" />
                  <Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-24 border-2 border-black p-4" />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 flex flex-row gap-3 no-print">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetFormData(); }} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-2xl shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest bg-primary text-white flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> माहिती जतन करा (SAVE)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function Page() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><RouteDetailsContent /></Suspense>
}
