import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import ApiServices from "../../../../services/ApiServices";
import { useToast } from "../../../../app/providers/ToastProvider";
import TiptapEditor from "./TitapEditor";

export const AddBlog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [title, setTitle] = useState("");
  // const [author, setAuthor] = useState("Arpan Dutta");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<any[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  useEffect(() => {
    // Fetch Categories
    const fetchCategories = async () => {
      try {
        const response = await ApiServices.getBlogCategories();
        if (response.data.code === 200 || response.data.status === "success") {
          setAvailableCategories(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Fetch Authors
    const fetchAuthors = async () => {
      try {
        const response = await ApiServices.getBlogAuthorDropdown();
        if (response.data.code === 200 || response.data.status === "success") {
          setAvailableAuthors(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };

    // Fetch Blog Data if Editing
    const fetchBlogData = async () => {
      if (isEditMode && editId) {
        try {
          const response = await ApiServices.getBlogsList();
          if (
            response.data.code === 200 ||
            response.data.status === "success"
          ) {
            const blogToEdit = response.data.data.find(
              (b: any) => b.id.toString() === editId,
            );
            if (blogToEdit) {
              setTitle(blogToEdit.blog_title || "");
              // setAuthor(blogToEdit.blog_author || "");
              setCategoryId(blogToEdit.category_id?.toString() || "");
              setSelectedAuthorId(blogToEdit.blog_author?.toString() || "");
              setContent(blogToEdit.blog_content || "");
              setImageUrl(blogToEdit.image || "");
              setImageFile(null);
            }
          }
        } catch (error) {
          console.error("Error fetching blog data:", error);
          showToast("Failed to load blog data", "error");
        }
      }
    };

    fetchCategories();
    fetchBlogData();
    fetchAuthors();
  }, [editId, isEditMode, showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = "Blog title is required.";
    }
    if (!content.trim() || content.trim() === "<p></p>") {
      newErrors.content = "Blog content cannot be empty.";
    }
    if (!categoryId) {
      newErrors.categoryId = "A category is required.";
    }
    if (!selectedAuthorId) {
      newErrors.authorId = "An author must be selected.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // showToast("Please fill in all required fields.", "warning");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editId) formData.append("id", editId);
      formData.append("blog_title", title);
      formData.append("blog_author", selectedAuthorId);
      formData.append("blog_content", content);
      formData.append("category_id", categoryId);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await ApiServices.insertUpdateBlog(formData);

      if (response.data.code === 200 || response.data.status === "success") {
        showToast(
          response.data.message ||
            `Blog ${isEditMode ? "updated" : "published"} successfully`,
          "success",
        );
        navigate("/admin/manage-blog");
      } else {
        showToast(response.data.message || "Failed to save blog", "error");
      }
    } catch (error: any) {
      console.error("Error saving blog:", error);
      showToast("Something went wrong while saving", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  return (
    <div className="space-y-6 max-w-8xl mx-auto">
      <div className="flex items-center gap-4">
        <NavLink
          to="/admin/manage-blog"
          className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full transition-colors text-secondary-500"
        >
          <ArrowLeft size={20} />
        </NavLink>
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white">
            {isEditMode ? "Edit Blog Article" : "Add New Blog Article"}
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-700">
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Post Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Post Title<span className="text-red ps-1">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border ${errors.title ? "border-red-500 focus:ring-red-500/50" : "border-secondary-200 dark:border-secondary-700 focus:ring-primary-500"} text-primary dark:text-white focus:outline-none focus:ring-2 text-black dark:text-white`}
                placeholder="Enter a captivating title..."
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  setTitle(value);
                  setErrors((prev) => ({
                    ...prev,
                    title: value.trim() ? "" : "Blog title is required.",
                  }));
                }}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            {/* <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Author
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-black dark:text-white"
                value={author}
                disabled
              />
            </div> */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Author <span className="text-red ps-1">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 rounded-xl border ${errors.authorId  ? "border-red-500 focus:ring-red-500/50" : "border-secondary-200 dark:border-secondary-700 focus:ring-primary-500"} text-primary dark:text-white focus:outline-none focus:ring-2 text-black dark:text-white`}
                value={selectedAuthorId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedAuthorId(value);
                  setErrors((prev) => ({
                    ...prev,
                    authorId: value ? "" : "An author is required.",
                  }));
                }}
              >
                <option value="">Select an Author</option>
                {availableAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.author_name}
                  </option>
                ))}
              </select>
              {errors.authorId && (
                <p className="text-xs text-red-500 mt-1">{errors.authorId}</p>
              )}
            </div>
          </div>

          {/* Content (Rich Text Editor) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
              Content <span className="text-red ps-1">*</span>
            </label>
            <div
              className={`rounded-xl ${errors.content ? "ring-2 ring-red-500" : ""} transition-all`}
            >
              <TiptapEditor
                content={content}
                onChange={(html) => {
                  setContent(html);
                  setErrors((prev) => ({
                    ...prev,
                    content:
                      html.trim() && html !== "<p></p>"
                        ? ""
                        : "Blog content cannot be empty.",
                  }));
                }}
              />
            </div>
            {errors.content && (
              <p className="text-xs text-red-500 mt-1">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Category <span className="text-red ps-1">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 rounded-xl border ${errors.categoryId ? "border-red-500 focus:ring-red-500/50" : "border-secondary-200 dark:border-secondary-700 focus:ring-primary-500"} text-primary dark:text-white focus:outline-none focus:ring-2 text-black dark:text-white`}
                value={categoryId}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryId(value);
                  setErrors((prev) => ({
                    ...prev,
                    categoryId: value ? "" : "A category is required.",
                  }));
                }}
                disabled={isSubmitting}
              >
                <option value="">Select a Category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Featured Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreviewUrl ? (
                  <div className="relative">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-lg border border-secondary-200 dark:border-secondary-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl("");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 flex-shrink-0 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 flex flex-col items-center justify-center">
                    <ImageIcon
                      size={24}
                      className="text-secondary-400 dark:text-secondary-500"
                    />
                    <p className="text-xs text-secondary-400 mt-1">No Image</p>
                  </div>
                )}
                <div className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-secondary-700 file:text-primary-700 dark:file:text-secondary-200 hover:file:bg-primary-100 dark:hover:file:bg-secondary-600 cursor-pointer"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-secondary-500 mt-2">
                    Recommended: 1200x630px. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#b0cb1f] text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#c5de3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />{" "}
                  {isEditMode ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save size={18} />{" "}
                  {isEditMode ? "Update Blog" : "Publish Blog"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
