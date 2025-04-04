from rest_framework import serializers
from .models import CandidatesApplied, Job, Course, CourseEnrollment, CourseContent, ContentProgress


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class CandidatesAppliedSerializer(serializers.ModelSerializer):
    job = JobSerializer()
    
    class Meta:
        model = CandidatesApplied
        fields = ('user', 'resume', 'appliedAt', 'job')

class CourseContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseContent
        fields = ['id', 'title', 'video_url', 'duration_minutes', 'order']

class CourseSerializer(serializers.ModelSerializer):
    contents = CourseContentSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'level', 
                 'industry', 'skills', 'duration_weeks', 'thumbnail', 
                 'user', 'createdAt', 'contents']

class CourseWithContentSerializer(serializers.ModelSerializer):
    contents = CourseContentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'instructor', 'level', 
                 'industry', 'skills', 'duration_weeks', 'user', 
                 'createdAt', 'contents')

class ContentProgressSerializer(serializers.ModelSerializer):
    content = CourseContentSerializer()
    
    class Meta:
        model = ContentProgress
        fields = ['content', 'completed', 'watched_duration', 'last_watched', 'progress']

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer()
    content_progress = serializers.SerializerMethodField()

    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'course', 'progress', 'completed', 
            'enrolledAt', 'content_progress'
        ]

    def get_content_progress(self, obj):
        content_progress = ContentProgress.objects.filter(enrollment=obj)
        return {
            cp.content.id: {
                'progress': cp.progress,
                'completed': cp.completed,
                'watched_duration': cp.watched_duration
            } for cp in content_progress
        }