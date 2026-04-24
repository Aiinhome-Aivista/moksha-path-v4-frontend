import { Upload } from "lucide-react";
import { decode } from "punycode";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const GET_APIS = {
  username_suggestions: `${BASE_URL}user/username_suggestions`,
  select_role: `${BASE_URL}auth/roles`,
  board: `${BASE_URL}academic/masters`,
  get_user_academic_details: `${BASE_URL}academic/get_user_academic_details`,
  get_academic_hierarchy: `${BASE_URL}auth/get_academic_hierarchy`,
  get_student_learning_planner: `${BASE_URL}learning/student/learning_planner`,
  student_planner_dashboard: `${BASE_URL}learning/student_planner_dashboard`,
  get_multi_chapter_tests: `${BASE_URL}learning/get_multi_chapter_tests`,
  student_performance_vw: `${BASE_URL}learning/student_performance_vw`,
  student_subject_dashboard_vw: `${BASE_URL}learning/student_subject_dashboard_vw`,
  roles: `${BASE_URL}auth/user_profiles`,

  //Assessments API//
  student_assessments: `${BASE_URL}learning/student/assessments`,
  assessment_details: `${BASE_URL}learning/assessment/details`,
  //teacher assesment for student
  get_students_list: `${BASE_URL}learning/get_students_list_by_academics`,

  //get profile image
  get_profile_picture: `${BASE_URL}user/profile_image`,

  // Subscription Invitations
  subscription_invite_list: `${BASE_URL}subscription/invite_list`,
  student_mock_dashboard_vw: `${BASE_URL}learning/student_mock_dashboard_vw`,
  student_chapter_remediation_vw: `${BASE_URL}learning/student_chapter_remediation_vw`,
  subscription_invite_history: `${BASE_URL}subscription/invite_history`,
  subscription_list: `${BASE_URL}subscription/subscription_list`,
  //user subscription details
  user_subscriptions: `${BASE_URL}subscription/user_subscriptions`,

  // User list
  username_list: `${BASE_URL}user/username_list`,

  //user academic details
  get_user_academic_details: `${BASE_URL}academic/get_user_academic_details`,

  // Analytics
  analytics_confidence: `${BASE_URL}learning/analytics/confidence`,
  analytics_progressing_ability: `${BASE_URL}learning/analytics/progressing-ability`,
  analytics_consistency: `${BASE_URL}learning/analytics/consistency`,
  analytics_exam_readiness: `${BASE_URL}learning/analytics/exam-readiness`,
  analytics_pending_tasks: `${BASE_URL}learning/analytics/pending-tasks`,
  analytics_subject_average_score: `${BASE_URL}learning/analytics/subject-average-score`,
  analytics_student_subject: `${BASE_URL}learning/analytics/student-subjects`,
  analytics_strength_weakness: `${BASE_URL}learning/analytics/strength-weakness`,
  get_academic_master_data: `${BASE_URL}academic/get_user_academic_details_nodependices`,

  // Teacher Dashboard APIs
  teacher_bucket_performance: `${BASE_URL}parent_teacher/dashboard/bucket-performance`,
  teacher_subjects: `${BASE_URL}parent_teacher/dashboard/subjects`,
  teacher_subject_performance: `${BASE_URL}parent_teacher/dashboard/subject-performance`,
  teacher_chapter_performance: `${BASE_URL}parent_teacher/dashboard/chapter-performance`,
  teacher_class_exam_performance: `${BASE_URL}parent_teacher/dashboard/class-exam-performance`,
  teacher_student_status_dashboard: `${BASE_URL}auth/get_teacher_student_status_dashboard`,
  teacher_curriculum_coverage: `${BASE_URL}parent_teacher/dashboard/curriculum-coverage`,
  teacher_pending_topics: `${BASE_URL}parent_teacher/dashboard/pending-topics`,
  teacher_upcoming_chapters: `${BASE_URL}parent_teacher/dashboard/upcoming-chapters`,
  parent_children: `${BASE_URL}parent_teacher/dashboard/parent/children`,
  get_users_by_token_contact: `${BASE_URL}auth/get_users_by_token_contact`,
  student_notification_assessment: `${BASE_URL}auth/student/notification_assessments`,
  parent_confidence: `${BASE_URL}parent_teacher/dashboard/parent/confidence`,


  // parent dashboard APIs
  parent_progressing_ability: `${BASE_URL}parent_teacher/dashboard/parent/progressing-ability`,
  parent_consistency: `${BASE_URL}parent_teacher/dashboard/parent/consistency`,
  parent_exam_readiness: `${BASE_URL}parent_teacher/dashboard/parent/exam-readiness`,
  parent_average_score: `${BASE_URL}parent_teacher/dashboard/parent/subject-average-score`,
  parent_strength_weakness: `${BASE_URL}parent_teacher/dashboard/parent/strength-weekness`,

  teacher_top_bottom_students: `${BASE_URL}parent_teacher/dashboard/top-bottom-students`,

  teacher_profile: `${BASE_URL}parent_teacher/dashboard/teacher-profile`,
  teacher_dashboard_vw: `${BASE_URL}learning/teacher_dashboard_vw`,
  student_profile: `${BASE_URL}parent_teacher/dashboard/teacher-profile`,

  // Learning Planner for teacher and parent
  get_teacher_learning_planner: `${BASE_URL}learning/teacher/learning_planner`,
  teacher_planner_data: `${BASE_URL}parent_teacher/teacher_planner_data`,
  parent_profile: `${BASE_URL}parent_teacher/dashboard/parent/parent-profile`,

  // Blogs APIs
  blog_categories: `${BASE_URL}blogs/categories`,
  blogs_list: `${BASE_URL}blogs/blogs`,
  blog_seo_settings: `${BASE_URL}blogs/seo-settings`,
  blog_admin_dashboard: `${BASE_URL}blogs/admin-dashboard`,
  blog_category_dropdown: `${BASE_URL}blogs/category-dropdown`,
  public_blogs: `${BASE_URL}blogs/public-blogs`,
  blog_author_dropdown: `${BASE_URL}blogs/authors-dropdown`,
  //invite modal instititute list
  get_institute_list: `${BASE_URL}user/get_institute_hierarchy`,

  //profile apis
  // User Profile APIs
  profile_info: `${BASE_URL}user/profile_info`,
  user_academic_info: `${BASE_URL}user/user_academic_info`,
  search_user_for_mapping: `${BASE_URL}user/search_user_for_mapping`,
  active_user_connections: `${BASE_URL}user/get_active_user_student_parent_list`,

  //profile notification
  get_pending_mapping_requests: `${BASE_URL}user/get_pending_mapping_requests`,
  get_active_user_student_parent_list: `${BASE_URL}user/get_active_user_student_parent_list`,
  get_invitation_all_summary: `${BASE_URL}user/get_invitation_all_summary`,

  // Institute Admin - Faculty Management
  get_assigned_teacher_list: `${BASE_URL}institute_admin/assigned_teacher_list`,
  get_available_teachers: `${BASE_URL}institute_admin/available_teachers`,
  get_institute_admin_summary: `${BASE_URL}parent_teacher/institute_admin_summary`,

  // Study Material
  get_study_material: `${BASE_URL}parent_teacher/get_study_material_v3`,
  get_student_subjects_tab_info: `${BASE_URL}learning/get_student_subjects_tab_info`,

  get_teacher_study_material_v4: `${BASE_URL}parent_teacher/get_teacher_study_material`,
  adaptive_next_question: `${BASE_URL}learning/assessment/get_next_question`,
};

export const POST_APIS = {
  username_check: `${BASE_URL}user/username_check`,
  send_otp_Email: `${BASE_URL}auth/send_otp`,
  verify_otp_Email: `${BASE_URL}auth/verify_otp`,
  send_otp_Phone: `${BASE_URL}auth/send_otp`,
  verify_otp_Phone: `${BASE_URL}auth/verify_otp`,
  register_login: `${BASE_URL}auth/register`,
  login: `${BASE_URL}auth/login/login_session`,
  find_details: `${BASE_URL}auth/find_details`,
  send_recovery_otp: `${BASE_URL}auth/recovery/send_otp`,
  verify_recovery_otp: `${BASE_URL}auth/recovery/verify_otp`,
  get_subjects_by_boards: `${BASE_URL}academic/get_subjects_by_boards`,
  subscription: {
    plans: `${BASE_URL}subscription/plans`,
    validate_plan_amount: `${BASE_URL}subscription/validate_plan_amount`,
    complete_subscription: `${BASE_URL}subscription/complete_subscription`,
    save_subscription_draft: `${BASE_URL}subscription/save_subscription_draft`,
    invite_send: `${BASE_URL}subscription/invite_send`,
    invite_respond: `${BASE_URL}subscription/invite_respond`,
    undo_invite: `${BASE_URL}subscription/undo_invite`,
  },
  save_board_class_user_mapping: `${BASE_URL}academic/save_user_academic_details`,
  decode_jwt: `${BASE_URL}auth/decode_token`,
  learning_planner: `${BASE_URL}learning/generate_auto_plan`,
  update_topic_status: `${BASE_URL}learning/student/update_topic_status`,
  update_priority: `${BASE_URL}learning/student/update_priority`,
  signout: `${BASE_URL}auth/login/logout`,
  subscription_validate: `${BASE_URL}subscription/validate`,
  switch_role: `${BASE_URL}auth/switch_profile`,
  page_access: `${BASE_URL}user/menu/page_acess`,

  //Assessment APIs//

  // Question Bank
  store_assessment_questions: `${BASE_URL}learning/store_questions`,

  // Assign Assessment
  assign_self_assessment: `${BASE_URL}learning/assign_assessment`,
  // assign_assessment_to_students: `${BASE_URL}learning/teacher/assign_assessment`,
  assign_assessment_to_class: `${BASE_URL}learning/teacher/assign_class_assessment`,

  // Resources API
  get_chapter_topic_resources: `${BASE_URL}learning/get_or_generate_chapter_topic_resources`,

  // Assessment Flow
  start_assessment: `${BASE_URL}learning/assessment/start`,
  save_assessment_answer: `${BASE_URL}learning/assessment/save_answer`,
  finish_assessment: `${BASE_URL}learning/assessment/finish`,
  // Rwtake Assessment
  retake_assessment: `${BASE_URL}learning/assessment/retake`,

  //profile picture upload
  upload_profile_picture: `${BASE_URL}user/profile_image/upload`,

  // Student profile update (uncomment when backend is ready)
  // update_student_profile: `${BASE_URL}user/student/profile/update`,

  //add new institute
  add_institute: `${BASE_URL}academic/institute/add`,

  send_otp_v4: `${BASE_URL}auth/send_ui_otp_v4`,
  verify_account_v4: `${BASE_URL}auth/verify_account`,
  add_profile_v4: `${BASE_URL}auth/add_profile`,
  select_profile: `${BASE_URL}auth/select_profile`,

  // Blogs APIs
  blog_admin_login: `${BASE_URL}blogs/admin-login`,
  blog_category_insert_update: `${BASE_URL}blogs/category/insert-update`,
  blog_category_delete: `${BASE_URL}blogs/category/delete`,
  blog_insert_update: `${BASE_URL}blogs/blog/insert-update`,
  blog_delete: `${BASE_URL}blogs/blog/delete`,
  blog_seo_insert_update: `${BASE_URL}blogs/seo/insert-update`,
  blog_seo_delete: `${BASE_URL}blogs/seo/delete`,
  all_user_by_pagination: `${BASE_URL}user/get_all_usernames_with_paginations`,

  // Update User Profile
  update_profile: `${BASE_URL}user/update_profile`,
  add_mapping: `${BASE_URL}user/add_parent_student_mapping`,
  //profile notification add/delete
  manage_parent_student_mapping: `${BASE_URL}user/manage_parent_student_mapping`,

  // Institute Admin - Faculty Management
  assign_teacher: `${BASE_URL}institute_admin/assign_teacher`,
  remove_teacher: `${BASE_URL}institute_admin/remove_teacher`,

  upsert_teacher_planner: `${BASE_URL}parent_teacher/teacher_chapter_planner_upsert`,
  upload_study_material: `${BASE_URL}parent_teacher/upload_study_material`,
  generate_test_from_planner: `${BASE_URL}learning/generate_test_from_planner`,
  create_adaptive_set: `${BASE_URL}learning/assessment/create_adaptive_set`,
  create_subject_wise_adaptive_set: `${BASE_URL}learning/assessment/create_subject_wise_adaptive_set`,
  adaptive_start: `${BASE_URL}learning/assessment/addaptive_start`,
  save_adaptive_answer: `${BASE_URL}learning/assessment/save_adaptive_answer`,
  finish_adaptive: `${BASE_URL}learning/assessment/finish_adaptive`,
  skip_assessment_question: `${BASE_URL}learning/assessment/skip_assessment_question`,
  bulk_upload_users: `${BASE_URL}institute_admin/bulk_upload_users`,
};
