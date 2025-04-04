from django.contrib import admin
from .models import Job, CandidatesApplied, Course, CourseContent, CourseEnrollment, ContentProgress

# Register your models here.
admin.site.register(Job)
admin.site.register(Course)
admin.site.register(CourseEnrollment)
