import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { NavLink, useSearchParams, useNavigate } from 'react-router-dom';
import ApiServices from '../../../../services/ApiServices';
import { useToast } from '../../../../app/providers/ToastProvider';

export const AddSEO: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const [routePath, setRoutePath] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');
    const [isSubmitting ,setIsSubmitting ] = useState(false);
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchExistingData = async () => {
            if (isEditMode && editId) {
                try {
                    const response = await ApiServices.getBlogSeoSettings();
                    if (response.data.code === 200 || response.data.status === 'success') {
                        const seoToEdit = response.data.data.find((s: any) => s.id.toString() === editId);
                        if (seoToEdit) {
                            setRoutePath(seoToEdit.page_route || '');
                            setMetaTitle(seoToEdit.seo_title || '');
                            setMetaDescription(seoToEdit.seo_description || '');
                            setKeywords(seoToEdit.seo_keywords || '');
                            setCanonicalUrl(seoToEdit.canonical_url || '');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching SEO data:", error);
                }
            }
        };
        fetchExistingData();
    }, [editId, isEditMode]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: { [key: string]: string } = {};
        
        if (!routePath.trim()) newErrors.routePath = "Page route is required.";
        if (!metaTitle.trim()) newErrors.metaTitle = "SEO title is required.";
        if (!metaDescription.trim()) newErrors.metaDescription = "SEO description is required.";
        if (!keywords.trim()) newErrors.keywords = "Keywords are required.";
        
        if (!canonicalUrl.trim()) {
            newErrors.canonicalUrl = "Canonical URL is required.";
        } else if (!canonicalUrl.startsWith('http')) {
            newErrors.canonicalUrl = "Please enter a valid absolute URL.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showToast("Please fill in all required fields", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id: editId ? parseInt(editId) : null,
                page_route: routePath.trim(),
                seo_title: metaTitle,
                seo_description: metaDescription,
                seo_keywords: keywords,
                canonical_url: canonicalUrl
            };

            const response = await ApiServices.insertUpdateBlogSeo(payload);
            
            if (response.data.code === 200 || response.data.status === 'success') {
                showToast(response.data.message || `SEO ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
                navigate('/admin/manage-seo');
            } else {
                showToast(response.data.message || 'Failed to save SEO config', 'error');
            }
        } catch (error) {
            console.error('Error saving SEO:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-8xl mx-auto">
            <div className="flex items-center gap-4">
                <NavLink to="/admin/manage-seo" className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-colors text-secondary-500">
                    <ArrowLeft size={20} />
                </NavLink>
                <h1 className="text-2xl font-bold text-primary">
                    {isEditMode ? 'Edit SEO Config' : 'Add New SEO Config'}
                </h1>
            </div>

            <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
                <form className="space-y-6" onSubmit={handleSave}>
                    
                    {/* Page Route */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider flex items-center gap-1">
                            Page Route / Path <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${errors.routePath ? 'border-red-500 focus:ring-red-500/30 bg-red-50/10' : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500'} text-black `}
                            placeholder="e.g., /home"
                            value={routePath}
                            onChange={(e) => {
                                const val = e.target.value;
                                setRoutePath(val);
                                setErrors(prev => ({ ...prev, routePath: val.trim() ? "" : "Page route is required." }));
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.routePath && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.routePath}</p>}
                    </div>

                    {/* SEO Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider flex items-center gap-1">
                            SEO Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${errors.metaTitle ? 'border-red-500 focus:ring-red-500/30 bg-red-50/10' : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500'} text-black `}
                            placeholder="Enter meta title..."
                            value={metaTitle}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMetaTitle(val);
                                setErrors(prev => ({ ...prev, metaTitle: val.trim() ? "" : "SEO title is required." }));
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.metaTitle && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.metaTitle}</p>}
                    </div>

                    {/* SEO Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider flex items-center gap-1">
                            SEO Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${errors.metaDescription ? 'border-red-500 focus:ring-red-500/30 bg-red-50/10' : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500'} text-black `}
                            placeholder="Write meta description..."
                            value={metaDescription}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMetaDescription(val);
                                setErrors(prev => ({ ...prev, metaDescription: val.trim() ? "" : "SEO description is required." }));
                            }}
                            disabled={isSubmitting}
                        ></textarea>
                        {errors.metaDescription && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.metaDescription}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Keywords */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider flex items-center gap-1">
                                Keywords <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${errors.keywords ? 'border-red-500 focus:ring-red-500/30 bg-red-50/10' : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500'} text-black `}
                                placeholder="keyword1, keyword2"
                                value={keywords}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setKeywords(val);
                                    setErrors(prev => ({ ...prev, keywords: val.trim() ? "" : "Keywords are required." }));
                                }}
                                disabled={isSubmitting}
                            />
                            {errors.keywords && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/> {errors.keywords}</p>}
                        </div>

                        {/* Canonical URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider flex items-center gap-1">
                                Canonical URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                                    errors.canonicalUrl 
                                        ? 'border-red-500 focus:ring-red-500/30 bg-red-50/10' 
                                        : 'border-secondary-200 dark:border-secondary-700 focus:ring-primary-500'
                                } text-black `}
                                placeholder="https://example.com/page"
                                value={canonicalUrl}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCanonicalUrl(val);
                                    
                                    let errorMsg = "";
                                    if (!val.trim()) {
                                        errorMsg = "Canonical URL is required.";
                                    } else if (!val.startsWith('http')) {
                                        errorMsg = "Please enter a valid absolute URL (starting with http/https).";
                                    }
                                    
                                    setErrors(prev => ({ 
                                        ...prev, 
                                        canonicalUrl: errorMsg 
                                    }));
                                }}
                                disabled={isSubmitting}
                            />
                            {errors.canonicalUrl && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle size={12}/> {errors.canonicalUrl}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-[#b0cb1f] text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#c5de3a] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isEditMode ? 'Update SEO Info' : 'Save SEO Info'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSEO;