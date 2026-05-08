"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  MapPin, Calendar, AlertCircle, CheckCircle2, Info, Lightbulb, FileCheck, Milk, User, TrendingDown, Building2, Activity, Users2, Filter, Layers, ListPlus, ShieldAlert, IndianRupee, Microscope, ClipboardCheck, ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, query, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ReportHeader = ({ title, date, subName, subId, shift }: any) => (
  <div className="w-full border-b-[3px] border-black pb-4 mb-6 text-center">
    <h1 className="text-[16pt] sm:text-[22pt] font-black uppercase tracking-tight text-slate-900 leading-tight">{title || "अधिकृत अहवाल"}</h1>
    <div className="flex flex-col sm:flex-row justify-between items-center text-[8pt] sm:text-[10pt] font-black uppercase text-slate-700 tracking-wider mt-4 border-t border-black/10 pt-3 gap-2">
      <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-left">
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5" /> सादरकर्ता: {subName || "सुपरवायझर"}</span>
          {subId && <span className="text-[7pt] opacity-70 ml-5">आयडी: {subId}</span>}
        </div>
        {shift && <Badge variant="outline" className="h-5 text-[8px] border-black/20 font-black">{shift}</Badge>}
      </div>
      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> दिनांक: {date}</span>
    </div>
  </div>
)

const SectionTitle = ({ icon: Icon, title, color = "text-primary" }: any) => (
  <div className="flex items-center gap-1 border-b border-black/10 pb-0.5 mb-1.5 mt-4">
    {Icon && <Icon className={cn("h-3 w-3", color)} />}
    <h3 className={cn("text-[9px] font-black uppercase tracking-widest", color)}>{title}</h3>
  </div>
)

const ProfessionalParagraph = ({ label, content, icon: Icon }: { label: string, content: string, icon?: any }) => {
  if (!content) return null;
  return (
    <div className="mb-6 text-left w-full break-inside-avoid">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <span className="text-[8pt] sm:text-[9pt] font-black uppercase text-primary tracking-widest">{label}</span>
      </div>
      <div className="p-3 sm:p-4 bg-slate-50 border-l-4 border-primary rounded-r-lg shadow-sm print:shadow-none print:border-slate-300">
        <p className="text-[9pt] sm:text-[11pt] font-medium leading-relaxed text-slate-800 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

const TableRenderer = ({ title, data, columns, color = "text-primary" }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="mb-8 w-full break-inside-avoid">
      <div className="flex items-center gap-2 mb-2">
        <h4 className={cn("text-[9pt] font-black uppercase tracking-widest", color)}>{title}</h4>
      </div>
      <div className="border border-black overflow-hidden rounded-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-black">
              {columns.map((col: any) => (
                <th key={col.key} className={cn("p-2 text-[8pt] font-black border-r border-black last:border-0 uppercase text-center", col.className)}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-black last:border-0">
                {columns.map((col: any) => (
                  <td key={col.key} className={cn("p-2 text-[9pt] font-medium border-r border-black last:border-0", col.cellClassName)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ProducerCenterLayout = ({ report, profileName, profileId }: any) => {
  const d = report.fullData || {};
  const details = d.producer_center?.additional_details || d;

  return (
    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
      <ReportHeader title={d.reportHeading || "उत्पादक सेंटर सविस्तर अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />

      <SectionTitle icon={Info} title="१) प्राथमिक माहिती & संकलन वेळ" />
      <div className="w-full border-2 border-black mb-6 overflow-hidden">
        <table className="w-full text-[9pt]">
          <tbody>
            <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black border-r border-black w-1/3">सेंटर नाव</td><td className="p-2 font-bold">{d.name} (ID: {d.supplierId})</td></tr>
            <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black border-r border-black">सकाळ / सायंकाळ वेळ</td><td className="p-2 font-bold">{details.morning_collection_time || "-"} / {details.evening_collection_time || "-"}</td></tr>
            <tr className="border-b border-black"><td className="p-2 bg-slate-50 font-black border-r border-black">उत्पादक (एकूण/सक्रिय)</td><td className="p-2 font-bold">{details.total_producers || 0} / {details.active_producers || 0}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">जनावरे (गाय/म्हेस/वासरे)</td><td className="p-2 font-bold">{details.cows || 0} गायी | {details.buffalo || 0} म्हशी | {details.calves || 0} वासरे</td></tr>
          </tbody>
        </table>
      </div>

      <SectionTitle icon={Layers} title="२) २+ वर्ष जुने उत्पादक" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-slate-100">
            <tr className="font-black border-b border-black text-center">
              <th className="p-1 border-r border-black">नाव</th>
              <th className="p-1 border-r border-black">जुने दूध</th>
              <th className="p-1 border-r border-black">सध्याचे दूध</th>
              <th className="p-1 border-r border-black">जुनी जनावरे</th>
              <th className="p-1">सध्याची जनावरे</th>
            </tr>
          </thead>
          <tbody>
            {(details.long_term_producers || details.longTermProducers || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-black text-center font-bold">
                <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                <td className="border-r border-black">{p.previous_milk}L</td>
                <td className="border-r border-black">{p.current_milk}L</td>
                <td className="border-r border-black">{p.previous_animals}</td>
                <td>{p.current_animals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle icon={TrendingDown} title="३) दूध घटलेले उत्पादक विश्लेषण" color="text-rose-700" />
      <div className="w-full overflow-x-auto mb-6">
        <table className="w-full border-2 border-black text-[8pt]">
          <thead className="bg-rose-50 text-rose-900 font-black">
            <tr className="border-b border-black text-center">
              <th className="p-1 border-r border-black">नाव</th>
              <th className="p-1 border-r border-black">जुने</th>
              <th className="p-1 border-r border-black">नवे</th>
              <th className="p-1">कारण</th>
            </tr>
          </thead>
          <tbody>
            {(details.decreasing_producers || details.decreasingProducers || []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-black text-center font-bold text-rose-800">
                <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                <td className="border-r border-black">{p.previous_milk}</td>
                <td className="border-r border-black">{p.current_milk}</td>
                <td className="text-left pl-2">{p.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
      </div>
    </div>
  );
};

export function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'users', user.uid, 'dailyWorkReports'), orderBy('createdAt', 'desc'))
  }, [db, user])

  const { data: reports, isLoading } = useCollection(reportsQuery)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])
  
  const { data: profile } = useDoc(profileRef)

  useEffect(() => setMounted(true), [])

  const deleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे? हा अहवाल कायमचा हटवण्यात येईल.")) {
      deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'dailyWorkReports', id))
      if (selectedReport?.id === id) setSelectedReport(null)
      toast({ title: "यशस्वी", description: "अहवाल हटवण्यात आला." })
    }
  }

  const editReport = (report: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const routesMap: Record<string, string> = {
      'Route Visit': '/daily-report',
      'Daily Office Work': '/daily-report',
      'Field Visit': '/daily-report',
      'Transport Breakdown Report': '/reports/entry/breakdown',
      'Daily Work Report': '/reports/entry/daily',
      'FSSAI Center Inspection': '/reports/entry/fssai',
      'Milk Procurement Survey': '/reports/entry/survey',
      'Collection Center Audit': '/reports/entry/audit',
      'Chilling Report': '/reports/entry/chilling',
      'Seizure & Penalty': '/reports/entry/seizure',
      'Official Document': '/form-builder',
      'Route Allocation Report': '/reports/entry/route-allocation',
      'Custom Form': `/forms/${report.formId}`
    }
    const path = routesMap[report.type]
    if (path) router.push(`${path}?edit=${report.id}`)
    else toast({ title: "माहिती", description: "बदल सुविधा उपलब्ध नाही." })
  }

  const reportTypes = useMemo(() => {
    if (!reports) return []
    const types = Array.from(new Set(reports.map(r => r.type))).filter(Boolean)
    return types.sort()
  }, [reports])

  const filteredReports = useMemo(() => {
    const list = reports || []
    return list.filter(r => {
      const matchesSearch = 
        r.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.date?.includes(searchQuery) ||
        r.fullData?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      
      return matchesSearch && matchesType;
    })
  }, [reports, searchQuery, typeFilter])

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  const labelMap: Record<string, string> = {
    vehicleNo: "गाडी नंबर",
    driverName: "ड्रायव्हर नाव",
    routeName: "रूट नाव",
    breakdownTime: "बिघाड वेळ",
    location: "ठिकाण",
    reason: "कारण",
    severity: "स्वरूप",
    estimatedRepairCost: "अंदाजे खर्च",
    centerName: "केंद्र नाव",
    fineAmount: "दंड रक्कम",
    tempAfterChilling: "चिलिंग तापमान",
    licenseStatus: "परवाना स्थिती"
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive & Print Reports</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-[10px] border border-primary/10 uppercase">
          <FileFileText className="h-4 w-4" /> एकूण अहवाल: {reports?.length || 0}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input 
                placeholder="नाव किंवा तारीख शोधा..." 
                className="w-full pl-10 h-12 bg-white border-2 border-black rounded-xl font-black uppercase text-[11px] outline-none shadow-sm focus:ring-1" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full h-11 rounded-xl bg-white border-2 border-black font-black uppercase text-[10px] shadow-sm">
                <Filter className="h-3.5 w-3.5 mr-2 opacity-50" />
                <SelectValue placeholder="अहवाल प्रकार" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-black text-[10px] uppercase">सर्व अहवाल (ALL)</SelectItem>
                {reportTypes.map(t => (
                  <SelectItem key={t} value={t} className="font-black text-[10px] uppercase">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] pr-2">
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <Card key={report.id} className={cn("border-2 shadow-none hover:shadow-md transition-all rounded-xl overflow-hidden cursor-pointer group", selectedReport?.id === report.id ? "bg-primary/5 border-primary" : "bg-white border-black")} onClick={() => setSelectedReport(report)}>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[7px] h-4 font-black uppercase border-primary/20 text-primary">{report.type}</Badge>
                      <span className="text-[8px] font-black text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {report.date}</span>
                    </div>
                    <h4 className="font-black text-[11px] uppercase truncate text-slate-900 leading-tight">{report.summary || "No Title"}</h4>
                    <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={(e) => editReport(report, e)}><FileEdit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => deleteReport(report.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Card className="lg:col-span-8 border-2 border-black shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[700px] flex flex-col items-center">
          {selectedReport ? (
            <div className="w-full">
               <div className="p-4 border-b bg-muted/5 flex justify-between items-center no-print sticky top-0 z-10 backdrop-blur-md">
                 <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedReport.type}</Badge>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px] border-2 border-black" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                   <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
                 </div>
               </div>
               
               <ScrollArea className="w-full">
                  {selectedReport.type === 'Milk Procurement Survey' || selectedReport.fullData?.supplierType === 'Center' ? (
                     <ProducerCenterLayout report={selectedReport} profileName={profile?.displayName} profileId={profile?.employeeId} />
                  ) : (
                    <div className="bg-white p-8 printable-report flex flex-col items-center">
                      <ReportHeader 
                        title={selectedReport.fullData?.reportHeading || selectedReport.summary} 
                        date={selectedReport.date} 
                        subName={selectedReport.fullData?.name || profile?.displayName || "सुपरवायझर"} 
                        subId={selectedReport.fullData?.idNumber || selectedReport.fullData?.repId || profile?.employeeId} 
                        shift={selectedReport.fullData?.shift} 
                      />
                      
                      <div className="w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                          {Object.entries(selectedReport.fullData || {}).map(([key, val]) => {
                            if (typeof val === 'object' || key === 'reportHeading' || key === 'name' || key === 'idNumber' || key === 'repId' || !val) return null;
                            return (
                              <div key={key} className="flex justify-between items-center border-b border-dashed border-black/20 pb-1.5 break-inside-avoid">
                                <span className="text-[8pt] sm:text-[9pt] font-black uppercase text-muted-foreground tracking-widest">{labelMap[key] || key.toUpperCase()}</span>
                                <span className="text-[9pt] sm:text-[11pt] font-bold text-right ml-4 uppercase">{String(val)}</span>
                              </div>
                            )
                          })}
                        </div>

                        {selectedReport.type === 'Route Allocation Report' && (
                          <div className="space-y-6 pt-4">
                            {[
                              { k: 'morningRoutes', l: 'Can Route Morning (Internal)', c: 'text-blue-600' },
                              { k: 'eveningRoutes', l: 'Can Route Evening (Internal)', c: 'text-indigo-600' },
                              { k: 'tankerRoutes', l: 'Internal Tanker Route', c: 'text-rose-600' },
                              { k: 'extCanRoutes', l: 'External Can Route', c: 'text-emerald-600' },
                              { k: 'extTankerRoutes', l: 'External Tanker Route', c: 'text-amber-600' }
                            ].map(section => (
                              <TableRenderer 
                                key={section.k} 
                                title={section.l} 
                                color={section.c}
                                data={selectedReport.fullData?.[section.k]} 
                                columns={[
                                  { key: 'routeId', label: 'ID', className: 'w-16' },
                                  { key: 'routeCode', label: 'Code', className: 'w-20' },
                                  { key: 'routeName', label: 'Route Name', className: 'text-left' },
                                  { key: 'requested', label: 'Req', render: (v: boolean) => v ? 'YES' : 'NO', className: 'w-16' },
                                  { key: 'allocated', label: 'Alloc', render: (v: boolean) => v ? 'YES' : 'NO', className: 'w-16' }
                                ]}
                              />
                            ))}
                          </div>
                        )}

                        {selectedReport.type === 'Transport Breakdown Report' && (
                          <TableRenderer 
                            title="नुकसान तपशील (LOSS LOG)"
                            color="text-rose-600"
                            data={selectedReport.fullData?.centerLosses}
                            columns={[
                              { key: 'centerCode', label: 'ID', className: 'w-16' },
                              { key: 'centerName', label: 'नाव', className: 'text-left' },
                              { key: 'milkType', label: 'प्रकार', className: 'w-16' },
                              { key: 'qtyLiters', label: 'Ltr', className: 'w-20 text-center' },
                              { key: 'lossAmount', label: 'रक्कम (₹)', className: 'w-24 text-right', cellClassName: 'font-black text-rose-600' }
                            ]}
                          />
                        )}

                        <div className="pt-4">
                          <ProfessionalParagraph icon={AlertCircle} label="महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे" content={selectedReport.fullData?.dailyProblems || selectedReport.fullData?.problems} />
                          <ProfessionalParagraph icon={CheckCircle2} label="केलेली कार्यवाही" content={selectedReport.fullData?.actionTaken || selectedReport.fullData?.actionsTaken || selectedReport.fullData?.efforts_taken} />
                        </div>
                      </div>

                      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest border-t-2 border-black">
                        <div className="pt-3">अधिकारी स्वाक्षरी</div>
                        <div className="pt-3">दिनांक व शिक्का</div>
                      </div>
                    </div>
                  )}
                  <ScrollBar orientation="horizontal" />
               </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-10 p-20 text-center uppercase">
              <Archive className="h-16 w-16 mb-4" />
              <h4 className="font-black tracking-[0.3em] text-sm">अहवाल निवडा</h4>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>}>
      <ReportsPage />
    </Suspense>
  )
}
