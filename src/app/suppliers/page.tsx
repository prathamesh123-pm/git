
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

  const [formData, setFormData] = useState<Partial<Supplier>>({
    supplierId: "", name: "", address: "", mobile: "", routeId: "none", 
    supplierType: "Center", competition: "", additionalInfo: "",
    iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "None", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: 0, 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    cowMilk: { quantity: 0, fat: 0, snf: 0 },
    buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
    equipment: [],
    operatorName: "",
    spaceOwnership: "Self",
    hygieneGrade: "A",
    chemicalsStock: "",
    batteryCondition: ""
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
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      equipment: [],
      operatorName: "",
      spaceOwnership: "Self",
      hygieneGrade: "A",
      chemicalsStock: "",
      batteryCondition: ""
    })
  }, [])

  const handleSave = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const data = {
      ...formData,
      routeId: formData.routeId === "none" ? "" : formData.routeId,
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
    setFormData({ ...supp })
    setIsEditing(true)
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
        <div className="text-left">
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
            <Input placeholder="नाव किंवा कोड शोधा..." className="pl-8 h-8 rounded-lg bg-muted/10 border-none font-bold text-[11px] shadow-inner w-full" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 rounded-lg bg-muted/10 border-none font-black text-[9px] uppercase">
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
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2" onClick={() => prepareEdit(selectedSupplier)}><Edit className="h-3 w-3 mr-1" /> बदला</Button>
                  <Button variant="outline" size="sm" className="h-7 rounded-lg font-black uppercase text-[9px] px-2 text-destructive border-destructive/20" onClick={() => deleteSupplierRecord(selectedSupplier.id)}><Trash2 className="h-3.5 w-3.5 mr-1" /> हटवा</Button>
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
              </div>

              <div className="w-full py-10 text-center opacity-30 italic text-[10px] font-black uppercase">सविस्तर माहिती भरण्यासाठी 'बदला' बटण दाबा.</div>
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSupplierRecord(supp.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                      <SelectTrigger className="h-8 text-[11px] border-[1.5px] border-black rounded-md font-black"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali" className="font-bold">गवळी</SelectItem><SelectItem value="Gotha" className="font-bold">गोठा</SelectItem><SelectItem value="Center" className="font-bold">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">नाव *</Label><Input value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                    <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId || ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-8 border-[1.5px] border-black font-bold text-xs" /></div>
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/10 shrink-0 flex flex-row gap-2 no-print z-[100] sticky bottom-0">
            <Button variant="outline" onClick={() => { setIsAdding(false); setIsEditing(false); resetFormData(); }} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] border-2 border-black tracking-widest bg-white">रद्द</Button>
            <Button onClick={handleSave} className="flex-[2] h-10 rounded-xl shadow-xl shadow-primary/20 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-primary text-white"><CheckCircle2 className="h-4 w-4 mr-1.5" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
