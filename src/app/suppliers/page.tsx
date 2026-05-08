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
  <div className={cn("flex items-center gap-1.5 border-b-2 pb-1 mb-2 mt-4", color === 'text-primary' ? 'border-primary/20' : 'border-black/20')}>
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[11px] font-black uppercase tracking-wider", color)}>{title}</h3>
  </div>
)

const DynamicTable = ({ title, data, columns, onAdd, onRemove, onUpdate, color = "text-primary" }: any) => (
  <div className="space-y-2 mb-4">
    <div className="flex items-center justify-between">
      <SectionTitle title={title} color={color} />
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
    supplierType: "Center", operatorName: "", foundation_year: "",
    internal_gothas: [],
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

  useEffect(() => setMounted(true), [])

  const resetFormData = useCallback(() => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
      supplierType: "Center", operatorName: "", foundation_year: "",
      internal_gothas: [],
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
  }, [])

  const addRow = (key: string, initial: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: [...(prev[key] || []), { id: crypto.randomUUID(), ...initial }] }))
  }
  const removeRow = (key: string, id: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: (prev[key] || []).filter((r: any) => r.id !== id) }))
  }
  const updateRow = (key: string, id: string, updates: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: (prev[key] || []).map((r: any) => r.id === id ? { ...r, ...updates } : r) }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
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

  const prepareEdit = (supp: Supplier) => {
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
      internal_gothas: d.internal_gothas || [],
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
    setIsEditing(true)
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
    <div className="space-y-4 max-w-full mx-auto w-full pb-10 px-2 animate-in fade-in duration-500 overflow-x-hidden text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 no-print">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> उत्पादक केंद्र मास्टर
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Upgraded Producer Center Form</p>
        </div>
        <Button onClick={() => { resetFormData(); setIsAdding(true); }} className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[10px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन केंद्र जोडा
        </Button>
      </div>

      <Card className="border shadow-none rounded-2xl overflow-hidden bg-white border-muted-foreground/10 p-2 no-print w-full">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <Input placeholder="नाव किंवा कोड शोधा..." className="pl-10 h-10 rounded-xl bg-muted/10 border-2 border-black font-bold text-xs shadow-inner w-full" value={searchQuery || ""} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-muted/10 border-2 border-black font-black text-[9px] uppercase">
              <Filter className="h-3.5 w-3.5 mr-2" /><SelectValue placeholder="रूट निवडा" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] font-bold uppercase">सर्व रूट</SelectItem>
              {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[10px] font-bold uppercase">{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="w-full">
        {!selectedSupplier ? (
          <div className="bg-white rounded-2xl border-2 border-black shadow-2xl overflow-hidden no-print w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/30 h-10">
                  <TableHead className="font-black text-[9px] uppercase px-4 whitespace-nowrap">केंद्र तपशील</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-center whitespace-nowrap">रूट</TableHead>
                  <TableHead className="font-black text-[9px] uppercase text-right px-4">क्रिया</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supp) => (
                  <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors h-14" onClick={() => setSelectedSupplier(supp)}>
                    <TableCell className="py-2 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-[12px] uppercase truncate">{supp.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-black border-none bg-primary/5 text-primary">ID: {supp.supplierId}</Badge>
                          <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1"><Phone className="h-3 w-3" /> {supp.mobile}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="h-5 px-2 text-[8px] font-black uppercase border-none bg-emerald-100 text-emerald-700">
                        {supp.routeId ? routes?.find(r => r.id === supp.routeId)?.name || '...' : 'Unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-4">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white border-2 border-black rounded-sm w-full max-w-[210mm] mx-auto p-4 sm:p-10 flex flex-col items-center animate-in slide-in-from-right-2 duration-300 relative">
             <Button variant="ghost" size="icon" onClick={() => setSelectedSupplier(null)} className="absolute top-4 right-4 h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-xl no-print"><X className="h-6 w-6" /></Button>
             <div className="w-full flex items-center justify-between no-print mb-6 border-b pb-2">
               <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">CENTER DETAILED PROFILE</Badge>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                 <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => prepareEdit(selectedSupplier)}><Edit className="h-4 w-4 mr-1.5" /> बदल करा</Button>
               </div>
             </div>
             <div className="w-full border-b-[4px] border-black pb-3 mb-8 text-center">
               <h3 className="text-[22pt] font-black uppercase text-primary tracking-[0.1em]">{selectedSupplier.name}</h3>
               <p className="text-[11pt] font-black text-muted-foreground uppercase tracking-widest mt-1">आयडी: {selectedSupplier.supplierId} | सविस्तर उत्पादक केंद्र अहवाल</p>
             </div>
             <div className="w-full text-left space-y-8">
               <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">१) प्राथमिक माहिती</h4>
                   <div className="space-y-2 text-[12px] font-bold">
                     <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>ऑपरेटर</span><span>{selectedSupplier.operatorName || "-"}</span></div>
                     <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मोबाईल</span><span>{selectedSupplier.mobile || "-"}</span></div>
                     <div className="flex flex-col gap-1"><span>पत्ता</span><span className="font-medium text-slate-600 leading-relaxed">{selectedSupplier.address || "-"}</span></div>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <h4 className="text-[11px] font-black uppercase text-primary border-b-2 border-black pb-1">२) परवाना & तांत्रिक</h4>
                   <div className="space-y-2 text-[12px] font-bold">
                     <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>FSSAI क्र.</span><span>{selectedSupplier.fssaiNumber || "-"}</span></div>
                     <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>काटा ब्रँड</span><span>{selectedSupplier.scaleBrand || "-"}</span></div>
                     <div className="flex justify-between border-b border-dashed border-black/20 pb-1"><span>मशीन ब्रँड</span><span>{selectedSupplier.fatMachineBrand || "-"}</span></div>
                   </div>
                 </div>
               </div>
               <div className="grid grid-cols-4 gap-4">
                 <div className="p-3 border-2 border-black rounded-xl bg-slate-50 text-center"><p className="text-[8px] font-black uppercase opacity-50">एकूण उत्पादक</p><p className="text-xl font-black">{selectedSupplier.producer_center?.additional_details?.total_producers || 0}</p></div>
                 <div className="p-3 border-2 border-black rounded-xl bg-slate-50 text-center"><p className="text-[8px] font-black uppercase opacity-50">एकूण जनावरे</p><p className="text-xl font-black">{selectedSupplier.producer_center?.additional_details?.total_animals || 0}</p></div>
                 <div className="p-3 border-2 border-black rounded-xl bg-blue-50 text-center"><p className="text-[8px] font-black uppercase text-blue-600">गाय दूध(L)</p><p className="text-xl font-black text-blue-900">{selectedSupplier.cowMilk?.quantity || 0}L</p></div>
                 <div className="p-3 border-2 border-black rounded-xl bg-amber-50 text-center"><p className="text-[8px] font-black uppercase text-amber-600">म्हेस दूध(L)</p><p className="text-xl font-black text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}L</p></div>
               </div>
             </div>
             <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[11pt] tracking-[0.2em]">
               <div className="border-t-2 border-black pt-3">अधिकृत स्वाक्षरी</div>
               <div className="border-t-2 border-black pt-3">केंद्र मालक स्वाक्षरी</div>
             </div>
          </div>
        )}
      </div>

      <Dialog open={isAdding || isEditing} onOpenChange={(open) => { if(!open) { setIsAdding(false); setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[98vw] w-[98vw] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white flex flex-col h-[92vh] text-left">
          <DialogHeader className="p-4 bg-primary text-white shrink-0 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <DialogTitle className="text-sm font-black uppercase tracking-widest">{isAdding ? 'नवीन सप्लायर उत्पादक केंद्र फॉर्म' : 'माहिती अद्ययावत करा'}</DialogTitle>
              <DialogDescription className="text-[9px] text-white/70 uppercase">संपूर्ण १६+ कलमी सविस्तर फॉर्म</DialogDescription>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-4 space-y-8 pb-32">
              <div className="max-w-[900px] mx-auto space-y-8">
                
                <div className="space-y-4">
                  <SectionTitle icon={User} title="१) प्राथमिक माहिती" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">सप्लायर प्रकार</Label><Input value="उत्पादक केंद्र" readOnly className="h-10 border-2 border-black font-black bg-slate-50" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">केंद्र नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile || ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 border-2 border-black font-bold" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">ऑपरेटर नाव</Label><Input value={formData.operatorName || ""} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase">स्थापना वर्ष</Label><Input placeholder="YYYY" value={formData.foundation_year || ""} onChange={e => setFormData({...formData, foundation_year: e.target.value})} className="h-10 border-2 border-black" /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">पूर्ण पत्ता</Label><Input value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 border-2 border-black" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-primary/20 pb-1">
                    <h3 className="text-[11px] font-black uppercase text-primary flex items-center gap-1.5"><Building2 className="h-4 w-4"/> अंतर्गत मोठे गोठे (INTERNAL GOTHAS)</h3>
                    <Button size="sm" onClick={() => addRow('internal_gothas', { name: "", owner: "", location: "", animals: "0", milk: "0", note: "" })} className="h-8 text-[10px] font-black bg-primary text-white rounded-xl shadow-lg shadow-primary/20">+ गोठा जोडा</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formData.internal_gothas.length > 0 ? formData.internal_gothas.map((gotha: any, idx: number) => (
                      <Card key={gotha.id} className="border-2 border-primary/10 overflow-hidden rounded-2xl shadow-md bg-white">
                        <div className="p-2 bg-primary/5 flex justify-between items-center border-b-2 border-primary/10">
                          <Badge className="bg-primary font-black h-5 uppercase">G-{idx + 1} अंतर्गत गोठा</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removeRow('internal_gothas', gotha.id)} className="h-7 w-7 text-rose-500"><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase">गोठा नाव</Label><Input value={gotha.name} onChange={e => updateRow('internal_gothas', gotha.id, { name: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase">मालक नाव</Label><Input value={gotha.owner} onChange={e => updateRow('internal_gothas', gotha.id, { owner: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase">लोकेशन</Label><Input value={gotha.location} onChange={e => updateRow('internal_gothas', gotha.id, { location: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase">जनावरे संख्या</Label><Input type="number" value={gotha.animals} onChange={e => updateRow('internal_gothas', gotha.id, { animals: e.target.value })} className="h-8 text-center text-[11px] border-black font-black" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-blue-600">दूध उत्पादन (L)</Label><Input type="number" value={gotha.milk} onChange={e => updateRow('internal_gothas', gotha.id, { milk: e.target.value })} className="h-8 text-center text-[11px] border-blue-600 font-black" /></div>
                           <div className="space-y-1"><Label className="text-[9px] font-black uppercase opacity-60">शेरा</Label><Input value={gotha.note} onChange={e => updateRow('internal_gothas', gotha.id, { note: e.target.value })} className="h-8 text-[11px] border-black" /></div>
                        </div>
                      </Card>
                    )) : (
                      <div className="col-span-2 p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl opacity-40"><p className="text-[10px] font-black uppercase tracking-widest">अजून कोणताही अंतर्गत गोठा जोडलेला नाही</p></div>
                    )}
                  </div>
                </div>

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

                <DynamicTable title="५) २+ वर्ष जुने उत्पादक" data={formData.longTermProducers} columns={[{ key: 'name', label: 'नाव' }, { key: 'old_milk', label: 'जुने दूध', type: 'number' }, { key: 'curr_milk', label: 'सध्याचे', type: 'number' }, { key: 'old_animals', label: 'जुनी जनावरे', type: 'number' }, { key: 'new_animals', label: 'नवी', type: 'number' }]} onAdd={() => addRow('longTermProducers', { name: "", old_milk: "0", curr_milk: "0", old_animals: "0", new_animals: "0" })} onRemove={(id: string) => removeRow('longTermProducers', id)} onUpdate={(id: string, u: any) => updateRow('longTermProducers', id, u)} />
                <DynamicTable title="६) दूध घटलेले उत्पादक" data={formData.decreasingProducers} columns={[{ key: 'name', label: 'नाव' }, { key: 'old_milk', label: 'जुने दूध', type: 'number' }, { key: 'new_milk', label: 'नवे दूध', type: 'number' }, { key: 'reason', label: 'कारण' }]} onAdd={() => addRow('decreasingProducers', { name: "", old_milk: "0", new_milk: "0", reason: "" })} onRemove={(id: string) => removeRow('decreasingProducers', id)} onUpdate={(id: string, u: any) => updateRow('decreasingProducers', id, u)} color="text-rose-600" />
                <DynamicTable title="७) डेअरी कर्मचारी माहिती" data={formData.dairy_employees} columns={[{ key: 'name', label: 'नाव' }, { key: 'farm', label: 'शेती' }, { key: 'cow', label: 'गाई', type: 'number' }, { key: 'buf', label: 'म्हशी', type: 'number' }, { key: 'milk', label: 'दूध(L)', type: 'number' }, { key: 'supply', label: 'पुरवठा कोठे' }]} onAdd={() => addRow('dairy_employees', { name: "", farm: "", cow: "0", buf: "0", milk: "0", supply: "" })} onRemove={(id: string) => removeRow('dairy_employees', id)} onUpdate={(id: string, u: any) => updateRow('dairy_employees', id, u)} />
                <DynamicTable title="८) स्थानिक गवळी माहिती" data={formData.local_gavali} columns={[{ key: 'name', label: 'नाव' }, { key: 'code', label: 'कोड' }, { key: 'cow', label: 'गाय', type: 'number' }, { key: 'buf', label: 'म्हेस', type: 'number' }, { key: 'qty', label: 'उत्पादक', type: 'number' }]} onAdd={() => addRow('local_gavali', { name: "", code: "", cow: "0", buf: "0", qty: "0" })} onRemove={(id: string) => removeRow('local_gavali', id)} onUpdate={(id: string, u: any) => updateRow('local_gavali', id, u)} />
                <DynamicTable title="९) LSS & डेअरी सुविधा माहिती" data={formData.lss_details} columns={[{ key: 'name', label: 'सुविधा नाव' }, { key: 'status', label: 'स्थिती' }, { key: 'remark', label: 'शेरा' }]} onAdd={() => addRow('lss_details', { name: "", status: "", remark: "" })} onRemove={(id: string) => removeRow('lss_details', id)} onUpdate={(id: string, u: any) => updateRow('lss_details', id, u)} />
                <DynamicTable title="१०) स्पर्धक डेअरी माहिती" data={formData.competitor_facilities} columns={[{ key: 'name', label: 'डेअरी नाव' }, { key: 'c_rate', label: 'गाय दूध' }, { key: 'b_rate', label: 'म्हेस दूध' }, { key: 'rate', label: 'दर (₹)', type: 'number' }, { key: 'fac', label: 'सुविधा' }]} onAdd={() => addRow('competitor_facilities', { name: "", c_rate: "", b_rate: "", rate: "0", fac: "" })} onRemove={(id: string) => removeRow('competitor_facilities', id)} onUpdate={(id: string, u: any) => updateRow('competitor_facilities', id, u)} color="text-amber-600" />
                <DynamicTable title="११) अंतर्गत उप-रूट माहिती" data={formData.sub_routes} columns={[{ key: 'veh', label: 'गाडी' }, { key: 'km', label: 'किमी', type: 'number' }, { key: 'area', label: 'परिसर' }, { key: 'qty', label: 'उत्पादक', type: 'number' }, { key: 'milk', label: 'दूध(L)', type: 'number' }]} onAdd={() => addRow('sub_routes', { veh: "", km: "0", area: "", qty: "0", milk: "0" })} onRemove={(id: string) => removeRow('sub_routes', id)} onUpdate={(id: string, u: any) => updateRow('sub_routes', id, u)} />

                <div className="space-y-4">
                  <SectionTitle icon={TrendingDown} title="१२) विशेष विश्लेषण & उपाययोजना" color="text-rose-700" />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-rose-600">दूध कमी होण्याची कारणे</Label><Textarea value={formData.milk_decrease_reasons || ""} onChange={e => setFormData({...formData, milk_decrease_reasons: e.target.value})} className="h-20 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-emerald-600">सेंटरने केलेले प्रयत्न</Label><Textarea value={formData.efforts_taken || ""} onChange={e => setFormData({...formData, efforts_taken: e.target.value})} className="h-20 border-2 border-black" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-blue-600">दूध वाढवण्यासाठी उपाय</Label><Textarea value={formData.required_actions || ""} onChange={e => setFormData({...formData, required_actions: e.target.value})} className="h-20 border-2 border-black" /></div>
                  </div>
                </div>

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
                     <div className="flex flex-col items-center gap-1 p-2 bg-slate-100 rounded-2xl border-2 border-black"><Label className="text-[8px] font-black uppercase opacity-50">ICE (बर्फ)</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-8 border-none text-center bg-transparent font-black" /></div>
                     <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">भेसळ तपासणी कीट माहिती</Label><Input value={formData.adulterationKitInfo || ""} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-10 border-2 border-black" /></div>
                  </div>
                  <DynamicTable title="साहित्याची यादी (ASSETS)" data={formData.equipment} columns={[{ key: 'name', label: 'साहित्य नाव' }, { key: 'quantity', label: 'प्रमाण', type: 'number' }, { key: 'status', label: 'स्थिती' }]} onAdd={() => addRow('equipment', { name: "", quantity: "1", status: "OK" })} onRemove={(id: string) => removeRow('equipment', id)} onUpdate={(id: string, u: any) => updateRow('equipment', id, u)} />
                </div>

                <div className="space-y-2">
                  <SectionTitle icon={Info} title="विशेष शेरा (REMARK)" color="text-slate-500" />
                  <Textarea value={formData.additionalInfo || ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-24 border-2 border-black p-4" />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 flex flex-row gap-3 no-print">
            <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); resetFormData(); }} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] border-2 border-black bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-12 rounded-2xl shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest bg-primary text-white flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> माहिती जतन करा (SAVE)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersListPage /></Suspense>
}
