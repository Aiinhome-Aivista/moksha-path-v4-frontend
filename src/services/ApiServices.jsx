import axios from "axios";
import { GET_APIS, POST_APIS } from "../../connection";

// Create axios instance with default config
const axiosInstance = axios.create();

// Add request interceptor for token-based authentication
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("auth_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("auth_token");
    const subscriptionToken = localStorage.getItem("subscription_token");

    if (!config.headers) config.headers = {};

    // AUTH TOKEN
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    // SUBSCRIPTION TOKEN
    if (subscriptionToken) {
      config.headers["subscription-token"] = subscriptionToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   // Handle unauthorized - clear token and redirect to login
    //   localStorage.removeItem("auth_token");
    //   // window.location.href = "/login";
    // }
    // Allow 400 responses to be resolved instead of rejected (for coupon validation)
    if (
      error.response?.status === 400 ||
      (error.response?.status === 400 && error.response?.data)
    ) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  },
);

// Create another axios instance without request interceptors (no tokens)
const publicAxiosInstance = axios.create();

// Add response interceptor for error handling
publicAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400 && error.response?.data) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  },
);

class ApiServices {
  // Auth APIs

  // User APIs
  getUsernameSuggestions(name) {
    return axiosInstance.get(GET_APIS.username_suggestions, {
      params: { name },
    });
  }

  checkUsernameAvailability(username) {
    return axiosInstance.post(POST_APIS.username_check, { username });
  }

  // OTP APIs
  sendEmailOtp(username, email) {
    return axiosInstance.post(POST_APIS.send_otp_Email, { username, email });
  }

  verifyEmailOtp(username, email, otp) {
    return axiosInstance.post(POST_APIS.verify_otp_Email, {
      username,
      email,
      otp,
    });
  }

  sendPhoneOtp(username, phone) {
    return axiosInstance.post(POST_APIS.send_otp_Phone, { username, phone });
  }

  verifyPhoneOtp(username, phone, otp) {
    return axiosInstance.post(POST_APIS.verify_otp_Phone, {
      username,
      phone,
      otp,
    });
  }

  // Role APIs
  getRoles() {
    return axiosInstance.get(GET_APIS.select_role);
  }

  registerUser(userData) {
    return axiosInstance.post(POST_APIS.register_login, userData);
  }

  loginUser(data) {
    return axiosInstance.post(POST_APIS.login, data);
  }

  // Recovery APIs
  findUserDetails(username) {
    return axiosInstance.post(POST_APIS.find_details, { username });
  }

  sendRecoveryOtp(data) {
    return axiosInstance.post(POST_APIS.send_recovery_otp, data);
  }

  verifyRecoveryOtp(data) {
    return axiosInstance.post(POST_APIS.verify_recovery_otp, data);
  }

  // Academic APIs
  getAcademicMasters(params = {}) {
    return axiosInstance.get(GET_APIS.board, { params });
  }
  getAcademicHierarchy() {
    return axiosInstance.get(GET_APIS.get_academic_hierarchy);
  }
  getSubjectsByBoards(data) {
    return axiosInstance.post(POST_APIS.get_subjects_by_boards, data);
  }

  // Subscription APIs
  getSubscriptionPlans(data) {
    return axiosInstance.post(POST_APIS.subscription.plans, data);
  }

  validatePlanAmount(data) {
    return axiosInstance.post(
      POST_APIS.subscription.validate_plan_amount,
      data,
    );
  }

  completeSubscription(data) {
    return axiosInstance.post(
      POST_APIS.subscription.complete_subscription,
      data,
    );
  }

  saveSubscriptionDraft(data) {
    return axiosInstance.post(
      POST_APIS.subscription.save_subscription_draft,
      data,
    );
  }

  // Send subscription invite
  sendSubscriptionInvite(data) {
    return axiosInstance.post(POST_APIS.subscription.invite_send, data);
  }

  // Undo subscription invite
  undoInvite(data) {
    return axiosInstance.post(POST_APIS.subscription.undo_invite, data);
  }
  getInviteList() {
    return axiosInstance.get(GET_APIS.subscription_invite_list);
  }

  // Get subscription invite history (received + sent)
  getInviteHistory() {
    return axiosInstance.get(GET_APIS.subscription_invite_history);
  }

  // Get subscription list dashboard (users + subscriptions)
  getSubscriptionList() {
    return axiosInstance.get(GET_APIS.subscription_list);
  }

  // Get user subscription details
  getUserSubscriptions() {
    return axiosInstance.get(GET_APIS.user_subscriptions);
  }

  // Get all usernames (for invite modal search)
  getUsernameList() {
    return axiosInstance.get(GET_APIS.username_list);
  }
  saveBoardClassUserMapping(data) {
    return axiosInstance.post(POST_APIS.save_board_class_user_mapping, data);
  }
  getUserAcademicDetails() {
    return axiosInstance.get(GET_APIS.get_user_academic_details);
  }

  decodeJwt() {
    return axiosInstance.post(POST_APIS.decode_jwt);
  }

  // Learning Planner API
  generateLearningPlan(data) {
    return axiosInstance.post(POST_APIS.learning_planner, data);
  }

  // GET Student Learning Planner
  getStudentLearningPlanner() {
    return axiosInstance.get(GET_APIS.get_student_learning_planner);
  }

  getStudentPlannerDashboard() {
    return axiosInstance.get(GET_APIS.student_planner_dashboard);
  }

  getMultiChapterTests() {
    return axiosInstance.get(GET_APIS.get_multi_chapter_tests);
  }

  // Update Topic Status
  updateTopicStatus(payload) {
    return axiosInstance.post(POST_APIS.update_topic_status, payload);
  }
  updateChapterPriority(payload) {
    return axiosInstance.post(POST_APIS.update_priority, payload);
  }
  signOut() {
    return axiosInstance.post(POST_APIS.signout);
  }
  validateSubscription() {
    return axiosInstance.post(POST_APIS.subscription_validate);
  }

  getUserProfiles() {
    return axiosInstance.get(GET_APIS.roles);
  }

  switchUserProfile(payload) {
    return axiosInstance.post(POST_APIS.switch_role, payload);
  }

  // Menu / Page Access API
  getPageAccess() {
    return axiosInstance.post(POST_APIS.page_access);
  }

  // =======================
  // RESOURCES API
  // =======================
  getChapterTopicResources(data) {
    return axiosInstance.post(POST_APIS.get_chapter_topic_resources, data);
  }

  // =======================
  // ASSESSMENT APIs
  // =======================

  // Store / Prepare questions for assessment
  storeAssessmentQuestions(payload) {
    return axiosInstance.post(POST_APIS.store_assessment_questions, payload);
  }

  // -----------------------
  // Assign Assessment
  // -----------------------

  // Case 1: Self Assessment (Student)
  assignSelfAssessment(payload) {
    return axiosInstance.post(POST_APIS.assign_self_assessment, payload);
  }

  // Case 2: Teacher assigns to selected students
  assignAssessmentToStudents(payload) {
    return axiosInstance.post(POST_APIS.assign_assessment_to_class, payload);
  }

  // Case 3: Teacher assigns to entire class
  assignAssessmentToClass(payload) {
    return axiosInstance.post(POST_APIS.assign_assessment_to_class, payload);
  }

  // -----------------------
  // Student Assessment Dashboard
  // -----------------------
  getStudentAssessments() {
    return axiosInstance.get(GET_APIS.student_assessments);
  }

  // -----------------------
  // Assessment Flow
  // -----------------------

  // Get assessment questions/details
  getAssessmentDetails(assignmentId) {
    return axiosInstance.get(GET_APIS.assessment_details, {
      params: { assignment_id: assignmentId },
    });
  }

  // Start assessment attempt
  startAssessment(payload) {
    return axiosInstance.post(POST_APIS.start_assessment, payload);
  }

  // Save single answer
  saveAssessmentAnswer(payload) {
    return axiosInstance.post(POST_APIS.save_assessment_answer, payload);
  }

  // Finish assessment (final submit)
  finishAssessment(payload) {
    return axiosInstance.post(POST_APIS.finish_assessment, payload);
  }

  // Retake assessment
  // retakeAssessment(payload) {
  //   return axiosInstance.post(POST_APIS.retake_assessment, payload);
  // }
  // ApiServices.ts
  uploadProfilePicture(formData) {
    return axiosInstance.post(POST_APIS.upload_profile_picture, formData);
  }

  getUserProfileImage() {
    return axiosInstance.get(GET_APIS.get_profile_picture);
  }

  // Student profile update — uncomment + add endpoint in connection.js when backend is ready
  // updateStudentProfile(payload) {
  //   return axiosInstance.post(POST_APIS.update_student_profile, payload);
  // }

  // Subscription Invite APIs
  // getInviteList() {
  //   return axiosInstance.get(GET_APIS.subscription_invite_list);
  // }

  respondToInvite(invite_token, action) {
    return axiosInstance.post(POST_APIS.subscription.invite_respond, {
      invite_token,
      action, // "accept" | "reject"
    });
  }

  //get user academic details
  // getUserAcademicDetails() {
  //   return axiosInstance.get(GET_APIS.get_user_academic_details);
  // }

  getAcademicMasterData() {
    return axiosInstance.get(GET_APIS.get_academic_master_data);
  }

  // Add new institute
  addInstitute(payload) {
    return axiosInstance.post(POST_APIS.add_institute, payload);
  }

  // Login/Signup Flow Specifics
  sendOtpV4(payload) {
    return axiosInstance.post(POST_APIS.send_otp_v4, payload);
  }

  verifyAccountV4(payload) {
    return axiosInstance.post(POST_APIS.verify_account_v4, payload);
  }

  addProfileV4(payload) {
    return axiosInstance.post(POST_APIS.add_profile_v4, payload);
  }

  getUsersByTokenContact() {
    return axiosInstance.get(GET_APIS.get_users_by_token_contact);
  }

  selectProfileV4(payload) {
    return axiosInstance.post(POST_APIS.select_profile, payload);
  }
  // Analytics APIs
  getAnalyticsConfidence() {
    return axiosInstance.get(GET_APIS.analytics_confidence);
  }

  getAnalyticsProgressingAbility() {
    return axiosInstance.get(GET_APIS.analytics_progressing_ability);
  }

  getAnalyticsConsistency() {
    return axiosInstance.get(GET_APIS.analytics_consistency);
  }

  getAnalyticsExamReadiness() {
    return axiosInstance.get(GET_APIS.analytics_exam_readiness);
  }

  getAnalyticsPendingTasks() {
    return axiosInstance.get(GET_APIS.analytics_pending_tasks);
  }

  getAnalyticsSubjectAverageScore() {
    return axiosInstance.get(GET_APIS.analytics_subject_average_score);
  }

  getStudentSubjects() {
    return axiosInstance.get(GET_APIS.analytics_student_subject);
  }

  getAnalyticsStrengthWeakness() {
    return axiosInstance.get(GET_APIS.analytics_strength_weakness);
  }

  getStudentPerformance() {
    return axiosInstance.get(GET_APIS.student_performance_vw);
  }

  getStudentSubjectDashboard() {
    return axiosInstance.get(GET_APIS.student_subject_dashboard_vw);
  }

  getStudentMockDashboard() {
    return axiosInstance.get(GET_APIS.student_mock_dashboard_vw);
  }

  getStudentChapterRemediation() {
    return axiosInstance.get(GET_APIS.student_chapter_remediation_vw);
  }

  // Teacher APIs
  getTeacherStudentStatusDashboard() {
    return axiosInstance.get(GET_APIS.teacher_student_status_dashboard);
  }

  getStudentsListByAcademics(params = {}) {
    return axiosInstance.get(GET_APIS.get_students_list, { params });
  }

  getTeacherStudentTestNotification() {
    return axiosInstance.get(GET_APIS.student_notification_assessment);
  }

  getTeacherBucketPerformance() {
    return axiosInstance.get(GET_APIS.teacher_bucket_performance);
  }

  getTeacherSubjects() {
    return axiosInstance.get(GET_APIS.teacher_subjects);
  }

  getTeacherSubjectPerformance(subject_id) {
    return axiosInstance.get(GET_APIS.teacher_subject_performance, {
      params: { subject_id },
    });
  }

  getTeacherChapterPerformance(subject_id) {
    return axiosInstance.get(GET_APIS.teacher_chapter_performance, {
      params: { subject_id },
    });
  }

  getTeacherClassExamPerformance() {
    return axiosInstance.get(GET_APIS.teacher_class_exam_performance);
  }

  getTeacherCurriculumCoverage() {
    return axiosInstance.get(GET_APIS.teacher_curriculum_coverage);
  }

  getTeacherPendingTopics(subject_id) {
    return axiosInstance.get(GET_APIS.teacher_pending_topics, {
      params: { subject_id },
    });
  }

  getTeacherUpcomingChapters(subject_id) {
    return axiosInstance.get(GET_APIS.teacher_upcoming_chapters, {
      params: { subject_id },
    });
  }

  getParentChildren() {
    return axiosInstance.get(GET_APIS.parent_children);
  }

  getParentConfidence(student_id) {
    return axiosInstance.get(GET_APIS.parent_confidence, {
      params: { student_id },
    });
  }

  getParentConsistency(student_id) {
    return axiosInstance.get(GET_APIS.parent_consistency, {
      params: { student_id },
    });
  }

  getParentExamReadiness(student_id) {
    return axiosInstance.get(GET_APIS.parent_exam_readiness, {
      params: { student_id },
    });
  }

  getParentAverageScore(student_id) {
    return axiosInstance.get(GET_APIS.parent_average_score, {
      params: { student_id },
    });
  }

  getTeacherTopBottomStudents(subject_id) {
    return axiosInstance.get(GET_APIS.teacher_top_bottom_students, {
      params: { subject_id },
    });
  }

  getTeacherProfile() {
    return axiosInstance.get(GET_APIS.teacher_profile);
  }

  getTeacherDashboard() {
    return axiosInstance.get(GET_APIS.teacher_dashboard_vw);
  }

  getStudentProfile() {
    return axiosInstance.get(GET_APIS.student_profile);
  }
  getParentStrengthWeakness(student_id) {
    return axiosInstance.get(GET_APIS.parent_strength_weakness, {
      params: { student_id },
    });
  }

  getTeacherLearningPlanner() {
    return axiosInstance.get(GET_APIS.get_teacher_learning_planner);
  }

  getTeacherPlannerData() {
    return axiosInstance.get(GET_APIS.teacher_planner_data);
  }

  getParentProfile() {
    return axiosInstance.get(GET_APIS.parent_profile);
  }

  getStudentSubjectsTabInfo() {
    return axiosInstance.get(GET_APIS.get_student_subjects_tab_info);
  }



  // =======================
  // BLOGS APIs
  // =======================

  blogAdminLogin(data) {
    return publicAxiosInstance.post(POST_APIS.blog_admin_login, data);
  }

  getBlogCategories() {
    return publicAxiosInstance.get(GET_APIS.blog_categories);
  }

  insertUpdateBlogCategory(data) {
    return publicAxiosInstance.post(
      POST_APIS.blog_category_insert_update,
      data,
    );
  }

  deleteBlogCategory(data) {
    return publicAxiosInstance.post(POST_APIS.blog_category_delete, data);
  }

  getBlogsList() {
    return publicAxiosInstance.get(GET_APIS.blogs_list);
  }

  insertUpdateBlog(data) {
    return publicAxiosInstance.post(POST_APIS.blog_insert_update, data);
  }

  deleteBlog(data) {
    return publicAxiosInstance.post(POST_APIS.blog_delete, data);
  }

  getBlogSeoSettings() {
    return publicAxiosInstance.get(GET_APIS.blog_seo_settings);
  }

  insertUpdateBlogSeo(data) {
    return publicAxiosInstance.post(POST_APIS.blog_seo_insert_update, data);
  }

  deleteBlogSeo(data) {
    return publicAxiosInstance.post(POST_APIS.blog_seo_delete, data);
  }

  getBlogAdminDashboard() {
    return publicAxiosInstance.get(GET_APIS.blog_admin_dashboard);
  }
  getBlogCategoryDropdown() {
    return publicAxiosInstance.get(GET_APIS.blog_category_dropdown);
  }
  getPublicBlogs() {
    return publicAxiosInstance.get(GET_APIS.public_blogs);
  }
  getInstituteList() {
    return axiosInstance.get(GET_APIS.get_institute_list);
  }

  allUserByPagination(payload) {
    return axiosInstance.post(POST_APIS.all_user_by_pagination, payload);
  }

  // =======================
  // USER PROFILE APIs
  // =======================

  // Get Profile Info
  getProfileInfo() {
    return axiosInstance.get(GET_APIS.profile_info);
  }

  // Update Profile
  updateUserProfile(payload) {
    return axiosInstance.post(POST_APIS.update_profile, payload);
  }

  // Get User Academic Info
  getUserAcademicInfo() {
    return axiosInstance.get(GET_APIS.user_academic_info);
  }

  searchUserForMapping(name) {
    return axiosInstance.get(GET_APIS.search_user_for_mapping, {
      params: { name },
    });
  }

  addParentStudentMapping(payload) {
    return axiosInstance.post(POST_APIS.add_mapping, payload);
  }

  getActiveUserConnections() {
    return axiosInstance.get(GET_APIS.active_user_connections);
  }
  // =======================
  // Parent Student notification APIs
  // =======================

  // Get pending mapping requests (Now using all summary)
  getPendingMappingRequests() {
    return axiosInstance.get(GET_APIS.get_invitation_all_summary);
  }

  // Accept / Delete mapping request
  manageParentStudentMapping(payload) {
    return axiosInstance.post(POST_APIS.manage_parent_student_mapping, payload);
  }

  // Get active parent/student connections
  getActiveUserStudentParentList() {
    return axiosInstance.get(GET_APIS.get_active_user_student_parent_list);
  }

  getBlogAuthorDropdown() {
    return publicAxiosInstance.get(GET_APIS.blog_author_dropdown);
  }
  // =======================
  // Institute Admin - Faculty Management APIs
  // =======================

  // Get list of currently assigned teachers (with class_ids, assigned_on, etc.)
  getAssignedTeacherList() {
    return axiosInstance.get(GET_APIS.get_assigned_teacher_list);
  }

  // Get list of available (unassigned) teachers
  getAvailableTeachers() {
    return axiosInstance.get(GET_APIS.get_available_teachers);
  }

  // Assign teacher to class(es)
  assignTeacher(payload) {
    // payload: { teacher_user_id: number, class_ids: number[] }
    return axiosInstance.post(POST_APIS.assign_teacher, payload);
  }

  // Remove teacher from institute
  removeTeacher(payload) {
    // payload: { teacher_user_id: number }
    return axiosInstance.post(POST_APIS.remove_teacher, payload);
  }

  // Get institute admin summary (class + subject list for assign dropdown)
  getInstituteAdminSummary() {
    return axiosInstance.get(GET_APIS.get_institute_admin_summary);
  }
  upsertTeacherPlanner(payload) {
    return axiosInstance.post(POST_APIS.upsert_teacher_planner, payload);
  }
  getTeacherPlanner() {
    return axiosInstance.get(GET_APIS.get_teacher_planner);
  }
  uploadStudyMaterial(payload) {
    return axiosInstance.post(POST_APIS.upload_study_material, payload);
  }
  generateTestFromPlanner(payload) {
    return axiosInstance.post(POST_APIS.generate_test_from_planner, payload);
  }
  getStudyMaterial(params = {}) {
    return axiosInstance.get(GET_APIS.get_study_material, { params });
  }
  getTeacherStudyMaterial(params = {}) {
    return axiosInstance.get(GET_APIS.get_teacher_study_material_v4, { params });
  }

  createAdaptiveSet(payload) {
    return axiosInstance.post(POST_APIS.create_adaptive_set, payload);
  }

  createSubjectWiseAdaptiveSet(payload) {
    return axiosInstance.post(POST_APIS.create_subject_wise_adaptive_set, payload);
  }

  // Adaptive Assessment APIs
  adaptiveStartAssessment(payload) {
    return axiosInstance.post(POST_APIS.adaptive_start, payload);
  }

  getNextAdaptiveQuestion(attemptId) {
    return axiosInstance.get(GET_APIS.adaptive_next_question, {
      params: { attempt_id: attemptId },
    });
  }

  saveAdaptiveAnswer(payload) {
    return axiosInstance.post(POST_APIS.save_adaptive_answer, payload);
  }

  finishAdaptiveAssessment(payload) {
    return axiosInstance.post(POST_APIS.finish_adaptive, payload);
  }

  skipAssessmentQuestion(payload) {
    return axiosInstance.post(POST_APIS.skip_assessment_question, payload);
  }

  bulkUploadUsers(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(POST_APIS.bulk_upload_users, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new ApiServices();
