import { createClient } from "@/lib/supabase/server";
import {
    Search,
    Filter,
    MoreVertical,
    ArrowUpDown,
    Plus,
    MapPin,
} from "lucide-react";
import Link from "next/link";
import { IssueStatus, IssuePriority } from "@/types/database";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: string;
        priority?: string;
        department?: string;
    }>;
}

export default async function AdminIssuesPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    // Fetch departments for the filter dropdown
    const { data: departments } = await supabase
        .from("departments")
        .select("id, name");

    // Build the query
    let query = supabase
        .from("issues")
        .select(`
            *,
            departments(name),
            users!issues_assigned_biker_id_fkey(full_name, email)
        `);

    // Apply filters
    if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
    }
    if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    }
    if (params.priority && params.priority !== 'all') {
        query = query.eq('priority', params.priority);
    }
    if (params.department && params.department !== 'all') {
        query = query.eq('department_id', params.department);
    }

    const { data: issues } = await query.order('created_at', { ascending: false });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Issues Management</h1>
                    <p className="text-slate-400 mt-1">Monitor and manage all reported civic issues</p>
                </div>
                <Link
                    href="/admin/issues/new"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create Issue
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative col-span-1 md:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="all">All Departments</option>
                    {departments?.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
            </div>

            {/* Issues Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {issues?.map((issue) => (
                                <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                                                {issue.title}
                                            </span>
                                            <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                issue.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold capitalize ${issue.priority === 'high' ? 'text-red-400' :
                                                issue.priority === 'medium' ? 'text-amber-400' :
                                                    'text-slate-400'
                                            }`}>
                                            {issue.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-300 bg-white/5 px-2 py-1 rounded-lg">
                                            {issue.departments?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {issue.users ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300">{issue.users.full_name}</span>
                                                <span className="text-[10px] text-slate-500">{issue.users.email}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!issues || issues.length === 0) && (
                    <div className="py-20 text-center">
                        <p className="text-slate-500">No issues found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
