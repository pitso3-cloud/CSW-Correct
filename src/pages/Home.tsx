import { Clock, FileText, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    <Clock size={18} className="inline-block mr-2" /> Recent Checks
                </h3>
                <button className="text-sm text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded">
                                <FileText size={16} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Memo_Budget_2025.docx</p>
                                <p className="text-xs text-muted-foreground">Checked 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">98%</span>
                            <ChevronRight size={16} className="text-muted-foreground text-opacity-0 group-hover:text-opacity-100 transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
                <h3 className="font-semibold mb-4">Quick Shortcuts</h3>
                <div className="grid grid-cols-2 gap-4">
                    {['New Template', 'Protocol Guide', 'Ranks Lookup', 'Date Formats'].map((item) => (
                        <button key={item} className="p-4 bg-accent/50 hover:bg-accent border border-transparent hover:border-primary/20 rounded-lg text-left transition-all">
                            <span className="font-medium text-sm">{item}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;