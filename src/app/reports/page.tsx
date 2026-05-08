"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Archive, Search, X, Printer, Trash2, FileEdit, Truck, 
  ShieldAlert, ClipboardCheck, Plus, MapPin, FileText,
  Briefcase, FileSignature, CheckCircle2, Microscope, Layers, Calendar, ChevronRight, AlertCircle, AlertTriangle, Info, BookOpen, Lightbulb, FileCheck, Clock, Milk, User, IndianRupee, Hash, Box, TrendingDown, Building2, Activity, Users2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import Link from "next/link"
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
          <span className="flex items-center gap-1.5"><FileCheck className="h-3.5 w-3.5" /> सादरकर्ता: {subName}</span>
          {subId && <span className="text-[7pt] opacity-70 ml-5">अधिकृत आयडी: {subId}</span>}
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

const ProducerCenterLayout = ({ report, profileName, profileId }: { report: any, profileName: string, profileId: string }) => {
  const d = report.fullData || {};
  const details = report.fullData?.producer_center?.additional_details || {};

  return (
    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
      <ReportHeader title={d.reportHeading || "सविस्तर अहवाल"} date={report.date} subName={d.name || profileName} subId={d.idNumber || profileId} shift={d.shift} />

      <SectionTitle icon={Info} title="१) प्राथमिक माहिती & संकलन वेळ" />
      <div className="w-full border-2 border-black mb-6">
        <table className="w-full text-[9pt]">
          <tbody>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black w-1/3">नाव</td><td className="p-2 font-bold">{d.name} (ID: {d.supplierId})</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">सकाळ / सायंकाळ वेळ</td><td className="p-2 font-bold">{details.morning_collection_time} / {details.evening_collection_time}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">उत्पादक (एकूण/सक्रिय)</td><td className="p-2 font-bold">{details.total_producers} / {details.active_producers}</td></tr>
            <tr><td className="p-2 bg-slate-50 font-black border-r border-black">जनावरे (गाय/म्हेस/वासरे)</td><td className="p-2 font-bold">{details.cows} गायी | {details.buffalo} म्हशी | {details.calves} वासरे</td></tr>
          </tbody>
        </table>
      </div>

      {details.sub_gavali_info?.length > 0 && (
        <>
          <SectionTitle icon={Users2} title="१.५) सब-गवळी सविस्तर माहिती" color="text-indigo-800" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-indigo-50 font-black text-indigo-900">
              <tr className="border-b border-black text-center">
                <th className="p-1 border-r border-black">नाव/मोबाईल</th>
                <th className="p-1 border-r border-black">एरिया/पद्धत</th>
                <th className="p-1 border-r border-black">उत्पादक/जनावरे</th>
                <th className="p-1">दूध/रूट माहिती</th>
              </tr>
            </thead>
            <tbody>
              {details.sub_gavali_info.map((sub: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 font-bold text-center">
                  <td className="p-1 border-r border-black text-left">{sub.name}<br/><span className="text-[7pt] opacity-60">{sub.mobile}</span></td>
                  <td className="p-1 border-r border-black text-left">{sub.area}<br/><Badge variant="outline" className="h-4 text-[6pt] px-1">{sub.collection_type}</Badge></td>
                  <td className="p-1 border-r border-black">{sub.producers} उत्पादक<br/>{sub.animals} जनावरे</td>
                  <td className="p-1 text-left"><span className="text-blue-600">{sub.cow_qty}L Cow</span><br/><span className="text-[7pt]">{sub.sub_route_info || "-"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.collection_areas?.length > 0 && (
        <>
          <SectionTitle icon={MapPin} title="२) संकलन एरिया & गावे" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black text-center">
                <th className="p-1 border-r border-black text-left">गाव नाव</th>
                <th className="p-1 border-r border-black">उत्पादक</th>
                <th className="p-1">दूध (L)</th>
              </tr>
            </thead>
            <tbody>
              {details.collection_areas.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold">
                  <td className="p-1 border-r border-black text-left pl-2">{p.village}</td>
                  <td className="p-1 border-r border-black">{p.producers}</td>
                  <td className="p-1">{p.milkQty} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.long_term_producers?.length > 0 && (
        <>
          <SectionTitle icon={Layers} title="३) २+ वर्ष जुने उत्पादक" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black uppercase text-center border-b border-black">
              <tr>
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">जुने दूध</th>
                <th className="p-1 border-r border-black">सध्याचे दूध</th>
                <th className="p-1 border-r border-black">जुनी जनावरे</th>
                <th className="p-1">सध्याची जनावरे</th>
              </tr>
            </thead>
            <tbody>
              {details.long_term_producers.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold">
                  <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                  <td className="p-1 border-r border-black">{p.previous_milk} L</td>
                  <td className="p-1 border-r border-black">{p.current_milk} L</td>
                  <td className="p-1 border-r border-black">{p.previous_animals}</td>
                  <td className="p-1">{p.current_animals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.decreasing_producers?.length > 0 && (
        <>
          <SectionTitle icon={TrendingDown} title="४) दूध घटलेले उत्पादक विश्लेषण" color="text-rose-700" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-rose-50 font-black uppercase text-center border-b border-black text-rose-900">
              <tr>
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">जुने दूध</th>
                <th className="p-1 border-r border-black">नवे दूध</th>
                <th className="p-1">कारण</th>
              </tr>
            </thead>
            <tbody>
              {details.decreasing_producers.map((p: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold text-rose-800">
                  <td className="p-1 border-r border-black text-left pl-2">{p.producer_name}</td>
                  <td className="p-1 border-r border-black">{p.previous_milk} L</td>
                  <td className="p-1 border-r border-black">{p.current_milk} L</td>
                  <td className="p-1 text-left pl-2">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.local_employees?.length > 0 && (
        <>
          <SectionTitle icon={Briefcase} title="५) डेअरी कर्मचारी माहिती" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black text-left">नाव</th>
                <th className="p-1 border-r border-black">शेती</th>
                <th className="p-1 border-r border-black">गाई/म्हशी</th>
                <th className="p-1 border-r border-black">दूध (L)</th>
                <th className="p-1">पुरवठा कोठे</th>
              </tr>
            </thead>
            <tbody>
              {details.local_employees.map((e: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 text-center font-bold">
                  <td className="p-1 border-r border-black text-left pl-2">{e.name}</td>
                  <td className="p-1 border-r border-black">{e.land}</td>
                  <td className="p-1 border-r border-black">{e.cows_count} / {e.buffalo_count}</td>
                  <td className="p-1 border-r border-black">{e.total_supply}</td>
                  <td className="p-1">{e.supply_location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.milkman_gavali_details?.length > 0 && (
        <>
          <SectionTitle icon={User} title="६) स्थानिक गवळी माहिती" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black">नाव</th>
                <th className="p-1 border-r border-black">कोड</th>
                <th className="p-1 border-r border-black">गाय दूध</th>
                <th className="p-1 border-r border-black">म्हेस दूध</th>
                <th className="p-1">उत्पादक</th>
              </tr>
            </thead>
            <tbody>
              {details.milkman_gavali_details.map((g: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 font-bold text-center">
                  <td className="p-1 border-r border-black text-left pl-2">{g.name}</td>
                  <td className="p-1 border-r border-black">{g.code}</td>
                  <td className="p-1 border-r border-black">{g.gay_dudh} L</td>
                  <td className="p-1 border-r border-black">{g.mhais_dudh} L</td>
                  <td className="p-1">{g.producers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.competitor_dairies?.length > 0 && (
        <>
          <SectionTitle icon={Building2} title="७) स्पर्धक डेअरी माहिती" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black text-left">डेअरी नाव</th>
                <th className="p-1 border-r border-black">गाय दूध</th>
                <th className="p-1 border-r border-black">म्हेस दूध</th>
                <th className="p-1 border-r border-black">दर (₹)</th>
                <th className="p-1">सुविधा</th>
              </tr>
            </thead>
            <tbody>
              {details.competitor_dairies.map((c: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 font-bold text-center">
                  <td className="p-1 border-r border-black text-left pl-2">{c.dairyName}</td>
                  <td className="p-1 border-r border-black">{c.cowMilk || "-"}</td>
                  <td className="p-1 border-r border-black">{c.buffaloMilk || "-"}</td>
                  <td className="p-1 border-r border-black">{c.rate}</td>
                  <td className="p-1 text-left pl-2">{c.facility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.sub_routes?.length > 0 && (
        <>
          <SectionTitle icon={Truck} title="८) अंतर्गत उप-रूट माहिती" />
          <table className="w-full border-2 border-black text-[8pt] mb-6">
            <thead className="bg-slate-100 font-black">
              <tr className="border-b border-black">
                <th className="p-1 border-r border-black">वाहन</th>
                <th className="p-1 border-r border-black">किमी</th>
                <th className="p-1 border-r border-black">परिसर</th>
                <th className="p-1">दूध (L)</th>
              </tr>
            </thead>
            <tbody>
              {details.sub_routes.map((r: any, i: number) => (
                <tr key={i} className="border-b border-black last:border-0 font-bold text-center">
                  <td className="p-1 border-r border-black">{r.vehicleType}</td>
                  <td className="p-1 border-r border-black">{r.km} KM</td>
                  <td className="p-1 border-r border-black text-left pl-2">{r.area}</td>
                  <td className="p-1">{r.milkQty} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {details.internal_gothas?.length > 0 && (
        <>
          <SectionTitle icon={Building2} title="९) अंतर्गत मोठे गोठे माहिती" color="text-amber-800" />
          {details.internal_gothas.map((gotha: any, i: number) => (
            <div key={i} className="w-full border-2 border-amber-200 rounded-lg p-4 mb-4 bg-amber-50/20 break-inside-avoid">
               <h4 className="text-[10pt] font-black uppercase text-amber-900 mb-3 flex items-center gap-2">
                 <Badge className="bg-amber-600">G-{i+1}</Badge> {gotha.owner_name} (कोड: {gotha.code})
               </h4>
               <div className="grid grid-cols-2 gap-4 text-[9pt] mb-4">
                 <div>लोकेशन: <span className="font-bold">{gotha.location}</span></div>
                 <div>एरिया (गोठा/चारा): <span className="font-bold">{gotha.area} / {gotha.fodder_area}</span></div>
                 <div>दूध वेळ: <span className="font-bold">{gotha.milking_morning} - {gotha.milking_evening}</span></div>
               </div>
               {gotha.breeds?.length > 0 && (
                 <table className="w-full border border-amber-900/20 text-[8pt] mb-4 bg-white">
                   <thead className="bg-amber-100/50"><tr><th className="p-1 text-left">ब्रीड</th><th>संख्या</th><th>Avg(L)</th></tr></thead>
                   <tbody>{gotha.breeds.map((b: any, bi: number) => (<tr key={bi} className="text-center font-bold border-t border-amber-900/10">
                     <td className="p-1 text-left">{b.breed}</td><td>{b.count}</td><td>{b.avg_milk}</td>
                   </tr>))}</tbody>
                 </table>
               )}
               <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                 <p className="text-[7pt] font-black uppercase text-emerald-800 mb-1">स्वच्छता तपासणी (Checked OK)</p>
                 <div className="flex flex-wrap gap-x-4 gap-y-1">
                   {Object.entries(gotha.hygiene_checklist || {}).filter(([_,v]) => !!v).map(([k]) => (
                     <span key={k} className="text-[8pt] font-bold text-emerald-700">✓ {k.replace(/_/g, ' ')}</span>
                   ))}
                 </div>
               </div>
            </div>
          ))}
        </>
      )}

      {/* Dedicated Gotha Logic */}
      {d.supplierType === 'Gotha' && (
        <>
          <SectionTitle icon={Building2} title="२) गोठा सविस्तर माहिती" color="text-amber-800" />
          <div className="w-full border-2 border-black mb-6 grid grid-cols-2 gap-0 text-[9pt]">
            <div className="p-2 border-r border-b border-black font-black bg-slate-50">एकूण एरिया</div><div className="p-2 border-b border-black font-bold">{formData.gotha_total_area}</div>
            <div className="p-2 border-r border-b border-black font-black bg-slate-50">चारा एरिया</div><div className="p-2 border-b border-black font-bold">{formData.gotha_fodder_area}</div>
            <div className="p-2 border-r border-black font-black bg-slate-50">दूध वेळ (सकाळ/सायंकाळ)</div><div className="p-2 font-bold">{formData.gotha_milking_shift_morning} / {formData.gotha_milking_shift_evening}</div>
          </div>
          
          {formData.gotha_breed_info?.length > 0 && (
            <>
              <SectionTitle icon={Activity} title="३) जनावरे & ब्रीड माहिती" />
              <table className="w-full border-2 border-black text-[9pt] mb-6">
                <thead className="bg-slate-100 font-black"><tr><th className="p-1 text-left">ब्रीड</th><th>संख्या</th><th>सरासरी दूध (L)</th></tr></thead>
                <tbody>{formData.gotha_breed_info.map((b: any, bi: number) => (<tr key={bi} className="text-center font-bold border-t border-black"><td className="p-1 text-left pl-2">{b.breed}</td><td>{b.count}</td><td>{b.avg_milk} L</td></tr>))}</tbody>
              </table>
            </>
          )}

          <SectionTitle icon={ClipboardCheck} title="४) गोठा स्वच्छता स्थिती" color="text-emerald-700" />
          <div className="w-full grid grid-cols-3 gap-2 mb-6">
            {Object.entries(formData.gotha_hygiene_checklist || {}).map(([k, v]) => (
              <div key={k} className={cn("p-2 border rounded text-center text-[8pt] font-black uppercase", v ? "bg-emerald-600 text-white border-emerald-700" : "bg-slate-100 text-slate-300")}>{k.replace(/_/g, ' ')} {v ? '✓' : '✗'}</div>
            ))}
          </div>
        </>
      )}

      <SectionTitle icon={Lightbulb} title="विश्लेषण & उपाययोजना" />
      <div className="w-full text-left space-y-4">
        <ProfessionalParagraph label="दूध कमी होण्याची कारणे" content={details.milk_decrease_reasons} />
        <ProfessionalParagraph label="सेंटरने केलेले प्रयत्न" content={details.efforts_taken} />
        <ProfessionalParagraph label="दूध वाढवण्यासाठी उपाय" content={details.required_actions} />
      </div>

      <div className="w-full mt-auto pt-16 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
        <div className="border-t-2 border-black pt-3">अधिकारी स्वाक्षरी</div>
        <div className="border-t-2 border-black pt-3">सुपरवायझर स्वाक्षरी</div>
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
    if (confirm("तुम्हाला खात्री आहे की हा अहवाल कायमचा हटवायचा आहे?")) {
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
    else toast({ title: "माहिती", description: "या अहवालात बदल करण्याची सुविधा उपलब्ध नाही." })
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
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" /> अहवाल संग्रहालय (ARCHIVE)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Historical operational data and logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <input placeholder="शोधा (प्रकार, तारीख किंवा मजकूर)..." className="w-full pl-10 h-11 bg-white border border-muted-foreground/10 rounded-2xl font-black uppercase text-[11px] outline-none focus:ring-2 focus:ring-primary shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
              {filteredReports.length === 0 && <div className="p-10 text-center opacity-20 font-black uppercase text-[10px]">नोंदी नाहीत</div>}
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
                  {selectedReport.type === 'Milk Procurement Survey' || selectedReport.fullData?.producer_center || selectedReport.fullData?.supplierType === 'Gotha' ? (
                    <ProducerCenterLayout report={selectedReport} profileName="संकलन सुपरवायझर" profileId="N/A" />
                  ) : selectedReport.fullData?.isWordDoc ? (
                    <div className="bg-white font-sans text-slate-900 w-full p-6 sm:p-12 printable-report flex flex-col items-center min-h-screen">
                      <div className="w-full border-b-[4px] border-black pb-4 mb-8 text-center">
                        <h1 className="text-[18pt] sm:text-[24pt] font-black uppercase tracking-tight">{selectedReport.fullData.title}</h1>
                        <p className="text-[10pt] font-black text-muted-foreground uppercase tracking-widest mt-2">{selectedReport.date} | अधिकृत दस्तऐवज</p>
                      </div>
                      <div className="w-full prose prose-sm max-w-none text-[10pt] sm:text-[12pt] leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedReport.fullData.content }} />
                      <div className="w-full mt-auto pt-24 grid grid-cols-2 gap-20 text-center uppercase font-black text-[11pt] tracking-widest">
                        <div className="border-t-2 border-black pt-3">स्वाक्षरी</div>
                        <div className="border-t-2 border-black pt-3">दिनांक</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white font-sans text-slate-900 w-full p-4 sm:p-10 printable-report flex flex-col items-center min-h-screen">
                      <ReportHeader title={selectedReport.fullData?.reportHeading || selectedReport.summary} date={selectedReport.date} subName={selectedReport.fullData?.name || "संकलन सुपरवायझर"} subId={selectedReport.fullData?.idNumber || selectedReport.fullData?.repId} shift={selectedReport.fullData?.shift} />
                      
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

                        {selectedReport.type === 'Route Allocation Report' && selectedReport.fullData && (
                           <div className="space-y-6">
                              {[
                                { t: 'Can Route Morning', k: 'morningRoutes' },
                                { t: 'Can Route Evening', k: 'eveningRoutes' },
                                { t: 'Internal Tanker Route', k: 'tankerRoutes' },
                                { t: 'External Can Route', k: 'extCanRoutes' },
                                { t: 'External Tanker Route', k: 'extTankerRoutes' }
                              ].map(sec => selectedReport.fullData[sec.k]?.length > 0 && (
                                <div key={sec.k} className="break-inside-avoid">
                                  <SectionTitle title={sec.t} icon={Truck} />
                                  <table className="w-full border-2 border-black text-[8pt] sm:text-[10pt]">
                                    <thead className="bg-slate-100 font-black"><tr><th className="p-2 border-r border-black">ID</th><th className="p-2 border-r border-black">Code</th><th className="p-2 border-r border-black text-left">Route Name</th><th className="p-2 border-r border-black">Req</th><th className="p-2">Alloc</th></tr></thead>
                                    <tbody>{selectedReport.fullData[sec.k].map((r: any) => (
                                      <tr key={r.id} className="border-t border-black text-center font-bold">
                                        <td className="p-2 border-r border-black">{r.routeId}</td>
                                        <td className="p-2 border-r border-black">{r.routeCode}</td>
                                        <td className="p-2 border-r border-black text-left pl-3">{r.routeName}</td>
                                        <td className="p-2 border-r border-black">{r.requested ? '✓' : '-'}</td>
                                        <td className="p-2">{r.allocated ? '✓' : '-'}</td>
                                      </tr>
                                    ))}</tbody>
                                  </table>
                                </div>
                              ))}
                           </div>
                        )}

                        {selectedReport.fullData?.centerLosses?.length > 0 && (
                          <div className="break-inside-avoid">
                            <SectionTitle icon={TrendingDown} title="नुकसान तपशील (Loss Log)" color="text-rose-700" />
                            <table className="w-full border-2 border-black text-[9pt] sm:text-[11pt]">
                              <thead className="bg-rose-50 font-black"><tr><th className="p-2 border-r border-black">सेंटर कोड</th><th className="p-2 border-r border-black">नाव</th><th className="p-2 border-r border-black">प्रमाण (L)</th><th className="p-2">नुकसान (₹)</th></tr></thead>
                              <tbody>{selectedReport.fullData.centerLosses.map((l: any) => (
                                <tr key={l.id} className="border-t border-black text-center font-bold">
                                  <td className="p-2 border-r border-black">{l.centerCode}</td>
                                  <td className="p-2 border-r border-black text-left pl-3">{l.centerName}</td>
                                  <td className="p-2 border-r border-black">{l.qtyLiters}</td>
                                  <td className="p-2 font-black text-rose-700">{l.lossAmount}</td>
                                </tr>
                              ))}</tbody>
                              <tfoot className="bg-rose-50 font-black"><tr><td colSpan={3} className="p-2 text-right border-r border-black uppercase">एकूण आर्थिक नुकसान:</td><td className="p-2 text-center text-[12pt]">₹{selectedReport.fullData.totalLossAmount}</td></tr></tfoot>
                            </table>
                          </div>
                        )}

                        <ProfessionalParagraph icon={AlertCircle} label="महत्त्वाचे प्रॉब्लेम्स / निरीक्षणे" content={selectedReport.fullData?.dailyProblems || selectedReport.fullData?.problems} />
                        <ProfessionalParagraph icon={CheckCircle2} label="केलेली कार्यवाही" content={selectedReport.fullData?.actionTaken || selectedReport.fullData?.actionsTaken} />
                        <ProfessionalParagraph icon={Info} label="इतर विशेष माहिती" content={selectedReport.fullData?.otherInfo || selectedReport.fullData?.additionalNotes} />
                      </div>

                      <div className="w-full mt-auto pt-20 grid grid-cols-2 gap-20 text-center uppercase font-black text-[10pt] tracking-widest">
                        <div className="border-t-2 border-black pt-3">स्वाक्षरी</div>
                        <div className="border-t-2 border-black pt-3">दिनांक</div>
                      </div>
                    </div>
                  )}
                  <ScrollBar orientation="horizontal" />
               </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20 p-20 text-center">
              <Archive className="h-16 w-16 mb-4" />
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">अहवाल निवडा</h4>
              <p className="text-[10px] font-bold uppercase mt-2">Select a report from the archive to view professional layout</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
