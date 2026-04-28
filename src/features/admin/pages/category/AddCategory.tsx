import React, { useState, useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import ApiServices from '../../../../services/ApiServices';
import { useToast } from '../../../../app/providers/ToastProvider';

interface AddCategoryProps {
    isOpen: boolean;
    onClose: () => void;
    editId: number | null;
    allCategories?: any[];
    onSuccess?: () => void;
}

export const AddCategory: React.FC<AddCategoryProps> = ({ 
    isOpen, 
    onClose, 
    editId, 
    allCategories,
    onSuccess 
}) => {
    const isEditMode = !!editId;
    const [categoryName, setCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editId) {
                const categoryToEdit = allCategories?.find(c => c.id === editId);
                if (categoryToEdit) {
                    // Supporting both 'name' (mock) and 'category_name' (real API)
                    setCategoryName(categoryToEdit.category_name || categoryToEdit.name || '');
                }
            } else {
                setCategoryName('');
            }
        }
    }, [isOpen, editId, isEditMode, allCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!categoryName.trim()) {
            showToast('Category name is required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id: editId,
                category_name: categoryName.trim()
            };
            
            const response = await ApiServices.insertUpdateBlogCategory(payload);
            
            if (response.data.code === 200 || response.data.status === 'success') {
                showToast(response.data.message || `Category ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showToast(response.data.message || 'Failed to save category', 'error');
            }
        } catch (error: any) {
            console.error('Error saving category:', error);
            showToast(error.response?.data?.message || 'Internal Server Error', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                        {isEditMode ? 'Edit Category' : 'Add New Category'}
                    </h1>
                    <button onClick={onClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-colors text-secondary-500">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-6" onSubmit={handleSubmit}>
                    <label htmlFor="categoryName" className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">Category Name</label>
                    <input
                        id="categoryName"
                        type="text"
                        style={{ color: 'black' }}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Career Development"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        disabled={isSubmitting}
                        autoFocus
                    />

                    <div className="flex justify-end pt-6 mt-6 border-t border-secondary-200 dark:border-secondary-700">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-[#b0cb1f] text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#c5de3a] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isEditMode ? 'Update Category' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;