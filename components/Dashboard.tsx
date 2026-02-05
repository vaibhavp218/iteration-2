import React, { useState, ChangeEvent } from 'react';
import { Search, Upload, FileSpreadsheet, Loader2, AlertCircle, Clock, ChevronRight, ClipboardList, PackagePlus } from 'lucide-react';
import { HistoryItem, EvaluationRequest } from '../types';

interface DashboardProps {
  onSearch: (request: EvaluationRequest) => void;
  onUpload: (codes: string[], fileName?: string) => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSearch, onUpload, isLoading, history, onHistorySelect }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [dragActive, setDragActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState<EvaluationRequest>({
    materialCode: '',
    partNumber: '',
    description: '',
    equipmentCode: '',
    criticality: 'B',
    leadTime: undefined,
    unitPrice: undefined,
    holdingCost: undefined,
    orderingCost: undefined,
    annualUsage: undefined,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' && value ? parseFloat(value) : value
    }));
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.materialCode && formData.description && formData.equipmentCode && formData.criticality) {
      onSearch(formData);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const codes = text
        .split(/\r?\n/)
        .map(row => row.split(',')[0].trim())
        .filter(code => code.length > 0 && code.toLowerCase() !== 'material code');

      onUpload(codes, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 py-6 justify-center h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Inventory Intelligence</h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
          Start a new evaluation to discover duplicates, prevent overstocking, and optimize your mining supply chain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 ${history.length > 0 ? 'lg:col-span-8' : 'lg:col-span-8 lg:col-start-3'}`}>
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-4 text-center font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'single' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >
              <ClipboardList size={20} />
              Search
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 py-4 text-center font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'bulk' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            >
              <PackagePlus size={20} />
              Bulk Upload
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'single' ? (
              <form onSubmit={handleSingleSubmit} className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                  {/* Essential Fields */}
                  <div className="md:col-span-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">Essential Details</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Material Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="materialCode"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="Ex: 401121145"
                      value={formData.materialCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Part Number</label>
                    <input
                      type="text"
                      name="partNumber"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="Ex: 22216-E1-K"
                      value={formData.partNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Material Description <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="description"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="Ex: Heavy duty spherical roller bearing"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Equipment Code <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="equipmentCode"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="Ex: 600000236064"
                      value={formData.equipmentCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Criticality <span className="text-red-500">*</span></label>
                    <select
                      name="criticality"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                      value={formData.criticality}
                      onChange={handleInputChange}
                    >
                      <option value="A">A - Critical</option>
                      <option value="B">B - Important</option>
                      <option value="C">C - Normal</option>
                      <option value="D">D - Low Priority</option>
                    </select>
                  </div>

                  {/* Optional Fields */}
                  <div className="md:col-span-2 mt-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">Optional Parameters</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Lead Time (Days)</label>
                    <input
                      type="number"
                      name="leadTime"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="30"
                      value={formData.leadTime || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      name="unitPrice"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="0.00"
                      value={formData.unitPrice || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Holding Cost (%)</label>
                    <input
                      type="number"
                      name="holdingCost"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="15"
                      value={formData.holdingCost || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Ordering Cost ($)</label>
                    <input
                      type="number"
                      name="orderingCost"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="50"
                      value={formData.orderingCost || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Expected Annual Usage</label>
                    <input
                      type="number"
                      name="annualUsage"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="100"
                      value={formData.annualUsage || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none flex items-center text-sm"
                  >
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    Submit Evaluation
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 animate-fade-in">
                <div
                  className={`border-3 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative bg-slate-50 ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-white'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                      <FileSpreadsheet size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Upload Bulk Inventory List</h3>
                    <p className="text-slate-400 mb-4 max-w-sm text-sm">Drag and drop your CSV or Text file here, or click to browse.</p>
                    <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-sm">Supported: .csv, .txt</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section - Sidebar */}
        {history.length > 0 && (
          <div className="lg:col-span-4 w-full animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onHistorySelect(item)}
                  className="group flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.type === 'SEARCH' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.type === 'SEARCH' ? <ClipboardList size={14} /> : <FileSpreadsheet size={14} />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-800 text-xs truncate max-w-[150px] group-hover:text-blue-700 transition-colors">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{formatTime(item.timestamp)}</div>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-blue-400 transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!apiKeyPresent() && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg flex items-center border border-amber-200 text-xs lg:col-span-12">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span>Demo Mode: API Key not detected. Using mock data for demonstration.</span>
          </div>
        )}
      </div>
    </div>
  );
};

const apiKeyPresent = () => true;

export default Dashboard;