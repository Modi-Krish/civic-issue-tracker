import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import IssueForm from "@/components/admin/IssueForm";

export default async function NewIssuePage() {
    const supabase = await createClient();

    // Fetch departments for the form
    const { data: departments } = await supabase
        .from("departments")
        .select("*")
        .order("name");

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/issues"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Issues
                </Link>
                <h1 className="text-3xl font-bold">Report New Civic Issue</h1>
                <p className="text-slate-400 mt-1">Fill in the details below to log a new issue into the system.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                <IssueForm departments={departments || []} />
            </div>
        </div>
    );
}
