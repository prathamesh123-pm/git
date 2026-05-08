
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  MapPin, Calendar, AlertCircle, CheckCircle2, Info, Lightbulb, FileCheck, Milk, User, TrendingDown, Building2, Activity, Users2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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

const SectionTitle = ({ icon: Icon, title, color = "text-slate-900" }: any) => (
  <div className="w-full flex items-center gap-2 border-b-2 border-black pb-1 mb-4 mt-6 break-after-avoid section-title">
    {Icon && <Icon className={cn("h-4 w-4", color)} />}
    <h3 className={cn("text-[9pt] sm:text-[11pt] font-black uppercase tracking-widest", color)}>{title}</h3>
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
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => setMounted(true), [])

  const deleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे?")) {
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

  const filteredReports = useMemo(() => {
    const list = reports || []
    return list.filter(r => 
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date?.includes(searchQuery)
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reports, searchQuery])

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50 animate-pulse">लोड होत आहे...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 px-2 animate-in fade-in duration-500 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 no-print">
        <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
          <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <input placeholder="शोधा..." className="w-full pl-10 h-11 bg-white border border-muted-foreground/10 rounded-2xl font-black uppercase text-[11px] outline-none shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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

        <Card className="lg:col-span-8 border shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[700px] flex flex-col items-center">
          {selectedReport ? (
            <div className="w-full">
               <div className="p-4 border-b bg-muted/5 flex justify-between items-center no-print sticky top-0 z-10 backdrop-blur-md">
                 <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black">{selectedReport.type}</Badge>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 rounded-xl font-black uppercase text-[10px]" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" /> प्रिंट</Button>
                   <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-xl"><X className="h-5 w-5" /></Button>
                 </div>
               </div>
               
               <ScrollArea className="w-full">
                  <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
                    <ReportHeader title={selectedReport.fullData?.reportHeading || selectedReport.summary} date={selectedReport.date} subName={selectedReport.fullData?.name || "सुपरवायझर"} subId={selectedReport.fullData?.idNumber || selectedReport.fullData?.repId} shift={selectedReport.fullData?.shift} />
                    
                    <div className="w-full space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
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

                      <ProfessionalParagraph icon={AlertCircle} label="महत्त्वाचे प्रॉब्लेम्स" content={selectedReport.fullData?.dailyProblems || selectedReport.fullData?.problems} />
                      <ProfessionalParagraph icon={CheckCircle2} label="कार्यवाही" content={selectedReport.fullData?.actionTaken || selectedReport.fullData?.actionsTaken} />
                      <ProfessionalParagraph icon={Info} label="इतर माहिती" content={selectedReport.fullData?.otherInfo || selectedReport.fullData?.additionalNotes} />
                    </div>

                    <div className="w-full mt-auto pt-20 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
                      <div className="border-t-2 border-black pt-3">स्वाक्षरी</div>
                      <div className="border-t-2 border-black pt-3">दिनांक</div>
                    </div>
                  </div>
                  <ScrollBar orientation="horizontal" />
               </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center uppercase">
              <Archive className="h-16 w-16 mb-4" />
              <h4 className="font-black tracking-[0.3em] text-sm">अहवाल निवडा</h4>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
