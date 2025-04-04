from django.urls import path
from . import views

urlpatterns = [
    # Job URLs
    path('jobs/', views.getAllJobs, name='jobs'),
    path('jobs/new/', views.newJob, name='new_job'),
    path('jobs/<str:pk>/', views.getJob, name='job'),
    path('jobs/<str:pk>/update/', views.updateJob, name='update_job'),
    path('jobs/<str:pk>/delete/', views.deleteJob, name='delete_job'),
    path('stats/<str:topic>/', views.getTopicStats, name='get_topic_stats'),
    path('jobs/<str:pk>/apply/', views.applyToJob, name='apply_to_job'),
    path('me/jobs/applied/', views.getCurrentUserAppliedJobs, name='current_user_applied_jobs'),
    path('me/jobs/', views.getCurrentUserJobs, name='current_user_jobs'),
    path('jobs/<str:pk>/check/', views.isApplied, name='is_applied_to_job'),
    path('job/<str:pk>/candidates/', views.getCandidatesApplied, name='get_candidates_applied'),

    # Course URLs
    path('courses/', views.getAllCourses, name='get_courses'),
    path('courses/new/', views.newCourse, name='new_course'),
    path('courses/<int:pk>/', views.getCourse, name='get_course'),
    path('courses/<int:pk>/check-enrollment/', views.checkEnrollment, name='check_enrollment'),
    path('courses/<int:pk>/enroll/', views.enrollCourse, name='enroll_course'),
    path('courses/<int:pk>/progress/', views.getCourseProgress, name='get_course_progress'),
    path('courses/<int:pk>/delete/', views.deleteCourse, name='delete_course'),
    path('me/courses/', views.getCurrentUserCourses, name='current_user_courses'),
    path('courses/<int:course_id>/content/<int:content_id>/progress/', 
         views.content_progress, 
         name='content_progress'),
]