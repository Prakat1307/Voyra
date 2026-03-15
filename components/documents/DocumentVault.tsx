'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOC_TYPES = [
    { id: 'passport', label: 'Passport', icon: '🛂' },
    { id: 'visa', label: 'Visa', icon: '📋' },
    { id: 'ticket', label: 'Flight/Train Ticket', icon: '✈️' },
    { id: 'hotel', label: 'Hotel Booking', icon: '🏨' },
    { id: 'insurance', label: 'Travel Insurance', icon: '🛡️' },
    { id: 'id', label: 'ID Card', icon: '🪪' },
    { id: 'vaccine', label: 'Vaccination Certificate', icon: '💉' },
    { id: 'itinerary', label: 'Printed Itinerary', icon: '📄' },
    { id: 'other', label: 'Other', icon: '📎' },
];

interface DocFile {
    id: number;
    name: string;
    type: string;
    notes: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    dataUrl: string;
    uploadedAt: string;
}

interface DocumentVaultProps {
    tripId?: string;
}

export default function DocumentVault({ tripId }: DocumentVaultProps) {
    const [documents, setDocuments] = useState<DocFile[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', type: 'passport', notes: '' });
    const [checklist, setChecklist] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const saved = localStorage.getItem(`docs-${tripId || 'default'}`);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setDocuments(data.documents || []);
                setChecklist(data.checklist || {});
            } catch {  }
        }
    }, [tripId]);

    useEffect(() => {
        localStorage.setItem(`docs-${tripId || 'default'}`, JSON.stringify({ documents, checklist }));
    }, [documents, checklist, tripId]);

    const addDocument = (file: File | undefined) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setDocuments(prev => [...prev, {
                id: Date.now(),
                name: newDoc.name || file.name,
                type: newDoc.type,
                notes: newDoc.notes,
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(1) + ' KB',
                fileType: file.type,
                dataUrl: e.target?.result as string,
                uploadedAt: new Date().toISOString()
            }]);
            setNewDoc({ name: '', type: 'passport', notes: '' });
            setShowUpload(false);
        };
        reader.readAsDataURL(file);
    };

    const removeDocument = (id: number) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const toggleChecklist = (docType: string) => {
        setChecklist(prev => ({ ...prev, [docType]: !prev[docType] }));
    };

    const downloadDoc = (doc: DocFile) => {
        const a = document.createElement('a');
        a.href = doc.dataUrl;
        a.download = doc.fileName;
        a.click();
    };

    const completedCount = DOC_TYPES.filter(d => checklist[d.id]).length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">📁 Document Vault</h2>
                <p className="text-slate-500 text-xs mt-1">Store important travel documents securely for offline access</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <div className="glass rounded-xl p-5 border border-slate-700/50">
                    <h3 className="font-semibold text-white mb-1 text-sm">✅ Document Checklist</h3>
                    <p className="text-[10px] text-slate-500 mb-3">{completedCount}/{DOC_TYPES.length} ready</p>

                    <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / DOC_TYPES.length) * 100}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        />
                    </div>

                    <div className="space-y-1">
                        {DOC_TYPES.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => toggleChecklist(doc.id)}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs transition text-left
                  ${checklist[doc.id]
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : 'hover:bg-slate-800 border border-transparent'}`}
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                  ${checklist[doc.id]
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-slate-600'}`}
                                >
                                    {checklist[doc.id] && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span>{doc.icon}</span>
                                <span className={`${checklist[doc.id] ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                                    {doc.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {}
                <div className="lg:col-span-2 space-y-4">
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="w-full py-3 border-2 border-dashed border-indigo-500/30 rounded-xl text-indigo-400 font-medium hover:bg-indigo-500/10 transition text-sm"
                    >
                        ➕ Upload Document
                    </button>

                    <AnimatePresence>
                        {showUpload && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass rounded-xl p-5 border border-indigo-500/30 space-y-3 overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Document name (optional)"
                                    value={newDoc.name}
                                    onChange={(e) => setNewDoc(p => ({ ...p, name: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                                />
                                <div className="flex gap-3">
                                    <select
                                        value={newDoc.type}
                                        onChange={(e) => setNewDoc(p => ({ ...p, type: e.target.value }))}
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        {DOC_TYPES.map(d => (
                                            <option key={d.id} value={d.id}>{d.icon} {d.label}</option>
                                        ))}
                                    </select>
                                    <label className="flex-1 border-2 border-dashed border-slate-700 rounded-lg px-4 py-2.5 text-sm text-center cursor-pointer hover:border-indigo-500/50 transition text-slate-500 flex items-center justify-center gap-2">
                                        📎 Choose file
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => addDocument(e.target.files?.[0])}
                                        />
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {}
                    <div className="space-y-2">
                        {documents.length === 0 ? (
                            <div className="text-center py-12 text-slate-600">
                                <p className="text-4xl mb-3">📂</p>
                                <p className="text-sm">No documents uploaded yet</p>
                                <p className="text-[10px] text-slate-700 mt-1">Upload passports, tickets, bookings etc.</p>
                            </div>
                        ) : (
                            documents.map(doc => {
                                const docType = DOC_TYPES.find(d => d.id === doc.type);
                                return (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 group hover:border-slate-600 transition"
                                    >
                                        <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-xl border border-slate-700">
                                            {docType?.icon || '📎'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-white truncate">{doc.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                {docType?.label} • {doc.fileSize} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            {doc.fileType?.startsWith('image') && (
                                                <button
                                                    onClick={() => window.open(doc.dataUrl, '_blank')}
                                                    className="p-2 hover:bg-slate-800 rounded-lg transition text-sm"
                                                    title="Preview"
                                                >
                                                    👁️
                                                </button>
                                            )}
                                            <button
                                                onClick={() => downloadDoc(doc)}
                                                className="p-2 hover:bg-slate-800 rounded-lg transition text-sm"
                                                title="Download"
                                            >
                                                📥
                                            </button>
                                            <button
                                                onClick={() => removeDocument(doc.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition text-sm text-red-400"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {}
                    <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20">
                        <p className="text-[10px] text-yellow-400/80 flex items-start gap-2">
                            <span>⚠️</span>
                            Documents are stored locally in your browser. For production use, implement encrypted cloud storage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
