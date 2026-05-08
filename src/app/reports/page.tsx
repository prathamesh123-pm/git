
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  MapPin, Calendar, AlertCircle, CheckCircle2, Info, Lightbulb, FileCheck, Milk, User, TrendingDown, Building2, Activity, Users2, Filter, Layers, ListPlus, ShieldAlert, IndianRupee
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const labelMap: Record<string, string> = {
  reportHeading: "अहवाल शीर्षक",
  date: "तारीख",
  reportDate: "तारीख",
  shift: "शिफ्ट",
  idNumber: "अधिकारी ID",
  repId: "कर्मचारी ID",
  centerName: "केंद्राचे नाव",
  centerCode: "केंद्र कोड",
  supplierName: "पुरवठादार नाव",
  supplierId: "पुरवठादार ID",
  mobile: "मोबाईल",
  address: "पत्ता",
  routeName: "रूट नाव",
  vehicleNo: "गाडी नंबर",
  vehicleNumber: "वाहन क्र.",
  driverName: "ड्रायव्हर",
  breakdownTime: "बिघाड वेळ",
  location: "ठिकाण",
  reason: "कारण",
  severity: "स्वरूप",
  detailedReason: "सविस्तर वर्णन",
  estimatedRepairCost: "अंदाजे खर्च (₹)",
  morningQty: "सकाळ दूध (L)",
  eveningQty: "संध्याकाळ दूध (L)",
  fat: "फॅट (%)",
  snf: "SNF (%)",
  result: "निकाल",
  totalLossAmount: "एकूण आर्थिक नुकसान (₹)",
  dailyProblems: "प्रॉब्लेम्स / निरीक्षणे",
  slipNo: "SLIP No.",
  visitPerson: "भेट दिलेली व्यक्ती",
  visitPurpose: "भेटीचा उद्देश",
  officeTaskSubject: "कामाचा विषय",
  fineAmount: "दंडाची रक्कम (₹)",
  seizureQty: "जप्त दूध (L)",
  actionTaken: "केलेली कार्यवाही",
  totalMilk: "एकूण दूध (L)",
  paymentCycle: "पेमेंट सायकल",
  otherInfo: "इतर माहिती",
  estimatedRepairTime: "दुरुस्ती वेळ",
  recoveryVehicleNo: "पर्यायी गाडी",
  recoveryArrivalTime: "पर्यायी गाडी वेळ",
  milkHot: "दूध गरम झाले का",
  milkSour: "दूध खराब झाले का",
  title: "कामाचे नाव",
  description: "कामाचा तपशील",
  remark: "पूर्ण केलेल्या कामाचा शेरा"
};

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

export default function ReportsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'dailyWorkReports')
  }, [db, user])

  const { data: reports, isLoading } = useCollection(reportsQuery)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

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
        r.date?.includes(searchQuery);
      
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      
      return matchesSearch && matchesType;
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reports, searchQuery, typeFilter])

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Archive & Print Reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <input 
                placeholder="नाव किंवा तारीख शोधा..." 
                className="w-full pl-10 h-11 bg-white border-2 border-black rounded-xl font-black uppercase text-[11px] outline-none shadow-sm focus:ring-1" 
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
                <Card key={report.id} className={cn("border shadow-none hover:shadow-md transition-all rounded-xl overflow-hidden cursor-pointer group border-l-4", selectedReport?.id === report.id ? "bg-primary/5 border-primary border-l-primary" : "bg-white border-muted-foreground/5 border-l-slate-300")} onClick={() => { setSelectedReport(report); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[7px] h-4 font-black uppercase border-primary/20 text-primary">{report.type}</Badge>
                      <span className="text-[8px] font-black text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {report.date}</span>
                    </div>
                    <h4 className="font-black text-[11px] uppercase truncate text-slate-900 leading-tight">{report.summary || "No Title"}</h4>
                    <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={(e) => editReport(report, e)}><FileEdit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={(e) => deleteReport(report.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[700px] flex flex-col items-center border-muted-foreground/10">
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
                  <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-12 printable-report flex flex-col items-center min-h-screen">
                    <ReportHeader 
                      title={selectedReport.fullData?.reportHeading || selectedReport.summary} 
                      date={selectedReport.date} 
                      subName={selectedReport.fullData?.name || "सुपरवायझर"} 
                      subId={selectedReport.fullData?.idNumber || selectedReport.fullData?.repId} 
                      shift={selectedReport.fullData?.shift} 
                    />
                    
                    <div className="w-full space-y-6">
                      {/* Grid Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        {Object.entries(selectedReport.fullData || {}).map(([key, val]) => {
                          if (typeof val === 'object' || key === 'reportHeading' || key === 'name' || key === 'idNumber' || key === 'repId' || !val) return null;
                          return (
                            <div key={key} className="flex justify-between items-center border-b border-dashed border-black/20 pb-1.5 break-inside-avoid">
                              <span className="text-[8pt] sm:text-[9pt] font-black uppercase text-muted-foreground tracking-widest">{labelMap[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                              <span className="text-[9pt] sm:text-[11pt] font-bold text-right ml-4 uppercase">{String(val)}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Special Case: Route Allocation Tables */}
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

                      {/* Special Case: Breakdown Loss Log */}
                      {selectedReport.type === 'Transport Breakdown Report' && (
                        <TableRenderer 
                          title="नुकसान तपशील (LOSS LOG)"
                          color="text-rose-600"
                          data={selectedReport.fullData?.centerLosses}
                          columns={[
                            { key: 'centerCode', label: 'ID', className: 'w-16' },
                            { key: 'centerName', label: 'गवळी / केंद्र नाव', className: 'text-left' },
                            { key: 'milkType', label: 'प्रकार', className: 'w-16' },
                            { key: 'qtyLiters', label: 'Ltr', className: 'w-20 text-center' },
                            { key: 'lossAmount', label: 'रक्कम (₹)', className: 'w-24 text-right', cellClassName: 'font-black text-rose-600' }
                          ]}
                        />
                      )}

                      {/* Special Case: Custom Form Fields */}
                      {selectedReport.type === 'Custom Form' && (
                        <div className="space-y-4 pt-4">
                          <h4 className="text-[10pt] font-black uppercase border-b-2 border-black pb-1">फॉर्म मधील सविस्तर माहिती</h4>
                          <div className="space-y-3">
                            {selectedReport.fullData?.dynamicFields?.map((f: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-1 border-l-4 border-slate-200 pl-3">
                                <span className="text-[8pt] font-black text-muted-foreground uppercase">{f.label}</span>
                                <span className="text-[10pt] font-medium text-slate-900">{f.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Paragraph Data */}
                      <div className="pt-4">
                        <ProfessionalParagraph icon={AlertCircle} label="महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे" content={selectedReport.fullData?.dailyProblems || selectedReport.fullData?.problems} />
                        <ProfessionalParagraph icon={CheckCircle2} label="केलेली कार्यवाही (Action Taken)" content={selectedReport.fullData?.actionTaken || selectedReport.fullData?.actionsTaken || selectedReport.fullData?.efforts_taken} />
                        <ProfessionalParagraph icon={Info} label="इतर सविस्तर माहिती / शेरा" content={selectedReport.fullData?.otherInfo || selectedReport.fullData?.additionalNotes || selectedReport.fullData?.summary || selectedReport.fullData?.description} />
                      </div>
                    </div>

                    {/* Footer / Signature */}
                    <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest border-t-2 border-black">
                      <div className="pt-3 flex flex-col items-center">
                        <div className="h-16 w-32 border-b border-dashed border-black/20 mb-2"></div>
                        <span>अधिकारी स्वाक्षरी</span>
                        <span className="text-[7pt] opacity-50">(Authorized Sign)</span>
                      </div>
                      <div className="pt-3 flex flex-col items-center">
                        <div className="h-16 w-32 border-b border-dashed border-black/20 mb-2"></div>
                        <span>दिनांक व शिक्का</span>
                        <span className="text-[7pt] opacity-50">(Stamp & Date)</span>
                      </div>
                    </div>
                  </div>
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
